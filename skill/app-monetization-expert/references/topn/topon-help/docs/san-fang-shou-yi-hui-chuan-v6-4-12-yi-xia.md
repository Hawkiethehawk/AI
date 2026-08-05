---
title: "三方收益回传 SDK v6.4.12以上"
source: "https://help.toponad.net/cn/docs/san-fang-shou-yi-hui-chuan-v6-4-12-yi-xia"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "三方收益回传 SDK v6.4.12以上"]
content_sha256: "53319e61be28e5e8a49287b1237ad4137aa873161162a9463f80eca32804f895"
knowledge_role: "reference_only"
has_article_body: true
---

# 三方收益回传 SDK v6.4.12以上

## **1**. 简介

您可通过TopOn SDK的代理回调获取广告相关数据，并上报给三方数据平台。

通过各广告类型的代理回调extra获取相应的值，详细可查看 [回调信息说明](/cn/docs/guang-gao-wei-hui-diao-xin-xi)。

| 属性 | 说明 |
| --- | --- |
| extra[@"network\_firm\_id"] | 三方广告平台对应id，参考 [Network Firm ID 表](/cn/docs/2KR6QU#TopOn_%E6%94%AF%E6%8C%81%E8%81%9A%E5%90%88%E4%BB%A5%E4%B8%8B%E5%B9%BF%E5%91%8A%E5%B9%B3%E5%8F%B0) |
| extra[@"publisher\_revenue"] | 获取本次展示带来的收益，单位可通过currency获取， 精度可通过 precision 获取 |
| extra[@"country"] | 获取 国家代码，例如：”CN" |
| extra[@"currency"] | 获取 货币单位，例如："USD" |
| extra[@"network\_placement\_id"] | 三方广告平台的广告id |
| extra[@"adunit\_id"] | 获取 TopOn广告位ID |

## **2**. 上报时机

如果您已经在上报后台授权过其他广告平台的变现收入数据，并且现在上报的数据又包括该广告平台，请务必先关停这些平台在上报后台授权，然后使用上报收入数据对接，否则会产生重复数据。

我们推荐在**广告展示收益回调**的代理中上报收入数据：

复制代码

```
/// 获得展示收益
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息字典
- (void)didRevenueForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra
```

## **3.** 平台对接

### 3.1 Appsflyer

建议使用一个工具类将 [Appsflyer](https://dev.appsflyer.com/hc/docs/integrate-ios-sdk#log-sessions) 相关的代码进行编写，然后在需要上报的地方调用。

复制代码

```
/// 获得展示收益
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息字典
- (void)didRevenueForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
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

复制代码

复制代码

###

### 3.2 Adjust

建议使用一个工具类将 [Adjust](https://help.adjust.com/zh/article/track-ad-revenue-ios-sdk) 相关的代码进行编写，然后在需要上报的地方调用。

复制代码

```
/// 获得展示收益
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息字典
- (void)didRevenueForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
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

### 3.3 Firebase

建议使用一个工具类将 [Firebase](https://firebase.google.com/docs/analytics/measure-ad-revenue?hl=zh&authuser=0) 相关的代码进行编写，然后在需要上报的地方调用。

复制代码

```
/// 获得展示收益
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息字典
- (void)didRevenueForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
    //#import <FirebaseAnalytics/FirebaseAnalytics.h>
    // 广告平台 Id
    NSInteger network_firm_id = [[extra valueForKey:@"network_firm_id"] integerValue];
    // 是否竞价广告源
    BOOL adsource_isheaderbidding = [[extra valueForKey:@"adsource_isheaderbidding"] boolValue];

    // 使用Firebase与AdMob关联集成时，Admob的非竞价源不需要上报
    if (network_firm_id == 2 && adsource_isheaderbidding == 0) return;

    // 对精度要求较高的开发者需自行进行转换
    double price = [extra[@"publisher_revenue"] doubleValue];
    NSString *currency = extra[@"currency"];

    // 创建参数
    NSDictionary *params = @{
        //可添加其他键值对
        kFIRParameterValue: @(price),
        kFIRParameterCurrency: currency,
        kFIRParameterAdPlatform: @"TopOn",
        kFIRParameterAdFormat: [extra valueForKey:@"adunit_format"],
        kFIRParameterAdUnitName : [extra valueForKey:@"adunit_id"],
        kFIRParameterAdSource : [extra valueForKey:@"network_name"],//自定义 Adapter 不支持
    };
    // 上报收益数据
    [FIRAnalytics logEventWithName:kFIREventAdImpression parameters:params];
}
```
