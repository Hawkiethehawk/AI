#!/usr/bin/env bash
# gitee.sh — 仓库 Hawkiethehawk/AI 的 Gitee 适配器（配套 version-manager skill）
# 一次性 setup token -> 保存到 ~/.claude/.gitee_token（供 REST API 使用）。
# git push/pull 沿用系统已配的凭证（已免密），本脚本不改动它。
set -u
export PYTHONUTF8=1 PYTHONIOENCODING=utf-8   # 让 python 的 stdin/stdout 统一走 UTF-8（Windows 默认 GBK 会乱码）

SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SELF/.." && pwd -P)"
TOKEN_FILE="$HOME/.claude/.gitee_token"
OWNER="Hawkiethehawk"; NAME="AI"; BRANCH="master"
API="https://gitee.com/api/v5"

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
versions(){
  local d version
  for d in "$REPO"/skill/*/; do
    [ -f "$d/SKILL.md" ] || continue
    version="$(grep -m1 -E '^[[:space:]]*version:' "$d/SKILL.md" | awk '{print $2}')"
    printf '  %-26s %s\n' "$(basename "$d")" "${version:-未声明}"
  done
}
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
  commit)
    [ $# -ge 2 ] || { echo "用法: gitee.sh commit <message> <path>..." >&2; exit 1; }
    msg="$1"; shift
    [ -n "$msg" ] || { echo "提交信息不能为空。" >&2; exit 1; }
    [ -z "$(git -C "$REPO" diff --cached --name-only)" ] || {
      echo "暂存区已有内容，拒绝隐式混入提交。请先处理现有 staged 文件。" >&2
      exit 1
    }
    add_targets=()
    for path in "$@"; do
      case "$path" in
        :*|/*|[A-Za-z]:*|../*|*/../*|*/..|..)
          echo "提交路径必须是仓库内的相对路径: $path" >&2
          exit 1
          ;;
      esac
      add_targets+=(":(literal)$path")
    done
    git -C "$REPO" add -A -- "${add_targets[@]}" || exit 1
    if git -C "$REPO" diff --cached --quiet; then
      echo "无改动可提交。" >&2
      exit 1
    fi
    echo "== 待提交文件 =="
    git -C "$REPO" diff --cached --name-status
    git -C "$REPO" commit -m "$msg"
    ;;
  publish)
    [ $# -le 1 ] || { echo "用法: gitee.sh publish [<component>-vX.Y.Z]" >&2; exit 1; }
    tag="${1:-}"
    [ -z "$(git -C "$REPO" diff --cached --name-only)" ] || { echo "暂存区不为空，拒绝发布。" >&2; exit 1; }
    if [ -n "$(git -C "$REPO" status --porcelain)" ]; then
      echo "== 保留但不纳入发布的工作区改动 =="
      git -C "$REPO" status --short
    fi
    [ "$(git -C "$REPO" branch --show-current)" = "$BRANCH" ] || {
      echo "当前分支不是 $BRANCH，拒绝发布。" >&2
      exit 1
    }
    if [ -n "$tag" ] && ! printf '%s\n' "$tag" | grep -Eq '^[a-z0-9][a-z0-9-]*-v[0-9]+\.[0-9]+\.[0-9]+$'; then
      echo "组件标签必须使用 <component>-vX.Y.Z 格式。" >&2
      exit 1
    fi
    git -C "$REPO" fetch origin "$BRANCH" || exit 1
    git -C "$REPO" merge-base --is-ancestor "origin/$BRANCH" HEAD || {
      echo "远端 $BRANCH 含本地尚未整合的提交，拒绝发布。请单独处理 rebase。" >&2
      exit 1
    }
    if [ -n "$tag" ]; then
      tag_oid="$(git -C "$REPO" rev-list -n 1 "$tag" 2>/dev/null)" || { echo "本地标签不存在: $tag" >&2; exit 1; }
      head_oid="$(git -C "$REPO" rev-parse HEAD)"
      [ "$tag_oid" = "$head_oid" ] || { echo "标签 $tag 不指向同步后的 HEAD，拒绝发布。" >&2; exit 1; }
      git -C "$REPO" push --atomic origin "refs/heads/$BRANCH:refs/heads/$BRANCH" "refs/tags/$tag:refs/tags/$tag"
    else
      git -C "$REPO" push origin "refs/heads/$BRANCH:refs/heads/$BRANCH"
    fi
    ;;
  push)
    echo "push 组合命令已停用。请分别使用 commit 和 publish，以便独立确认提交与远端发布。" >&2
    exit 2
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
gitee.sh — 公开仓库 $OWNER/$NAME 的 Gitee 适配器
  setup           在本地终端隐藏读取并保存 Gitee Personal Access Token
  check           将本地仓库内所有 skill 同步到运行时（不访问远端）
  status          工作区状态 + 各 skill 版本 + 与本地缓存远端引用的领先/落后
  pull            git pull --rebase
  commit <msg> <path>...
                  仅暂存明确路径并创建本地提交，不访问远端
  publish [<component>-vX.Y.Z]
                  暂存区为空时 fetch 并校验快进关系，再推送 master；可原子推送一个组件 HEAD 标签
                  未暂存的工作区改动会保留并报告，不纳入发布；不会自动 rebase 或 stash
  push            已停用；提交与发布必须分阶段执行
  api <path>      调 gitee REST API（带 token），如：api /repos/$OWNER/$NAME/commits
  info            仓库基本信息摘要
  create-private <name> [description]  创建一个初始化的私有仓库
EOF
    ;;
esac
