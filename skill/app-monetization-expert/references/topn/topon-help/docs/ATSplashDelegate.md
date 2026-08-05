---
title: "ATSplashDelegate"
source: "https://help.toponad.net/cn/docs/ATSplashDelegate"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Protocol", "ATSplashDelegate"]
content_sha256: "f2f0a7dd2bcef6ce34cdf2651fb1d57b2632cbbc571b697b40664079f193240f"
knowledge_role: "reference_only"
has_article_body: true
---

# ATSplashDelegate

> 关于部分代理方法中的extra参数，您可以[点击这里](https://help.toponad.com/cn/docs/uECwtr)查看详情。

复制代码

```
extern NSString *const kATSplashDelegateExtraNetworkIDKey; // Network Firm Id of Splash
extern NSString *const kATSplashDelegateExtraAdSourceIDKey; // ad source ID of Splash
extern NSString *const kATSplashDelegateExtraAdSourceIsHeaderBidding; // Whether the ad source is head bidding,1: yes, 2: no
extern NSString *const kATSplashDelegateExtraPrice; // Get Estimate eCPM
extern NSString *const kATSplashDelegateExtraPriority; // the sort of the current Splash ad source in WaterFall

@protocol ATSplashDelegate<ATAdLoadingDelegate>

/// Splash ad displayed successfully
- (void)splashDidShowForPlacementID:(NSString *)placementID
                              extra:(NSDictionary *)extra;

/// Splash ad click
- (void)splashDidClickForPlacementID:(NSString *)placementID
                               extra:(NSDictionary *)extra;

/// Splash ad closed
- (void)splashDidCloseForPlacementID:(NSString *)placementID
                               extra:(NSDictionary *)extra;

@optional

/// Splash ad will closed
- (void)splashWillCloseForPlacementID:(NSString *)placementID
                               extra:(NSDictionary *)extra;

/// Callback when the splash ad is loaded successfully
/// @param isTimeout whether timeout
/// v 5.7.73
- (void)didFinishLoadingSplashADWithPlacementID:(NSString *)placementID
                                      isTimeout:(BOOL)isTimeout;

/// Splash ad loading timeout callback
/// v 5.7.73
- (void)didTimeoutLoadingSplashADWithPlacementID:(NSString *)placementID;

/// Splash ad failed to display
/// currently supports Pangle, Guangdiantong and Baidu
- (void)splashDidShowFailedForPlacementID:(NSString *)placementID
                                    error:(NSError *)error
                                    extra:(NSDictionary *)extra;

///  Whether the click jump of Splash ad is in the form of Deeplink
/// note: only suport TopOn Adx ad
- (void)splashDeepLinkOrJumpForPlacementID:(NSString *)placementID
                                     extra:(NSDictionary *)extra
                                    result:(BOOL)success;

///  Splash ad closes details page
- (void)splashDetailDidClosedForPlacementID:(NSString *)placementID
                                      extra:(NSDictionary *)extra;

///  Splash ad closes details show
- (void)splashDetailWillShowForPlacementID:(NSString *)placementID
                                      extra:(NSDictionary *)extra;

/// Called when splash zoomout view did click
/// note: only suport Pangle splash zoomout view and the Tencent splash V+ ad
- (void)splashZoomOutViewDidClickForPlacementID:(NSString *)placementID
                                          extra:(NSDictionary *)extra;

/// Called when splash zoomout view did close
/// note: only suport Pangle splash zoomout view and the Tencent splash V+ ad
- (void)splashZoomOutViewDidCloseForPlacementID:(NSString *)placementID
                                          extra:(NSDictionary *)extra;

/// This callback is triggered when the skip button is customized.
/// note: only suport TopOn MyOffer, TopOn Adx and TopOn OnlineApi
/// 5.7.61+
- (void)splashCountdownTime:(NSInteger)countdown
             forPlacementID:(NSString *)placementID
                      extra:(NSDictionary *)extra;

@end
```
