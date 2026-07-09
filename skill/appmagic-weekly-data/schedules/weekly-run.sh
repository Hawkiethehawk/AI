#!/bin/bash
# AppMagic Weekly Run — Linux cron wrapper
# 用法: crontab -e 添加:
#   0 9 * * 1 /path/to/schedules/weekly-run.sh
#
# 或自动安装:
#   (crontab -l 2>/dev/null; echo "0 9 * * 1 /path/to/schedules/weekly-run.sh") | crontab -

set -e

# === 配置（修改为实际路径）===
PROJECT_DIR="${APPMAGIC_PROJECT_DIR:-/path/to/your/appmagic-project}"
NODE_BIN="${NODE_BIN:-node}"
LOG_DIR="${PROJECT_DIR}/logs"
RETENTION_DAYS=30

# === 日志 ===
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/appmagic-$(date +%Y%m%d-%H%M%S).log"

# === 执行 ===
echo "=== AppMagic Weekly Run ===" | tee -a "$LOG_FILE"
echo "Start: $(date)" | tee -a "$LOG_FILE"
echo "Project: $PROJECT_DIR" | tee -a "$LOG_FILE"

cd "$PROJECT_DIR"
"$NODE_BIN" appmagic.js run >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

echo "Exit: $EXIT_CODE at $(date)" | tee -a "$LOG_FILE"

# === 清理旧日志 ===
find "$LOG_DIR" -name "appmagic-*.log" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

exit $EXIT_CODE
