#!/usr/bin/env bash
# gitee.sh — 仓库 configured targetthehawk/AI 的连接 & 同步助手（配套 gitee-sync skill，本地真源使用 E:\LLM-Sandbox\Codex）
# 一次性 setup token -> 保存到 ~/.claude/.gitee_token（供 REST API 使用）。
# git push/pull 沿用系统已配的凭证（已免密），本脚本不改动它。
set -u
export PYTHONUTF8=1 PYTHONIOENCODING=utf-8   # 让 python 的 stdin/stdout 统一走 UTF-8（Windows 默认 GBK 会乱码）

SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="${SKILL_REPO:-$(cd "$SELF/.." && pwd)}"
TOKEN_FILE="$HOME/.claude/.gitee_token"
OWNER="configured targetthehawk"; NAME="AI"; BRANCH="master"
API="https://gitee.com/api/v5"

repo_url(){ printf 'https://gitee.com/%s/%s.git' "$OWNER" "$NAME"; }
auth_repo_url(){
  local t
  t="$(read_token)"
  if [ -n "$t" ]; then
    printf 'https://oauth2:%s@gitee.com/%s/%s.git' "$t" "$OWNER" "$NAME"
  else
    repo_url
  fi
}

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
    git -C "$REPO" pull --rebase "$(auth_repo_url)" "$BRANCH"
    ;;
  push)
    msg="${1:-update}"
    if git -C "$REPO" diff --cached --quiet; then
      add_targets=()
      for path in skill scripts project archived .gitignore; do
        [ -e "$REPO/$path" ] && add_targets+=("$path")
      done
      git -C "$REPO" add -A -- "${add_targets[@]}"   # 默认同步 skill/脚本/project 真源/archived，不误传根 output/ 等未跟踪目录
    else
      echo "(检测到已暂存文件，仅提交当前 staged 变更)"
    fi
    git -C "$REPO" commit -m "$msg" || echo "(无改动可提交)"
    git -C "$REPO" pull --rebase "$(auth_repo_url)" "$BRANCH" && git -C "$REPO" push "$(auth_repo_url)" "$BRANCH"
    ;;
  api)
    path="${1:-/user}"; t="$(need_token)" || exit 1
    sep="?"; case "$path" in *\?*) sep="&";; esac
    resp="$(curl -s -m 15 -w '\n%{http_code}' "$API${path}${sep}access_token=$t")"
    code="$(printf '%s' "$resp" | tail -n1)"
    [ "$code" = "200" ] || echo "⚠ gitee API HTTP $code（临时故障或路径/权限问题，可重试）" >&2
    printf '%s\n' "$resp" | head -n -1
    ;;
  create-private)
    repo_name="${1:-}"; description="${2:-}"
    [ -n "$repo_name" ] || { echo "用法: gitee.sh create-private <repo-name> [description]" >&2; exit 1; }
    case "$repo_name" in *[!A-Za-z0-9._-]*|'') echo "仓库名仅允许字母、数字、点、下划线和连字符。" >&2; exit 1;; esac
    t="$(need_token)" || exit 1
    resp="$(curl -sS -m 30 -w '\n%{http_code}' -X POST "$API/user/repos" \
      --data-urlencode "access_token=$t" \
      --data-urlencode "name=$repo_name" \
      --data-urlencode "description=$description" \
      --data-urlencode 'private=true' \
      --data-urlencode 'auto_init=true')"
    code="$(printf '%s' "$resp" | tail -n1)"; body="$(printf '%s\n' "$resp" | head -n -1)"
    if [ "$code" != "201" ]; then
      echo "创建私有仓库失败（Gitee API HTTP $code）。" >&2
      printf '%s\n' "$body" >&2
      exit 1
    fi
    printf '%s\n' "$body" | python -c "import sys,json; d=json.load(sys.stdin); print('✓ 已创建私有仓库:', d.get('full_name')); print('地址:', d.get('html_url')); print('Git:', d.get('clone_url'))"
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
  check           整库 git pull 同步 + 仓库内所有 skill 同步到运行时（每次必做）
  status          工作区状态 + 各 skill 版本 + 与远程领先/落后
  pull            git pull --rebase
  push [msg]      add + commit + rebase + push
  api <path>      调 gitee REST API（带 token），如：api /repos/$OWNER/$NAME/commits
  info            仓库基本信息摘要
  create-private <name> [description]  创建一个初始化的私有仓库
EOF
    ;;
esac
