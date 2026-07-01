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
    # auth self-check: if not logged in, open login window (headed, manual) then continue; once only
    $env:CHECK_AUTH = "1"; node (Join-Path $ScriptDir "appmagic-weekly.js"); $authed = ($LASTEXITCODE -eq 0); Remove-Item Env:CHECK_AUTH -ErrorAction SilentlyContinue
    if (-not $authed) {
      Write-Host "  [auth] Not logged in. Opening login window, please complete login in the window..."
      node (Join-Path $ScriptDir "appmagic-login.js")
      $env:CHECK_AUTH = "1"; node (Join-Path $ScriptDir "appmagic-weekly.js"); $authed = ($LASTEXITCODE -eq 0); Remove-Item Env:CHECK_AUTH -ErrorAction SilentlyContinue
      if (-not $authed) { throw "Login not completed, aborted. Please log in manually and retry." }
    }
    foreach ($cat in $Categories) {
      $env:CAT = $cat
      node (Join-Path $ScriptDir "appmagic-weekly.js")
      if ($LASTEXITCODE -ne 0) { throw "AppMagic scrape failed for $cat" }
    }
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
