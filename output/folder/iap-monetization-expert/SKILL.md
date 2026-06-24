---
name: iap-monetization-expert
description: Use when discussing IAP (in-app purchase) monetization for utility/tool apps — subscriptions, one-time unlocks, consumables, paywall design, pricing, free trials & intro offers, conversion funnels, trial-to-paid, renewal/churn/retention, refunds, dunning, and LTV. Covers App Store & Google Play subscription mechanics (commission tiers, grace period, billing retry, server notifications), subscription infrastructure (RevenueCat, Adapty, Superwall, Qonversion), paywall & price A/B testing, China-market channel billing, and funnel/cohort diagnostics.
version: 1.0.0
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

> **Source markers (used throughout):** `[1]` = Apple 官方文档 · `[2]` = Google Play 官方文档 · `[3]` = RevenueCat（State of Subscription Apps 基准报告 + 文档）· `[4]` = Adapty（订阅基准报告 + 文档）. Full links in the **Data Sources** section. Unmarked content is general formula/concept/structural fact. **Absolute benchmark numbers (conversion %, retention %, etc.) have no single authoritative value — they vary widely by category/geo/price/period.** This skill gives relative orderings and method; read live numbers from the cited benchmark reports and, above all, **your own dashboard**.

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

## Core Metrics

### 转化与收入指标

| Metric | 定义 / 公式 | 解读 |
|--------|------------|------|
| **付费转化率 CVR** | 付费用户 / 新增（或 install→paid） | 总体变现效率首要指标 |
| **试用启动率（Trial Start Rate）** | 启动试用 / 看到付费墙（或 / install） | 付费墙吸引力 |
| **试用转化率（Trial→Paid）** | 转为付费 / 启动试用 | 试用价值 + 退订摩擦的综合结果，订阅经济最关键的一环之一 |
| **ARPU** | 总收入 / 全部用户 | 每用户变现效率（含免费用户） |
| **ARPPU** | 总收入 / 付费用户 | 每付费用户价值 |
| **LTV / install** | 见下方分解 | 每个新增用户的预期净终身价值，**所有取舍的最终裁判** |
| **MRR / ARR** | 月度 / 年度经常性收入 | 订阅业务的存量健康度 |
| **Proceeds（净收入）** | 收入 − 商店佣金（见 Store Mechanics） | **真正进账**，对账与 LTV 必须用净额 |

### 留存与流失指标

| Metric | 定义 | 解读 |
|--------|------|------|
| **续订留存（Renewal Retention）** | 第 N 期仍在订阅 / 首期付费 | LTV 的核心乘子；按 M1/M2/M3… 队列看 |
| **流失率（Churn）** | 1 − 续订留存（按期） | 分**主动流失**（用户取消）与**被动流失**（扣款失败，involuntary） |
| **被动流失率（Involuntary Churn）** | 扣款失败导致的流失 | 常被忽视但占比可观；靠 billing retry / grace period / dunning 挽回 |
| **挽回率（Recovery Rate）** | 宽限期/重试内恢复扣款 / 进入宽限的订阅 | 衡量 dunning 成效 |
| **退款率（Refund Rate）** | 退款金额或单数 / 总额 | 过高反映付费墙误导、误触订阅、价值不符 |

### 结算口径 vs 平台估算（与 IAA 同理的"两套数据"陷阱）

- **商店结算口径（App Store Connect / Play Console 的 Proceeds）= 唯一的钱**：已扣佣金、含退款冲减、按商店货币换算，有延迟（结算周期）。对账只认它。`[1][2]`
- **订阅平台/SDK 的实时估算（RevenueCat 等）= 用于实时漏斗/队列分析**：基于交易事件即时计算 MRR、试用转化、留存，**预估**收入；与结算额会有 GAP（退款、汇率、佣金、税）。`[3][4]`
- 永远用净额（proceeds）算 LTV；用平台实时数据做诊断，但对账回到商店结算。

## LTV 分解树（IAP 版"收益树"）

把 LTV 拆开，数字一动就能定位到具体叶子——这是后面所有诊断的地基。

