---
name: appmagic-weekly-data
description: Run, rerun, verify, and export the AppMagic weekly data workflow for app ranking research. Use when the user asks to pull AppMagic data, rerun a weekly AppMagic job, clear/rebuild AppMagic caches, generate AppMagic Excel reports, check AppMagic login/API status, or explain whether a weekly AppMagic API result can prove its ending date.
---

# AppMagic Weekly Data

Use this skill from an AppMagic project root, or provide the project root through `APPMAGIC_PROJECT_DIR` / `-ProjectDir`.

This is a portable agent skill: any capable LLM or coding agent can follow it, including Codex, Claude, and other automation agents. The workflow is API-first. The production scraper calls AppMagic API endpoints through the persisted Playwright profile, then writes JSON and Excel files. Do not use DOM text, screenshots, or the date picker to add facts that the API response does not prove.

## Core Rules

- Treat `date` from `/api/v2/top/united-apps?aggregation=week...` as the API week anchor only.
- Do not infer or output an end date such as `anchor + 6 days` unless the API response itself contains an explicit end/range field.
- Do not mix DOM confirmation into API output. If the scrape path is API-only, keep reporting API-only evidence.
- Use exactly one Chromium/Playwright session against `.appmagic-userdata` at a time. Before diagnostics or reruns, check for existing AppMagic scraper/browser processes.
- Preserve `.appmagic-userdata`; it stores login state. Do not delete it unless the user explicitly asks and understands re-login is required.
- For a full fresh rerun, use `FORCE_REFRESH=1` instead of deleting login state.
- The scraper selects category by environment variable `CAT`; passing the category as a CLI argument does not select it.

## Workflow

1. Identify the requested week anchor and categories.
   - If the user says `0622`, use the relevant year from context and confirm as `YYYY-MM-DD` in the response.
   - If the user asks for "this week" or "last week", calculate the intended Monday anchor and state it explicitly before running.
   - If the year or category set is ambiguous and cannot be safely inferred, ask one concise question.

2. Inspect the current project state.
   - Read `scripts/appmagic-weekly.js` inside this skill for `WEEK_ANCHOR`, `WEEKS`, `CATS`, `FORCE_REFRESH`, and output paths.
   - Check whether any `appmagic-weekly`, `run_all`, or `.appmagic-userdata` Chromium process is running.
   - If a process is running and the user asked to rerun, stop only the AppMagic job processes needed to free the profile.

3. Configure the run.
   - Pass `WEEK_ANCHOR=YYYY-MM-DD` or `-WeekAnchor YYYY-MM-DD` when the requested week anchor differs from the current Monday.
   - Use `FORCE_REFRESH=1` for "clear cache", "fresh", "do not reuse", or date-sensitive reruns.
   - Use `LIST_ONLY=1` only when the user explicitly wants to skip slow country enrichment.

4. Run data collection.
   - Prefer this skill's `scripts\run_appmagic_weekly.ps1` entrypoint.
   - For one category manually: set `$env:CAT='<category>'`; then run this skill's `scripts\appmagic-weekly.js`.
   - For all default categories, iterate the known category labels and set `CAT` for each run.
   - Do not launch a second Playwright profile while the scraper is running; monitor logs and files instead.

5. Export Excel.
   - Run this skill's `scripts\appmagic_xlsx.py <category>` for each completed category JSON.
   - Run this skill's `scripts\appmagic_xlsx_merged.py` for the combined workbook.
   - If a category was interrupted before its final JSON was written, do not include it silently; report that it is excluded.

6. Verify and report.
   - Verify script syntax when code changed: `node --check scripts\appmagic-weekly.js` and `python -m py_compile scripts\appmagic_xlsx.py scripts\appmagic_xlsx_merged.py`.
   - Read Excel headers and row counts with `openpyxl` after export.
   - State the API evidence exactly: `API weekly date anchor: YYYY-MM-DD`.
   - State any unavailable evidence plainly, especially missing end-date/range fields.

For exact commands and troubleshooting, read [references/runbook.md](references/runbook.md). For agents that do not have native skill loading, read [references/portable-agent-prompt.md](references/portable-agent-prompt.md) as the reusable instruction block.

## Output Standard

Final reports should include:

- Week anchor used, e.g. `2026-06-22`.
- Evidence level, e.g. `API returned date=2026-06-22; no API end-date field`.
- Categories completed and skipped.
- Output workbook paths.
- Whether caches were reused or bypassed.
- Any remaining risks, such as API rate limiting, login/profile contention, or interrupted enrich steps.
