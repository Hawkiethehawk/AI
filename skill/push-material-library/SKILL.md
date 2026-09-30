---
name: push-material-library
description: "Build app push notification material libraries (推送物料库)."
version: 0.3
author: Hawkiethehawk, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [推送, 通知, 物料库, NotifyScenesConfig, 复投, lark]
    related_skills: [humanizer]
---

# 推送物料库（NotifyScenesConfig）

为复投推送建立可复用的通知物料：多语言文案、906 通知图片（四尺寸）、contentId 编号，以及可直接上线的 NotifyScenesConfig JSON。物料库承载在飞书 Base「Push消息物料库」（base_token `<BASE_TOKEN>`，数据表「推送物料」`<TABLE_ID>`），存放于「我的文档库」`https://<tenant>.feishu.cn/wiki/<WIKI_NODE_TOKEN>`（wiki node `<WIKI_NODE_TOKEN>`）；配置结果转 Base64 后写入 App 的 `ol_notify_b64_config`。本 Skill 只覆盖物料生产与配置组装，不涉及 App 端模板实现（tempId 由客户端版本注册）。

权威说明：《NotifyScenesConfig运营配置手册 v2.0》= `https://<tenant>.feishu.cn/wiki/<MANUAL_WIKI_NODE_TOKEN>`（docx token `<MANUAL_DOCX_TOKEN>`）。字段明细见 [references/notify-scenes-config.md](references/notify-scenes-config.md)；项目交付清单、已验证结论与待办见 [references/交付与待办.md](references/交付与待办.md)。

> 公开版本说明：内部标识（飞书 Base / Wiki / Doc token、表 ID、空间 ID、自动化 ID、用户 ID）在此副本中以 `<…>` 占位符呈现，使用前替换为真实值；本地工作副本保留原值。

## When to Use

- 为某产品 × 场景 × 语言批量产出推送文案、按钮文案和图片物料
- 把物料拼成 `ol_notify_b64_config` 的 JSON 与 Base64
- 核对场景开关、频控、`subType` 子场景、模板选择是否符合手册
- Don't use for: 客户端模板实现、通知 SDK 代码、App 内跳转落地页开发

## Prerequisites

- `terminal("lark-cli auth status")` 显示 user identity 为 ready；缺失时走 device flow 登录，按用户要求逐项排除权限
- 读写飞书内容前先读 CLI 自带技能：`terminal("lark-cli skills read lark-doc")`、`lark-sheets`、`lark-wiki`
- 物料库 Base `<BASE_TOKEN>`（在「我的文档库」内，wiki node `<WIKI_NODE_TOKEN>`）：单表 `推送物料` `<TABLE_ID>`，26 列、36 行，三个视图 `文本 901-903` / `图片 906` / `重复项`；源文档内嵌表格 `<SHEET_TOKEN>`（模板表 `BdcyJ1`、全局参数 `zDd21y`）只作参考
- 图片直链需公开可访问且直接返回图片内容（下载失败时视图不会替换图片）

## Quick Reference

### contentId 编号（产品段位 + 4 位序号）

| 产品 | 段位 | 产品 | 段位 |
|-|-|-|-|
| 清理 | 10001–19999 | 壁纸 | 40001–49999 |
| PDF | 20001–29999 | 文件恢复 | 50001–59999 |
| 下载器 | 30001–39999 | | |

段内再按场景分块（例如清理×解锁 10001–10499、清理×定时 10501–10999），一条物料一个号，便于统计归因。`contentId` 为 Int，同一批次不要重复。

### 物料库表结构（已建）

单张数据表 `推送物料` + 三个视图：`文本 901-903`（筛 `模板id` ∈ 901/902/903）、`图片 906`（筛 `模板id`=906）、`重复项`（筛 `查重`=重复）。列顺序：`contentId`（数字主键）→ `品类` → `应用项目编号` → `包名` → `语言` → `模板id` → `场景` → `JSON` → 配置列 → 906 四个图片列 → `overlayCx`/`overlayCxRate` → `查重` → `状态`/`备注`。

