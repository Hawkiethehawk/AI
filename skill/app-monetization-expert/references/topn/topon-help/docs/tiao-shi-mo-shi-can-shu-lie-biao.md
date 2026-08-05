---
title: "调试模式参数列表"
source: "https://help.toponad.net/cn/docs/tiao-shi-mo-shi-can-shu-lie-biao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-07-29"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "调试模式参数列表"]
content_sha256: "de6d5787d7ceda2ca8b5ea27f3ff87edd5f57bf58ef536ef04fada912b5af9e1"
knowledge_role: "reference_only"
has_article_body: true
---

# 调试模式参数列表

# TopOn SDK 调试模式广告平台支持详情表

本表格详细列出了TopOn SDK调试模式支持的所有广告平台、广告类型以及各类型下的广告样式。

## 广告平台列表

| 平台ID | 平台名称 | 平台代码 |
| --- | --- | --- |
| 1 | Meta (Facebook) | ATAdNetWorkMetaType |
| 2 | AdMob | ATAdNetWorkAdmobType |
| 3 | InMobi | ATAdNetWorkInmobiType |
| 5 | AppLovin | ATAdNetWorkApplovinType |
| 6 | Mintegral | ATAdNetWorkMintegralType |
| 8 | GDT (腾讯广告) | ATAdNetWorkGDTType |
| 9 | Chartboost | ATAdNetWorkChartboostType |
| 10 | Tapjoy | ATAdNetWorkTapjoyType |
| 11 | IronSource | ATAdNetWorkIronsourceType |
| 12 | Unity Ads | ATAdNetWorkUnityAdsType |
| 13 | Vungle | ATAdNetWorkVungleType |
| 15 | CSJ (穿山甲) | ATAdNetWorkCSJType |
| 22 | Baidu (百度) | ATAdNetWorkBaiduType |
| 23 | Nend | ATAdNetWorkNendType |
| 24 | Maio | ATAdNetWorkMaioType |
| 25 | StartApp | ATAdNetWorkStartAppType |
| 28 | KuaiShou (快手) | ATAdNetWorkKuaiShouType |
| 29 | Sigmob | ATAdNetWorkSigmobType |
| 32 | MyTarget | ATAdNetWorkMyTargetType |
| 37 | Fyber | ATAdNetWorkFyberType |
| 50 | Pangle (穿山甲海外) | ATAdNetWorkPangleType |
| 51 | Klevin | ATAdNetWorkKlevinType |
| 58 | PubNative | ATAdNetWorkPubNativeType |
| 59 | Bigo | ATAdNetWorkBigoType |
| 65 | BidMachine | ATAdNetWorkBidmachineType |
| 66 | ADX | ATAdNetWorkAdxType |
| 77 | Kwai | ATAdNetWorkKwaiType |
| 84 | Smaato | ATAdNetWorkSmaatoType |

## 详细广告样式支持表

### Pangle (穿山甲海外)

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATPangleSplashAdDefaultType |
| 插屏广告 | 默认样式 | 0 | ATPangleInterstitialAdDefaultType |
| 激励视频 | 默认样式 | 0 | ATPangleRewardVideoAdDefaultType |
| 横幅广告 | 默认样式 | 0 | ATPangleBannerAdDefaultType |
| 原生广告 | 默认样式 | 0 | ATPangleNativeAdDefaultType |

### CSJ (穿山甲)

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATCSJSplashAdDefaultType |
| 插屏广告 | 新样式 | 3 | ATCSJInterstitialAdNewType |
| 激励视频 | 默认样式 | 0 | ATCSJRewardVideoAdDefaultType |
| 横幅广告 | 默认样式 | 0 | ATCSJBannerAdDefaultType |
| 原生广告 | Draw模板样式 | 201 | ATCSJNativeAdDrawTemplateType |
| 原生广告 | Draw自渲染样式 | 202 | ATCSJNativeAdDrawSelfRenderType |
| 原生广告 | Feed模板样式 | 101 | ATCSJNativeAdFeedTemplateType |
| 原生广告 | Feed自渲染样式 | 102 | ATCSJNativeAdFeedSelfRenderType |

### Meta (Facebook)

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATMetaSplashAdDefaultType |
| 插屏广告 | 默认样式 | 0 | ATMetaInterstitialAdDefaultType |
| 激励视频 | 默认样式 | 0 | ATMetaRewardVideoAdDefaultType |
| 激励视频 | 插屏样式 | 1 | ATMetaRewardVideoAdInterstitialType |
| 横幅广告 | 默认样式 | 0 | ATMetaBannerAdDefaultType |
| 原生广告 | 自渲染样式 | 1 | ATMetaNativeAdSelfRenderType |
| 原生广告 | 原生横幅模板样式 | 2 | ATMetaNativeAdNativeBannerTemplateType |
| 原生广告 | 模板样式 | 3 | ATMetaNativeAdTemplateType |
| 原生广告 | 原生横幅自渲染样式 | 4 | ATMetaNativeAdNativeBannerSelfRenderType |

