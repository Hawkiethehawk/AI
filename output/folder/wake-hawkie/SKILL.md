---
name: wake-hawkie
description: Use when remotely powering on (Wake-on-LAN) a PC on a home LAN through an ImmortalWrt/OpenWrt router (Cudy TR3000) — reach the always-on router over Tailscale, then have it broadcast a WoL magic packet via etherwake. Covers non-interactive SSH from Windows (plink), the router-side Tailscale setup, and the proxy/TUN (v2rayN/sing-box) pitfalls that silently break SSH-to-IP. Default target is the PC "configured target".
version: 1.0.0
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
- First connection to a new host: plink needs the host key cached. Run once interactively, or pipe `y`:
  `"y`n" | plink.exe -ssh root@<host> -pw "<pw>" "true"`  (then subsequent calls can use `-batch`).
- Get plink without an installer: download the standalone `plink.exe` (PuTTY `w64`) and drop it next to the wrapper script.

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

### `etherwake: command not found`
`opkg install etherwake`. The binary is `/usr/bin/etherwake`. (Alternatives on some builds: `wol`, or LuCI's `luci-app-wol`.)

### Magic packet sent but PC doesn't wake
Re-verify: BIOS WoL + "Power On by PCI-E" enabled; ErP/Deep-Sleep **off**; NIC driver "wake on magic packet" enabled; **wired** connection; the PC was **shut down** (S5) or in a sleep state that keeps the NIC powered; correct **MAC** (the Ethernet NIC, not WiFi); correct interface (`br-lan`).

### Wrong bridge interface
Most ImmortalWrt setups bridge LAN as `br-lan`. Verify: `ip -4 addr show` or `ifstatus lan | grep l3_device`.

## Current Environment (this setup — fill credentials at runtime, never commit them)

| Component | Value |
|-----------|-------|
| Router | Cudy TR3000, ImmortalWrt, bridge `br-lan`, `/overlay` ~176 MB free |
| Router LAN | `<LAN_SUBNET>`, gateway `<ROUTER_LAN_IP>` |
| Router Tailscale IP | `<ROUTER_TAILSCALE_IP>` (tailnet `<TAILNET_DOMAIN>`, acct <TAILNET_ACCOUNT>@) |
| Target PC "configured target" | NIC <TARGET_NIC>, **MAC `<TARGET_MAC>`** (wake target) |
| configured target LAN / Tailscale | `<PC_LAN_IP>` / `<PC_TAILSCALE_IP>` |
| Controller | separate machine; reaches tailnet via v2rayN sing-box **TUN** — subject to the `RouteOnly` pitfall above |
| Router SSH password | **NOT stored in repo** — supply at runtime |

### Wake configured target (concrete)
```powershell
# from the controller (Windows), once the RouteOnly fix or a clean tailnet path is in place:
plink.exe -batch -ssh root@<ROUTER_TAILSCALE_IP> -pw "<ROUTER_SSH_PASSWORD>" "etherwake -i br-lan <TARGET_MAC>"
# then poll:
1..30 | % { if (Test-Connection <PC_TAILSCALE_IP> -Count 1 -Quiet) { "configured target UP"; break }; Start-Sleep 5 }
```

## Quick Command Reference

| Goal | Command |
|------|---------|
| Wake (key auth) | `ssh root@<ROUTER_TAILSCALE_IP> "etherwake -i br-lan <TARGET_MAC>"` |
| Wake (Windows, pw) | `plink -batch -ssh root@<ROUTER_TAILSCALE_IP> -pw "<pw>" "etherwake -i br-lan <TARGET_MAC>"` |
| Install etherwake | `opkg update && opkg install etherwake` |
| Install Tailscale (router) | `opkg install tailscale && /etc/init.d/tailscale enable && /etc/init.d/tailscale start && tailscale up` |
| Router Tailscale IP | `tailscale ip -4` |
| Find target MAC | `ipconfig /all` (Win) or `cat /tmp/dhcp.leases` (router) |
| Verify bridge | `ip -4 addr show` / `ifstatus lan` |
| Confirm woke | poll `Test-Connection <PC_IP>` |

## Security Notes
- **Never commit the router SSH password** (or private keys) to the repo. Prefer key-based auth; pass passwords at runtime / via env var.
- Tailscale IPs and the target MAC are low-sensitivity (tailnet-private / link-local) and are kept here for convenience.
