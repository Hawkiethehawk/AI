---
title: "激励视频广告"
source: "https://help.toponad.net/cn/docs/ji-li-shi-pin-guang-gao-8R0q"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Cocos Creator接入指南", "广告样式", "激励视频广告"]
content_sha256: "ca0bd51a11385bd5ccb68deff970c615377534a03966ff8905e5829c52f7cd6e"
knowledge_role: "reference_only"
has_article_body: true
---

# 激励视频广告

## **1**. 加载广告

复制代码

```
import {ATRewardedVideoSDK} from "db://assets/script/AnyThinkAds/ATRewardedVideo";

ATRewardedVideoSDK.loadAd("your placement id");
```

## **2**. 设置监听

复制代码

```
private RewardedVideoListener = {
    onRewardedVideoAdLoaded: (placementId: any) => {
        console.log("onRewardedVideoAdLoaded", placementId)
    },
    onRewardedVideoAdFailed: (placementId: any, errorInfo: any) => {
        console.log("onRewardedVideoAdFailed", placementId, errorInfo)
    },
    onRewardedVideoAdPlayStart: (placementId: any, callbackInfo: any) => {
        console.log("onRewardedVideoAdPlayStart", placementId, callbackInfo)
    },
    onRewardedVideoAdPlayEnd: (placementId: any, callbackInfo: any) => {
        console.log( "onRewardedVideoAdPlayEnd", placementId, callbackInfo)
    },
    onRewardedVideoAdPlayFailed: (placementId: any, errorInfo: any, callbackInfo: any) => {
        console.log("onRewardedVideoAdPlayFailed", placementId, callbackInfo, errorInfo)
    },
    onRewardedVideoAdClosed: (placementId: any, callbackInfo: any) => {
        console.log("onRewardedVideoAdClosed", placementId, callbackInfo)
    },
    onRewardedVideoAdPlayClicked: (placementId: any, callbackInfo: any) => {
        console.log("onRewardedVideoAdPlayClicked", placementId)
    },
    onReward: (placementId: any, callbackInfo: any) => {
        console.log("onReward", placementId, callbackInfo)
    }
};

ATRewardedVideoSDK.setAdListener(this.RewardedVideoListener);
```

## **3**. 展示广告

复制代码

```
ATRewardedVideoSDK.entryAdScenario("your placement id", "your scenario id");
if (ATRewardedVideoSDK.hasAdReady("your placement id")) {
    ATRewardedVideoSDK.showAdInScenario("your placement id", "your scenario id");
} else {
    ATRewardedVideoSDK.loadAd("your placement id");
}
```