```
                         LTV / install（净）
                               │
        ┌──────────────────────┼──────────────────────┐
   付费墙触达率              试用/购买转化            留存价值（续订）
 (看到付费墙的用户占比)   ┌────────┴────────┐      ┌────────┴────────┐
                      试用启动率      试用→付费率   各期续订留存   净单价
                                                             (price − 佣金 − 退款 − 税)
```

用公式串起来（订阅制）：

$$\text{LTV/install} = \text{付费墙触达率} \times \text{试用启动率} \times \text{试用转化率} \times \sum_{n} (\text{第 n 期续订留存} \times \text{净单价})$$

| 叶子 | 你能控制吗 | 主要杠杆 |
|------|-----------|----------|
| **付费墙触达率** | ✅ 高 | 付费墙放在哪、何时弹、onboarding 是否必经付费墙 |
| **试用启动率** | ✅ 高 | 付费墙文案/价值呈现/视觉、试用门槛、是否要信用卡 |
| **试用转化率** | ⚠️ 中 | 试用时长、试用期内是否体现价值、到期提醒、退订摩擦 |
| **续订留存** | ⚠️ 中 | 产品持续价值、再触达、被动流失挽回（dunning） |
| **净单价** | ⚠️ 部分 | 定价/锚定、周期组合、商店佣金档位、退款/税 |

> 💡 **为什么要背这棵树：** 所有"收入掉了/涨了"都落在某片叶子上。诊断 = 自顶向下走树，找到**动了的叶子**，再分清是**前端（获量/用户质量）**还是**后端（产品/付费墙/定价/留存）**问题。详见 Diagnostics。

## Conversion Funnel Analysis（转化漏斗）

订阅转化是一条有序链路，相邻节点转化率定位流失在哪。务必**按渠道/地区/付费墙版本分群**、按**队列（cohort）**看。

```
安装 (install)
   ↓  onboarding 完成率
引导完成 (onboarding done)
   ↓  付费墙曝光率
付费墙曝光 (paywall impression)
   ↓  CTA 点击率（选套餐/点"开始"）
发起购买 (purchase intent / sheet shown)
   ↓  购买表单完成率（系统弹窗确认）
试用启动 / 直接购买 (trial start / purchase)
   ↓  激活率（首次真正用到付费价值）
激活 (activation)
   ↓  试用转化率
首期付费 (paid conversion)
   ↓  各期续订留存
续订 (renewal) … →  流失 (churn)
```

| 漏点 | 可能原因 | 修复 |
|------|----------|------|
| onboarding 完成率低 | 引导太长/价值没讲清 | 缩短引导，前置 aha-moment |
| 付费墙曝光率低 | 付费墙埋太深 / 没在合适时机弹 | 在价值时刻（任务完成/触达上限）弹付费墙；考虑 onboarding 付费墙 |
| CTA 点击率低 | 价值呈现弱、价格吓人、套餐太多 | 强化收益文案、突出年订性价比、减少选项 |
| 购买表单完成率低 | 系统弹窗前犹豫、信任不足 | 试用降低门槛、展示评价/隐私承诺 |
| 试用转化率低 | 试用期没用到价值、到期无提醒、退订太易 | 试用期内引导用到核心价值、到期前提醒、强化价值 |
| 激活率低 | 付费后没用到所买功能 | 购买后立即引导到价值功能 |
| 续订留存低 | 持续价值不足 / 被动流失 | 提升留存功能、再触达；查 dunning（见下） |

**诊断恒等式：** 付费转化（install→paid）= 付费墙触达率 × 试用启动率 × 试用转化率。任何转化波动都落在这三者之一。

## LTV 与留存深入

### 续订留存曲线（队列视角）

订阅 LTV 由续订留存曲线下面积决定。典型规律（**方向性，非基准值**）：
- 第一期到第二期流失最大（首次续订是最大坎，尤其试用转化后的首次真实扣款）。
- **年订留存显著高于月订高于周订**；年订把"决策频率"降到一年一次，结构上更稳。
- 队列要按**获取渠道、地区、价格、付费墙版本**拆——混合队列会掩盖问题（见 Diagnostics 的辛普森问题）。

> 具体留存/转化基准随品类差异极大，应读 RevenueCat / Adapty 的分品类基准报告 `[3][4]` 并以**自己后台的队列**为准，不要套用单一数字。

### 主动流失 vs 被动流失

