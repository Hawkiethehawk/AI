---
name: iap-monetization-expert
description: Use when discussing IAP (in-app purchase) monetization for utility/tool apps — subscriptions, one-time unlocks, consumables, paywall design, pricing, free trials & intro offers, conversion funnels, trial-to-paid, renewal/churn/retention, refunds, dunning, and LTV. Covers App Store & Google Play subscription mechanics (commission tiers, grace period, billing retry, server notifications), subscription infrastructure (RevenueCat, Adapty, Superwall, Qonversion), paywall & price A/B testing, China-market channel billing, and funnel/cohort diagnostics.
version: 1.1.0
author: Modeled on iaa-monetization-expert
license: MIT
metadata:
  hermes:
    tags: [iap, monetization, subscription, paywall, pricing, free-trial, churn, ltv, mobile-apps, utility-apps, app-store, google-play, revenuecat]
    related_skills: [iaa-monetization-expert]
---

# IAP Monetization Expert — Utility/Tool Apps

## Overview

In-app purchase (IAP) — chiefly **auto-renewable subscriptions**, plus one-time unlocks and consumables — is the high-value monetization model for utility and tool apps (cleaners, scanners, converters, file managers, VPNs, photo/PDF tools, habit/productivity apps). Unlike IAA (ad revenue = impressions × eCPM), IAP revenue is driven by **converting a small fraction of users to payers and retaining them**. This skill provides the conceptual framework and tactical knowledge for growing subscription/IAP revenue in tools.

Core premise:

```
IAP 收益 ≈ 新增用户 × 付费转化率 × 留存价值（LTV）
更精确（订阅制）: LTV/install = 试用启动率 × 试用转化率 × Σ(各期续订留存 × 净单价)
```

Optimization targets either **raising conversion** (paywall, pricing, trial, offer) or **raising retained value** (renewal/retention, reducing voluntary & involuntary churn), constrained by user trust, refund/chargeback, and store policy. The decision metric is always **realized LTV per install (net of store commission)**, never conversion rate alone.

> **Source markers (used throughout this skill & its reference files):** `[1]` = Apple 官方文档 · `[2]` = Google Play 官方文档 · `[3]` = RevenueCat（State of Subscription Apps 基准报告 + 文档）· `[4]` = Adapty（订阅基准报告 + 文档）. Full links in `reference/paywall-pricing-ops.md` → **Data Sources**. Unmarked content is general formula/concept/structural fact. **Absolute benchmark numbers (conversion %, retention %, etc.) have no single authoritative value — they vary widely by category/geo/price/period.** This skill gives relative orderings and method; read live numbers from the cited benchmark reports and, above all, **your own dashboard**.

## When to Use

- Designing or reviewing a paywall (placement, timing, framing, offer)
- Choosing a monetization model (subscription vs one-time vs hybrid; weekly/monthly/annual mix)
- Setting or testing pricing (price points, anchoring, intro offers, localized pricing)
- Diagnosing conversion drops, trial-to-paid weakness, churn spikes, or refund spikes
- Planning A/B tests for paywalls, prices, trials, or offers
- Building or refining an IAP revenue / LTV model
- Configuring App Store / Google Play subscriptions, entitlements, or server notifications
- Evaluating subscription infrastructure (RevenueCat, Adapty, Superwall, Qonversion)
- Handling subscription lifecycle: grace period, billing retry, dunning, win-back, refunds
- Onboarding new monetization personnel (learning path, SOP, checklist)

## Monetization Models (IAP 类型)

| Model | StoreKit/Billing 类型 | 工具 App 用法 | 取舍 |
|-------|----------------------|---------------|------|
| **Auto-renewable subscription（自动续订订阅）** | auto-renewable | 解锁全部高级功能、去广告、去使用上限；主力模型 | 复利留存价值最高，但需持续提供价值、受续订/流失驱动 |
| **Non-renewing / Lifetime（一次性买断）** | non-consumable / non-renewing | "终身高级版"、一次性解锁某功能 | 无续订、现金前置；缺乏复利但降低决策摩擦，适合做锚点 |
| **Consumable（消耗型）** | consumable | 按次付费（如 N 次转换/扫描的点数包） | 适合使用量驱动的工具；与订阅互补 |
| **Freemium + 内购** | 混合 | 免费可用核心 + 付费墙锁高级 | 工具最常见；靠免费获量、内购变现 |
| **Hybrid（广告 + 内购）** | 混合 | 免费看广告（见 [[iaa-monetization-expert]]）+ "去广告订阅" | 同一用户两条变现路径；去广告订阅本身是强转化点 |

