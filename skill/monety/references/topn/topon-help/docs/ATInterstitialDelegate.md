---
title: "ATInterstitialDelegate"
source: "https://help.toponad.net/cn/docs/ATInterstitialDelegate"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Protocol", "ATInterstitialDelegate"]
content_sha256: "6934a382996536c73dbe5abebfbbec6e29a4c7b2a67edf14e5d46ccf7e60be3c"
knowledge_role: "reference_only"
has_article_body: true
---

# ATInterstitialDelegate

> 关于部分代理方法中的extra参数，您可以[点击这里](https://help.toponad.com/cn/docs/uECwtr)查看详情。

复制代码

```
extern NSString *const kATInterstitialDelegateExtraNetworkIDKey; // Network Firm Id of Interstitial
extern NSString *const kATInterstitialDelegateExtraAdSourceIDKey; // ad source ID of Interstitial
extern NSString *const kATInterstitialDelegateExtraAdSourceIsHeaderBidding; // Whether the ad source is head bidding,1: yes, 2: no
extern NSString *const kATInterstitialDelegateExtraPrice; // Get Estimate eCPM
extern NSString *const kATInterstitialDelegateExtraPriority; // the sort of the current Interstitial ad source in WaterFall

@protocol ATInterstitialDelegate<ATAdLoadingDelegate>

/// Interstitial ad displayed successfully
- (void)interstitialDidShowForPlacementID:(NSString *)placementID
                                    extra:(NSDictionary *)extra;

/// Interstitial ad clicked
- (void)interstitialDidClickForPlacementID:(NSString *)placementID
                                     extra:(NSDictionary *)extra;

/// Interstitial ad closed
- (void)interstitialDidCloseForPlacementID:(NSString *)placementID
                                     extra:(NSDictionary *)extra;

@optional

/// Interstitial ad display failed
- (void)interstitialFailedToShowForPlacementID:(NSString *)placementID
                                         error:(NSError*)error
                                         extra:(NSDictionary *)extra;

/// Interstitial video ad playback start
- (void)interstitialDidStartPlayingVideoForPlacementID:(NSString *)placementID
                                                 extra:(NSDictionary *)extra;

/// Interstitial playback end
- (void)interstitialDidEndPlayingVideoForPlacementID:(NSString *)placementID
                                               extra:(NSDictionary *)extra;

/// Interstitial playback fail
- (void)interstitialDidFailToPlayVideoForPlacementID:(NSString *)placementID
                                               error:(NSError*)error
                                               extra:(NSDictionary *)extra;

/// Whether the click jump on the interstitial advertisement is in the form of Deeplink
/// currently only returns for TopOn Adx advertisements
- (void)interstitialDeepLinkOrJumpForPlacementID:(NSString *)placementID
                                           extra:(NSDictionary *)extra
                                          result:(BOOL)success;

/// Interstitial ad landing page closed
/// support network: [Baidu][GDT][KS][CSJ]
- (void)interstitialDidLPCloseForPlacementID:(NSString *)placementID
                                       extra:(NSDictionary *)extra;

@end
```