### MyTarget

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATMytargetSplashAdDefaultType |
| 插屏广告 | 默认样式 | 0 | ATMytargetInterstitialAdDefaultType |
| 激励视频 | 默认样式 | 0 | ATMytargetRewardVideoAdDefaultType |
| 横幅广告 | 默认样式 | 0 | ATMytargetBannerAdDefaultType |
| 原生广告 | 默认样式 | 0 | ATMytargetNativeAdDefaultType |

### AdMob

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATAdMobSplashAdDefaultType |
| 插屏广告 | 图片样式 | 1 | ATAdMobInterstitialAdPictureType |
| 插屏广告 | 视频样式 | 2 | ATAdMobInterstitialAdVideoType |
| 激励视频 | 默认样式 | 0 | ATAdMobRewardVideoAdDefaultType |
| 横幅广告 | 默认样式 | 0 | ATAdMobBannerAdDefaultType |
| 原生广告 | 图片样式 | 1 | ATAdMobNativeAdPictureType |
| 原生广告 | 视频样式 | 2 | ATAdMobNativeAdVideoType |

### AppLovin

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATApplovinSplashAdDefaultType |
| 插屏广告 | 默认样式 | 0 | ATApplovinInterstitialAdDefaultType |
| 激励视频 | 默认样式 | 0 | ATApplovinRewardVideoAdDefaultType |
| 横幅广告 | 默认样式 | 0 | ATApplovinBannerAdDefaultType |
| 原生广告 | 默认样式 | 0 | ATApplovinNativeAdDefaultType |

### Baidu (百度)

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATBaiduSplashAdDefaultType |
| 插屏广告 | 全屏视频样式 | 2 | ATBaiduInterstitialAdFullScreenVideoType |
| 插屏广告 | 模板样式 | 3 | ATBaiduInterstitialAdTemplateType |
| 激励视频 | 默认样式 | 0 | ATBaiduRewardVideoAdDefaultType |
| 横幅广告 | 默认样式 | 0 | ATBaiduBannerAdDefaultType |
| 原生广告 | 自渲染样式 | 1 | ATBaiduNativeAdSelfRenderType |
| 原生广告 | 模板样式 | 4 | ATBaiduNativeAdTemplateType |

### GDT (腾讯广告)

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATGDTSplashAdDefaultType |
| 插屏广告 | 弹窗视频样式 | 1 | ATGDTInterstitialAdPopupVideoType |
| 插屏广告 | 全屏视频样式 | 2 | ATGDTInterstitialAdFullScreenVideoType |
| 激励视频 | 默认样式 | 0 | ATGDTRewardVideoAdDefaultType |
| 横幅广告 | 默认样式 | 0 | ATGDTBannerAdDefaultType |
| 原生广告 | 模板样式 | 1 | ATGDTNativeAdTemplateType |
| 原生广告 | 自渲染样式 | 2 | ATGDTNativeAdSelfRenderType |
| 原生广告 | 视频模板样式 | 3 | ATGDTNativeAdVideoTemplateType |
| 原生广告 | 视频自渲染样式 | 4 | ATGDTNativeAdVideoSelfRenderType |

### KuaiShou (快手)

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATKuaiShouSplashAdDefaultType |
| 插屏广告 | 默认样式 | 0 | ATKuaiShouInterstitialAdDefaultType |
| 激励视频 | 默认样式 | 0 | ATKuaiShouRewardVideoAdDefaultType |
| 横幅广告 | 默认样式 | 0 | ATKuaiShouBannerAdDefaultType |
| 原生广告 | Feed自渲染样式 | 101 | ATKuaiShouNativeAdFeedSelfRenderType |
| 原生广告 | Feed模板样式 | 102 | ATKuaiShouNativeAdFeedTemplateType |
| 原生广告 | Draw Feed样式 | 200 | ATKuaiShouNativeAdDrawFeedType |

### Mintegral

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATMintegralSplashAdDefaultType |
| 插屏广告 | 视频样式 | 2 | ATMintegralInterstitialAdVideoType |
| 激励视频 | 默认样式 | 0 | ATMintegralRewardVideoAdDefaultType |
| 横幅广告 | 默认样式 | 0 | ATMintegralBannerAdDefaultType |
| 原生广告 | 自渲染样式 | 1 | ATMintegralNativeAdSelfRenderType |
| 原生广告 | 模板样式 | 2 | ATMintegralNativeAdTemplateType |

