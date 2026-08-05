---
title: "ATNativeADCustomEvent"
source: "https://help.toponad.net/cn/docs/ATNativeADCustomEvent"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATNativeADCustomEvent"]
content_sha256: "17e1575caa6fd21cec822afe39a1337a8a300f6e382870faf0001d56585e8f58"
knowledge_role: "reference_only"
has_article_body: true
---

# ATNativeADCustomEvent

复制代码

```
@interface ATNativeADCustomEvent : ATAdCustomEvent

/// 广告加载完成时回调给开发者
/// @param assets - 原生广告资源
- (void)trackNativeAdLoaded:(NSArray *)assets;

/// 广告加载失败时回调给开发者
/// @param error - 错误信息
- (void)trackNativeAdLoadFailed:(NSError *)error;

- (void)didAttachMediaView;
- (void)invalidateUsedAdInfo;
- (void)willDetachOffer:(ATNativeADCache *)offer fromAdView:(ATNativeADView *)adView;

/// 广告展示时回调给开发者
/// @param refresh - 是否由广告刷新触发展示
- (void)trackNativeAdShow:(BOOL)refresh;

/// 广告被点击时回调给开发者
- (void)trackNativeAdClick;

- (void)trackNativeAdVideoStart;
- (void)trackNativeAdVideoEnd;

/// 广告关闭时回调给开发者
- (void)trackNativeAdClosed;

- (void)trackNativeAdImpression;
- (void)trackNativeAdDeeplinkOrJumpResult:(BOOL)success;

// v5.7.47
- (void)trackNativeAdCloseDetail;

/// 如果返回 YES，则在发送 “show” 嵌入点时，将同时发送 “impression” 嵌入点。否则，不发送。横幅广告 (ATBannerCustomEvent.h) 同样适用。
- (BOOL)sendImpressionTrackingIfNeed;

/// 仅适用于 adx、onlineApi、myoffer、directOffer
- (NSTimeInterval)getNativeAdViewMonitoringShowTime;

- (BOOL)isAutoClickdSwitch;
- (CGFloat)popupReminderDuration;
- (CGFloat)autoClickdDuration;
- (id)getCustomOfferModel;
- (id)getCustomOfferSetting;

- (BOOL)isAllowMraidWebPreLoad;
- (BOOL)isMraidAd;
- (NSString *)getNativeAdViewOfferIdentifier;
- (void)sendMraidAdRenderSuccessEvent;

- (NSDictionary *)delegateExtra;
- (NSMutableDictionary *)delegateExtraWithNativeAD:(ATNativeADCache *)cache;
- (instancetype)initWithInfo:(NSDictionary *)serverInfo
                   localInfo:(NSDictionary *)localInfo;

- (ATNativeADSourceType)sourceType;

@property (atomic, copy) void(^requestCompletionBlock)(NSArray<NSDictionary *> * _Nullable assets, NSError * _Nullable error);
@property (nonatomic, weak) ATNativeADView *adView;
@property (nonatomic) NSInteger requestNumber;
/**
 * 无论失败或成功，请求被视为完成。
 */
@property(nonatomic) NSInteger numberOfFinishedRequests;
@property(nonatomic, readonly) NSMutableArray<NSDictionary *>* assets;

@end
```
