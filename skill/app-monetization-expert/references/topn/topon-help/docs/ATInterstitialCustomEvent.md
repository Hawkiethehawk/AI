---
title: "ATInterstitialCustomEvent"
source: "https://help.toponad.net/cn/docs/ATInterstitialCustomEvent"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATInterstitialCustomEvent"]
content_sha256: "6d49fae79535072456515bdc899c163fd87ec5b85f30c1a0df849572b1f921ed"
knowledge_role: "reference_only"
has_article_body: true
---

# ATInterstitialCustomEvent

复制代码

```
@interface ATInterstitialCustomEvent : ATAdCustomEvent

/// 广告加载完成时回调给开发者
/// @param interstitialAd - 广告对象
/// @param adExtra - 额外数据
- (void)trackInterstitialAdLoaded:(id)interstitialAd adExtra:(NSDictionary *_Nullable)adExtra;

/// 广告渲染成功（素材下载成功）
- (void)trackInterstitialAdRenderSuccess:(id)interstitialAd adExtra:(NSDictionary *_Nullable)adExtra;

/// 广告数据加载成功
- (void)trackInterstitialAdDataLoadSuccess:(id)interstitialAd adExtra:(NSDictionary *_Nullable)adExtra;

/// 广告加载失败时回调给开发者
/// @param error - 错误信息
- (void)trackInterstitialAdLoadFailed:(NSError *)error;

/// 广告展示时回调给开发者
- (void)trackInterstitialAdShow;

/// 广告展示失败时回调给开发者
/// @param error - 展示错误信息
- (void)trackInterstitialAdShowFailed:(NSError *)error;

/// 播放开始时回调给开发者
- (void)trackInterstitialAdVideoStart;

/// 播放结束时回调给开发者
- (void)trackInterstitialAdVideoEnd;

/// 播放失败时回调给开发者
/// @param error - 播放错误信息
- (void)trackInterstitialAdDidFailToPlayVideo:(NSError *)error;

- (void)trackInterstitialAdDidFailToPlayVideo:(NSError *)error extra:(NSDictionary *_Nullable)extraDic;

/// 广告被点击时回调给开发者
- (void)trackInterstitialAdClick;

/// 广告被点击时回调给开发者
- (void)trackInterstitialAdClickWithClickType:(ATOfferClickAdType)clickType;

/// 广告关闭时回调给开发者
- (void)trackInterstitialAdClose:(NSDictionary *_Nullable)extra;

/// 广告落地页关闭时回调给开发者
- (void)trackInterstitialAdLPClose:(NSDictionary *_Nullable)extra;

/// 广告点击跳转是否以 Deeplink 形式
/// @param success - 成功状态
- (void)trackInterstitialAdDeeplinkOrJumpResult:(BOOL)success;

- (ATNativeADSourceType)adSourceType;

- (instancetype)initWithInfo:(NSDictionary *)serverInfo localInfo:(NSDictionary *)localInfo;

@property (nonatomic, readonly) NSString *unitID;
@property (nonatomic, assign) NSInteger priorityIndex;
@property (nonatomic, strong) id _Nullable protectLifeCycleObject;
@property (nonatomic, strong, nullable) ATInterstitial *interstitial;
@property (nonatomic, weak) id<ATInterstitialDelegate> delegate;

@end
```