- 901-903 与 906 不做独立表：同表用视图分屏，列取并集，各自视图隐藏无关列（`+view-set-visible-fields`）。
- `JSON` 是公式列，按 `模板id` 分支输出两种结构（906 走 `imageList` 版，其余走 `content`/`btnText` 版）；只读。
- 901-903 是纯文本模板（**903 无按钮**，`btnText` 留空）；906 不写 `content`/`btnText`，图片填 `图-小通知`/`图-普通通知`/`图-大通知`/`图-悬浮窗`，尺寸 970×160 / 970×265 / 970×625 / 975×500。
- 「通用模板」按品类各出一套：`品类` 填具体品类，`包名` 留空，`contentId` 用该品类段位；首批清理 10001-10027（文本）+ 10028-10036（906）。
- 行内默认值：`wgt`=100、`cx`=0、`cxRate`=0、`lt`=0、`overlayCx`=1、`overlayCxRate`=100、`autoCancel`=true、`ongoing`=false，`subType` 按场景填。
- `应用项目编号` 在 `品类` 之后、`包名` 之前：目标应用的项目编号，与 `包名` 一一对应（同一品类的不同应用用它区分）。
- **每个字段都必须有 `description`（字段备注）**，参数字段要写清含义、取值范围与默认值（`wgt`、`cx`、`cxRate`、`lt`、`subType`、`overlayCx` 等），身份列写编号规则；备注是给运营在界面上读的，不能只写字段名。
- 批量改备注：`+field-get` 读全量定义 → 原样带回 `style` / `options` / `expression` → `+field-update`（`formula`/`lookup` 必须加 `--i-have-read-guide`）。漏带 `style` 会把 URL 列降级成纯文本、丢掉数字精度；漏带 `options` 会清空单选选项。

### contentId 查重校验

主键不强制唯一（实测同号可写入两次），分五层拦：

1. 公式列 `查重`：`IF(ISBLANK([contentId]), "", IF(COUNTIF([推送物料], CurrentValue.[contentId] = [contentId]) > 1, "重复", "唯一"))`。写本表必须用 `[表名]` + `CurrentValue.[字段]`：裸 `[contentId]` 恒为 1，`[表名].[字段]` 直接报错。
2. 视图 `重复项` 筛 `查重 = 重复`。
3. 条件格式给重复行标红：**Base 没有 API/CLI 支持**（`+cond-format-*` 属于 sheets 域），只能在界面按视图配置（规则 `查重` 等于 `重复` → 红色填充），每个视图各配一次。
4. Base 自动化 `contentId 查重告警`（`<WORKFLOW_ID>`，已启用）：ChangeRecordTrigger 带条件组监听 `查重=重复` → 给负责人发飞书消息。
5. 流程侧：按「品类 × 场景」预分号段，写库脚本先做唯一性校验、写库后回读比对。

### 场景键与触发时机

`ul` 解锁 ｜ `ta` 定时（按 `cd`/`cdt` 周期）｜ `ab` 切后台（进后台约 5 秒）｜ `pkg` 应用安装/更新/卸载 ｜ `wifi` 连接/断开 ｜ `rq` 截图（需文件管理权限）｜ `dc` 充电/电量 ｜ `file` 文件新增/删除 ｜ `app` 占位（宿主触发）

### 子场景 subType

`ab`：0 通用，1 广告点击切后台，2 新手流程中断 ｜ `pkg`：1 安装/更新，2 卸载 ｜ `dc`：1 接入充电，2 断开，3 起依次对应 `levels` ｜ `wifi`：1 连接，2 断开 ｜ `file`：1 新增，2 删除。其余场景 `0`=通用。

### 模板选择

| 场景 | 可用模板 |
|-|-|
| `ul` | 901（文）、906（图）、940、920 |
| `ta` | 901、906；高概率 940，低概率 920、904、905 |
| `ab` | 901、902、903（文字）、906（图片） |
| `pkg` | 901、902、903 |
| `wifi` | 901、906、920 |
| `rq` | 901、940 |
| `dc` | 901、906 |
| `file` | 907 |

