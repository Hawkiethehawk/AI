---
title: "横幅广告"
source: "https://help.toponad.net/cn/docs/heng-fu-guang-gao-IPHE"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Cocos Creator接入指南", "广告样式", "横幅广告"]
content_sha256: "ce1abc602192f1bce74e8f5f7beb181e79a5161f6df838f8600491b7a68d932a"
knowledge_role: "reference_only"
has_article_body: true
---

# 横幅广告

## **1**. 加载广告

> 请留意iOS和安卓平台传入的尺寸单位或不同，可能需要进行转换。

复制代码

```
import {ATBannerSDK} from "db://assets/script/AnyThinkAds/ATBanner";

const setting = {};
setting[ATBannerSDK.kATBannerAdLoadingExtraBannerAdSizeStruct] = ATBannerSDK.createLoadAdSize(cc.screen.windowSize.width, 300);
ATBannerSDK.loadAd("your placement id", setting);
```

> 请注意，在iOS平台中，若需要使用Admob自适应横幅设置，则需要额外在setting中添加以下代码，并且解除OC代码中的注释，如下图：
>
> `setting[ATBannerSDK.kATBannerAdAdaptiveWidth] = cc.screen.windowSize.width;`
> `setting[ATBannerSDK.kATBannerAdAdaptiveOrientation] = ATBannerSDK.kATBannerAdAdaptiveOrientationPortrait;`
>
> iOS 平台 Admob 自适应尺寸相关代码：
>
> 

## **2**. 设置监听

复制代码

```
private BannerAdListener = {
    onBannerAdLoaded: (placementId: any) => {
        console.log("onBannerAdLoaded", placementId)
    },
    onBannerAdLoadFail: (placementId: any, errorInfo: any) => {
        console.log("onBannerAdLoadFail", placementId, errorInfo)
    },
    onBannerAdShow: (placementId: any, callbackInfo: any) => {
        console.log("onBannerAdShow", placementId, callbackInfo)
    },
    onBannerAdClick: (placementId: any, callbackInfo: any) => {
        console.log("onBannerAdClick", placementId, callbackInfo)
    },
    onBannerAdAutoRefresh: (placementId: any, callbackInfo: any) => {
        console.log("onBannerAdAutoRefresh", placementId, callbackInfo)
    },
    onBannerAdAutoRefreshFail: (placementId: any, errorInfo: any) => {
        console.log("onBannerAdAutoRefreshFail", placementId, errorInfo)
    },
    onBannerAdCloseButtonTapped: (placementId: any, callbackInfo: any) => {
        console.log("onBannerAdCloseButtonTapped", placementId, callbackInfo)
    }
};

ATBannerSDK.setAdListener(this.BannerAdListener);
```

## **3**. 展示广告

复制代码

```
ATBannerSDK.entryAdScenario("your placement id", "your scenario id");
if (ATBannerSDK.hasAdReady("your placement id")) {
    ATBannerSDK.showAdInPositionAndScenario("your placement id", ATBannerSDK.kATBannerAdShowingPositionBottom, "your scenario id");
} else {
    ATBannerSDK.loadAd("your placement id");
}
```
