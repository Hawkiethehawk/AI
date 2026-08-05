---
title: "回调信息说明"
source: "https://help.toponad.net/cn/docs/OKZCoAuh"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "回调信息说明"]
content_sha256: "5202b75ce22ab0ba0a66f90b6ffa8c2672622ddaf8f373b04b31a6054293f446"
knowledge_role: "reference_only"
has_article_body: true
---

# 回调信息说明

## 1. 事件字典与 extraDic

本章说明测试日志里常见的 `callbackName`、`extraDic` 含义，便于对照 `[ATRN-JS]` 输出排查问题。

### 1.1 日志格式

开启 `ATSDK.setNetworkLogDebug(true)` 后，JS 层在 `ATAdEvents` 中央分发点打印：

复制代码

```
[ATRN-JS] AdEvents:<placementID> ← <callbackName> { extraDic: {...}, requestMessage: '...' }
```

| 日志片段 | 含义 |
| --- | --- |
| `AdEvents:b5b44a0f115321` | 广告位 ID = `b5b44a0f115321` |
| `← adShowRevenueCallbackKey` | 本次事件类型 = 展示收益回调 |
| `extraDic` | 本次广告的信息对象（`ATAdInfo`，见下） |
| `requestMessage` | 附加说明；load/show **失败**时为错误文案；收益回调里可能出现 `succeed` 等状态串 |

### 1.2 extraDic 指向哪个实体？

| 项 | 说明 |
| --- | --- |
| **原生实体** | Topon `ATAdInfo`（一次广告填充/展示的信息快照） |
| **RN 类型** | `ATAdInfo` = `Record<string, unknown>` |
| **传递路径** | 原生 Listener 拿到 `ATAdInfo` → `toString()` → 桥解析为 Map → `payload.extraDic` |
| **业务读取** | `setAdRevenueListener((info) => …)` 的 `info` 与收益事件的 `extraDic` 为同一结构 |

> `extraDic` **不是** RN 插件自定义对象，而是原生 SDK 广告信息的标准 JSON 展平；字段集以宿主集成的 Topon 原生 SDK 版本为准，下表为常见字段。

### 1.3 收益回调 `adShowRevenueCallbackKey`

| 项 | 值 |
| --- | --- |
| 事件通道（callName） | `CommonADCall` |
| callbackName | `adShowRevenueCallbackKey` |
| 业务监听 | `ad.setAdRevenueListener((info) => { … })` 或 `ATAdEvents.setRevenueListener(placementID, …)` |
| 触发时机 | 广告展示后，SDK 上报本次展示收益 |

**日志示例解读**（激励视频 / 腾讯广点通）：

复制代码

```
callbackName: adShowRevenueCallbackKey
placementID:  b5b44a0f115321
extraDic:
  adunit_format: RewardedVideo     → 激励视频
  network_firm_id: 8               → 腾讯 Ads（GDT）
  network_name: Tencent Ads
  publisher_revenue: 0.01477       → 开发者收益（USD）
  currency: USD
  adsource_price: 14.77             → 广告源价格（通常为元/千次展示口径，以 SDK 为准）
  adsource_id: 2597639              → Topon 后台广告源 ID
  network_placement_id: 3013…      → 三方平台广告位 ID
  req_id / requestId: a0e063…       → 本次广告请求 ID
  country: CN
  placement_reward_name: reward_item → 激励奖励名称（激励位特有）
  placement_reward_number: 1        → 激励奖励数量
```

### 1.4 ATAdInfo 常见字段

下列 key 出现在 `extraDic` / 监听器 `info` 中。**同一条事件不一定包含全部字段**。

#### 广告位与样式

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `adunit_id` | string | 广告位 ID（常与 `placementID` 相同） |
| `adunit_format` | string | 广告样式：`RewardedVideo` / `Interstitial` / `Banner` / `Native` / `Splash` 等 |
| `placement_type` | number | 广告位类型枚举（Topon 内部定义） |
| `scenario_id` | string | 场景 ID（传入 `show({ scenarioId })` 时可能有） |

#### 平台与广告源

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `network_firm_id` | number | 平台 ID（如 `8` 腾讯、`15` 穿山甲等，与后台一致） |
| `network_name` | string | 平台名称 |
| `network_type` | string | 平台类型描述，如 `Network` |
| `network_placement_id` | string | 三方广告平台的广告位 ID |
| `adsource_id` | string | Topon 广告源 ID |
| `adsource_index` | number | 该源在瀑布中的序号 |
| `adsource_price` | number | 广告源价格/eCPM 相关 |
| `adsource_bid_type` | number | 竞价类型 |
| `adsource_isheaderbidding` | number | 是否 Header Bidding（0/1） |
| `ad_source_type` | number | 广告源类型 |

#### 收益与 eCPM（收益回调重点）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `publisher_revenue` | number | **开发者收益**，业务上报常用 |
| `currency` | string | 收益币种，如 `USD`、`CNY` |
| `precision` | string | 收益精度来源，如 `publisher_defined` |
| `ecpm_level` | number | eCPM 层级 |
| `rmb_to_usd_rate` | string | 人民币兑美元汇率 |
| `usd_to_rmb_rate` | string | 美元兑人民币汇率 |

#### 请求与实验

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `req_id` / `requestId` | string | 广告请求 ID |
| `id` | string | 广告展示/填充实例 ID |
| `abtest_id` | number | AB 实验 ID |
| `segment_id` | number | 流量分组 ID |
| `s_id` | number | 策略/场景相关 ID |
| `e_c` | string | 加密/签名串，一般由 SDK 内部使用，业务通常无需解析 |

