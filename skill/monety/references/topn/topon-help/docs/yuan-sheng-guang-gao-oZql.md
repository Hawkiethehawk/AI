---
title: "原生广告"
source: "https://help.toponad.net/cn/docs/yuan-sheng-guang-gao-oZql"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Cocos Creator接入指南", "广告样式", "原生广告"]
content_sha256: "9a813c922032789da39b385e41d5ce413ecbf4eb79c14c7e31c590e772b7ac4f"
knowledge_role: "reference_only"
has_article_body: true
---

# 原生广告

## **1**. 加载广告

复制代码

```
import {ATNativeSDK} from "db://assets/script/AnyThinkAds/ATNative";

// 加载原生广告时需要传入广告展示的宽高
// 特别说明：如果是原生模板广告，传入的size跟后面展示的 nativeAdViewProperty.parent = size最好要一致，不然可能出现裁剪或显示不全的问题。
ATNativeSDK.loadAd("your placement id", ATNativeSDK.createLoadAdSize(cc.screen.windowSize.width, cc.screen.windowSize.width * 4/5));
```

## **2**. 设置监听

复制代码

```
private NativeAdListener = {
    onNativeAdLoaded: (placementId: any) => {
        console.log("onNativeAdLoaded", placementId)
    },
    onNativeAdLoadFail: (placementId: any, errorInfo: any) => {
        console.log("onNativeAdLoadFail", placementId, errorInfo)
    },
    onNativeAdShow: (placementId: any, callbackInfo: any) => {
        console.log("onNativeAdShow", placementId, callbackInfo)
    },
    onNativeAdClick: (placementId: any, callbackInfo: any) => {
        console.log("onNativeAdClick", placementId, callbackInfo)
    },
    onNativeAdVideoStart: (placementId: any) => {
        console.log("onNativeAdVideoStart", placementId)
    },
    onNativeAdVideoEnd: (placementId: any) => {
        console.log("onNativeAdVideoEnd", placementId)
    },
    onNativeAdCloseButtonTapped: (placementId: any, callbackInfo: any) => {
        console.log("onNativeAdCloseButtonTapped", placementId, callbackInfo)
        ATNativeSDK.removeAd(Constant.NativePlacementId);
    }
};

ATNativeSDK.setAdListener(this.NativeAdListener);
```

## **3.** 展示广告

> 请留意iOS和安卓平台传入的尺寸单位或不同，可能需要进行转换。

复制代码

```
import {AdViewProperty} from "db://assets/script/AnyThinkAds/ATNative";

ATNativeSDK.entryAdScenario("your placement id", "your scenario id");
if (ATNativeSDK.hasAdReady("your placement id")) {
    const windowSize = cc.screen.windowSize;
    const windowWidth = windowSize.width;
    const windowHeight = windowSize.height;
    const padding = windowSize.width / 35;
    const parentWidth = windowWidth;
    const parentHeight = windowWidth * 4 / 5;
    const appIconSize = windowWidth / 7;
    const nativeAdViewProperty = new AdViewProperty();
    nativeAdViewProperty.parent = nativeAdViewProperty.createItemViewProperty(0, windowHeight - parentHeight, parentWidth, parentHeight, "#ffffff", "", 0);
    nativeAdViewProperty.appIcon = nativeAdViewProperty.createItemViewProperty(0, parentHeight - appIconSize, appIconSize, appIconSize, "", "", 0);
    nativeAdViewProperty.cta = nativeAdViewProperty.createItemViewProperty(parentWidth - appIconSize * 2, parentHeight - appIconSize, appIconSize * 2, appIconSize, "#2095F1", "#ffffff", appIconSize / 3);
    nativeAdViewProperty.mainImage = nativeAdViewProperty.createItemViewProperty(padding, padding, parentWidth - 2 * padding, parentHeight - appIconSize - 2 * padding, "#ffffff", "#ffffff", 14);
    nativeAdViewProperty.title = nativeAdViewProperty.createItemViewProperty(appIconSize + padding, parentHeight - appIconSize, parentWidth - 3 * appIconSize - 2 * padding, appIconSize / 2, "", "#000000", appIconSize / 3);
    nativeAdViewProperty.desc = nativeAdViewProperty.createItemViewProperty(appIconSize + padding, parentHeight - appIconSize / 2, parentWidth - 3 * appIconSize - 2 * padding, appIconSize / 2, "#ffffff", "#000000", appIconSize / 4);
    nativeAdViewProperty.dislike = nativeAdViewProperty.createItemViewProperty(parentWidth - appIconSize / 2, 0, appIconSize / 2, appIconSize / 2, "#00ffffff", "#ffffff", 14);
    nativeAdViewProperty.elements = nativeAdViewProperty.createItemViewProperty(0, parentHeight - appIconSize / 2, parentWidth, appIconSize / 2, "#7f000000", "#ffffff", 14)
    ATNativeSDK.showAdInScenario("your placement id" nativeAdViewProperty, "your scenario id");
} else {
    // 加载原生广告时需要传入广告展示的宽高
    // 特别说明：如果是原生模板广告，传入的size跟后面展示的 nativeAdViewProperty.parent = size最好要一致，不然可能出现裁剪或显示不全的问题。
    ATNativeSDK.loadAd("your placement id", ATNativeSDK.createLoadAdSize(cc.screen.windowSize.width, cc.screen.windowSize.width * 4/5));
}
```
