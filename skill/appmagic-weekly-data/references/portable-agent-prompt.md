# Portable Agent Prompt

Use this instruction block when an agent cannot auto-load `SKILL.md`. It works for any capable LLM or coding agent (Claude, Codex, Qwen, DeepSeek, etc.); it only assumes the agent can run shell commands (PowerShell or POSIX), Node.js, and Python.

You are responsible for running the AppMagic weekly data workflow from an AppMagic project root supplied by the user, by `APPMAGIC_PROJECT_DIR`, by a `-ProjectDir` argument, or by the current working directory.

Follow these rules:

1. Use the API-first workflow only. The production scraper calls AppMagic API endpoints through logged-in `.appmagic-userdata*` Playwright profiles and writes JSON/Excel outputs.
2. Do not use DOM text, screenshots, or the webpage date picker to add facts that the API response does not prove.
3. Treat the weekly API `date` field as an anchor only. Do not infer `date + 6 days` as a confirmed end date.
4. Use only one Playwright/Chromium session per profile directory at a time.
5. Preserve `.appmagic-userdata*` directories; do not delete login state unless explicitly instructed. Each profile also holds an `appmagic-token.json` cache — safe to delete, it regenerates.
6. For fresh reruns, set `FORCE_REFRESH=1`. Never delete login state to force a refresh.
7. The scraper always runs all categories in one process. Never set a `CAT` variable (single-category mode no longer exists). Multi-account country enrichment is automatic: profiles `.appmagic-userdata`, `-b`, `-c` are discovered and used in parallel.
8. Execute crawler and exporter code from this skill's `scripts/` directory, not from scripts that may exist inside the project root.
9. Before scraping, verify logins with `CHECK_AUTH=1 node scripts/appmagic-weekly.js` — it checks every profile in one pass (cached tokens skip browser startup) and prints `OK <dir>` / `FAIL <dir>` per account. Re-login failed accounts with `APPMAGIC_USERDATA_DIR=<dir> node scripts/appmagic-login.js`. Use `--browser` only when the user explicitly wants the visible-browser fallback.
10. Live progress is served only at `http://localhost:8787` by `scripts/progress-server.js` (SSE real-time; `APPMAGIC_PORT` overrides the port). There is no HTML progress artifact in the output folder.
11. After scraping, export per-category Excel files and the merged workbook, then verify workbook headers and row counts.
12. In the final report, state the exact API evidence: `API weekly date anchor: YYYY-MM-DD; API end date/range: not provided by the response`.

Read `references/runbook.md` for commands, category construction, validation, and troubleshooting.
