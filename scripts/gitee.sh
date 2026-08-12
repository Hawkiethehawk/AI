#!/usr/bin/env bash
# gitee.sh — 仓库 Hawkiethehawk/AI 的连接 & 同步助手（配套 gitee-sync skill，本地真源使用 E:\LLM-Sandbox\Codex）
# 一次性 setup token -> 保存到 ~/.claude/.gitee_token（供 REST API 使用）。
# git push/pull 沿用系统已配的凭证（已免密），本脚本不改动它。
set -u
export PYTHONUTF8=1 PYTHONIOENCODING=utf-8   # 让 python 的 stdin/stdout 统一走 UTF-8（Windows 默认 GBK 会乱码）

SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SELF/.." && pwd -P)"
TOKEN_FILE="$HOME/.claude/.gitee_token"
OWNER="Hawkiethehawk"; NAME="AI"; BRANCH="master"
API="https://gitee.com/api/v5"
EXPECTED_NAME="Hawkiethehawk"
EXPECTED_EMAIL="hawkiethehawk@gmail.com"

validate_repo(){
  local top origin
  top="$(git -C "$REPO" rev-parse --show-toplevel 2>/dev/null)" || { echo "目标不是 Git 仓库: $REPO" >&2; return 1; }
  top="$(cd "$top" && pwd -P)"
  [ "$top" = "$REPO" ] || { echo "仓库根不匹配，拒绝执行: $top" >&2; return 1; }
  origin="$(git -C "$REPO" config --get remote.origin.url 2>/dev/null)"
  case "$origin" in
    https://gitee.com/Hawkiethehawk/AI.git|git@gitee.com:Hawkiethehawk/AI.git) ;;
    *) echo "origin 不是 Hawkiethehawk/AI，拒绝执行: ${origin:-未配置}" >&2; return 1 ;;
  esac
}

