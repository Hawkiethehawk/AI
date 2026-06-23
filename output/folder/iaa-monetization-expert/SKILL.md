---
name: iaa-monetization-expert
description: Use when discussing IAA (in-app advertising) monetization for utility/tool apps — ad formats, mediation, eCPM optimization, waterfall vs bidding, ad placement, metrics analysis, A/B testing, funnel diagnostics. Covers AdMob, MAX, ironSource, Unity Ads, Meta Audience Network, Pangle, plus China-market networks (CSJ/Pangle-Domestic, YLH, Kuaishou, Baidu) and the TopOn mediation platform (sort price, backup ads, parallel requests, traffic grouping, S2S/C2S bidding, funnel analysis).
version: 1.3.1
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [iaa, monetization, advertising, mediation, mobile-apps, utility-apps, china-market, topon]
    related_skills: []
---

# IAA Monetization Expert — Utility/Tool Apps

## Overview

In-app advertising (IAA) is the primary revenue model for free utility and tool applications. This skill provides the conceptual framework and tactical knowledge for optimizing ad revenue in tools (cleaners, calculators, scanners, converters, file managers, VPNs, launchers, etc.) where user sessions are task-driven and typically short.

Core premise: ad revenue = impressions × eCPM / 1000. Optimization targets either increasing qualified impressions or raising eCPM, constrained by retention and user experience trade-offs.

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

## Core Metrics

### Revenue Metrics

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| **eCPM** (effective cost per mille) | (total revenue / total impressions) × 1000 | Blended rate across all networks. Primary health indicator. |
| **ARPU** (avg revenue per user) | total revenue / total users (DAU or MAU) | Monetization efficiency per user. |
| **ARPUDAU** | daily revenue / DAU | Daily per-user revenue; most actionable timeframe. |
| **LTV** (lifetime value) | ARPUDAU × avg retention days; also: current-day ARPU × X-day LT | Projected total revenue per user. |

### Data Source: Settlement (API) vs SDK-Tracked [³]

Every mediation dashboard exposes two parallel data lineages. Conflating them is the most common analysis error:

| Lineage | Source | Use | Caveat |
|---------|--------|-----|--------|
| **三方 API data** (suffix "API": 收益, eCPM API, 展示API, 点击API) | Pulled from each network's reporting API | **Settlement-grade.** All money figures reconcile to the network's own dashboard. | Delayed (typically next-day; pulled in batches). Requires Report-API authorization per network. Some networks don't expose request/fill. |
| **SDK-tracked data** (no "API" suffix: 展示, 点击, 请求, 填充率, DAU) | Mediation SDK's own client-side instrumentation | **Real-time** (≈5 min). Drives funnel, per-user, frequency analysis. | Estimate only — never the settlement number. Estimated revenue uses your hand-entered sort price (or live bid), so it's only as accurate as your floors. |

**Display Gap (展示Gap)** = (SDK展示 − 展示API) / 展示API. Different counting boundaries make 0–15% normal. **>15% needs investigation** (see Common Revenue Problems). Settlement always follows the network API, never SDK-tracked numbers.

### ARPU Full Decomposition

ARPU can be decomposed into controllable sub-metrics for root-cause analysis. Equivalent platform formula: 收益 = 人均收益 × DAU; 人均收益 = 人均展示次数 × eCPM / 1000.

```
ARPU = 人均展示次数 × eCPM / 1000

人均展示次数 (impressions per user) =
  广告请求渗透率 × 人均请求PV × 填充率 × 展示率
```

**广告请求渗透率 (Ad Request Penetration Rate):**
The proportion of active users who trigger ad requests. Degraded by: failed SDK initialization, ad config fetch failures, code path bugs that skip ad logic.

**影响因素:**
- SDK 初始化成功率
- 广告配置获取成功率
- 广告请求代码执行率

### eCPM Decomposition (Advertiser-Side View)

```
eCPM = 广告主出价 × CTR × CVR × 1000
```

| Factor | Dev-Controllable? | How to Influence |
|--------|-------------------|------------------|
| 广告主出价 (Advertiser Bid) | ❌ Indirect | Depends on ad platform budget pool and competition. Rises during shopping festivals (618, Double 11), end-of-quarter budget flush. |
| CTR (点击率) | ✅ Yes | Ad placement position, timing, format design, visual prominence. Mis-clicks artificially inflate CTR but may not improve CVR-matched eCPM. |
| CVR (转化率) | ⚠️ Partially | Heavily platform-dependent. Improve by making ad content more visible and understandable, not just clickable. |

### Delivery Metrics

| Metric | Definition | Healthy Range (Utility) |
|--------|------------|------------------------|
| **Fill Rate** | filled requests / total ad requests | ≥ 90% for Tier 1 geos |
| **Show Rate / Render Rate** | impressions / filled responses | ≥ 85% |
| **Impression Rate** | impressions / ad requests | = fill rate × show rate |
| **CTR** (click-through rate) | clicks / impressions | 0.5–3% (banner), 3–10% (interstitial), 10–30% (rewarded) |
| **Fill Latency** | avg time from ad request to filled response | < 10s for video; < 2s for display. Track per-tier; high latency on a tier signals waterfall bloat. |

**Show Rate Warning:** 过多请求成功但不展示的广告会导致广告平台判定资源利用率过低，降低该代码位的权重，进一步影响填充率和 eCPM。

### Engagement Metrics

| Metric | Definition | Target (Utility) |
|--------|------------|------------------|
| **Ad Frequency** | impressions per user per session | 1–4 for interstitials |
| **Session Length** | avg time per app open | 30s–5min for most tools |
| **Ad Density** | revenue per session / session length | Track directionally |
| **用户渗透率** | users who see ≥ 1 ad / DAU | Track directionally; declines = placement reach shrinking |

### Metric Relationships

- eCPM drop with stable impressions = network-side (seasonality, bidder behavior, ad quality)
- eCPM drop with impression drop = fill rate issue (waterfall configuration, network outage)
- Impressions up, eCPM down = possible over-exposure diluting bid density; also: rapid banner refresh (under 30s) inflates low-value impressions
- ARPUDAU flat while DAU grows = healthy scaling
- ARPUDAU declining while DAU grows = new user quality issue or market saturation
- ARPU decline = check 频次 (frequency) and eCPM separately; 频次 issues are often buy-side or product bugs; eCPM issues are often network/fill/competition

### User Ad Value Decay

用户进入应用后，广告价值随时间/使用深度衰减。首个广告位和首个激励视频位的 eCPM 通常最高。靠后的广告位尽管频次高但单价低。

→ 高价值广告位应前置（靠近用户进入点），低价值频次型广告位后置。

## Funnel Analysis (漏斗分析) [³]

The single most actionable diagnostic for a mediation SDK. Every impression passes through an ordered chain; the conversion rate between adjacent nodes localizes exactly where users (or revenue) leak. Always analyze **per ad unit** and on a **per-DAU (人均次数)** basis — aggregated all-unit averages hide the problem.

```
应用启动 (app start / SDK init)
   ↓  获取策略到达率
获取策略 (fetch ad config)
   ↓
流量请求 (ad request / load)
   ↓  流量填充率 = 填充 / 请求
流量填充 (fill)
   ↓
到达广告场景 (reach ad scenario — needs entryAdScenario instrumentation)
   ↓  广告Ready率 = ready-at-scene / scene-arrivals
触发展示 (trigger show)
   ↓  触发展示成功率 → 展示成功率 = 展示 / 触发
展示 (impression)
   ↓  点击率
点击 (click)
```

