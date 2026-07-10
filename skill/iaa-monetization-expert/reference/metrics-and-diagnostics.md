# IAA Reference — 指标体系与收益诊断

> 属于 `iaa-monetization-expert` skill 的参考文档（按需 Read）。引用标记 `[1]`=穿山甲官方 · `[2]`=36氪AppLovin · `[3]`=TopOn官方，完整链接见 [operations-compliance.md](operations-compliance.md) 的 Data Sources。

本文覆盖：Core Metrics（收入/投放/参与指标、ARPU 与 eCPM 分解）、漏斗分析、eCPM 三率节点深挖、常见收益问题诊断、误点分析。

## Core Metrics

### Revenue Metrics

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| **eCPM** (effective cost per mille) | (total revenue / total impressions) × 1000 | Blended rate across all networks. Primary health indicator. |
| **ARPU** (avg revenue per user) | total revenue / total users (DAU or MAU) | Monetization efficiency per user. |
| **ARPDAU** | daily revenue / DAU | Daily per-user revenue; most actionable timeframe. |
| **LTV** (lifetime value) | ARPDAU × avg retention days; also: current-day ARPU × X-day LT | Projected total revenue per user. |

### Data Source: Settlement (API) vs SDK-Tracked [3]

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
| **Fill Rate** | filled requests / total ad requests | ≥ 90% overall ad-unit (per TopOn layer discipline) |
| **Show Rate / Render Rate** | impressions / filled responses | Higher is better; chronically low — or high-fill-but-low-show — gets the placement downranked |
| **Impression Rate** | impressions / ad requests | = fill rate × show rate |
| **CTR** (click-through rate) | clicks / impressions | Relative order: rewarded > interstitial > banner (absolute benchmarks vary by platform/geo/vertical — use your own dashboard) |
| **Fill Latency** | avg time from ad request to filled response | Shorter is better; video slower than display due to file size; high latency on a tier signals waterfall bloat. |

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
- Impressions up, eCPM down = possible over-exposure diluting bid density; also: overly rapid banner refresh inflates low-value impressions
- ARPDAU flat while DAU grows = healthy scaling
- ARPDAU declining while DAU grows = new user quality issue or market saturation
- ARPU decline = check 频次 (frequency) and eCPM separately; 频次 issues are often buy-side or product bugs; eCPM issues are often network/fill/competition

### User Ad Value Decay

用户进入应用后，广告价值随时间/使用深度衰减。首个广告位和首个激励视频位的 eCPM 通常最高。靠后的广告位尽管频次高但单价低。

→ 高价值广告位应前置（靠近用户进入点），低价值频次型广告位后置。

## Funnel Analysis (漏斗分析) [3]

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
| Floors too high | Lower CPM floors a tier and observe for a day or two |
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

### Problem: ARPDAU Persistent Decline

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

排查：检查广告埋点深度（被动广告的触发链路 vs 主动广告的用户选择率）、缓存过期时间、UI 遮挡等。展示率不应长期过低。注意：加了预加载后展示率会下降，这是合理的（提前加载的广告未必都展示），对收益是正向的。

### Problem: Revenue Moved — Decomposition Walk [3]

总收益 = 人均收益 × DAU；人均收益 = 人均展示次数 × eCPM / 1000；人均展示次数 = 人均请求次数 × 填充率 × 展示率. Walk the tree top-down, isolating which leaf moved:

| Leaf | Front-end (UA/user side) checks | Back-end (product/mediation) checks |
|------|----------------------------------|--------------------------------------|
| **DAU** | Buy-volume down, organic down, churn up | — |
| **人均请求次数** | User quality / willingness shift | Changed frequency caps / scenes? Toggled auto-request or retry (both raise requests)? Added/removed placements? |
| **填充率** | User-quality drop → networks bid/fill less | Raised a floor (fill down)? Removed backup layer? A source throttled/banned? Seasonal budget (post-holiday dip, 618/双11 surge)? |
| **展示率** | Weak-network / low-end device users up | Tightened client timeout? Added preload (expected drop, see above)? Too many parallel requests caching unshown ads? Waterfall too long? |
| **eCPM** | New-user mix, geo mix, user-quality | Floor changes; one network vs all-networks move; total impression-volume swing (dilutes bid density) |

Rule: front-end issues need buy-side fixes; back-end issues need mediation/product fixes. Always split by app version to rule out a release regression (if all channels drop on the same version, it's the version).

### Problem: Display Gap (展示Gap) > 15% [3]

展示Gap = (SDK展示 − 展示API) / 展示API. First confirm both sides use the **same timezone** and that the API pull window has passed (API data is next-day).

- **展示API > SDK展示:** a stale/duplicate third-party placement ID is serving outside your SDK (e.g. an old app version not on the mediation SDK, or one network ID reused across two mediation sources).
- **展示API < SDK展示:** the network discounted impressions your SDK counted — they were judged **invalid**. Per-source, isolate which one. Common invalid-impression causes:
  - Native/banner must be ≥ 1s on screen and ≥ 50% visible (a transparent overlay can fail the area check even when visually full).
  - Splash must cover ≥ 75% of screen and play the full 5s (or be skipped); a bottom logo bar can't eat into that 75%.
  - Don't obscure, distort, or blur creative.

### Insight: Low-Price Source Out-Shows High-Price Source [3]

Impression count depends on **fill rate × eCPM, not eCPM alone**. A source at eCPM $1000 / 1% fill wins ~1 impression per 100 requests; a $1 / 100% fill source takes the other ~99. Low-price-but-high-fill sources naturally accumulate more impressions — this is correct waterfall behavior, not a bug. Judge each layer by revenue contribution, not impression share.

### Insight: Bidding Win-Rate High but Show-Rate Low [3]

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

