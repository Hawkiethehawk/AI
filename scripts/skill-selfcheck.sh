#!/usr/bin/env bash
# skill-selfcheck.sh — 让 ~/.claude/skills 下的 skill 与 repo(→gitee) 最新版保持同步。
#
# 真源(single source of truth) = 本 repo 的 skill/ 目录（已推送 gitee）。
#   ⚠️ 请只修改 repo 里的 skill，不要直接改运行时副本 ~/.claude/skills/*，
#      否则本脚本会用 repo 版本覆盖你在运行时的改动。
#
# 用途：每次调用任意 skill 前自检——先整库 git pull 跟上 gitee（含别处推来的更新），
#       再把有变化的 skill 同步到运行时目录，并打印一行变更摘要。
#
# 可移植：任何 agent harness 都能调用  ->  bash <repo>/scripts/skill-selfcheck.sh
#   - 在 Claude Code 中由 PreToolUse(matcher=Skill) hook 自动触发；
#   - 在其它框架中，把这一行挂到该框架的“工具调用前/会话启动”钩子即可。
#   - repo 路径默认由脚本自身位置推断；也可用环境变量 SKILL_REPO 覆盖。
set -u

SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="${SKILL_REPO:-$(cd "$SELF/.." && pwd)}"
SRC="$REPO/skill"
DST="$HOME/.claude/skills"

[ -d "$SRC" ] || { echo "[skill-selfcheck] 找不到 skill 源目录: $SRC" >&2; exit 0; }
mkdir -p "$DST"

# 1) 每次都整库同步：让本地 repo 跟上 gitee（容错，网络问题不阻塞 skill 使用）
timeout 20 git -C "$REPO" pull --rebase --quiet 2>/dev/null || true

# 2) 逐个 skill：运行时缺失或与 repo 不一致 → 同步整目录到运行时
changed=""
for d in "$SRC"/*/; do
  [ -f "$d/SKILL.md" ] || continue
  name="$(basename "$d")"
  t="$DST/$name/SKILL.md"
  if [ ! -f "$t" ] || ! diff -q "$d/SKILL.md" "$t" >/dev/null 2>&1; then
    oldv="$(grep -m1 '^version:' "$t" 2>/dev/null | awk '{print $2}')"
    mkdir -p "$DST/$name"
    cp -rf "$d." "$DST/$name/" 2>/dev/null
    newv="$(grep -m1 '^version:' "$d/SKILL.md" 2>/dev/null | awk '{print $2}')"
    changed="$changed ${name}(${oldv:-缺失}->${newv:-?})"
  fi
done

[ -n "$changed" ] && echo "[skill-selfcheck] 已把运行时 skill 更新到最新:$changed"
exit 0