**工具类典型打包（packaging）模式：**
- **去广告 + 高级功能捆绑订阅**（最常见，去广告是强动机）
- **使用上限解锁**（免费每日 N 次，订阅无限）
- **高级功能墙**（OCR、批量、导出格式、云同步、无水印等锁在订阅后）
- **试用→订阅**（限免体验全功能 X 天）

**订阅周期组合：** 通常提供 **周 / 月 / 年（+ 可选终身）**。年订单价最高、留存最久、是 LTV 主力；周/月降低首次决策门槛但流失快、退款率高（尤其硬付费墙 + 周订）。具体最优组合按品类与地区由 A/B 决定。

## How to navigate this skill (progressive disclosure)

深度内容在 `reference/`，**按问题读对应文件**，不要一次性全载：

| 你的问题属于… | 读这个文件 |
|---|---|
| 指标（转化/收入、留存/流失、结算口径 vs 平台估算）、LTV 分解树、转化漏斗、续订留存曲线、主动/被动流失、订阅生命周期与 dunning、**收益问题诊断**（转化下降、试用转化低、续订流失、退款上升、收入走 LTV 树） | [reference/metrics-funnel-diagnostics.md](reference/metrics-funnel-diagnostics.md) |
| 付费墙设计、定价策略、免费试用与 intro offer、App Store/Google Play 商店机制、订阅基础设施（RevenueCat/Adapty/Superwall/Qonversion）、国内市场、按工具类型打包、A/B 测试、隐私合规、运营流程、新人路径、常见陷阱、**全部引用出处（Data Sources）** | [reference/paywall-pricing-ops.md](reference/paywall-pricing-ops.md) |

> 经验法则：先用下面的「优化优先级」定位环节 → 再进对应 reference 文件取细节；诊断问题直接进 metrics-funnel-diagnostics。

## Quick Reference: IAP 优化优先级

1. 把付费墙放到**价值时刻**、覆盖主路径（拉高触达率与试用启动）
2. 用**免费试用 / intro offer** 降低首次决策门槛
3. **突出年订**（月均锚定 + 节省比例），减少套餐选项
4. 接好**订阅平台 + 服务端通知**，管好权益与续订状态机
5. 开 **grace period + dunning**，挽回被动流失
6. 以 **LTV/install** 为主指标做**付费墙与价格 A/B**
7. **本地化定价**、争取 **Small Business / 一年降档** 抬净单价
8. 按**队列 + 渠道 + 地区**做留存与转化复盘，配异常预警
9. 对齐**合规**（披露/恢复购买/持续价值），压住退款根因
10. 与获量协同：在 **LTV 高效的渠道/地区**买量（净 LTV > CAC）

## Verification Checklist

- [ ] 主指标用 **LTV/install（净额）**，不是单看转化率
- [ ] 对账用商店 proceeds（已扣佣金/退款/税/汇率），平台数据仅做实时诊断
- [ ] 付费墙在价值时刻触发，覆盖主路径（onboarding/情境）
- [ ] 提供**恢复购买**，订阅披露价格/周期/续订（过 Apple 3.1.x / Play 政策）
- [ ] 接入**服务端通知**（ASSN V2 / RTDN）并管好续订状态机
- [ ] 开启 **grace period + billing retry + dunning** 挽回被动流失
- [ ] 区分主动/被动流失，分别归因
- [ ] 周期组合含年订并在付费墙突出，套餐选项精简
- [ ] 免费试用/intro offer 已配，试用期内有价值送达 + 到期提醒
- [ ] **本地化定价**，并争取 Small Business / 一年降档佣金
- [ ] A/B 以 LTV/install 为主、退款/留存为护栏，按队列随机、看长尾
- [ ] 报表按**队列 + 渠道 + 地区 + 付费墙版本**拆分
- [ ] 关键指标（转化/退款/MRR/被动流失）配异常预警
- [ ] 退款率异常时回到付费墙与定价查根因，而非仅压制

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
