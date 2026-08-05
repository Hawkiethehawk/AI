---
title: "ATRewardedVideoAutoAdManager"
source: "https://help.toponad.net/cn/docs/ATRewardedVideoAutoAdManager"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATRewardedVideoAutoAdManager"]
content_sha256: "afb3b812b5a3b05088520a75bd2eeff0cb34ea5fff714f5d3caf46f633f5a9f7"
knowledge_role: "reference_only"
has_article_body: true
---

# ATRewardedVideoAutoAdManager

> 全自动加载激励视频管理类，提供开启全自动加载、移除全自动加载、设置本地参数、检查就绪状态、展示广告、场景统计功能。

复制代码

```
@interface ATRewardedVideoAutoAdManager : NSObject

/// 广告加载代理
@property(nonatomic, weak) id<ATAdLoadingDelegate> delegate;

/// 获取单例对象
+ (instancetype)sharedInstance;

/// 添加自动加载的广告位ID数组
- (void)addAutoLoadAdPlacementIDArray:(NSArray <NSString *> *)placementIDArray;
/// 移除自动加载的广告位ID数组
- (void)removeAutoLoadAdPlacementIDArray:(NSArray<NSString *> *)placementIDArray;

/// 设置特定广告位的本地配置信息
- (void)setLocalExtra:(NSDictionary *)extra placementID:(NSString *)placementID;
/// 检查指定广告位的激励视频是否准备就绪
- (BOOL)autoLoadRewardedVideoReadyForPlacementID:(NSString *)placementID;
/// 获取指定广告位的有效广告缓存信息
- (nullable NSArray<NSDictionary *> *)checkValidAdCachesWithPlacementID:(NSString *)placementID;
/// 检查指定广告位的激励视频加载状态
- (nullable ATCheckLoadModel *)checkRewardedVideoLoadStatusForPlacementID:(NSString *)placementID;

/// 展示自动加载的激励视频广告
- (void)showAutoLoadRewardedVideoWithPlacementID:(NSString*)placementID inViewController:(UIViewController*)viewController delegate:(id<ATRewardedVideoDelegate>)delegate;
/// 在指定场景展示自动加载的激励视频广告
- (void)showAutoLoadRewardedVideoWithPlacementID:(NSString*)placementID scene:(NSString* _Nullable)scene inViewController:(UIViewController*)viewController delegate:(id<ATRewardedVideoDelegate>)delegate;

/// 进入广告场景
- (void)entryAdScenarioWithPlacementID:(NSString *)placementID scenarioID:(NSString *)scenarioID;

@end
```
