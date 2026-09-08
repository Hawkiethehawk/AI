#!/usr/bin/env bash
# skill-selfcheck.sh — 让 Codex/Claude 运行时 skill 与本地仓库版本保持同步。
#
# 真源(single source of truth) = $REPO/skill/。
#   ⚠️ 请只修改仓库真源，不要直接改 .agents/skills 或 ~/.claude/skills 运行时副本，
#      否则本脚本会用 repo 版本覆盖你在运行时的改动。
#
# 用途：把当前工作树中有变化的 skill 同步到运行时目录，并打印一行变更摘要。
#       本脚本不访问远端；pull 和 push 只能在用户明确授权后单独执行。
#
# 可移植：任何 agent harness 都能调用  ->  bash <repo>/scripts/skill-selfcheck.sh
# 仅在用户明确授权同步运行时后手动调用，不要挂到自动触发 hook。
set -u

SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SELF/.." && pwd -P)"
SRC="$REPO/skill"

[ "$(cd "$(git -C "$REPO" rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null && pwd -P)" = "$REPO" ] || {
  echo "[skill-selfcheck] 仓库根校验失败: $REPO" >&2
  exit 1
}
case "$(git -C "$REPO" config --get remote.origin.url 2>/dev/null)" in
  https://github.com/Hawkiethehawk/AI.git|git@github.com:Hawkiethehawk/AI.git) ;;
  *) echo "[skill-selfcheck] origin 不是 GitHub 的 Hawkiethehawk/AI，拒绝执行" >&2; exit 1 ;;
esac

[ -d "$SRC" ] || { echo "[skill-selfcheck] 找不到 skill 源目录: $SRC" >&2; exit 0; }

sync_destination() {
  local dst="$1" manifest="$2" label="$3" changed=""
  local d name target oldv newv old_label new_label manifest_tmp

  mkdir -p "$dst"

  # 没有清单时只初始化，不猜测哪些现有目录属于本仓库。
  if [ -f "$manifest" ]; then
    while IFS= read -r name; do
      case "$name" in
        ""|.|..|*/*|*\\*) continue ;;
      esac
      if [ ! -f "$SRC/$name/SKILL.md" ] && [ -d "$dst/$name" ]; then
        rm -rf -- "$dst/$name"
        changed="$changed -$name(已删除)"
      fi
    done < "$manifest"
  fi

  for d in "$SRC"/*/; do
    [ -f "$d/SKILL.md" ] || continue
    name="$(basename "$d")"
    target="$dst/$name"
    if [ ! -f "$target/SKILL.md" ] || ! diff -qr --exclude='__pycache__' --exclude='*.pyc' --exclude='*.pyo' "$d" "$target" >/dev/null 2>&1; then
      if [ -f "$target/SKILL.md" ]; then
        oldv="$(grep -m1 -E '^[[:space:]]*version:' "$target/SKILL.md" 2>/dev/null | awk '{print $2}')"
        old_label="${oldv:-未声明}"
      else
        old_label="缺失"
      fi
      rm -rf -- "$target"
      mkdir -p "$target"
      cp -rf "$d." "$target/"
      find "$target" -type f \( -name '*.pyc' -o -name '*.pyo' \) -delete
      find "$target" -depth -type d -name '__pycache__' -empty -delete
      newv="$(grep -m1 -E '^[[:space:]]*version:' "$d/SKILL.md" 2>/dev/null | awk '{print $2}')"
      new_label="${newv:-未声明}"
      changed="$changed ${name}(${old_label}->${new_label})"
    fi
  done

  mkdir -p "$(dirname "$manifest")"
  manifest_tmp="${manifest}.tmp.$$"
  if {
    for d in "$SRC"/*/; do
      [ -f "$d/SKILL.md" ] || continue
      basename "$d"
    done
  } | sort > "$manifest_tmp" && mv -f -- "$manifest_tmp" "$manifest"; then
    :
  else
    rm -f -- "$manifest_tmp"
  fi

  [ -n "$changed" ] && echo "[skill-selfcheck] $label:$changed"
}

migrate_manifest() {
  local old_manifest="$1" new_manifest="$2"
  if [ ! -f "$new_manifest" ] && [ -f "$old_manifest" ]; then
    mkdir -p "$(dirname "$new_manifest")"
    cp -f -- "$old_manifest" "$new_manifest"
  fi
}

migrate_manifest "$REPO/.agents/.gitee-synced-skills" "$REPO/.agents/.ai-managed-skills"
migrate_manifest "$HOME/.agents/.gitee-synced-skills" "$HOME/.agents/.ai-managed-skills"
migrate_manifest "$HOME/.claude/.gitee-synced-skills" "$HOME/.claude/.ai-managed-skills"

sync_destination "$REPO/.agents/skills" "$REPO/.agents/.ai-managed-skills" "项目级 Codex skill 已更新"
sync_destination "$HOME/.agents/skills" "$HOME/.agents/.ai-managed-skills" "用户级 Codex skill 已更新"
sync_destination "$HOME/.claude/skills" "$HOME/.claude/.ai-managed-skills" "Claude skill 已更新"
exit 0
