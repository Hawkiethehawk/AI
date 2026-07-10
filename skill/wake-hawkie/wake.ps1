<#
.SYNOPSIS
  Wake a LAN PC via Wake-on-LAN through an ImmortalWrt/OpenWrt router (etherwake over SSH).

.DESCRIPTION
  SSHes into the always-on router (reachable over Tailscale) and tells it to broadcast
  a WoL magic packet on the LAN bridge, then optionally polls until the PC responds.

  Auth order:
    1. If a password is supplied (-Pw or $env:TR3000_SSH_PW) and plink.exe is available,
       uses plink (works non-interactively on Windows).
    2. Otherwise uses the system `ssh` with key-based auth (BatchMode).

.EXAMPLE
  # key-based, defaults to configured target:
  ./wake.ps1

.EXAMPLE
  # password-based via env var, custom target:
  $env:TR3000_SSH_PW = "********"
  ./wake.ps1 -Mac AA-BB-CC-DD-EE-FF -Router <ROUTER_TAILSCALE_IP> -WaitIp <PC_TAILSCALE_IP>

.NOTES
  Never hardcode the password in this file. Pass -Pw at runtime or set $env:TR3000_SSH_PW.
#>
param(
  [string]$Mac     = "<TARGET_MAC>",   # target NIC MAC (configured target's <TARGET_NIC>)
  [string]$Router  = "<ROUTER_TAILSCALE_IP>",       # router Tailscale IP
  [string]$Iface   = "br-lan",              # LAN bridge on the router
  [string]$WaitIp  = "<PC_TAILSCALE_IP>",        # PC IP to poll after sending (empty to skip)
  [string]$Pw      = $env:TR3000_SSH_PW,    # router root password (optional; prefer keys)
  [string]$Plink   = (Join-Path $PSScriptRoot "plink.exe"),
  [int]$WaitTries  = 30,
  [int]$WaitDelay  = 5
)

# etherwake wants colon-separated MAC
$macColon = $Mac -replace '-', ':'
$remoteCmd = "etherwake -i $Iface $macColon && echo MAGIC_SENT"
Write-Host "[*] Waking $macColon via $Router ($Iface)..."

$sent = $false
if ($Pw -and (Test-Path $Plink)) {
  Write-Host "[*] Using plink (password auth)"
  $out = & $Plink -batch -ssh "root@$Router" -pw $Pw $remoteCmd 2>&1
  $out | ForEach-Object { Write-Host "    $_" }
  $sent = ($LASTEXITCODE -eq 0)
} else {
  Write-Host "[*] Using system ssh (key auth)"
  $out = ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 "root@$Router" $remoteCmd 2>&1
  $out | ForEach-Object { Write-Host "    $_" }
  $sent = ($LASTEXITCODE -eq 0)
}

if (-not $sent) {
  Write-Host "[!] Failed to send magic packet. Check router reachability and auth." -ForegroundColor Red
  Write-Host "    If SSH dies at 'kex_exchange_identification', see SKILL.md → Troubleshooting (proxy/TUN RouteOnly)." -ForegroundColor Yellow
  exit 1
}

Write-Host "[+] Magic packet sent." -ForegroundColor Green

if ($WaitIp) {
  Write-Host "[*] Polling $WaitIp (up to $($WaitTries*$WaitDelay)s)..."
  for ($i = 1; $i -le $WaitTries; $i++) {
    if (Test-Connection -ComputerName $WaitIp -Count 1 -Quiet -ErrorAction SilentlyContinue) {
      Write-Host "[+] $WaitIp is UP — PC is awake." -ForegroundColor Green
      exit 0
    }
    Start-Sleep -Seconds $WaitDelay
  }
  Write-Host "[!] $WaitIp did not respond in time. WoL may have failed (check BIOS/NIC WoL, wired link)." -ForegroundColor Yellow
  exit 2
}
