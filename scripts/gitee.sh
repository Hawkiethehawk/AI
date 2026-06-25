#!/usr/bin/env bash
# gitee.sh — 私有仓库 configured targetthehawk/AI 的连接 & 同步助手（配套 gitee-sync skill）
# 一次性 setup token -> 保存到 ~/.claude/.gitee_token（供 REST API 使用）。
# git push/pull 沿用系统已配的凭证（已免密），本脚本不改动它。
set -u

SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="${SKILL_REPO:-$(cd "$SELF/.." && pwd)}"
TOKEN_FILE="$HOME/.claude/.gitee_token"
OWNER="configured targetthehawk"; NAME="AI"; BRANCH="master"
API="https://gitee.com/api/v5"

read_token(){ [ -f "$TOKEN_FILE" ] && tr -d ' \r\n' < "$TOKEN_FILE"; }
need_token(){ local t; t="$(read_token)"; [ -n "$t" ] || { echo "未配置 token，先运行: gitee.sh setup <token>" >&2; return 1; }; printf '%s' "$t"; }
versions(){ for d in "$REPO"/skill/*/; do [ -f "$d/SKILL.md" ] && printf '  %-26s %s\n' "$(basename "$d")" "$(grep -m1 '^version:' "$d/SKILL.md" | awk '{print $2}')"; done; }

cmd="${1:-help}"; [ $# -gt 0 ] && shift

case "$cmd" in
  setup)
    tok="${1:-}"; [ -n "$tok" ] || { echo "用法: gitee.sh setup <gitee-personal-access-token>" >&2; exit 1; }
    login="$(curl -s -m 10 "$API/user?access_token=$tok" | python -c "import sys,json;print(json.loads(sys.stdin.buffer.read().decode('utf-8','ignore')).get('login',''))" 2>/dev/null)"
    [ -n "$login" ] || { echo "token 无效或网络不可达，未保存。请检查 token 后重试。" >&2; exit 1; }
    mkdir -p "$(dirname "$TOKEN_FILE")"; printf '%s' "$tok" > "$TOKEN_FILE"; chmod 600 "$TOKEN_FILE" 2>/dev/null || true
    echo "✓ token 有效（用户 $login），已保存到 $TOKEN_FILE（权限 600，不入库）。后续 API 调用自动复用。"
    ;;
  check)
    bash "$SELF/skill-selfcheck.sh"
    ;;
  status)
    echo "== 仓库 $OWNER/$NAME @ $BRANCH =="; git -C "$REPO" status -s
    echo "== 仓库内 skill 版本 =="; versions
    git -C "$REPO" fetch -q origin "$BRANCH" 2>/dev/null || true
    ahead="$(git -C "$REPO" rev-list --count "origin/$BRANCH..$BRANCH" 2>/dev/null || echo '?')"
    behind="$(git -C "$REPO" rev-list --count "$BRANCH..origin/$BRANCH" 2>/dev/null || echo '?')"
    echo "== 与远程：领先 $ahead / 落后 $behind =="
    ;;
  pull)
    git -C "$REPO" pull --rebase origin "$BRANCH"
    ;;
  push)
    msg="${1:-update}"
    git -C "$REPO" add -A -- skill scripts .gitignore   # 只同步 skill/脚本，不误传 output/ 等未跟踪目录
    git -C "$REPO" commit -m "$msg" || echo "(无改动可提交)"
    git -C "$REPO" pull --rebase origin "$BRANCH" && git -C "$REPO" push origin "$BRANCH"
    ;;
  api)
    path="${1:-/user}"; t="$(need_token)" || exit 1
    sep="?"; case "$path" in *\?*) sep="&";; esac
    curl -s -m 15 "$API${path}${sep}access_token=$t"
    ;;
  info)
    t="$(need_token)" || exit 1
    curl -s -m 15 "$API/repos/$OWNER/$NAME?access_token=$t" | python -c "import sys,json
try:
    d=json.loads(sys.stdin.buffer.read().decode('utf-8','ignore'))
    print('名称   :', d.get('full_name'))
    print('私有   :', d.get('private'))
    print('默认分支:', d.get('default_branch'))
    print('更新时间:', d.get('updated_at'))
    print('描述   :', d.get('description'))
except Exception as e:
    print('解析失败:', e)" 2>/dev/null
    ;;
  help|*)
    cat <<EOF
gitee.sh — 私有仓库 $OWNER/$NAME 助手
  setup <token>   一次性保存 gitee Personal Access Token（验证后存 $TOKEN_FILE）
  check           自检仓库内所有 skill 是否有更新并同步到运行时（每次必做）
  status          工作区状态 + 各 skill 版本 + 与远程领先/落后
  pull            git pull --rebase
  push [msg]      add + commit + rebase + push
  api <path>      调 gitee REST API（带 token），如：api /repos/$OWNER/$NAME/commits
  info            仓库基本信息摘要
EOF
    ;;
esac
