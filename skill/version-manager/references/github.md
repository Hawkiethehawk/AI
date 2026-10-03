# GitHub 适配

## AI 仓库入口

AI 仓库的 GitHub API、运行时 Skill 同步和历史重写保护使用**本仓库克隆内的** `scripts/github.sh`（路径按 `git rev-parse --show-toplevel` 解析，任何 agent harness 均可调用）。脚本固定校验仓库根和 `Hawkiethehawk/AI` GitHub 远端，不得用于 AMTools、Monety 或 ADGuide。

Windows 优先使用 Git for Windows 的 `bash.exe`：

```powershell
$gitBash = @(
  "$env:ProgramFiles\Git\bin\bash.exe",
  "${env:ProgramFiles(x86)}\Git\bin\bash.exe",
  "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe"
) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $gitBash) { throw '未找到 Git for Windows bash.exe。' }
& $gitBash 'scripts/github.sh' 'status'
```

没有 Git Bash 时可使用 WSL，但必须先转换 Windows 路径。Unix 环境使用 `bash scripts/github.sh <command>`。

## 命令职责

- `status`：本地只读状态，不访问网络。
- `check`：将 AI 仓库 Skill 真源同步到运行时，不访问远端。
- `pull`：显式执行 `git pull --rebase`，需要用户授权。
- `commit <msg> <path>...`：只暂存明确路径并提交，不推送。
- `publish <tag>`：暂存区为空时刷新远端引用并校验快进关系，再推送 `master` 和一个已存在且指向 HEAD 的新标签。标签参数必填：功能发布传 `<component>-vX.Y`，Patch 或普通维护传 CHANGELOG 中预先记录的 `patch-YYYYMMDD-HHMMSS`。未暂存的用户改动会保留并明确报告，不纳入发布。
- `setup`、`api`、`info`：配置或使用 GitHub API token。

旧的组合式 `push` 命令已停用，避免隐式暂存、提交、拉取和推送。

## Token

- Token 仅通过本机交互终端的 `github.sh setup` 隐藏读取，保存在 `~/.claude/.github_token`；也可由 GitHub CLI/GCM 提供 Git 凭据。
- 不得要求用户在对话中发送 token，也不得放进命令参数、环境变量、远端 URL、日志或提交。
- Windows 上用 `icacls` 核验 token 文件只对当前用户可读写，不依赖 `chmod 600` 提供 NTFS 隔离。
- Git pull/push 继续使用系统 Git 凭证，不由脚本修改。

## 发布保护

- AI 仓库普通发布使用 `commit` 与 `publish` 两个独立阶段。`publish` 不自动 rebase 或 stash；远端含新提交时停止并要求单独处理。
- 每次提交准备推送前必须更新 AI 仓库根 `CHANGELOG.md`；Skill 目录内不得创建 CHANGELOG。
- 推送前检查 `.githooks`、提交身份、远端分支、根 CHANGELOG 是否包含待推送内容，以及新标签是否指向 HEAD。缺少 CHANGELOG 或标签时禁止推送。
- `github.sh` 不提供历史重写入口。确需重写时必须单独制定方案，使用执行前读取的完整远端 OID 和 `--force-with-lease`，并再次获得明确授权；禁止普通强推。
