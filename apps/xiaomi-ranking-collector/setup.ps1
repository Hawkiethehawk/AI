$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$tools = Join-Path $root '.tools'
$platform = Join-Path $tools 'platform-tools'
$zip = Join-Path $tools 'platform-tools.zip'

New-Item -ItemType Directory -Force -Path $tools | Out-Null
if (-not (Test-Path (Join-Path $platform 'adb.exe'))) {
    Invoke-WebRequest -Uri 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip' -OutFile $zip
    Expand-Archive -LiteralPath $zip -DestinationPath $tools -Force
    Remove-Item -LiteralPath $zip -Force
}

Write-Host "ADB: $(Join-Path $platform 'adb.exe')"
& (Join-Path $platform 'adb.exe') version
& (Join-Path $platform 'adb.exe') devices -l
