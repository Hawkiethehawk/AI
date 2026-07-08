# IAP Reference — 付费墙 / 定价 / 商店机制 / 运营 / 数据来源

> 属于 `iap-monetization-expert` skill 的参考文档（按需 Read）。本文末尾的 Data Sources 是全 skill 引用标记 `[1][2][3][4]` 的权威出处。

本文覆盖：付费墙设计、定价策略、免费试用与引导优惠、App Store/Google Play 商店机制、订阅基础设施（RevenueCat/Adapty/Superwall/Qonversion）、国内市场、按工具类型打包、A/B 测试、隐私合规、运营流程、新人路径、常见陷阱、Data Sources。

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


## Data Sources

> ⚠️ 平台佣金/政策随时间变化；**转化、留存等基准无单一权威绝对值**，随品类/地区/价格/周期大幅浮动。本 skill 给相对排序与方法，**绝对数字请读下列基准报告并以自己后台队列为准**。以下为权威来源类别（具体深链接以官方现行文档为准）。

- **`[1]` Apple 官方文档** — App Store 订阅与内购、StoreKit、App Store Server Notifications、Small Business Program、App Review Guidelines（3.1.x）、引导/促销优惠、App Store Connect 帮助。入口：[developer.apple.com / App Store 订阅](https://developer.apple.com/app-store/subscriptions/)、[App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)、[Small Business Program](https://developer.apple.com/app-store/small-business-program/)
- **`[2]` Google Play 官方文档** — Play Billing、订阅（base plans / offers）、服务费、Real-time Developer Notifications、Play Console 帮助。入口：[Play Billing 文档](https://developer.android.com/google/play/billing)、[Play 服务费/订阅政策（Play Console 帮助）](https://support.google.com/googleplay/android-developer)
- **`[3]` RevenueCat** — 订阅后端/分析/付费墙文档，及《State of Subscription Apps》分品类基准报告。入口：[RevenueCat](https://www.revenuecat.com/)、[State of Subscription Apps](https://www.revenuecat.com/state-of-subscription-apps/)
- **`[4]` Adapty** — 订阅基础设施/付费墙 A/B 文档，及订阅基准报告。入口：[Adapty](https://adapty.io/)

**未标记**的内容为通用公式 / 概念 / 结构性事实（LTV 公式、漏斗结构、相对排序、付费墙/定价方法论等）。

*注：本 skill 由 Claude 按 [[iaa-monetization-expert]] 的结构与方法新撰；上述官方文档为现行权威入口，但具体页面/数字会更新，引用前请以官方现行版本与你自己的后台数据为准。*

