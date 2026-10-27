# wake-hawkie

用于在用户明确请求时唤醒或验证 Hawkie PC。

## 使用

```bash
~/.pi/agent/skills/wake-hawkie/scripts/wake-hawkie
```

脚本从 `~/.config/wake-hawkie/node-xiaobao.env` 读取本地配置，也支持通过 `WAKE_HAWKIE_CONFIG` 指定配置文件。配置包含设备标识、账号密码和登录令牌，必须保持 `0600` 权限，不要打印或提交。

## 登录态

`owcode` 是节点小宝控制台的会话令牌，接口返回 `rtn=10109`（E_LOGIN）即表示令牌失效。脚本会自动使用配置中的 `NODE_XIAOBAO_PHONE` / `NODE_XIAOBAO_PWD` 重新登录，把新的 `owcode` 写回配置文件，然后重试一次。

强制刷新令牌：

```bash
~/.pi/agent/skills/wake-hawkie/scripts/wake-hawkie --refresh
```

只依据脚本退出状态和返回结果报告执行情况；不要使用旧的路由器或虚拟组网方案替代当前流程。