| Leak point | Likely cause | Fix |
|------------|-------------|-----|
| 获取策略 < 应用启动 | SDK init or config-fetch failing on some sessions | Add preload logic at a reliable entry; consider full-auto load mode |
| 流量填充率 low | Waterfall too shallow / floors too high / network outage | Add no-floor bottom layer or backup ad; check per-source error logs |
| 广告Ready率 low but fill high | Ad not preloaded by the time user reaches the scene | Preload at a scenario-appropriate moment (not too early — see decay) |
| 广告Ready率 low **and** fill low | Waterfall config problem | Add backup/no-floor source, diagnose no-fill |
| 广告场景到达率 low | Ad entry buried too deep in the UX | Move the ad scene toward the main path; compare scene-arrival rates across placements |
| 广告触发率 low (rewarded) | Reward not compelling | Strengthen the synthetic reward value |
| 触发展示成功率 / 展示成功率 low | Cache expired, render failure, or integration bug | Check error logs; verify cache validity; check UI obstruction |

**Diagnostic identity:** 人均展示次数 = 人均请求次数 × 填充率 × 展示率. Any per-user impression swing decomposes cleanly into one of those three rates — chase the one that moved.

## Ad Formats — Utility App Context

### Banner (MREC 300×250, Standard 320×50, Adaptive)

- **Best for:** persistent UI surfaces (bottom bars, between list items)
- **eCPM:** lowest (typically $0.10–1.50 Tier 1)
- **UX cost:** low if placed correctly; high if intrusive
- **Tool-specific:** bottom banner on calculators, converters, file browsers. Avoid on screens requiring precision touch (photo editors).
- **Refresh rate:** 30–120s. Faster refresh raises impressions but lowers eCPM.

### Interstitial (Full-Screen)

- **Best for:** screen transitions, task completion, natural breaks
- **eCPM:** medium ($2–8 Tier 1)
- **UX cost:** high if mistimed
- **Tool-specific:** after scan completes, after file conversion, after cleaning finishes. Never on app launch — causes immediate uninstall.
- **Frequency cap:** 1 per 3–5 minutes. Max 3–4 per session. Default interval ≥ 20s; actual deployment often longer.
- **Placement timing:** on "task done" screens, NOT during active task flow.

### Rewarded Video

- **Best for:** unlocking features, removing time gates, premium actions
- **eCPM:** highest ($5–20 Tier 1)
- **UX cost:** opt-in, near-zero
- **Tool-specific:** unlock extra conversions, remove watermark, extend free trial feature, skip wait timer.
- **Key insight for tools:** tools rarely have natural virtual currency hooks. Create synthetic value — "watch to unlock 10 more conversions today" works.
- **ARPU by placement:** 同一产品内各激励视频位 eCPM 差距不大，ARPU 主要受该位置频次影响。用户进入后的首个激励视频位置广告价值最高。

### Native / Native Advanced

- **Best for:** content feeds, lists, recommendations
- **eCPM:** medium ($1–6 Tier 1)
- **UX cost:** low when well-integrated
- **Tool-specific:** useful in tools with content surfaces (news widgets, weather, recommendation screens). Most pure utility tools lack the content inventory for native ads to perform well.

## Ad Networks

### Global Tier 1 Networks (High Fill + High eCPM)

| Network | Strength | Weakness | Best Geo |
|---------|----------|----------|----------|
| **Google AdMob** | Largest demand pool; integrated mediation | Lower eCPM than dedicated networks on some segments | Global |
| **Meta Audience Network (FAN)** | High eCPM on FB-identified users | Policy-heavy; iOS 14+ ATT impact reduced inventory | US, EU |
| **Pangle (ByteDance)** | Dominant in TikTok-heavy markets | Limited outside Asia/MENA/LATAM | SEA, India, MENA |
| **Unity Ads** | Strong in rewarded video | Primarily gaming demand; weak for utility fill | Global |
| **ironSource** | Strong mediation + own demand | Weaker standalone than via mediation | Global |
|| **AppLovin** | Bidding infra via MAX + own demand; AI engine AXON 2.0; 2025年剥离游戏业务聚焦纯软件平台 | Gaming-skewed demand pool; IGA市场份额28%全球第一（iOS 43%领先）[²] | US, EU |

### Global Tier 2 / Regional Networks

| Network | Best Geo |
|---------|----------|
| **Vungle / Liftoff** | US, EU — video-focused |
| **Mintegral** | SEA, China, LATAM |
| **InMobi** | India, SEA |
| **Smaato** | EU, LATAM |
| **Chartboost** | US, gaming demand |

### China Domestic Networks (国内市场)

| Network | Alias | Strength | Notes |
|---------|-------|----------|-------|
| **穿山甲 (CSJ / Pangle-Domestic)** | 字节跳动旗下 | 国内最大联盟，填充率和 eCPM 领先 | 国内变现首选；对应海外 Pangle |
| **优量汇 (YLH)** | 腾讯旗下 | 依托微信/QQ 生态，社交属性强 | 游戏类、网赚类表现好 |
| **快手广告 (Kuaishou)** | 快手旗下 | 下沉市场覆盖好 | 短视频类预算为主 |
| **百度联盟 (Baidu)** | 百度旗下 | 搜索类流量补充 | 填充率/ecpm 弱于前三家 |

### Network Selection Heuristic

1. Start with AdMob + 2–3 networks matching top-3 geos (domestic: 穿山甲 + 优量汇 as baseline)
2. Add networks one at a time; measure incremental lift
3. Drop networks that contribute < 3% of revenue after 30 days
4. Network count > 7 rarely adds incremental value; adds SDK bloat. A single integration generally wants 5–8 networks across floor + bidding layers to stabilize fill and eCPM.

**Geo network shortlist [³] (via a mediation platform; order not significant):**

| Region | Networks |
|--------|----------|
| 中国大陆 | 穿山甲、优量汇、快手、百度、Mintegral、TopOn ADX |
| 欧美 (US/EU) | Meta、AdMob、AppLovin、Unity、ironSource、Fyber/Digital Turbine、Mintegral |
| 东南亚 (SEA) | AdMob、Meta、Pangle、Unity、AppLovin、TopOn ADX、Mintegral |

## Mediation: Waterfall vs Bidding

### Waterfall

Ordered list of networks by expected eCPM. Request cascades down until filled.

**Pros:** full control over priority; predictable behavior; works with older networks.
**Cons:** latency per hop (50–200ms per fallback); manual eCPM floors must be updated; suboptimal — highest bidder may sit below a non-filling network.

**Waterfall configuration rules of thumb:**
- CPM floors: set at 80–90% of actual 7-day average
- Max 3–4 tiers per ad unit per geo (合理的分层在 10–20 层区间；可根据用户网络、填充率和 eCPM 表现适当增减)
- Tier gap: ~20% between adjacent tiers
- Review floors weekly; automated floor optimization is table stakes in 2025+
- CPM 底价设置后，广告平台交付的 eCPM 往往接近底价；底价越高，填充率越低

**Waterfall structure reference (瀑布流结构参考) [³]:**

