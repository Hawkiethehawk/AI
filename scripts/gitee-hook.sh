#!/usr/bin/env bash
# Deprecated compatibility entrypoint. The release hook is provider-neutral.
set -u
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/git-release-hook.sh"
