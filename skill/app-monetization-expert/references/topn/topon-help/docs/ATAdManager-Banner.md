---
title: "ATAdManager (Banner)"
source: "https://help.toponad.net/cn/docs/ATAdManager-Banner"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Category", "ATAdManager (Banner)"]
content_sha256: "b9dfab469821c363cb388148e5f25f28a0c3bc79f3398a968e23937017a57d16"
knowledge_role: "reference_only"
has_article_body: true
---

# ATAdManager (Banner)

> 针对横幅广告的操作拓展，提供广告展示、检查缓存、检查广告是否就绪、场景统计等功能，其中有Extra键的定义。

复制代码

```
typedef void(^NativeMixBannerViewBlock)(ATNativeBannerView *nativeBannerView);

// 仅支持 Nend banner
extern NSString *const kATBannerLoadingExtraParameters;
extern NSString *const kATAdLoadingExtraBannerAdSizeKey;  // 默认大小为 320 * 50
extern NSString *const kATAdLoadingExtraBannerSizeAdjustKey;  // 当前仅支持 Nend

extern NSString *const kATAdLoadingExtraAdmobBannerSizeKey;  // Admob 自适应宽度
extern NSString *const kATAdLoadingExtraAdmobAdSizeFlagsKey;  // Admob 广告尺寸标记

@class ATBannerView;

@interface ATAdManager (Banner)

/// 检查 Banner 广告是否准备就绪
/// v5.7.06+
- (BOOL)bannerAdReadyForPlacementID:(NSString *)placementID;

/// 检查 Banner 广告是否准备就绪
/// @param send - 是否发送跟踪事件
- (BOOL)bannerAdReadyForPlacementID:(NSString *)placementID
                             sendTK:(BOOL)send;

/// 获取 Banner 广告视图
/// 注意：如果广告未准备就绪将返回 nil
- (nullable ATBannerView *)retrieveBannerViewForPlacementID:(NSString *)placementID;

/// 获取 Banner 广告视图
/// @param placementID - TopOn 广告位ID
/// @param extra - 本地配置参数
/// 注意：如果广告未准备就绪将返回 nil
- (nullable ATBannerView *)retrieveBannerViewForPlacementID:(NSString *)placementID
                                                      extra:(NSDictionary *)extra DEPRECATED_ATTRIBUTE;

/// 获取 Banner 广告视图
/// @param placementID - TopOn 广告位ID
/// @param scene - 场景ID
/// 注意：如果广告未准备就绪将返回 nil
- (nullable ATBannerView *)retrieveBannerViewForPlacementID:(NSString *)placementID
                                                      scene:(NSString *)scene;

- (nullable ATBannerView *)retrieveBannerViewForPlacementID:(NSString *)placementID
                                                     config:(ATShowConfig *)config;

/// 获取 Banner 广告视图
/// @param placementID - TopOn 广告位ID
/// @param scene - 场景ID
/// 注意：如果广告未准备就绪将返回 nil
- (nullable ATBannerView *)retrieveBannerViewForPlacementID:(NSString *)placementID
                                                      scene:(NSString *)scene
                                   nativeMixBannerViewBlock:(nullable NativeMixBannerViewBlock)nativeMixBannerViewBlock;

- (nullable ATBannerView *)retrieveBannerViewForPlacementID:(NSString *)placementID
                                                     config:(ATShowConfig *)config
                                   nativeMixBannerViewBlock:(nullable NativeMixBannerViewBlock)nativeMixBannerViewBlock;

/// 获取当前广告位的状态对象 ATCheckLoadModel
- (ATCheckLoadModel *)checkBannerLoadStatusForPlacementID:(NSString *)placementID;

/// 查询广告位的所有缓存信息
- (nullable NSArray<NSDictionary *> *)getBannerValidAdsForPlacementID:(NSString *)placementID;

/// 在业务场景中录入当前广告位缓存状态统计
/// @param scene - 广告场景
/// v6.2.51+
- (void)entryBannerScenarioWithPlacementID:(NSString *)placementID scene:(NSString *)scene;

@end
```
