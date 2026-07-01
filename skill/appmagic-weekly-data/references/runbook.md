# AppMagic Weekly Data Runbook

This runbook is deliberately ASCII-safe in executable snippets. Build non-ASCII category names from Unicode code points so it works across Codex, Claude, PowerShell, and terminals with different encodings.

## Prerequisites

Install these once. `$SkillRoot` is this skill's root directory.

- **Node.js + Playwright.** The scraper/login scripts `require('@playwright/test')`. Node resolves modules upward from the script's folder, so install them under `$SkillRoot` (the skill lives in `~/.claude/skills/...`, a different tree from the project root — installing only in the project will not be found).

  ```powershell
  Set-Location $SkillRoot
  npm install @playwright/test
  npx playwright install chromium
  ```

- **Python + openpyxl.** The exporters need it:

  ```powershell
  pip install openpyxl
  ```

- **Login profile.** Authenticated calls need `.appmagic-userdata` in the project root. See "Login / Re-login" below.

- **Optional tags dictionary.** `output\data\appmagic-tags-full.json` is an optional array dump of AppMagic's full tag taxonomy. If present, products that come back with empty `tags` get their category Tag-path backfilled from it. If absent, that backfill is silently skipped and those rows show a blank Tag path — the main workflow is unaffected. The skill does not generate this file; supply it only if you need the backfill.

> Do not commit `node_modules/` or `.appmagic-userdata/` to the repo. They are environment-local.

## Paths

- Project: the AppMagic project root supplied by `APPMAGIC_PROJECT_DIR`, `-ProjectDir`, or the current working directory
- Scraper: this skill's `scripts\appmagic-weekly.js`
- Per-category Excel exporter: this skill's `scripts\appmagic_xlsx.py`
- Merged Excel exporter: this skill's `scripts\appmagic_xlsx_merged.py`
- Login profile: `.appmagic-userdata`
- Output root (archived by week anchor): `output\AppMagic-<YYYYMMDD>\` — every week anchor gets its own folder; different anchors never overwrite each other. In the manual fallback snippets below, replace `output\data` / `output\xlsx` with `output\AppMagic-<YYYYMMDD>\data` / `...\xlsx`.
- JSON output: `output\AppMagic-<YYYYMMDD>\data\appmagic-<CAT>-weekly.json`
- Excel output: `output\AppMagic-<YYYYMMDD>\xlsx\AppMagic-<CAT>-<YYYYMMDD>.xlsx` and `...\xlsx\AppMagic-<YYYYMMDD>.xlsx`
- Progress dashboard: `output\AppMagic-<YYYYMMDD>\appmagic-progress.html` (auto-refresh 2s; double-click to open)

## Default Categories

Use these exact categories. The labels are shown as Unicode code points to avoid mojibake:

- `U+8D85 U+4F11 U+95F2` = Hypercasual category label
- `U+4F11 U+95F2` = Casual category label
- `Launcher`
- `U+6740 U+6BD2 U+8F6F U+4EF6 U+3001 U+6E05 U+7406` = Antivirus/Cleaner category label
- `U+6587 U+4EF6 U+6062 U+590D` = File Recovery category label
- `PDF U+9605 U+8BFB U+5668` = PDF Reader category label

In PowerShell, define them like this:

```powershell
function U([int[]]$codes) { -join ($codes | ForEach-Object { [char]$_ }) }
$cats = @(
  (U 0x8D85,0x4F11,0x95F2),
  (U 0x4F11,0x95F2),
  'Launcher',
  (U 0x6740,0x6BD2,0x8F6F,0x4EF6,0x3001,0x6E05,0x7406),
  (U 0x6587,0x4EF6,0x6062,0x590D),
  ('PDF' + (U 0x9605,0x8BFB,0x5668))
)
```

`CAT` must be an environment variable. Do not pass it as `node scripts\appmagic-weekly.js <cat>`.

## Login / Re-login

Login state lives in the project-root `.appmagic-userdata` Playwright profile. Establish or refresh it when this is the first run, or when the weekly API returns 401 / only 100 rows (token missing or expired).

```powershell
$SkillRoot = Resolve-Path <path-to-this-skill>
$env:APPMAGIC_PROJECT_DIR = (Resolve-Path .).Path
$env:APPMAGIC_EMAIL = "you@example.com"   # optional; pre-fills the email field
node (Join-Path $SkillRoot "scripts\appmagic-login.js")
```

A real (headed) browser window opens. Complete login manually (password, email code, or Google). The session is written to `.appmagic-userdata` live; once you confirm you are logged in, stop that process from the outside. Do not open a second Playwright session against the same profile while it runs. Never delete `.appmagic-userdata` unless you intend to re-login.

## Preflight

Run from the AppMagic project root:

```powershell
Set-Location $ProjectDir
Get-CimInstance Win32_Process |
  Where-Object {
    $_.CommandLine -like '*appmagic-weekly*' -or
    $_.CommandLine -like '*run_all*' -or
    $_.CommandLine -like '*appmagic-userdata*'
  } |
  Select-Object ProcessId,Name,CommandLine
