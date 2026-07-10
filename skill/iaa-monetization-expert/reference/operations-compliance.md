# IAA Reference — 运营流程 / 合规 / 新人路径 / 数据来源

> 属于 `iaa-monetization-expert` skill 的参考文档（按需 Read）。本文末尾的 Data Sources 是全 skill 的引用标记 `[1][2][3][*]` 权威出处。

本文覆盖：广告运营流程（产品引入→上线 SOP、埋点设计 SOP、日常 Checklist）、广告频率与重复率、隐私与合规（ATT/GDPR/CCPA/COPPA）、新人培训路径、常见陷阱、Data Sources（全部引用出处）。

## Ad Operations Workflow (广告运营流程)

### Product Onboarding (产品引入 → 上线)

| Phase | Steps | Notes |
|-------|-------|-------|
| 准备阶段 | 产品需求表（包含基础信息和商业化需求） | 需求表、参数申请、埋点方案可并行推进 |
| 广告设计 | 了解产品内容及商业化设计 → 出广告埋点方案 | 应用公用埋点模板，新产品与产品侧探讨 |
| 参数/物料 | 产品投放参数申请 + 广告参数申请 | 渠道标识、聚合配置 |
| 广告配置 | 后台创建广告源，配置到对应渠道标识/产品下 | 测试广告 / 正式广告区分 |
| 出包验收 | 确认广告样式、触发时机、展示正常 | 按测试用例验收 |
| 上线 | 广告转正、参数填写完成、自定义参数录入 | 运营确认 + 投放发起 |

### Ad Placement Design SOP (广告埋点设计)

1. 了解产品功能和用户主路径
2. 梳理用户流程图，标记自然断点（任务完成、页面切换、等待状态）
3. 参考同类竞品广告场景设计
4. 确定每个断点的广告形式（插屏/激励/Banner/原生）
5. 设计频次控制和触发顺序
6. 输出埋点需求文档（含广告位 ID、触发条件、频次限制、兜底逻辑）
7. 验收时逐个触发验证

### 日常数据运营 Checklist

- 聚合综合管理面板：每日检查填充率、eCPM、展示率
- 广告位数据：分广告位分 geo 查看人均展示、eCPM
- 异常标记：单日波动 > 20% 需排查原因
- 版本监控：新版本上线后一段时间内重点监控广告数据
- 竞品监控：周期性收集竞品广告设计变化

## Ad Frequency and Repetition

### 广告重复率问题

用户反复看到相同广告是常见投诉。降低重复率的可操作手段：

1. **多源变现** — 不同广告源的广告系统和广告主预算构成不同，可降低重复率。但受限于 eCPM 优先策略（如穿山甲一家独大时无法切换），方案可用性依赖高 eCPM 网络的多样性。
2. **控制展示间隔** — 短间隔有较大概率下发相同广告主；适当拉大广告间隔有助于降低重复率。
3. 广告下发内容不在开发者控制范围，关键在于通过架构设计（多源 + 间隔）间接调控。

## Privacy and Compliance

> Directional impacts only. The magnitude of each eCPM drop has **no single authoritative source** (varies by vertical/geo/year) — measure your own before/after, don't quote a fixed percentage.

### iOS ATT (App Tracking Transparency)

- IDFA availability is limited (user must opt in), varying by app category and region
- Without IDFA: personalized ads limited; affected users' eCPM drops noticeably
- SKAdNetwork: conversion value management can recover some attribution; does not directly recover eCPM

### GDPR / CCPA

- Consent management platform (CMP) required for EU/EEA and California users
- Non-consented users: non-personalized ads only; eCPM materially lower than personalized
- IAB TCF 2.2 compliance required for EU demand sources

### COPPA / Child-Directed Apps

- Ad serving limited to child-safe inventory; networks severely restricted
- eCPM drops sharply vs non-child-directed
- If tool is "general audience but used by children," configure age-gating, not COPPA flag

## New Ad Operator Learning Path (新人培训路径)

> 本节为团队内部培训 SOP；其中的数字（误差率 ≤10%、ROI ≥10%、1 个聚合 + 5 个产品等）为**示例培训目标，非行业基准**。

三个月渐进式学习路径：

### Month 1: 学习期 — 掌握核心能力
- 了解核心商业模式、市场规模、目标用户、主要竞品
- 了解公司商业模式、各大广告平台、后台操作（广告配置、广告位管理、广告源管理、屏蔽与展示策略）
- 了解广告展示逻辑及内部调度逻辑
- 数据任务：使用历史数据搭建 SQL 漏斗分析模型，形成每日基础数据报告（误差率 ≤ 10%）
- 实战任务：完成 1 个聚合的广告配置 + 5 个产品配置
- 产出：工作流思维导图、跨部门协同基础

### Month 2: 实践期 — 独立分析
- 对具体产品变现数据进行独立分析（广告位数据、用户数据）
- 根据数据准确定位问题并提出优化思路
- 广告场景拆解：公司产品 vs 竞品广告场景设计调研报告
- 广告埋点设计、需求单、广告配置与验收
- 产出：日常数据复盘模板、SQL 查询模板、竞品广告策略对比报告

