---
title: "原生广告"
source: "https://help.toponad.net/cn/docs/yuan-sheng-guang-gao-aOTT"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "自定义广告平台", "原生广告"]
content_sha256: "d4b523df515bd1e473a3252f700cc2b867a4a76a4ea09e644893717ee37a58fc"
knowledge_role: "reference_only"
has_article_body: true
---

# 原生广告

> 💡**Tips:**
>
> - 自定义原生广告Adapter需继承 **com.anythink.nativead.unitgroup.api.CustomNativeAdapter**，并重写所有抽象方法，在相应的方法中调用广告平台的API，并通过类成员变量`mLoadListener`回调加载的结果，通过类成员变量`mImpressionListener`回调广告展示、点击、关闭等事件结果

> 💡**Tips:**
>
> - 自定义原生广告Adapter需继承 **com.thinkup.nativead.unitgroup.api.CustomNativeAdapter**，并重写所有抽象方法，在相应的方法中调用广告平台的API，并通过类成员变量`mLoadListener`回调加载的结果，通过类成员变量`mImpressionListener`回调广告展示、点击、关闭等事件结果

## 1. 原生广告需要额外实现的抽象方法

只需要继承**CustomNativeAdapter**和实现公共的抽象方法即可，其中广告加载成功之后，需要将自定义广告平台的广告信息包装在继承**CustomNativeAd**对象里，通过`ATCustomLoadListener.onAdCacheLoaded`方法回调出去，广告的内容需要重写**CustomNativeAd**的方法来提供：**（里面的方法实现可按照自定义广告平台来需求来实现，可以不用全部实现）**

| 方法 | 说明 |
| --- | --- |
| void loadCustomNetworkAd(Context context, Map serverExtra, Map localExtra) | 实现自定义广告平台的广告的加载逻辑 **context**：对应传入ATNative的context值 **serverExtra**：服务端配置的自定义参数，TopOn后台配置的Json字符串中的key-value都可通过serverExtra参数获取到 **localExtra**：本次加载传入自定义参数，通过`ATNative#setLocalExtra()`方法传入的key-value可通过locaExtra参数获取到 |
| boolean isNativeExpress() | 用于判断当前的原生广告是否是模版广告 |
| ViewGroup getCustomAdContainer() | 提供自定义广告平台固有装载原生广告的容器 |
| View getAdMediaView() | 用于提供原生广告的大图或者视频的View（如果是模版广告需要将模版广告的View通过该方法提供） |
| String getTitle() | 用于提供原生广告标题 |
| String getDescriptionText() | 用于提供原生广告描述 |
| String getMainImageUrl() | 用于提供原生广告大图url |
| String getIconImageUrl() | 用于提供原生广告图标url |
| String getCallToActionText() | 用于提供原生广告CTA按钮文案 |
| Double getStarRating() | 用于提供原生广告的星级评分 |
| String getAdChoiceIconUrl() | 用于提供原生广告的广告标识的url |
| String getAdFrom() | 用于提供原生广告的广告来源文案 |
| List getImageUrlList() | 用于提供原生广告的图片列表 |
| void prepare(View view, ATNativePrepareInfo nativePrepareInfo) | 用于配置广告点击事件、绑定自渲染元素等 **view**：展示原生广告的容器 **nativePrepareInfo**：用于自渲染广告绑定自渲染元素和绑定点击事件 |
| void clear(View view) | 实现移除广告点击事件的绑定 **view**: 展示原生广告的容器 |
| void onResume() | 原生广告被展示时执行 |
| void onPause() | 原生广告没有展示时执行 |
| void destory() | 原生广告销毁时执行 |

只需要继承**CustomNativeAdapter**和实现公共的抽象方法即可，其中广告加载成功之后，需要将自定义广告平台的广告信息包装在继承**CustomNativeAd**对象里，通过`TUCustomLoadListener.onAdCacheLoaded`方法回调出去，广告的内容需要重写**CustomNativeAd**的方法来提供：**（里面的方法实现可按照自定义广告平台来需求来实现，可以不用全部实现）**

| 方法 | 说明 |
| --- | --- |
| void loadCustomNetworkAd(Context context, Map serverExtra, Map localExtra) | 实现自定义广告平台的广告的加载逻辑 **context**：对应传入TUNative的context值 **serverExtra**：服务端配置的自定义参数，TopOn后台配置的Json字符串中的key-value都可通过serverExtra参数获取到 \*\*localExtra：本次加载传入自定义参数，通过`TUNative#setLocalExtra()`方法传入的key-value可通过locaExtra参数获取到 |
| boolean isNativeExpress() | 用于判断当前的原生广告是否是模版广告 |
| ViewGroup getCustomAdContainer() | 提供自定义广告平台固有装载原生广告的容器 |
| View getAdMediaView() | 用于提供原生广告的大图或者视频的View（如果是模版广告需要将模版广告的View通过该方法提供） |
| String getTitle() | 用于提供原生广告标题 |
| String getDescriptionText() | 用于提供原生广告描述 |
| String getMainImageUrl() | 用于提供原生广告大图url |
| String getIconImageUrl() | 用于提供原生广告图标url |
| String getCallToActionText() | 用于提供原生广告CTA按钮文案 |
| Double getStarRating() | 用于提供原生广告的星级评分 |
| String getAdChoiceIconUrl() | 用于提供原生广告的广告标识的url |
| String getAdFrom() | 用于提供原生广告的广告来源文案 |
| List getImageUrlList() | 用于提供原生广告的图片列表 |
| void prepare(View view, TUNativePrepareInfo nativePrepareInfo) | 用于配置广告点击事件、绑定自渲染元素等 **view**：展示原生广告的容器 **nativePrepareInfo**：用于自渲染广告绑定自渲染元素和绑定点击事件 |
| void clear(View view) | 实现移除广告点击事件的绑定 **view**: 展示原生广告的容器 |
| void onResume() | 原生广告被展示时执行 |
| void onPause() | 原生广告没有展示时执行 |
| void destory() | 原生广告销毁时执行 |

---

## 2. 原生广告广告事件回调

自定义的广告平台信息包装在继承**CustomNativeAd**之后，可通过**CustomNativeAd**里面的方法执行广告事件的回调：

| 方法 | 说明 |
| --- | --- |
| void notifyAdClicked() | 广告点击时执行回调 |
| void notifyAdDislikeClick() | 广告点击Dislike按钮时执行回调（可选） |
| void notifyAdVideoStart() | 广告的视频播放时执行回调（可选） |
| void notifyAdVideoEnd() | 广告的视频结束时执行回调（可选） |

---

## 3. 示例代码

代码详情请参考[Demo中的示例Adapter](https://github.com/toponteam/TPN-Android-Demo/tree/main/app/src/main/java/com/anythink/custom/adapter)
