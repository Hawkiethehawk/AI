---
title: "ATAdManager (Splash)"
source: "https://help.toponad.net/cn/docs/ATAdManager-Splash"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Category", "ATAdManager (Splash)"]
content_sha256: "5173b3d2d611b721627ca1b2408097f11ded77773f5c68a9014ccac3700e4a68"
knowledge_role: "reference_only"
has_article_body: true
---

# ATAdManager (Splash)

> 针对开屏广告的操作拓展，提供广告展示、检查缓存、检查广告是否就绪、场景统计等功能，其中有Extra键的定义。

复制代码

```
extern NSString *const kATSplashExtraCountdownKey;
extern NSString *const kATSplashExtraTolerateTimeoutKey; // 超时时长
extern NSString *const kATSplashExtraHideSkipButtonFlagKey;
extern NSString *const kATSplashExtraBackgroundImageKey;
extern NSString *const kATSplashExtraBackgroundColorKey;
extern NSString *const kATSplashExtraSkipButtonCenterKey;
extern NSString *const kATSplashExtraCustomSkipButtonKey; // 仅支持 UIButton
extern NSString *const kATSplashExtraCanClickFlagKey;
extern NSString *const kATSplashExtraShowDirectionKey; // 支持快手开屏广告，默认为垂直方向，1为水平方向
// 5.7.61+
extern NSString *const kATSplashExtraCountdownIntervalKey;

extern NSString *const kATSplashExtraPlacementIDKey;
extern NSString *const kATSplashExtraNetworkFirmID; // 广告平台ID
extern NSString *const kATSplashExtraAdSourceIDKey; // 广告源ID

@protocol ATSplashDelegate;

@interface ATAdManager (Splash)

/// 加载广告时调用
/// @param placementID - 要展示的广告位ID字符串
/// @param extra - 本地配置参数
/// @param delegate - 代理对象
/// @param containerView - 底部视图
- (void)loadADWithPlacementID:(NSString *)placementID
                        extra:(NSDictionary *)extra
                     delegate:(id<ATSplashDelegate>)delegate
                containerView:(UIView * _Nullable)containerView;

- (void)loadADWithPlacementID:(NSString *)placementID
                        extra:(NSDictionary *)extra
                      tkExtra:(NSDictionary * _Nullable)tkExtra
                adxFloorPrice:(ATADXFloorPrice * _Nullable)adxFloorPrice
                     delegate:(id<ATSplashDelegate>)delegate
                containerView:(UIView * _Nullable)containerView;

/// 展示开屏广告时调用
/// @param window 展示广告的窗口
- (void)showSplashWithPlacementID:(NSString *)placementID
                            scene:(NSString *)scene
                           window:(UIWindow *)window
                         delegate:(id<ATSplashDelegate>)delegate DEPRECATED_MSG_ATTRIBUTE("请使用 showSplashWithPlacementID:config:window:inViewController:extra:delegate: 替代");

/// v5.7.61+
- (void)showSplashWithPlacementID:(NSString *)placementID
                            scene:(NSString *)scene
                           window:(UIWindow *)window
                            extra:(NSDictionary *_Nullable)extra
                         delegate:(id<ATSplashDelegate>)delegate DEPRECATED_MSG_ATTRIBUTE("请使用 showSplashWithPlacementID:config:window:inViewController:extra:delegate: 替代");

- (void)showSplashWithPlacementID:(NSString *)placementID
                            scene:(NSString *)scene
                           window:(UIWindow *)window
                 inViewController:(UIViewController *)viewController
                         delegate:(id<ATSplashDelegate>)delegate DEPRECATED_MSG_ATTRIBUTE("请使用 showSplashWithPlacementID:config:window:inViewController:extra:delegate: 替代");

/// v6.2.96+
/// - 参数说明:
///   - placementID: 广告位ID
///   - scene: 场景ID
///   - window: 展示容器窗口，如果为nil则默认使用key window
///   - viewController: 展示容器视图控制器，如果为nil则默认使用顶层视图控制器
///   - extra: 额外参数
///   - delegate: 事件代理
- (void)showSplashWithPlacementID:(NSString *)placementID
                            scene:(NSString *)scene
                           window:(UIWindow *)window
                 inViewController:(UIViewController *)viewController
                            extra:(NSDictionary *_Nullable)extra
                         delegate:(id<ATSplashDelegate>)delegate DEPRECATED_MSG_ATTRIBUTE("请使用 showSplashWithPlacementID:config:window:inViewController:extra:delegate: 替代");

- (void)showSplashWithPlacementID:(NSString *)placementID
                           config:(ATShowConfig *)config
                           window:(UIWindow *)window
                 inViewController:(UIViewController *)viewController
                            extra:(NSDictionary *_Nullable)extra
                         delegate:(id<ATSplashDelegate>)delegate;

/// 检查开屏广告是否准备就绪
/// v5.7.06+
- (BOOL)splashReadyForPlacementID:(NSString *)placementID;

/// 检查开屏广告是否准备就绪
/// @param send - 是否发送跟踪事件
- (BOOL)splashReadyForPlacementID:(NSString *)placementID
                           sendTK:(BOOL)send;

- (BOOL)splashReadyWithoutLogForPlacementID:(NSString *)placementID sendTK:(BOOL)send;

/// 获取当前广告位的状态对象 ATCheckLoadModel
- (nullable ATCheckLoadModel *)checkSplashLoadStatusForPlacementID:(NSString *)placementID;

/// 查询广告位的所有缓存信息
- (nullable NSArray<NSDictionary *> *)getSplashValidAdsForPlacementID:(NSString *)placementID;

/// 在业务场景中录入当前广告位缓存状态统计
/// @param scene - 广告场景
/// v5.7.91+
- (void)entrySplashScenarioWithPlacementID:(NSString *)placementID
                                     scene:(NSString *)scene;

@end
```
