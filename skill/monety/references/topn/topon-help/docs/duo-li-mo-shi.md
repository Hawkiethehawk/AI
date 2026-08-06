---
title: "多例模式"
source: "https://help.toponad.net/cn/docs/duo-li-mo-shi"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-05-20"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "多例模式"]
content_sha256: "974780100e328ea0c2de24701fda7a2ec4f8bc1b91d20dddcd09d9c1435ef8af"
knowledge_role: "reference_only"
has_article_body: true
---

# 多例模式

**💡Tips**

- TopOn SDK 版本要求：v6.5.80及以上
- 增加ATAdCreateConfig的构造方法支持设置多例请求模式
- 广告缓存和广告对象维度关联

#### 示例

复制代码

```
//横幅
ATBannerView mBannerView = new ATBannerView(this);
mBannerView.setPlacementId(placementId, new ATAdCreateConfig.Builder().setMultiton(true).build());
```

复制代码

```
//原生
ATAdCreateConfig build = new ATAdCreateConfig.Builder().setMultiton(true).build();
ATNative mATNative = new ATNative(this, placementId, new ATNativeNetworkListener() {
            @Override
            public void onNativeAdLoaded() {
            }
            @Override
            public void onNativeAdLoadFail(AdError adError) {
            }
        }, build);
```
