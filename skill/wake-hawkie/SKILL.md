---
name: wake-hawkie
description: Use when remotely powering on (Wake-on-LAN) a PC on a home LAN through an ImmortalWrt/OpenWrt router (Cudy TR3000) — reach the always-on router over Tailscale, then have it broadcast a WoL magic packet via etherwake. Covers non-interactive SSH from Windows (plink), the router-side Tailscale setup, and the proxy/TUN (v2rayN/sing-box) pitfalls that silently break SSH-to-IP. Default target is the PC "configured target".
version: 1.1.0
author: configured targetthehawk
license: MIT
metadata:
  hermes:
    tags: [wake-on-lan, wol, immortalwrt, openwrt, tailscale, etherwake, remote-access, networking, windows, plink]
    related_skills: []
---

# Wake configured target — Remote Wake-on-LAN via ImmortalWrt (Cudy TR3000)

## Overview

Power on a PC on a home LAN from anywhere by having the always-on router send a Wake-on-LAN (WoL) magic packet to the target's NIC.

**Core principle:** a WoL magic packet is an **L2 broadcast** — it does **not** cross subnets or routers. So the packet must be emitted *by a device that sits on the target PC's own LAN segment*. The router is the natural choice: it is always on and on the same LAN. The remote controller only needs to reach the router (which stays up even when the PC is off) and tell it to fire `etherwake`.

```
controller (anywhere)
   │  SSH over Tailscale  (router is always reachable)
   ▼
ImmortalWrt router (TR3000, on target's LAN)
   │  etherwake → L2 magic packet broadcast on br-lan
   ▼
target PC NIC (asleep/off, listening for magic packet) → boots
```

## When to Use

- Remotely turning on a home PC that is shut down / asleep
- Setting up remote WoL on an ImmortalWrt/OpenWrt router for the first time
- Debugging "SSH to the router works locally but not remotely" (proxy/Tailscale/IP-collision issues)
- Any "send a magic packet through the router" task

## Prerequisites (one-time, verify before trusting the wake)

### Target PC (the thing being woken)
- **BIOS/UEFI:** enable Wake-on-LAN / "Power On by PCI-E/PCI" / "Resume by LAN". Disable ErP / Deep Sleep (S5) so the NIC keeps standby power when off.
- **NIC driver (Windows):** Device Manager → network adapter → Power Management → enable "Allow this device to wake the computer" and "Only allow a magic packet to wake the computer". On the adapter's Advanced tab, enable "Wake on Magic Packet".
- **Wired Ethernet.** WiFi WoL (WoWLAN) is unreliable — use the Ethernet NIC.
- Get the **Ethernet NIC MAC** (the wake target): `ipconfig /all` → the Ethernet adapter's 物理地址, or the router's DHCP leases (`/tmp/dhcp.leases`).

### Router (ImmortalWrt/OpenWrt)
- `etherwake` installed (see setup).
- Remotely reachable when the PC is off — **Tailscale on the router** is the robust way (see setup). DDNS+port-forward also works if you have a public IP.
- The LAN bridge is normally **`br-lan`** (verify: `ip -4 addr show` or `ifstatus lan`).

### Controller (machine running the wake)
- An SSH client. On **Windows**, the bundled `ssh.exe` prompts for the password interactively — for automation use **plink** (PuTTY) with a key or `-pw`, or set up key-based auth.

## One-Time Setup

### 1. Install etherwake on the router
```sh
opkg update
opkg install etherwake          # provides /usr/bin/etherwake
```

### 2. Make the router reachable from anywhere — Tailscale on ImmortalWrt
Check flash space first (Tailscale needs ~40 MB; fine on NAND models):
```sh
df -h /overlay                  # need tens of MB free
opkg update
opkg install tailscale          # pulls kmod-tun etc.
/etc/init.d/tailscale enable
/etc/init.d/tailscale start
tailscale up                    # prints https://login.tailscale.com/a/... → open & auth in browser
tailscale ip -4                 # record the router's 100.x.y.z address
```
- The `linuxfw: clear iptables ... executable file not found` log lines are **harmless** — ImmortalWrt uses nftables/fw4, and we only need the router reachable (no subnet routing required for WoL).
- After this the router has a stable `100.x` address reachable from any tailnet client, **independent of whether the PC is on**.

### 3. (Recommended) Passwordless SSH from the controller
Append the controller's SSH public key to the router so no password is needed:
```sh
# on the router (dropbear):
echo "ssh-ed25519 AAAA... controller-key" >> /etc/dropbear/authorized_keys
```
Then the controller can `ssh root@<router>` with no password (and `-o BatchMode=yes`).

## The Wake Procedure (core)

Once set up, waking is a single command. From the controller:

