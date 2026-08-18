---
name: gadc
description: Collect Xiaomi GetApps game-category rankings from a single connected Xiaomi phone after switching store regions, enrich each app with GetApps or Google Play metadata, validate links, and export or sync the results. Use when the user asks for regional GetApps rankings, category-level game collection, one-phone automation, or repeatable GADC runs.
---

# GADC

Use this skill to collect reproducible GetApps rankings from one Xiaomi Global-ROM phone. Keep each run independent, preserve the source ranking fields, and record the fallback source for metadata and links.

## Required Inputs

- Connected and unlocked Xiaomi phone with USB debugging authorized.
- ADB available on the host; GetApps installed and signed in or usable without sign-in.
- Target countries, region codes, game categories, and `Top N` (default 20).
- Chinese search terms are acceptable when the device search supports pinyin.

Default region codes: Brazil `BR`, Indonesia `ID`, Russia `RU`, Spain `ES`.

## Workflow

1. Create a run ID as `rank-yyyymmdd-01`; increment the suffix for another run on the same date. Never mix runs in one output.
2. For each country, set `com.xiaomi.market.lastRegion` with ADB, force-stop GetApps (`com.xiaomi.mipicks`), relaunch it, and wait for the store content to refresh. Use the visible Settings region flow only as a legacy-device fallback.
3. Open the **Games** top-level page. Locate the requested category at the same level as rankings. Prefer the official category tab bar. If it is missing (for example, Spain), use the category section exposed by scrolling the Games home page; do not substitute a ranking subpage.
4. Extract the first `Top N` items with small overlapping scrolls. Capture country, category, rank, app name, and package name from the app listing. Deduplicate by package name and require continuous ranks `1..N` before accepting the group.
5. Enrich metadata from the GetApps web detail page first. Use Google Play by package name only when GetApps is unavailable or the detail page cannot be reached. When the GP page is used, append `-gp` to the displayed app name.
6. Test every final app URL. Keep a hyperlink only when the endpoint is reachable. If GetApps fails and GP is reachable, use the GP URL; if both fail, keep the plain app name. Do not infer reachability from a redirect alone.
7. Keep these nine output columns: `地区、分类、排名、应用名、包名、评分、下载量、开发者、更新时间`. Normalize the update date as `yyyy/mm/dd`; leave rating blank when neither source exposes a public rating. Do not add run ID, ranking type, raw text, capture time, or third-party APK-site fields.
8. Export CSV and, when requested, write to the specified Feishu sheet. Preserve the original ranking sheet; put procedural notes in a separate strategy sheet.

## Quality Checks

- Every country/category group contains exactly `Top N` rows and ranks `1..N`.
- Package names are present and unique within a group; no app is silently duplicated.
- Count non-empty values for package, rating, downloads, developer, update date, and URL source.
- Re-read the exported file and any Feishu write. Check first, middle, and last rows plus hyperlink display names.
- Report unresolved apps and the reason (GetApps unavailable, GP unavailable, or metadata missing).

## Source Rules

- GetApps is the primary source for category membership and app links.
- Google Play is a metadata/link fallback keyed by package name; do not replace the GetApps ranking with a GP ranking.
- Do not use third-party APK sites or attempt to infer launch dates unless the user explicitly changes the scope.

For device commands, page selectors, URL patterns, and recovery procedures, read [references/workflow.md](references/workflow.md).
