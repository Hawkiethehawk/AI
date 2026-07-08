---
name: appmagic-weekly-data
description: Run, rerun, verify, and export the AppMagic weekly data workflow for app ranking research. Use when the user asks to pull AppMagic data, rerun a weekly AppMagic job, clear/rebuild AppMagic caches, generate AppMagic Excel reports, check AppMagic login/API status, or explain whether a weekly AppMagic API result can prove its ending date.
---

# AppMagic Weekly Data

Use this skill from an AppMagic project root, or provide the project root through `APPMAGIC_PROJECT_DIR` / `-ProjectDir`.

Prerequisites (install once): Node.js + `@playwright/test` + Chromium, Python + `openpyxl`, and a logged-in `.appmagic-userdata` profile. See [references/runbook.md](references/runbook.md) sections "Prerequisites" and "Login / Re-login".

This is a portable agent skill: any capable LLM or coding agent can follow it, including Codex, Claude, and other automation agents. The workflow is API-first. The production scraper calls AppMagic API endpoints through the persisted Playwright profile, then writes JSON and Excel files. Do not use DOM text, screenshots, or the date picker to add facts that the API response does not prove.

## Local Defaults

- On this machine, use `E:\LLM-Sandbox\Codex` as the default AppMagic project root unless the user explicitly gives another `ProjectDir`.
- Keep AppMagic login profiles directly under the project root, using `.appmagic-userdata` and optional suffixed profiles such as `.appmagic-userdata-c` / `.appmagic-userdata-d`.

## Core Rules

- Treat `date` from `/api/v2/top/united-apps?aggregation=week...` as the API week anchor only.
- Do not infer or output an end date such as `anchor + 6 days` unless the API response itself contains an explicit end/range field.
- Do not mix DOM confirmation into API output. If the scrape path is API-only, keep reporting API-only evidence.
- Judge "first entered Top 100" from the displayed 6-week rank trajectory, not only from current rank or `diff`. The displayed trajectory is oldest-to-newest; an app can be tagged as first entered Top 100 only when the trajectory starts with three blanks: `· -> · -> · ->`, the current rank is `<= 100`, and none of the weeks before the current week were already `<= 100`. In code, `history` is stored newest-to-oldest, so this means `history.slice(-3)` must all be `null`, and `history.slice(1)` must not contain any value `<= 100`.
- Use exactly one Chromium/Playwright session per profile directory at a time. Before diagnostics or reruns, check for existing AppMagic scraper/browser processes against any `.appmagic-userdata*` profile.
- Preserve `.appmagic-userdata`; it stores login state. Do not delete it unless the user explicitly asks and understands re-login is required.
- If the weekly API returns 401 or only 100 rows, login is missing/expired. Re-establish it with `scripts\appmagic-login.js` (see runbook "Login / Re-login") before retrying; do not delete the profile.
- Each profile directory caches its token in `appmagic-token.json` (written after a successful API probe). A valid cache skips browser startup during preflight. Safe to delete; it regenerates on the next check.
- For a full fresh rerun, use `FORCE_REFRESH=1` instead of deleting login state.
- The scraper runs all categories in one process (path A). Do NOT set `CAT`. Leaderboards use the selected leader account; country/app enrichment (`data-countries` and app details) uses an app-level global task queue shared by 1-10 selected accounts. The account pool size is controlled by `APPMAGIC_ACCOUNTS`, and worker count is capped by `APPMAGIC_MAX_WORKERS` (default 10, min 1, max 10).

## Account / Email Rules

- Before every AppMagic data collection, identify the currently logged-in AppMagic profiles and their emails, then report the profile/email list to the user.
- The account pool must be email-deduplicated before running. Do not use two profiles with the same email as separate accounts.
- The dashboard account pool can delete duplicate-email secondary profiles. Deleting `.appmagic-userdata-b` compacts later managed profiles forward, e.g. old `-c` becomes `-b` and old `-d` becomes `-c`. Do not delete the primary `.appmagic-userdata` profile from this flow.
- If an email cannot be identified for a logged-in profile, treat that profile as unverified for deduplication; do not include it in a multi-account pool unless the user confirms the email.
- If another login is needed, explicitly tell the user which emails are already logged in and ask them not to log in with those emails again.
- When switching accounts after quota/rate-limit issues, prefer a profile with a unique email that has passed auth check.
- Login/auth checks use limited concurrency (`AUTH_CHECK_CONCURRENCY`, default 3, min 1, max 10). Reduce it to 1 if AppMagic or the local network is timing out; raise cautiously only when the machine and network are stable.
- Collection can start only when every selected account has just passed auth check (`state=ok` / dashboard status `有效`). A cached token alone is not enough; prompt the user to run login-state detection first.

### Profile Email Discovery / Dedup

Run this before every collection when more than one profile exists:

```powershell
$SkillRoot = Resolve-Path <path-to-this-skill>
$ProjectDir = Resolve-Path .
& (Join-Path $SkillRoot "scripts\appmagic_profile_emails.ps1") -ProjectDir $ProjectDir
```

Interpretation:

