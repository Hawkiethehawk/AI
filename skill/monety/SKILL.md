---
name: monety
description: 以 IAA 为主线的应用商业化设计、广告聚合配置、上线验收、收益诊断、实验迭代、TopOn CSV/TSV/XLSX/XLSM 报表分析、买量回收和产品研究 Skill；按需保留 IAP 的订阅、付费墙、定价、续订、LTV 和退款常识。用户讨论应用内广告、广告位、填充、展示、eCPM、TopOn、MAX、AdMob、TopOn 报表、数据质量、漏斗诊断、商业化配置、收益波动或 IAA/IAP 混合变现时使用。
---

# Monety

version: 1.1.0

## 定位与边界

默认先处理 IAA。先还原产品任务和广告展示链路，再判断流量、填充、价格和收益。用户提供 TopOn CSV、TSV、XLSX 或 XLSM 报表时，先走 TopOn 报表分析流程；只有用户明确询问 IAP 或混合变现时，才读取 IAP 参考。

运行时可以读取本目录中的参考文件，也可以联网访问 references/public-sources.md 中登记的公开资料以核对时效性；构建完成后不得再访问受限构建来源。不要把内部标识、原始业务材料、用户报表、原始响应或真实凭据写入答案。

## 工作流程

1. 将问题归类为设计、配置、上线、诊断、实验、报表分析、买量回收或产品研究。
2. 固定应用、版本、地区、用户阶段、广告位、广告形式、流量组、广告源、时间和数据口径。
3. 先确认用户是否到达广告场景，再按“触发 → 请求 → 响应/填充 → 可展示 → 展示”定位；收益问题拆成展示量与 eCPM。
4. 若输入是报表，先识别类型、标准化字段、审计质量和证据等级，再进行归因或建议。
5. 输出证据、异常节点、最小改动、观察指标、体验护栏和回退条件。
6. 新应用或新配置必须经过发行前准备、需求确认、平台配置、参数验收、正式启用、复盘调整六阶段。

## 参考文件路由

| 问题 | 读取文件 |
|:---:|:---|
| IAA 收益模型、广告形式、场景、分组和体验边界 | [references/iaa-foundations.md](references/iaa-foundations.md) |
| 新应用接入、平台配置、参数验收、启用、复盘和回退 | [references/iaa-launch-and-platform-configuration.md](references/iaa-launch-and-platform-configuration.md) |
| 数据口径、三条漏斗、收益树、波动诊断和实验复盘 | [references/iaa-measurement-and-iteration.md](references/iaa-measurement-and-iteration.md) |
| TopOn 入口、任务路由、证据边界和一键分析 | [references/topn-analysis.md](references/topn-analysis.md) |
| TopOn 报表类型、字段口径、公式、可加性和数据质量 | [references/topn/data-contract.md](references/topn/data-contract.md)、[references/topn/metric-catalog.json](references/topn/metric-catalog.json)、[references/topn/report-types.json](references/topn/report-types.json) |
| TopOn 证据等级、窗口选择、实验门槛和建议流程 | [references/topn/adaptive-evidence-thresholds.md](references/topn/adaptive-evidence-thresholds.md)、[references/topn/evidence-and-guardrails.md](references/topn/evidence-and-guardrails.md)、[references/topn/recommendation-workflow.md](references/topn/recommendation-workflow.md) |
| TopOn 报表批处理、标准化、质量审计和 Data Analytics 交接 | [scripts/topn/run_topn_analysis.py](scripts/topn/run_topn_analysis.py)、[scripts/topn/inspect_topon_report.py](scripts/topn/inspect_topon_report.py)、[scripts/topn/audit_topn_data.py](scripts/topn/audit_topn_data.py)、[scripts/topn/build_data_analytics_artifact.py](scripts/topn/build_data_analytics_artifact.py) |
| TopOn 帮助中心文本快照和本地检索 | [references/topn/topon-help/index.json](references/topn/topon-help/index.json)、[scripts/topn/search_topon_docs.py](scripts/topn/search_topon_docs.py) |
| TopOn 分析报告和实验计划输出模板 | [references/topn/report-output.md](references/topn/report-output.md)、[assets/topn/analysis-report-template.md](assets/topn/analysis-report-template.md)、[assets/topn/experiment-plan-template.md](assets/topn/experiment-plan-template.md) |
| 买量回收、CAC、LTV、ROAS、归因和放量 | [references/user-acquisition-and-payback.md](references/user-acquisition-and-payback.md) |
| 市场筛选、AppMagic、产品拆解和匿名案例 | [references/product-research-and-cases.md](references/product-research-and-cases.md) |
| IAP 指标、付费漏斗、续订、流失、退款和诊断 | [references/iap-metrics-funnel-diagnostics.md](references/iap-metrics-funnel-diagnostics.md) |
| IAP 付费墙、定价、试用、商店机制、运营和合规 | [references/iap-paywall-pricing-ops.md](references/iap-paywall-pricing-ops.md) |
| 公开来源、引用编号、页面标题、原始 URL 和来源层级 | [references/public-sources.md](references/public-sources.md) |

