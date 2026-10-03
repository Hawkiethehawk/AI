# 项目版本配置

本文件解释项目规则；`scripts/version_inspect.py` 使用同目录的 `project-profiles.json` 读取版本源、组件源和标签模式。两者修改后必须一起核验。

## AI

- 仓库：本仓库克隆根目录（不写死路径，用 `git rev-parse --show-toplevel` 解析）
- 远端：`Hawkiethehawk/AI`
- 默认分支：`master`
- AI 只是承载多个 Skill 的仓库，不设置仓库版本，也不创建仓库级 `vX.Y` 标签。
- AI 是承载仓库，不是版本对象。`scripts/`、`project/`、`.githooks/` 和其他普通目录可提交、推送，但不得设置版本号或创建版本标签；推送记录统一写入仓库根 CHANGELOG。
- 只有 `skill/<name>/` 下包含有效 `SKILL.md` 的目录是版本对象。
- Skill 版本写入自身 `SKILL.md` 的版本字段。发布标签使用 `<skill-name>-vX.Y`，避免与其他 Skill 冲突。
- Skill 不在本地修改或普通提交时更新版本号。没有版本字段时不得为凑版本而添加非标准顶层 frontmatter。
- AI 仓库每次推送都更新根目录 `CHANGELOG.md`。Skill 功能发布使用 `<skill-name>-vX.Y`；Patch 或普通目录维护推送使用提交前确定的 `patch-YYYYMMDD-HHMMSS`。
- Skill 真源是 `skill/<name>/`，运行时副本由 `scripts/skill-selfcheck.sh` 同步。
- `F:\AMTools` 不属于 AI 仓库，禁止通过 AI 仓库脚本提交或推送。

## AMTools

- 仓库：`F:\AMTools`
- 默认分支：`master`
- 发布对象是整个 AMTools 仓库；AMDC、AMDA 和其他子项目不维护独立版本。
- 唯一版本来源是根目录 `VERSION`。根 npm 清单不声明项目版本；组件目录内的版本字段或历史记录不得参与当前版本判断。
- 每次推送都更新根目录 `CHANGELOG.md`。功能或破坏性发布同时更新 `VERSION`；Patch 保持版本不变并写维护条目。
- CHANGELOG 条目包含版本、发布日期、实际变更和发布验证。
- 发布提交完成后创建同版本 `vX.Y` 标签，再推送提交和标签。
- 发布后将版本同步到根目录 `README.md` 的“当前版本”。如果本机私有配置绑定项目介绍文档，只有用户授权后才同步，并回读确认。
- 功能或破坏性发布使用 `vX.Y`；Patch 推送使用 `patch-YYYYMMDD-HHMMSS`，不得移动现有版本标签。
- 待发布内容含任一子项目的应用代码、配置、依赖、共享契约或运行逻辑时，均按 AMTools 仓库版本发布；发布确认必须列出功能变化、影响范围和验证结果。
- AMTools 的真实采集、飞书同步、正式文档覆盖和账号备份不属于版本发布的隐含授权。

## Monety

- 仓库：`F:\Monety`
- 默认分支：`master`
- Monety 仓库不是版本对象，不设置仓库版本或仓库标签。
- `monety/` 是已配置的 Skill，可使用自身 `SKILL.md` 版本和 `monety-vX.Y` 标签。
- `viewer/`、`scripts/`、`topn-open-api/` 及其他普通目录没有版本；提交或推送这些内容时不得沿用 Monety Skill 版本。
- Monety 仓库每次推送都更新根目录 `CHANGELOG.md`。Skill 功能发布使用 `<skill-name>-vX.Y`；Patch 或非版本对象推送使用 `patch-YYYYMMDD-HHMMSS`。

## ADGuide

- 仓库：`F:\ADGuide`
- 远端：`Hawkiethehawk/AD-Guide`
- 默认分支：`main`
- 当前没有独立版本文件或项目级版本规则。发布前报告这一事实，不自行创建版本体系。
- ADGuide 及其子目录均不是本 Skill 的版本对象；代码发布不修改版本号或创建版本标签，但必须写入仓库根 CHANGELOG。
- ADGuide 每次推送都更新根目录 `CHANGELOG.md` 并创建 `patch-YYYYMMDD-HHMMSS` 维护标签；该标签不是版本标签。
- 用户在 ADGuide 语境中说“推”，表示同时推送 GitHub 并部署到 `ad.hawkie.cloud`；只完成其中一项不算完成。推送和部署前分别检查授权与验证条件。
