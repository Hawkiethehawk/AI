---
title: "插屏广告"
source: "https://help.toponad.net/cn/docs/cha-ping-guang-gao-3SBX"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Cocos Creator接入指南", "广告样式", "插屏广告"]
content_sha256: "d058c3bb3272ca95444e7bc3be7f6cf98502fd67b2401d44dd7950768ecb3410"
knowledge_role: "reference_only"
has_article_body: true
---

# 插屏广告

## **1**. 加载广告

复制代码

```
import {ATInterstitialSDK} from "db://assets/script/AnyThinkAds/ATInterstitial";

ATInterstitialSDK.loadAd("your placement id");
```

## **2**. 设置监听

复制代码

```
private InterstitialListener = {
    onInterstitialAdLoaded: (placementId: any) => {
        console.log("onInterstitialAdLoaded", placementId);
    },
    onInterstitialAdLoadFail: (placementId: any, errorInfo: any) => {
        console.log("onInterstitialAdLoadFail", placementId, errorInfo);
    },
    onInterstitialAdShow: (placementId: any, callbackInfo: any) => {
        console.log("onInterstitialAdShow", placementId, callbackInfo);
    },
    onInterstitialAdStartPlayingVideo: (placementId: any, callbackInfo: any) => {
        console.log("onInterstitialAdStartPlayingVideo", placementId, callbackInfo);
    },
    onInterstitialAdEndPlayingVideo: (placementId: any, callbackInfo: any) => {
        console.log("onInterstitialAdEndPlayingVideo", placementId, callbackInfo);
    },
    onInterstitialAdFailedToPlayVideo: (placementId: any, errorInfo: any) => {
        console.log("onInterstitialAdFailedToPlayVideo", placementId, errorInfo);
    },
    onInterstitialAdFailedToShow: (placementId: any, errorInfo: any, callbackInfo: any) => {
        console.log("onInterstitialAdFailedToShow", placementId, callbackInfo, errorInfo);
    },
    onInterstitialAdClose: (placementId: any, callbackInfo: any) => {
        console.log("onInterstitialAdClose", placementId, callbackInfo);
    },
    onInterstitialAdClick: (placementId: any, callbackInfo: any) => {
        console.log("onInterstitialAdClick", placementId, callbackInfo);
    }
};

ATInterstitialSDK.setAdListener(this.InterstitialListener);
```

## **3**. 展示广告

复制代码

```
ATInterstitialSDK.entryAdScenario("your placement id", "your scenario id");
if (ATInterstitialSDK.hasAdReady("your placement id")) {
    ATInterstitialSDK.showAdInScenario("your placement id", "your scenario id");
} else {
    ATInterstitialSDK.loadAd("your placement id");
}
```
