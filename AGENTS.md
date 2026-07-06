# Codex Workspace Rules

默认用中文回答。

## AppMagic Weekly Data

- 默认工作路径使用 `E:\LLM-Sandbox\Codex`。
- 每次 AppMagic 采集前，先识别并列出当前已登录的 AppMagic profile 与邮箱。
- 采集账号池必须先做邮箱去重检查；不要同时使用邮箱重复的 profile 作为不同账号。
- 如果需要用户补登录账号，必须明确告知当前已经登录好的邮箱列表，并提醒用户不要登录这些邮箱。
- 若撞到额度墙需要切换账号，优先切换到邮箱未重复且已通过 auth check 的 profile。