### Nend

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATNendSplashAdDefaultType |
| 插屏广告 | 默认样式 | 1 | ATNendInterstitialAdDefaultType |
| 插屏广告 | 视频样式 | 2 | ATNendInterstitialAdVideoType |
| 插屏广告 | 全屏样式 | 3 | ATNendInterstitialAdFullScreenType |
| 激励视频 | 默认样式 | 0 | ATNendRewardVideoAdDefaultType |
| 横幅广告 | 默认样式 | 0 | ATNendBannerAdDefaultType |
| 原生广告 | 默认样式 | 0 | ATNendNativeAdDefaultType |

### ADX

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATADXSplashAdDefaultType |
| 插屏广告 | 全屏样式 | 1 | ATADXInterstitialAdFullScreenType |
| 插屏广告 | 半屏样式 | 2 | ATADXInterstitialAdHalfScreenType |
| 激励视频 | 默认样式 | 0 | ATADXRewardVideoAdDefaultType |
| 横幅广告 | 320x50 | 1 | ATADXBannerAdType\_320\_50 |
| 横幅广告 | 320x90 | 2 | ATADXBannerAdType\_320\_90 |
| 横幅广告 | 300x250 | 3 | ATADXBannerAdType\_300\_250 |
| 横幅广告 | 728x90 | 4 | ATADXBannerAdType\_728\_90 |
| 原生广告 | 左图右文样式 | 1 | ATADXNativeAdTypeExpressLeftPicRightText |
| 原生广告 | 左文右图样式 | 2 | ATADXNativeAdTypeExpressLeftTextRightPic |
| 原生广告 | 上图下文样式 | 3 | ATADXNativeAdTypeExpressTopPicBottomText |
| 原生广告 | 上文下图样式 | 4 | ATADXNativeAdTypeExpressTopTextBottomPic |
| 原生广告 | 文字叠加样式 | 5 | ATADXNativeAdTypeExpressTextSuperposedLayer |
| 原生广告 | 自渲染样式 | 6 | ATADXNativeAdTypeSelfRender |

### Bigo

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 开屏广告 | 默认样式 | 0 | ATBigoSplashAdDefaultType |
| 插屏广告 | 默认样式 | 0 | ATBigoInterstitialAdDefaultType |
| 激励视频 | 默认样式 | 0 | ATBigoRewardVideoAdDefaultType |
| 横幅广告 | 小尺寸 (320x50) | 1 | ATBigoBannerAdSmallType |
| 横幅广告 | 大尺寸 (300x250) | 2 | ATBigoBannerAdLargeType |
| 原生广告 | 默认样式 | 0 | ATBigoNativeAdDefaultType |

### PubNative

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 插屏广告 | 默认样式 | 0 | ATPubNativeInterstitialAdDefaultType |
| 激励视频 | 默认样式 | 0 | ATPubNativeRewardVideoAdDefaultType |
| 横幅广告 | 默认样式 | 0 | ATPubNativeBannerAdDefaultType |
| 原生广告 | 默认样式 | 0 | ATPubNativeNativeAdDefaultType |

### Kwai

| 广告类型 | 样式名称 | 样式值 | 描述 |
| --- | --- | --- | --- |
| 插屏广告 | 默认样式 | 0 | ATKwaiInterstitialAdDefaultType |
| 激励视频 | 默认样式 | 0 | ATKwaiRewardVideoAdDefaultType |

### 其他平台

以下平台均支持基础的五种广告类型（开屏、插屏、激励视频、横幅、原生），但只提供默认样式（样式值为0）：

- **Chartboost**: 支持所有广告类型的默认样式
- **Fyber**: 支持所有广告类型的默认样式
- **InMobi**: 支持所有广告类型的默认样式
- **IronSource**: 支持所有广告类型的默认样式
- **Klevin**: 支持所有广告类型的默认样式
- **Maio**: 支持所有广告类型的默认样式
- **Sigmob**: 支持所有广告类型的默认样式
- **StartApp**: 支持所有广告类型的默认样式
- **Tapjoy**: 支持所有广告类型的默认样式
- **Unity Ads**: 支持所有广告类型的默认样式
- **Vungle**: 支持所有广告类型的默认样式
- **BidMachine**: 仅在枚举中定义，具体样式未在此文件中详细说明
- **Smaato**: 仅在枚举中定义，具体样式未在此文件中详细说明

## 说明

1. **样式值**: 每种广告样式都有对应的数字标识符，用于在代码中指定具体的广告样式
2. **默认样式**: 大部分平台都提供默认样式（样式值为0），这是最基础的广告展示形式
3. **特殊样式**: 部分平台如CSJ、Meta、GDT等提供了多种特殊样式，以满足不同的展示需求
4. **广告类型**: 主要包括开屏广告(Splash)、插屏广告(Interstitial)、激励视频(RewardVideo)、横幅广告(Banner)、原生广告(Native)
5. **平台支持**: 不同平台对各种广告类型的支持程度不同，部分平台可能不支持某些广告类型

---

*本表格基于ATDebuggerConfigDefine.h文件生成，版本日期：2022年8月10日*
