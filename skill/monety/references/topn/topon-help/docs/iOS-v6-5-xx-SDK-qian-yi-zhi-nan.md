---
title: "iOS v6.5.xx SDK 迁移指南"
source: "https://help.toponad.net/cn/docs/iOS-v6-5-xx-SDK-qian-yi-zhi-nan"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-05"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "iOS v6.5.xx SDK 迁移指南"]
content_sha256: "639b4e64be5dd668c96936be06f8a2c4d9c4b344042ec7e5aeb12af816618aff"
knowledge_role: "reference_only"
has_article_body: true
---

# iOS v6.5.xx SDK 迁移指南

本文档提供了从旧版(SDK < 6.4.94)迁移到新版(SDK >= 6.4.94)的详细指南。

## 1. 头文件引入变化

> | 旧版 SDK版本<6.4.94 | 新版 SDK版本>=6.4.94 |
> | --- | --- |
> | `#import <AnyThinkNative/AnyThinkNative.h>` | `#import <AnyThinkSDK/AnyThinkSDK.h>` |
> | `#import <AnyThinkInterstitial/AnyThinkInterstitial.h>` | `#import <AnyThinkSDK/AnyThinkSDK.h>` |
> | `#import <AnyThinkRewardedVideo/AnyThinkRewardedVideo.h>` | `#import <AnyThinkSDK/AnyThinkSDK.h>` |
> | `#import <AnyThinkSplash/AnyThinkSplash.h>` | `#import <AnyThinkSDK/AnyThinkSDK.h>` |
> | `#import <AnyThinkBanner/AnyThinkBanner.h>` | `#import <AnyThinkSDK/AnyThinkSDK.h>` |
> | `#import <AnyThinkMediaVideo/ATAdManager+ATMediaVideo.h>` | `#import <AnyThinkSDK/AnyThinkSDK.h>` |

## 2. 原生广告 ATNativeAdOffer 数据类型变更

### 2.1 属性定义变更

> | 版本 | 属性定义 |
> | --- | --- |
> | 旧版 SDK<6.4.94 | `@property(nonatomic, readonly) ATNativeAd *nativeAd;` |
> | 新版 SDK>=6.4.94 | `@property(nonatomic, readonly) id <ATNativeMaterialProtocol> nativeAd;` |

### 2.2 影响范围及代码适配

> | 版本 | 代码示例 | 数据类型 |
> | --- | --- | --- |
> | 旧版 SDK<6.4.94 | `NSInteger appSize = nativeAdOffer.nativeAd.appSize;` | `NSInteger` |
> | 新版 SDK>=6.4.94 | `NSString *appSize = nativeAdOffer.nativeAd.appSize;` | `NSString *` |
>
> - 检查所有使用 `nativeAdOffer.nativeAd.appSize` 的代码
> - 将接收该值的变量类型从 `NSInteger` 改为 `NSString *`
> - 注意相关的数值计算和显示逻辑需要相应调整

## 3. 自定义广告平台接入改版

请前往<https://help.toponad.net/cn/docs/zi-ding-yi-guang-gao-ping-tai-SDK-ban-ben-6-4-94>

## 4. v6.5.40及其以上版本手动集成注意事项

- 【动态库变更】您需要在General -> Frameworks,Libraries,and Embedded Content 中将`AnyThinkSDK.xcframework`、`SmartdigimktSDK.xcframework`的Embed修改为Embed&Sign
- v6.5.40~v6.5.59 Debug UI 请使用1.0.7版本，`pod 'AnyThinkDebugUISDK','1.0.7'`
