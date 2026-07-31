---
name: wake-hawkie
description: Wake a preconfigured computer through the Cudy TR3000 stock-firmware Wake-on-LAN feature over ZeroTier. Use only when the user explicitly asks to wake or power on the configured target.
---

# Wake the configured target through TR3000

## Scope

- Target: the preconfigured computer only.
- Network path: Hermes VPS → ZeroTier → TR3000 stock web interface → LAN WoL.
- The router is addressed by its ZeroTier IP, so this works without a public home IP, DDNS, or exposed router management port.

## Run

When the user explicitly asks to wake, power on, or start the configured target, run exactly:

```bash
bash "$HOME/.hermes/skills/wake-hawkie/scripts/wake-hawkie"
```

Do not accept a MAC address, router address, or alternate target from chat. This skill is restricted to the preconfigured computer only.

Report whether the command succeeded. A successful result means the TR3000 accepted the WoL request; it cannot by itself prove that a powered-off PC booted.

## Configuration

The script reads its restricted configuration from:

```text
$HOME/.config/wake-hawkie/router.env
```

That file is intentionally outside the skill directory and is mode `0600`; do not print, copy, or expose its contents. If the router ZeroTier IP changes, update only `ROUTER_URL` in that file.