本业务正式环境只用 **901、902、903、906** 四类模板（已确认），上表仅用于理解手册的场景适配。901/902/903/910/920 读 `content` + `btnText`；906 为纯图片，只读 `imageList`；904/905/940 不读文案。

### 906 图片（imageList 按下标）

尺寸按手册（本项目已确认，模板表数值作废）：

| 下标 | 视图 | 尺寸 |
|-|-|-|
| 0 | 小通知 | 970×160 |
| 1 | 普通通知 | 970×265 |
| 2 | 大通知 | 970×625 |
| 3 | 悬浮窗 | 975×500 |

901 icon 占位图 300×300；910 新闻占位图 540×360。

### 富文本

`<font color="#FF5722">文字</font>`、`<b>加粗</b>`、`<span style="background-color:#FFFF00;">底色</span>`、`<br>` 换行；颜色用十六进制。

## Procedure

1. **定范围**：列产品 × 场景 × 语言矩阵（本项目 5 产品、8 类触发场景、EN/KO/JA/PT/ES 5 语言），先落表再产内容。完成标准：矩阵每格有唯一 contentId 与责任人。
2. **分配 contentId**：按产品段位 + 场景分块编号，写回物料表并检查无重复。完成标准：全表 contentId 唯一且落在所属产品段位内。
3. **写文案**：每个 contentId 出 5 语言 `content` 与 `btnText`，只用允许的富文本标签，`<br>` 控制换行。完成标准：无中文引号、无未转义引号，长度经目标模板实测可完整显示。
4. **产图**：906 需 4 张（小/普通/大/悬浮窗），由外部图像模型生成后去水印、按手册尺寸导出、上传可公开直链（图片生产后续接入，先完成 901–903 文案）。完成标准：4 个直链可无鉴权下载且尺寸正确。
5. **组场景 JSON**：场景对象写 `sts`、`cd`/`cdt`、`dly`/`org_dly`、`vip`、`dcm`、`lt_sts`、`display_type`、`temps`（`dc` 另加 `levels`）；模板对象写 `tempId`、`wgt`、`content`、`btnText`、`contentId`、`subType`，按需加 `autoCancel`、`ongoing`、`cx`/`cxRate`、`overlayCx`/`overlayCxRate`、`lt`、`imageList`。完成标准：JSON 合法且每个启用场景至少一个 `wgt>0` 的模板。
6. **校验**：跑本地脚本检查 JSON 合法性、contentId 唯一性、`subType` 覆盖（精确组权重全 0 不会回退通用模板）、`imageList` 顺序与尺寸。完成标准：脚本零报错。
7. **交付**：整段 JSON 转 Base64 填入 `ol_notify_b64_config`；按手册第九节逐条检查后在目标 App 版本验证样式与跳转。完成标准：线上回读配置正确且真机展示正常。

## Scripts

- `scripts/build_material_table.py` — 建「推送物料」表、分支 `JSON` 公式与 `查重` 公式；产出 `union_tbl.json`（表 id 与字段 id）
- `scripts/build_views.py` — 建三个视图并设定筛选与列顺序（依赖上一个脚本的产物）
- `scripts/write_materials.py` — 写前查重（行内去重 + 与 Base 现有 contentId 比对）→ 批量写入 → 回读校验；用法 `python write_materials.py rows.json`，`fields` 里不要带 `JSON`/`查重`
- `scripts/set_field_descriptions.py` — 批量补/改字段备注；用法 `python set_field_descriptions.py descs.json`（`{"字段名":"备注"}`），内部 `+field-get` → 原样回带 `style`/`options`/`expression` → `+field-update`
- `scripts/insert_field_in_views.py` — 把新字段插到各视图可见列锚点之后；用法 `python insert_field_in_views.py 应用项目编号 品类`

## Pitfalls

