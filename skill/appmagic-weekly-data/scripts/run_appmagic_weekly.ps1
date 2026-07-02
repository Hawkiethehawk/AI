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
$ProjectDir = (Resolve-Path $ProjectDir).Path

# 统一计算周锚点并传给 js/py，保证三者归档目录一致：output/AppMagic-<YYYYMMDD>/
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
if ($WeekAnchor) { $env:WEEK_ANCHOR = $WeekAnchor }
if ($Fresh) { $env:FORCE_REFRESH = "1" }
if ($ListOnly) { $env:LIST_ONLY = "1" }

try {
  if (-not $ExportOnly) {
    # ensure ALL configured accounts are logged in (data-countries quota is per-account; multi-account extends it)
    $accounts = @('.appmagic-userdata', '.appmagic-userdata-b', '.appmagic-userdata-c')
    if ($env:APPMAGIC_ACCOUNTS) { $accounts = $env:APPMAGIC_ACCOUNTS -split ',' }
    foreach ($acc in $accounts) {
      $env:APPMAGIC_USERDATA_DIR = $acc
      $env:CHECK_AUTH = "1"; node (Join-Path $ScriptDir "appmagic-weekly.js"); $ok = ($LASTEXITCODE -eq 0); Remove-Item Env:CHECK_AUTH -ErrorAction SilentlyContinue
      if (-not $ok) {
        Write-Host "  [auth] account $acc invalid - opening login window, please complete login..."
        node (Join-Path $ScriptDir "appmagic-login.js")
        $env:CHECK_AUTH = "1"; node (Join-Path $ScriptDir "appmagic-weekly.js"); $ok = ($LASTEXITCODE -eq 0); Remove-Item Env:CHECK_AUTH -ErrorAction SilentlyContinue
        if (-not $ok) { Remove-Item Env:APPMAGIC_USERDATA_DIR -ErrorAction SilentlyContinue; throw "account $acc login not completed, aborted." }
      }
      Remove-Item Env:APPMAGIC_USERDATA_DIR -ErrorAction SilentlyContinue
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
  Remove-Item Env:CAT -ErrorAction SilentlyContinue
  Remove-Item Env:FORCE_REFRESH -ErrorAction SilentlyContinue
  Remove-Item Env:LIST_ONLY -ErrorAction SilentlyContinue
  Remove-Item Env:WEEK_ANCHOR -ErrorAction SilentlyContinue
  Remove-Item Env:APPMAGIC_PROJECT_DIR -ErrorAction SilentlyContinue
}
