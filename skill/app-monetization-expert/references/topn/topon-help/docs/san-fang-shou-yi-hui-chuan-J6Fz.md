---
title: "三方收益回传（v6.3.70以上）"
source: "https://help.toponad.net/cn/docs/san-fang-shou-yi-hui-chuan-J6Fz"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-09-25"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "三方收益回传（v6.3.70以上）"]
content_sha256: "b168cab2d6aaac4d185e6134e71b72c579fa82048ddac83d487a7ddcbad70c55"
knowledge_role: "reference_only"
has_article_body: true
---

# 三方收益回传（v6.3.70以上）

## 1. Firebase

> TopOn SDK支持获取实时展示广告的收益，您可通过监听`onAdRevenuePaid()`回调获取当前展示广告的ecpm值来记录 Google Analytics（分析）ad\_impression 事件。

> **‼️注** ： **使用Firebase与AdMob关联集成时，Admob的非竞价源不需要上报**

java
复制代码

```
public void handleFirebase(ATAdInfo adInfo) {
    FirebaseAnalytics mFirebaseAnalytics = FirebaseAnalytics.getInstance(mActivity);
    if (adInfo != null) {
        // 使用Firebase与AdMob关联集成时，Admob的非竞价源不需要上报
        // if (adInfo.getNetworkFirmId() == 2 && adInfo.isHeaderBiddingAdsource() == 0) return;
        FirebaseAnalytics mFirebaseAnalytics = FirebaseAnalytics.getInstance(mActivity);
        Bundle params = new Bundle();
        // 收益参数配置
        params.putString(FirebaseAnalytics.Param.AD_PLATFORM, "TopOn");
        params.putString(FirebaseAnalytics.Param.AD_SOURCE, adInfo.getNetworkName());
        params.putString(FirebaseAnalytics.Param.AD_FORMAT, adInfo.getFormat());
        params.putString(FirebaseAnalytics.Param.AD_UNIT_NAME, adInfo.getNetworkPlacementId());
        params.putDouble(FirebaseAnalytics.Param.VALUE, adInfo.getPublisherRevenue());
        params.putString(FirebaseAnalytics.Param.CURRENCY, adInfo.getCurrency());
        mFirebaseAnalytics.logEvent(FirebaseAnalytics.Event.AD_IMPRESSION, params);
    }
}
```

java
复制代码

```
public void handleFirebase(TUAdInfo adInfo) {
    FirebaseAnalytics mFirebaseAnalytics = FirebaseAnalytics.getInstance(mActivity);
    if (adInfo != null) {
        // 使用Firebase与AdMob关联集成时，Admob的非竞价源不需要上报
        if (adInfo.getNetworkFirmId() == 2 && adInfo.isHeaderBiddingAdsource() == 0) return;
        FirebaseAnalytics mFirebaseAnalytics = FirebaseAnalytics.getInstance(mActivity);
        Bundle params = new Bundle();
        // 收益参数配置
        params.putString(FirebaseAnalytics.Param.AD_PLATFORM, "TopOn");
        params.putString(FirebaseAnalytics.Param.AD_SOURCE, adInfo.getNetworkName());
        params.putString(FirebaseAnalytics.Param.AD_FORMAT, adInfo.getFormat());
        params.putString(FirebaseAnalytics.Param.AD_UNIT_NAME, adInfo.getNetworkPlacementId());
        params.putDouble(FirebaseAnalytics.Param.VALUE, adInfo.getPublisherRevenue());
        params.putString(FirebaseAnalytics.Param.CURRENCY, adInfo.getCurrency());
        mFirebaseAnalytics.logEvent(FirebaseAnalytics.Event.AD_IMPRESSION, params);
    }
}
```

在以下广告类型的`onAdRevenuePaid(ATAdInfo adInfo)`中调用`handleFirebase()`方法：

### ● 横幅广告

在`ATBannerView#setAdRevenueListener()`的`onAdRevenuePaid(ATAdInfo adInfo)`回调方法回传收益，代码示例如下：

java
复制代码

```
mBannerView.setAdRevenueListener(new ATAdRevenueListener() {
    @Override
    public void onAdRevenuePaid(ATAdInfo adInfo) {
        handleFirebase(adInfo);
    }
});
```

在`TUBannerView#setAdRevenueListener()`的`onAdRevenuePaid(TUAdInfo adInfo)`回调方法回传收益，代码示例如下：

java
复制代码

```
mBannerView.setAdRevenueListener(new TUAdRevenueListener() {
    @Override
    public void onAdRevenuePaid(TUAdInfo adInfo) {
        handleFirebase(adInfo);
    }
});
```

### ● 原生广告

在`NativeAd#setAdRevenueListener()`的`onAdRevenuePaid(ATAdInfo adInfo)`回调方法回传收益，代码示例如下：

java
复制代码

```
mNativeAd.setAdRevenueListener(new ATAdRevenueListener() {
    @Override
    public void onAdRevenuePaid(ATAdInfo adInfo) {
        handleFirebase(adInfo);
    }
});
```

在`NativeAd#setAdRevenueListener()`的`onAdRevenuePaid(TUAdInfo adInfo)`回调方法回传收益，代码示例如下：

java
复制代码

```
mNativeAd.setAdRevenueListener(new TUAdRevenueListener() {
    @Override
    public void onAdRevenuePaid(TUAdInfo adInfo) {
        handleFirebase(adInfo);
    }
});
```

### ● 激励视频

在`ATRewardVideoAd#setAdRevenueListener()`的`onAdRevenuePaid(ATAdInfo adInfo)`回调方法回传收益，代码示例如下：

java
复制代码

