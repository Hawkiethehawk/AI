---
name: topn-open-api
description: Plan and execute safe read-only TopOn Open API data collection independently from the Monety analysis skill. Use when the user explicitly asks about TopOn Open API capabilities, endpoint coverage, Publisher Key preparation, authentication, report or configuration retrieval plans, dry-runs, pagination, rate limits, or future API integration. Do not use this skill for uploaded report analysis or monetization strategy; route those tasks to $monety.
---

# Topn Open API

把 TopOn Open API 当作独立数据接入层。只负责能力查询、采集计划、只读调用和原始响应治理，不承担业务分析、归因或配置优化。

## 工作边界

- 读取 `references/open-api-capabilities.json` 确认可用报表、配置接口、维度、限制和文档状态。
- 读取 `references/open-api-workflow.md` 执行鉴权、分页、时区、限流、敏感数据和只读保护。
- 搜索本 skill 自带的 Open API 帮助文档快照，核对原始 URL 和页面口径。
- 没有 Publisher Key 时只生成采集预案，不尝试调用接口，也不要求用户现在配置凭据。
- 取得原始响应后，保留端点、参数、分页、抓取时间和内容哈希，再把数据交给 `$monety` 标准化和分析。
- 不修改广告位、广告源、流量分组、Waterfall 或 A/B 测试配置。写接口不在当前允许范围内。

## 查询接口能力

先按任务检查能力目录：

```powershell
python scripts/search_topon_docs.py "综合报表 API" --limit 8
```

再打开命中的 `references/topon-help/docs/*.md`。本地帮助中心是产品参考，不代表接口当前一定可用；准备真实接入前必须在线复核接口状态和账号权限。

## 生成无凭据采集预案

项目目录可以只有 `context.json`，也可以为空：

```powershell
python scripts/plan_open_api_collection.py <project-dir> --start-date 2026-07-01 --end-date 2026-07-20 --profile all --include-config --output <project-dir>/open-api-collection-plan.json
```

默认币种为 USD，默认统计时区为 UTC+0。应用 ID 未登记时，计划应保留发现步骤并阻断依赖应用 ID 的报表调用，不得猜测 ID。

## 执行只读调用

先 dry-run 单个已启用计划项：

```powershell
python scripts/execute_open_api_call.py <plan.json> --call-id <call-id> --dry-run
```

用户取得 Publisher Key 并明确授权后，从环境变量读取：

- 报表接口使用 `TOPON_REPORT_PUBLISHER_KEY`。
- 管理只读接口使用 `TOPON_MANAGEMENT_PUBLISHER_KEY`。

不得通过命令行参数、Skill 文件、报告、飞书文档或聊天输出传递密钥。真实调用先选一个窄日期、单应用的计划项验证签名和返回结构，再扩大范围。

## 交给主 skill

将原始响应和调用清单放在项目外部数据目录，不复制进本 skill。调用 `$monety` 时提供：

- 原始响应路径和端点名称；
- 请求时间范围、时区、币种和应用 ID；
- 分页完成状态、抓取时间和失败项；
- 使用的能力目录版本；
- 任何字段缺失、权限限制或接口文档歧义。

`$monety` 决定字段标准化、质量审计、证据等级和策略建议。本 skill 不对现实业务表现作结论。
