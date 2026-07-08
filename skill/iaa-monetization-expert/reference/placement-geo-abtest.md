# IAA Reference — 广告位设计 / 地区优化 / A/B 测试

> 属于 `iaa-monetization-expert` skill 的参考文档（按需 Read）。引用标记含义见 [operations-compliance.md](operations-compliance.md) 的 Data Sources。

本文覆盖：广告位设计（按品类的埋点类型、产品类型×广告构成、设计原则、广告位数量）、地区优化（eCPM Tier 分级、分地区策略与瀑布流、开屏 eCPM 作为用户价值信号）、A/B 测试（可测变量、设计、评估、聚合平台机制与陷阱）。

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
3. **Minimum interaction distance.** After an ad, leave a meaningful gap (time or interactions) before the next one — never back-to-back.
4. **First-session restraint.** Minimize or avoid first-session interstitials. First session is retention-critical.
5. **Exit intent ads.** Showing an ad when user presses back (exit intent) generates revenue from churning users but accelerates churn. Utility apps with strong retention should avoid exit-intent ads.
6. **Rewarded placement value.** If the feature unlocked by a rewarded ad has no real user value, completion rate will be near-zero. Every rewarded placement must unlock a behavior the user demonstrably wants.
7. **Main path penetration.** 梳理用户在应用内的主要路径，在主要路径上植入广告，能有效提升展示率。
8. **Rewarded entry visibility.** 激励视频入口尽可能明显，覆盖较多用户；奖励内容的图片/icon 设计需明显突出、美观。

### Ad Unit Count Guidelines

- Fewer is better: more screens can carry more ad units, but keep the count lean
- Each ad unit added dilutes impressions per unit, reducing per-unit eCPM from frequency capping and refresh mechanics — concentrate impressions on the high-value placements

## Geo Optimization

### eCPM Tier Classification [*]

| Tier | Geos | eCPM Relative Level |
|------|------|---------------------|
| **Tier 1** | US, CA, AU, UK, DE, JP, KR, CH, NO, SE, DK, NL | highest |
| **Tier 2** | FR, IT, ES, AT, BE, FI, IE, NZ, SG, HK, TW, AE | high |
| **Tier 3** | BR, MX, TR, RU, ZA, PL, CZ, MY, TH | medium |
| **Tier 4** | IN, ID, PH, NG, PK, BD, VN, EG | lowest |

> Absolute eCPM ranges per tier have no single authoritative source and drift over time/vertical — split your own dashboard by country and read the real numbers there.

### Geo-Specific Strategy

- **Tier 1:** maximize eCPM — bidding, premium formats (rewarded), multi-network competition
- **Tier 2:** maximize fill — hybrid mediation, multiple networks, tighter floors
- **Tier 3:** maximize impressions — higher frequency caps, low floors, reward user actions to boost engagement
- **Tier 4:** survival — low eCPM means high impression volume is the only lever. Consider rewarded video to boost per-user revenue; interstitials risk churn at these eCPMs

### Geo Waterfall Configuration

- **Same ad unit, different geo = different waterfall.**
  - Tier 1 geo: bidding pool only, higher floor
  - Tier 3 geo: hybrid, low floor, higher frequency
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

- **Duration:** long enough to smooth eCPM volatility (cover at least one full intra-week cycle)
- **Sample:** large enough per variant to reach statistical significance on eCPM (eCPM is high-variance; size it from your own baseline variance)
- **Primary metric:** ARPDAU (or revenue per user). NOT eCPM alone — eCPM can rise while impressions crash.
- **Secondary metrics:** retention (D1, D7, D14), session count, session length, uninstall rate
- **Guardrail:** uninstall rate increase > 5% relative = auto-fail

### Test Evaluation

```
Variant A (control):  freq cap 1/5min,  ARPDAU $0.012,  D7 retention 38%
Variant B (test):     freq cap 1/3min,  ARPDAU $0.018,  D7 retention 35%
→ Revenue up 50%, retention down 3pp. Ship if LTV gain > retention loss cost.
   Calculate: LTV_A = $0.012 × avg_days_retained_A
              LTV_B = $0.018 × avg_days_retained_B
   Decision: ship if LTV_B > LTV_A, else roll back.
```

### A/B Test Mechanics & Pitfalls (Mediation Platforms) [3]

- **Two test scopes:** *placement A/B* (test waterfall configs on one or more ad units) vs *traffic-group A/B* (test on a single traffic group). Up to ~10 arms.
- **Read estimated metrics, not API metrics.** A/B arms split *traffic*, but the network's API revenue is reported at the whole-placement level and is **not** split per arm — inside both a 60/40 arm the same placement's 收益API shows the full undivided number. Compare 预估收益 / 预估eCPM / 预估ARPU across arms instead.
- **Device assignment is sticky** while the strategy is unchanged (a device stays in its arm); changing split ratios or strategy re-randomizes assignment.
- **Validate the split with AABB.** If a single placement's A/B result disagrees with the app-level result, the sample is likely unevenly split — re-run as **AABB** (two control, two test arms); when the two A arms read close, the split is clean and the A-vs-B contrast is trustworthy.
- **Simpson's paradox (辛普森悖论):** when several placements are in one experiment, the per-placement winners can disagree with the aggregated winner. Pick the best arm per placement individually, and re-verify with separate experiments rather than trusting the pooled number.
- A 5% gap between configured split ratio and observed device split is normal; a bigger gap usually means an arm has no usable ad source (traffic auto-reroutes to arms that do).

