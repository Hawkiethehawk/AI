# 项目版本配置

本文件解释项目规则；`scripts/version_inspect.py` 使用同目录的 `project-profiles.json` 读取版本源、组件源和标签模式。两者修改后必须一起核验。

## AI

- 仓库：`E:\LLM-Sandbox\Codex`
- 远端：`Hawkiethehawk/AI`
- 默认分支：`master`
- AI 只是承载多个 Skill 的仓库，不设置仓库版本，也不创建仓库级 `vX.Y.Z` 标签。
- AI 是承载仓库，不是版本对象。`scripts/`、`project/`、`.githooks/` 和其他普通目录可提交、推送，但不得设置版本号、写 CHANGELOG 版本条目或创建版本标签。
- 只有 `skill/<name>/` 下包含有效 `SKILL.md` 的目录是版本对象。
- Skill 版本写入自身 `SKILL.md` 的 `metadata.version`。发布标签使用 `<skill-name>-vX.Y.Z`，避免与其他 Skill 冲突。
- Skill 不在本地修改或普通提交时更新版本号。没有版本字段时不得为凑版本而添加非标准顶层 frontmatter。
- Skill 真源是 `skill/<name>/`，运行时副本由 `scripts/skill-selfcheck.sh` 同步。
- `F:\AMTools` 不属于 AI 仓库，禁止通过 AI 仓库脚本提交或推送。

## AMTools

- 仓库：`F:\AMTools`
- 默认分支：`master`
- 发布对象是整个 AMTools 仓库；AMDC、AMDA 和其他子项目不维护独立版本。
- 唯一版本来源是根目录 `package.json` 和 `package-lock.json`。组件目录内的版本字段或历史记录不得参与当前版本判断。
- 版本发布前同步更新根目录两个版本文件和根目录 `CHANGELOG.md`。
- CHANGELOG 条目包含版本、发布日期、实际变更和发布验证。
- 发布提交完成后创建同版本 `vX.Y.Z` 标签，再推送提交和标签。
- 发布后将版本同步到根目录 `README.md` 的“当前版本”。如果本机私有配置绑定项目介绍文档，只有用户授权后才同步，并回读确认。
- 待发布内容含任一子项目的应用代码、配置、依赖、共享契约或运行逻辑时，均按 AMTools 仓库版本发布；发布确认必须列出功能变化、影响范围和验证结果。
- AMTools 的真实采集、飞书同步、正式文档覆盖和账号备份不属于版本发布的隐含授权。

## Monety

- 仓库：`F:\Monety`
- 默认分支：`master`
- Monety 仓库不是版本对象，不设置仓库版本或仓库标签。
- `monety/` 是已配置的 Skill，可使用自身 `SKILL.md` 版本和 `monety-vX.Y.Z` 标签。
- `viewer/`、`scripts/`、`topn-open-api/` 及其他普通目录没有版本；提交或推送这些内容时不得沿用 Monety Skill 版本。

## ADGuide

- 仓库：`F:\ADGuide`
- 远端：`Hawkiethehawk/AD-Guide`
- 默认分支：`main`
- 当前没有独立版本文件或项目级版本规则。发布前报告这一事实，不自行创建版本体系。
- ADGuide 及其子目录均不是本 Skill 的版本对象；代码发布不修改版本号、CHANGELOG 版本条目或版本标签。
- 用户在 ADGuide 语境中说“推”，表示同时推送 Gitee 并部署到 `ad.hawkie.cloud`；只完成其中一项不算完成。推送和部署前分别检查授权与验证条件。
