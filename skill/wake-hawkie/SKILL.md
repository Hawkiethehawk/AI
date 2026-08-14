---
name: wake-hawkie
description: Wake the owner's preconfigured PC with a local command that calls the Node Xiaobao WOL web API through a relay on the home router. Use when the owner explicitly asks to wake or power on the configured target, or asks to verify the wake request result.
---

# Wake the configured target through Node Xiaobao

## Scope

- Target: the preconfigured computer only.
- Network path: caller -> local `wake-hawkie` command -> Node Xiaobao web API -> router relay -> LAN WoL.
- Do not accept a MAC address, relay ID, or alternate target from chat.

Do not use the retired Cudy LuCI transport or router credentials.

## Run

Invoke the bundled local command. Do not click the web console for normal operation:

```text
/path/to/wake-hawkie/scripts/wake-hawkie
```

The command calls:

```text
POST https://jdis.iepose.com/jdis/wakeup
Content-Type: application/json
```

The request body is built locally with `jq`; the AI layer only starts the command and checks its exit status and output. Require exit code `0` before reporting that a wake request was accepted. A successful API response does not prove that the operating system has finished booting.

## Configuration

The script reads restricted configuration from:

```text
~/.config/wake-hawkie/node-xiaobao.env
```

The file must be outside the skill directory and mode `0600`. Never print, copy, or expose its contents.

Required variables:

```bash
TARGET_MAC=AA:BB:CC:DD:EE:FF
NODE_XIAOBAO_UID=...
NODE_XIAOBAO_OWCODE=...
NODE_XIAOBAO_PEERID=...
```

Optional variables:

```bash
NODE_XIAOBAO_API_URL=https://jdis.iepose.com/jdis/wakeup
NODE_XIAOBAO_PRODUCT=2581
```

Treat the web-console identifiers as account or device credentials. If any required value is absent, stop with a nonzero exit code and do not send a partial request.
