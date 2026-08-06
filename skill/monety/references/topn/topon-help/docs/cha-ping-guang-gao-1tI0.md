---
title: "插屏广告"
source: "https://help.toponad.net/cn/docs/cha-ping-guang-gao-1tI0"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "自定义广告平台", "插屏广告"]
content_sha256: "62b03184b5e1aa58b5d5672aea0455d38552b3ca553761e30d7a6909c8360fae"
knowledge_role: "reference_only"
has_article_body: true
---

# 插屏广告

> 💡**Tips**
>
> - 自定义插屏广告Adapter需继承 **com.anythink.interstitial.unitgroup.api.CustomInterstitialAdapter**，并重写所有抽象方法，在相应的方法中调用广告平台的API，并通过类成员变量`mLoadListener`回调加载的结果，通过类成员变量`mImpressionListener`回调广告展示、点击、关闭等事件结果

> 💡**Tips**
>
> - 自定义插屏广告Adapter需继承 **com.thinkup.interstitial.unitgroup.api.CustomInterstitialAdapter**，并重写所有抽象方法，在相应的方法中调用广告平台的API，并通过类成员变量`mLoadListener`回调加载的结果，通过类成员变量`mImpressionListener`回调广告展示、点击、关闭等事件结果

## 1. 插屏广告需要额外实现的抽象方法

| 方法 | 说明 |
| --- | --- |
| void loadCustomNetworkAd(Context context, Map serverExtra, Map localExtra) | 实现自定义广告平台的广告的加载逻辑 **context**：对应传入ATInterstitial的context值 **serverExtra**：服务端配置的自定义参数，TopOn后台配置的Json字符串中的key-value都可通过serverExtra参数获取到 **localExtra**：本次加载传入自定义参数，通过`ATInterstitial#setLocalExtra()`方法传入的key-value可通过locaExtra参数获取到 |
| boolean isAdReady() | 用于判断自定义广告平台的插屏广告是否已经是准备完成的状态 |
| void show(Activity activity) | 实现展示自定义广告平台插屏的逻辑 |

| 方法 | 说明 |
| --- | --- |
| void loadCustomNetworkAd(Context context, Map serverExtra, Map localExtra) | 实现自定义广告平台的广告的加载逻辑 **context**：对应传入TUInterstitial的context值 **serverExtra**：服务端配置的自定义参数，TopOn后台配置的Json字符串中的key-value都可通过serverExtra参数获取到 **localExtra**：本次加载传入自定义参数，通过`TUInterstitial#setLocalExtra()`方法传入的key-value可通过locaExtra参数获取到 |
| boolean isAdReady() | 用于判断自定义广告平台的插屏广告是否已经是准备完成的状态 |
| void show(Activity activity) | 实现展示自定义广告平台插屏的逻辑 |

---

## 2. 插屏广告事件回调

使用**CustomInterstitialAdapter**的`CustomInterstitialEventListener`成员变量实现广告事件的回调

| 方法 | 说明 |
| --- | --- |
| void onInterstitialAdVideoStart() | 广告视频播放开始时执行回调 |
| void onInterstitialAdVideoEnd() | 广告视频播放结束时执行回调 |
| void onInterstitialAdVideoError(String errorCode, String errorMsg) | 广告视频播放失败时执行回调 **errorCode**: 错误码信息 **errorMsg**: 详细错误信息 |
| void onInterstitialAdClose() | 广告页面关闭时执行回调 |
| void onInterstitialAdClicked() | 广告被点击时执行回调 |
| void onInterstitialAdShow() | 广告页面打开时执行回调 |

> **注意：**使用成员变量CustomInterstitialEventListener时候需要做**判空**处理

---

## 3. 示例代码

代码详情请参考[Demo中的示例Adapter](https://github.com/toponteam/TPN-Android-Demo/tree/main/app/src/main/java/com/anythink/custom/adapter)
