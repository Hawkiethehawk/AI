---
title: "TopOn Adx 客户端出价集成"
source: "https://help.toponad.net/cn/docs/TopOn-Adx-ke-hu-duan-chu-jia-ji-cheng"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-05-30"
category_path: ["三方广告平台配置指南", "TopOn ADX", "TopOn Adx 客户端出价集成"]
content_sha256: "c29946036f917489a4adabb70c24a13633e4e6967326d70370409ffe6e55e20e"
knowledge_role: "reference_only"
has_article_body: true
---

# TopOn Adx 客户端出价集成

**客户端出价集成方式**支持在广告填充时返回特定价格。开发者可以使用此功能在客户端与其他广告网络竞争，以确定最高价格的广告，从而最大化总收入。

客户端竞价的工作流程如下：



Step1、同时向TopOn SDK和其他广告源SDK发送广告请求；

Step2、广告双方异步填充，广告填充后TopOn会返回具体价格；

Step3、 当广告机会发生时，开发者应验证每个广告的状态，如果广告过期，则删除广告，否则广告已准备好相互竞价；

Step4、比较广告价格，确定哪个广告可以赢得这次展示；

Step5、 如果没有广告获胜，或者广告展示完毕后，重复步骤1

*\* 本文档仅适用于in-house聚合单接TopOn ADX的集成模式。若除了TopOn ADX 之外还需要启用 TopOn 聚合功能，请联系我们的客户经理以获得集成帮助。*

# 安卓指南

## 一、前提条件

1. Android TopOn SDK 版本 >= 6.2.79

## 二、集成指南

### 1. 创建TopOn AppId & Placement Id

创建详情：[TopOn应用管理](/cn/docs/pzi00q)。

### 2. 集成TopOn SDK

**步骤1：**

您可以通过此文档集成TopOn SDK：[Android SDK 集成指南](/cn/docs/Android)。

**步骤2：**

在初始化TopOn SDK之前，调用此代码将广告位设置为单接Adx模式。“TopOnPlacementId”需要替换为相应的TopOn展示位置ID。

```
ATAdxSetting.getInstance().openAdxNetworkMode(TopOnPlacementId);
```

**步骤3：**