- 906 尺寸以手册为准（已确认），模板表里的 1080×150 那套作废，出图别用错。
- 903 没有按钮功能，给它写 `btnText` 不会显示。
- `JSON` 列是公式字段，批量写入的 `fields` 里不能包含它。
- `content`/`btnText` 必须是纯文本列；建成 URL 列会把值按 `[文本](url)` 存，改回文本后残留链接语法，只能重写值。
- `autoCancel`/`ongoing` 用单选列（`true` / `false`）：勾选列转文本会得到 `yes`/`no`，必须重写值；文本列转单选（选项先配好）会保留原值。
- `+field-update` 改 formula 要加 `--i-have-read-guide`；连续改字段会被接口限流（`OpenAPIUpdateField limited`），失败隔开重试。
- 存放位置：新建飞书文档/Base 一律放「我的文档库」，禁止留在云盘。`wiki +space-list` **不返回**个人库，用 `wiki spaces get --params '{"space_id":"my_library"}'` 解析（本项目 space_id `<SPACE_ID>`）；云盘文档迁入用 `wiki +move --obj-type bitable --obj-token <base_token> --target-space-id <my_library_space_id>`，搬完用 `+node-get` 回读（返回 `node_token` 即新链接 `.../wiki/<node_token>`），并复查记录数与公式列未失效。
- 从 Python 调 lark-cli：PATH 上的 `lark-cli` 是 npm 的 sh 包装，`subprocess` 直接调用会 `WinError 2`；用包内原生程序 `C:/Users/cy/AppData/Roaming/npm/node_modules/@larksuite/cli/bin/lark-cli.exe`（Skill 脚本统一用它），或退而用 `node .../@larksuite/cli/scripts/run.js`。
- 新增字段会**自动追加到所有视图可见列的末尾**并按表尾插入，要移到目标位置必须用 `+view-set-visible-fields` 重排；幂等判断不能只查「字段是否已存在」，要比对它的相邻位置。
- `+view-list` 返回的键是 `id`/`name`（不是 `view_id`/`view_name`）；`+record-list` 没有 `--json` 格式开关，用 `--format json`，且返回是列式结构（`fields` 名称数组 + `data` 行数组）。
- `imageList` 的 URL 必须公开可访问、直接返回图片内容；下载失败时该视图不会设置图片。
- 906 不使用 `content`/`btnText`；把文案写进 906 不会显示。
- `subType` 精确匹配组的权重全为 0 时不回退通用模板，本次直接不展示。
- `lt` 重发每 4 秒一次，不受频控与日限拦截，但 App 进程结束后不恢复，全局只保留最新一条重发任务。
- 夜间不展示用 `cdt` 写 `-1`（如 `23:00-06:00:-1`）；时间必须 `HH:mm`，多段用英文分号。
- 字面量 JSON 里不能有多余逗号、中文引号或注释（手册示例中的注释仅为讲解）。
- `dc` 的 `levels` 顺序决定 `subType`；一次跨多个阈值时取数值最低的阈值。
- `lark-cli base` 写记录时 `--json @./file.json` 只接受当前目录的相对路径，且不要再跟 `--json` 当格式 flag（要写 `--format json`），否则报 `flag needs an argument: --json`。
- `+record-batch-update` 的 `patch` 会原样应用到所有目标记录，逐行不同值改用 `lark-cli api POST /open-apis/bitable/v1/apps/<base>/tables/<tbl>/records/batch_update` 的 `records[]`。
- 公式里的 `[表名]` 引用会随表改名失效，改名后必须同步改公式。
- `ChangeRecordTrigger` 的 `condition_list` 不能为空，条件组形状：`[{"conjunction":"and","conditions":[{"field_name":"字段名","operator":"is","value":[{"value_type":"text","value":"值"}]}]}]`。
- `+record-delete` 需要 `--yes`；删除表/记录前先确认是否已获授权。
- `ta` 必须给 `cd>0` 或有效 `cdt`，否则定时任务可能只尝试一次。

## Verification

- 物料表：contentId 唯一、5 语言齐全、图片直链可访问、尺寸与 906 下标一致
- 配置：JSON 解析通过、`ol_notify_b64_config` Base64 可解回原 JSON、线上回读一致
- 真机：在目标 App 版本上逐场景验证通知/悬浮窗样式、按钮跳转、关闭按钮概率
