#!/usr/bin/env bash
set -euo pipefail
export PYTHONUTF8=1 PYTHONIOENCODING=utf-8

OWNER="Hawkiethehawk"
NAME="Monety"
BRANCH="master"
API="https://gitee.com/api/v5"
TOKEN_FILE="$HOME/.claude/.gitee_token"

read_token(){ [ -f "$TOKEN_FILE" ] && tr -d ' \r\n' < "$TOKEN_FILE"; }
need_token(){ local token; token="$(read_token)"; [ -n "$token" ] || { echo "Gitee token is not configured" >&2; exit 1; }; printf '%s' "$token"; }
auth_repo_url(){ local token; token="$(need_token)"; printf 'https://oauth2:%s@gitee.com/%s/%s.git' "$token" "$OWNER" "$NAME"; }

case "${1:-}" in
  create)
    token="$(need_token)"
    response="$(curl -sS -m 30 -w '\n%{http_code}' -X POST "$API/user/repos" \
      --data-urlencode "access_token=$token" \
      --data-urlencode "name=$NAME" \
      --data-urlencode 'description=Monety：以 IAA 为主线、按需 IAP 的应用商业化设计、TopOn 报表分析与 Open API 只读采集 Skill' \
      --data-urlencode 'private=false' \
      --data-urlencode 'auto_init=true')"
    code="$(printf '%s' "$response" | tail -n1)"
    body="$(printf '%s\n' "$response" | head -n -1)"
    [ "$code" = "201" ] || { echo "Repository creation failed: HTTP $code" >&2; printf '%s\n' "$body" >&2; exit 1; }
    printf '%s\n' "$body" | python -c "import sys,json; d=json.load(sys.stdin); print(d.get('full_name')); print(d.get('html_url'))"
    ;;
  clone)
    target="${2:?target path required}"
    if [ -d "$target/.git" ]; then
      git -C "$target" fetch "$(auth_repo_url)" "$BRANCH"
      git -C "$target" checkout -B "$BRANCH" FETCH_HEAD
    else
      git clone "$(auth_repo_url)" "$target"
    fi
    git -C "$target" remote set-url origin "https://gitee.com/$OWNER/$NAME.git"
    ;;
  push)
    repo="${2:?repo path required}"
    message="${3:-Publish Monety skill}"
    publish_paths=()
    for path in .gitignore README.md LICENSE monety topn-open-api; do
      if [ -e "$repo/$path" ] || git -C "$repo" ls-files --error-unmatch "$path" >/dev/null 2>&1; then
        publish_paths+=("$path")
      fi
    done
    git -C "$repo" add -A -- "${publish_paths[@]}"
    if ! git -C "$repo" diff --cached --quiet; then
      git -C "$repo" commit -m "$message"
    fi
    git -C "$repo" pull --rebase "$(auth_repo_url)" "$BRANCH"
    git -C "$repo" push "$(auth_repo_url)" "$BRANCH"
    ;;
  info)
    token="$(need_token)"
    curl -sS -m 20 "$API/repos/$OWNER/$NAME?access_token=$token" | python -c "import sys,json; d=json.load(sys.stdin); print(json.dumps({'full_name':d.get('full_name'),'private':d.get('private'),'default_branch':d.get('default_branch'),'html_url':d.get('html_url')},ensure_ascii=False))"
    ;;
  *)
    echo "usage: gitee.sh create|clone <target>|push <repo> [message]|info" >&2
    exit 1
    ;;
esac