- `Status=OK` and empty `Duplicate` means the profile can be considered for the account pool.
- `Duplicate=DUPLICATE` means do not use both profiles. Keep one and skip the duplicate, or ask the user which one to keep.
- `Status=UNKNOWN` means the profile is logged in or cached in a way that did not expose an email locally; do not include it in a multi-account pool unless the user confirms the email.
- After deduplication, set `APPMAGIC_ACCOUNTS` explicitly with 1-10 profiles, e.g. `$env:APPMAGIC_ACCOUNTS = ".appmagic-userdata,.appmagic-userdata-c,.appmagic-userdata-d"`.

## Workflow

1. Identify the requested week anchor and categories.
   - **ALWAYS** verify the real system date and weekday first — Windows: `powershell -Command "(Get-Date).ToString('yyyy-MM-dd dddd')"`; POSIX: `date "+%Y-%m-%d %A"`. Never rely on memory or inference for today's date.
   - Derive the Monday anchor from the actual system date: `$d.AddDays(-((([int]$d.DayOfWeek)+6)%7))`.
   - If the user says `0622`, use the relevant year from context and confirm as `YYYY-MM-DD` in the response.
   - If the user asks for "this week", calculate the current Monday anchor and state it explicitly; omit `-WeekAnchor` so the entrypoint can auto-calculate the current week.
   - If the user asks for a non-current week such as "last week", `0629`, or a specific date, calculate/confirm the absolute Monday anchor, then pass `-WeekAnchor YYYY-MM-DD`.
   - If the year or category set is ambiguous and cannot be safely inferred, ask one concise question.

2. Inspect the current project state.
   - Check whether any `appmagic-weekly`, `run_all`, or `.appmagic-userdata` Chromium process is running.
   - If a process is running and the user asked to rerun, stop only the AppMagic job processes needed to free the profile.
   - Note: `WEEK_ANCHOR`, `CATS`, `FORCE_REFRESH` are runtime env vars, not hardcoded in the js file.
   - Run Profile Email Discovery / Dedup, report the profile/email list, and decide the exact account pool before configuring the run.

3. Configure the run.
   - Do NOT pass `-WeekAnchor` unless the user explicitly requests a specific non-current-week date. The script auto-calculates the correct Monday anchor.
   - Only pass `-WeekAnchor YYYY-MM-DD` when user says e.g. "run last week" or "run 0622".
   - Use `-Fresh` for "clear cache", "fresh", "do not reuse", or date-sensitive reruns.
   - Use `-ListOnly` only when the user explicitly wants to skip slow country enrichment.
   - AppMagic API date note: the API echoes back whatever date you pass, not necessarily Monday. Any date within the same week returns identical data. The anchor in output reflects the query date, not necessarily the week's Monday.
   - If multiple verified profiles exist, set `APPMAGIC_ACCOUNTS` to the deduplicated profile list before running; do not rely blindly on auto-discovery.

4. Run data collection (path A: one process runs all categories).
   - Prefer this skill's `scripts\run_appmagic_weekly.ps1` entrypoint — it self-checks each selected account before scraping; if any login state is invalid, it aborts and the user must recapture that account in dashboard settings.
   - If using a deduplicated account pool, export `APPMAGIC_ACCOUNTS` in the same shell/session before calling `run_appmagic_weekly.ps1`.
   - Live progress is served only at `http://localhost:8787` by `scripts\progress-server.js` (SSE real-time). There is no HTML progress artifact in the output folder.
   - The dashboard can start/stop the collection and clear weekly/enrich cache files while idle. Cache clearing must be disabled during active collection and never deletes login profiles.
   - The dashboard disables collection start until all selected profiles are `有效`; the server also rejects `/api/run/start` when selected profiles are only `cached`, missing, expired, or untested.
   - The scraper runs **all categories in one process**: one leader account collects every leaderboard, then 1-10 accounts collect country/app data **in parallel from a global app-level task queue**. **Do NOT set `CAT`** — single-category mode is gone.
   - Manual: `node scripts\appmagic-weekly.js` (with `WEEK_ANCHOR`/`FORCE_REFRESH` as needed); it iterates all categories itself.
   - Multi-account: log each account into its own profile (`.appmagic-userdata` / `-b` / `-c` ... up to 10 profiles) via `APPMAGIC_USERDATA_DIR`; the scraper auto-discovers every profile that has a token. Tune `AUTH_CHECK_CONCURRENCY` (login check concurrency, default 3) / `DC_GAP_MS` (per-app gap, default 500) / `DC_COOLDOWN_MS` (429 cooldown, default 120000) / `LEADERBOARD_WEEK_CONCURRENCY` (default 3) / `APPMAGIC_MAX_WORKERS` (default 10, max 10) / `APPMAGIC_ACCOUNTS`.

5. Export Excel.
   - Run this skill's `scripts\appmagic_xlsx.py <category>` for each completed category JSON.
   - Run this skill's `scripts\appmagic_xlsx_merged.py` for the combined workbook. It aborts if the per-category JSONs do not share one week anchor (prevents silently mixing weeks); align the stale category by rerunning it on the same `WEEK_ANCHOR`, or set `ALLOW_MIXED_WEEKS=1` to force-merge (the title is then marked as mixed-week).
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
- Profiles/emails used in the account pool.
- Profiles skipped because of duplicate or unknown email.
- Any remaining risks, such as API rate limiting, login/profile contention, or interrupted enrich steps.
