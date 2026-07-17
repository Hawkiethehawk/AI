# wake-hawkie

Hermes skill for waking the PC named **configured target** through a Cudy TR3000 running its stock firmware.

The network path is:

`Hermes VPS → ZeroTier → TR3000 web interface → Wake-on-LAN`

The repository intentionally contains no router address, passwords, tokens, or target-specific configuration. On the Hermes host, create a mode-`0600` file at:

```text
~/.config/wake-hawkie/router.env
```

with these values:

```bash
ROUTER_URL=http://ROUTER_ZEROTIER_IP
ROUTER_PASSWORD=your-router-admin-password
TARGET_MAC=AA:BB:CC:DD:EE:FF
```

Copy this repository into the Hermes skills directory, then invoke the bundled script only for the explicitly configured target.
