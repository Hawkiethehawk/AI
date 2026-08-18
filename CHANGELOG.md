# Changelog

## wake-hawkie maintenance - 2026-08-15

Maintenance tag: `patch-20260815-054744`

### Changed

- Replace the retired Cudy TR3000 LuCI transport with a local Node Xiaobao web API call.
- Read the target and Node Xiaobao account or relay identifiers from a mode-`0600` external configuration file.
- Normalize the target MAC locally and validate both the API response and required dependencies before reporting success.
- Keep the skill generic so the AI layer only invokes the local command and checks its result.

### Validation

- Skill structure validation passed with `quick_validate.py`.
- Bash syntax validation passed on the Ubuntu runtime host.
- Failure-path validation reached the configured API transport without exposing credentials.
- A live Node Xiaobao WOL request was accepted with exit code `0`.
- Repository credential scan and diff-format checks passed.

## Maintenance 2026-08-18

### Changed

- Add the Xiaomi GetApps regional ranking collector under `apps/xiaomi-ranking-collector`.
- Add the `gadc` Skill under `skill/gadc` with device setup, collection workflow, metadata fallback, link validation, and export guidance.
- Normalize collector update dates to `yyyy/mm/dd`.

### Validation

- `python -m unittest discover -s tests -v` passed with 12 tests.
- GADC Skill structure validation passed with `quick_validate.py`.

Maintenance tag: `patch-20260818-170145`.

## version-manager 1.2 - 2026-08-13

### Changed

- Require every push to include a repository-level changelog update and a new immutable tag pointing to the pushed HEAD.
- Keep two-part versions: compatible feature or UI changes increment the minor version, breaking changes increment the major version, and patches do not change the version.
- Use `patch-YYYYMMDD-HHMMSS` maintenance tags for patch and non-versioned pushes.
- Require `scripts/gitee.sh publish` to receive and validate a version or maintenance tag, verify the root changelog, and atomically push the branch and tag.
- Expose changelog and maintenance-tag configuration in project inspection output.

### Validation

- Skill structure validation passed with `quick_validate.py`.
- Project profile JSON parsing passed.
- `version_inspect.py` syntax and execution checks passed.
- `scripts/gitee.sh` Bash syntax validation passed.
- Publishing without a tag was confirmed to fail.
- `git diff --check` passed.