| 类型 | 成因 | 对策 |
|------|------|------|
| **主动流失（Voluntary）** | 用户主动取消（价值不足、太贵、用完即走） | 提升持续价值、取消挽留页、降档 offer、win-back |
| **被动流失（Involuntary）** | 扣款失败（卡过期/余额不足/风控） | **平台机制兜底**：billing retry、grace period、account hold、dunning 提醒；这部分常能挽回相当比例 |

## Subscription Lifecycle & Dunning（订阅生命周期与挽回）

理解平台的续订状态机，才能管好被动流失。

**Apple `[1]`：** 续订失败 → 进入 **Billing Retry**（系统在最长约 60 天内重试）；可同时开 **Billing Grace Period**（宽限期内用户保留访问权，提升挽回与体验）。状态变化通过 **App Store Server Notifications V2** 推送到你的服务端（`DID_FAIL_TO_RENEW`、`GRACE_PERIOD_EXPIRED`、`DID_RECOVER` 等）。

**Google Play `[2]`：** 续订失败 → **Account Hold**（保留期）/ **Grace Period**（宽限期，保留访问）/ **Paused**（用户暂停）；通过 **Real-time Developer Notifications (RTDN)** 经 Pub/Sub 推送（`SUBSCRIPTION_IN_GRACE_PERIOD`、`SUBSCRIPTION_ON_HOLD`、`SUBSCRIPTION_RECOVERED` 等）。

**Dunning（催缴）要点：**
- 开启 **Grace Period**：宽限期内不切断访问，挽回率与体验都更好（官方推荐）`[1][2]`。
- 用服务端通知驱动**应用内/推送提醒**用户更新支付方式。
- 区分被动流失，不要把它当主动流失误判产品问题。
- **Win-back**：对已流失用户用商店的 win-back offer / 再触达。

**退款（Refund）：** Apple 提供退款；可用 `REFUND` 通知与（iOS 15+）**退款请求 API / 消费信息**辅助风控。退款率高通常是付费墙误导、误触周订、价值不符——回到付费墙与定价排查，而非压制退款。

## Paywall Design（付费墙设计）

付费墙是 IAP 的"广告位"——位置、时机、呈现决定转化。

| 类型 | 说明 | 适用 |
|------|------|------|
| **Onboarding 付费墙（hard/soft）** | 引导流程末尾必经（hard=必须选择，soft=可跳过） | 量大、首屏决策；hard 转化高但留存/退款风险大，需 A/B |
| **情境付费墙（contextual）** | 用户触达功能墙/使用上限时弹 | 价值时刻转化质量高 |
| **设置/入口常驻** | "升级高级版"入口 | 补充触点 |
| **取消挽留页** | 用户欲取消时给降档/折扣 | 降主动流失 |

**设计原则：**
1. **在价值时刻弹**：任务完成、触达上限、需要高级功能时——动机最强。
2. **讲收益不讲功能**：用结果语言（"无限转换/去水印/批量导出"）。
3. **突出年订性价比**：用月均价锚定（年订折算每月）、标注节省比例。
4. **减少选项**：套餐过多降低决策；默认高亮推荐项。
5. **降低首次门槛**：免费试用或低价 intro，把"是否付费"变成"是否继续"。
6. **信任要素**：隐私承诺、可随时取消、评价/用户数。
7. **可恢复购买（Restore）**：必须提供，且是 Apple 审核硬性要求（见 Compliance）`[1]`。

> 付费墙文案/布局/offer 的**绝对转化数字无通用基准**，必须 A/B；Superwall / RevenueCat Paywalls / Adapty Paywall Builder 等支持无发版改付费墙并做 A/B `[3][4]`。

## Pricing Strategy（定价）

| 杠杆 | 说明 |
|------|------|
| **价格点（Price Points）** | 商店按价格档（price tier）定价；同一档在各地区有本地化价格 |
| **锚定（Anchoring）** | 年订 vs 月订并列，用月订把年订衬"便宜"；可加终身价做高锚 |
| **诱饵（Decoy）** | 让目标套餐显得最划算 |
| **Intro Offer / 免费试用** | 降低首次决策门槛（见下） |
| **本地化定价（Localized）** | 按购买力分地区定价，别全球一个美元价直换 |
| **价格 A/B** | 用订阅平台做价格实验，主指标是 **LTV/realized revenue per install**，不是单看转化 |

