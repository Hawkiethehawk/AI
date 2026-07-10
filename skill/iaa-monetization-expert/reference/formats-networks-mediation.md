# IAA Reference — 广告形式 / 网络 / 聚合（Mediation）

> 属于 `iaa-monetization-expert` skill 的参考文档（按需 Read）。引用标记含义见 [operations-compliance.md](operations-compliance.md) 的 Data Sources。

本文覆盖：广告形式（Banner/插屏/激励/原生）、广告网络（全球 T1/T2、国内市场、选网启发式）、瀑布流 vs Bidding、自建聚合预加载、并行请求/兜底/分组/频控、各聚合平台配置（AdMob/MAX/ironSource/穿山甲/TopOn）。

## Ad Formats — Utility App Context

### Banner (MREC 300×250, Standard 320×50, Adaptive)

- **Best for:** persistent UI surfaces (bottom bars, between list items)
- **eCPM:** lowest of the four formats (relative; absolute varies by platform/geo)
- **UX cost:** low if placed correctly; high if intrusive
- **Tool-specific:** bottom banner on calculators, converters, file browsers. Avoid on screens requiring precision touch (photo editors).
- **Refresh rate:** faster refresh raises impressions but lowers eCPM.

### Interstitial (Full-Screen)

- **Best for:** screen transitions, task completion, natural breaks
- **eCPM:** medium, above banner (relative; absolute varies by platform/geo)
- **UX cost:** high if mistimed
- **Tool-specific:** after scan completes, after file conversion, after cleaning finishes. Never on app launch — causes immediate uninstall.
- **Frequency cap:** limit interstitials per session and enforce a minimum interval between them; tune the exact cadence to your own retention data.
- **Placement timing:** on "task done" screens, NOT during active task flow.

### Rewarded Video

- **Best for:** unlocking features, removing time gates, premium actions
- **eCPM:** highest of the four formats (relative; absolute varies by platform/geo)
- **UX cost:** opt-in, near-zero
- **Tool-specific:** unlock extra conversions, remove watermark, extend free trial feature, skip wait timer.
- **Key insight for tools:** tools rarely have natural virtual currency hooks. Create synthetic value — "watch to unlock 10 more conversions today" works.
- **ARPU by placement:** 同一产品内各激励视频位 eCPM 差距不大，ARPU 主要受该位置频次影响。用户进入后的首个激励视频位置广告价值最高。

### Native / Native Advanced

- **Best for:** content feeds, lists, recommendations
- **eCPM:** medium (relative; absolute varies by platform/geo)
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

1. Start with AdMob + a few networks matching top-3 geos (domestic: 穿山甲 + 优量汇 as baseline)
2. Add networks one at a time; measure incremental lift
3. Drop networks that contribute negligible revenue after a fair trial window
4. Keep the network count lean — too many rarely adds incremental value and inflates SDK bloat; a single integration wants enough networks across floor + bidding layers to stabilize fill and eCPM, no more.

**Geo network shortlist [3] (via a mediation platform; order not significant):**

| Region | Networks |
|--------|----------|
| 中国大陆 | 穿山甲、优量汇、快手、百度、Mintegral、TopOn ADX |
| 欧美 (US/EU) | Meta、AdMob、AppLovin、Unity、ironSource、Fyber/Digital Turbine、Mintegral |
| 东南亚 (SEA) | AdMob、Meta、Pangle、Unity、AppLovin、TopOn ADX、Mintegral |

## Mediation: Waterfall vs Bidding

### Waterfall

Ordered list of networks by expected eCPM. Request cascades down until filled.

**Pros:** full control over priority; predictable behavior; works with older networks.
**Cons:** latency per hop (more layers = slower); manual eCPM floors must be updated; suboptimal — highest bidder may sit below a non-filling network.