混合变现问题至少读取一份相关 IAA 文件和一份相关 IAP 文件，并分别说明广告收益、付费价值和体验影响。

## TopOn 报表分析工作流

支持 CSV、TSV、XLSX 和 XLSM。用户声明数据为现实业务数据时使用 `observed`；明确只作字段或流程样例时使用 `fixture`。fixture 的证据等级固定为 D，不得形成现实归因或具体配置建议。

在 Skill 根目录运行：

```powershell
python scripts/topn/run_topn_analysis.py <报表或目录> --project <项目名> --trust-status observed --surface report
```

该入口依次识别综合、漏斗或聚合管理报表，映射规范字段，隔离汇总行和混合粒度，生成 Data Analytics artifact，审计完整性/唯一性/有效性/一致性/时间连续性，评估 7、14、28、56 日自适应证据窗口，并输出 `analysis-manifest.json`。单独检查结构时运行 `python scripts/topn/inspect_topon_report.py <report.xlsx> --output <inspection.json>`；字段无法映射时显式提供 `规范字段 -> 原始列名` JSON，不让分析工具猜列名或粒度。

现实数据的主要结论只能由 `[观测]` 和 `[计算]` 支持；TopOn 帮助中心属于 `[文档]`，未排除的原因属于 `[推断]`，拟验证动作属于 `[建议]`。结论同时标注 A/B/C/D：D 或质量 `blocked` 时停止归因和配置建议，质量 `limited` 时关键结论不超过 C 级。不要设置统一 DAU 门槛，按实际分母、历史噪声、完整窗口和业务最小变化判断证据强度。

分析现实数据时必须把 `data-quality.json`、`evidence-evaluation.json` 和 `data-analytics-artifact.json` 交给 Data Analytics：质量问题走 `analyze-data-quality`，指标变化走 `metric-diagnostics`，策略取舍走 `product-business-analysis`，需要交付报告走 `build-report`。TopOn Open API 的鉴权和采集仍显式交给独立的 `$topn-open-api`，不得在本 Skill 中处理密钥或绕过采集边界。

## 判断规则

- 分开写事实、假设、建议和待验证项；证据不足时给验证方法，不补造行业阈值。
- TopOn 报表结论按 `[文档]`、`[观测]`、`[计算]`、`[推断]`、`[建议]`区分信息角色，并写明证据等级。
- 涉及公开平台事实时使用来源注册表的编号和原始链接；注明官方、平台文档、第三方报告或通用方法。
- 比较数据时固定时间、版本、地区、用户阶段、广告位和统计口径。
- 客户端事件、聚合估算、广告源回传、结算数据和归因数据不能直接混算。
- `estimated_revenue` 是 TopOn 预估收益，`revenue_api` 是第三方广告平台报表收益；`impressions` 是 TopOn SDK 展示回调，`impressions_api` 是第三方平台报表展示，二者只做对账。
- `estimated_ecpm = estimated_revenue / impressions * 1000`；ARPDAU、填充率、展示率、竞价响应率和竞胜率必须从规范分子/分母重算，不能平均行级比率。
- DAU、DEU、留存率、ARPU、ARPDAU、eCPM 和比率不能跨重复粒度直接求和；聚合管理报表的 Total 行请求与广告源明细请求不能混合。
- 当前周期与基线周期必须覆盖相同数量的完整自然日；缺失、接口未返回和真实零值必须区分。
- 具体流量规则优先于宽泛规则；默认组必须能够承接未命中流量。
- 调整前保存配置快照，一次只改一个主要变量，并提前写明观察范围、护栏和回退条件。
- 不把单一案例的广告频率、地区、价格或表现当作通用规则。
- 不依据只有不可读取内容或空模板的材料形成事实判断。

## 输出规范

诊断、TopOn 报表分析和优化建议按以下顺序输出：

1. 结论：变化来自流量、广告链路、价格、口径或证据不足。
2. 证据：指标、维度、版本、时间范围和数据来源。
3. 定位：核心任务漏斗或广告漏斗的异常节点。
4. 动作：最小可验证改动及执行顺序。
5. 验证：生效检查、观察范围、体验护栏和回退条件。

TopOn 报表交付还要写明数据范围、粒度、币种、时区、预估/结算口径、质量状态、证据等级、主要发现、贡献拆解、限制、建议实验和官方文档引用，并将“发生了什么”和“为什么发生”分开。

配置流程按“输入、操作、检查、交付”表达。公开来源链接和加粗的“编号-中文标题”引用可以保留；不要输出人员、账户、项目、应用名、包名、真实标识、凭据、内部表格明细、原始业务数值或其他未授权内部材料。
