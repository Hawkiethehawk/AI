---
title: "ATBannerDelegate"
source: "https://help.toponad.net/cn/docs/ATBannerDelegate"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Protocol", "ATBannerDelegate"]
content_sha256: "cde380c441f998bbccca5180e549e9208724750e0c203c79ca69ec38e73f470f"
knowledge_role: "reference_only"
has_article_body: true
---

# ATBannerDelegate

> 关于部分代理方法中的extra参数，您可以[点击这里](https://help.toponad.com/cn/docs/uECwtr)查看详情。

复制代码

```
@protocol ATBannerDelegate<ATAdLoadingDelegate>

/// BannerView 展示结果
- (void)bannerView:(ATBannerView *)bannerView didShowAdWithPlacementID:(NSString *)placementID extra:(NSDictionary *)extra;

/// bannerView 点击
- (void)bannerView:(ATBannerView *)bannerView didClickWithPlacementID:(NSString *)placementID extra:(NSDictionary *)extra;

@optional

/// bannerView 自动刷新
- (void)bannerView:(ATBannerView *)bannerView didAutoRefreshWithPlacement:(NSString *)placementID extra:(NSDictionary *)extra;

/// BannerView 自动刷新失败
- (void)bannerView:(ATBannerView *)bannerView failedToAutoRefreshWithPlacementID:(NSString *)placementID error:(NSError *)error;

/// bannerView 点击关闭按钮
- (void)bannerView:(ATBannerView *)bannerView didTapCloseButtonWithPlacementID:(NSString *)placementID extra:(NSDictionary *)extra;

/// bannerView 广告落地页关闭
/// 支持的网络: [GDT][CSJ]
- (void)bannerView:(ATBannerView *)bannerView didLPCloseForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra;

/// bannerView 点击跳转是否是 Deeplink 形式
/// 目前仅对 TopOn Adx 广告返回
- (void)bannerView:(ATBannerView *)bannerView didDeepLinkOrJumpForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra result:(BOOL)success;

@end
```