#### 激励专用

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `placement_reward_name` | string | 激励奖励名称 |
| `placement_reward_number` | number | 激励奖励数量 |

#### 其他

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `country` | string | 国家/地区代码，如 `CN` |

### 1.5 callbackName 与监听器对照

日志里的 `callbackName` 与业务监听器方法的对应关系如下。带 **info** 的表示 `extraDic` 会传入监听器 `info` 参数。

#### 收益（CommonADCall）

| callbackName | 监听器 |
| --- | --- |
| `adShowRevenueCallbackKey` | `setAdRevenueListener(info)` |

#### 激励视频（RewardedVideoCall）

| callbackName | 监听器方法 |
| --- | --- |
| `rewardedVideoDidFinishLoading` | `onRewardedVideoAdLoaded` |
| `rewardedVideoDidFailToLoad` | `onRewardedVideoAdFailed`（看 `requestMessage`） |
| `rewardedVideoDidStartPlaying` | `onRewardedVideoAdPlayStart`（info） |
| `rewardedVideoDidEndPlaying` | `onRewardedVideoAdPlayEnd`（info） |
| `rewardedVideoDidFailToPlay` | `onRewardedVideoAdPlayFailed`（info） |
| `rewardedVideoDidClose` | `onRewardedVideoAdClosed`（info） |
| `rewardedVideoDidClick` | `onRewardedVideoAdPlayClicked`（info） |
| `rewardedVideoDidRewardSuccess` | `onReward`（info） |
| `rewardedVideoDidRewardFailed` | `onRewardFailed`（info） |
| `rewardedVideoDidDeepLink` | `onDeeplinkCallback`（info；`isDeeplinkSuccess`） |
| `rewardedVideoDidAgain*` 系列 | `onAgain*` / `onRewardedVideoAdAgain*` 系列 |
| `rewardedVideoDidMultipleLoaded` | `setAdMultipleLoadedListener`（info） |
| `rewardedVideoDidAdSource*` 系列 | `setAdSourceStatusListener`（原始 payload） |

#### 插屏（InterstitialCall）

| callbackName | 监听器方法 |
| --- | --- |
| `interstitialAdDidFinishLoading` | `onInterstitialAdLoaded` |
| `interstitialAdFailToLoadAD` | `onInterstitialAdLoadFail` |
| `interstitialDidShowSucceed` | `onInterstitialAdShow`（info） |
| `interstitialFailedToShow` | `onInterstitialAdShowFailed`（error） |
| `interstitialAdDidClose` | `onInterstitialAdClose`（info） |
| `interstitialAdDidClick` | `onInterstitialAdClicked`（info） |
| `interstitialAdDidStartPlaying` | `onInterstitialAdVideoStart`（info） |
| `interstitialAdDidEndPlaying` | `onInterstitialAdVideoEnd`（info） |
| `interstitialDidFailToPlayVideo` | `onInterstitialAdVideoError` |

#### 开屏（SplashCall）

| callbackName | 监听器方法 |
| --- | --- |
| `splashDidFinishLoading` | `onSplashAdLoaded`（`isTimeout`） |
| `splashDidFailToLoad` | `onSplashAdLoadFail` |
| `splashDidTimeout` | `onSplashAdTimeout` |
| `splashDidShowSuccess` | `onSplashAdShow`（info） |
| `splashDidShowFailed` | `onSplashAdShowFailed` |
| `splashDidClose` / `splashDidClick` | `onSplashAdClose` / `onSplashAdClick` |

#### Banner（BannerCall）

| callbackName | 监听器方法 |
| --- | --- |
| `bannerAdDidFinishLoading` | `onBannerAdLoaded` |
| `bannerAdFailToLoadAD` | `onBannerAdLoadFail` |
| `bannerAdDidShowSucceed` | `onBannerAdShow`（info） |
| `bannerAdDidClick` | `onBannerAdClicked`（info） |
| `bannerAdTapCloseButton` | `onBannerAdClose`（info） |
| `bannerAdAutoRefreshSucceed` | `onBannerAdAutoRefreshed`（info） |
| `bannerAdAutoRefreshFail` | `onBannerAdAutoRefreshFail` |

#### 原生（NativeCall）

| callbackName | 监听器方法 |
| --- | --- |
| `nativeAdDidFinishLoading` | `ATNativeNetworkListener.onNativeAdLoaded` |
| `nativeAdFailToLoadAD` | `onNativeAdLoadFail` |
| `nativeAdDidShowNativeAd` | `onNativeAdShow`（info） |
| `nativeAdDidClick` | `onNativeAdClicked`（info） |
| `nativeAdDidTapCloseButton` | `onNativeAdClose`（info） |
| `nativeAdDidStartPlayingVideo` | `onNativeAdVideoStart` |
| `nativeAdDidEndPlayingVideo` | `onNativeAdVideoEnd` |
| `NativeVideoProgress` | `onNativeAdVideoProgress`（进度在 `extraDic.progress`） |

#### 初始化（InitCallName，全局监听）

| callbackName | 说明 |
| --- | --- |
| `sdkInitSuccess` / `sdkInitFail` | SDK 初始化结果 |
| `consentSet` / `consentDismiss` | GDPR 同意结果 |
| `location` | 地域检测结果 |

通过 `ATAdEvents.addGlobalListener` 接收。

### 1.6 多条缓存加载 `*DidMultipleLoaded`

`extraDic` 中常见：

| 字段 | 说明 |
| --- | --- |
| `bidding_attempt` | 竞价中的广告信息列表 |
| `loading` | 加载中的广告信息列表 |

监听：`setAdMultipleLoadedListener((info) => …)`。

---
