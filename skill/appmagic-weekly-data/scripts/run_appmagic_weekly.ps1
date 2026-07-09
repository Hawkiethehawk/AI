param(
  [string]$ProjectDir = ".",
  [string]$WeekAnchor = "",
  [string[]]$Categories = @(),
  [switch]$Fresh,
  [switch]$ListOnly,
  [switch]$ExportOnly,
  [switch]$SkipExcel
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillRoot = Split-Path -Parent $ScriptDir
$ProjectDir = (Resolve-Path $ProjectDir).Path

# 统一计算周锚点并传给 js/py，保证三者归档目录一致：output/folder/AppMagic-<YYYYMMDD>/
if (-not $WeekAnchor) {
  $d = (Get-Date).ToUniversalTime().Date
  $WeekAnchor = $d.AddDays(-((([int]$d.DayOfWeek) + 6) % 7)).ToString('yyyy-MM-dd')
}
$env:WEEK_ANCHOR = $WeekAnchor
$Mon = $WeekAnchor.Replace('-', '')
$OutBase = Join-Path $ProjectDir ("output\folder\AppMagic-{0}" -f $Mon)

function U([int[]]$codes) {
  -join ($codes | ForEach-Object { [char]$_ })
}

if (-not $Categories -or $Categories.Count -eq 0) {
  $Categories = @(
    (U 0x8D85,0x4F11,0x95F2),
    (U 0x4F11,0x95F2),
    "Launcher",
    (U 0x6740,0x6BD2,0x8F6F,0x4EF6,0x3001,0x6E05,0x7406),
    (U 0x6587,0x4EF6,0x6062,0x590D),
    ("PDF" + (U 0x9605,0x8BFB,0x5668))
  )
}

# 从 appmagic-config.json 读取默认值（env vars 优先，配置文件作为 fallback）
$ConfigFile = Join-Path $ProjectDir "appmagic-config.json"
if (Test-Path $ConfigFile) {
  try {
    $cfg = Get-Content $ConfigFile -Raw -Encoding UTF8 | ConvertFrom-Json
    if (-not $env:TOP_DEPTH -and $cfg.topDepth)           { $env:TOP_DEPTH = "$($cfg.topDepth)" }
    if (-not $env:APPMAGIC_ACCOUNTS -and $cfg.accounts)    { $env:APPMAGIC_ACCOUNTS = $cfg.accounts }
    if (-not $env:APPMAGIC_MAX_WORKERS -and $cfg.maxWorkers) { $env:APPMAGIC_MAX_WORKERS = "$($cfg.maxWorkers)" }
    if (-not $env:DC_GAP_MS -and $cfg.dcGapMs)             { $env:DC_GAP_MS = "$($cfg.dcGapMs)" }
    if (-not $env:DC_COOLDOWN_MS -and $cfg.dcCooldownMs)   { $env:DC_COOLDOWN_MS = "$($cfg.dcCooldownMs)" }
    if (-not $env:LEADERBOARD_WEEK_CONCURRENCY -and $cfg.leaderboardWeekConcurrency) { $env:LEADERBOARD_WEEK_CONCURRENCY = "$($cfg.leaderboardWeekConcurrency)" }
    if (-not $env:AUTH_CHECK_CONCURRENCY -and $cfg.authCheckConcurrency) { $env:AUTH_CHECK_CONCURRENCY = "$($cfg.authCheckConcurrency)" }
    if (-not $env:LIST_ONLY -and $cfg.PSObject.Properties['listOnly'] -and $cfg.listOnly) { $env:LIST_ONLY = "1" }
  } catch {
    Write-Host "  ⚠️  配置文件读取失败: $ConfigFile -- $($_.Exception.Message)"
  }
}

$env:APPMAGIC_PROJECT_DIR = $ProjectDir
if ($Fresh) { $env:FORCE_REFRESH = "1" }
if ($ListOnly) { $env:LIST_ONLY = "1" }

function Ensure-DashboardServer {
  param(
    [string]$ScriptDir,
    [string]$ProjectDir
  )

  $portInfo = Get-NetTCPConnection -LocalPort 8787 -ErrorAction SilentlyContinue |
    Select-Object -First 1
  $restart = $false

  if ($portInfo) {
    try {
      $settings = Invoke-RestMethod -Uri "http://localhost:8787/api/settings" -TimeoutSec 2
      if ($settings.projectDir -ne $ProjectDir) {
        $restart = $true
        Write-Host "  ⚠️  8787 已被其他项目看板占用：$($settings.projectDir)"
      }
    } catch {
      $restart = $true
      Write-Host "  ⚠️  8787 上的现有服务不可识别，准备重启为当前项目看板"
    }
  }

  if ($restart -and $portInfo) {
    try {
      Stop-Process -Id $portInfo.OwningProcess -Force -ErrorAction Stop
      Start-Sleep -Milliseconds 600
      Write-Host "  ↻ 已停止旧看板进程 pid $($portInfo.OwningProcess)"
    } catch {
      throw "无法停止旧看板进程 pid $($portInfo.OwningProcess)"
    }
    $portInfo = $null
  }

  if (-not $portInfo) {
    $savedProjectDir = $env:APPMAGIC_PROJECT_DIR
    $savedNoOpen = $env:APPMAGIC_NO_OPEN
    try {
      $env:APPMAGIC_PROJECT_DIR = $ProjectDir
      $env:APPMAGIC_NO_OPEN = "1"
      $proc = Start-Process -FilePath "node" -ArgumentList ('"' + (Join-Path $ScriptDir "progress-server.js") + '"') `
        -WindowStyle Hidden -PassThru
      Start-Sleep -Milliseconds 800
      Write-Host "  ✅ 进度看板已启动 http://localhost:8787 (pid $($proc.Id))"
    } finally {
      if ($null -ne $savedProjectDir) { $env:APPMAGIC_PROJECT_DIR = $savedProjectDir } else { Remove-Item Env:APPMAGIC_PROJECT_DIR -ErrorAction SilentlyContinue }
      if ($null -ne $savedNoOpen) { $env:APPMAGIC_NO_OPEN = $savedNoOpen } else { Remove-Item Env:APPMAGIC_NO_OPEN -ErrorAction SilentlyContinue }
    }
  }
}

# 依赖检查：以 node 实际解析为准（npm 可能把包装到上层带 package.json 的目录）
Push-Location $ScriptDir
node -e "require.resolve('@playwright/test')" 2>$null
$hasPlaywright = ($LASTEXITCODE -eq 0)
Pop-Location
if (-not $hasPlaywright) {
  Write-Host "  ⚠️  缺少依赖，正在安装 @playwright/test ..."
  Push-Location $SkillRoot; npm install @playwright/test; npx playwright install chromium; Pop-Location
}

Write-Host "  📅 WeekAnchor: $WeekAnchor  ProjectDir: $ProjectDir"

try {
  if (-not $ExportOnly) {
    # 启动当前项目的进度看板；若端口已被其他项目占用，则替换为当前项目服务。
    Ensure-DashboardServer -ScriptDir $ScriptDir -ProjectDir $ProjectDir

    # 采集前一次性自检全部账号（token 缓存命中免浏览器启动）；失败则中止，回看板设置重新捕捉。
    $env:CHECK_AUTH = "1"
    $checkOut = node (Join-Path $ScriptDir "appmagic-weekly.js") | Out-String
    Remove-Item Env:CHECK_AUTH -ErrorAction SilentlyContinue
    Write-Host $checkOut
    $failedAccounts = @([regex]::Matches($checkOut, 'FAIL (\S+)') | ForEach-Object { $_.Groups[1].Value })
    if ($failedAccounts.Count -gt 0) {
      $failedList = ($failedAccounts -join ', ')
      throw "AppMagic login state invalid for: $failedList. Open dashboard settings and recapture those accounts before running collection."
    }

    # 路径A：单次调用，node 一个进程跑全部品类（榜单用 A；国别 3 账号并行领品类）
    node (Join-Path $ScriptDir "appmagic-weekly.js")
    if ($LASTEXITCODE -ne 0) { throw "AppMagic scrape failed" }
  }

  if (-not $SkipExcel) {
    foreach ($cat in $Categories) {
      $json = Join-Path $OutBase ("appmagic-{0}-weekly.json" -f $cat)
      if (Test-Path $json) {
        python (Join-Path $ScriptDir "appmagic_xlsx.py") $cat
        if ($LASTEXITCODE -ne 0) { throw "Excel export failed for $cat" }
      } else {
        Write-Host "  [skip] no data: $cat"
      }
    }
    python (Join-Path $ScriptDir "appmagic_xlsx_merged.py")
    if ($LASTEXITCODE -ne 0) { throw "Merged Excel export failed" }
  }
}
finally {
  Remove-Item Env:CHECK_AUTH -ErrorAction SilentlyContinue
  Remove-Item Env:APPMAGIC_USERDATA_DIR -ErrorAction SilentlyContinue
  Remove-Item Env:FORCE_REFRESH -ErrorAction SilentlyContinue
  Remove-Item Env:LIST_ONLY -ErrorAction SilentlyContinue
  Remove-Item Env:WEEK_ANCHOR -ErrorAction SilentlyContinue
  Remove-Item Env:APPMAGIC_PROJECT_DIR -ErrorAction SilentlyContinue
}
