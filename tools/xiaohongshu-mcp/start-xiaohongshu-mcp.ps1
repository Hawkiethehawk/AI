$ErrorActionPreference = 'Stop'

$toolDir = $PSScriptRoot
$serverExe = Join-Path $toolDir 'xiaohongshu-mcp-windows-amd64.exe'
$logFile = Join-Path $toolDir 'server.log'

if (-not (Test-Path -LiteralPath $serverExe)) {
    Write-Error "未找到 MCP 服务程序: $serverExe"
}

$running = Get-Process -Name 'xiaohongshu-mcp-windows-amd64' -ErrorAction SilentlyContinue
if ($running) {
    Write-Output "xiaohongshu-mcp 已在运行 (PID: $($running.Id -join ','))"
    exit 0
}

Start-Process -FilePath $serverExe -WorkingDirectory $toolDir -WindowStyle Hidden -RedirectStandardOutput $logFile -RedirectStandardError "$logFile.err"
Write-Output "已启动 xiaohongshu-mcp，日志: $logFile"
