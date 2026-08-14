# wake-hawkie

Generic skill and local command for waking one preconfigured computer through Node Xiaobao.

The network path is:

`caller -> local wake-hawkie command -> Node Xiaobao web API -> router relay -> LAN Wake-on-LAN -> configured target`

The retired Cudy TR3000 LuCI transport is no longer used. The repository contains no Node Xiaobao credentials, cookies, activation links, real device IDs, or target MAC addresses.

## Configuration

On the host that runs the command, create a mode-`0600` file at:

```text
~/.config/wake-hawkie/node-xiaobao.env
```

with:

```bash
TARGET_MAC=AA:BB:CC:DD:EE:FF
NODE_XIAOBAO_UID=your_uid
NODE_XIAOBAO_OWCODE=your_owcode
NODE_XIAOBAO_PEERID=your_relay_peerid
```

Treat the three `NODE_XIAOBAO_*` identifiers as credentials. Keep them outside the repository and never print them in command output or logs.

Optional settings:

```bash
NODE_XIAOBAO_API_URL=https://jdis.iepose.com/jdis/wakeup
NODE_XIAOBAO_PRODUCT=2581
```

## Local API call

The bundled command posts the same JSON request used by the Node Xiaobao web console:

```text
POST https://jdis.iepose.com/jdis/wakeup
Content-Type: application/json
```

Run it from the skill directory:

```bash
scripts/wake-hawkie
```

The command exits `0` only when the API returns `rtn: 0` and no nonzero `errcode`. This confirms that the service accepted the wake request; it does not prove that the target operating system has finished booting.

The endpoint is the web console's current JSON API and may change if Node Xiaobao changes its console implementation.