**Waterfall configuration rules of thumb:**
- CPM floors: set from each source's **own recent measured eCPM**, not a guess (higher floor = lower fill; delivered eCPM tends to hug the floor)
- 合理的分层在 10–20 层区间（TopOn）；可根据用户网络、填充率和 eCPM 表现适当增减
- Leave a price gradient between adjacent tiers to avoid a big gap that strands traffic
- Review floors weekly; automated floor optimization is table stakes in 2025+
- CPM 底价设置后，广告平台交付的 eCPM 往往接近底价；底价越高，填充率越低

**Waterfall structure reference (瀑布流结构参考) [3]:**

| Zone | Config | Layers | Notes |
|------|--------|--------|-------|
| Bidding pool (并行层) | A-bid, B-bid, C-bid, D-bid | 2–4 | **Do not set a bidding floor here** — it tanks bidding fill rate |
| Head / high-floor | one network at a high floor (e.g. $80) | 2–4 | Maximize unit price |
| Mid / mid-floor | networks cross-ordered descending ($70→$20) | 2–8 | Fill the gaps; insert a mid-layer wherever a big eCPM jump leaves traffic underused |
| Tail / low- or no-floor | low-floor + no-floor backup | 2–6 | No-floor bottom layer with auto-price guarantees fill |

**Layer-count and fill discipline [3]:**
- Total layers scale with DAU/request volume: T1 geos 30–40, T2 20–30, T3 (SEA/LATAM/Africa) 10–20. Typical overall range 10–20.
- Target overall ad-unit fill ≥ 90%. Each layer's fill should stay ≥ 1% (control to ≥ 5%); a near-zero top layer can be dropped.
- If a non-splash top layer fills ≥ 10%, try raising its floor (or add a higher layer above it) to capture more high-value offers.
- Evaluate each layer's **revenue share vs impression share**: if a $5 layer is 30% of impressions but only 10% of revenue, frequency-cap or thin it and add higher-priced layers — the goal is to shift impressions toward high-eCPM offers (精细化分层).
- New app with no history: run a coarse "$50 → no-floor, step ~$10" waterfall for 2–3 days (until each layer has ≥ 2000 impressions — the network's bid model needs that to stabilize), then tune to real eCPM.
- Many layers (15+, esp. 20–40): turn on parallel requests (3–8) to cut total fill latency.
- **Splash (开屏) is the exception: keep the waterfall ≤ 5 layers** so a slow load doesn't miss the impression window.

### Sort Price vs Floor (排序价格) [3]

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

**Server-side (S2S) vs client-side (C2S) bidding [3]:** each bidding network integrates one way or the other (some support both). The distinction is transparent to placement strategy — you just integrate the right SDK version — but matters for debugging: S2S bids resolve server-side (Meta, AdMob, Mintegral, Pangle, Unity, ironSource, Vungle, Bigo, Yandex, TopOn ADX); C2S resolves on-device (Helium/Chartboost, Huawei, Verve, TapTap, APS, Kwai); 优量汇/快手/百度/Sigmob/InMobi support both.

**Bidding-floor caution [3]:** setting a竞价底价 (bidding floor) filters out wins below it — which directly **lowers bidding fill and revenue**. Leave bidding uncapped during ramp; only introduce a bidding floor once monetization is stable. How it resolves each auction: a winning bid above the floor joins the waterfall ordering; a winning bid below the floor is dropped and the slot waits for the next load. A bidding source's *request* count is normally lower than its *bid* count — once it wins the auction it only fires an actual request if no higher waterfall layer already filled.

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
- Monitor: if bidding pool fill rate runs low, waterfall too shallow — add networks

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

### Parallel Requests (并行请求) [3]

Instead of strictly serial top-down requests, fire N sources at once to cut fill latency and pre-cache for back-to-back placements.

- **Two modes:** *fixed count* (request N sources at a time, max 10) or *same-price parallel* (fire all equal-priced sources together, then the next price tier). Same-price parallel respects price priority exactly; fixed count can request across price tiers.
- **Ordering is unchanged** — parallel affects *requests* only. If A and B both fill, the higher sort price still shows first; the other is cached.
- **Recommended 2–3, never more than 5.** Over-requesting wastes bandwidth and, more importantly, requesting-but-not-showing makes networks judge your inventory as low-utilization and **downrank the placement** (lowering future fill and eCPM). Mediation caches the unshown ad to partly offset this.
- **When to use:** many layers (15+), frequent/short-interval placements, or poor-network users.

### Backup Ads (兜底广告) [3]

A backup source runs **in parallel with (not after) the waterfall** (错峰并行策略): if the waterfall fills, the higher-priced waterfall ad shows; if it doesn't, the backup shows. Configure it on a no-floor network placement. This raises overall fill (more parallel chances) and shortens fill latency, but does **not** guarantee 100% fill — a network can still decline a low-value user. Distinct from a plain no-floor *bottom waterfall layer*, which only fills after higher layers fail.

For splash specifically: combine an SDK-preset策略 (hardcoded fallback placement ID) with a backup source so the first cold-launch impression — which otherwise waits on a config fetch and often times out — still has an ad to show, while normal sessions run the full parallel waterfall.

### Traffic Grouping (流量分组) [3]

Segment users into groups, each with its own waterfall — the core mechanism of精细化 (fine-grained) monetization. Group by: geo, city, date/hour/timezone, network type, app/SDK/OS version, device id/type/brand, install time, channel/sub-channel, IDFA status, install source, cold-start, user-value bucket, or custom key-value rules (e.g. `age≥18 & network=bytedance,tencent`). Rules within one group are AND-ed.

- **Priority matters:** one ad unit can hold many groups; on a multi-match the **highest-priority group wins**. Order specific-before-general (a "US" group must sit above an "Americas" group, or US users fall into the broad waterfall).
- **The default group is the catch-all tail — never disable it and always give it live placements**, or unmatched traffic is wasted.
- **Canonical use — geo-tiered layering:** T1 30–40 layers, T2 20–30, T3 10–20. Split by your actual install distribution (e.g. dedicated Indonesia and Brazil groups if each is ~40% of users).
- channel / sub-channel / custom-rule grouping require the client to pass the field and ship a release; all other dimensions are console-only.

### Display Frequency Control (展示频次控制) [3]

Two independent levels: **ad-unit (placement) level** and **ad-source level**, each with hourly cap / daily cap / interval-seconds. All caps are local to the device (reset on reinstall). Uses:
- **Quality lever where floors aren't available:** capping a source's impressions raises per-impression quality and indirectly lifts its eCPM, and serves as a poor-man's layering test.
- **Policy safety on launch:** Meta and AdMob can flag/ban an account over a few anomalous devices when volume is low — set a per-source impression cap (~10, or near the placement's per-user impression count) on these two during ramp.
- **Repetition control:** a per-source interval (e.g. 60s) reduces the odds of re-serving the same advertiser back-to-back.

### Waterfall Retry Optimization

每次请求都从最高价格层级开始请求。失败多次后自动跳过相应层级。这回答了"是否可以先给用户定级再按级加载"的问题——不需要手动定级，失败跳过机制已经实现了类似效果。


## Mediation Platform Configuration

### AdMob Mediation

- Default mediation for most apps. Largest demand pool.
- Bidding: enable for all networks that support it
- eCPM floors: Google-optimized floors auto-adjust; manual override for specific geos when needed
- Ad units: create per-format, per-geo when geo eCPM variance is large
- Key metric: "optimization score" in AdMob dashboard

### MAX (AppLovin) [2]

> All quantitative figures in this subsection (market share, AXON metrics, take rate, financials) are sourced to 36氪 / Alpha Engineer `[2]`.

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

### TopOn (聚合平台) [3]

A mediation/aggregation platform (not a demand network) — one SDK fronts 40+ global and China networks; positioned for developers who want China + global coverage without integrating each SDK directly. Claims 10,000+ clients, 30,000+ apps, 30B daily ad requests. Owns **TopOn ADX** (a demand source, network_firm_id 66) that needs **no separate SDK or app release** — toggle it on in the console.

- **Two data lineages** in every report — settlement API vs SDK-tracked (see Core Metrics → *Data Source*). Estimated revenue/eCPM is real-time off your sort prices; API revenue is next-day and authoritative.
- **Core console levers** (all generalizable IAA mechanics, detailed above): sort price vs floor, auto price, parallel requests, backup ads, traffic grouping, ad-unit/source frequency caps, same-price display weight, S2S/C2S bidding.
- **Bidding support** spans Meta, AdMob, Mintegral, Pangle, Unity, ironSource, Vungle, 优量汇, 快手, 百度, Sigmob, InMobi, Yandex, Bigo, Helium, MAX, TaurusX, Smaato, Moloco, TapTap, Huawei (CN only), etc. Bidding floor is supported on most but **lowers bidding fill** — leave uncapped during ramp.
- **Auto-create ad source (自动创建广告源):** for networks with Report-API + management-API access (Mintegral, 优量汇, 穿山甲, 快手, 百度, Meta, Pangle, AdMob, Vungle, Bigo, Unity, etc.) the console creates the network-side placement and back-fills params, avoiding manual cross-entry errors.
- **Ad format mixing (广告样式混用 / 广告混出):** render one network ad format inside a different TopOn placement type — e.g. native-in-splash (原生混开屏), native-in-interstitial, native-in-banner, interstitial-in-rewarded. Extends where a high-eCPM native source can be reused; widely supported (Mintegral, 优量汇, 穿山甲, 百度, 快手, Meta, AdMob, Pangle, Vungle, Bigo, Yandex, etc.) with SDK-render or self-render options.
- **Console-built tooling** the skill maps to standard ops: 漏斗分析 (funnel), 留存价值/LTV, 用户行为 (frequency & per-eCPM-bucket distribution), 分小时 (hourly), 数据预警 (alerts), A/B 测试, 交叉推广 + 直投广告.
- Reporting timezone defaults to UTC+8 (RMB accounts) or UTC (USD accounts); each network's API returns its own timezone — a frequent source of cross-platform GAP.

### Cross-Promotion & Direct Ads (交叉推广 & 直投广告) [3]

Two levers that break the third-party-network revenue ceiling by selling/serving your own inventory:

- **Cross-promotion (交叉推广):** promote your *own* other apps inside this one (mutual cross-install), or backfill when third-party networks have no fill (the creative caches locally and shows instantly). Price it as a waterfall layer — its sort price competes with other sources. Best when you don't need precise budget control. Supports rewarded/interstitial/native/splash/banner.
- **Direct ads (直投广告):** serve *direct-advertiser* deals with proper budget/impression-budget control, structured as 广告组 > 广告计划 > 创意. The advertiser's spend becomes your revenue directly — a path toward independent commercialization beyond network arbitrage. Use when you need impression-budget pacing.
- For both, TopOn's own server-side reward callback applies (network_firm_id: ADX 66, direct 67, cross-promo 35); for third-party networks prefer the network's own S2S reward callback.

### Data Alerts (数据预警) [3]

Set monitoring rules on any dimension (account/app/placement/source/network/format) × metric (收益, 展示, eCPM, DAU, DEU, 渗透率, 展示/DAU, 填充, Gap…), comparing the latest day vs *last-week-same-day*, *prior day*, or a *fixed threshold* (by value or %). Delivered by in-app message + email on the schedule you set. Since API data lands at different times per network, set API-metric alert times after that network's pull window. A practical baseline: alert on any app-level estimated-revenue move >20% vs prior day. Pairs with the "单日波动 > 20% 需排查" ops checklist rule below.

