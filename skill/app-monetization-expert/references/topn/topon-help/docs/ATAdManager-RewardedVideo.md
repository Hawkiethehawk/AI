---
title: "ATAdManager (RewardedVideo)"
source: "https://help.toponad.net/cn/docs/ATAdManager-RewardedVideo"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Category", "ATAdManager (RewardedVideo)"]
content_sha256: "b479c85bbb66c430f5337c874e740d831602f072b001c4986090e55cb2ce9cdb"
knowledge_role: "reference_only"
has_article_body: true
---

# ATAdManager (RewardedVideo)

> 针对激励视频广告的操作拓展，提供广告展示、检查缓存、检查广告是否就绪、场景统计等功能，其中有Extra键的定义。

复制代码

```
/*
 * 第三方额外数据
 */
extern NSString *const kATAdLoadingExtraKeywordKey;
extern NSString *const kATAdLoadingExtraUserDataKeywordKey;
extern NSString *const kATAdLoadingExtraUserIDKey;
extern NSString *const kATAdLoadingExtraLocationKey;
extern NSString *const kATAdLoadingExtraRewardNameKey;
extern NSString *const kATAdLoadingExtraRewardAmountKey;

// Klevin SDK
extern NSString *const kATRewardedVideoKlevinRewardTimeKey;
extern NSString *const kATRewardedVideoKlevinRewardTriggerKey;

@interface ATAdManager (RewardedVideo)

/// 展示该广告位的激励视频广告
/// @param placementID - TopOn的广告位ID
/// @param viewController - 展示广告的窗口
/// @param delegate - 代理对象
- (void)showRewardedVideoWithPlacementID:(NSString *)placementID
                        inViewController:(UIViewController *)viewController
                                delegate:(id<ATRewardedVideoDelegate>)delegate;

- (void)showRewardedVideoWithPlacementID:(NSString *)placementID
                                  config:(ATShowConfig *)config
                        inViewController:(UIViewController *)viewController
                                delegate:(id<ATRewardedVideoDelegate>)delegate;

/// 展示该广告位的激励视频广告
/// @param placementID - TopOn的广告位ID
/// @param scene - 场景ID
/// @param viewController - 展示广告的窗口
/// @param delegate - 代理对象
- (void)showRewardedVideoWithPlacementID:(NSString *)placementID
                                   scene:(NSString *)scene
                        inViewController:(UIViewController *)viewController
                                delegate:(id<ATRewardedVideoDelegate>)delegate;

/// 检查激励视频广告是否准备就绪
/// v5.7.06+
- (BOOL)rewardedVideoReadyForPlacementID:(NSString *)placementID;

/// 获取当前广告位的状态对象ATCheckLoadModel
- (nullable ATCheckLoadModel *)checkRewardedVideoLoadStatusForPlacementID:(NSString *)placementID;

/// 查询广告位的所有缓存信息
- (nullable NSArray<NSDictionary *> *)getRewardedVideoValidAdsForPlacementID:(NSString *)placementID;

/// 在业务场景中进入当前广告位的缓存状态统计
/// @param scene - 广告场景
/// v5.7.91+
- (void)entryRewardedVideoScenarioWithPlacementID:(NSString *)placementID
                                            scene:(NSString *)scene;

@end
```
