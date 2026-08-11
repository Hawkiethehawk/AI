#!/usr/bin/env bash
# AMDC 一键部署脚本
# 用法:
#   curl -fsSL https://gitee.com/Hawkiethehawk/AMDC/raw/master/scripts/deploy.sh | bash
#   或: bash scripts/deploy.sh  (在已克隆的仓库内)
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
err()   { echo -e "${RED}[✗]${NC} $*"; }

REPO_URL="https://gitee.com/Hawkiethehawk/AMDC.git"
INSTALL_DIR="${AMDC_INSTALL_DIR:-$PWD}"

echo "============================================"
echo "  AMDC 一键部署"
echo "  安装目录: $INSTALL_DIR"
echo "============================================"
echo ""

# ── 1. 克隆 ──
if [ -f "$INSTALL_DIR/am.js" ]; then
  info "仓库已存在，跳过克隆"
elif [ -d "$INSTALL_DIR/.git" ]; then
  info "检测到 git 仓库"
  # 确保是 AMDC 仓库
  REMOTE=$(git -C "$INSTALL_DIR" remote get-url origin 2>/dev/null || echo "")
  if echo "$REMOTE" | grep -qi amdc; then
    info "确认 AMDC 仓库"
  else
    warn "当前目录非 AMDC 仓库，克隆到子目录..."
    git clone "$REPO_URL" "$INSTALL_DIR/AMDC"
    INSTALL_DIR="$INSTALL_DIR/AMDC"
  fi
else
  info "克隆仓库到当前目录..."
  # 如果当前目录非空或为根目录，克隆到子目录
  if [ "$INSTALL_DIR" = "/" ] || [ -n "$(ls -A "$INSTALL_DIR" 2>/dev/null)" ]; then
    INSTALL_DIR="$INSTALL_DIR/AMDC"
    info "将安装到: $INSTALL_DIR"
  fi
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# ── 2. 系统依赖 ──
info "检查 Chromium 系统依赖..."
MISSING=""
for lib in libnspr4 libnss3 libasound2; do
  if ! dpkg -l "$lib" 2>/dev/null | grep -q '^ii'; then
    MISSING="$MISSING $lib"
  fi
done
if [ -n "$MISSING" ]; then
  warn "缺少依赖:$MISSING"
  if [ "$(id -u)" -eq 0 ]; then
    apt install -y $MISSING
  elif command -v sudo &>/dev/null; then
    echo "  需要 sudo 权限安装系统库..."
    sudo apt install -y $MISSING
  else
    err "无法安装系统依赖。请手动执行: apt install -y$MISSING"
    exit 1
  fi
else
  info "系统依赖已满足"
fi

# ── 3. Node 依赖 ──
info "安装 Node 依赖..."
npm install
info "MiSans 本地字体已随项目就绪"

# ── 4. 全局 CLI ──
info "注册全局 amdc 命令..."
npm link 2>/dev/null || true
hash -r 2>/dev/null || true

# ── 5. Python 依赖 ──
info "安装 openpyxl..."
if python3 -c "import openpyxl" 2>/dev/null; then
  info "openpyxl 已安装"
else
  pip install --break-system-packages openpyxl 2>/dev/null || \
  pip install --user openpyxl 2>/dev/null || \
  warn "openpyxl 安装失败，Excel 导出不可用。手动: pip install --break-system-packages openpyxl"
fi

# ── 6. 验证 ──
echo ""
echo "============================================"
info "部署完成！"
echo "============================================"
echo ""
echo "  amdc 路径 : $(which amdc 2>/dev/null || echo '需要新开终端')"
echo "  项目目录 : $INSTALL_DIR"
echo "  Dashboard: amdc dashboard  (Windows 8787 / WSL 8788)"
echo ""
echo "  下一步 — 登录账号（逐个执行）:"
echo "    AMDC_EMAIL=账号@邮箱.com amdc login"
echo "    AMDC_EMAIL=账号@邮箱.com AMDC_USERDATA_DIR=.amdc-userdata-b amdc login"
echo "    ... (6个 profile a-f)"
echo ""
echo "  或查看状态: amdc status"
