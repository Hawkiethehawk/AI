---
name: iaa-monetization-expert
description: Use when discussing IAA (in-app advertising) monetization for utility/tool apps — ad formats, mediation, eCPM optimization, waterfall vs bidding, ad placement, metrics analysis, A/B testing, funnel diagnostics. Covers AdMob, MAX, ironSource, Unity Ads, Meta Audience Network, Pangle, plus China-market networks (CSJ/Pangle-Domestic, YLH, Kuaishou, Baidu) and the TopOn mediation platform (sort price, backup ads, parallel requests, traffic grouping, S2S/C2S bidding, funnel analysis).
version: 1.4.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [iaa, monetization, advertising, mediation, mobile-apps, utility-apps, china-market, topon]
    related_skills: [iap-monetization-expert]
---

# IAA Monetization Expert — Utility/Tool Apps

## Overview

In-app advertising (IAA) is the primary revenue model for free utility and tool applications. This skill provides the conceptual framework and tactical knowledge for optimizing ad revenue in tools (cleaners, calculators, scanners, converters, file managers, VPNs, launchers, etc.) where user sessions are task-driven and typically short.

Core premise: ad revenue = impressions × eCPM / 1000. Optimization targets either increasing qualified impressions or raising eCPM, constrained by retention and user experience trade-offs.

> **Source markers (used throughout this skill & its reference files):** `[1]` = 穿山甲官方 · `[2]` = 36氪 AppLovin 分析 · `[3]` = TopOn 官方帮助中心 (full links in `reference/operations-compliance.md` → Data Sources). Unmarked content is general formula/concept/structural fact. Absolute benchmark values with no single authoritative source have been removed in favour of relative orderings or method descriptions.

## When to Use

- Analyzing ad revenue data, metrics, or dashboards
- Designing or reviewing ad placement strategies
- Debugging eCPM drops, fill rate issues, or revenue fluctuations
- Evaluating mediation platforms or ad network choices
- Planning A/B tests for ad-related changes
- Building or refining an ad monetization model
- Comparing waterfall vs in-app bidding vs hybrid approaches
- Optimizing for specific geos, platforms (Android/iOS), or ad formats
- Onboarding new ad operations personnel (learning path, SOP, task checklist)

## How to navigate this skill (progressive disclosure)

The deep reference material lives in `reference/` — **read the file matching the question** rather than loading everything. Pick by topic:

| 你的问题属于… | 读这个文件 |
|---|---|
| 指标定义（ARPU/ARPDAU/eCPM/填充率…）、ARPU & eCPM 分解、漏斗分析、eCPM 三率节点、**收益问题诊断**（eCPM 掉、填充率低、收入不涨、展示率异常、收入分解走查）、误点分析 | [reference/metrics-and-diagnostics.md](reference/metrics-and-diagnostics.md) |
| 广告形式选型、广告网络（全球 T1/T2 + 国内 CSJ/YLH/快手/百度）、瀑布流 vs Bidding vs 混合、自建聚合预加载、并行请求/兜底/分组/频控、**各聚合平台配置**（AdMob/MAX/ironSource/穿山甲/TopOn） | [reference/formats-networks-mediation.md](reference/formats-networks-mediation.md) |
| 广告位设计（按品类埋点、产品类型×广告构成、设计原则、广告位数量）、地区优化（eCPM Tier、分地区瀑布流、开屏作用户价值信号）、A/B 测试（变量/设计/评估/平台机制陷阱） | [reference/placement-geo-abtest.md](reference/placement-geo-abtest.md) |
| 广告运营流程（产品引入 SOP、埋点设计 SOP、日常 Checklist）、广告频率/重复率、隐私合规（ATT/GDPR/CCPA/COPPA）、新人培训路径、常见陷阱、**全部引用出处（Data Sources）** | [reference/operations-compliance.md](reference/operations-compliance.md) |

> 经验法则：先看下面的「优化优先级」定位环节 → 再进对应 reference 文件取细节。诊断类问题直接进 metrics-and-diagnostics。

## Quick Reference: Revenue Optimization Priority

1. Get mediation configuration right (bidding pool + waterfall tail)
2. Set floor prices per geo per format
3. Design placements at task-completion boundaries; 高价值广告位前置
4. Add rewarded video where synthetic value can be created
5. A/B test frequency caps
6. Add/remove networks based on incremental contribution
7. Optimize for platform-specific patterns (iOS ATT, Android OEM variance)
8. Build UA strategy aligned with monetization (acquire users in eCPM-efficient geos; 投放端筛选高价值用户)
9. 日常监控展示率，避免代码位降权
10. 建立数据复盘模板（SQL 漏斗 + 分版本对比）
11. 用流量分组按 geo/渠道/用户价值精细化分层（T1 30–40 层，T3 10–20 层）
12. 用漏斗分析定位每环节流失，分广告位看人均次数
13. 配置数据预警监控关键维度单日波动，区分 API 与统计口径对账

## Verification Checklist

- [ ] All ad units have per-geo configurations where geo eCPM variance is large
- [ ] Floor prices reviewed recently (weekly cadence)
- [ ] Bidding enabled for all bidding-capable networks
- [ ] Interstitial frequency cap configured (≤ 1 per 3 minutes)
- [ ] No interstitial on app-first-launch path
- [ ] Each active network earns its place by revenue contribution (or has a documented strategic reason)
- [ ] Rewarded placements unlock demonstrable user value
- [ ] CMP configured for GDPR/CCPA regions
- [ ] Analytics dashboard segments revenue by geo, platform, ad unit, and network
- [ ] 展示率作为日常监控指标纳入 dashboard
- [ ] 新版本上线后有一段密切监控广告数据的流程
- [ ] 广告埋点设计包含触发条件、频次限制、兜底逻辑三个要素
- [ ] 默认流量分组 (catch-all) 未关闭且配有有效广告源
- [ ] 每个广告位整体填充率 ≥ 90%，各层填充率 ≥ 1%
- [ ] 并行请求条数 ≤ 5（避免请求不展示导致代码位降权）
- [ ] 开屏 waterfall ≤ 5 层，并配置兜底/SDK预置应对首次冷启动超时
- [ ] 报表分析区分三方API（结算口径）与SDK统计（实时口径），展示Gap 监控阈值 15%
- [ ] 数据预警规则已配置（关键维度单日波动 >20%）

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
