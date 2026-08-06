---
title: "共享广告位参数设置"
source: "https://help.toponad.net/cn/docs/gong-xiang-guang-gao-wei-can-shu-she-zhi"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-04-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "共享广告位参数设置"]
content_sha256: "312efc209ed93a08b6627692190402898500467d2f73aaad24ff9544f9edc076"
knowledge_role: "reference_only"
has_article_body: true
---

# 共享广告位参数设置

## 激励视频 —— 服务端激励

如果您的激励广告位配置了共享广告位，加载时可参考以下代码进行设置服务端激励参数。

objc
复制代码

```
NSMutableDictionary * loadConfigDict = [NSMutableDictionary dictionary];
// kATAdLoadingExtraMediaExtraKey对于共享广告位和普通广告位都有效，只使用这一个key传您所需要的全部参数
[loadConfigDict setValue:@"{\"userID\":\"xxx\"}"
// 发起广告加载
[[ATAdManager sharedManager] loadADWithPlacementID:RewardedPlacementID extra:loadConfigDict delegate:self];
```

如果您需要单独给共享广告位设置，请参考：

objc
复制代码

```
NSMutableDictionary * loadConfigDict = [NSMutableDictionary dictionary];
// 可选接入，以下几个key参数适用于广告平台的服务端激励验证，将被透传给第三方广告平台 SDK
[loadConfigDict setValue:@"media_val_RewardedVC" forKey:kATAdLoadingExtraMediaExtraKey];
[loadConfigDict setValue:@"rv_test_user_id" forKey:kATAdLoadingExtraUserIDKey];
[loadConfigDict setValue:@"reward_Name" forKey:kATAdLoadingExtraRewardNameKey];
[loadConfigDict setValue:@3 forKey:kATAdLoadingExtraRewardAmountKey];

//根据您的实际需求，看是否每次都创建新的ATSharePlacementConfig对象。
if (![ATSDKGlobalSetting sharedManager].sharePlacementConfig) {
    [ATSDKGlobalSetting sharedManager].sharePlacementConfig = [[ATSharePlacementConfig alloc] init];
}
// 设置给共享广告位
[ATSDKGlobalSetting sharedManager].sharePlacementConfig.rewardedVideoLoadExtra = loadConfigDict;

// 发起广告加载
[[ATAdManager sharedManager] loadADWithPlacementID:RewardedPlacementID extra:loadConfigDict delegate:self];
```

## 其他场景

> 设置共享广告位参数，一般是在广告位load之前设置

objc
复制代码

```
#pragma mark - 共享广告位
/// 设置共享广告位额外参数 - 开屏广告
/// - Parameter extraDict: 额外参数字典
+ (void)setSplashSharePlacementConfig:(NSMutableDictionary *)extraDict {

    if (![ATSDKGlobalSetting sharedManager].sharePlacementConfig) {
        [ATSDKGlobalSetting sharedManager].sharePlacementConfig = [[ATSharePlacementConfig alloc] init];
    }
    [ATSDKGlobalSetting sharedManager].sharePlacementConfig.splashLoadExtra = extraDict;
}

/// 设置共享广告位额外参数 - 插屏广告
/// - Parameter extraDict: 额外参数字典
+ (void)setInterstitialSharePlacementConfig:(NSMutableDictionary *)extraDict {

    if (![ATSDKGlobalSetting sharedManager].sharePlacementConfig) {
        [ATSDKGlobalSetting sharedManager].sharePlacementConfig = [[ATSharePlacementConfig alloc] init];
    }
    [ATSDKGlobalSetting sharedManager].sharePlacementConfig.interstitialLoadExtra = extraDict;
}

/// 设置共享广告位额外参数 - 激励视频广告
/// - Parameter extraDict: 额外参数字典
+ (void)setRewardedVideoSharePlacementConfig:(NSMutableDictionary *)extraDict {

    if (![ATSDKGlobalSetting sharedManager].sharePlacementConfig) {
        [ATSDKGlobalSetting sharedManager].sharePlacementConfig = [[ATSharePlacementConfig alloc] init];
    }
    [ATSDKGlobalSetting sharedManager].sharePlacementConfig.rewardedVideoLoadExtra = extraDict;
}

/// 设置共享广告位额外参数 - 横幅广告
/// - Parameter extraDict: 额外参数字典
+ (void)setBannerSharePlacementConfig:(NSMutableDictionary *)extraDict {

    if (![ATSDKGlobalSetting sharedManager].sharePlacementConfig) {
        [ATSDKGlobalSetting sharedManager].sharePlacementConfig = [[ATSharePlacementConfig alloc] init];
    }
    [ATSDKGlobalSetting sharedManager].sharePlacementConfig.bannerLoadExtra = extraDict;
}

/// 设置共享广告位额外参数 - 原生广告
/// - Parameter extraDict: 额外参数字典
+ (void)setNativeSharePlacementConfig:(NSMutableDictionary *)extraDict {

    if (![ATSDKGlobalSetting sharedManager].sharePlacementConfig) {
        [ATSDKGlobalSetting sharedManager].sharePlacementConfig = [[ATSharePlacementConfig alloc] init];
    }
    [ATSDKGlobalSetting sharedManager].sharePlacementConfig.nativeLoadExtra = extraDict;
}
```
