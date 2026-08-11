# AMTools AI Agent 操作手册

## 1. 适用范围

AMTools 是应用市场研究工具集。本文档给在本机执行任务的 AI Agent 使用，重点是目录边界、调用顺序、授权门槛和验证要求。

默认总仓库为 `F:\AMTools`。

## 2. 模块边界

| 模块 | 目录 | 责任 | 不负责的事情 |
|---|---|---|---|
| AMDC | `apps\AMDC` | 账号认证、榜单采集、国别富化、缓存、历史、Excel、飞书同步和本地看板 | 市场分析结论和正式报告内容 |
| AMDA | `skills\AMDA` | 固定工作簿分析、国家分组、IAA/IAP 洞察、五张标准图表和 Demo 报告 | 采集账号、改变数据来源、覆盖正式文档 |
| Contracts | `packages\contracts` | 保存跨模块数据契约 | 保存令牌、账号、资源地址或报告正文 |
| Orchestrator | `orchestrator` | 传递批次参数、校验契约、执行隔离 dry-run | 复制 AMDC/AMDA 业务逻辑 |

AMDC 与 AMDA 通过 `CollectionManifest` 或不可变数据快照交接，不依赖未标识的临时目录或自然语言约定。

## 3. 授权规则

执行前先判断动作是否产生外部或持久化副作用：

- 语法检查、契约测试、只读审计和 dry-run 可以直接执行。
- 真实采集、真实飞书同步、ntfy 通知、正式文档写入、账号登录态复制和远程推送必须有用户明确授权。
- 未经授权，不运行 `run_amdc_weekly.ps1` 的真实采集路径，不调用正式文档写入接口，不执行 `git push`。
- 不读取、展示或提交 `amdc-config.json`、账号登录态、令牌和个人凭据的内容。

每次执行前向用户说明：动作、目标目录、是否访问外部服务、是否写入数据，以及验证方式。

## 4. 目录与私密数据

版本化代码位于：

- `F:\AMTools\apps\AMDC`
- `F:\AMTools\skills\AMDA`
- `F:\AMTools\packages\contracts`
- `F:\AMTools\orchestrator`

本地私密状态只允许存在于 AMDC 项目目录：

