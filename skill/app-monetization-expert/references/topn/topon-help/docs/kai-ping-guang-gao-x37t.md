---
title: "开屏广告"
source: "https://help.toponad.net/cn/docs/kai-ping-guang-gao-x37t"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "自定义广告平台", "开屏广告"]
content_sha256: "682b5a12b72ffd87edd4f4fd0d26fcd8a785ef1d9abf43f54c78857278d84ff8"
knowledge_role: "reference_only"
has_article_body: true
---

# 开屏广告

> 💡**Tips:**
>
> - 自定义开屏广告Adapter需继承**com.anythink.splash.unitgroup.api.CustomSplashAdapter**，并重写所有抽象方法，在相应的方法中调用广告平台的API，并通过类成员变量`mLoadListener`回调加载的结果，通过类成员变量`mImpressionListener`回调广告展示、点击、关闭等事件结果

> 💡**Tips:**
>
> - 自定义开屏广告Adapter需继承**com.thinkup.splash.unitgroup.api.CustomSplashAdapter**，并重写所有抽象方法，在相应的方法中调用广告平台的API，并通过类成员变量`mLoadListener`回调加载的结果，通过类成员变量`mImpressionListener`回调广告展示、点击、关闭等事件结果

## 1. 开屏广告需要额外实现的抽象方法

| 方法 | 说明 |
| --- | --- |
| void loadCustomNetworkAd(Context context, Map serverExtra, Map localExtra) | 实现自定义广告平台的广告的加载逻辑 **context**：对应传入ATSplashAd的context值 **(注：context类型为Activity）** **serverExtra**：服务端配置的自定义参数，TopOn后台配置的Json字符串中的key-value都可通过serverExtra参数获取到 **localExtra**：本次加载传入自定义参数，通过`ATSplashAd#setLocalExtra()`方法传入的key-value可通过locaExtra参数获取到 |
| void show(Activity activity, ViewGroup container) | 用于展示广告 **container**: 展示广告的容器 |

> **CustomSplashAdapter**提供了广告加载超时时间的成员变量，即可通过**ATSplashAd**构造方法传入的**fetchAdTimeout**变量，该变量可用于设置广告平台的超时时间。

| 方法 | 说明 |
| --- | --- |
| void loadCustomNetworkAd(Context context, Map serverExtra, Map localExtra) | 实现自定义广告平台的广告的加载逻辑 **context**：对应传入TUSplashAd的context值 **(注：context类型为Activity）** **serverExtra**：服务端配置的自定义参数，TopOn后台配置的Json字符串中的key-value都可通过serverExtra参数获取到 **localExtra**：本次加载传入自定义参数，通过`TUSplashAd#setLocalExtra()`方法传入的key-value可通过locaExtra参数获取到 |
| void show(Activity activity, ViewGroup container) | 用于展示广告 \*\*container: 展示广告的容器 |

> **CustomSplashAdapter**提供了广告加载超时时间的成员变量，即可通过**TUSplashAd**构造方法传入的**fetchAdTimeout**变量，该变量可用于设置广告平台的超时时间。

---

## 2. 开屏广告事件回调

使用CustomSplashAdapter的`CustomSplashEventListener`成员变量实现广告事件的回调

| 方法 | 说明 |
| --- | --- |
| void onSplashAdClicked() | 广告被点击时执行的回调 |
| void onSplashAdShow() | 广告展示时执行的回调 |
| void onSplashAdDismiss() | 广告被关闭时执行的回调 |

> **注意：**使用成员变量`CustomSplashEventListener`时候需要做**判空**处理

---

## 3. 示例代码

代码详情请参考[Demo中的示例Adapter](https://github.com/toponteam/TPN-Android-Demo/tree/main/app/src/main/java/com/anythink/custom/adapter)
