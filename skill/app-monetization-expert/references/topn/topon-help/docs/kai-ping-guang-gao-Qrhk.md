---
title: "开屏广告"
source: "https://help.toponad.net/cn/docs/kai-ping-guang-gao-Qrhk"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-04-01"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "广告样式", "开屏广告"]
content_sha256: "2924e7b5ff1f705332e39b21e5886bcbb74a2c67d9184f0fdd3f0c6fbf926c70"
knowledge_role: "reference_only"
has_article_body: true
---

# 开屏广告

# 开屏广告

## 1. 集成建议

- 为了提高您开屏广告的加载效率，请参考[冷启动策略](/cn/docs/XRu5iv)、[SDK预置策略](/cn/docs/wERYJv)与[开屏广告接入最佳实践](/cn/docs/kai-ping-guang-gao-jie-ru-zui-jia-shi-jian-K5kV)。
- 可根据实际业务需要传入期望的**开屏广告加载超时时间**，建议传入 6s - 10s
- 详细示例代码请参考：[Demo](https://github.com/toponteam/TopOn-iOS-Pod-Demo) 中 `SplashVC.m`
- 首次冷启动开屏广告可参考`AppDelegate.m`和`AdSDKManager.m`

## 2. 加载开屏广告

> - 仅部分广告平台支持containerView的设置。
> - 此步骤的extra字典中支持传入相关配置广告的参数与您的自定义参数，您可以在这里查看更多关于[extra参数](/cn/docs/GBk9z1)的说明。

objc
复制代码

```
//导入头文件
#import <AnyThinkSDK/AnyThinkSDK.h>

@interface SplashVC () <ATSplashDelegate>

@end

@implementation SplashVC

//广告位ID
#define SplashPlacementID @"b67f4ab43d2fe1"

//场景ID，可选，可在后台生成。没有可传入空字符串
#define SplashSceneID @""

#pragma mark - Load Ad 加载广告

/// 加载广告
- (void)loadAd {

    NSMutableDictionary *loadConfigDict = [NSMutableDictionary dictionary];

    //开屏超时时间
    [loadConfigDict setValue:@(8) forKey:kATSplashExtraTolerateTimeoutKey];
    //自定义load参数
    [loadConfigDict setValue:@"media_val_SplashVC" forKey:kATAdLoadingExtraMediaExtraKey];

    [[ATAdManager sharedManager] loadADWithPlacementID:SplashPlacementID
                                                 extra:loadConfigDict
                                              delegate:self
                                         containerView:[self footLogoView]];
}

/// 可选接入开屏底部LogoView
- (UIView *)footLogoView {

    //宽度为屏幕宽度,高度<=25%的屏幕高度(根据广告平台要求而定)
    UIView * footerCtrView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kOrientationScreenWidth, 120)];
    footerCtrView.backgroundColor = UIColor.whiteColor;

    //添加图片
    UIImageView * logoImageView = [UIImageView new];
    logoImageView.image = [UIImage imageNamed:@"logo"];
    logoImageView.contentMode = UIViewContentModeCenter;
    logoImageView.frame = footerCtrView.frame;
    [footerCtrView addSubview:logoImageView];

    //添加点击事件
    UITapGestureRecognizer * tap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(footerImgClick:)];
    logoImageView.userInteractionEnabled = YES;
    [logoImageView addGestureRecognizer:tap];

    return footerCtrView;
}

/// footer点击事件
- (void)footerImgClick:(UITapGestureRecognizer *)tap {
    ATDemoLog(@"footer click !!");
}

/// 开屏广告加载完成
/// - Parameters:
///   - placementID: 广告位ID
///   - isTimeout: 是否超时
- (void)didFinishLoadingSplashADWithPlacementID:(NSString *)placementID isTimeout:(BOOL)isTimeout {
    if (!isTimeout) {
        //加载成功，没有超时

    }else {
        //加载成功，但超时了

    }
}

/// 广告位加载失败
/// - Parameters:
///   - placementID: 广告位ID
///   - error: 错误信息
- (void)didFailToLoadADWithPlacementID:(NSString*)placementID error:(NSError*)error {

}

/// 开屏广告加载超时
/// - Parameter placementID: 广告位ID
- (void)didTimeoutLoadingSplashADWithPlacementID:(NSString *)placementID {
}
```

## 3. 展示开屏广告

> - 如果您需要在加载成功的回调（**didFinishLoadingADWithPlacementID:**）中展示广告，为了避免广告无法正常展示，请您确保：当前应用**UIApplicationState==UIApplicationStateActive**
> - 如果在加载时创建并设置了容器containerView，需要将其添加到布局且处于可视状态
> - [**统计场景到达率**](/cn/docs/1RWLAv)，呈现在后台的 数据报表 -> 漏斗分析报表 -> 到达广告场景 ，在展示广告前调用

objc
复制代码

```
#pragma mark - Show Ad 展示广告
- (void)showSplash {

    //场景统计功能，呈现在后台的 数据报表 -> 漏斗分析报表 -> 到达广告场景 ，在展示广告前调用。可选接入
    [[ATAdManager sharedManager] entrySplashScenarioWithPlacementID:SplashPlacementID scene:SplashSceneID];

    //检查是否有就绪
    if (![[ATAdManager sharedManager] splashReadyForPlacementID:SplashPlacementID]) {
        [self loadAd];
        return;
    }

    //展示配置，Scene传入后台的场景ID，没有可传入空字符串，showCustomExt参数可传入自定义参数字符串
    ATShowConfig *config = [[ATShowConfig alloc] initWithScene:SplashSceneID showCustomExt:@"testShowCustomExt"];

    //开屏相关参数配置
    NSMutableDictionary *configDict = [NSMutableDictionary dictionary];

    //展示广告,在App原window中展示
    [[ATAdManager sharedManager] showSplashWithPlacementID:SplashPlacementID config:config window:[UIApplication sharedApplication].keyWindow inViewController:self.tabBarController extra:configDict delegate:self];
}

/// 获得展示收益
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息字典
- (void)didRevenueForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
}

/// 开屏广告已展示
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息
- (void)splashDidShowForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
}

/// 开屏广告已关闭
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息
- (void)splashDidCloseForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
    // 热启动预加载（可选）
    // [self loadAd];
}

/// 开屏广告已点击
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息
- (void)splashDidClickForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
}

/// 开屏广告展示失败
/// - Parameters:
///   - placementID: 广告位ID
///   - error: 错误信息
///   - extra: 额外信息
- (void)splashDidShowFailedForPlacementID:(NSString*)placementID error:(NSError *)error extra:(NSDictionary *)extra {
}

/// 开屏广告已打开或跳转深链接页面
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息
///   - success: 是否成功
- (void)splashDeepLinkOrJumpForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra result:(BOOL)success {
}

/// 开屏广告详情页已关闭
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息
- (void)splashDetailDidClosedForPlacementID:(NSString*)placementID extra:(NSDictionary *)extra {
}

/// 开屏广告关闭计时
/// - Parameters:
///   - countdown: 剩余秒数
///   - placementID: 广告位ID
///   - extra: 额外信息
- (void)splashCountdownTime:(NSInteger)countdown forPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
}

/// 开屏广告zoomout view已点击，仅Pangle 腾讯优量汇 V+支持
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息
- (void)splashZoomOutViewDidClickForPlacementID:(NSString*)placementID extra:(NSDictionary *)extra {
}

/// 开屏广告zoomout view已关闭，仅Pangle 腾讯优量汇 V+支持
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息
- (void)splashZoomOutViewDidCloseForPlacementID:(NSString*)placementID extra:(NSDictionary *)extra {
}
```

## 4. API说明

| 类名/文件名 | 简介 |
| --- | --- |
| [**ATAdManager**](/cn/docs/ATAdManager) | 广告的基础操作类，包括广告加载、过滤广告、场景统计等功能。 |
| [**ATAdManager (Splash)**](/cn/docs/ATAdManager-Splash) | 针对开屏广告的操作拓展，提供广告展示、检查缓存、检查广告是否就绪、场景统计等功能，其中有Extra键的定义。 |
| [**ATAdLoadingDelegate**](/cn/docs/ATAdLoadingDelegate) | 广告的基础代理回调声明，包括广告位与广告源级别的加载成功或失败回调，以及竞价广告源的竞价结束与竞价失败回调。 |
| [**ATSplashDelegate**](/cn/docs/ATSplashDelegate) | 针对开屏广告类型的代理回调，包括展示、点击和关闭等。 |
| [**ATSDKGlobalSetting**](/cn/docs/ATSDKGlobalSetting) | 通用设置类，提供形如清除广告内存中的缓存、自定义流量分组设置、测试模式、设置第三方广告SDK相关信息等功能，还声明了一些通用的属性。 |

## 5. 进阶设置

[广告场景](/cn/docs/1RWLAv)：可帮助开发者了解广告场景维度的展示、点击和到达广告场景时的广告Ready率等数据。

[预置策略](/cn/docs/wERYJv)：可通过配置预置策略，提高首次冷启动的广告加载效果。