- `apps\AMDC\amdc-config.json`
- `apps\AMDC\.amdc-userdata*`
- `apps\AMDC\Cache\`
- `apps\AMDC\logs\`
- `apps\AMDC\output\`
- `skills\AMDA\output\charts\`

这些目录不进入 Git。AMDA 的本地产物只能写入 `skills\AMDA\output\charts\`，不得写入仓库根目录、`artifacts`、`tmp` 或其它输出目录。

## 5. 常规验证流程

在 `F:\AMTools` 执行：

```powershell
npm run contracts:test
npm run amdc:syntax
npm run amdc:test:contract
npm run amdc:test:feishu-order
pwsh -NoProfile -File .\orchestrator\run-pipeline.ps1 -ManifestPath .\tests\fixtures\collection-manifest.example.json -DryRun
```

这些命令不应启动真实采集，也不应写入飞书。

AMDC 调试命令必须显式绑定总仓库项目目录：

```powershell
$env:AMDC_PROJECT_DIR = 'F:\AMTools\apps\AMDC'
node .\orchestrator\run-amdc-command.js syntax
```

不要让宿主机已有的 `AMDC_PROJECT_DIR` 把命令带回 `F:\AMDC`。

## 6. 手动 AMDC 流程

真实 AMDC 流程的顺序是：

1. 检查账号登录态和配置文件。
2. 启动或检查 AMDC 看板。
3. 按周锚点采集七个品类。
4. 生成唯一 Excel 产物。
5. 按授权执行飞书同步。
6. 按授权发送 ntfy 通知。

周锚点必须是周一，格式为 `YYYY-MM-DD`。不要通过修改缓存文件伪造完成状态。失败时保留日志和批次目录，先判断能否安全重试，再决定是否重新采集。

## 7. AMDA 分析流程

AMDA 只处理已授权、来源明确的数据快照。标准顺序为：

1. 导出固定工作簿的可见、日期命名周度工作表。
2. 对导出数据执行规范化和源数据漂移检查。
3. 使用 canonical analyzer 生成分析 JSON。
4. 使用 report-data 生成器生成报告数据。
5. 从同一份报告数据渲染五张标准 SVG 图表。
6. 执行数值、表格、图表和文档契约校验。
7. 需要写入 Demo 时，先保存正式文档和 Demo 的 API 回读，完成 parity 检查后才允许写入。
8. 写入后再次 API 回读、运行全部校验，并检查五张图表的可见渲染。

正式市场分析文档保持只读，Demo 写入也必须有用户授权或由已授权的定时触发器执行。

## 8. 定时任务

当前 Windows 任务名称为：

- `AMDC Account Sync`：每天 09:05，运行 `scripts\sync-account-profiles.ps1`。
- `AMDC Weekly`：每周三 09:30，运行 `scripts\run_amdc_scheduled.ps1`。

任务模板位于 `apps\AMDC\schedules\`。导入前必须确认 XML 中的 `-ProjectDir` 和 `WorkingDirectory` 都是 `F:\AMTools\apps\AMDC`，并确认新目录已经具备私密配置和登录态。

Windows 任务注册需要管理员权限。使用 PowerShell 7 以管理员身份执行：

```powershell
schtasks.exe /create /tn "AMDC Account Sync" /xml "F:\AMTools\apps\AMDC\schedules\account-sync.xml" /f
schtasks.exe /create /tn "AMDC Weekly" /xml "F:\AMTools\apps\AMDC\schedules\weekly-run.xml" /f
```

注册后重新查询任务动作，确认不再出现 `F:\AMDC`。当前仓库已完成模板和私密状态迁移，但系统注册项需要管理员命令完成覆盖。

定时入口会检查端口 `8787` 的看板归属。端口被其它 AMDC 项目占用时，不得强行覆盖，应先记录进程和 `projectDir`。

任务使用交互式登录令牌，依赖当前用户的浏览器登录态。任务状态为 `Ready` 不代表最近一次执行成功，必须同时检查：

```powershell
schtasks.exe /query /tn "AMDC Account Sync" /fo LIST /v
schtasks.exe /query /tn "AMDC Weekly" /fo LIST /v
Get-ScheduledTaskInfo -TaskName 'AMDC Account Sync'
Get-ScheduledTaskInfo -TaskName 'AMDC Weekly'
```

迁移后先使用 PowerShell 7 运行账号同步 dry-run：

```powershell
pwsh.exe -NoProfile -ExecutionPolicy Bypass -File F:\AMTools\apps\AMDC\scripts\sync-account-profiles.ps1 -ProjectDir F:\AMTools\apps\AMDC -DryRun
```

只启动看板而不提交采集批次时，使用定时入口的 `-StartOnly`：

```powershell
pwsh.exe -NoProfile -ExecutionPolicy Bypass -File F:\AMTools\apps\AMDC\scripts\run_amdc_scheduled.ps1 -ProjectDir F:\AMTools\apps\AMDC -StartOnly
```

不要用真实周任务测试迁移。只有 dry-run、任务 XML、日志目录和看板归属全部通过后，才安排下一次真实周期验证。

## 9. CollectionManifest

契约定义在 `packages\contracts\collection-manifest.schema.json`。每个批次至少要能说明来源、周锚点、数据范围、输出位置和状态。Agent 应先校验 manifest，再把同一批次标识传给 AMDA。

验证示例：

```powershell
npm run contracts:test
node .\tests\validate-manifest.js .\tests\fixtures\collection-manifest.example.json
```

不得把账号令牌、飞书 token、ntfy token 或报告正文放入 manifest。

## 10. 失败、重试和幂等

- 看板启动超时：检查 `8787` 端口、Node 进程、项目目录和 `logs\scheduled-run.log`。
- 账号检查失败：保留失败账号名称，禁止把失败账号强行加入同步清单。
- 飞书同步失败：保留 Excel 和批次日志，确认是否已经部分写入，再决定重试。
- AMDA 校验失败：不得写入 Demo，保留 canonical JSON、report-data、SVG 和校验结果。
- 同一批次重试：沿用原 `batchId`，先检查状态文件，避免重复创建 Demo。
- ntfy 失败：记录 HTTP 状态和本地日志，不把通知失败误判为数据采集成功。

重试前必须区分可重试错误、认证错误和数据契约错误。认证错误需要用户重新登录，契约错误需要修复输入或代码后重新验证。

## 11. 禁止操作

- 不删除 `F:\AMDC` 或 `F:\AMDA` 原项目。
- 不删除账号登录态、`amdc-config.json`、令牌和未确认的运行产物。
- 不把 AMDC 与 AMDA 的业务代码复制到 orchestrator。
- 不通过修改日志、状态 JSON 或缓存文件伪造成功。
- 不在没有用户授权时写飞书、发通知、写正式文档或推送 Gitee。
- 不在报告中把推断写成已验证事实。

## 12. 故障反馈格式

反馈至少包含：

```text
模块：AMDC / AMDA / orchestrator / scheduler
批次：batchId 或 weekAnchor
动作：执行了什么
结果：成功、失败或未执行
错误：原始错误摘要
日志：绝对路径
验证：已通过和未通过的检查
下一步：需要用户授权、重新登录或代码修复
```

报告中区分已验证结果、推断、待确认事项和未执行动作。