read_token(){ [ -f "$TOKEN_FILE" ] && tr -d ' \r\n' < "$TOKEN_FILE"; }
need_token(){ local t; t="$(read_token)"; [ -n "$t" ] || { echo "未配置 token，请在本地交互式终端运行: gitee.sh setup" >&2; return 1; }; printf '%s' "$t"; }
versions(){ for d in "$REPO"/skill/*/; do [ -f "$d/SKILL.md" ] && printf '  %-26s %s\n' "$(basename "$d")" "$(grep -m1 '^version:' "$d/SKILL.md" | awk '{print $2}')"; done; }
api_curl(){
  local token="$1"
  shift
  printf 'header = "Authorization: token %s"\n' "$token" | curl --config - "$@"
}

cmd="${1:-help}"; [ $# -gt 0 ] && shift
case "$cmd" in help|-h|--help) ;; *) validate_repo || exit 1;; esac

case "$cmd" in
  setup)
    [ $# -eq 0 ] || { echo "setup 不接受命令行 token；请在本地交互式终端直接运行 gitee.sh setup。" >&2; exit 1; }
    [ -t 0 ] || { echo "setup 需要本地交互式终端，以隐藏方式读取 token。" >&2; exit 1; }
    read -r -s -p "Gitee Personal Access Token: " tok
    printf '\n'
    [ -n "$tok" ] || { echo "token 不能为空。" >&2; exit 1; }
    login="$(api_curl "$tok" -s -m 10 "$API/user" | python -c "import sys,json;print(json.loads(sys.stdin.buffer.read().decode('utf-8','ignore')).get('login',''))" 2>/dev/null)"
    [ -n "$login" ] || { echo "token 无效或网络不可达，未保存。请检查 token 后重试。" >&2; exit 1; }
    mkdir -p "$(dirname "$TOKEN_FILE")"; printf '%s' "$tok" > "$TOKEN_FILE"; chmod 600 "$TOKEN_FILE" 2>/dev/null || true
    unset tok
    echo "✓ token 有效（用户 $login），已保存到 $TOKEN_FILE（权限 600，不入库）。后续 API 调用自动复用。"
    ;;
  check)
    bash "$SELF/skill-selfcheck.sh"
    ;;
  status)
    echo "== 仓库 $OWNER/$NAME @ $BRANCH =="; git -C "$REPO" status -s
    echo "== 仓库内 skill 版本 =="; versions
    ahead="$(git -C "$REPO" rev-list --count "origin/$BRANCH..$BRANCH" 2>/dev/null || echo '?')"
    behind="$(git -C "$REPO" rev-list --count "$BRANCH..origin/$BRANCH" 2>/dev/null || echo '?')"
    echo "== 与本地缓存的 origin/$BRANCH：领先 $ahead / 落后 $behind（未访问远端） =="
    ;;
  pull)
    git -C "$REPO" pull --rebase origin "$BRANCH"
    ;;
  push)
    msg="${1:-update}"
    if git -C "$REPO" diff --cached --quiet; then
      add_targets=()
      for path in skill scripts project archived .gitignore; do
        [ -e "$REPO/$path" ] && add_targets+=("$path")
      done
      [ "${#add_targets[@]}" -gt 0 ] && git -C "$REPO" add -A -- "${add_targets[@]}"
    else
      echo "(检测到已暂存文件，仅提交当前 staged 变更)"
    fi
    if git -C "$REPO" diff --cached --quiet; then
      echo "(无改动可提交)"
    else
      git -C "$REPO" commit -m "$msg" || exit 1
    fi
    git -C "$REPO" pull --rebase origin "$BRANCH" && git -C "$REPO" push origin "$BRANCH"
    ;;
  history-push)
    expected_branch="${1:-}"; expected_tag="${2:-}"
    [ $# -eq 2 ] || { echo "用法: gitee.sh history-push <expected-master-oid> <expected-v1.1.1-oid>" >&2; exit 1; }
    case "$expected_branch$expected_tag" in
      *[!0-9a-f]*|'') echo "预期对象 ID 必须是完整的小写十六进制 Git OID。" >&2; exit 1 ;;
    esac
    [ "${#expected_branch}" -eq 40 ] && [ "${#expected_tag}" -eq 40 ] || {
      echo "预期对象 ID 必须是完整的 40 位 Git OID。" >&2; exit 1;
    }
    [ -z "$(git -C "$REPO" status --porcelain)" ] || { echo "工作区不干净，拒绝历史推送。" >&2; exit 1; }
    [ "$(git -C "$REPO" config --local user.name)" = "$EXPECTED_NAME" ] && \
      [ "$(git -C "$REPO" config --local user.email)" = "$EXPECTED_EMAIL" ] || {
        echo "仓库提交身份不是 $EXPECTED_NAME <$EXPECTED_EMAIL>，拒绝历史推送。" >&2; exit 1;
      }
    for ref in "refs/heads/$BRANCH" refs/tags/v1.1.1 refs/tags/v1.1.2; do
      git -C "$REPO" show-ref --verify --quiet "$ref" || { echo "缺少待发布引用: $ref" >&2; exit 1; }
    done
    if git -C "$REPO" log "$BRANCH" refs/tags/v1.1.1 refs/tags/v1.1.2 \
      --format='%an <%ae>%n%cn <%ce>' | grep -Eiq 'chenyu892323060|chenyu892323060@(gmail\.com|users\.noreply\.gitee\.com)'; then
      echo "待发布历史仍包含旧身份，拒绝推送。" >&2
      exit 1
    fi
    git -C "$REPO" push --atomic origin \
      --force-with-lease="refs/heads/$BRANCH:$expected_branch" \
      --force-with-lease="refs/tags/v1.1.1:$expected_tag" \
      "refs/heads/$BRANCH:refs/heads/$BRANCH" \
      refs/tags/v1.1.1:refs/tags/v1.1.1 \
      refs/tags/v1.1.2:refs/tags/v1.1.2
    ;;
  api)
    path="${1:-/user}"; t="$(need_token)" || exit 1
    resp="$(api_curl "$t" -s -m 15 -w '\n%{http_code}' "$API${path}")"
    code="$(printf '%s' "$resp" | tail -n1)"
    [ "$code" = "200" ] || echo "⚠ gitee API HTTP $code（临时故障或路径/权限问题，可重试）" >&2
    printf '%s\n' "$resp" | head -n -1
    ;;
  create-private)
    repo_name="${1:-}"; description="${2:-}"
    [ -n "$repo_name" ] || { echo "用法: gitee.sh create-private <repo-name> [description]" >&2; exit 1; }
    case "$repo_name" in *[!A-Za-z0-9._-]*|'') echo "仓库名仅允许字母、数字、点、下划线和连字符。" >&2; exit 1;; esac
    t="$(need_token)" || exit 1
    resp="$(api_curl "$t" -sS -m 30 -w '\n%{http_code}' -X POST "$API/user/repos" \
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
    api_curl "$t" -s -m 15 "$API/repos/$OWNER/$NAME" | python -c "import sys,json
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
gitee.sh — 公开仓库 $OWNER/$NAME 助手
  setup           在本地终端隐藏读取并保存 Gitee Personal Access Token
  check           将本地仓库内所有 skill 同步到运行时（不访问远端）
  status          工作区状态 + 各 skill 版本 + 与本地缓存远端引用的领先/落后
  pull            git pull --rebase
  push [msg]      add + commit + rebase + push
  history-push <expected-master-oid> <expected-v1.1.1-oid>
                  校验身份与远端租约后，原子更新重写的 master 和版本标签
  api <path>      调 gitee REST API（带 token），如：api /repos/$OWNER/$NAME/commits
  info            仓库基本信息摘要
  create-private <name> [description]  创建一个初始化的私有仓库
EOF
    ;;
esac
