---
title: "横幅广告"
source: "https://help.toponad.net/cn/docs/heng-fu-guang-gao-CmIQ"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "自定义广告平台", "横幅广告"]
content_sha256: "e20a5ee650f843867366b552e3a3811ae0e94f8255e0b63deb031beffcc5cc87"
knowledge_role: "reference_only"
has_article_body: true
---

# 横幅广告

> 💡**Tips:**
>
> - 自定义横幅广告Adapter需继承 **com.anythink.banner.unitgroup.api.CustomBannerAdapter**，并重写所有抽象方法，在相应的方法中调用广告平台的API，并通过类成员变量`mLoadListener`回调加载的结果，通过类成员变量`mImpressionListener`回调广告展示、点击、关闭等事件结果

> 💡**Tips:**
>
> - 自定义横幅广告Adapter需继承 **com.thinkup.banner.unitgroup.api.CustomBannerAdapter**，并重写所有抽象方法，在相应的方法中调用广告平台的API，并通过类成员变量`mLoadListener`回调加载的结果，通过类成员变量`mImpressionListener`回调广告展示、点击、关闭等事件结果

## 1. 横幅广告需要额外实现的抽象方法

| 方法 | 说明 |
| --- | --- |
| void loadCustomNetworkAd(Context context, Map serverExtra, Map localExtra) | 实现自定义广告平台的广告的加载逻辑 **context**：对应传入ATBannerView的context值 **serverExtra**：服务端配置的自定义参数，TopOn后台配置的Json字符串中的key-value都可通过serverExtra参数获取到 **localExtra**：本次加载传入自定义参数，通过`ATBannerView#setLocalExtra()`方法传入的key-value可通过locaExtra参数获取到 |
| View getBannerView() | 需要返回已经加载成功的BannerView的对象 |

| 方法 | 说明 |
| --- | --- |
| void loadCustomNetworkAd(Context context, Map serverExtra, Map localExtra) | 实现自定义广告平台的广告的加载逻辑 **context**：对应传入TUBannerView的context值 **serverExtra**：服务端配置的自定义参数，TopOn后台配置的Json字符串中的key-value都可通过serverExtra参数获取到 **localExtra**：本次加载传入自定义参数，通过`TUBannerView#setLocalExtra()`方法传入的key-value可通过locaExtra参数获取到 |
| View getBannerView() | 需要返回已经加载成功的BannerView的对象 |

---

## 2. 横幅广告事件回调

使用**CustomBannerAdapter**的`CustomBannerEventListener`成员变量实现广告事件的回调

| 方法 | 说明 |
| --- | --- |
| void onBannerAdClicked() | 广告被点击时执行的回调 |
| void onBannerAdShow() | 广告展示时执行的回调 |
| void onBannerAdClose() | 广告被关闭时执行的回调 |

> **注意：**使用成员变量`CustomBannerEventListener`时候需要做**判空**处理

---

## 3. 示例代码

代码详情请参考[Demo中的示例Adapter](https://github.com/toponteam/TPN-Android-Demo/tree/main/app/src/main/java/com/anythink/custom/adapter)
