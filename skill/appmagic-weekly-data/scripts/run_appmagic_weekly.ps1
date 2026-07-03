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

function U([int[]]$codes) {
  -join ($codes | ForEach-Object { [char]$_ })
}

function Get-NodeCommand {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  throw "node.exe not found in PATH"
}

function Get-FreePort([int]$StartPort = 8787) {
  for ($port = $StartPort; $port -lt ($StartPort + 30); $port++) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $conn) { return $port }
  }
  throw "No free dashboard port found from $StartPort"
}

function Find-AppMagicDashboardPort([int]$StartPort = 8787) {
  for ($port = $StartPort; $port -lt ($StartPort + 30); $port++) {
    try {
      $r = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:$port/api/health" -TimeoutSec 2
      if ($r.StatusCode -eq 200 -and $r.Content -match '"ok"\s*:\s*true') {
        return $port
      }
    } catch {}
  }
  return $null
}

function Ensure-AppMagicDashboard([string]$ProjectDir, [string]$ScriptDir) {
  $serverScript = Join-Path $ScriptDir "progress-server.js"
  $existingPort = Find-AppMagicDashboardPort 8787
  if ($existingPort) {
    Write-Host "[dashboard] reusing http://localhost:$existingPort"
    return $existingPort
  }

  $port = Get-FreePort 8787
  $node = Get-NodeCommand
  $ps = @"
$env:APPMAGIC_PROJECT_DIR = '$($ProjectDir.Replace("'", "''"))'
$env:APPMAGIC_PORT = '$port'
$env:APPMAGIC_NO_OPEN = '1'
& '$($node.Replace("'", "''"))' '$($serverScript.Replace("'", "''"))'
"@
  $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($ps))
  $logDir = Join-Path $ProjectDir "output\logs"
  New-Item -ItemType Directory -Force -Path $logDir | Out-Null
  $stdout = Join-Path $logDir "appmagic-dashboard.out.log"
  $stderr = Join-Path $logDir "appmagic-dashboard.err.log"
  $cmdLine = 'start "" /min powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand "{0}" 1>>"{1}" 2>>"{2}"' -f $encoded, $stdout, $stderr
  & cmd.exe /d /c $cmdLine | Out-Null

  Start-Sleep -Milliseconds 900
  Write-Host "[dashboard] started http://localhost:$port"
  return $port
}

if (-not $WeekAnchor) {
  $d = (Get-Date).ToUniversalTime().Date
  $WeekAnchor = $d.AddDays(-((([int]$d.DayOfWeek) + 6) % 7)).ToString('yyyy-MM-dd')
}

$env:WEEK_ANCHOR = $WeekAnchor
$Mon = $WeekAnchor.Replace('-', '')
$OutBase = Join-Path $ProjectDir ("output\folder\AppMagic-{0}" -f $Mon)

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

$dashboardPort = Ensure-AppMagicDashboard -ProjectDir $ProjectDir -ScriptDir $ScriptDir
Write-Host "[dashboard] live view http://localhost:$dashboardPort"

try {
  if (-not $ExportOnly) {
    $accounts = @('.appmagic-userdata', '.appmagic-userdata-b', '.appmagic-userdata-c')
    if ($env:APPMAGIC_ACCOUNTS) { $accounts = $env:APPMAGIC_ACCOUNTS -split ',' }
    foreach ($acc in $accounts) {
      $env:APPMAGIC_USERDATA_DIR = $acc
      $env:CHECK_AUTH = "1"
      node (Join-Path $ScriptDir "appmagic-weekly.js")
      $ok = ($LASTEXITCODE -eq 0)
      Remove-Item Env:CHECK_AUTH -ErrorAction SilentlyContinue
      if (-not $ok) {
        Write-Host "  [auth] account $acc invalid - opening login window, please complete login..."
        node (Join-Path $ScriptDir "appmagic-login.js")
        $env:CHECK_AUTH = "1"
        node (Join-Path $ScriptDir "appmagic-weekly.js")
        $ok = ($LASTEXITCODE -eq 0)
        Remove-Item Env:CHECK_AUTH -ErrorAction SilentlyContinue
        if (-not $ok) {
          Remove-Item Env:APPMAGIC_USERDATA_DIR -ErrorAction SilentlyContinue
          throw "account $acc login not completed, aborted."
        }
      }
      Remove-Item Env:APPMAGIC_USERDATA_DIR -ErrorAction SilentlyContinue
    }

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
