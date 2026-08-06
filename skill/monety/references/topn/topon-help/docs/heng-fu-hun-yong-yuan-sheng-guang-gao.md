---
title: "自定义横幅广告"
source: "https://help.toponad.net/cn/docs/heng-fu-hun-yong-yuan-sheng-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-07-22"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "广告样式", "横幅广告", "自定义横幅广告"]
content_sha256: "2d0a6e8d533202f75dd3ff55dbb1611528f8d0a640f5c282fdd120dcad7c2a77"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义横幅广告

## 1. 说明

使用横幅广告位配置原生广告。（注意：暂时只支持原生自渲染类型）

---

## 2. 如何使用

1. 请参考 [TopOn后台配置说明](https://help.toponad.net/cn/docs/QXxkrR#6.2_%E5%B9%BF%E5%91%8A%E6%A0%B7%E5%BC%8F%E6%B7%B7%E7%94%A8%E6%94%AF%E6%8C%81%E7%9A%84%E5%B9%B3%E5%8F%B0%E5%92%8C%E9%85%8D%E7%BD%AE) 完成配置
2. 如果您在TopOn后台配置时选择的是 **TopOn SDK渲染** ，那么您无需额外添加代码； 
   如果选择的是 **开发者自渲染** ，那么请在在广告加载前额外调用 `ATBannerView#setNativeAdCustomRender()` 方法，具体如下：

java
复制代码

```
ATBannerView mBannerView = new ATBannerView(activity);
mBannerView.setNativeAdCustomRender(new ATNativeAdCustomRender() {
    @Override
    public View getMediationViewFromNativeAd(ATNativeAdInfo mixNativeAd, ATAdInfo atAdInfo) {
        //您可以根据自身的需求将SDK返回的广告素材渲染成 View 并在此处返回
        //具体可以参考：https://github.com/toponteam/TPN-Android-Demo
        return MediationNativeAdUtil.getViewFromNativeAd(activity, mixNativeAd, atAdInfo, false);
    }
});
mBannerView.loadAd();
```

1. 请参考 [TopOn后台配置说明](https://help.toponad.net/cn/docs/QXxkrR#6.2_%E5%B9%BF%E5%91%8A%E6%A0%B7%E5%BC%8F%E6%B7%B7%E7%94%A8%E6%94%AF%E6%8C%81%E7%9A%84%E5%B9%B3%E5%8F%B0%E5%92%8C%E9%85%8D%E7%BD%AE) 完成配置
2. 如果您在TopOn后台配置时选择的是 **TopOn SDK渲染** ，那么您无需额外添加代码； 
   如果选择的是 **开发者自渲染** ，那么请在在广告加载前额外调用 `TUBannerView#setNativeAdCustomRender()` 方法，具体如下：

java
复制代码

```
TUBannerView mBannerView = new TUBannerView(activity);
mBannerView.setNativeAdCustomRender(new TUNativeAdCustomRender() {
    @Override
    public View getMediationViewFromNativeAd(TUNativeAdInfo mixNativeAd, TUAdInfo adInfo) {
        //您可以根据自身的需求将SDK返回的广告素材渲染成 View 并在此处返回
        //具体可以参考：https://github.com/toponteam/TPN-Android-Demo
        return MediationNativeAdUtil.getViewFromNativeAd(activity, mixNativeAd, adInfo, false);
    }
});
mBannerView.loadAd();
```

> **注意** ：
>
> - 当在TopOn后台设置开发者自渲染方式时，如果没在代码实现自渲染返回广告View，则会默认用SDK内置的布局样式进行渲染。
> - 当在TopOn后台设置开发者自渲染方式并且有在代码设置自渲染返回广告View时，则广告背景默认是全透明，需要您自行实现半屏和全屏的效果。