| Zone | Config | Layers | Notes |
|------|--------|--------|-------|
| Bidding pool (并行层) | A-bid, B-bid, C-bid, D-bid | 2–4 | **Do not set a bidding floor here** — it tanks bidding fill rate |
| Head / high-floor | one network at a high floor (e.g. $80) | 2–4 | Maximize unit price |
| Mid / mid-floor | networks cross-ordered descending ($70→$20) | 2–8 | Fill the gaps; insert a mid-layer wherever a big eCPM jump leaves traffic underused |
| Tail / low- or no-floor | low-floor + no-floor backup | 2–6 | No-floor bottom layer with auto-price guarantees fill |

**Layer-count and fill discipline [³]:**
- Total layers scale with DAU/request volume: T1 geos 30–40, T2 20–30, T3 (SEA/LATAM/Africa) 10–20. Typical overall range 10–20.
- Target overall ad-unit fill ≥ 90%. Each layer's fill should stay ≥ 1% (control to ≥ 5%); a near-zero top layer can be dropped.
- If a non-splash top layer fills ≥ 10%, try raising its floor (or add a higher layer above it) to capture more high-value offers.
- Evaluate each layer's **revenue share vs impression share**: if a $5 layer is 30% of impressions but only 10% of revenue, frequency-cap or thin it and add higher-priced layers — the goal is to shift impressions toward high-eCPM offers (精细化分层).
- New app with no history: run a coarse "$50 → no-floor, step ~$10" waterfall for 2–3 days (until each layer has ≥ 2000 impressions — the network's bid model needs that to stabilize), then tune to real eCPM.
- Many layers (15+, esp. 20–40): turn on parallel requests (3–8) to cut total fill latency.
- **Splash (开屏) is the exception: keep the waterfall ≤ 5 layers** so a slow load doesn't miss the impression window.

### Sort Price vs Floor (排序价格) [³]

In SDK-side mediation (TopOn-style), the **sort price (排序价格)** entered in the mediation console only controls request/display *priority ordering* — it does **not** gate fill. The actual price floor lives in the network's own backend.

- **With network floor permission:** set sort price = the floor you set in the network backend, so estimated revenue/LTV is accurate.
- **Without floor permission:** the source returns whatever price; sort price just decides ordering. Set it to a realistic estimate (e.g. splash ≈ real avg, or $0.01 for a no-floor backup) and enable **auto price**.
- **Auto price (自动价格):** mediation sets sort price from the source's trailing-7-day average eCPM. Needs Report-API access and ≥ 2000 cumulative impressions to take effect; best for low/no-floor tail layers, not actively-tuned head layers.
- **Same-price display weight (同价格优先展示概率):** when multiple equal-priced sources all fill, the console can weight which one shows — use it to bias toward the better-performing same-tier source.

### In-App Bidding (Unified Auction) / Header Bidding

All networks bid simultaneously; highest bid wins.

**Pros:** zero waterfall latency; optimal clearing price; simpler configuration; allows knowing the value of every impression for downstream analytics.
**Cons:** requires networks supporting bidding (not all do); less direct control; some networks bid low in auction then perform better in waterfall.

**Bidding readiness by network (2025):**
- AdMob, Meta FAN, Pangle, Unity Ads, ironSource, AppLovin, Mintegral, Vungle, Chartboost: full bidding support
- Smaato, InMobi: partial support
- Smaller regional networks: often waterfall-only
- 国内: 实时竞价 (RTB/Header Bidding) 推广缓慢，受限于各平台之间的竞价协议和数据互通

**Server-side (S2S) vs client-side (C2S) bidding [³]:** each bidding network integrates one way or the other (some support both). The distinction is transparent to placement strategy — you just integrate the right SDK version — but matters for debugging: S2S bids resolve server-side (Meta, AdMob, Mintegral, Pangle, Unity, ironSource, Vungle, Bigo, Yandex, TopOn ADX); C2S resolves on-device (Helium/Chartboost, Huawei, Verve, TapTap, APS, Kwai); 优量汇/快手/百度/Sigmob/InMobi support both.

**Bidding-floor caution [³]:** setting a竞价底价 (bidding floor) filters out wins below it — which directly **lowers bidding fill and revenue**. Leave bidding uncapped during ramp; only introduce a bidding floor once monetization is stable. How it resolves each auction: a winning bid above the floor joins the waterfall ordering; a winning bid below the floor is dropped and the slot waits for the next load. A bidding source's *request* count is normally lower than its *bid* count — once it wins the auction it only fires an actual request if no higher waterfall layer already filled.

### Hybrid (Recommended Default)

Bidding instances in parallel pool; waterfall as fallback tail.

```
[Bidding Pool: AdMob | FAN | AppLovin | Pangle]
      ↓ (no fill)
[Waterfall: ironSource | Unity Ads | Mintegral]
      ↓
[House ads / no-fill behavior]
```

**Hybrid rules:**
- Put all bidding-capable networks in bidding pool
- Waterfall tail: 1–3 non-bidding networks
- Floor in waterfall tail: CPM floor of bottom bidding eCPM × 0.7
- Monitor: if bidding pool fill rate < 85%, waterwall too shallow — add networks

### 自建聚合预加载逻辑 (Custom Mediation Preload Logic)

Typical self-built aggregation SDK logic flow:

```
App start → SDK init → Check for ad config strategy
    → Preload per strategy config:
       Ad source 1 → Ad source 2 → Ad source N
       (串行或并串行: 同一价格随机展示, 不同价格按优先级展示)
    → Success: cache ad
    → Fail: continue to next source (up to 8s timeout)
    → All fail: pause until next cycle (30s retrigger; 缓存自动清除时间 30min)
    → 兜底策略: preload lowest-tier ad as backup cache
    → Display: select highest-priority cached ad; post-display preload next
    → 单条广告源连续 6 次请求失败: skip that source
```

**Optional 智能混排:** 结合平台特点和实际填充情况，灵活设置优化策略，对 waterfall 和 bidding 结果进行二次排序，最大化每次展示收入。

### Parallel Requests (并行请求) [³]

Instead of strictly serial top-down requests, fire N sources at once to cut fill latency and pre-cache for back-to-back placements.

- **Two modes:** *fixed count* (request N sources at a time, max 10) or *same-price parallel* (fire all equal-priced sources together, then the next price tier). Same-price parallel respects price priority exactly; fixed count can request across price tiers.
- **Ordering is unchanged** — parallel affects *requests* only. If A and B both fill, the higher sort price still shows first; the other is cached.
- **Recommended 2–3, never more than 5.** Over-requesting wastes bandwidth and, more importantly, requesting-but-not-showing makes networks judge your inventory as low-utilization and **downrank the placement** (lowering future fill and eCPM). Mediation caches the unshown ad to partly offset this.
- **When to use:** many layers (15+), frequent/short-interval placements, or poor-network users.

### Backup Ads (兜底广告) [³]

A backup source runs **in parallel with (not after) the waterfall** (错峰并行策略): if the waterfall fills, the higher-priced waterfall ad shows; if it doesn't, the backup shows. Configure it on a no-floor network placement. This raises overall fill (more parallel chances) and shortens fill latency, but does **not** guarantee 100% fill — a network can still decline a low-value user. Distinct from a plain no-floor *bottom waterfall layer*, which only fills after higher layers fail.

For splash specifically: combine an SDK-preset策略 (hardcoded fallback placement ID) with a backup source so the first cold-launch impression — which otherwise waits on a config fetch and often times out — still has an ad to show, while normal sessions run the full parallel waterfall.

### Traffic Grouping (流量分组) [³]

Segment users into groups, each with its own waterfall — the core mechanism of精细化 (fine-grained) monetization. Group by: geo, city, date/hour/timezone, network type, app/SDK/OS version, device id/type/brand, install time, channel/sub-channel, IDFA status, install source, cold-start, user-value bucket, or custom key-value rules (e.g. `age≥18 & network=bytedance,tencent`). Rules within one group are AND-ed.

- **Priority matters:** one ad unit can hold many groups; on a multi-match the **highest-priority group wins**. Order specific-before-general (a "US" group must sit above an "Americas" group, or US users fall into the broad waterfall).
- **The default group is the catch-all tail — never disable it and always give it live placements**, or unmatched traffic is wasted.
- **Canonical use — geo-tiered layering:** T1 30–40 layers, T2 20–30, T3 10–20. Split by your actual install distribution (e.g. dedicated Indonesia and Brazil groups if each is ~40% of users).
- channel / sub-channel / custom-rule grouping require the client to pass the field and ship a release; all other dimensions are console-only.

### Display Frequency Control (展示频次控制) [³]

Two independent levels: **ad-unit (placement) level** and **ad-source level**, each with hourly cap / daily cap / interval-seconds. All caps are local to the device (reset on reinstall). Uses:
- **Quality lever where floors aren't available:** capping a source's impressions raises per-impression quality and indirectly lifts its eCPM, and serves as a poor-man's layering test.
- **Policy safety on launch:** Meta and AdMob can flag/ban an account over a few anomalous devices when volume is low — set a per-source impression cap (~10, or near the placement's per-user impression count) on these two during ramp.
- **Repetition control:** a per-source interval (e.g. 60s) reduces the odds of re-serving the same advertiser back-to-back.

### Waterfall Retry Optimization

每次请求都从最高价格层级开始请求。失败多次后自动跳过相应层级。这回答了"是否可以先给用户定级再按级加载"的问题——不需要手动定级，失败跳过机制已经实现了类似效果。

## Ad Placement Design for Utility Apps

### Placement Types by App Category

| App Type | Primary Ad Unit | Secondary | Avoid |
|----------|----------------|-----------|-------|
| **Cleaner / Optimizer** | Interstitial after clean | Banner on result page | Interstitial mid-scan |
| **File Manager** | Banner on file list | Interstitial on copy/move complete | Interstitial during file ops |
| **Calculator** | Bottom banner | Interstitial on = press | Interstitial blocking inputs |
| **Converter** | Interstitial after conversion | Banner on result | Banner obscuring output |
| **Scanner / QR** | Interstitial after scan | Banner on history | Interstitial before camera |
| **VPN** | Rewarded for premium servers | Interstitial on disconnect | Ads during active VPN session |
| **Launcher** | Native in feed | Banner on settings | Interstitial on home gesture |
| **Weather** | Banner on forecast | Native in hourly/daily list | Interstitial on app open |

### Product-Type Ad Composition (产品类型 × 广告构成)

| Product Type | Primary Format | Design Focus |
|-------------|---------------|--------------|
| 游戏类 (Games) | 激励视频为主 | 结合游戏玩法设计激励场景（跳过/复活/翻倍） |
| 工具功能类 (Tools/Utility) | 信息流 + 插屏为主 | 在主要用户路径上植入；避免打断操作 |
| 资讯阅读类 (Content/News) | 信息流 + 插屏 | 内容流中嵌入原生/信息流 |
| 天气类 (Weather) | 信息流 + Banner | 预报页 banner + 列表信息流 |
| 网赚类 (Cashback) | 多种组合 | 多赚钱模块 + 部分激励视频（翻倍奖励场景） |

**广告频次策略:**
- 短平快高回收产品 → 广告前置，高频广告
- 长留体验产品 → 广告后置，低频广告

### Placement Design Principles

1. **Task completion boundary.** Place interstitials immediately after the user's goal is met, never during goal pursuit.
2. **Predictability.** User learns where ads appear. Random placement increases irritation and churn.
3. **Minimum interaction distance.** After an ad, allow ≥ 30 seconds or ≥ 3 interactions before next ad.
4. **First-session restraint.** Limit first-session interstitials to 1 or 0. First session is retention-critical.
5. **Exit intent ads.** Showing an ad when user presses back (exit intent) generates revenue from churning users but accelerates churn. Utility apps with strong retention should avoid exit-intent ads.
6. **Rewarded placement value.** If the feature unlocked by a rewarded ad has no real user value, completion rate will be near-zero. Every rewarded placement must unlock a behavior the user demonstrably wants.
7. **Main path penetration.** 梳理用户在应用内的主要路径，在主要路径上植入广告，能有效提升展示率。
8. **Rewarded entry visibility.** 激励视频入口尽可能明显，覆盖较多用户；奖励内容的图片/icon 设计需明显突出、美观。

### Ad Unit Count Guidelines

- App with < 5 screens: 1–2 ad units
- App with 5–10 screens: 2–4 ad units
- App with > 10 screens: no more than ceiling(screens / 3) ad units
- Each ad unit added dilutes impressions per unit, reducing per-unit eCPM from frequency capping and refresh mechanics

## Geo Optimization

### eCPM Tier Classification [*]

| Tier | Geos | Typical eCPM Range (Interstitial) |
|------|------|----------------------------------|
| **Tier 1** | US, CA, AU, UK, DE, JP, KR, CH, NO, SE, DK, NL | $3–10 |
| **Tier 2** | FR, IT, ES, AT, BE, FI, IE, NZ, SG, HK, TW, AE | $1–4 |
| **Tier 3** | BR, MX, TR, RU, ZA, PL, CZ, MY, TH | $0.30–1.50 |
| **Tier 4** | IN, ID, PH, NG, PK, BD, VN, EG | $0.05–0.30 |

### Geo-Specific Strategy

- **Tier 1:** maximize eCPM — bidding, premium formats (rewarded), multi-network competition
- **Tier 2:** maximize fill — hybrid mediation, 3–4 networks, tighter floors
- **Tier 3:** maximize impressions — higher frequency caps, low floors, reward user actions to boost engagement
- **Tier 4:** survival — low eCPM means high impression volume is the only lever. Consider rewarded video to boost per-user revenue; interstitials risk churn at these eCPMs

### Geo Waterfall Configuration

- **Same ad unit, different geo = different waterfall.**
  - Tier 1 geo: bidding pool only, floor at $3
  - Tier 3 geo: hybrid, floor at $0.20, higher frequency
- **No geo data = take the hit.** Serving a Tier 4 waterfall to a Tier 1 user loses 10–30× revenue per impression.

### 开屏 eCPM as User Value Signal (Splash Ad as User Quality Proxy)

开屏 eCPM 能反映投放渠道引入用户的广告价值，但可操控空间小。优化方向：
1. 确保开屏正常展示（延时展示 / 技术优化），提高展示渗透率
2. 保价 + 多源测试，让用户以尽可能高的价格在开屏被售出
3. 双开屏提高单次触发展示次数（但用户不转化时次数再多也无用）

开屏 eCPM 更多依赖用户质量和变现价值，核心解法在投放端持续筛选高价值用户。

## A/B Testing for Ad Monetization

### Testable Variables

- Interstitial frequency cap (1 per 3min vs 1 per 5min)
- Placement timing (after result vs after back-press)
- Ad format mix (add/remove reward unit)
- Floor prices per geo per format
- Network priority in waterfall
- Refresh rate for banners (30s vs 60s vs 120s)
- Interstitial vs rewarded vs no-ad on a given screen
- Waterfall ordering (reorder network tiers)
- Frequency caps and ad upper limits per session
- Old vs new ad unit comparison
- Parallel-request count (serial vs 2 vs 3)
- Traffic-group waterfall configs (per-geo layer depth)
- Backup-ad / cross-promotion layer on vs off
- Ad format mixing (e.g. native-in-splash vs standard splash)

### Test Design

- **Duration:** minimum 7 days; 14 days preferred for eCPM stability
- **Sample:** minimum 50,000 DAU per variant for statistical significance on eCPM comparisons
- **Primary metric:** ARPUDAU (or revenue per user). NOT eCPM alone — eCPM can rise while impressions crash.
- **Secondary metrics:** retention (D1, D7, D14), session count, session length, uninstall rate
- **Guardrail:** uninstall rate increase > 5% relative = auto-fail

### Test Evaluation

```
Variant A (control):  freq cap 1/5min,  ARPUDAU $0.012,  D7 retention 38%
Variant B (test):     freq cap 1/3min,  ARPUDAU $0.018,  D7 retention 35%
→ Revenue up 50%, retention down 3pp. Ship if LTV gain > retention loss cost.
   Calculate: LTV_A = $0.012 × avg_days_retained_A
              LTV_B = $0.018 × avg_days_retained_B
   Decision: ship if LTV_B > LTV_A, else roll back.
```

### A/B Test Mechanics & Pitfalls (Mediation Platforms) [³]

- **Two test scopes:** *placement A/B* (test waterfall configs on one or more ad units) vs *traffic-group A/B* (test on a single traffic group). Up to ~10 arms.
- **Read estimated metrics, not API metrics.** A/B arms split *traffic*, but the network's API revenue is reported at the whole-placement level and is **not** split per arm — inside both a 60/40 arm the same placement's 收益API shows the full undivided number. Compare 预估收益 / 预估eCPM / 预估ARPU across arms instead.
- **Device assignment is sticky** while the strategy is unchanged (a device stays in its arm); changing split ratios or strategy re-randomizes assignment.
- **Validate the split with AABB.** If a single placement's A/B result disagrees with the app-level result, the sample is likely unevenly split — re-run as **AABB** (two control, two test arms); when the two A arms read close, the split is clean and the A-vs-B contrast is trustworthy.
- **Simpson's paradox (辛普森悖论):** when several placements are in one experiment, the per-placement winners can disagree with the aggregated winner. Pick the best arm per placement individually, and re-verify with separate experiments rather than trusting the pooled number.
- A 5% gap between configured split ratio and observed device split is normal; a bigger gap usually means an arm has no usable ad source (traffic auto-reroutes to arms that do).

## Revenue Formula Deep-Dive: eCPM Optimization via Three Rate Nodes

收益公式完整展开后，三个可控转化节点（展示率、点击率、转化率）是优化的核心抓手：

```
收益 = 广告请求 × 填充率 × 展示率 × 点击率 × 转化率 × 广告主出价
                                          ↑         ↑         ↑
                                      展示率     点击率    转化率
                                     (三大优化节点)
```

### 节点一：展示率优化

**核心目标：** 提高广告位展示机会，让每一次填充都能变成有效展示。

**手段：**

1. **提高广告位可见度 — 位置深度决定展示机会。**
   - 一级页面上的广告位比三级/四级页面有更高的展示机会。
   - 原则：广告位越靠近用户入口，展示率越高。深层页面广告位存在但用户几乎触达不到。

2. **预加载缓存，消除实时加载延迟。**
   - 先预加载广告缓存到本地，展示时直接取缓存，无需网络实时拉取。
   - 视频广告尤其关键：文件体积大，实时加载可能卡顿，影响体验且展示失败率高。
   - **预加载时机选择：不是越早越好。** 如果预加载后用户未触发广告，展示率下降→系统判定流量价值低→影响填充率。
     - 首页签到位 → app 启动时加载
     - 游戏结算页 → 用户开始游戏后加载
     - 深层页面 → 用户靠近该页面时加载
   - 预加载和展示率需保持平衡。穿山甲缓存管理：自动缓存2条，30分钟过期；单条广告源连续6次请求失败后跳过。

3. **注意广告有效期，过期展示无效。**
   - 穿山甲平台：开屏广告有效期 3 小时，其他所有广告形式有效期均为 **1 小时** [1]。
   - 过期后展示的广告数据会被系统过滤，视为无效数据，不计入收益。
   - 缓存管理必须考虑有效期，过期缓存需及时刷新。

### 节点二：点击率优化

**核心目标：** 扩大尺寸和点击区域，但不依赖误点。

**手段：**

1. **广告元素正确完整显示。**
   - 以原生广告为例，必须包含：广告 icon、标题、描述、图片、穿山甲 logo、广告标识。
   - 信息展示全面、文字语言统一、样式完整 → 用户获取完整信息 → 有效点击（非误点）。

2. **合理扩大广告尺寸。**
   - 更大尺寸有利于视觉吸引和点击。
   - 需在"扩大尺寸提升 CTR"和"不过度侵占内容空间影响留存"之间平衡。

3. **增加可点击元素。**
   - 每个广告元素均需可点击。
   - 扩大点击区域，减小背景板面积。

### 节点三：转化率优化

**核心目标：** 缩短从点击到下载/安装的转化路径。

**手段：**

1. **允许直接下载的网络设置。**
   - SDK 初始化时设置允许直接下载的网络类型（WiFi + 4G/5G）。
   - 适应多种网络场景，避免仅限 WiFi 导致大量移动网络用户无法下载。

2. **下载完成后自动弹出安装提示。**
   - Android 端：App 下载完成后自动弹出安装提示。
   - 穿山甲数据：有安装提示 vs 无安装提示，转化率可提升 **3 倍以上** [1]。
   - 这是性价比最高的转化率优化手段。

3. **使用创意区域（Creative Area），缩短转化路径。**
   - 原生广告中，将点击区域设置为"使用创意区域"。
   - 用户点击广告后直接下载 App，无需跳转至网页后再次点击下载。
   - 省去中间环节，减少用户流失。

4. **确保跳转链路通畅。**
   - iOS：点击后正常跳转 App Store。
   - Android：正常开始下载。
   - 内容类广告：正常跳转浏览器/落地页。

## Common Revenue Problems and Diagnostics

### Problem: eCPM Dropped 30% Week-over-Week

| Check | Diagnostic |
|-------|-----------|
| Geo mix shift | Did a low-eCPM geo spike in installs? Check country-level DAU distribution. |
| Seasonality / 节点效应 | End of quarter = budget flush = high eCPM; January / post-holiday = drop. 618, 双11 等电商节点广告主预算冲刺，eCPM 短期冲高后回落。 |
| New version release | SDK update broke a network? Check per-network fill and eCPM. |
| Ad unit change | Added a unit? Per-unit impression dilution lowers per-unit eCPM. |
| Policy violation | Check AdMob policy center for limit-ad-serving flags. |
| 用户质量下降 | 投放端用户构成变化（机型、年龄、地区、来源渠道），同一渠道每日用户也有差异。 |

### Problem: Fill Rate Below 70%

| Check | Diagnostic |
|-------|-----------|
| Floors too high | Lower CPM floors 20% and observe 48h |
| Network outage | Check each network's dashboard for delivery drops |
| SDK version | Outdated adapter or SDK version rejected by network |
| Geo misconfiguration | Tier 4 geo with Tier 1 floors = zero fill |
| Frequency cap too tight | If 80% of requests are capped, fill rate appears low |
| 高价广告填充下降 | 测试不同平台的填充；在中低价区间增加分层，增加新样式吸纳不同预算 |

### Problem: Revenue Flat While DAU Grows

| Check | Diagnostic |
|-------|-----------|
| New user geo mix | Are new users coming from lower-eCPM geos? |
| New user engagement | Check session count and session length of new cohort vs existing |
| Ad fatigue | Long-term users see same ad units → CTR declines → eCPM declines |
| Impression ceiling | More users but impression per user declining — check frequency caps and session patterns |

### Problem: ARPUDAU Persistent Decline

Full two-sided diagnostic framework:

**前端（投放/用户侧）排查:**
1. 用户质量/构成变化 — 即使同一渠道，不同日期的用户机型/年龄/地区/来源构成不同
2. 通投渠道内部位置变化 — 如头条通投，昨天抖音位获量，今天站内位获量
3. 用户与应用匹配度下降 → 买量端排查调整

**后端（产品/变现侧）排查:**
1. 人均展示次数拆解 — 渗透率、人均展示、分类型展示/点击、CTR、广告报错
2. 用户数据与广告数据关联 — 主流程漏斗转化、关键行为渗透率
3. eCPM — 多档多广告源、分层保价填充率
4. 版本迭代影响 — 按同渠道分版本对比；分版本数据普遍下降则与版本无关；同步结合迭代功能和更新时间节点对比异常时间线

### Problem: 广告展示率异常 (Show Rate Abnormal)

过多广告请求成功但不展示（展示率低）的后果：广告平台判定资源利用率低→降低代码位权重→影响后续填充率和 eCPM。

排查：检查广告埋点深度（被动广告的触发链路 vs 主动广告的用户选择率）、缓存过期时间、UI 遮挡等。展示率不应长期低于 10%。注意：加了预加载后展示率降到 40–60% 是合理的（提前加载的广告未必都展示），对收益是正向的。

### Problem: Revenue Moved — Decomposition Walk [³]

总收益 = 人均收益 × DAU；人均收益 = 人均展示次数 × eCPM / 1000；人均展示次数 = 人均请求次数 × 填充率 × 展示率. Walk the tree top-down, isolating which leaf moved:

| Leaf | Front-end (UA/user side) checks | Back-end (product/mediation) checks |
|------|----------------------------------|--------------------------------------|
| **DAU** | Buy-volume down, organic down, churn up | — |
| **人均请求次数** | User quality / willingness shift | Changed frequency caps / scenes? Toggled auto-request or retry (both raise requests)? Added/removed placements? |
| **填充率** | User-quality drop → networks bid/fill less | Raised a floor (fill down)? Removed backup layer? A source throttled/banned? Seasonal budget (post-holiday dip, 618/双11 surge)? |
| **展示率** | Weak-network / low-end device users up | Tightened client timeout? Added preload (expected drop, see above)? Too many parallel requests caching unshown ads? Waterfall too long? |
| **eCPM** | New-user mix, geo mix, user-quality | Floor changes; one network vs all-networks move; total impression-volume swing (dilutes bid density) |

Rule: front-end issues need buy-side fixes; back-end issues need mediation/product fixes. Always split by app version to rule out a release regression (if all channels drop on the same version, it's the version).

### Problem: Display Gap (展示Gap) > 15% [³]

展示Gap = (SDK展示 − 展示API) / 展示API. First confirm both sides use the **same timezone** and that the API pull window has passed (API data is next-day).

- **展示API > SDK展示:** a stale/duplicate third-party placement ID is serving outside your SDK (e.g. an old app version not on the mediation SDK, or one network ID reused across two mediation sources).
- **展示API < SDK展示:** the network discounted impressions your SDK counted — they were judged **invalid**. Per-source, isolate which one. Common invalid-impression causes:
  - Native/banner must be ≥ 1s on screen and ≥ 50% visible (a transparent overlay can fail the area check even when visually full).
  - Splash must cover ≥ 75% of screen and play the full 5s (or be skipped); a bottom logo bar can't eat into that 75%.
  - Don't obscure, distort, or blur creative.

### Insight: Low-Price Source Out-Shows High-Price Source [³]

Impression count depends on **fill rate × eCPM, not eCPM alone**. A source at eCPM $1000 / 1% fill wins ~1 impression per 100 requests; a $1 / 100% fill source takes the other ~99. Low-price-but-high-fill sources naturally accumulate more impressions — this is correct waterfall behavior, not a bug. Judge each layer by revenue contribution, not impression share.

### Insight: Bidding Win-Rate High but Show-Rate Low [³]

Bidding win and bidding show are different stages. A bidding source can win the auction (its bid joins the waterfall) yet still not show if a higher-priced waterfall layer fills first by the time the request fires. Benchmark a bidding source's show-rate against a **regular waterfall layer at a similar price** in the same app — not against another network or a far-off price.

## Mis-Click (误点) Analysis

某些产品故意设计高误点率以提升 CTR → 提升 eCPM。实际效果有限且风险显著：

**误点提升 eCPM 的前提条件:**
- CTR 上升 + CVR 不下降 → eCPM 可能提升
- CTR 上升 + CVR 同比例下降 → eCPM 不变
- CTR 上升 + CVR 降幅更大 → eCPM 下降

**误点风险:**
- 后向转化数据（CVR）没有跟上的话，eCPM 并不会有实质提升
- 频繁误点影响用户体验 → 留存下降 → LTV 下降
- 大部分广告平台已支持深度事件优化，纯 CTR 维度的优化空间在收窄

**结论:** 谨慎使用。收益增量通常被留存损失抵消。

## Mediation Platform Configuration

### AdMob Mediation

- Default mediation for most apps. Largest demand pool.
- Bidding: enable for all networks that support it
- eCPM floors: Google-optimized floors auto-adjust; manual override for specific geos when needed
- Ad units: create per-format, per-geo when geo variance > 3×
- Key metric: "optimization score" in AdMob dashboard

### MAX (AppLovin)

- Third-party mobile ad market leader: IGA market 28% share (vs Google AdMob 27%, Unity 12%); iOS 43% share
- **核心模块:** AppDiscovery (投放) + ALX (交易) + **MAX (竞价/聚合)** + Adjust (归因收购于2021，全球第二大归因平台)
- Bidding-first architecture: 2018年收购MAX获取实时竞价技术；2021年收购MoPub整合进MAX，清除主要竞对扩大网络规模
- **AXON 2.0 AI 引擎:** 机器学习驱动的增长飞轮 — 全链路数据（投放→交易→竞价→归因）喂养AXON → 广告匹配效率提升300% → ROAS同比增长58% → 吸引更多广告主预算 → 更多开发者加入 → 更多数据 → 算法更精准（正向循环）
- **Take rate:** 50–60%（vs Unity/ironSource 30–35%），体现更强的变现效率
- **战略转型:** 2025年出售游戏业务给Tripledot Studios，全面聚焦高利润软件平台；Q2 2025收入$12.59亿同比+77%，EBITDA利润率81%
- **生态位:** 在广告主预算中通常定位为"补量渠道"（vs Meta/Google作为核心投放渠道）；在iOS平台已反超Google AdMob
- Key metric: "clear rate" per network

**主要风险:**
- 数据合规（浑水2025年做空报告指控数据盗用）
- 平台政策（ATT / Google Privacy Sandbox 持续收紧）
- 电商广告客户流失率达23%

### ironSource (LevelPlay)

- Strong mediation SDK; own demand secondary
- Granular waterfall control; good for hybrid setups
- ROAS optimization tools for UA + monetization alignment
- Key metric: "instance fill rate" and "instance eCPM"

### 穿山甲 (CSJ / Pangle-Domestic)

- **产品体系:**
  - **基础变现** — 标准 SDK 接入，支持全部广告形式
  - **GroMore** — 穿山甲自有聚合平台，支持 waterfall + 国内竞价 + 智能管家（自动化优化），2024年推出智能管家进入变现自动化时代
  - **营销投放** — 广告主侧投放平台
  - **内容联盟** — 内容型流量联盟
- **工具行业专属解决方案** — 穿山甲提供针对工具类应用的变现指南和场景设计参考
- **广告有效期:** 开屏 3 小时，其他格式 1 小时（过期展示数据被系统过滤）
- **预加载:** 每条广告源自动缓存 2 条，缓存 30 分钟过期；单条广告源连续 6 次请求失败自动跳过
- **国内市场份额:** 移动广告联盟领域领先，主要竞对为优量汇、快手

### TopOn (聚合平台) [³]

A mediation/aggregation platform (not a demand network) — one SDK fronts 40+ global and China networks; positioned for developers who want China + global coverage without integrating each SDK directly. Claims 10,000+ clients, 30,000+ apps, 30B daily ad requests. Owns **TopOn ADX** (a demand source, network_firm_id 66) that needs **no separate SDK or app release** — toggle it on in the console.

- **Two data lineages** in every report — settlement API vs SDK-tracked (see Core Metrics → *Data Source*). Estimated revenue/eCPM is real-time off your sort prices; API revenue is next-day and authoritative.
- **Core console levers** (all generalizable IAA mechanics, detailed above): sort price vs floor, auto price, parallel requests, backup ads, traffic grouping, ad-unit/source frequency caps, same-price display weight, S2S/C2S bidding.
- **Bidding support** spans Meta, AdMob, Mintegral, Pangle, Unity, ironSource, Vungle, 优量汇, 快手, 百度, Sigmob, InMobi, Yandex, Bigo, Helium, MAX, TaurusX, Smaato, Moloco, TapTap, Huawei (CN only), etc. Bidding floor is supported on most but **lowers bidding fill** — leave uncapped during ramp.
- **Auto-create ad source (自动创建广告源):** for networks with Report-API + management-API access (Mintegral, 优量汇, 穿山甲, 快手, 百度, Meta, Pangle, AdMob, Vungle, Bigo, Unity, etc.) the console creates the network-side placement and back-fills params, avoiding manual cross-entry errors.
- **Ad format mixing (广告样式混用 / 广告混出):** render one network ad format inside a different TopOn placement type — e.g. native-in-splash (原生混开屏), native-in-interstitial, native-in-banner, interstitial-in-rewarded. Extends where a high-eCPM native source can be reused; widely supported (Mintegral, 优量汇, 穿山甲, 百度, 快手, Meta, AdMob, Pangle, Vungle, Bigo, Yandex, etc.) with SDK-render or self-render options.
- **Console-built tooling** the skill maps to standard ops: 漏斗分析 (funnel), 留存价值/LTV, 用户行为 (frequency & per-eCPM-bucket distribution), 分小时 (hourly), 数据预警 (alerts), A/B 测试, 交叉推广 + 直投广告.
- Reporting timezone defaults to UTC+8 (RMB accounts) or UTC (USD accounts); each network's API returns its own timezone — a frequent source of cross-platform GAP.

### Cross-Promotion & Direct Ads (交叉推广 & 直投广告) [³]

Two levers that break the third-party-network revenue ceiling by selling/serving your own inventory:

- **Cross-promotion (交叉推广):** promote your *own* other apps inside this one (mutual cross-install), or backfill when third-party networks have no fill (the creative caches locally and shows instantly). Price it as a waterfall layer — its sort price competes with other sources. Best when you don't need precise budget control. Supports rewarded/interstitial/native/splash/banner.
- **Direct ads (直投广告):** serve *direct-advertiser* deals with proper budget/impression-budget control, structured as 广告组 > 广告计划 > 创意. The advertiser's spend becomes your revenue directly — a path toward independent commercialization beyond network arbitrage. Use when you need impression-budget pacing.
- For both, TopOn's own server-side reward callback applies (network_firm_id: ADX 66, direct 67, cross-promo 35); for third-party networks prefer the network's own S2S reward callback.

### Data Alerts (数据预警) [³]

Set monitoring rules on any dimension (account/app/placement/source/network/format) × metric (收益, 展示, eCPM, DAU, DEU, 渗透率, 展示/DAU, 填充, Gap…), comparing the latest day vs *last-week-same-day*, *prior day*, or a *fixed threshold* (by value or %). Delivered by in-app message + email on the schedule you set. Since API data lands at different times per network, set API-metric alert times after that network's pull window. A practical baseline: alert on any app-level estimated-revenue move >20% vs prior day. Pairs with the "单日波动 > 20% 需排查" ops checklist rule below.

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
- 版本监控：新版本上线后 48h 内重点监控广告数据
- 竞品监控：周期性收集竞品广告设计变化

## Ad Frequency and Repetition

### 广告重复率问题

用户反复看到相同广告是常见投诉。降低重复率的可操作手段：

1. **多源变现** — 不同广告源的广告系统和广告主预算构成不同，可降低重复率。但受限于 eCPM 优先策略（如穿山甲一家独大时无法切换），方案可用性依赖高 eCPM 网络的多样性。
2. **控制展示间隔** — 短间隔有较大概率下发相同广告主；适当拉大广告间隔有助于降低重复率。
3. 广告下发内容不在开发者控制范围，关键在于通过架构设计（多源 + 间隔）间接调控。

## Privacy and Compliance

### iOS ATT (App Tracking Transparency)

- IDFA availability: 30–50% in 2025 depending on app category and region
- Without IDFA: personalized ads limited; eCPM drops 15–40% for affected users
- SKAdNetwork: conversion value management can recover some attribution; does not directly recover eCPM

### GDPR / CCPA

- Consent management platform (CMP) required for EU/EEA and California users
- Non-consented users: non-personalized ads only; eCPM roughly 50–70% of personalized ads
- IAB TCF 2.2 compliance required for EU demand sources

### COPPA / Child-Directed Apps

- Ad serving limited to child-safe inventory; networks severely restricted
- eCPM drops 60–80% vs non-child-directed
- If tool is "general audience but used by children," configure age-gating, not COPPA flag

## New Ad Operator Learning Path (新人培训路径)

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

1. **Over-measuring eCPM in isolation.** eCPM × impression volume = revenue. Raising eCPM by reducing impressions (fewer ads, higher floors) often nets less total revenue. Always co-monitor ARPUDAU.

2. **Waterfall configuration drift.** Floors set 6 months ago are stale. Networks change; demand shifts. Weekly floor review is minimum viable frequency.

3. **Too many ad networks.** SDK bloat inflates app size, increases crash rate, and adds maintenance overhead. Each network should justify its inclusion with ≥ 5% of revenue.

4. **Ignoring geo distribution.** Global average eCPM is meaningless. A spike in Tier 4 installs can look like an eCPM crash. Always segment by geo.

5. **Interstitial on app first launch.** The cost in D1 retention loss almost always exceeds the revenue gain from the impression.

6. **No frequency capping.** Unlimited ad exposure creates short-term revenue spike followed by retention collapse, then revenue collapse.

7. **Rewarded placements with no value.** "Watch an ad for nothing" placements get 0% completion. The reward must be real utility.

8. **Refresh rate too aggressive.** Banner refresh under 30 seconds generates more impressions but each impression is lower-value (advertisers detect and bid down on rapid-refresh inventory). Net eCPM often drops enough to offset impression volume gain.

9. **Testing with insufficient sample.** eCPM is high-variance. Tests with < 50,000 DAU per variant frequently produce false positives.

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

20. **预加载后展示率下降就回滚.** 预加载会让展示率降到 40–60%，这是正常的（提前加载的广告未必都展示），但提升了用户展示机会，对收益是正向的。不要据此回滚预加载。

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

## Data Sources

**引用标记说明:**
- `[1]` = 穿山甲官方 — https://www.csjplatform.com/growthcenter/6101274400195d0046c2731d
- `[2]` = 36氪/Alpha Engineer AppLovin分析 — https://www.36kr.com/p/3480808267798659
- `[³]` = TopOn 官方帮助中心 — https://help.toponad.net/cn （聚合平台机制、流量分组、头部竞价、漏斗分析、数据排查、A/B测试、交叉推广/直投）
- `[*]` = 行业经验值，无单一确定来源，综合多家平台公开范围和社区共识

### 穿山甲 (CSJ / Pangle-Domestic) 官方资料

| 数据点 | 来源 |
|--------|------|
| 收益公式拆解、展示率/点击率/转化率优化方法论 | https://www.csjplatform.com/growthcenter/6101274400195d0046c2731d |
| 广告有效期（开屏3h/其他1h）、预加载时机选择、安装提示提升3倍转化率、创意区域缩短转化路径 | 同上 |
| 穿山甲广告样式介绍（开屏/Banner/插屏/激励视频/原生） | https://www.csjplatform.com/growthcenter/61010a9cefaa39004d1c0e16 |
| 穿山甲休闲游戏商业化发行指南（GroMore聚合优化策略） | https://www.csjplatform.com/growthcenter/6126410ed00c3f00549ff71b |
| 穿山甲官网 — 工具行业解决方案 | https://www.csjplatform.com/ |
| GroMore 智能管家、变现自动化 | https://www.csjplatform.com/growthcenter（2024-01-03 文章） |

### AppLovin / MAX

| 数据点 | 来源 |
|--------|------|
| IGA市场份额28%（全球第一）、iOS 43%、AppLovin发展历程、AXON 2.0 引擎（匹配效率+300%/ROAS+58%）、Take rate 50-60%（vs Unity 30-35%）、2025年战略转型（出售游戏业务/Q2收入$12.59亿/EBITDA利润率81%）、生态位（补量渠道 vs Meta/Google核心渠道）、浑水做空与电商客户流失率23% | https://www.36kr.com/p/3480808267798659 — 「一页纸」讲透美股公司之：AppLovin, Alpha Engineer / 费斌杰, 2025-09-25 |
| AppLovin 官方 | https://www.applovin.com/ |

### TopOn (聚合平台) 官方资料 [³]

| 数据点 | 来源 |
|--------|------|
| 聚合平台概况、40+ 广告平台清单、Bidding S2S/C2S 对接方式、各平台报表时区 | https://help.toponad.net/cn/docs/2KR6QU |
| 排序价格 vs 底价、自动价格、兜底广告、同价格展示概率、流量分组维度、自动创建广告源 | https://help.toponad.net/cn/docs/cXus5n ; https://help.toponad.net/cn/docs/KjVUSq |
| 头部竞价原理、支持竞价的平台及竞价底价 | https://help.toponad.net/cn/docs/dfnwQG |
| 瀑布流结构参考、精细化分层、每层填充率纪律、并行请求、展示频次控制 | https://help.toponad.net/cn/docs/bUh0Id ; https://help.toponad.net/cn/docs/QXxkrR ; https://help.toponad.net/cn/docs/eUCSzO |
| 漏斗分析（应用启动→展示→点击各节点转化率与排查） | https://help.toponad.net/cn/docs/qlHqYM |
| 数据来源（三方API vs 统计）、展示Gap排查、有效展示标准 | https://help.toponad.net/cn/docs/Z4zsF6 ; https://help.toponad.net/cn/docs/5e6DnV |
| 收益变动分解排查（DAU/人均请求/填充率/展示率/eCPM 五因子） | https://help.toponad.net/cn/docs/cdsQvH ; https://help.toponad.net/cn/docs/SxzgbM |
| A/B 测试（预估口径、AABB、辛普森悖论、设备粘性分配） | https://help.toponad.net/cn/docs/PqmmHP |
| 交叉推广 & 直投广告、数据预警、留存价值/用户行为/分小时报表 | https://help.toponad.net/cn/docs/Popzgt ; https://help.toponad.net/cn/docs/LQgwMA ; https://help.toponad.net/cn/docs/p8JTEN |

### 行业经验数据（无单一确定来源，综合行业共识）

以下数据基于多家广告网络和聚合平台的公开范围，无单一官方来源链接：

| 数据类别 | 说明 |
|----------|------|
| eCPM Tier 区间（Tier 1 $3-10 / Tier 2 $1-4 / Tier 3 $0.30-1.50 / Tier 4 $0.05-0.30） | 综合 AdMob、MAX、ironSource 等平台 2024-2025 行业报告和开发者社区经验值 |
| 广告格式 eCPM 区间（Banner $0.10-1.50 / Interstitial $2-8 / Rewarded $5-20 / Native $1-6） | 综合多家聚合平台公开 eCPM 基准 |
| CTR 健康范围（Banner 0.5-3% / Interstitial 3-10% / Rewarded 10-30%） | 综合行业基准和平台建议阈值 |
| 填充率 ≥90%、展示率 ≥85% | 行业通用健康基准线 |
| 填充耗时 <10s（视频）/ <2s（图片） | 穿山甲 PPT 资料 + 行业共识 |
| 瀑布流配置经验值（floor 80-90%均值、3-4 tiers、20% tier gap） | 行业运营最佳实践综合 |

## Verification Checklist

- [ ] All ad units have per-geo configurations where geo eCPM variance > 3×
- [ ] Floor prices reviewed within last 14 days
- [ ] Bidding enabled for all bidding-capable networks
- [ ] Interstitial frequency cap configured (≤ 1 per 3 minutes)
- [ ] No interstitial on app-first-launch path
- [ ] Each active network contributes ≥ 5% of total revenue (or has a documented strategic reason)
- [ ] Rewarded placements unlock demonstrable user value
- [ ] CMP configured for GDPR/CCPA regions
- [ ] Analytics dashboard segments revenue by geo, platform, ad unit, and network
- [ ] 展示率作为日常监控指标纳入 dashboard
- [ ] 新版本上线后有 48h 广告数据监控流程
- [ ] 广告埋点设计包含触发条件、频次限制、兜底逻辑三个要素
- [ ] 默认流量分组 (catch-all) 未关闭且配有有效广告源
- [ ] 每个广告位整体填充率 ≥ 90%，各层填充率 ≥ 1%
- [ ] 并行请求条数 ≤ 5（避免请求不展示导致代码位降权）
- [ ] 开屏 waterfall ≤ 5 层，并配置兜底/SDK预置应对首次冷启动超时
- [ ] 报表分析区分三方API（结算口径）与SDK统计（实时口径），展示Gap 监控阈值 15%
- [ ] 数据预警规则已配置（关键维度单日波动 >20%）
