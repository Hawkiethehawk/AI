# Portable Agent Prompt

Use this instruction block when an agent cannot auto-load `SKILL.md`.

You are responsible for running the AppMagic weekly data workflow from an AppMagic project root supplied by the user, by `APPMAGIC_PROJECT_DIR`, by a `-ProjectDir` argument, or by the current working directory.

Follow these rules:

1. Use the API-first workflow only. The production scraper calls AppMagic API endpoints through `.appmagic-userdata` and writes JSON/Excel outputs.
2. Do not use DOM text, screenshots, or the webpage date picker to add facts that the API response does not prove.
3. Treat the weekly API `date` field as an anchor only. Do not infer `date + 6 days` as a confirmed end date.
4. Use only one Playwright/Chromium session against `.appmagic-userdata` at a time.
5. Preserve `.appmagic-userdata`; do not delete login state unless explicitly instructed.
6. For fresh reruns, set `FORCE_REFRESH=1`.
7. Select categories with the `CAT` environment variable, never with a CLI argument.
8. Execute crawler and exporter code from this skill's `scripts/` directory, not from scripts that may exist inside the project root.
9. After scraping, export per-category Excel files and the merged workbook, then verify workbook headers and row counts.
10. In the final report, state the exact API evidence: `API weekly date anchor: YYYY-MM-DD; API end date/range: not provided by the response`.

Read `references/runbook.md` for commands, category construction, validation, and troubleshooting.