```
mRewardVideoAd.setAdRevenueListener(new ATAdRevenueListener() {
    @Override
    public void onAdRevenuePaid(ATAdInfo adInfo) {
        handleFirebase(adInfo);
    }
});
```

在`TURewardVideoAd#setAdRevenueListener()`的`onAdRevenuePaid(TUAdInfo adInfo)`回调方法回传收益，代码示例如下：

java
复制代码

```
mRewardVideoAd.setAdRevenueListener(new TUAdRevenueListener() {
    @Override
    public void onAdRevenuePaid(TUAdInfo adInfo) {
        handleFirebase(adInfo);
    }
});
```

### ● 插屏广告

在`ATInterstitial#setAdRevenueListener()`的`onAdRevenuePaid(ATAdInfo adInfo)`回调方法回传收益，代码示例如下：

java
复制代码

```
mInterstitialAd.setAdRevenueListener(new ATAdRevenueListener() {
    @Override
    public void onAdRevenuePaid(ATAdInfo adInfo) {
        handleFirebase(adInfo);
    }
});
```

在`TUInterstitial#setAdRevenueListener()`的`onAdRevenuePaid(TUAdInfo adInfo)`回调方法回传收益，代码示例如下：

java
复制代码

```
mInterstitialAd.setAdRevenueListener(new TUAdRevenueListener() {
    @Override
    public void onAdRevenuePaid(TUAdInfo adInfo) {
        handleFirebase(adInfo);
    }
});
```

### ● 开屏广告

在`ATSplashAd#setAdRevenueListener()`的`onAdRevenuePaid(ATAdInfo adInfo)`回调方法回传收益，代码示例如下：

java
复制代码

```
mSplashAd.setAdRevenueListener(new ATAdRevenueListener() {
    @Override
    public void onAdRevenuePaid(ATAdInfo adInfo) {
        handleFirebase(adInfo);
    }
});
```

在`TUSplashAd#setAdRevenueListener()`的`onAdRevenuePaid(TUAdInfo adInfo)`回调方法回传收益，代码示例如下：

java
复制代码

```
mSplashAd.setAdRevenueListener(new TUAdRevenueListener() {
    @Override
    public void onAdRevenuePaid(TUAdInfo adInfo) {
        handleFirebase(adInfo);
    }
});
```

---

## 2. Adjust

参考上述Firebase，在每个广告类型的`onAdRevenuePaid(ATAdInfo adInfo)`中调用以下的`handleAdjustRevenueReport`方法：

java
复制代码

```
public void handleAdjustRevenueReport(ATAdInfo adInfo) {
    //adjust4.38.1及以上支持
    AdjustAdRevenue adjustAdRevenue = new AdjustAdRevenue( "topon_sdk");
    adjustAdRevenue.setRevenue(adInfo.getPublisherRevenue(), adInfo.getCurrency());

    //可选配置
    adjustAdRevenue.setAdRevenueNetwork(String.valueOf(adInfo.getNetworkFirmId()));
    adjustAdRevenue.setAdRevenueUnit(adInfo.getAdsourceId());
    adjustAdRevenue.setAdRevenuePlacement(adInfo.getPlacementId());

    //发送收益数据
    Adjust.trackAdRevenue(adjustAdRevenue);
}
```

参考上述Firebase，在每个广告类型的`onAdRevenuePaid(TUAdInfo adInfo)`中调用以下的`handleAdjustRevenueReport`方法：

java
复制代码

```
public void handleAdjustRevenueReport(TUAdInfo adInfo) {
    //adjust4.38.1及以上支持
    AdjustAdRevenue adjustAdRevenue = new AdjustAdRevenue( AdjustConfig.AD_REVENUE_TOPON);
    adjustAdRevenue.setRevenue(adInfo.getPublisherRevenue(), adInfo.getCurrency());

    //可选配置
    adjustAdRevenue.setAdRevenueNetwork(String.valueOf(adInfo.getNetworkFirmId()));
    adjustAdRevenue.setAdRevenueUnit(adInfo.getAdsourceId());
    adjustAdRevenue.setAdRevenuePlacement(adInfo.getPlacementId());

    //发送收益数据
    Adjust.trackAdRevenue(adjustAdRevenue);
}
```

---

## 3. AppsFlyer

参考上述Firebase，在每个广告类型的`onAdRevenuePaid(ATAdInfo adInfo)`中调用以下的`handleAppsFlyerRevenueReport`方法：

java
复制代码

```
public void handleAppsFlyerRevenueReport(ATAdInfo adInfo) {

    //v6.3.10+
    String monetizationNetwork = adInfo.getNetworkName();
    Currency currency = Currency.getInstance(Locale.US);
    if ("CNY".equalsIgnoreCase(adInfo.getCurrency())) {
        currency = Currency.getInstance(Locale.CHINA);
    }
    Map customParams = new HashMap<>();

    AppsFlyerAdRevenue.logAdRevenue(monetizationNetwork, MediationNetwork.Topon, currency, adInfo.getPublisherRevenue(), customParams);
}
```

参考上述Firebase，在每个广告类型的`onAdRevenuePaid(TUAdInfo adInfo)`中调用以下的`handleAppsFlyerRevenueReport`方法：

java
复制代码

```
public void handleAppsFlyerRevenueReport(TUAdInfo adInfo) {

    //v6.3.10+
    String monetizationNetwork = adInfo.getNetworkName();
    Currency currency = Currency.getInstance(Locale.US);
    if ("CNY".equalsIgnoreCase(adInfo.getCurrency())) {
        currency = Currency.getInstance(Locale.CHINA);
    }
    Map customParams = new HashMap<>();

    AppsFlyerAdRevenue.logAdRevenue(monetizationNetwork, MediationNetwork.Topon, currency, adInfo.getPublisherRevenue(), customParams);
}
```
