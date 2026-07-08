#!/bin/bash
# 归档脚本：将 output/ 中超过 7 天未修改的输出文件移至 archived/
# 按文件扩展名自动分配到 archived/ 对应子目录
# 只归档输出产物，不碰环境文件（.exe/.dll/.venv/.git/node_modules 等）
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

DRY_RUN="${DRY_RUN:-0}"
DAYS="${DAYS:-7}"
CUTOFF=$(date -d "$DAYS days ago" +%s 2>/dev/null || echo 0)

# 扩展名 → archived 子目录映射
declare -A EXT_MAP=(
  [json]=data    [xlsx]=xlsx    [md]=markdown
  [png]=image    [jpg]=image    [svg]=image
  [py]=scripts   [js]=scripts   [sh]=scripts
  [txt]=data     [csv]=data     [opml]=data
  [pdf]=data     [pptx]=data    [docx]=docx
  [html]=code    [css]=code     [yaml]=data
  [yml]=data
)

# 绝对禁止归档的扩展名（环境/可执行文件）
BLACKLIST_EXTS="exe dll so bin pyc pyd class jar war ear"
# 禁止归档的目录名（环境目录）
BLACKLIST_DIRS=".git .venv node_modules __pycache__ repos env venv .idea .vscode"

is_blacklisted() {
  local f="$1"
  local name="${f##*/}"
  local ext="${name##*.}"

  # 检查扩展名黑名单
  for be in $BLACKLIST_EXTS; do
    [[ "$ext" == "$be" ]] && return 0
  done

  # 检查路径中是否有黑名单目录
  for bd in $BLACKLIST_DIRS; do
    [[ "$f" == */"$bd"/* || "$f" == */"$bd" ]] && return 0
  done

  return 1
}

is_old() {
  local f="$1"
  local mtime
  mtime=$(stat -c %Y "$f" 2>/dev/null || echo 0)
  [[ "$mtime" -lt "$CUTOFF" ]]
}

get_ext() {
  local f="$1"
  local name="${f##*/}"
  [[ "$name" == *.* ]] && echo "${name##*.}" || echo "noext"
}

archive_file() {
  local src="$1"
  local ext
  ext=$(get_ext "$src")
  local sub="${EXT_MAP[$ext]:-data}"
  local dst="archived/${sub}/$(basename "$src")"

  # 跳过环境/系统文件
  is_blacklisted "$src" && return
  # 跳过占位文件
  [[ "$(basename "$src")" == ".gitkeep" ]] && return
  # 跳过已在 archived 中的文件
  [[ "$src" == archived/* ]] && return
  # 跳过目录
  [[ -d "$src" ]] && return
  # 跳过非映射扩展名（不在 EXT_MAP 中则不处理）
  [[ -z "${EXT_MAP[$ext]:-}" ]] && return

  [[ -f "$dst" ]] && { echo "  ⏭  skip (exists): $dst"; return; }

  mkdir -p "archived/${sub}"

  if [[ "$DRY_RUN" == "1" ]]; then
    echo "  [DRY] $src → $dst"
  else
    if git ls-files --error-unmatch "$src" &>/dev/null; then
      git mv "$src" "$dst" 2>/dev/null || { mv "$src" "$dst"; }
    else
      mv "$src" "$dst"
    fi
    echo "  ✔ $src → $dst"
  fi
}

echo "=== 归档 >${DAYS} 天未修改的输出文件（截止 $(date -d "$DAYS days ago" +%F 2>/dev/null || echo "N/A")）==="
echo "DRY_RUN=$DRY_RUN | 禁止归档: $BLACKLIST_EXTS | 排除目录: $BLACKLIST_DIRS"
echo ""

count=0
skipped=0
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  if is_blacklisted "$f"; then
    skipped=$((skipped + 1))
    continue
  fi
  if is_old "$f"; then
    archive_file "$f"
    count=$((count + 1))
  fi
done < <(find output -type f \( -name "*.json" -o -name "*.md" -o -name "*.xlsx" -o -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.js" -o -name "*.py" -o -name "*.txt" -o -name "*.pptx" -o -name "*.docx" -o -name "*.opml" -o -name "*.csv" -o -name "*.yaml" -o -name "*.yml" -o -name "*.html" -o -name "*.css" -o -name "*.pdf" \) 2>/dev/null)

echo ""
echo "=== 完成（移动 $count 个文件，跳过 $skipped 个环境文件）==="
