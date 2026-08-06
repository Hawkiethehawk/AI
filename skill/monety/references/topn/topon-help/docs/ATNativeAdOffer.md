---
title: "ATNativeAdOffer"
source: "https://help.toponad.net/cn/docs/ATNativeAdOffer"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATNativeAdOffer"]
content_sha256: "2017750b090611c689241fae349dcd5d4dd7cdec9c61bae343839e8d7f307634"
knowledge_role: "reference_only"
has_article_body: true
---

# ATNativeAdOffer

> 原生广告素材供应类，用于封装单个原生广告的相关信息（如广告内容、网络平台ID、供应信息等）并提供渲染方法。

复制代码

```
@class ATNativeADView;
@class ATNativeADConfiguration;

@interface ATNativeAdOffer : NSObject

/**
 * 原生广告对象
 */
@property(nonatomic, readonly) ATNativeAd *nativeAd;

/**
 * 原生广告的网络平台ID
 */
@property(nonatomic, readonly) NSInteger networkFirmID;

/**
 * 原生广告的Offer信息
 */
@property(nonatomic, readonly) NSDictionary *adOfferInfo;

/**
 * 使用配置、自渲染视图和原生广告视图进行渲染
 * @param configuration 广告配置
 * @param selfRenderView 自渲染视图（可为空）
 * @param nativeADView 原生广告视图
 */
- (void)rendererWithConfiguration:(ATNativeADConfiguration*)configuration
                 selfRenderView:(UIView *_Nullable*)selfRenderView
                  nativeADView:(ATNativeADView *)nativeADView;

@end
```