```sh
# generic
ssh root@<ROUTER_TAILSCALE_IP> "etherwake -i br-lan <TARGET_MAC>"
```

### From Windows, non-interactively (plink)
The bundled `ssh.exe` cannot take a password in an automated/non-TTY context. Use plink:
```powershell
# key-based (preferred):
plink.exe -batch -ssh root@<ROUTER_TAILSCALE_IP> "etherwake -i br-lan <TARGET_MAC>"

# password-based:
plink.exe -batch -ssh root@<ROUTER_TAILSCALE_IP> -pw "<ROUTER_SSH_PASSWORD>" "etherwake -i br-lan <TARGET_MAC>"
```
- **First connection — do NOT pipe `y` to accept the host key.** In a non-interactive / no-console context plink reads the host-key prompt *straight from the console*, so a piped `y` is ignored and **plink hangs forever** (same trap as `ssh-keygen` prompting for a passphrase). Pin the fingerprint with `-hostkey` instead, derived non-interactively via OpenSSH:
  ```powershell
  # collect the router's host-key fingerprint(s), then pass them to plink:
  $hk=@(); ssh-keyscan -T 8 -t ed25519,rsa,ecdsa <host> 2>$null |
    ? { $_ -and $_ -notmatch '^#' } |
    % { $f = ($_ | ssh-keygen -lf - 2>$null); if ($f) { $hk+='-hostkey'; $hk+=($f -split '\s+')[1] } }
  plink.exe @hk -batch -ssh root@<host> -pw "<pw>" "etherwake -i br-lan <TARGET_MAC>"
  ```
- Get plink without an installer: download the standalone `plink.exe` (PuTTY `w64`) and drop it next to the wrapper script.

### Remote controller — a cloud server / any tailnet device
The controller doesn't have to be your laptop. **Any device on the tailnet** can wake the PC — it only needs to reach the router's Tailscale IP and run `etherwake`. An always-on **cloud VPS on the tailnet** is the ideal "wake from anywhere" controller. One-time, give it a key the router trusts so the wake is passwordless:
```sh
# on the cloud server (once):
test -f ~/.ssh/id_ed25519 || ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub      # append this line to the router's /etc/dropbear/authorized_keys
# thereafter, waking is one passwordless command from the cloud server:
ssh root@<ROUTER_TAILSCALE_IP> "etherwake -i br-lan <TARGET_MAC>"
```

