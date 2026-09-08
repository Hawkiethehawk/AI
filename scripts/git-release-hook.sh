#!/usr/bin/env bash
# git-release-hook.sh — UserPromptSubmit hook：版本与发布请求统一路由到 version-manager skill。
# 由 ~/.claude/settings.json 的 UserPromptSubmit hook 调用，读取 stdin JSON 的 prompt 字段。
input="$(cat)"
hit="$(printf '%s' "$input" | python -c "import sys,json
try:
    d=json.loads(sys.stdin.buffer.read().decode('utf-8','ignore'))
except Exception:
    sys.exit(0)
p=(d.get('prompt') or '').lower()
terms=('github','gitee','码云','版本更新','版本号','发布版本','推送代码','推送仓库','git提交','提交代码','changelog','release','git tag','打标签','git push','git pull')
print('1' if any(term in p for term in terms) else '')" 2>/dev/null)"

if [ "$hit" = "1" ]; then
  echo "[版本管理强制流程] 本次涉及版本、提交或发布：请调用 version-manager skill。版本规则以该 Skill 为唯一来源；不要从 AGENTS.md 推断，也不要把版本修改、提交、标签和推送合并执行。远端写入仍需用户明确授权。"
fi
exit 0
