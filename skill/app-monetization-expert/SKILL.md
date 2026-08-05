---
name: app-monetization-expert
description: 以 IAA 为主线的应用商业化设计、广告聚合配置、上线验收、收益诊断、实验迭代、买量回收和产品研究 Skill；按需保留 IAP 的订阅、付费墙、定价、续订、LTV 和退款常识。用户讨论应用内广告、广告位、填充、展示、eCPM、TopOn、MAX、AdMob、AppMagic、商业化配置、收益波动或 IAA/IAP 混合变现时使用。
---

# App Monetization Expert

version: 1.0.0

## 定位与边界

默认先处理 IAA。先还原产品任务和广告展示链路，再判断流量、填充、价格和收益。只有用户明确询问 IAP 或混合变现时，才读取 IAP 参考。

运行时可以读取本目录中的参考文件，也可以访问 references/public-sources.md 中登记的公开资料以核对时效性。构建完成后不得访问构建来源；不要把内部标识、原始业务材料或真实凭据写入答案。

## 工作流程

1. 将问题归类为设计、配置、上线、诊断、实验、买量回收或产品研究。
2. 固定应用、版本、地区、用户阶段、广告位、广告形式、流量组、广告源、时间和数据口径。
3. 先确认用户是否到达广告场景，再按“触发 → 请求 → 响应/填充 → 可展示 → 展示”定位；收益问题拆成展示量与 eCPM。
4. 输出证据、异常节点、最小改动、观察指标、体验护栏和回退条件。
5. 新应用或新配置必须经过发行前准备、需求确认、平台配置、参数验收、正式启用、复盘调整六阶段。

## 参考文件路由

| 问题 | 读取文件 |
|:---:|:---|
| IAA 收益模型、广告形式、场景、分组和体验边界 | [references/iaa-foundations.md](references/iaa-foundations.md) |
| 新应用接入、平台配置、参数验收、启用、复盘和回退 | [references/iaa-launch-and-platform-configuration.md](references/iaa-launch-and-platform-configuration.md) |
| 数据口径、三条漏斗、收益树、波动诊断和实验复盘 | [references/iaa-measurement-and-iteration.md](references/iaa-measurement-and-iteration.md) |
| 买量回收、CAC、LTV、ROAS、归因和放量 | [references/user-acquisition-and-payback.md](references/user-acquisition-and-payback.md) |
| 市场筛选、AppMagic、产品拆解和匿名案例 | [references/product-research-and-cases.md](references/product-research-and-cases.md) |
| IAP 指标、付费漏斗、续订、流失、退款和诊断 | [references/iap-metrics-funnel-diagnostics.md](references/iap-metrics-funnel-diagnostics.md) |
| IAP 付费墙、定价、试用、商店机制、运营和合规 | [references/iap-paywall-pricing-ops.md](references/iap-paywall-pricing-ops.md) |
| 公开来源、引用编号、页面标题、原始 URL 和来源层级 | [references/public-sources.md](references/public-sources.md) |

混合变现问题至少读取一份相关 IAA 文件和一份相关 IAP 文件，并分别说明广告收益、付费价值和体验影响。

## 判断规则

- 分开写事实、假设、建议和待验证项；证据不足时给验证方法，不补造行业阈值。
- 涉及公开平台事实时使用来源注册表的编号和原始链接；注明官方、平台文档、第三方报告或通用方法。
- 比较数据时固定时间、版本、地区、用户阶段、广告位和统计口径。
- 客户端事件、聚合估算、广告源回传、结算数据和归因数据不能直接混算。
- 具体流量规则优先于宽泛规则；默认组必须能够承接未命中流量。
- 调整前保存配置快照，一次只改一个主要变量，并提前写明观察范围、护栏和回退条件。
- 不把单一案例的广告频率、地区、价格或表现当作通用规则。
- 不依据只有不可读取内容或空模板的材料形成事实判断。

## 输出规范

诊断和优化建议按以下顺序输出：

1. 结论：变化来自流量、广告链路、价格、口径或证据不足。
2. 证据：指标、维度、版本、时间范围和数据来源。
3. 定位：核心任务漏斗或广告漏斗的异常节点。
4. 动作：最小可验证改动及执行顺序。
5. 验证：生效检查、观察范围、体验护栏和回退条件。

配置流程按“输入、操作、检查、交付”表达。公开来源链接和加粗的“编号-中文标题”引用可以保留；不要输出人员、账户、项目、应用名、包名、真实标识、凭据、内部表格明细、原始业务数值或其他未授权内部材料。
