---
title: "ATNativeADDelegate"
source: "https://help.toponad.net/cn/docs/MGwr60pG"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-08"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Protocol", "ATNativeADDelegate"]
content_sha256: "3e627329ae0c14e799f1f2b267bb00b55d7b2ef0315bc1132cd68e88af13a5f9"
knowledge_role: "reference_only"
has_article_body: true
---

# ATNativeADDelegate

复制代码

```
@protocol ATNativeADDelegate<ATAdLoadingDelegate>

/// Native ad displayed successfully
- (void)didShowNativeAdInAdView:(ATNativeADView *)adView
                   placementID:(NSString *)placementID
                         extra:(NSDictionary *)extra;

/// Native ad clicked
- (void)didClickNativeAdInAdView:(ATNativeADView *)adView
                    placementID:(NSString *)placementID
                          extra:(NSDictionary *)extra;

@optional

/// Native video ad started playing
- (void)didStartPlayingVideoInAdView:(ATNativeADView *)adView
                        placementID:(NSString *)placementID
                              extra:(NSDictionary *)extra;

/// Native video ad finished playing
- (void)didEndPlayingVideoInAdView:(ATNativeADView *)adView
                      placementID:(NSString *)placementID
                            extra:(NSDictionary *)extra;

/// Native ad close button clicked
- (void)didTapCloseButtonInAdView:(ATNativeADView *)adView
                     placementID:(NSString *)placementID
                           extra:(NSDictionary *)extra;

/// Native ad detail page dismissed
/// v5.7.47+
- (void)didCloseDetailInAdView:(ATNativeADView *)adView
                  placementID:(NSString *)placementID
                        extra:(NSDictionary *)extra;

/// Whether the click jump on the native ad is in Deeplink form
/// Currently only for TopOn Adx Ads
- (void)didDeepLinkOrJumpInAdView:(ATNativeADView *)adView
                     placementID:(NSString *)placementID
                           extra:(NSDictionary *)extra
                          result:(BOOL)success;

/// Native ad enters fullscreen video status, only applicable to Nend
- (void)didEnterFullScreenVideoInAdView:(ATNativeADView *)adView
                           placementID:(NSString *)placementID
                                 extra:(NSDictionary *)extra;

/// Native ad exits fullscreen video status, only applicable to Nend
- (void)didExitFullScreenVideoInAdView:(ATNativeADView *)adView
                          placementID:(NSString *)placementID
                                extra:(NSDictionary *)extra;

@end
```
