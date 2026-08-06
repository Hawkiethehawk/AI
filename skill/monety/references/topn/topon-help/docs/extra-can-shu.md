---
title: "extra参数"
source: "https://help.toponad.net/cn/docs/extra-can-shu"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "extra参数"]
content_sha256: "f9e365ef966b5f848fec43854abc8bc3821bd9015ce1be356f1a478bd376ab86"
knowledge_role: "reference_only"
has_article_body: true
---

# extra参数

## **1**. extra参数

您在加载广告(load)时可以通过向extra字典中传入参数来配置您的广告，对于不同的广告类型，配置的键不同，请您参考下表获取具体配置键的名称及说明。

> 请注意，您的extra字典值中不应出现对象，请在添加前将其转换为json字符串。

### 1.1 激励视频广告

| 键 | 所需值类型 | 说明 |
| --- | --- | --- |
| **kATAdLoadingExtraUserIDKey** | NSString | 用于服务器激励，用户唯一ID |
| **kATAdLoadingExtraRewardNameKey** | NSString | 用于服务器激励，奖励名称 |
| **kATAdLoadingExtraRewardAmountKey** | NSNumber | 用于服务器激励，奖励数量 |
| **kATRewardedVideoCallbackExtraAdsourceIDKey** | NSString | 激励视频广告源ID |
| **kATRewardedVideoCallbackExtraNetworkIDKey** | NSString | 广告平台Firm Id |
| **kATRewardedVideoKlevinRewardTimeKey** | NSNumber | Klevin SDK相关 |
| **kATRewardedVideoKlevinRewardTriggerKey** | NSNumber | Klevin SDK相关 |

###

### 1.2 原生广告

| 键 | 所需值类型 | 说明 |
| --- | --- | --- |
| **kATExtraInfoNativeAdSizeKey** | NSValue | 模板渲染原生广告尺寸，需要与ATNativeAdView一致 |
| **kATExtraNativeImageSizeKey** | NSString | 设置原生广告大图片尺寸，值有下列定义 kATExtraNativeImageSize228\_150 kATExtraNativeImageSize690\_388 kATExtraNativeImageSize1280\_720 kATExtraNativeImageSize1200\_628 kATExtraNativeImageSize640\_640 |
| **kATNativeAdSizeToFitKey** | BOOL | 设置是否自适应高度 |
| **kATExtraNativeIconImageSizeKey** | NSNumber | StartApp 相关设置 |
| **kATExtraStartAPPNativeMainImageSizeKey** | NSString | StartApp 相关设置 |

###

### 1.3 开屏广告

| 键 | 所需值类型 | 说明 |
| --- | --- | --- |
| **kATSplashExtraTolerateTimeoutKey** | NSNumber | 超时时间，详见[开屏广告接入最佳实践](/cn/docs/kai-ping-guang-gao-jie-ru-zui-jia-shi-jian-K5kV) |
| **kATSplashExtraAppLogoImageKey** | UIImage | 仅pangle平台支持，设置logo图片 |

###

### 1.4 插屏广告

| 键 | 所需值类型 | 说明 |
| --- | --- | --- |
| **kATInterstitialExtraAdSizeKey** | NSValue | 设置插屏广告大小 |
| **kATInterstitialExtraUsesRewardedVideo** | BOOL | Sigmob平台，激励视频当做插屏使用 |

###

### 1.5 横幅广告

| 键 | 所需值类型 | 说明 |
| --- | --- | --- |
| kATAdLoadingExtraBannerAdSizeKey | NSValue | 请求的广告尺寸大小，请保持跟后台配置的比例相近 |
| kATAdLoadingExtraBannerSizeAdjustKey | BOOL | 部分平台用，调节广告尺寸 |
| kATAdLoadingExtraAdmobBannerSizeKey | NSValue | 仅Admob平台支持，自适应横幅大小 |
| kATAdLoadingExtraAdmobAdSizeFlagsKey | NSNumber | 仅Admob平台支持，自适应横幅大小 |

## **2**. 自定义参数

您可以在加载广告时向extra字典中传入自定义参数，或者在展示广告时向ATShowConfigs实例对象中设置自定义参数，并在之后流程的回调中获取它们。下图为您展示了自定义参数的数据流向：



### 2.1 加载广告时传递自定义数据

请使用 **kATAdLoadingExtraMediaExtraKey** 键添加，请参考下方代码片段：

复制代码

```
NSMutableDictionary *extra = [@{
    kATAdLoadingExtraMediaExtraKey:@"your custom data",
} mutableCopy];
```

### 2.2 展示广告时传递自定义数据

> 需要iOS SDK >= 6.3.10

复制代码

```
ATShowConfig *showConfig = ATShowConfig.new;
showConfig.showCustomExt = @"testShowCustomExt";
showConfig.scene = ...
...
```
