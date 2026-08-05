---
title: "开屏广告"
source: "https://help.toponad.net/cn/docs/kai-ping-guang-gao-yJrE"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Cocos Creator接入指南", "广告样式", "开屏广告"]
content_sha256: "c605c54a6ec376e097e9ac02d04695abe4cb85da5f3999a4c8706906c64615ca"
knowledge_role: "reference_only"
has_article_body: true
---

# 开屏广告

## **1**. 加载广告

复制代码

```
import {ATSplashSDK} from "db://assets/script/AnyThinkAds/ATSplash";

ATSplashSDK.loadAd("your placement id");
```

## **2**. 设置监听

复制代码

```
private SplashAdListener = {
    onSplashAdLoaded: (placementId: any) => {
        console.log("onSplashAdLoaded", placementId)
    },
    onSplashAdLoadFail: (placementId: any, errorInfo: any) => {
        console.log("onSplashAdLoadFail", placementId, errorInfo)
        this.setAdStatusText(this.btnSplash, "Load failed");
    },
    onSplashAdShow: (placementId: any, callbackInfo: any) => {
        console.log("onSplashAdShow", placementId, callbackInfo)
    },
    onSplashAdClick: (placementId: any, callbackInfo: any) => {
        console.log("onNativeAdClick", placementId, callbackInfo)
    },
    onSplashAdClose: (placementId: any) => {
        console.log("onSplashAdClose", placementId)
    }
};

ATSplashSDK.setAdListener(this.SplashAdListener);
```

## **3**. 展示广告

复制代码

```
ATSplashSDK.entryAdScenario("your placement id", "your scenario id");
if (ATSplashSDK.hasAdReady("your placement id")) {
    ATSplashSDK.showAd("your placement id", "your scenario id");
} else {
    ATSplashSDK.loadAd("your placement id");
}
```
