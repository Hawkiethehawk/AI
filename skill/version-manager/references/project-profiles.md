# 项目版本配置

## AI

- 仓库：`E:\LLM-Sandbox\Codex`
- 远端：`Hawkiethehawk/AI`
- 默认分支：`master`
- AI 只是承载多个 Skill 的仓库，不设置仓库版本，也不创建仓库级 `vX.Y.Z` 标签。
- 发布对象：`skill/`、`scripts/`、`project/` 等用户明确指定的变更。
- Skill 版本写入自身 `SKILL.md` 的 `metadata.version`。发布标签使用 `<skill-name>-vX.Y.Z`，避免与其他 Skill 冲突。
- Skill 不在本地修改或普通提交时更新版本号。没有版本字段时不得为凑版本而添加非标准顶层 frontmatter。
- Skill 真源是 `skill/<name>/`，运行时副本由 `scripts/skill-selfcheck.sh` 同步。
- `F:\AMTools` 不属于 AI 仓库，禁止通过 AI 仓库脚本提交或推送。

## AMTools 与 AMDC

- 仓库：`F:\AMTools`
- 默认分支：`master`
- AMDC 项目：`apps/AMDC`
- 当前版本来源：`apps/AMDC/package.json`、`apps/AMDC/package-lock.json`。
- 版本发布前同步更新上述两个版本文件和 `apps/AMDC/CHANGELOG.md`。
- CHANGELOG 条目包含版本、发布日期、实际变更和发布验证。
- 发布提交完成后创建同版本 `vX.Y.Z` 标签，再推送提交和标签。
- 发布后将版本同步到 `apps/AMDC/README.md` 的“当前版本”。如果本机私有配置绑定项目介绍文档，只有用户授权后才同步，并回读确认。
- 待发布内容含应用代码、配置、依赖或运行逻辑时，发布确认必须列出功能变化、影响范围和验证结果。
- AMTools 的真实采集、飞书同步、正式文档覆盖和账号备份不属于版本发布的隐含授权。

## Monety

- 仓库：`F:\Monety`
- 默认分支：`master`
- 当前没有仓库级版本文件、CHANGELOG 或项目级版本规则，但组件 `monety/SKILL.md` 声明了自身版本。
- 组件版本不自动等同于仓库发布版本。发布 Monety Skill 相关变更时，报告组件当前版本；发布 viewer 或其他仓库内容时，不得擅自沿用该版本。
- 只有用户确认组件版本可以作为发布基线，或确认需要引入仓库级版本体系后，才更新版本、CHANGELOG 和标签策略。

## ADGuide

- 仓库：`F:\ADGuide`
- 远端：`Hawkiethehawk/AD-Guide`
- 默认分支：`main`
- 当前没有独立版本文件或项目级版本规则。发布前报告这一事实，不自行创建版本体系。
- 用户在 ADGuide 语境中说“推”，表示同时推送 Gitee 并部署到 `ad.hawkie.cloud`；只完成其中一项不算完成。推送和部署前分别检查授权与验证条件。
