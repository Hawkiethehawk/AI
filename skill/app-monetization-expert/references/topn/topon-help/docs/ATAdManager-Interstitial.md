---
title: "ATAdManager (Interstitial)"
source: "https://help.toponad.net/cn/docs/ATAdManager-Interstitial"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Category", "ATAdManager (Interstitial)"]
content_sha256: "ad54a6c56ceebffb021bac621151d7ecfd643f57d883d57d6ccf7324b4d5edf3"
knowledge_role: "reference_only"
has_article_body: true
---

# ATAdManager (Interstitial)

> 针对插屏广告的操作拓展，提供广告展示、检查缓存、检查广告是否就绪、场景统计等功能，其中有Extra键的定义。

复制代码

```
typedef void(^NativeMixViewBlock)(ATSelfRenderingMixInterstitialView *selfRenderingMixInterstitialView);

extern NSString *const kATInterstitialExtraMediationNameKey; // 额外的中介名称键
extern NSString *const kATInterstitialExtraUserIDKey; // 额外的用户ID键
extern NSString *const kATInterstitialExtraUserFeatureKey; // 额外的用户特征键
extern NSString *const kATInterstitialExtraMuteStartPlayingFlagKey; // 额外的静音播放标志键
extern NSString *const kATInterstitialExtraFallbackFullboardBackgroundColorKey; // 额外的全屏背景颜色回退键
extern NSString *const kATInterstitialExtraAdSizeKey; // 额外的广告尺寸键，支持TT插屏广告，默认尺寸为600x600
extern NSString *const kATInterstitialExtraUsesRewardedVideo; // 使用激励视频

extern NSString *const kATInterstitialExtraAdSize600_400; // 600x400广告尺寸
extern NSString *const kATInterstitialExtraAdSize600_600; // 600x600广告尺寸
extern NSString *const kATInterstitialExtraAdSize600_900; // 600x900广告尺寸

@interface ATAdManager (Interstitial)

/// 展示插屏广告
/// @param placementID - TopOn的广告位ID
/// @param viewController - 展示广告的视图控制器
/// @param delegate - 委托对象
- (void)showInterstitialWithPlacementID:(NSString *)placementID
                       inViewController:(UIViewController *)viewController
                               delegate:(id<ATInterstitialDelegate>)delegate;

/// 展示插屏广告
/// @param placementID - TopOn的广告位ID
/// @param scene - 场景ID
/// @param viewController - 展示广告的视图控制器
/// @param delegate - 委托对象
- (void)showInterstitialWithPlacementID:(NSString *)placementID
                                  scene:(NSString *)scene
                       inViewController:(UIViewController *)viewController
                               delegate:(id<ATInterstitialDelegate>)delegate;

/// 展示插屏广告
/// @param placementID - TopOn的广告位ID
/// @param scene - 场景ID
/// @param viewController - 展示广告的视图控制器
/// @param delegate - 委托对象
/// @param nativeMixViewBlock - 混合广告视图的回调
- (void)showInterstitialWithPlacementID:(NSString *)placementID
                                  scene:(NSString *)scene
                       inViewController:(UIViewController *)viewController
                               delegate:(id<ATInterstitialDelegate>)delegate
                     nativeMixViewBlock:(nullable NativeMixViewBlock)nativeMixViewBlock;

- (void)showInterstitialWithPlacementID:(NSString *)placementID
                             showConfig:(ATShowConfig *)config
                       inViewController:(UIViewController *)viewController
                               delegate:(id<ATInterstitialDelegate>)delegate
                     nativeMixViewBlock:(nullable NativeMixViewBlock)nativeMixViewBlock;

/// 检查插屏广告是否准备好
/// v5.7.06+
- (BOOL)interstitialReadyForPlacementID:(NSString *)placementID;

/// 获取当前广告位的状态对象 ATCheckLoadModel
- (nullable ATCheckLoadModel *)checkInterstitialLoadStatusForPlacementID:(NSString *)placementID;

/// 查询广告位的所有缓存信息
/// v5.7.53+
- (nullable NSArray<NSDictionary *> *)getInterstitialValidAdsForPlacementID:(NSString *)placementID;

/// 在业务场景中进入当前广告位的缓存状态统计
/// @param scene - 广告场景
/// v5.7.91+
- (void)entryInterstitialScenarioWithPlacementID:(NSString *)placementID
                                           scene:(NSString *)scene;
@end
```
