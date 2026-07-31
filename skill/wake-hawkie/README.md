# wake-hawkie

通过 Cudy TR3000 原厂固件提供的 Wake-on-LAN 功能，唤醒预先配置的目标电脑。

## 工作链路

```text
Hermes 主机 -> ZeroTier -> TR3000 Web 管理界面 -> Wake-on-LAN
```

当前版本只包含通用脚本和占位符，不包含路由器地址、密码、令牌、目标 MAC 地址或其他目标设备配置。

## 配置

在 Hermes 主机上创建配置文件：

```text
$HOME/.config/wake-hawkie/router.env
```

将文件权限设为仅当前用户可读，并填入以下内容：

```bash
ROUTER_URL=http://ROUTER_ZEROTIER_IP
ROUTER_PASSWORD=your-router-admin-password
TARGET_MAC=AA:BB:CC:DD:EE:FF
```

配置项说明：

- `ROUTER_URL`：路由器的 ZeroTier 地址。
- `ROUTER_PASSWORD`：路由器管理密码。
- `TARGET_MAC`：预先配置的目标电脑网卡 MAC 地址。

不要将配置文件、真实配置值、密码、令牌或私钥提交到仓库，也不要将它们写入 README 或其他公开文件。

## 使用

从 Hermes 技能目录运行脚本：

```bash
bash "$HOME/.hermes/skills/wake-hawkie/scripts/wake-hawkie"
```

该技能只用于预先配置的目标电脑，不接受从聊天或命令行临时指定的其他目标。

脚本执行成功表示路由器已接受 Wake-on-LAN 请求，不代表目标电脑一定已经完成启动。

## 安全要求

- 配置文件应放在仓库外，并设置为仅当前用户可读。
- 新提交只保留占位符，不记录真实地址、设备标识或认证信息。
- 脚本仅应在目标所有者明确要求时运行。
