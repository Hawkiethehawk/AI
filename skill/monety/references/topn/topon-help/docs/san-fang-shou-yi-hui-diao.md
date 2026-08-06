---
title: "三方收益回调"
source: "https://help.toponad.net/cn/docs/san-fang-shou-yi-hui-diao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "集成基础说明", "三方收益回调"]
content_sha256: "1aec6222e52b412af7f3219ffa66ab5661a8e204ff456f3d3a06dd16d6930ff0"
knowledge_role: "reference_only"
has_article_body: true
---

# 三方收益回调

> **💡Tips:**
>
> - unity 插件版本要求：v2.1.8及以上

java
复制代码

```
//NativeAd
ATNativeAd.Instance.setAdRevenueListener(mPlacementId, new DemoAdRevenueListener());
//BannerAd
ATBannerAd.Instance.setAdRevenueListener(mPlacementId, new DemoAdRevenueListener());
//InterstitialAd
ATInterstitialAd.Instance.setAdRevenueListener(mPlacementId, new DemoAdRevenueListener());
//SplashAd
ATSplashAd.Instance.setAdRevenueListener(mPlacementId, new DemoAdRevenueListener());
//RewardedVideo
ATRewardedVideo.Instance.setAdRevenueListener(mPlacementId, new DemoAdRevenueListener());
//实现IATAdRevenueListener
private sealed class DemoAdRevenueListener : IATAdRevenueListener
    {
        public void onAdRevenuePaid(string placementId, ATCallbackInfo adInfo)
        {
            //adsource_price是千次收益，publisher_revenue是单次收益
            Debug.Log("::onAdRevenuePaid() >>> " + placementId + ", adInfo=" + (adInfo != null ? adInfo.getOriginJSONString() : ""));
        }
    }
```
