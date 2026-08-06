---
title: "ATNativeADDelegate"
source: "https://help.toponad.net/cn/docs/ATNativeADDelegate"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Protocol", "ATNativeADDelegate"]
content_sha256: "745bcc7fea8a222bc75ce7757a813497d6690fc132a43a735ea5df4a7e541b18"
knowledge_role: "reference_only"
has_article_body: true
---

# ATNativeADDelegate

> 关于部分代理方法中的extra参数，您可以[点击这里](https://help.toponad.com/cn/docs/uECwtr)查看详情。

复制代码

```
extern NSString *const kATNativeDelegateExtraNetworkIDKey; // 原生广告的网络公司 ID （Firm ID）
extern NSString *const kATNativeDelegateExtraAdSourceIDKey; // 原生广告的广告源 ID
extern NSString *const kATNativeDelegateExtraAdSourceIsHeaderBidding; // 广告源是否是头部竞价，1: 是, 2: 否
extern NSString *const kATNativeDelegateExtraPrice; // 获取预估的 eCPM
extern NSString *const kATNativeDelegateExtraPriority; // 当前原生广告源在瀑布流中的排序

@protocol ATNativeADDelegate<ATAdLoadingDelegate>

/// 原生广告展示成功
- (void)didShowNativeAdInAdView:(ATNativeADView *)adView
                    placementID:(NSString *)placementID
                          extra:(NSDictionary *)extra;

/// 原生广告点击
- (void)didClickNativeAdInAdView:(ATNativeADView *)adView
                     placementID:(NSString *)placementID
                           extra:(NSDictionary *)extra;

@optional

/// 原生视频广告开始播放
- (void)didStartPlayingVideoInAdView:(ATNativeADView *)adView
                         placementID:(NSString *)placementID
                               extra:(NSDictionary *)extra;

/// 原生视频广告结束播放
- (void)didEndPlayingVideoInAdView:(ATNativeADView *)adView
                       placementID:(NSString *)placementID
                             extra:(NSDictionary *)extra;

/// 原生广告关闭按钮点击
- (void)didTapCloseButtonInAdView:(ATNativeADView *)adView
                      placementID:(NSString *)placementID
                            extra:(NSDictionary *)extra;

/// 原生广告点击关闭详情页
/// v5.7.47+
- (void)didCloseDetailInAdView:(ATNativeADView *)adView
                   placementID:(NSString *)placementID
                         extra:(NSDictionary *)extra;

/// 原生广告点击跳转是否是 Deeplink 形式
/// 目前仅对 TopOn Adx 广告返回
- (void)didDeepLinkOrJumpInAdView:(ATNativeADView *)adView
                      placementID:(NSString *)placementID
                            extra:(NSDictionary *)extra
                           result:(BOOL)success;

/// 原生广告进入全屏视频，仅适用于 Nend
- (void)didEnterFullScreenVideoInAdView:(ATNativeADView *)adView
                            placementID:(NSString *)placementID
                                  extra:(NSDictionary *)extra;

/// 原生广告退出全屏视频，仅适用于 Nend
- (void)didExitFullScreenVideoInAdView:(ATNativeADView *)adView
                           placementID:(NSString *)placementID
                                 extra:(NSDictionary *)extra;

@end
```
