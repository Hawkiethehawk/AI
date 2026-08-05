---
title: "插屏广告全自动加载"
source: "https://help.toponad.net/cn/docs/cha-ping-guang-gao-quan-zi-dong-jia-zai-lcQF"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Cocos Creator接入指南", "全自动加载", "插屏广告全自动加载"]
content_sha256: "96eb9d031364f785eb126ac7566e01a2545351d70cb91c973bfd2174e85cca9f"
knowledge_role: "reference_only"
has_article_body: true
---

# 插屏广告全自动加载

## **1**. 加载广告

复制代码

```
import {ATInterstitialAutoAdSDK} from "db://assets/script/AnyThinkAds/ATInterstitialAuto";

let InterstitialIds: string[] = ["your placement id1"， "your placement id2"];
ATInterstitialAutoAdSDK.addPlacementIds(InterstitialIds);
```

## **2**. 设置监听

复制代码

```
private AutoInterstitialListener = {
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

ATInterstitialAutoAdSDK.setAdListener(this.AutoInterstitialListener);
```

## **3**. 展示广告

复制代码

```
ATInterstitialAutoAdSDK.entryAdScenario("your placement id", "your scenario id");
if (ATInterstitialAutoAdSDK.hasAdReady("your placement id")) {
    ATInterstitialAutoAdSDK.showAdInScenario("your placement id", "your scenario id");
}
```
