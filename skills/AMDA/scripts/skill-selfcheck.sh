#!/usr/bin/env bash
# amda-skill-selfcheck.sh — 让 ~/.claude/skills/AMDA 与 AMDA 仓库最新版保持同步。
# 真源 = 本仓库（已推送 gitee）。请只修改本仓库，不要直接改运行时副本。
# 用法：bash <repo>/scripts/skill-selfcheck.sh
set -u

SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="${AMDA_PROJECT_DIR:-$(cd "$SELF/.." && pwd)}"
DST="$HOME/.claude/skills"
MANIFEST="$HOME/.claude/.gitee-synced-skills-amda"

[ -f "$REPO/SKILL.md" ] || { echo "[amda-skill-selfcheck] 找不到 AMDA 真源: $REPO/SKILL.md" >&2; exit 0; }
mkdir -p "$DST"

# 每次都整库同步（容错，网络问题不阻塞技能使用）
timeout 20 git -C "$REPO" pull --rebase --quiet 2>/dev/null || true

name="AMDA"
t="$DST/$name/SKILL.md"
if [ ! -f "$t" ] || ! diff -q "$REPO/SKILL.md" "$t" >/dev/null 2>&1; then
  oldv="$(grep -m1 '^version:' "$t" 2>/dev/null | awk '{print $2}')"
  rm -rf -- "$DST/$name"
  mkdir -p "$DST/$name"
  cp -rf "$REPO/SKILL.md" "$REPO/agents" "$REPO/examples" "$REPO/references" "$REPO/scripts" "$REPO/templates" "$DST/$name/" 2>/dev/null
  newv="$(grep -m1 '^version:' "$REPO/SKILL.md" 2>/dev/null | awk '{print $2}')"
  echo "[amda-skill-selfcheck] 已把运行时 AMDA 更新到最新:${name}(${oldv:-缺失}->${newv:-?})"
fi

printf '%s\n' "$name" > "$MANIFEST"
exit 0
