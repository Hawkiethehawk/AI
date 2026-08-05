---
title: "ATInterstitialDelegate"
source: "https://help.toponad.net/cn/docs/ATInterstitialDelegate-EVh0"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-08"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Protocol", "ATInterstitialDelegate"]
content_sha256: "8a352cb1474423462b831a24bfc56e4d225335089e2f3304ac22156ced2318a6"
knowledge_role: "reference_only"
has_article_body: true
---

# ATInterstitialDelegate

复制代码

```
@protocol ATInterstitialDelegate<ATAdLoadingDelegate>

/// Interstitial ad displayed successfully
- (void)interstitialDidShowForPlacementID:(NSString *)placementID
                                    extra:(NSDictionary *)extra;

/// Interstitial ad clicked
- (void)interstitialDidClickForPlacementID:(NSString *)placementID
                                     extra:(NSDictionary *)extra;

/// Interstitial ad dismissed
- (void)interstitialDidCloseForPlacementID:(NSString *)placementID
                                     extra:(NSDictionary *)extra;

@optional

/// Interstitial ad display failed
- (void)interstitialFailedToShowForPlacementID:(NSString *)placementID
                                         error:(NSError *)error
                                         extra:(NSDictionary *)extra;

/// Interstitial video ad playback started
- (void)interstitialDidStartPlayingVideoForPlacementID:(NSString *)placementID
                                                 extra:(NSDictionary *)extra;

/// Interstitial video ad playback finished
- (void)interstitialDidEndPlayingVideoForPlacementID:(NSString *)placementID
                                               extra:(NSDictionary *)extra;

/// Interstitial video ad playback failed
- (void)interstitialDidFailToPlayVideoForPlacementID:(NSString *)placementID
                                               error:(NSError *)error
                                               extra:(NSDictionary *)extra;

/// Whether the click jump on the Interstitial ad is in Deeplink form
/// Currently only applicable to TopOn Adx Ads
- (void)interstitialDeepLinkOrJumpForPlacementID:(NSString *)placementID
                                           extra:(NSDictionary *)extra
                                          result:(BOOL)success;

/// Interstitial ad landing page closed
/// Supported networks: [Baidu][GDT][Kuaishou][CSJ]
- (void)interstitialDidLPCloseForPlacementID:(NSString *)placementID
                                       extra:(NSDictionary *)extra;

@end
```
