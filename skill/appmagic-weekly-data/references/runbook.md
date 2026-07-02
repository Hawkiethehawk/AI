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
- Output folder holds one subfolder per week anchor: `output\folder\AppMagic-<YYYYMMDD>\` — every week anchor gets its own folder; different anchors never overwrite each other. In the manual fallback snippets below, replace `output\data` / `output\xlsx` with `output\folder\AppMagic-<YYYYMMDD>`.
- JSON output: `output\folder\AppMagic-<YYYYMMDD>\appmagic-<CAT>-weekly.json`
- Excel output: `output\folder\AppMagic-<YYYYMMDD>\AppMagic-<CAT>-<YYYYMMDD>.xlsx` and `...\AppMagic-<YYYYMMDD>.xlsx`
- Progress dashboard: `output\folder\AppMagic-<YYYYMMDD>\appmagic-progress.html` (auto-refresh 2s; double-click to open)

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

The scraper runs **all categories in one process** (path A). Do NOT set `CAT` — the single-category mode is gone. The category code points above are still handy for reference / editing `CATS`.

## Login / Re-login (multi-account)

国别采集把品类分给多账号并行（配额按账号，约 100 次/窗口）。默认 3 账号，各登录到独立 profile：`.appmagic-userdata`(A，兼榜单账号) / `.appmagic-userdata-b` / `.appmagic-userdata-c`。

每个账号登录一次（`APPMAGIC_USERDATA_DIR` 指定 profile；脚本检测到登录成功会自动关闭窗口）：

```powershell
$SkillRoot = Resolve-Path <path-to-this-skill>
$env:APPMAGIC_PROJECT_DIR = (Resolve-Path .).Path
foreach ($p in '.appmagic-userdata','.appmagic-userdata-b','.appmagic-userdata-c') {
  $env:APPMAGIC_USERDATA_DIR = $p
  # $env:APPMAGIC_EMAIL = "acct@example.com"   # optional, pre-fills email
  node (Join-Path $SkillRoot "scripts\appmagic-login.js")   # headed, complete login manually
}
Remove-Item Env:APPMAGIC_USERDATA_DIR -ErrorAction SilentlyContinue
```

Token 是 opaque、数天会失效。正常无需手动登录：`run_appmagic_weekly.ps1` **采集前会逐账号自检、失效自动弹窗补登**。Token 存活期间长期复用。绝不删除 profile 目录，除非要重登。

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

If rerunning and these are stale AppMagic scraper/browser processes, stop them before opening another Playwright context.

## Run (path A: one process, all categories)

一次调用即可：node 内部 **A 采全部榜单 → 3 账号并行按品类分片采国别 → 写各品类 JSON**；`ps1` 先逐账号自检登录态（失效弹窗补登），采完再导出 Excel。

```powershell
$ProjectDir = Resolve-Path .
$SkillRoot = Resolve-Path <path-to-this-skill>
& (Join-Path $SkillRoot "scripts\run_appmagic_weekly.ps1") -ProjectDir $ProjectDir -WeekAnchor "YYYY-MM-DD" -Fresh
```

- `-WeekAnchor` 省略 = 本周一(UTC)。`-Fresh` / `FORCE_REFRESH=1` = 清缓存重拉。
- 环境变量：`APPMAGIC_ACCOUNTS`(逗号分隔 profile 列表，默认三账号) / `DC_GAP_MS`(每 app 国别间隔，默认 1000) / `DC_COOLDOWN_MS`(撞 429 冷却，默认 120000) / `LIST_ONLY=1`(只出榜单清单、跳过国别)。

Manual equivalent（直接 node，跑全部品类；**不要设 CAT**）:

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

`ps1` 内置：对每个有 JSON 的品类调 `appmagic_xlsx.py`，再用 `appmagic_xlsx_merged.py` 合并；均按周锚点定位 `output\folder\AppMagic-<YYYYMMDD>\`。

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