```

If rerunning and these are stale AppMagic scraper/browser processes, stop only those AppMagic processes before opening another Playwright context.

## Fresh Single-Category Run

```powershell
$ProjectDir = Resolve-Path .
$SkillRoot = Resolve-Path <path-to-this-skill>
& (Join-Path $SkillRoot "scripts\run_appmagic_weekly.ps1") -ProjectDir $ProjectDir -WeekAnchor "YYYY-MM-DD" -Fresh -Categories @((U 0x8D85,0x4F11,0x95F2))
```

Use `FORCE_REFRESH=1` or `-Fresh` whenever the user says to clear cache, rerun from scratch, avoid old data, or not reuse yesterday's files.

Manual equivalent:

```powershell
Set-Location $ProjectDir
function U([int[]]$codes) { -join ($codes | ForEach-Object { [char]$_ }) }
$env:CAT = U 0x8D85,0x4F11,0x95F2
$env:WEEK_ANCHOR = "YYYY-MM-DD"
$env:FORCE_REFRESH = '1'
node (Join-Path $SkillRoot "scripts\appmagic-weekly.js")
Remove-Item Env:CAT -ErrorAction SilentlyContinue
Remove-Item Env:WEEK_ANCHOR -ErrorAction SilentlyContinue
Remove-Item Env:FORCE_REFRESH -ErrorAction SilentlyContinue
```

## Fresh All-Category Run

```powershell
$ProjectDir = Resolve-Path .
$SkillRoot = Resolve-Path <path-to-this-skill>
& (Join-Path $SkillRoot "scripts\run_appmagic_weekly.ps1") -ProjectDir $ProjectDir -WeekAnchor "YYYY-MM-DD" -Fresh
```

Manual equivalent:

```powershell
Set-Location $ProjectDir
function U([int[]]$codes) { -join ($codes | ForEach-Object { [char]$_ }) }
$cats = @(
  (U 0x8D85,0x4F11,0x95F2),
  (U 0x4F11,0x95F2),
  'Launcher',
  (U 0x6740,0x6BD2,0x8F6F,0x4EF6,0x3001,0x6E05,0x7406),
  (U 0x6587,0x4EF6,0x6062,0x590D),
  ('PDF' + (U 0x9605,0x8BFB,0x5668))
)
$env:FORCE_REFRESH = '1'
$env:WEEK_ANCHOR = "YYYY-MM-DD"
foreach ($cat in $cats) {
  $env:CAT = $cat
  node (Join-Path $SkillRoot "scripts\appmagic-weekly.js")
  if ($LASTEXITCODE -ne 0) { throw "AppMagic scrape failed for $cat" }
}
Remove-Item Env:CAT -ErrorAction SilentlyContinue
Remove-Item Env:WEEK_ANCHOR -ErrorAction SilentlyContinue
Remove-Item Env:FORCE_REFRESH -ErrorAction SilentlyContinue
```

## Excel Export

```powershell
$ProjectDir = Resolve-Path .
$SkillRoot = Resolve-Path <path-to-this-skill>
& (Join-Path $SkillRoot "scripts\run_appmagic_weekly.ps1") -ProjectDir $ProjectDir -ExportOnly
```

Manual equivalent:

```powershell
Set-Location $ProjectDir
function U([int[]]$codes) { -join ($codes | ForEach-Object { [char]$_ }) }
$cats = @(
  (U 0x8D85,0x4F11,0x95F2),
  (U 0x4F11,0x95F2),
  'Launcher',
  (U 0x6740,0x6BD2,0x8F6F,0x4EF6,0x3001,0x6E05,0x7406),
  (U 0x6587,0x4EF6,0x6062,0x590D),
  ('PDF' + (U 0x9605,0x8BFB,0x5668))
)
foreach ($cat in $cats) {
  if (Test-Path "output\data\appmagic-$cat-weekly.json") {
    python (Join-Path $SkillRoot "scripts\appmagic_xlsx.py") $cat
  }
}
python (Join-Path $SkillRoot "scripts\appmagic_xlsx_merged.py")
```

## Validation

If code was edited:

```powershell
node --check (Join-Path $SkillRoot "scripts\appmagic-weekly.js")
python -m py_compile (Join-Path $SkillRoot "scripts\appmagic_xlsx.py") (Join-Path $SkillRoot "scripts\appmagic_xlsx_merged.py")
```

Read workbook headers and counts:

```powershell
@'
from pathlib import Path
from openpyxl import load_workbook
for path in sorted(Path("output/xlsx").glob("AppMagic*202*.xlsx")):
    ws = load_workbook(path, read_only=True).active
    print(path)
    print("sheet=", ws.title, "rows=", ws.max_row, "cols=", ws.max_column)
    print("A1=", ws["A1"].value)
    print("A2=", ws["A2"].value)
'@ | python -
```

## API Evidence Rule

The weekly ranking API used by the scraper is:

```text
/api/v2/top/united-apps?aggregation=week&topDepth=1000&store=5&country=WW&date=<anchor>&tag=<tag>
```

Known response evidence:

- Top-level `date` is the API week anchor.
- Top-level `data` contains ranking rows.
- The response does not provide an API-proven end date/range in the current workflow.

Therefore, report:

```text
API weekly date anchor: YYYY-MM-DD
API end date/range: not provided by the response
```

Do not report `YYYY-MM-DD to YYYY-MM-DD+6` as confirmed unless a future API response includes an explicit end/range field and the scraper captures it.

## Troubleshooting

- Login seems broken: first check profile contention. A second Playwright context can appear logged out while the real profile is locked by another scraper.
- API returns only 100 rows: check token presence and Authorization header. Authenticated top-depth should return 1000 rows for the weekly call.
- Country enrichment is missing: inspect logs for deterministic code errors before assuming rate limit.
- `data-countries` rate limiting: let the scraper backoff run; do not start extra browser diagnostics against the same profile while it runs.
- Partial category output: only final `appmagic-<CAT>-weekly.json` should be treated as complete input for Excel.
