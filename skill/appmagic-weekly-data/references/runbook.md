# AppMagic Weekly Data Runbook

This runbook keeps executable snippets ASCII-safe. Build non-ASCII category names from Unicode code points so commands survive different terminal encodings.

## Prerequisites

- Install Node.js dependencies under the skill root because the scripts resolve modules upward from their own folder:

  ```powershell
  Set-Location $SkillRoot
  npm install @playwright/test
  npx playwright install chromium
  ```

- Install Python exporter dependency:

  ```powershell
  pip install openpyxl
  ```

- Keep AppMagic login profiles in the project root: `.appmagic-userdata`, `.appmagic-userdata-b`, `.appmagic-userdata-c`.

- Optional taxonomy dictionary for empty-tag backfill: the scraper checks these locations in order:
  - `APPMAGIC_TAGS_DICT`
  - `output\folder\appmagic-tags-full.json`
  - `skill\appmagic-weekly-data\references\appmagic-tags-full.json`

  If none exists, the scraper logs a warning and empty-tag products keep a blank Tag path.

## Paths

- Project root: supplied by `APPMAGIC_PROJECT_DIR`, `-ProjectDir`, or the current working directory
- Scraper: `scripts\appmagic-weekly.js`
- Per-category exporter: `scripts\appmagic_xlsx.py`
- Merged exporter: `scripts\appmagic_xlsx_merged.py`
- Shared exporter helpers: `scripts\appmagic_xlsx_common.py`
- Weekly output folder: `output\folder\AppMagic-<YYYYMMDD>\`
- JSON output: `output\folder\AppMagic-<YYYYMMDD>\appmagic-<CAT>-weekly.json`
- Progress JSON: `output\folder\AppMagic-<YYYYMMDD>\appmagic-progress.json`
- Local dashboard: `http://localhost:8787`

## Default Categories

Use these exact categories:

- `U+8D85 U+4F11 U+95F2`
- `U+4F11 U+95F2`
- `Launcher`
- `U+6740 U+6BD2 U+8F6F U+4EF6 U+3001 U+6E05 U+7406`
- `U+6587 U+4EF6 U+6062 U+590D`
- `PDF U+9605 U+8BFB U+5668`

PowerShell helper:

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

The scraper always runs all categories in one process. Do not set `CAT`.

## Login / Re-login

Login once per profile:

```powershell
$SkillRoot = Resolve-Path <path-to-this-skill>
$env:APPMAGIC_PROJECT_DIR = (Resolve-Path .).Path
foreach ($p in '.appmagic-userdata','.appmagic-userdata-b','.appmagic-userdata-c') {
  $env:APPMAGIC_USERDATA_DIR = $p
  node (Join-Path $SkillRoot "scripts\appmagic-login.js")
}
Remove-Item Env:APPMAGIC_USERDATA_DIR -ErrorAction SilentlyContinue
```

`run_appmagic_weekly.ps1` still performs preflight auth checks, but `appmagic-weekly.js` now also probes token validity internally before scraping so direct `node` runs fail fast instead of quietly producing empty data.

## Run

Preferred entrypoint:

```powershell
$ProjectDir = Resolve-Path .
$SkillRoot = Resolve-Path <path-to-this-skill>
& (Join-Path $SkillRoot "scripts\run_appmagic_weekly.ps1") -ProjectDir $ProjectDir -WeekAnchor "YYYY-MM-DD" -Fresh
```

Notes:

- `-WeekAnchor` omitted means current UTC Monday.
- `-Fresh` or `FORCE_REFRESH=1` clears weekly/enrich cache reuse.
- `APPMAGIC_ACCOUNTS` overrides the default three profiles.
- `DC_GAP_MS` controls per-app enrichment spacing.
- `DC_COOLDOWN_MS` controls 429 cooldown length.
- `LIST_ONLY=1` skips country enrichment.
- The PowerShell entrypoint automatically starts the localhost dashboard.

Manual equivalent:

```powershell
Set-Location $ProjectDir
$env:APPMAGIC_PROJECT_DIR = $ProjectDir
$env:WEEK_ANCHOR = "YYYY-MM-DD"
$env:FORCE_REFRESH = '1'
node (Join-Path $SkillRoot "scripts\appmagic-weekly.js")
Remove-Item Env:WEEK_ANCHOR -ErrorAction SilentlyContinue
Remove-Item Env:FORCE_REFRESH -ErrorAction SilentlyContinue
```

## Excel Export

```powershell
$ProjectDir = Resolve-Path .
$SkillRoot = Resolve-Path <path-to-this-skill>
& (Join-Path $SkillRoot "scripts\run_appmagic_weekly.ps1") -ProjectDir $ProjectDir -ExportOnly
```

## Validation

If code was edited:

```powershell
node --check (Join-Path $SkillRoot "scripts\appmagic-weekly.js")
python -m py_compile `
  (Join-Path $SkillRoot "scripts\appmagic_xlsx_common.py") `
  (Join-Path $SkillRoot "scripts\appmagic_xlsx.py") `
  (Join-Path $SkillRoot "scripts\appmagic_xlsx_merged.py")
```

## API Evidence Rule

Weekly ranking API:

```text
/api/v2/top/united-apps?aggregation=week&topDepth=1000&store=5&country=WW&date=<anchor>&tag=<tag>
```

Report only:

```text
API weekly date anchor: YYYY-MM-DD
API end date/range: not provided by the response
```

## Troubleshooting

- Empty or failing leaderboards during direct `node` runs now usually mean the token probe failed before scrape start.
- Rating gaps are retried on both app-info 429 and transient network errors; remaining gaps are more likely real upstream absence.
- Progress files are throttled before writing, so the dashboard refresh cadence is smoother and the state file sees far fewer writes.
- Only final `appmagic-<CAT>-weekly.json` files should feed the exporters.
