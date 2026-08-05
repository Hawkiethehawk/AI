---
title: "三方收益回传 SDK v6.4.12以下"
source: "https://help.toponad.net/cn/docs/ROI-fen-xi"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "三方收益回传 SDK v6.4.12以上", "三方收益回传 SDK v6.4.12以下"]
content_sha256: "f20cb71f88c86470260a852817a5f96ab70b270164edc227bffb7fd705f90908"
knowledge_role: "reference_only"
has_article_body: true
---

# 三方收益回传 SDK v6.4.12以下

## **1**. 简介

您可通过TopOn SDK的代理回调获取广告相关数据，并上报给三方数据平台。

通过各广告类型的代理回调extra获取相应的值，详细可查看 [回调信息说明](/cn/docs/guang-gao-wei-hui-diao-xin-xi)。

| 属性 | 说明 |
| --- | --- |
| extra@"network\\_firm\\_id" | 三方广告平台对应id，参考 [Network Firm ID 表](/cn/docs/2KR6QU#TopOn_%E6%94%AF%E6%8C%81%E8%81%9A%E5%90%88%E4%BB%A5%E4%B8%8B%E5%B9%BF%E5%91%8A%E5%B9%B3%E5%8F%B0) |
| extra@"publisher\\_revenue" | 获取本次展示带来的收益，单位可通过currency获取， 精度可通过 precision 获取 |
| extra@"country" | 获取 国家代码，例如：”CN" |
| extra@"currency" | 获取 货币单位，例如："USD" |
| extra@"network\\_placement\\_id" | 三方广告平台的广告id |
| extra@"adunit\\_id" | 获取 TopOn广告位ID |

## **2**. 上报时机

如果您已经在上报后台授权过其他广告平台的变现收入数据，并且现在上报的数据又包括该广告平台，请务必先关停这些平台在上报后台授权，然后使用上报收入数据对接，否则会产生重复数据。

我们推荐在**广告展示回调**的代理中上报收入数据：

| 广告类型 | API | 说明 |
| --- | --- | --- |
| 开屏广告 | splashDidShowForPlacementID: extra: | Splash广告展示成功 |
| 激励视频 | rewardedVideoDidStartPlayingForPlacementID: extra: | 激励视频广告播放开始，即激励视频展示回调 |
| 插屏广告 | interstitialDidShowForPlacementID: extra: | 插屏广告展示成功 |
| 横幅广告 | bannerView: didShowAdWithPlacementID: extra: | bannerView展示成果 |
| 横幅广告 | bannerView: didAutoRefreshWithPlacement: extra: | bannerView自动刷新 |
| 原生广告 | didShowNativeAdInAdView: placementID: extra: | Native广告展示成功 |

说明：横幅广告有手动刷新(开发者自行实现)和自动刷新(TopOn后台默认开启)的方式，所以上报收入数据需要进行区分：

◦手动刷新：只需要在 **展示成功** 的代理上报即可

◦自动刷新：除了在 **展示成功** 的代理商上报，还需要在横幅 **自动刷新** 的代理中进行上报，也就是两个代理都要上报

## **3**. 平台对接

### 3.1 Appsflyer

建议使用一个工具类将 [Appsflyer](https://dev.appsflyer.com/hc/docs/integrate-ios-sdk#log-sessions) 相关的代码进行编写，然后在需要上报的地方调用。

复制代码

```
- (void)handleAppsFlyerRevenueReport:(NSDictionary *)extra {

    NSString *unitId = extra[@"network_placement_id"];
    // 对精度要求较高的开发者需自行进行转换
    double price = [extra[@"publisher_revenue"] doubleValue];
    NSString *currency = extra[@"currency"];
    NSString *country = extra[@"country"];

    // Appsflyer提供多个key给开发者选用，开发者按自己需求使用，这里作为一个例子。
    [[AppsFlyerLib shared] logEvent: AFEventPurchase
    withValues:@{
        AFEventParamContentId:unitId,
        AFEventParamRevenue: @(price),
        AFEventParamCurrency:currency,
        AFEventParamCountry:country
    }];
}
```

#### 3.1.1 开屏广告

我们在开屏广告展示代理回调中使用Appsflyer上报收入数据：

复制代码

```
- (void)splashDidShowForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATSplashViewController::splashDidShowForPlacementID:%@", extra);

    [self handleAppsFlyerRevenueReport:extra];
}
```

#### 3.1.2 激励视频

复制代码

```
-(void) rewardedVideoDidStartPlayingForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATRewardedVideoViewController::rewardedVideoDidStartPlayingForPlacementID:%@ extra:%@", placementID, extra);

    [self handleAppsFlyerRevenueReport:extra];
}
```

#### 3.1.3 插屏广告

复制代码

```
-(void) interstitialDidShowForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
     NSLog(@"ATInterstitialViewController::interstitialDidShowForPlacementID:%@ extra:%@", placementID, extra);

     [self handleAppsFlyerRevenueReport:extra];
}
```

#### 3.1.4 横幅广告

复制代码

```
- (void)bannerView:(ATBannerView*)bannerView didShowAdWithPlacementID:(NSString*)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATBannerViewController::bannerView:didShowAdWithPlacementID:%@ with extra: %@", placementID,extra);

    [self handleAppsFlyerRevenueReport:extra];
}
```

复制代码

如果是开启了自动刷新功能，还需要在自动刷新回调中进行上报

复制代码

```
- (void)bannerView:(ATBannerView*)bannerView didAutoRefreshWithPlacement:(NSString*)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATBannerViewController::bannerView:didAutoRefreshWithPlacement:%@ with extra: %@", placementID,extra);

    [self handleAppsFlyerRevenueReport:extra];
}
```

复制代码

#### 3.1.5 原生广告

复制代码

```
-(void) didShowNativeAdInAdView:(ATNativeADView*)adView placementID:(NSString*)placementID extra:(NSDictionary *)extra{
    NSLog(@"ATNativeViewController:: didShowNativeAdInAdView:placementID:%@ with extra: %@", placementID,extra);

    [self handleAppsFlyerRevenueReport:extra];
}
```

### 3.2 Adjust

建议使用一个工具类将 [Adjust](https://help.adjust.com/zh/article/track-ad-revenue-ios-sdk) 相关的代码进行编写，然后在需要上报的地方调用。

复制代码

```
- (void)handleAdjustRevenueReport:(NSDictionary *)extra {

    // 对精度要求较高的开发者需自行进行转换
    double price = [extra[@"publisher_revenue"] doubleValue];
    NSString *currency = extra[@"currency"];

    // Source：收入来源(ADJAdRevenueSourceTaku在Adjust v4.37.1版本以上才有)
    ADJAdRevenue *adRevenue = [[ADJAdRevenue alloc] initWithSource:ADJAdRevenueSourceTaku];
    // pass revenue and currency values
    [adRevenue setRevenue:price currency:currency];

    // track ad revenue
    [Adjust trackAdRevenue:adRevenue];
}
```

#### 3.2.1 开屏广告

复制代码

```
- (void)splashDidShowForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATSplashViewController::splashDidShowForPlacementID:%@", extra);

    [self handleAdjustRevenueReport:extra];
}
```

#### 3.2.2 激励视频

复制代码

```
-(void) rewardedVideoDidStartPlayingForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATRewardedVideoViewController::rewardedVideoDidStartPlayingForPlacementID:%@ extra:%@", placementID, extra);

    [self handleAdjustRevenueReport:extra];
}
```

#### 3.2.3 插屏广告

复制代码

```
-(void) interstitialDidShowForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
     NSLog(@"ATInterstitialViewController::interstitialDidShowForPlacementID:%@ extra:%@", placementID, extra);

     [self handleAdjustRevenueReport:extra];
}
```

#### 3.2.4 横幅广告

复制代码

```
- (void)bannerView:(ATBannerView*)bannerView didShowAdWithPlacementID:(NSString*)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATBannerViewController::bannerView:didShowAdWithPlacementID:%@ with extra: %@", placementID,extra);

    [self handleAdjustRevenueReport:extra];
}
```

如果是开启了自动刷新功能，还需要在自动刷新回调中进行上报

复制代码

```
- (void)bannerView:(ATBannerView*)bannerView didAutoRefreshWithPlacement:(NSString*)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATBannerViewController::bannerView:didAutoRefreshWithPlacement:%@ with extra: %@", placementID,extra);

    [self handleAdjustRevenueReport:extra];
}
```

#### 3.2.5 原生广告

复制代码

```
-(void) didShowNativeAdInAdView:(ATNativeADView*)adView placementID:(NSString*)placementID extra:(NSDictionary *)extra{
    NSLog(@"ATNativeViewController:: didShowNativeAdInAdView:placementID:%@ with extra: %@", placementID,extra);

    [self handleAppsFlyerRevenueReport:extra];
}
```

### 3.3 Firebase

建议使用一个工具类将 [Firebase](https://firebase.google.com/docs/analytics/measure-ad-revenue?hl=zh&authuser=0) 相关的代码进行编写，然后在需要上报的地方调用。

复制代码

```
- (void)handleFirebaseRevenueReport:(NSDictionary *)extra {

    // 广告平台 Id
    NSInteger network_firm_id = [[extra valueForKey:@"network_firm_id"] integerValue];
    // 是否竞价广告源
    BOOL adsource_isheaderbidding = [[extra valueForKey:@"adsource_isheaderbidding"] boolValue];

    // 使用Firebase与AdMob关联集成时，Admob的非竞价源不需要上报
    if (network_firm_id == 2 && adsource_isheaderbidding == 0) return;

    // 对精度要求较高的开发者需自行进行转换
    double price = [extra[@"publisher_revenue"] doubleValue];
    NSString *currency = extra[@"currency"];
    NSString *country = extra[@"country"];

    // 相关事件参数根据需求按平台要求自行添加
    [FIRAnalytics logEventWithName:kFIREventAdImpression
                        parameters: @{
        kFIRParameterCurrency: currency,
        kFIRParameterValue: @(price)
    }];
}
```

#### 3.3.1 开屏广告

复制代码

```
- (void)splashDidShowForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATSplashViewController::splashDidShowForPlacementID:%@", extra);

    [self handleFirebaseRevenueReport:extra];
}
```

#### 3.3.2 激励视频

复制代码

```
-(void) rewardedVideoDidStartPlayingForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATRewardedVideoViewController::rewardedVideoDidStartPlayingForPlacementID:%@ extra:%@", placementID, extra);

    [self handleFirebaseRevenueReport:extra];
}
```

#### 3.3.3 插屏广告

复制代码

```
-(void) interstitialDidShowForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
     NSLog(@"ATInterstitialViewController::interstitialDidShowForPlacementID:%@ extra:%@", placementID, extra);

     [self handleFirebaseRevenueReport:extra];
}
```

#### 3.3.4 横幅广告

我们在横幅广告展示代理回调中使用Firebase上报收入数据：

复制代码

```
- (void)bannerView:(ATBannerView*)bannerView didShowAdWithPlacementID:(NSString*)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATBannerViewController::bannerView:didShowAdWithPlacementID:%@ with extra: %@", placementID,extra);

    [self handleFirebaseRevenueReport:extra];
}
```

如果是开启了自动刷新功能，还需要在自动刷新回调中进行上报

复制代码

```
- (void)bannerView:(ATBannerView*)bannerView didAutoRefreshWithPlacement:(NSString*)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATBannerViewController::bannerView:didAutoRefreshWithPlacement:%@ with extra: %@", placementID,extra);

    [self handleFirebaseRevenueReport:extra];
}
```

#### 3.3.5 原生广告

复制代码

```
-(void) didShowNativeAdInAdView:(ATNativeADView*)adView placementID:(NSString*)placementID extra:(NSDictionary *)extra{
    NSLog(@"ATNativeViewController:: didShowNativeAdInAdView:placementID:%@ with extra: %@", placementID,extra);

    [self handleAppsFlyerRevenueReport:extra];
}
```
