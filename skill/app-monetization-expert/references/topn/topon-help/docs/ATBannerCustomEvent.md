---
title: "ATBannerCustomEvent"
source: "https://help.toponad.net/cn/docs/ATBannerCustomEvent"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATBannerCustomEvent"]
content_sha256: "e71fda313988a8652e65d578965c5d81473ed2affe791b8ac3d8b26e645cb74b"
knowledge_role: "reference_only"
has_article_body: true
---

# ATBannerCustomEvent

复制代码

```
@interface ATBannerCustomEvent : ATAdCustomEvent

/// 广告被点击时回调给开发者
- (void)trackBannerAdClick;

/// 广告展示时回调给开发者
- (void)trackBannerAdImpression;

/// 广告关闭时回调给开发者
- (void)trackBannerAdClosed;

/// 广告详情页关闭时回调给开发者
- (void)trackBannerAdDetailClosed;

/// 广告加载完成时回调给开发者
/// @param bannerView - 横幅广告视图对象
/// @param adExtra - 额外数据
- (void)trackBannerAdLoaded:(id)bannerView adExtra:(NSDictionary * _Nullable)adExtra;

/// 广告渲染成功（素材下载成功）
/// @param bannerView - 横幅广告视图对象
/// @param adExtra - 额外数据
- (void)trackBannerAdRenderSuccess:(id)bannerView adExtra:(NSDictionary *_Nullable)adExtra;

/// 广告数据加载成功
/// @param bannerView - 横幅广告视图对象
/// @param adExtra - 额外数据
- (void)trackBannerAdDataLoadSuccess:(id)bannerView adExtra:(NSDictionary *_Nullable)adExtra;

/// 广告加载失败时回调给开发者
/// @param error - 错误信息
- (void)trackBannerAdLoadFailed:(NSError *)error;

/// 广告点击跳转是否以 Deeplink 形式
/// @param success - 成功状态
- (void)trackBannerAdDeeplinkOrJumpResult:(BOOL)success;

- (NSDictionary *)delegateExtra;

- (instancetype)initWithInfo:(NSDictionary *)serverInfo
                   localInfo:(NSDictionary *)localInfo;

- (void)cleanup;
- (void)removedFromWindow;

/// 某些广告 SDK 在广告展示后不会回调。重写该方法并返回 'YES'，将发送展示追踪。同样适用于原生广告 (ATNativeADCustomEvent)。
- (BOOL)sendImpressionTrackingIfNeed;

- (void)bannerViewToggle;

- (void)invalidateBidInfo;

- (void)destroyBanner;

// 自动点击
- (BOOL)isAutoClickdSwitch;
- (CGFloat)popupReminderDuration;
- (CGFloat)autoClickdDuration;
- (id)getCustomOfferModel;
- (id)getCustomOfferSetting;
- (ATBannerClickType)getBannerTriggerClickType;

@property (nonatomic, weak) id<ATBannerDelegate> delegate;
@property (nonatomic, weak) ATBanner *banner;
@property (nonatomic, weak) ATBannerView *bannerView;
@property (nonatomic, readonly) NSString *unitID;
@property (nonatomic, readonly) CGSize size;
@property (nonatomic, strong) NSValue *admobAdSizeValue; // 用于 AdMob
@property (nonatomic, assign) NSInteger admobAdSizeFlags; // 用于 AdMob
@property (nonatomic) NSDictionary *loadingParameters; // 用于 nend
@property (nonatomic) BOOL adjustAdSize; // 用于 nend
@property (nonatomic, assign) NSInteger priorityIndex;
@property (nonatomic, assign) ATOfferClickAdType clickType;
@property (nonatomic, strong) id _Nullable protectLifeCycleObject;

+ (UIViewController *)rootViewControllerWithPlacementID:(NSString *)placementID
                                              requestID:(NSString *)requestID;

@end
```
