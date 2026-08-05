---
title: "激励视频"
source: "https://help.toponad.net/cn/docs/ji-li-shi-pin-neTA"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "自定义广告平台", "激励视频"]
content_sha256: "5fbb53d1d296164762686d571f7f76aeeba3860b3e3710185252cb92589f4887"
knowledge_role: "reference_only"
has_article_body: true
---

# 激励视频

> 💡**Tips:**
>
> - 自定义激励视频Adapter需继承 **com.anythink.rewardvideo.unitgroup.api.CustomRewardVideoAdapter**，并重写所有抽象方法，在相应的方法中调用广告平台的API，并通过类成员变量`mLoadListener`回调加载的结果，通过类成员变量`mImpressionListener`回调广告展示、点击、关闭等事件结果

> 💡**Tips:**
>
> - 自定义激励视频Adapter需继承 **com.thinkup.rewardvideo.unitgroup.api.CustomRewardVideoAdapter**，并重写所有抽象方法，在相应的方法中调用广告平台的API，并通过类成员变量`mLoadListener`回调加载的结果，通过类成员变量`mImpressionListener`回调广告展示、点击、关闭等事件结果

## 1. 激励视频需要额外实现的抽象方法

| 方法 | 说明 |
| --- | --- |
| void loadCustomNetworkAd(Context context, Map serverExtra, Map localExtra) | 实现自定义广告平台的广告的加载逻辑 **context**：对应传入ATRewardVideoAd的context值 **serverExtra**：服务端配置的自定义参数，TopOn后台配置的Json字符串中的key-value都可通过serverExtra参数获取到 **localExtra**：本次加载传入自定义参数，通过`ATRewardVideoAd#setLocalExtra()`传入的key-value都可通过locaExtra参数获取到 |
| boolean isAdReady() | 用于判断自定义广告平台的激励视频广告是否已经是准备完成的状态 |
| void show(Activity activity) | 实现展示自定义广告平台激励视频的逻辑 |

| 方法 | 说明 |
| --- | --- |
| void loadCustomNetworkAd(Context context, Map serverExtra, Map localExtra) | 实现自定义广告平台的广告的加载逻辑 **context**：对应传入TURewardVideoAd的context值 **serverExtra**：服务端配置的自定义参数，TopOn后台配置的Json字符串中的key-value都可通过serverExtra参数获取到 **localExtra**：本次加载传入自定义参数，通过`TURewardVideoAd#setLocalExtra()`传入的key-value都可通过locaExtra参数获取到 |
| boolean isAdReady() | 用于判断自定义广告平台的激励视频广告是否已经是准备完成的状态 |
| void show(Activity activity) | 实现展示自定义广告平台激励视频的逻辑 |

---

## 2. 激励视频的广告事件回调

使用**CustomRewardVideoAdapter**的`CustomRewardedVideoEventListener`成员变量实现广告事件的回调

| 方法 | 说明 |
| --- | --- |
| void onRewardedVideoAdPlayStart() | 广告视频播放开始时执行回调 |
| void onRewardedVideoAdPlayEnd() | 广告视频播放结束时执行回调 |
| void onRewardedVideoAdPlayFailed(String errorCode, String errorMsg) | 广告视频播放失败时执行回调 **errorCode**: 错误码信息 **errorMsg**: 详细错误信息 |
| void onRewardedVideoAdClosed() | 广告页面关闭时执行回调 |
| void onRewardedVideoAdPlayClicked() | 广告被点击时执行回调 |
| void onReward() | 给用户下发激励时执行回调 |

> **注意：**使用成员变量`CustomRewardedVideoEventListener`时候需要做**判空**处理

---

## 3. 示例代码

代码详情请参考[Demo中的示例Adapter](https://github.com/toponteam/TPN-Android-Demo/tree/main/app/src/main/java/com/anythink/custom/adapter)
