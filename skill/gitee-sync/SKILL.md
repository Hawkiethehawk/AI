---
name: gitee-sync
description: 连接并操作公开 Gitee 仓库 Hawkiethehawk/AI（码云），并根据宿主系统选择可用的 Git Bash、WSL 或 Unix shell。当涉及该仓库的 push/pull、skill 同步、状态或远程信息时使用。首次在本地交互式终端运行 `gitee.sh setup`，隐藏读取并保存 Gitee Personal Access Token。Trigger 词：gitee、码云、推送/拉取 AI 仓库、同步 skill、看 AI 仓库状态、发布到远程。
version: 1.1.1
author: Built for the Hawkiethehawk/AI repo
license: MIT
metadata:
  hermes:
    tags: [gitee, git, repo-sync, skill-sync, automation, china-platform]
    related_skills: []
---

# gitee-sync — AI 公开仓库连接与 skill 同步

涉及 gitee 的所有操作只使用 Codex 当前工作仓库 `E:\LLM-Sandbox\Codex` 判断和执行；不要再把 `E:\LLM-Sandbox\Claude` 或 `E:\LLM-Sandbox\Gitee-AI` 当作仓库根。
`Hawkiethehawk/AI` 真源仓库位于 `E:\LLM-Sandbox\Codex`。如果 `scripts/gitee.sh`、`skill/` 或 Gitee remote 缺失，应在 Codex 仓库内修复或明确报错；不要新建、切换或回退到 `Gitee-AI` 工作副本。
**token 只需提交一次、自动保存复用**；不得要求用户在对话中发送 token，也不得把 token 放入命令参数、环境变量或远程 URL。

`F:\AMTools` 是独立私有仓库 `Hawkiethehawk/AMTools`，不归本 skill 管理。涉及 AMTools 的状态、提交、拉取或推送时，在 `F:\AMTools` 内按该仓库规则执行，不调用 AI 仓库的 `gitee.sh`。

## 环境检测与命令入口

先检测宿主系统和可用 shell，再执行任何 `gitee.sh` 命令；不要直接假设当前环境提供 Unix `bash`：

- PowerShell 中以 `$env:OS -eq 'Windows_NT'` 判断 Windows。Git Bash 中以 `uname -s` 返回 `MINGW*`、`MSYS*` 或 `CYGWIN*` 判断 Windows shell；其他结果按 Unix 处理。
- Windows 优先使用 Git for Windows 的 `bash.exe`，依次检查 `$env:ProgramFiles\Git\bin\bash.exe`、`${env:ProgramFiles(x86)}\Git\bin\bash.exe` 和 `$env:LOCALAPPDATA\Programs\Git\bin\bash.exe`。不要把 `C:\Windows\System32\bash.exe`（WSL 启动器）误当成 Git Bash。
- Git Bash 可用时，在仓库根目录执行：`./scripts/gitee.sh <command>`。PowerShell 中使用下面的入口，脚本参数必须单独传递，避免路径和空格被错误拆分：

  ```powershell
  $gitBash = @(
    "$env:ProgramFiles\Git\bin\bash.exe",
    "${env:ProgramFiles(x86)}\Git\bin\bash.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe"
  ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  if (-not $gitBash) {
    throw '未找到 Git for Windows bash.exe。请安装 Git for Windows，或按下方 WSL 方式执行。'
  }
  & $gitBash 'scripts/gitee.sh' 'status'
  if ($LASTEXITCODE -ne 0) { throw "gitee.sh 执行失败，退出码 $LASTEXITCODE" }
  ```

- 没有 Git Bash 但已安装 WSL 时，必须先把 Windows 路径转换为 WSL 路径，再在同一个发行版中执行，例如：`wsl.exe -- bash -lc 'cd /mnt/e/LLM-Sandbox/Codex && ./scripts/gitee.sh status'`。WSL 内不能直接使用 `E:\LLM-Sandbox\Codex` 这种 Windows 路径。
- Unix 环境使用：`bash scripts/gitee.sh <command>`。脚本根据自身路径确定仓库根，并校验 `origin` 必须是 `Hawkiethehawk/AI`；不接受环境变量覆盖目标仓库。
- 如果没有找到任何可用 shell，立即报告缺少 Git Bash/WSL/bash 及安装路径，不要改用手写 `git` 或 `curl` 绕过脚本。

## 这个仓库（已知背景，直接用）

- 远程：`https://gitee.com/Hawkiethehawk/AI.git`，**公开**仓库（public），默认分支 `master`。
- 结构：`skill/`（多个 skill，**真源**）、`scripts/`（自检/封装脚本）、`output/`（生成物）。
- 本 skill 唯一管理的 Git 工作仓库是 `E:\LLM-Sandbox\Codex`。
- **真源约定**：skill 的唯一真源是 `$REPO/skill/<name>/`，其中 `$REPO` 为 `E:\LLM-Sandbox\Codex`。运行时副本位于 `$REPO/.agents/skills`、`~/.agents/skills` 和 `~/.claude/skills`，由自检脚本同步。
  **只改 repo，绝不直接改运行时**（见 [[skill-sync-source-of-truth]]）。
