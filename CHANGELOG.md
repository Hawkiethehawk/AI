# Changelog

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