### Month 3: 产出期 — 驱动收入增长
- 独立负责 1 条产品线的广告设计与 ROI 优化（目标 ROI ≥ 10%）
- 输出《海外广告优化案例报告》（含 SQL 分析、AB 测试结果、产品线整体复盘）
- 协助搭建数据 BI 看板
- 行业信息、竞品调研、其他商业化探索

## Common Pitfalls

1. **Over-measuring eCPM in isolation.** eCPM × impression volume = revenue. Raising eCPM by reducing impressions (fewer ads, higher floors) often nets less total revenue. Always co-monitor ARPDAU.

2. **Waterfall configuration drift.** Floors set 6 months ago are stale. Networks change; demand shifts. Weekly floor review is minimum viable frequency.

3. **Too many ad networks.** SDK bloat inflates app size, increases crash rate, and adds maintenance overhead. Each network should justify its inclusion by its revenue contribution — prune the ones that don't.

4. **Ignoring geo distribution.** Global average eCPM is meaningless. A spike in Tier 4 installs can look like an eCPM crash. Always segment by geo.

5. **Interstitial on app first launch.** The cost in D1 retention loss almost always exceeds the revenue gain from the impression.

6. **No frequency capping.** Unlimited ad exposure creates short-term revenue spike followed by retention collapse, then revenue collapse.

7. **Rewarded placements with no value.** "Watch an ad for nothing" placements get 0% completion. The reward must be real utility.

8. **Refresh rate too aggressive.** Banner refresh under 30 seconds generates more impressions but each impression is lower-value (advertisers detect and bid down on rapid-refresh inventory). Net eCPM often drops enough to offset impression volume gain.

9. **Testing with insufficient sample.** eCPM is high-variance. Under-powered tests (too few DAU per variant) frequently produce false positives.

10. **Not segmenting by platform.** iOS and Android have different eCPM profiles, ATT impact, and network performance. Always split-platform in analysis.

11. **关注广告重复率但无解决路径.** 重复率高是结果而非根因。根因是广告源单一或展示间隔过短。解决方法：多源接入或拉大间隔，而非试图控制广告内容。

12. **ARPU 下降只查后端不查前端.** ARPU 下降可能是投放端用户构成变化（同渠道不同日期的用户画像差异），而非产品/变现问题。排查时需分版本对比，排除版本迭代因素。

13. **忽视展示率指标.** 高填充低展示 → 广告平台降权 → 填充和 eCPM 双降。展示率应作为日常监控指标。

14. **广告位价值均等假设.** 不同广告位的 eCPM 不同，首个广告位和首激励视频位价值最高。靠后位置频次高但单价低。变现设计时应将高价值广告前置。

15. **开屏 eCPM 误当作可深度优化指标.** 开屏 eCPM 主要反映用户质量，可操控空间小。真正的优化杠杆在投放端筛选用户，而非变现端调参。

16. **混淆结算口径与统计口径.** 用 SDK 统计的展示/预估收益当结算数对账。带 API 的指标才是平台结算口径；不带 API 的是 SDK 实时估算，仅供分析。展示Gap 15% 以内正常。

17. **关闭或不配置默认流量分组.** 默认分组是兜底，未命中其他分组的流量全部流到这里。关闭或不建代码位 = 直接丢量。

18. **过早设置 bidding 竞价底价.** 竞价底价会过滤低于底价的竞胜，直接拉低 bidding 填充与收益。爬坡期不设底价，稳定后再尝试。

19. **并行请求设太多.** 并行只影响请求不影响展示顺序；请求多但展示少 → 平台判定资源利用率低 → 代码位降权。并行 2–3 条，最多 5 条。

20. **预加载后展示率下降就回滚.** 预加载会让展示率下降，这是正常的（提前加载的广告未必都展示），但提升了用户展示机会，对收益是正向的。不要据此回滚预加载。


## Data Sources

