# scripts/skill-selfcheck.sh — skill 自检同步

让运行时加载的 skill（`~/.claude/skills/*`）与当前本地仓库真源保持一致。
解决的问题：repo 与运行时是两份独立副本，历史上各自演化、会脱节（曾出现运行时是
v1.2.1 而 repo 还是 v1.1.0、或反过来 repo 是残稿而运行时是完整版）。

## 真源（重要）

**唯一真源 = 本 repo 的 `skill/` 目录**。
- 要改 skill，只改 repo 里的 `skill/<name>/`；提交和推送由 `version-manager` 分阶段处理。
- 不要直接改运行时副本 `~/.claude/skills/*`，下次自检会用 repo 版本覆盖它。

## 它做什么

1. 逐个 skill 比对：运行时缺失或与 repo 不一致时，把 repo 版整目录同步过去；清理上次由本 repo 管理、但已从 repo 删除的运行时 skill。
2. 只读取当前本地工作树，不访问远端，不执行 `git pull`。
3. 用 `~/.claude/.ai-managed-skills` 记录仓库曾管理过的 skill。首次运行只建立清单，不猜测并删除已有的本地 skill。
4. 有变更时打印一行摘要，例如 `[skill-selfcheck] Claude skill 已更新: example-skill(1.1.0->1.2.1)`。

幂等：无变更时静默、零副作用。

## 怎么触发

### Claude Code（含经网关跑的非 Claude 模型）—— 已配置

`~/.claude/settings.json` 里已加 PreToolUse hook，匹配 `Skill` 工具：每次调用任意
skill 前自动跑本脚本。hook 在客户端层执行，与背后是哪个模型无关，所以经网关的
gpt/deepseek 等模型同样生效。

### 其它 agent 框架（非 Claude Code）—— 需各自挂一次

那些框架读不到 Claude Code 的 settings.json，无法自动触发。把下面这一行挂到该框架的
“工具调用前 / 会话启动”钩子即可（换机器时用 `SKILL_REPO` 指定 repo 路径）：

```bash
SKILL_REPO=/path/to/this/repo bash /path/to/this/repo/scripts/skill-selfcheck.sh
```

脚本默认按自身位置推断 repo（位于 `<repo>/scripts/` 下），多数情况下无需设
`SKILL_REPO`。退而求其次也可在每次会话开始时手动跑一次这条命令。

## 换机器

1. clone 本 repo。
2. 改 `~/.claude/settings.json` 里 hook command 的脚本绝对路径为新机器上的 repo 路径。
3. 首次手动跑一次脚本，把 `skill/*` 同步进 `~/.claude/skills/`。