您可以开始使用 TopOn SDK 来处理广告请求和展示：[Android SDK 初始化](/cn/docs/ji-cheng-rnnt#3._初始化SDK)

### 3. 获取价格

请遵循集成每种广告类型的说明。然后您可以按照以下方法获取广告填充时的价格：

广告加载成功后，您可以在回调接口中获取“ **ATAdInfo** ”，然后通过ATAdInfo的“ **getEcpm()** ”获取该广告的Ecpm 。

“ **getEcpm()** ”返回货币单位与后台账号下的货币单位一致，通常为元（CNY）或美元（USD），具体可以通过adInfo.getCurrency();判断。

示例代码如下：

```
        // Native Ad
        ATNative atNative = new ATNative(context, "Your Placement Id", new ATNativeNetworkListener() {
            @Override
            public void onNativeAdLoaded() {
                ATAdStatusInfo adStatusInfo = atNative.checkAdStatus();
                ATAdInfo adInfo = adStatusInfo.getATTopAdInfo();
                String currency = adInfo.getCurrency();
                double ecpm = adInfo.getEcpm();
            }
        });

        // Rewarded Video
        ATRewardVideoAd rewardVideoAd = new ATRewardVideoAd(context, "Your Placement Id");
        rewardVideoAd.setAdListener(new ATRewardVideoListener() {
            @Override
            public void onRewardedVideoAdLoaded() {
                ATAdStatusInfo adStatusInfo = rewardVideoAd.checkAdStatus();
                ATAdInfo adInfo = adStatusInfo.getATTopAdInfo();
                String currency = adInfo.getCurrency();
                double ecpm = adInfo.getEcpm();

            }

        });

        // Interstitial
        ATInterstitial interstitial = new ATInterstitial(context, "Your Placement Id");
        interstitial.setAdListener(new ATInterstitialListener() {
            @Override
            public void onInterstitialAdLoaded() {
                ATAdStatusInfo adStatusInfo = interstitial.checkAdStatus();
                ATAdInfo adInfo = adStatusInfo.getATTopAdInfo();
                String currency = adInfo.getCurrency();
                double ecpm = adInfo.getEcpm();

            }

        });

        // App Open Ad
        ATSplashAd splashAd = new ATSplashAd(context, "Your Placement Id", new ATSplashAdListener() {
            @Override
            public void onAdLoaded(boolean isTimeout) {
                ATAdStatusInfo adStatusInfo = interstitial.checkAdStatus();
                ATAdInfo adInfo = adStatusInfo.getATTopAdInfo();
                String currency = adInfo.getCurrency();
                double ecpm = adInfo.getEcpm();

            }

        });

        // Banner Ad
        ATBannerView bannerView = new ATBannerView(context);
        bannerView.setPlacementId("Your Placement Id");
        bannerView.setBannerAdListener(new ATBannerListener() {
            @Override
            public void onBannerLoaded() {
                ATAdStatusInfo adStatusInfo = bannerView.checkAdStatus();
                ATAdInfo adInfo = adStatusInfo.getATTopAdInfo();
                String currency = adInfo.getCurrency();
                double ecpm = adInfo.getEcpm();

            }

        });
```

### 4.客户端竞价

#### 4.1 TopOn Adx 竞胜

如果 TopOn 比价胜出，您应该在展示广告之前将第二个出价者的最高价格传递给 TopOn。这一步将帮助我们优化收益。

注意：SECOND\_PRICE传入的价格货币单位必须为**美元**

```
ATAdStatusInfo adStatusInfo = rewardVideoAd.checkAdStatus();
ATAdInfo adInfo = adStatusInfo.getATTopAdInfo();
IATAdxHandler adxHandler = adInfo.getAdxHandler();
if(adxHandler != null) {
     Map<String, Object> winExtraMap = new HashMap<>();
     winExtraMap.put(IATAdxHandler.SECOND_PRICE, <Loss ecpm>);//<Loss ecpm>: double,Currency required USD
      //Loss Network Name
     winExtraMap.put(IATAdxHandler.BIDDER_NAME, <Loss Network Name>);//<Loss Network Name>: String
     adxHandler.notifyWin(winExtraMap);
}
```

#### 4.1 TopOn Adx 竞败

如果 TopOn 竞价失败，您应该在展示广告之前将最高价出价者的价格传递给 TopOn。这一步将帮助我们优化收益。

注意：winEcpm传入的价格货币单位必须为**美元**

```
ATAdStatusInfo adStatusInfo = rewardVideoAd.checkAdStatus();
ATAdInfo adInfo = adStatusInfo.getATTopAdInfo();
IATAdxHandler adxHandler = adInfo.getAdxHandler();
if(adxHandler != null) {
     Map<String, Object> lossExtraMap = new HashMap<>();
      //Win Network Name
     winExtraMap.put(IATAdxHandler.BIDDER_NAME, <Loss Network Name>);//<Loss Network Name>: String
     /**
        * @param lossReason // loss reason
        * @param winEcpm // win price,Currency required USD
        * @param lossExtraMap // loss extra info
      */
     adxHandler.notifyLose(lossReason, winEcpm, lossExtraMap);
}
```

**竞败原因：**

|  |  |
| --- | --- |
| 代码 | 描述 |
| IATAdxHandler.LOSS\_REASON.LOSS\_TO\_HIGHER\_BID | Topon adx 出价低于价格较高的竞价广告源 |
| IATAdxHandler.LOSS\_REASON.LOSS\_TO\_NORMAL | adx 的价格低于价格较高的固定价格广告源（非竞价广告） |

### 5.展示广告

如果TopOn获胜，请参考 [Android SDK集成](/cn/docs/Android) 并展示TopOn广告

# iOS指南

## 一、前提条件

1. iOS Taku SDK 版本 >= 6.2.76

## 二、集成指南

### 1. 创建Taku AppId & Placement Id

创建详情：[Taku应用管理](/docs/pzi00q)。

### 2. 集成Taku SDK

**步骤1：**

您可以通过此文档集成Taku SDK：[iOS SDK 集成指南](https://help.takuad.com/docs/iOS)。

**步骤2：**

在初始化Taku SDK之前，调用此代码将广告位设置为单接Adx模式。该模式开启后在本次app启动周期一直生效并且不能重置。“TakuPlacementId”需要替换为相应的Taku展示位置ID。

```
[[ATADXSettings shareInstance] setAdxNetworkModeWithPlacementId:@"TakuPlacementId"];
```

**步骤3：**

您可以开始使用 Taku SDK 来处理广告请求和展示：[iOS SDK 初始化](https://help.takuad.com/docs/zODjLF)

### 3. 获取价格

请遵循集成每种广告类型的说明。然后您可以按照以下方法获取广告填充时的价格：

广告加载成功后，您可以在加载成功回调接口中调用对应广告样式获取有效缓存列表的api接口拿到**validAds** 数组，然后通过**validAds**数组获取到排序第一的缓存信息"**adOfferInfo**"，通过”**adOfferInfo**“字典信息key取“ **adsource\_price** ”的值，就能获取该广告的Ecpm 。

“ **adsource\_price** ”返回货币单位与后台账号下的货币单位一致，通常为元（CNY）或美元（USD），具体可以通过adOfferInfo[@"**currency**"]判断。更多key值具体可以参考官网文档：[回调信息说明](https://help.takuad.com/docs/pGEB4p)

示例代码如下：

```
- (void)didFinishLoadingADWithPlacementID:(NSString *)placementID {
    // RewardedVideo
    NSArray *validAds = [[ATAdManager sharedManager] getRewardedVideoValidAdsForPlacementID:@"Your Placement Id"];
    NSDictionary *adOfferInfo = validAds.firstObject;
    NSString *ecpm = adOfferInfo[@"adsource_price"];
    NSString *currency = adOfferInfo[@"currency"];

    // InterstitialLoad
    NSArray *validAds = [[ATAdManager sharedManager] getInterstitialValidAdsForPlacementID:@"Your Placement Id"];
    NSDictionary *adOfferInfo = validAds.firstObject;
    NSString *ecpm = adOfferInfo[@"adsource_price"];
    NSString *currency = adOfferInfo[@"currency"];

    // Native
    NSArray *validAds = [[ATAdManager sharedManager] getNativeValidAdsForPlacementID:@"Your Placement Id"];
    NSDictionary *adOfferInfo = validAds.firstObject;
    NSString *ecpm = adOfferInfo[@"adsource_price"];
    NSString *currency = adOfferInfo[@"currency"];

    // Banner
    NSArray *validAds = [[ATAdManager sharedManager] getBannerValidAdsForPlacementID:@"Your Placement Id"];
    NSDictionary *adOfferInfo = validAds.firstObject;
    NSString *ecpm = adOfferInfo[@"adsource_price"];
    NSString *currency = adOfferInfo[@"currency"];

    // Splash
    NSArray *validAds = [[ATAdManager sharedManager] getSplashValidAdsForPlacementID:@"Your Placement Id"];
    NSDictionary *adOfferInfo = validAds.firstObject;
    NSString *ecpm = adOfferInfo[@"adsource_price"];
    NSString *currency = adOfferInfo[@"currency"];
}
```

### 4.客户端竞价

#### 请参考上述第三点的获取方式，根据不一样的广告类型获取到的数组后调用以下方法，从而获取**adxObject**，该对象可以进行后续的Adx 竞胜和竞败操作，以激励视频广告为例：

```
// RewardedVideo
NSArray *validAds = [[ATAdManager sharedManager] getRewardedVideoValidAdsForPlacementID:@"Your Placement Id"];
NSDictionary *adOfferInfo = validAds.firstObject;
ATADXObject *adxObject = adOfferInfo[@"adx_object"];
```

####

#### 4.1 Taku Adx 竞胜

如果 Taku 比价胜出，您应该在展示广告之前将第二个出价者的最高价格传递给 Taku。这一步将帮助我们优化收益。

注意：**kATADXObjectSecondLossPrice**传入的价格货币单位必须为**美元**

```
- (void)sendWinNotification {
    // RewardedVideo
    NSArray *validAds = [[ATAdManager sharedManager] getRewardedVideoValidAdsForPlacementID:@"Your Placement Id"];
    NSDictionary *adOfferInfo = validAds.firstObject;
    ATADXObject *adxObject = adOfferInfo[@"adx_object"];

    // 发送win
    [adxObject sendWinNotificationWithInfo:@{
        kATADXObjectNetwokName: @"二价广告源名字",
        kATADXObjectSecondLossPrice: @"二价价格，货币种类为美元"
    }];
}
```

#### 4.2 Taku Adx 竞败

如果 Taku 竞价失败，您应该在展示广告之前将最高价出价者的价格传递给 Taku。这一步将帮助我们优化收益。

注意：**kATADXObjectWinPrice**传入的价格货币单位必须为**美元**

```
- (void)sendLossNotification {
    // RewardedVideo
    NSArray *validAds = [[ATAdManager sharedManager] getRewardedVideoValidAdsForPlacementID:@"Your Placement Id"];
    NSDictionary *adOfferInfo = validAds.firstObject;
    ATADXObject *adxObject = adOfferInfo[@"adx_object"];

    // 发送loss
    [adxObject sendLossNotificationWithInfo:@{
        kATADXObjectNetwokName: @"竞胜广告源名字",
        kATADXObjectWinPrice: @"竞胜价格，货币种类为美元",
        kATADXObjectLossReason: kATADXObjectLossReasonBidLowPrice,//假如是价格低于其他竞价广告源
    }];
}
```

**竞败原因：**

|  |  |
| --- | --- |
| 代码 | 描述 |
| kATADXObjectLossReasonBidLowPrice | Topon adx 出价低于价格较高的竞价广告源 |
| kATADXObjectLossReasonLowPrice | adx 的价格低于价格较高的固定价格广告源（非竞价广告） |

### 5.展示广告

如果Taku获胜，请参考 [iOS SDK集成](https://help.takuad.com/docs/iOS) 并展示Taku广告

### 6.隐私信息配置

可以参考此文档 [设置隐私信息控制开关](https://help.takuad.com/docs/Z3iFdy) 限制隐私数据收集

建议：尽量不要限制设备id（IDFA、IDFV等）相关的设备信息上报，避免影响Adx填充
