# Changelog — wake-hawkie

## 1.1.0

**公开仓库脱敏：具体网络拓扑移出 git**

- 仓库为 **public**。原 SKILL.md 在 "Current Environment" 表、"Wake configured target (concrete)"、"Quick Command Reference" 中硬编码了**真实 Tailscale IP、tailnet 名 `<TAILNET_DOMAIN>`、目标 MAC、LAN IP、Windows 用户名、云主机名、账号 email**。虽未泄露密码/私钥，但在公开仓库属于不必要的指纹暴露，且与 skill 自身 "never commit" 声明矛盾。
- 新增 **`env.local.md`（被 `.gitignore` 排除，不入库/不推送）** 收纳全部具体值与具体命令；selfcheck 的 `cp -rf` 仍会把它同步到运行时，运行 wake 时可用。
- SKILL.md 改为纯通用方法 + `<PLACEHOLDERS>`：环境表替换为「待记录字段」模板，Quick Command Reference 的 IP/MAC 全部占位符化。
- 更新 Security Notes：明确"本仓库公开 → 具体拓扑只放 env.local.md"，删除原"低敏感、为方便保留在此"的说法。
- 密码与私钥仍一律不入任何文件，运行时再给。

## 1.0.0

- 初版：经 ImmortalWrt/OpenWrt 路由器（Cudy TR3000）over Tailscale 远程 WoL 唤醒家庭 LAN 内 PC（etherwake 广播 magic 包）；含 Windows 非交互 SSH（plink）、路由器侧 Tailscale 设置、代理/TUN 破坏 SSH-to-IP 的排查、反向远程关机。
