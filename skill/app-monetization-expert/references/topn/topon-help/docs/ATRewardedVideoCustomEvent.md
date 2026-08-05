---
title: "ATRewardedVideoCustomEvent"
source: "https://help.toponad.net/cn/docs/ATRewardedVideoCustomEvent"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATRewardedVideoCustomEvent"]
content_sha256: "978274ec7f12321c9816d0b8d696253311c4016855a2ee7370615a4f1492ffda"
knowledge_role: "reference_only"
has_article_body: true
---

# ATRewardedVideoCustomEvent

复制代码

```
@interface ATRewardedVideoCustomEvent : ATAdCustomEvent

/// 播放失败时
/// @param error - 播放错误信息
- (void)trackRewardedVideoAdPlayEventWithError:(NSError *)error;

/// 广告关闭时
/// @param rewarded - 是否给予奖励
- (void)trackRewardedVideoAdCloseRewarded:(BOOL)rewarded __attribute__((deprecated("已废弃，请使用 `trackRewardedVideoAdCloseRewarded:extra:`")));

- (void)trackRewardedVideoAdCloseRewarded:(BOOL)rewarded extra:(NSDictionary *)extra;

/// 播放结束时
- (void)trackRewardedVideoAdVideoEnd;

/// 广告被点击时
- (void)trackRewardedVideoAdClick;

/// 广告被点击时
- (void)trackRewardedVideoAdClickWithClickType:(ATOfferClickAdType)clickType;

/// 播放开始时
- (void)trackRewardedVideoAdVideoStart;

- (void)trackRewardedVideoAdShow;

/// 广告加载失败时
/// @param error - 错误信息
- (void)trackRewardedVideoAdLoadFailed:(NSError *)error;

- (void)trackRewardedVideoAdPlayEventWithError:(NSError *)error extra:(NSDictionary *)extraDic;

/// 广告加载完成时
/// @param adObject - 广告对象
/// @param adExtra - 额外数据
- (void)trackRewardedVideoAdLoaded:(id)adObject adExtra:(NSDictionary *_Nullable)adExtra;

/// 广告渲染成功（素材下载成功）
- (void)trackRewardedVideoAdRenderSuccess:(id)adObject adExtra:(NSDictionary *_Nullable)adExtra;

/// 广告数据加载成功
- (void)trackRewardedVideoAdDataLoadSuccess:(id)adObject adExtra:(NSDictionary *_Nullable)adExtra;

/// 获得奖励时
- (void)trackRewardedVideoAdRewarded;

/// 广告点击跳转是否以 Deeplink 形式
/// @param success - 成功状态
- (void)trackRewardedVideoAdDeeplinkOrJumpResult:(BOOL)success;

- (instancetype)initWithInfo:(NSDictionary *)serverInfo localInfo:(NSDictionary *)localInfo;

@property (nonatomic) NSString *userID;
@property (nonatomic, readonly) NSString *unitID;
@property (nonatomic, assign) NSInteger priorityIndex;
@property (nonatomic, strong) id _Nullable protectLifeCycleObject;
@property (nonatomic, strong, nullable) ATRewardedVideo *rewardedVideo;
@property (nonatomic, weak) id<ATRewardedVideoDelegate> delegate;

@end
```
