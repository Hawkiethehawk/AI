$ErrorActionPreference = 'Continue'
$log = 'E:\LLM-Sandbox\Claude\output\scripts\uninstall-wsl.log'
"=== WSL uninstall started $(Get-Date) ===" | Out-File $log -Encoding utf8

# 1) Unregister any remaining distros
$distros = (wsl.exe --list --quiet) 2>$null
"--- distros found: $distros ---" | Out-File $log -Append -Encoding utf8
if ($distros) {
    foreach ($d in $distros) {
        $name = $d.Trim()
        if ($name) {
            "Unregistering $name" | Out-File $log -Append -Encoding utf8
            wsl.exe --unregister $name 2>&1 | Out-File $log -Append -Encoding utf8
        }
    }
}

# 2) Shut down WSL
wsl.exe --shutdown 2>&1 | Out-File $log -Append -Encoding utf8

# 3) Uninstall Store version of WSL app if present (any user)
$wslApp = Get-AppxPackage -AllUsers -Name 'MicrosoftCorporationII.WindowsSubsystemForLinux' -ErrorAction SilentlyContinue
if ($wslApp) {
    "Removing Store WSL app: $($wslApp.PackageFullName)" | Out-File $log -Append -Encoding utf8
    $wslApp | Remove-AppxPackage -AllUsers -ErrorAction SilentlyContinue
}
# Remove provisioned WSL app
Get-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue |
    Where-Object { $_.DisplayName -match 'WindowsSubsystemForLinux' } |
    ForEach-Object {
        "Removing provisioned: $($_.PackageName)" | Out-File $log -Append -Encoding utf8
        Remove-AppxProvisionedPackage -Online -PackageName $_.PackageName -ErrorAction SilentlyContinue | Out-Null
    }

# 4) Report current feature state
"--- Feature state BEFORE ---" | Out-File $log -Append -Encoding utf8
Get-WindowsOptionalFeature -Online | Where-Object { $_.FeatureName -match 'Linux|VirtualMachinePlatform' } |
    Select-Object FeatureName, State | Out-File $log -Append -Encoding utf8

# 5) Disable WSL optional feature (keep VirtualMachinePlatform)
"Disabling Microsoft-Windows-Subsystem-Linux" | Out-File $log -Append -Encoding utf8
Disable-WindowsOptionalFeature -Online -FeatureName 'Microsoft-Windows-Subsystem-Linux' -NoRestart -ErrorAction SilentlyContinue |
    Select-Object RestartNeeded | Out-File $log -Append -Encoding utf8

"--- Feature state AFTER ---" | Out-File $log -Append -Encoding utf8
Get-WindowsOptionalFeature -Online | Where-Object { $_.FeatureName -match 'Linux|VirtualMachinePlatform' } |
    Select-Object FeatureName, State | Out-File $log -Append -Encoding utf8

"=== Done $(Get-Date) ===" | Out-File $log -Append -Encoding utf8
