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

$env:APPMAGIC_PROJECT_DIR = $ProjectDir
if ($Fresh) { $env:FORCE_REFRESH = "1" }
if ($ListOnly) { $env:LIST_ONLY = "1" }

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
    # 启动进度看板服务（后台，已在跑则跳过；env var 由 Start-Process 自动继承）
    $srvRunning = Get-NetTCPConnection -LocalPort 8787 -ErrorAction SilentlyContinue
    if (-not $srvRunning) {
      $proc = Start-Process -FilePath "node" -ArgumentList ('"' + (Join-Path $ScriptDir "progress-server.js") + '"') `
        -WindowStyle Hidden -PassThru
      Write-Host "  ✅ 进度看板已启动 http://localhost:8787 (pid $($proc.Id))"
    }

    # 采集前一次性自检全部账号（token 缓存命中免浏览器启动）；失败账号弹窗补登后逐个复检
    $env:CHECK_AUTH = "1"
    $checkOut = node (Join-Path $ScriptDir "appmagic-weekly.js") | Out-String
    Remove-Item Env:CHECK_AUTH -ErrorAction SilentlyContinue
    Write-Host $checkOut
    $failedAccounts = [regex]::Matches($checkOut, 'FAIL (\S+)') | ForEach-Object { $_.Groups[1].Value }
    foreach ($acc in $failedAccounts) {
      Write-Host "  [auth] account $acc invalid - refreshing login..."
      $env:APPMAGIC_USERDATA_DIR = $acc
      Write-Host "  [auth] opening login window, please complete login..."
      node (Join-Path $ScriptDir "appmagic-login.js")
      if ($LASTEXITCODE -ne 0) { throw "account $acc login refresh failed." }
      $env:CHECK_AUTH = "1"; node (Join-Path $ScriptDir "appmagic-weekly.js"); $ok = ($LASTEXITCODE -eq 0)
      Remove-Item Env:CHECK_AUTH, Env:APPMAGIC_USERDATA_DIR -ErrorAction SilentlyContinue
      if (-not $ok) { throw "account $acc login not completed, aborted." }
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