- 公开仓库：读可匿名但有限流；写操作及稳定调用仍统一带 token。git push/pull 已由系统凭证免密。

## 每次使用的固定动作

1. `status` 可以直接执行，只读取工作树和本地缓存的远端引用，不访问网络。`info` 会读取 Gitee API，但不修改本地或远端状态。
2. `check` 会把仓库内的 skill 写入三个运行时目录。只有用户明确要求同步运行时或已授权发布 skill 时才执行；它不拉取远端，也不修改 Git 工作树。Windows PowerShell 使用 `& $gitBash 'scripts/gitee.sh' 'check'`，Git Bash 使用 `./scripts/gitee.sh check`，Unix 使用 `bash scripts/gitee.sh check`。
3. 执行 `setup`、`pull`、`push` 或 `create-private` 前，必须取得用户对目标和动作的明确授权。

## 一次性配置 token

仅当令牌文件不存在时需要。Git Bash/Unix 中路径为 `~/.claude/.gitee_token`；Windows 原生路径对应 `%USERPROFILE%\.claude\.gitee_token`，实际路径由脚本的 `$HOME` 解析，不要在两个 shell 之间手工复制令牌：

1. 提示用户在 Gitee 设置中创建带 `projects` 权限的 Personal Access Token，但不得要求用户把 token 发到对话中。
2. 由用户在本机交互式终端运行 `gitee.sh setup`。脚本隐藏读取 token，验证后保存到令牌文件（**不入库**）。PowerShell 入口为 `& $gitBash 'scripts/gitee.sh' 'setup'`。
3. 之后所有命令自动读取该 token，**不再询问**。

Windows 上 `chmod 600` 不提供 NTFS 访问控制。首次 setup 后用 `icacls "$env:USERPROFILE\.claude\.gitee_token"` 检查令牌文件只对当前用户可读写；若继承了其他用户或 `Everyone` 权限，应先移除继承权限再继续，不得把令牌放入仓库、环境变量或远程 URL。

## 命令清单

| 命令 | 作用 |
|---|---|
| `gitee.sh check` | 将本地仓库中的 skill 同步到运行时，并清理上次由本仓库管理但已删除的运行时 skill；不访问远端 |
| `gitee.sh status` | 工作区状态 + 各 skill 版本 + 与本地缓存远端引用的领先/落后；不访问网络 |
| `gitee.sh pull` | 拉取最新（rebase） |
| `gitee.sh push "msg"` | add + commit + rebase + push |
| `gitee.sh api <path>` | 调 Gitee REST API（带 token），如 `api /repos/Hawkiethehawk/AI/commits` |
| `gitee.sh info` | 仓库基本信息摘要 |
| `gitee.sh setup` | 在本地交互式终端隐藏读取并一次性保存 token |

## 安全（硬约束）

- token 存仓库外 `~/.claude/.gitee_token`，并在 `.gitignore` 兜底（`.gitee_token` / `*.token`），**绝不提交、不上传 gitee、不打印到对话**。Windows 上 `chmod 600` 近似无效，安全实际由用户私有目录 `~/.claude` 的 NTFS ACL 保证。
- git push/pull 沿用系统已配置的凭证（已免密），本 skill 不改动它。

## 强制调用（已配 hook）

`~/.claude/settings.json` 的 UserPromptSubmit hook（`scripts/gitee-hook.sh`）会在用户提到 Gitee/码云时注入提示，要求走本 skill。该 hook 在客户端层执行，对经网关运行的非 Claude 模型同样生效。Windows 上 hook 仍由其宿主 shell 执行；若 hook 不能启动 Bash，应在报告中说明缺少 Git Bash/WSL，不要绕过它手写零散 git/curl。

## 版本规则与推送确认

- 本地修改、验证、commit 或 pull 不更新版本号；版本处理只在准备推送到 Gitee 时进行。
- 对属于版本发布的推送，默认按当前版本递增 `0.0.1`；用户明确指定版本号时使用指定值。项目规则明确排除的纯文档、截图或协作规则变更沿用当前版本。
- 执行版本文件更新、`CHANGELOG.md` 记录、创建标签或 `gitee.sh push` 之前，必须先告知当前版本和拟发布版本，等待用户明确确认。用户确认后才能继续这些动作；未确认时只做检查和方案说明，不修改版本、不打标签、不推送。
- 用户明确要求“不修正版本号”时，保留当前版本，并将该要求视为本次版本选择；仍须按用户明确授权执行推送。

## 验收自检

- [ ] 已检测系统和 shell；仅在用户授权同步运行时后执行 `gitee.sh check`，且不自动 pull
- [ ] token 仅 setup 一次、保存在仓库外、未出现在对话/命令历史/提交里
- [ ] Windows 令牌文件已用 `icacls` 核验 NTFS 权限，未依赖无效的 `chmod 600`
- [ ] push 走 `gitee.sh push`（含 rebase），不直接 `git push` 绕过
- [ ] pull/push 已取得用户明确授权，且目标是 `Hawkiethehawk/AI`，不是独立的 AMTools 仓库
- [ ] 涉及 gitee 的请求确实由本 skill 处理（hook 已提示）
