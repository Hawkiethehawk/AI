#!/bin/bash
# 归档脚本：将 output/ 和 scripts/ 中超过 7 天未修改的文件移至 archived/
# 按文件扩展名自动分配到 archived/ 对应子目录
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

  [[ "$(basename "$src")" == ".gitkeep" ]] && return
  [[ "$src" == archived/* ]] && return
  [[ "$src" == .git/* ]] && return
  [[ -d "$src" ]] && return

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

echo "=== 归档 >${DAYS} 天未修改的文件（截止 $(date -d "$DAYS days ago" +%F 2>/dev/null || echo "N/A")）==="
echo "DRY_RUN=$DRY_RUN | CUTOFF=$CUTOFF"
echo ""

count=0
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  if is_old "$f"; then
    archive_file "$f"
    count=$((count + 1))
  fi
done < <(find output scripts -type f \( -name "*.json" -o -name "*.md" -o -name "*.xlsx" -o -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.js" -o -name "*.py" -o -name "*.txt" -o -name "*.pptx" -o -name "*.docx" -o -name "*.opml" -o -name "*.csv" -o -name "*.yaml" -o -name "*.yml" -o -name "*.html" -o -name "*.css" -o -name "*.pdf" \) 2>/dev/null)

echo ""
echo "=== 完成（移动 $count 个文件）==="