**要点：** 提价通常降转化但升单价，净效果要看 **LTV/install** 与退款/流失的综合；降价反之。**绝不只看转化率定价**——和 IAA 一样，单指标会骗你。

## Free Trial & Intro Offer（试用与引导优惠）

**Apple Introductory Offers `[1]`：** 每个订阅可对**新订阅者**提供一次引导优惠，三种类型——**免费试用（Free Trial）**、**先付费按周期（Pay As You Go）**、**一次性预付（Pay Up Front）**。另有 **Promotional Offers**（对老/流失用户）与 **Offer Codes**。

**Google Play Offers `[2]`：** 在订阅的 **base plan** 上配置 **offers**，含**免费试用**与**引导价**，可设资格条件（如新用户）。

**机制要点：**
- **试用时长是取舍**：太短没体验到价值，太长延迟收入且到期前易取消。最优值按品类 A/B。
- **是否要信用卡前置**：要卡的试用启动率低但试用转化率高；不要卡相反。
- **到期前提醒**：商店会通知用户即将扣费；产品侧也应在试用期内把价值送达。
- **资格管理**：引导优惠仅限符合条件的用户，平台自动校验。

## Store Platforms & Mechanics（商店机制）

> 佣金与政策**随时间变化**，以下为常见结构；**务必以官方文档当前版本为准** `[1][2]`。

### Apple App Store `[1]`

- **佣金：** 标准 **30%**；**Small Business Program** 年净收入 ≤ $1M 的开发者为 **15%**；自动续订订阅在用户**连续订阅满 1 年**后降为 **15%**。
- **技术：** StoreKit 2（Swift 现代 API，交易/收据校验更简单）；**App Store Server Notifications V2** 服务端事件；App Store Server API 查询/退款消费信息。
- **必备合规（见 Compliance）：** 自动续订需清晰披露价格/周期/续订、提供"恢复购买"、订阅须有持续价值。
- **关键后台：** App Store Connect（订阅群组、价格、引导优惠、Offer Codes、订阅分析报表）。

### Google Play `[2]`

- **佣金：** 每年前 **$1M 收入为 15%**，超出 30%；**自动续订订阅统一 15%**（Google 已将所有订阅服务费降为 15%）。
- **技术：** Google Play Billing Library（持续升级，注意弃用时限）；**Real-time Developer Notifications (RTDN)** 经 Cloud Pub/Sub；Play Developer API 校验/管理订阅。
- **模型：** 一个订阅含多个 **base plans**（周期）与 **offers**（试用/引导价）。
- **关键后台：** Play Console（订阅、base plan/offer、价格、Subscriptions 报表、Reasons for cancellation）。

**跨平台启示：** 佣金档位直接进 LTV 的"净单价"叶子——同样的转化，命中 15% 还是 30% 佣金，净额差一截；满足 Small Business / 一年降档能显著抬净 LTV。

## Subscription Infrastructure（订阅基础设施 — IAP 的"聚合层"）

类比 IAA 的聚合平台，这些平台统一处理收据校验、跨平台权益（entitlement）、实时分析、付费墙 A/B，省去自建服务端的坑：

| 平台 | 定位 | 说明 |
|------|------|------|
| **RevenueCat** `[3]` | 订阅后端 + 分析 + 付费墙 | 跨 iOS/Android/Web 统一权益与收据校验、实时图表、Paywalls、Experiments；并发布《State of Subscription Apps》分品类基准 |
| **Adapty** `[4]` | 订阅后端 + 付费墙 + A/B | 无发版改付费墙、价格/付费墙 A/B、分析；发布订阅基准报告 |
| **Superwall** | 付费墙实验为主 | 远程配置付费墙、强 A/B 能力 |
| **Qonversion** | 订阅后端 + 分析 | 权益管理、数据导出 |

**为什么用：** 收据校验/续订状态机/跨平台权益/退款处理都很容易出错；这些平台把它做成托管能力，并提供实时 cohort/funnel 分析与无发版付费墙实验——直接服务于 LTV 树上的"转化"和"留存"两枝。

## China Market（国内市场）