**引用标记说明:**
- `[1]` = [穿山甲官方 · 成长中心](https://www.csjplatform.com/growthcenter/6101274400195d0046c2731d)
- `[2]` = [36氪 / Alpha Engineer · AppLovin 分析](https://www.36kr.com/p/3480808267798659)
- `[3]` = TopOn 官方帮助中心（**按主题分文档，见下方 TopOn 表的具体链接**，不止首页）
- `[*]` = 行业经验值（已从正文移除，改为相对排序/方法描述，详见下方"行业经验数据（已移除）"）

### 穿山甲 (CSJ / Pangle-Domestic) 官方资料

| 数据点 | 来源 |
|--------|------|
| 收益公式拆解、展示率/点击率/转化率优化方法论 | [成长中心 · 收益方法论](https://www.csjplatform.com/growthcenter/6101274400195d0046c2731d) |
| 广告有效期（开屏3h/其他1h）、预加载时机选择、安装提示提升3倍转化率、创意区域缩短转化路径 | 同上 |
| 穿山甲广告样式介绍（开屏/Banner/插屏/激励视频/原生） | [广告样式](https://www.csjplatform.com/growthcenter/61010a9cefaa39004d1c0e16) |
| 穿山甲休闲游戏商业化发行指南（GroMore聚合优化策略） | [GroMore 发行指南](https://www.csjplatform.com/growthcenter/6126410ed00c3f00549ff71b) |
| 穿山甲官网 — 工具行业解决方案 | [官网](https://www.csjplatform.com/) |
| GroMore 智能管家、变现自动化 | [成长中心](https://www.csjplatform.com/growthcenter)（2024-01-03 文章） |

### AppLovin / MAX

| 数据点 | 来源 |
|--------|------|
| IGA市场份额28%（全球第一）、iOS 43%、AppLovin发展历程、AXON 2.0 引擎（匹配效率+300%/ROAS+58%）、Take rate 50-60%（vs Unity 30-35%）、2025年战略转型（出售游戏业务/Q2收入$12.59亿/EBITDA利润率81%）、生态位（补量渠道 vs Meta/Google核心渠道）、浑水做空与电商客户流失率23% | [36氪 ·「一页纸」讲透 AppLovin](https://www.36kr.com/p/3480808267798659)（Alpha Engineer / 费斌杰, 2025-09-25） |
| AppLovin 官方 | [applovin.com](https://www.applovin.com/) |

### TopOn (聚合平台) 官方资料 [3]

| 数据点 | 来源 |
|--------|------|
| 聚合平台概况、40+ 广告平台清单、Bidding S2S/C2S 对接方式、各平台报表时区 | [概况](https://help.toponad.net/cn/docs/2KR6QU) |
| 排序价格 vs 底价、自动价格、兜底广告、同价格展示概率、流量分组维度、自动创建广告源 | [①](https://help.toponad.net/cn/docs/cXus5n)、[②](https://help.toponad.net/cn/docs/KjVUSq) |
| 头部竞价原理、支持竞价的平台及竞价底价 | [头部竞价](https://help.toponad.net/cn/docs/dfnwQG) |
| 瀑布流结构参考、精细化分层、每层填充率纪律、并行请求、展示频次控制 | [①](https://help.toponad.net/cn/docs/bUh0Id)、[②](https://help.toponad.net/cn/docs/QXxkrR)、[③](https://help.toponad.net/cn/docs/eUCSzO) |
| 漏斗分析（应用启动→展示→点击各节点转化率与排查） | [漏斗分析](https://help.toponad.net/cn/docs/qlHqYM) |
| 数据来源（三方API vs 统计）、展示Gap排查、有效展示标准 | [①](https://help.toponad.net/cn/docs/Z4zsF6)、[②](https://help.toponad.net/cn/docs/5e6DnV) |
| 收益变动分解排查（DAU/人均请求/填充率/展示率/eCPM 五因子） | [①](https://help.toponad.net/cn/docs/cdsQvH)、[②](https://help.toponad.net/cn/docs/SxzgbM) |
| A/B 测试（预估口径、AABB、辛普森悖论、设备粘性分配） | [A/B 测试](https://help.toponad.net/cn/docs/PqmmHP) |
| 交叉推广 & 直投广告、数据预警、留存价值/用户行为/分小时报表 | [①](https://help.toponad.net/cn/docs/Popzgt)、[②](https://help.toponad.net/cn/docs/LQgwMA)、[③](https://help.toponad.net/cn/docs/p8JTEN) |

### 行业经验数据（已移除）

为保证本 skill 中每个数字都有精确出处，原先一批**无单一权威来源的"行业经验值"已删除**，相关表述改为**相对量级排序或方法描述**（注明"以自己后台实测为准"）。被移除的绝对数值包括：

- 各地区 Tier 的绝对 eCPM 区间（Tier 1/2/3/4 美元区间）
- 各广告形式的绝对 eCPM 区间（Banner / Interstitial / Rewarded / Native）
- CTR 健康区间（各形式的百分比区间）
- 展示率 ≥85% 阈值、填充耗时 <10s/<2s
- 瀑布流底价折扣（均值的 80–90%）、相邻层价差（~20%）、3–4 tiers 经验值
- A/B 测试的具体时长（7–14 天）与样本量门槛（5 万 DAU/组）
- 频次/刷新/广告位数量等零散经验值（1 次/3–5 分钟、30–120s 刷新、≥30s 间隔、按屏数定广告位数等）

**保留的数字**均可追溯到 `[1]` 穿山甲、`[2]` 36氪、`[3]` TopOn（如填充 ≥90%/层 ≥1%、T1/T2/T3 分层数量、并行请求 2–3/≤5、展示 Gap 15%、广告有效期 3h/1h 等）。待找到可引用的权威基准报告（如 Business of Apps 等年度基准）后，再补回带精确出处的绝对值。

