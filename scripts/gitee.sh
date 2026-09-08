#!/usr/bin/env bash
# Deprecated compatibility entrypoint. GitHub is the only supported remote.
set -u
echo "提示：gitee.sh 已迁移到 GitHub，建议改用 scripts/github.sh。" >&2
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/github.sh" "$@"