#### Driving the controller through the router (when a local proxy breaks SSH)
If the machine you're typing on can't SSH to the cloud controller because a **local fake-ip / TUN proxy (Clash/mihomo) corrupts SSH to public IPs** (HTTP works, SSH dies at the banner — the RouteOnly pitfall in Troubleshooting, and it persists even with a DIRECT rule and even via the proxy's own SOCKS port), bounce through the **router**, which you *can* reach cleanly over the **LAN** (private IPs bypass the TUN):
```powershell
# me ─(LAN, key)→ router ─(dbclient over Tailscale)→ cloud controller ─→ wakes back to the router
ssh -i ~/.ssh/id_ed25519 root@<ROUTER_LAN_IP> "DROPBEAR_PASSWORD='<cloud_pw>' dbclient -y -y <cloud_user>@<CLOUD_TAILSCALE_IP> 'echo <BASE64_SCRIPT> | base64 -d | bash'"
```
- The router (dropbear) ships `dbclient`: pass the cloud password via the `DROPBEAR_PASSWORD` env var, `-y -y` to skip host-key prompts.
- **base64-wrap the cloud-side script** — quotes/backslashes get mangled across PowerShell→ssh→router-sh→dbclient→cloud-sh; an alphanumeric base64 blob survives. Decode on the **cloud** end (the router's busybox has no `base64`/`bash`).
- PowerShell 5.1 eats embedded `"` in native args, so **single-quote** the `dbclient` argument or the router's shell will grab the pipe.

### Confirm it woke
WoL is fire-and-forget; verify the PC came up:
```powershell
# poll the PC's Tailscale IP (or LAN IP) until it answers
1..30 | % { if (Test-Connection <PC_IP> -Count 1 -Quiet) { "UP"; break }; Start-Sleep 5 }
```

A convenience wrapper is bundled: **`wake.ps1`** (see below).

## Troubleshooting (hard-won from real setup)

### `kex_exchange_identification: Connection closed by remote host`
TCP connects, then the SSH version exchange is reset. The usual culprit on the controller is a **local proxy / TUN (v2rayN, sing-box, Clash) intercepting the connection**.
- **Root cause seen here:** the proxy inbound had sniffing with **`RouteOnly: false`** + `DestOverride: ["http","tls"]`. Sniffing then **overrides the destination** with a sniffed domain, which corrupts **direct-IP, non-HTTP/TLS protocols like SSH**. HTTP/TLS still work (they sniff cleanly), so only SSH appears "broken".
- **Fix:** set the proxy inbound's sniffing to **`RouteOnly: true`** (use sniff result for routing only, never override the destination). In **v2rayN**: `guiConfigs/guiNConfig.json` → `Inbound[].RouteOnly: true`. Edit with **v2rayN fully closed** (it rewrites the file from memory on exit), then reopen. Equivalent GUI path: settings → inbound/sniffing → enable "routeOnly".
- Alternative: exclude the Tailscale CGNAT range **`100.64.0.0/10`** from the proxy/sniffing so tailnet traffic passes untouched.

### Reaching `<ROUTER_LAN_IP>` hits the *wrong* device (a TP-Link switch, etc.)
Through a proxy TUN, a generic RFC1918 IP like `<ROUTER_LAN_IP>` can collide with a **different** network behind the proxy exit. The HTTP/SSH you reach is some other LAN's device, not your router.
- **Fix:** from a remote controller, always address the router by its **Tailscale IP (`100.x`)**, never the colliding `192.168.x.x` LAN IP.

### "Port 22 is open" but SSH still fails
A proxy TUN often **fake-accepts** the TCP handshake, so a port test (`Test-NetConnection -Port 22`) reports success while end-to-end is broken. Don't trust the port test alone — test an actual SSH handshake.

### `ping` fails but SSH works (over Tailscale)
ICMP may be unrouted while TCP is fine. **Test with TCP (port 22), not ping.**

### Windows non-interactive gotchas (plink / ssh-keygen / remote one-liners)
Hard-won while automating from a no-console (agent/harness) context:
- **plink and `ssh-keygen` read prompts from the console, not stdin** → piping `y` (host key) or blank lines (passphrase) does **not** answer them; the process **hangs**. Fixes: `plink -hostkey SHA256:...` (see the wake section); `ssh-keygen --% -t ed25519 -f <path> -N "" -C ...` (the `--%` stop-parser makes PowerShell pass a real empty passphrase).
- **Backslashes get eaten** crossing PowerShell → plink → remote `sh`. A remote `tr -d "\r"` arrived as `tr -d "r"` and silently deleted every `r` from the payload. Avoid backslash escapes in remote one-liners.
- **busybox often lacks `base64`** (`ash: base64: not found`), so don't rely on base64-decoding on the router.
- **Installing the controller's pubkey non-interactively**, robust against all of the above — single-quote the key on the remote side, plain `echo`, no backslashes/base64:
  ```powershell
  $key = (Get-Content "$HOME\.ssh\id_ed25519.pub" -Raw).Trim()
  plink.exe @hk -batch -ssh root@<host> -pw "<pw>" "echo '$key' >> /etc/dropbear/authorized_keys; chmod 600 /etc/dropbear/authorized_keys"
  ```
  Then verify: `ssh -o BatchMode=yes -i $HOME\.ssh\id_ed25519 root@<host> "echo KEYAUTH_OK"`.

### `etherwake: command not found`
`opkg install etherwake`. The binary is `/usr/bin/etherwake`. (Alternatives on some builds: `wol`, or LuCI's `luci-app-wol`.)

### Magic packet sent but PC doesn't wake
Re-verify: BIOS WoL + "Power On by PCI-E" enabled; ErP/Deep-Sleep **off**; NIC driver "wake on magic packet" enabled; **wired** connection; the PC was **shut down** (S5) or in a sleep state that keeps the NIC powered; correct **MAC** (the Ethernet NIC, not WiFi); correct interface (`br-lan`).

### Wrong bridge interface
Most ImmortalWrt setups bridge LAN as `br-lan`. Verify: `ip -4 addr show` or `ifstatus lan | grep l3_device`.

## Current Environment (concrete values are LOCAL-ONLY)

This repo is **public**, so the concrete network topology of this particular setup — router/PC/cloud **Tailscale IPs**, the **tailnet name**, the target **MAC**, LAN IPs, Windows username — lives in **`env.local.md`** (gitignored, never pushed). It still syncs to the runtime skill dir via `cp -rf`, so it's available when you actually run a wake; it just doesn't land in git.

To reconstruct or update this setup, record these fields in `env.local.md`:

| Field | What to record |
|-------|----------------|
| Router | model, firmware, LAN bridge name, `/overlay` free |
| Router LAN / Tailscale IP | `192.168.x.x` / `100.x.y.z` |
| Target PC | NIC model, **Ethernet MAC** (wake target), LAN + Tailscale IP |
| Local proxy | TUN/fake-ip details that break SSH-to-public-IP (reach router over LAN to bypass) |
| Cloud controller | host, Tailscale IP, ssh user, "key installed on router?" |
| Passwordless SSH | which keys are in the router's `authorized_keys` / the PC's `administrators_authorized_keys` |
| Router SSH password | **never store** — supply at runtime |

> Concrete commands for this setup (real IPs/MAC filled in) are in `env.local.md`. The procedures below stay generic with `<PLACEHOLDERS>`.

## Remote shutdown (the reverse of wake)
Wake turns the PC **on**; the symmetric move turns it **off** — SSH *into* the PC and run `shutdown /s /t 0`. Difference: wake works while the PC is off (router emits the packet); shutdown needs the PC reachable *while on*. The PC's own Tailscale is often **offline behind the same TUN proxy**, so route through the router over the **LAN**, mirroring the wake relay: `controller → router (Tailscale) → PC (LAN SSH) → shutdown`.

### One-time setup on the target PC (Windows)
1. Install OpenSSH Server (elevated PowerShell):
   ```powershell
   Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
   Start-Service sshd; Set-Service sshd -StartupType Automatic
   New-NetFirewallRule -Name OpenSSH-Server -DisplayName 'OpenSSH Server' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
   ```
2. Authorize the **router's** SSH public key on the PC. **Gotcha:** if the SSH user is in the **Administrators** group, Windows sshd reads the key from `%ProgramData%\ssh\administrators_authorized_keys` (NOT `~\.ssh\authorized_keys`), and that file must be writable only by `Administrators`+`SYSTEM` — so it needs an **elevated** command:
   ```powershell
   $pub = '<ROUTER_PUBKEY>'   # on the router: mkdir -p /root/.ssh && ssh-keygen -t ed25519 -N "" -f /root/.ssh/id_ed25519 ; cat /root/.ssh/id_ed25519.pub
   $f = "$env:ProgramData\ssh\administrators_authorized_keys"
   Add-Content $f $pub -Encoding ascii
   icacls $f /inheritance:r /grant 'Administrators:F' /grant 'SYSTEM:F'
   ```

### The shutdown command (controller → router → PC, all passwordless)
```sh
# from the cloud server / any tailnet controller:
ssh root@<ROUTER_TAILSCALE_IP> "ssh -i /root/.ssh/id_ed25519 <WIN_USER>@<PC_LAN_IP> 'shutdown /s /t 0'"
```
- Passwordless throughout: the controller's key is in the router's `authorized_keys`, the router's key is in the PC's `administrators_authorized_keys`.
- **Privilege check** (read-only, does NOT shut down): run `'whoami /priv | findstr /i shutdown'` over the same SSH — it should list `SeShutdownPrivilege`. *Disabled* is fine (`shutdown.exe` enables it itself); only *absent* fails.
- Reboot instead: `shutdown /r /t 0`. Cancel a pending shutdown: `shutdown /a`.

## Quick Command Reference

| Goal | Command |
|------|---------|
| Wake (key auth) | `ssh root@<ROUTER_TS_IP> "etherwake -i br-lan <TARGET_MAC>"` |
| Wake (Windows, pw) | `plink -batch -ssh root@<ROUTER_TS_IP> -pw "<pw>" "etherwake -i br-lan <TARGET_MAC>"` |
| Install etherwake | `opkg update && opkg install etherwake` |
| Install Tailscale (router) | `opkg install tailscale && /etc/init.d/tailscale enable && /etc/init.d/tailscale start && tailscale up` |
| Router Tailscale IP | `tailscale ip -4` |
| Find target MAC | `ipconfig /all` (Win) or `cat /tmp/dhcp.leases` (router) |
| Verify bridge | `ip -4 addr show` / `ifstatus lan` |
| Confirm woke | poll `Test-Connection <PC_IP>` |
| **Shutdown** (cloud→router→PC) | `ssh root@<ROUTER_TS_IP> "ssh -i /root/.ssh/id_ed25519 <WIN_USER>@<PC_LAN_IP> 'shutdown /s /t 0'"` |
| Reboot / cancel pending | `shutdown /r /t 0` / `shutdown /a` |
| Check shutdown priv (safe) | `ssh ... <WIN_USER>@<PC_LAN_IP> 'whoami /priv \| findstr /i shutdown'` |

> 本机这套 setup 的**具体 IP/MAC 命令**见 `env.local.md`（gitignored）。

## Security Notes
- **Never commit the router SSH password** (or private keys) to the repo. Prefer key-based auth; pass passwords at runtime / via env var.
- **This repo is public.** Tailscale IPs are tailnet-private and the MAC is link-local, but the **tailnet name + IP map + MAC + account email** together are needless fingerprinting on a public repo — so all concrete values live in **`env.local.md` (gitignored)**, not in SKILL.md. Keep it that way: SKILL.md stays generic with `<PLACEHOLDERS>`; concrete topology never enters git.

## Changelog
See [CHANGELOG.md](CHANGELOG.md).
