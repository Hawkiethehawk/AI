---
title: "ATSplashCustomEvent"
source: "https://help.toponad.net/cn/docs/ATSplashCustomEvent"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATSplashCustomEvent"]
content_sha256: "370c8af70719b3c283f1c94dfbfe2c52b74f42283b35a1244ac091fbdddf3426"
knowledge_role: "reference_only"
has_article_body: true
---

# ATSplashCustomEvent

复制代码

```
@interface ATSplashCustomEvent : ATAdCustomEvent

@property (nonatomic, weak) id<ATSplashDelegate> delegate;
@property (nonatomic, strong, nullable) ATSplash *splash;
@property (nonatomic, readonly) NSString *unitID;
@property (nonatomic, assign) NSInteger priorityIndex;
@property (nonatomic, strong, nullable) UIView *containerBgView;

- (instancetype)initWithInfo:(NSDictionary *)serverInfo
                   localInfo:(NSDictionary *)localInfo;

- (NSDictionary *)delegateExtra;
- (void)trackShowWithoutWaterfall;
- (void)trackClickWithoutWaterfall;

/// 广告关闭时回调给开发者
- (void)trackSplashAdClosed:(nullable NSDictionary *)extra;

/// 广告即将关闭时回调给开发者
- (void)trackSplashAdWillClosed:(NSDictionary *)extra;

/// 广告加载完成时回调给开发者
/// @param splashAd - 开屏广告对象
/// v5.7.05 +
- (void)trackSplashAdLoaded:(id _Nullable)splashAd;

/// 广告加载完成时回调给开发者
/// @param splashAd - 开屏广告对象
/// @param adExtra - 额外数据
/// v5.7.06 +
- (void)trackSplashAdLoaded:(id _Nullable)splashAd adExtra:(NSDictionary * _Nullable)adExtra;

/// 广告渲染成功（素材下载成功）
- (void)trackSplashAdRenderSuccess:(id)splashAd adExtra:(NSDictionary *_Nullable)adExtra;

/// 广告数据加载成功
- (void)trackSplashAdDataLoadSuccess:(id)splashAd adExtra:(NSDictionary *_Nullable)adExtra;

/// 广告展示时回调给开发者
- (void)trackSplashAdShow;

/// 广告被点击时回调给开发者
- (void)trackSplashAdClick;

/// 广告被点击时回调给开发者
- (void)trackSplashAdClickWithClickType:(ATOfferClickAdType)clickType;

/// 广告加载失败时回调给开发者
/// @param error - 错误信息
- (void)trackSplashAdLoadFailed:(NSError *)error;

/// 广告缩小视图被点击时回调给开发者
- (void)trackSplashAdZoomOutViewClick;

/// 广告缩小视图被关闭时回调给开发者
- (void)trackSplashAdZoomOutViewClosed;

/// 广告点击跳转是否以 Deeplink 形式
/// @param success - 成功状态
- (void)trackSplashAdDeeplinkOrJumpResult:(BOOL)success;

- (void)trackSplashAdDetailWillShow;

/// v5.7.53+
- (void)trackSplashAdDetailClosed;
- (void)trackSplashAdShowFailed:(NSError *)error;
- (void)trackSplashAdShowFailed:(NSError *)error extra:(NSDictionary *)extraDic;

/// v5.7.61+
/// 自定义跳过按钮和倒计时相关参数传入时的回调
/// @param countdown - 当前倒计时时间
- (void)trackSplashAdCountdownTime:(NSInteger)countdown;

- (void)startCountdown:(NSDictionary *)localInfo
        countdownBlock:(void(^)(NSInteger time))block;

- (BOOL)isPauseTimer;

@property (nonatomic, strong) id _Nullable protectLifeCycleObject;

@end
```