- **iOS：** 中国区 App Store 内购**仍须用 Apple IAP**（数字内容/功能解锁不能绕开），佣金与全球一致 `[1]`。
- **Android：** 国内无 Google Play，分发与内购走**各厂商应用商店**（华为/小米/OPPO/vivo/应用宝等），各自的**支付 SDK 与分成不同**（工具类分成结构与游戏不同，且各渠道差异大，需逐家核对，无单一基准）。
- **H5 / 公众号 / 小程序：** 部分工具用网页或小程序侧 **微信支付 / 支付宝** 收订阅/会员，规避商店佣金，但要符合各平台规则。
- **要点：** 国内是**多渠道并行**，权益体系要能跨渠道统一发放与校验；分成、政策、可用支付方式逐渠道确认。

## Tool-App IAP Packaging（按工具类型）

| 工具类型 | 锁在付费墙后的典型价值 | 付费墙触发时机 |
|----------|------------------------|----------------|
| 清理/优化 | 深度清理、自动化、去广告 | 扫描出结果、想一键清理时 |
| 扫描/OCR | 批量扫描、导出格式、去水印、云同步 | 导出/保存时 |
| PDF/转换 | 批量转换、无次数上限、更多格式 | 触达免费次数上限时 |
| 文件管理 | 云备份、加密空间、去广告 | 备份/加密入口 |
| VPN | 高速/全节点、多设备、无限流量 | 选高级节点/触达流量上限 |
| 照片/视频 | 高级滤镜、无水印、批量、4K 导出 | 导出/应用高级效果时 |
| 习惯/效率 | 无限项目、统计、跨设备同步 | 触达免费上限/想看统计时 |

**通则：** 把**高频且有明确价值**的动作设为转化触点；免费层要足够让用户体会价值（aha-moment）但留出明确的付费动机（上限/高级功能/去广告）。

## A/B Testing for IAP

- **可测变量：** 付费墙布局/文案、价格点、套餐组合、默认高亮项、试用时长、是否要卡、intro offer 类型、onboarding 付费墙 hard vs soft、取消挽留 offer。
- **主指标：** **LTV / realized revenue per install（净）**——不是单看转化率（高转化可能伴随高退款/低留存而净亏）。
- **次级 + 护栏：** 试用转化、续订留存、退款率、卸载/留存；退款或流失恶化超阈值则判负。
- **方法纪律：**
  - 看**净结算口径**结果，留意订阅有**长尾延迟**（年订的真实 LTV 要等续订才显现）——用早期信号（试用转化、首期留存）+ 模型外推，别只看 D0 转化。
  - 样本与周期需达到统计显著（订阅指标方差大、转化基数小，常需较大样本/较长观察）。
  - 价格实验注意**老用户价格保护**与商店政策；用订阅平台的实验框架按 install 队列随机。
  - 警惕**辛普森悖论**：分渠道/地区的赢家可能与混合结论相反——按队列拆分复核。
- **基础设施：** RevenueCat Experiments / Adapty / Superwall 支持无发版付费墙与价格 A/B `[3][4]`。

## Common Revenue Problems & Diagnostics

### Problem: 付费转化率下降

| Check | 诊断 |
|-------|------|
| 渠道/地区构成变化 | 低转化渠道/地区放量？按队列拆分 |
| 付费墙改动 | 最近改了付费墙/价格/套餐？回滚对比 |
| 漏斗某节点 | 走 install→曝光→CTA→购买→试用→付费，定位掉的那一环 |
| 用户质量 | 买量端用户意图变化（同渠道不同日质量不同） |
| 平台/技术 | 付费墙加载失败、商品拉取失败、Billing 报错 |

### Problem: 试用启动高但试用转化低

| Check | 诊断 |
|-------|------|
| 试用期价值未送达 | 用户试用期没用到核心功能 → 购买后/试用中引导到价值 |
| 到期无提醒 | 试用到期前缺提醒 → 加应用内/推送提醒 |
| 试用太长/太短 | 太长延迟决策易取消，太短没体验 → A/B |
| 退订太易/动机弱 | 价值不足或定价偏高 → 强化价值/调价 |

### Problem: 续订留存下降 / 流失上升

