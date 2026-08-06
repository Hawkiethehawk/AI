---
title: "激励视频广告全自动加载"
source: "https://help.toponad.net/cn/docs/ji-li-shi-pin-guang-gao-quan-zi-dong-jia-zai-C7mS"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Cocos Creator接入指南", "全自动加载", "激励视频广告全自动加载"]
content_sha256: "ed006a5ec0b5903298375f7d71bb03141006a004992518cf03aa1a045c098c8d"
knowledge_role: "reference_only"
has_article_body: true
---

# 激励视频广告全自动加载

## **1**. 加载广告

复制代码

```
import {ATRewardedVideoAutoAdSDK} from "db://assets/script/AnyThinkAds/ATRewardedAutoVideo";

let rewardedIds: string[] = ["your placement id1", "your placement id2"];
ATRewardedVideoAutoAdSDK.addPlacementIds(rewardedIds);
```

## **2**. 设置监听

复制代码

```
private AutoRewardedVideoListener = {
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
        console.log("onRewardedVideoAdPlayEnd", placementId, callbackInfo)
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

ATRewardedVideoAutoAdSDK.setAdListener(this.AutoRewardedVideoListener);
```

## **3**. 展示广告

复制代码

```
ATRewardedVideoAutoAdSDK.entryAdScenario("your placement id", "your scenario id")
if (ATRewardedVideoAutoAdSDK.hasAdReady("your placement id")) {
    ATRewardedVideoAutoAdSDK.showAdInScenario("your placement id", "your scenario id");
}
```
