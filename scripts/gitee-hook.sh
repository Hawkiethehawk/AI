#!/usr/bin/env bash
# gitee-hook.sh — UserPromptSubmit hook：用户提到 gitee/码云 时，强制要求走 gitee-sync skill。
# 由 ~/.claude/settings.json 的 UserPromptSubmit hook 调用，读取 stdin JSON 的 prompt 字段。
input="$(cat)"
hit="$(printf '%s' "$input" | python -c "import sys,json
try:
    d=json.loads(sys.stdin.buffer.read().decode('utf-8','ignore'))
except Exception:
    sys.exit(0)
p=(d.get('prompt') or '').lower()
print('1' if ('gitee' in p or '码云' in p) else '')" 2>/dev/null)"

if [ "$hit" = "1" ]; then
  echo "[gitee 强制流程] 本次涉及 gitee/码云：请调用 gitee-sync skill 处理，不要绕过它手写零散的 git/curl。它会①先自检仓库内所有 skill 是否有更新并同步，②用已保存的 token 执行 push/pull/查询。若尚未配置 token，先引导用户运行 gitee.sh setup <token>（仅需一次）。"
fi
exit 0
