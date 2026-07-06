---
name: gitee-sync
description: 连接并操作私有 gitee 仓库 configured targetthehawk/AI（码云）。当涉及 gitee/码云、向该仓库 push/pull、同步或发布 skill、查询仓库状态或远程信息时使用。首次用 `gitee.sh setup <token>` 一次性保存 gitee Personal Access Token（之后自动复用，无需再问），每次使用先自检仓库内所有 skill 是否有更新。Trigger 词：gitee、码云、推送/拉取仓库、同步 skill、看仓库状态、发布到远程。
version: 1.1.0
author: Built for the configured targetthehawk/AI repo
license: MIT
metadata:
  hermes:
    tags: [gitee, git, repo-sync, skill-sync, automation, china-platform]
    related_skills: []
---

# gitee-sync — 私有仓库连接 & skill 同步

涉及 gitee 的所有操作都通过封装脚本 `scripts/gitee.sh`（优先使用本地真源仓库根 `E:\LLM-Sandbox\AI`）完成。
**token 只需提交一次、自动保存复用**；统一走脚本，避免零散手写 git/curl 把 token 暴露到对话或命令历史。

## 这个仓库（已知背景，直接用）

- 远程：`https://gitee.com/configured targetthehawk/AI.git`，**公开**仓库（public），默认分支 `master`。
- 结构：`skill/`（多个 skill，**真源**）、`scripts/`（自检/封装脚本）、`output/`（生成物）。
- **真源约定**：skill 的唯一真源是 `repo/skill/<name>/`，运行时 `~/.claude/skills` 靠自检脚本同步。
  **只改 repo，绝不直接改运行时**（见 [[skill-sync-source-of-truth]]）。
- 公开仓库：读可匿名但有限流；写操作及稳定调用仍统一带 token。git push/pull 已由系统凭证免密。

## 每次使用的固定动作（顺序不可省）

1. **第一步永远是 `bash scripts/gitee.sh check`**：先对**整个仓库** `git pull --rebase` 跟上 gitee（每次都拉，不再按小时节流），再把**仓库内**每个有变化的 skill 同步到运行时。**只动仓库内的 skill**，不碰运行时里非仓库的 skill。
2. 再执行用户要的具体操作（见下方命令）。

## 一次性配置 token

仅当 `~/.claude/.gitee_token` 不存在时需要：

1. 让用户提供一个 gitee Personal Access Token（gitee → 设置 → 私人令牌，勾选 `projects` 权限）。
2. 运行 `bash scripts/gitee.sh setup <token>`：验证有效后保存到 `~/.claude/.gitee_token`（权限 600，**不入库**）。
3. 之后所有命令自动读取该 token，**不再询问**。

## 命令清单

| 命令 | 作用 |
|---|---|
| `gitee.sh check` | 整库 `git pull` 同步 + 把仓库内所有有变化的 skill 同步到运行时（每次第一步） |
| `gitee.sh status` | 工作区状态 + 各 skill 版本 + 与远程领先/落后 |
| `gitee.sh pull` | 拉取最新（rebase） |
| `gitee.sh push "msg"` | add + commit + rebase + push |
| `gitee.sh api <path>` | 调 gitee REST API（带 token），如 `api /repos/configured targetthehawk/AI/commits` |
| `gitee.sh info` | 仓库基本信息摘要 |
| `gitee.sh setup <token>` | 一次性保存 token |

## 安全（硬约束）

- token 存仓库外 `~/.claude/.gitee_token`，并在 `.gitignore` 兜底（`.gitee_token` / `*.token`），**绝不提交、不上传 gitee、不打印到对话**。Windows 上 `chmod 600` 近似无效，安全实际由用户私有目录 `~/.claude` 的 NTFS ACL 保证。
- git push/pull 沿用系统已配置的凭证（已免密），本 skill 不改动它。

## 强制调用（已配 hook）

`~/.claude/settings.json` 的 UserPromptSubmit hook（`scripts/gitee-hook.sh`）会在用户提到 gitee/码云 时注入提示，要求走本 skill。该 hook 在客户端层执行，对经网关运行的非 Claude 模型同样生效。不要绕过它手写零散 git/curl——统一用 `gitee.sh`，以保证「先自检 + 用已存 token」。

## 验收自检

- [ ] 每次先跑 `gitee.sh check`：整库 pull + 同步仓库内 skill
- [ ] token 仅 setup 一次、保存在仓库外、未出现在对话/命令历史/提交里
- [ ] push 走 `gitee.sh push`（含 rebase），不直接 `git push` 绕过
- [ ] 涉及 gitee 的请求确实由本 skill 处理（hook 已提示）