| Check | 诊断 |
|-------|------|
| 主动 vs 被动 | 先分清：扣款失败（被动）还是主动取消？被动靠 grace/retry/dunning 挽回 |
| 持续价值 | 产品是否"用完即走"？加留存型价值与再触达 |
| 首次续订坎 | 首期续订流失最大 → 强化首期前价值与提醒 |
| 价格/周期 | 周订流失天然高 → 引导年订 |
| 队列混淆 | 按渠道/价格/版本拆队列，别看混合均值 |

### Problem: 退款率上升

| Check | 诊断 |
|-------|------|
| 付费墙误导/误触 | hard 付费墙 + 周订易误订 → 调付费墙、加确认/价值呈现 |
| 价值不符 | 买后没得到承诺价值 → 对齐文案与实际功能 |
| 地区/支付 | 某地区/支付方式退款异常 → 单独排查 |

### Problem: 收入变动 — 自顶向下走 LTV 树

总收入 ≈ 新增 × 付费墙触达率 × 试用启动率 × 试用转化率 × Σ(续订留存 × 净单价)。逐叶子排查，每片都分**前端（获量/用户质量）**与**后端（产品/付费墙/定价/留存/平台）**两面：

| 叶子 | 前端（获量侧）检查 | 后端（产品/变现侧）检查 |
|------|--------------------|--------------------------|
| **新增** | 买量降、自然量降 | — |
| **付费墙触达率** | 用户意图变化 | 改了付费墙位置/触发？onboarding 付费墙开关？ |
| **试用启动率** | 用户质量/构成 | 付费墙文案/价格/套餐改动？加载失败？ |
| **试用转化率** | 用户意图 | 试用时长/提醒/价值送达改动？ |
| **续订留存** | 用户质量/渠道 | 持续价值？被动流失（dunning）？首期坎？ |
| **净单价** | 地区/支付构成 | 价格/周期/佣金档位/退款/税变动？ |

**总规则：** 前端问题找获量侧，后端问题找产品/变现侧；**永远按 app 版本与队列拆开**排除回归。

## Privacy & Compliance（合规）

| 维度 | 要点 |
|------|------|
| **Apple 订阅规则** `[1]` | 自动续订须清晰披露**价格/周期/续订条款**、提供**恢复购买**、订阅须提供**持续价值**（App Review Guidelines 3.1.1 / 3.1.2）；不得用误导文案诱导订阅 |
| **Google Play 订阅政策** `[2]` | 价格/续订/取消方式须清晰披露，遵守订阅与计费政策 |
| **数字内容须用 IAP** `[1][2]` | App 内解锁数字功能/内容须走商店内购，不得引导站外支付（注意各地区/法规对外链支付的最新变化） |
| **价格/试用披露** | 试用到期转付费、续订价格须在购买前明示 |
| **隐私/同意（GDPR/CCPA）** | 归因/分析需合规同意；订阅状态等数据按隐私法处理 |
| **税务（VAT/销售税）** | 商店通常代收代缴，但进 LTV 的净额要扣税 |
| **退款法规** | 部分地区（如 EU）有法定撤回/退款权，需配合 |

## Operations Workflow（运营流程）

### 产品引入 → 上线
| 阶段 | 步骤 |
|------|------|
| 商业化设计 | 定模型（订阅/一次性/混合）、打包、周期与价格策略 |
| 商店配置 | App Store Connect / Play Console 建订阅群组、商品 ID、价格、引导优惠 |
| 权益与校验 | 接订阅平台或自建：收据/交易校验、跨平台权益、服务端通知（ASSN V2 / RTDN） |
| 付费墙与埋点 | 付费墙文案/布局、埋点（曝光/CTA/购买/试用/续订/取消/退款各节点） |
| 出包验收 | 沙盒测试试用/购买/恢复/续订/宽限/退款全链路 |
| 上线 | 转正、报表与预警配置、A/B 框架就位 |

### 日常数据运营 Checklist
- 每日看：付费转化、试用转化、MRR、退款率、被动流失/挽回
- 按**队列 + 渠道 + 地区 + 付费墙版本**拆分，不看混合均值
- 新版本/新付费墙上线后密切监控转化与退款一段时间
- 配置关键指标的异常预警（转化/退款/MRR 显著波动）

## New IAP Operator Learning Path（新人路径）

> 以下数字为**示例培训目标，非行业基准**。

