# Changelog

## version-manager 1.3.0 - 2026-10-30

### Changed

- `skill/version-manager/SKILL.md`: 版本体系由两级 `主版本.次版本` 改为三级 `主版本.次版本.修订号`。Patch／缺陷修复递增修订号并照常发布（更新版本源、写 CHANGELOG 版本条目、打同版本标签）；功能更新递增次版本并把修订号归零；破坏性变更递增主版本并归零后两段。版本标签统一 `vX.Y.Z`，`patch-YYYYMMDD-HHMMSS` 维护标签只用于非版本对象。
- `skill/version-manager/references/project-profiles.md`、`references/github.md`: AI / AMTools / Monety 的标签与 Patch 规则同步为三级（`<skill-name>-vX.Y.Z`、`vX.Y.Z`）；`publish` 的标签参数改为 `<component>-vX.Y.Z`。
- `skill/version-manager/scripts/version_inspect.py`: `VERSION_RE` 收紧为 `^\d+\.\d+\.\d+$`，两级写法不再静默忽略而是明确报 `two-part version is no longer valid; migrate to X.Y.Z`；输出增加 `version format`。

### Validation

- `version_inspect.py --repo F:\AMTools` 读出 `1.0.1`（对应已推送标签 `v1.0.1`）；`--repo F:\Monety --project monety` 读出 `1.2.0`（对应已推送标签 `monety-v1.2.0`）。
- 解析自测：`1.2.3` 通过、`1.2` 返回迁移错误、非版本内容忽略；本 Skill 自身 `SKILL.md` 读出 `1.3.0`。
- `version_inspect.py` 语法解析通过，文本与 `--json` 输出正常，`version format` 行存在。
- 关联仓库迁移：AMTools `VERSION` `1.0` → `1.0.1`、README 同步，已推送 `v1.0.1`；Monety `monety/SKILL.md` `1.2` → `1.2.0`，已推送 `monety-v1.2.0`；ScrDrop `VERSION` `0.2` → `0.2.0`（本地非 Git 仓库，未推送）。

## wake-hawkie 0.1 - 2026-10-27

### Changed

- `skill/wake-hawkie/scripts/wake-hawkie`: detect `rtn=10109` (`E_LOGIN`) and automatically sign in with the credentials from the mode-`0600` local config, persist the refreshed `owcode`, then retry the wake request once; add `--refresh` for forced token renewal.
- `skill/wake-hawkie/SKILL.md`, `skill/wake-hawkie/README.md`: document the login-token lifecycle and automatic refresh behavior.
- `skill/wake-hawkie/.gitignore`: ignore `node-xiaobao.env`, `node-xiaobao-login.env`, `*.env`, and `env.local.md`.

### Validation

- `bash -n` passed on the bundled command.
- Live Node Xiaobao wake request accepted with `rtn=0` and exit code `0`; the token-refresh path was exercised end to end.
- Credential sweep of tracked files found no account identifiers, passwords, or tokens.
- `git diff --check` passed.

## Rules title and output path cleanup - 2026-10-03

Maintenance tag: `patch-20261003-151701`

### Changed

- `AGENTS.md`: rename the document title from `# Codex Workspace Rules` to `# 工作区通用规则`; the file is shared by every agent harness, not one workspace.
- `output/code/export_fanqie_book.py`, `output/code/download_38ksw_novel.py`: resolve their output locations from the repository root (`Path(__file__).resolve().parents[2]`) instead of the retired `E:\LLM-Sandbox\Codex` path.

### Validation

- `python -m py_compile` passed for both modified scripts.
- Sweep for `E:\LLM-Sandbox\Codex` in the changed files reports zero references.
- `git diff --check` passed.

## Workspace path de-hardcoding - 2026-10-03

Maintenance tag: `patch-20261003-145244`

### Changed

- `AGENTS.md`: rewrite the sync-target list as an actual-location rule with an existence check, dropping four dead paths (`.codex`, `.codex-claw`, and the two `E:\LLM-Sandbox\Codex` entries).
- `skill/version-manager/SKILL.md`, `references/github.md`, `references/project-profiles.md`: replace the hardcoded `E:\LLM-Sandbox\Codex` locations with repo-relative references resolved through `git rev-parse --show-toplevel`, so the rules no longer depend on a single agent workspace.

### Validation

- Full sweep for `E:\LLM-Sandbox\Codex` in `AGENTS.md` and `skill/version-manager/` reports zero remaining references.
- `git diff --check` passed.

## Workspace path maintenance - 2026-10-02

Maintenance tag: `patch-20261002-141233`

### Changed

- Point the default workspace path and the logo path in `AGENTS.md` at the new AI clone location `E:\LLM-Sandbox\Hermes\AI`; the previous `E:\LLM-Sandbox\Codex` directory no longer exists.

### Validation

- Confirmed `E:\LLM-Sandbox\Codex` is absent; `AGENTS.md`, `HAWKIE.png`, and `scripts/github.sh` are present in the new clone root.
- `git diff --check` passed.

## push-material-library 0.3 - 2026-09-30

### Changed

- Add the `push-material-library` Skill under `skill/push-material-library`: material matrix (5 app categories x 9 trigger scenes x 5 languages), contentId allocation, rich-text and 906 image rules, NotifyScenesConfig JSON assembly, and a five-layer duplicate-check design.
- Publish with placeholders for internal identifiers (Feishu base/wiki/doc tokens, table id, space id, automation id, user id); the public copy contains no internal links.

### Validation

- All five `scripts/*.py` pass `python -m py_compile`.
- Full-pattern sweep for internal identifiers and internal domains reports zero leftovers.
- Skill frontmatter version normalized to two-part `0.3`.
- `git diff --check` passed.

## Gitee compatibility layer retirement - 2026-09-28

Maintenance tag: `patch-20260928-163506`

### Changed

- Remove the deprecated `scripts/gitee.sh` and `scripts/gitee-hook.sh` compatibility wrappers; the GitHub entrypoints remain the only supported path.
- Drop the legacy `.gitee-synced-skills` manifest migration from `scripts/skill-selfcheck.sh`.
- Publish the pending `AGENTS.md` rule updates: retire the MS Rewards upstream section, add Google Play metadata verification, default to local-only scope until a remote is specified, and add the web deployment readback rules.

### Validation

- Bash syntax validation passed for the GitHub adapter, the release hook, and the skill self-check.
- `git diff --check` passed before commit.

## Local workspace history publication - 2026-09-08

Maintenance tag: `patch-20260908-144511`

### Changed

- Publish the three previously local commits on top of the GitHub migration baseline.
- Publish workspace cleanup, legacy GADC copy retirement, and the tracked `HAWKIE.png` asset with its local atlas ignore rule.

### Validation

- Git merge from the protected local history completed without conflicts.
- GitHub migration shell, JSON, and repository checks remain available on the merged baseline.

## GitHub migration maintenance - 2026-09-08

Maintenance tag: `patch-20260908-142326`

### Changed

- Replace the AI repository release adapter, hook, and version profiles with GitHub-based operation.
- Keep deprecated entrypoints as compatibility wrappers that route to GitHub; retain historical Gitee records only.
- Synchronize the updated version-manager skill to the local Codex and Claude runtime copies.

### Validation

- Bash syntax validation passed for the GitHub adapter, compatibility wrappers, release hook, and skill self-check.
- `git diff --check`, version-profile JSON parsing, `github.sh status`, and `github.sh info` passed.

## wake-hawkie maintenance - 2026-08-15

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
