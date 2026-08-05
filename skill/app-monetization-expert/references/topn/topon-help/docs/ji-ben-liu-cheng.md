---
title: "自定义广告平台"
source: "https://help.toponad.net/cn/docs/ji-ben-liu-cheng"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-07-29"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "自定义广告平台"]
content_sha256: "00b6f5b39c241daab47399daef148fc823e9cb52aad752899de28334673ba9dd"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义广告平台

## 1. 自定义广告平台Adapter的使用

> 请先查看[如何在TopOn后台创建自定义广告平台](https://help.toponad.net/cn/docs/fRMh7C)

(1) 您只需要继承相关类并重写相应方法，自定义Adapter中的所有方法都不需要您进行调用，当TopOn后台的广告位下配置好自定义广告平台的广告源后，SDK内部会在合适的时机调用自定义Adapter中的相关方法。

(2) 您调用TopOn SDK的load API加载广告，自定义广告平台的广告加载结果需要通过调用`ATCustomLoadListener#onAdCacheLoaded`和`ATCustomLoadListener#onAdLoadError`通知TopOn SDK，最终您会通过加载成功的回调收到TopOn SDK的通知

(2) 您调用TopOn SDK的load API加载广告，自定义广告平台的广告加载结果需要通过调用`TUCustomLoadListener#onAdCacheLoaded`和`TUCustomLoadListener#onAdLoadError`通知TopOn SDK，最终您会通过加载成功的回调收到TopOn SDK的通知



(3) TopOn SDK拉取到后台策略后会将上图中配置的参数转化为Map，传给`loadCustomNetworkAd(Context context, Map serverExtra, Map localExtra)`方法，您可通过**serverExtra**参数获取到相关参数（AppID、AppKey等）。

---

## 2. 公共抽象方法的实现以及广告加载事件的回调

### ● 公共的抽象方法实现

| 方法 | 说明 |
| --- | --- |
| void getNetworkPlacementId() | 提供本次加载自定义广告平台的广告位ID |
| void getNetworkSDKVersion() | 提供本次加载自定义广告平台的SDK版本 |
| void destory() | 实现自定义广告平台的销毁逻辑 |
| boolean setUserDataConsent(Context context, boolean isConsent, boolean isEUTraffic) | **（非必须实现，可选）** 提供用户授权情况以及是否欧盟的信息给自定义广告平台实现GDPR的设置功能。**（如果有实现则返回true，TopOn会用于统计记录）** **context:** 上下文 **isConsent:** 用户是否授权  **isEUTraffic:** 是否是欧盟地区 |
| Map getNetworkInfoMap() | **（非必须实现，可选）** 提供自定义广告的自定义信息，在此方法中，可以创建Map，并将一些额外的信息添加到此Map中返回，您最终可根据TopOn SDK各回调方法中的AdInfo对象，通过调用`AdInfo#getExtInfoMap()`方法获取到这些额外信息 |

### ● 公共广告加载事件的回调

使用Adapter里的成员变量`ATCustomLoadListener`实现广告加载结果的回调

使用Adapter里的成员变量`TUCustomLoadListener`实现广告加载结果的回调

| **方法** | **说明** |
| --- | --- |
| void onAdCacheLoaded(BaseAd... baseAds) | 广告内容以及素材加载成功时，调用此方法通知TopOn SDK，最终您会通过加载成功的回调收到TopOn SDK的通知 **baseAds**: 主要是提供给原生广告回调广告对象的，其他广告形式不需要加入参数回调 |
| void onAdLoadError(String errorCode, String errorMsg) | 广告加载失败时，调用此方法通知TopOn SDK，最终TopOn SDK会回调加载失败的方法通知开发者 （errorCode及errorMsg会封装到TopOn SDK回调方法中的AdError对象中） **errorCode**: 错误码信息  **errorMsg**: 详细错误信息 |

> **注意：**使用成员变量`ATCustomLoadListener`时候需要做**判空**处理

> **注意：**使用成员变量`TUCustomLoadListener`时候需要做**判空**处理

---

## 3. 自定义广告平台Adapter的使用以及注意事项

### ● 设置WaterFall请求策略

> **注意：**
>
> - TopOn后台添加自定义广告平台时，Adapter类名需配置全路径类名（包名+类名），否则加载广告时Adapter类将不能正常被创建
> - 在构建release包时，必须确保Adapter类不能被混淆。混淆规则示例如下：
>
> java
> 复制代码
>
> ```
> # 将  改为您自己的Adapter类名
> -keep class  { *;}
> -keepclassmembers public class  {
>     public *;
> }
> ```