**Month 1 · 学习期：** 懂订阅经济（CVR/试用转化/留存/LTV/MRR）、App Store & Play 订阅机制与后台、付费墙与定价基本盘；用历史数据搭转化漏斗 + 留存队列模型，出每日基础报告。

**Month 2 · 实践期：** 独立分析某产品的漏斗与队列、定位问题并提优化；做付费墙/价格 A/B 的设计与验收；产出复盘模板与竞品付费墙调研。

**Month 3 · 产出期：** 独立负责一条产品线的 IAP 设计与 LTV 优化；输出含 A/B 结果与队列分析的优化案例；协助搭 BI/订阅看板。

## Common Pitfalls

1. **只看转化率不看 LTV。** 高转化可能伴随高退款/低留存而净亏；务必以 **LTV/install（净）** 为准。
2. **用平台估算当结算额对账。** RevenueCat 等是实时估算；钱以 App Store Connect / Play Console 的 proceeds 为准（已扣佣金/退款/税/汇率）。
3. **忽视被动流失。** 扣款失败占流失可观比例，靠 grace period / billing retry / dunning 能挽回——别当主动流失误判产品。
4. **看混合队列均值。** 不分渠道/价格/版本/地区 → 辛普森悖论，结论可能反向。
5. **硬付费墙 + 周订无确认。** 误触订阅 → 退款/差评/封号风险；要价值呈现 + 明确披露。
6. **试用时长拍脑袋。** 太短没体验、太长延迟收入易取消；按品类 A/B。
7. **全球一个美元价直换。** 不做本地化定价 → 高购买力地区留钱、低购买力地区零转化。
8. **付费墙埋太深。** 不在价值时刻弹 → 触达率低；onboarding/情境付费墙要覆盖主路径。
9. **不提供恢复购买。** 既伤体验又过不了 Apple 审核（3.1.1）。
10. **A/B 只看 D0 转化。** 订阅价值长尾延迟，要用试用转化/首期留存 + 外推，别只看当天。
11. **忽略佣金档位。** 没争取 Small Business / 一年降档 → 净单价白白少 15 个点。
12. **退款率高只压不查根因。** 根因多在付费墙误导/价值不符 → 回到付费墙与定价。
13. **续订状态机不接服务端通知。** 不接 ASSN V2 / RTDN → 权益与流失数据失真、dunning 无从做起。

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

## Data Sources

> ⚠️ 平台佣金/政策随时间变化；**转化、留存等基准无单一权威绝对值**，随品类/地区/价格/周期大幅浮动。本 skill 给相对排序与方法，**绝对数字请读下列基准报告并以自己后台队列为准**。以下为权威来源类别（具体深链接以官方现行文档为准）。

- **`[1]` Apple 官方文档** — App Store 订阅与内购、StoreKit、App Store Server Notifications、Small Business Program、App Review Guidelines（3.1.x）、引导/促销优惠、App Store Connect 帮助。入口：[developer.apple.com / App Store 订阅](https://developer.apple.com/app-store/subscriptions/)、[App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)、[Small Business Program](https://developer.apple.com/app-store/small-business-program/)
- **`[2]` Google Play 官方文档** — Play Billing、订阅（base plans / offers）、服务费、Real-time Developer Notifications、Play Console 帮助。入口：[Play Billing 文档](https://developer.android.com/google/play/billing)、[Play 服务费/订阅政策（Play Console 帮助）](https://support.google.com/googleplay/android-developer)
- **`[3]` RevenueCat** — 订阅后端/分析/付费墙文档，及《State of Subscription Apps》分品类基准报告。入口：[RevenueCat](https://www.revenuecat.com/)、[State of Subscription Apps](https://www.revenuecat.com/state-of-subscription-apps/)
- **`[4]` Adapty** — 订阅基础设施/付费墙 A/B 文档，及订阅基准报告。入口：[Adapty](https://adapty.io/)

**未标记**的内容为通用公式 / 概念 / 结构性事实（LTV 公式、漏斗结构、相对排序、付费墙/定价方法论等）。

*注：本 skill 由 Claude 按 [[iaa-monetization-expert]] 的结构与方法新撰；上述官方文档为现行权威入口，但具体页面/数字会更新，引用前请以官方现行版本与你自己的后台数据为准。*

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
