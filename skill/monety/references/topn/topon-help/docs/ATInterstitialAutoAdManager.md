---
title: "ATInterstitialAutoAdManager"
source: "https://help.toponad.net/cn/docs/ATInterstitialAutoAdManager"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATInterstitialAutoAdManager"]
content_sha256: "005312255b98c77931f7ea72b4d2ef752ea2e3dc21cf3b9dd7035cc657c449d4"
knowledge_role: "reference_only"
has_article_body: true
---

# ATInterstitialAutoAdManager

> 全自动加载插屏广告管理类，提供开启全自动加载、移除全自动加载、设置本地参数、检查就绪状态、展示广告、场景统计功能。

复制代码

```
@interface ATInterstitialAutoAdManager : NSObject

/// 广告加载代理
@property(nonatomic, weak) id<ATAdLoadingDelegate> delegate;

/// 获取单例对象
+ (instancetype)sharedInstance;

/// 添加自动加载的广告位ID数组
- (void)addAutoLoadAdPlacementIDArray:(NSArray <NSString *> *)placementIDArray;
/// 移除自动加载的广告位ID数组
- (void)removeAutoLoadAdPlacementIDArray:(NSArray<NSString *> *)placementIDArray;

/// 设置特定广告位的本地配置信息
- (void)setLocalExtra:(NSDictionary * _Nullable)extra placementID:(NSString *)placementID;
/// 检查指定广告位的插屏广告是否准备就绪
- (BOOL)autoLoadInterstitialReadyForPlacementID:(NSString *)placementID;
/// 获取指定广告位的有效广告缓存信息
- (NSArray<NSDictionary *> *)checkValidAdCachesWithPlacementID:(NSString *)placementID;
/// 检查指定广告位的插屏广告加载状态
- (ATCheckLoadModel *)checkInterstitialLoadStatusForPlacementID:(NSString *)placementID;

/// 展示自动加载的插屏广告
- (void)showAutoLoadInterstitialWithPlacementID:(NSString*)placementID inViewController:(UIViewController*)viewController delegate:(id<ATInterstitialDelegate>)delegate;
/// 在指定场景展示自动加载的插屏广告
- (void)showAutoLoadInterstitialWithPlacementID:(NSString*)placementID scene:(NSString* _Nullable)scene inViewController:(UIViewController*)viewController delegate:(id<ATInterstitialDelegate>)delegate;

/// 进入广告场景
- (void)entryAdScenarioWithPlacementID:(NSString *)placementID scenarioID:(NSString *)scenarioID;

@end
```
