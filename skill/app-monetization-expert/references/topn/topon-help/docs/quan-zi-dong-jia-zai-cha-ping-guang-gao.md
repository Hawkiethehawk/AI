---
title: "插屏广告全自动加载"
source: "https://help.toponad.net/cn/docs/quan-zi-dong-jia-zai-cha-ping-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "全自动加载", "插屏广告全自动加载"]
content_sha256: "977830576cc54724c3050dbc5f9ab237f30b3bbae31d3259b169e6414ce63e56"
knowledge_role: "reference_only"
has_article_body: true
---

# 插屏广告全自动加载

## **1**. 集成建议

### 1.1 广告加载

- 相同广告位ID仅需调用一次全自动加载的API。
- 不需要调用 `ATAdManager` 的 `loadADWithPlacementID:` 方法进行广告加载。

### 1.2 广告展示

- 请避免在（**didFinishLoadingADWithPlacementID:**）回调中执行广告展示，这样会导致加载-展示循环。
- 展示前需要**应用处于活跃状态(UIApplicationState==UIApplicationStateActive)。**

## **2**. 开启全自动加载

复制代码

```
//导入头文件
#import

/// 设置全自动加载插屏广告
/// - Parameter placementID: 广告位ID
- (void)loadInterstitialADWithPlacementID:(NSString *)placementID {
    // 设置代理
    [ATInterstitialAutoAdManager sharedInstance].delegate = self;
    // 设置LocalExtra 自定义参数，会在代理的Extra回传，可以用于该广告位的自定义规则匹配，参数可参考
    [[ATInterstitialAutoAdManager sharedInstance] setLocalExtra:@{} placementID:placementID];
    // 开始自动加载广告
    [[ATInterstitialAutoAdManager sharedInstance] addAutoLoadAdPlacementIDArray:@[placementID]];
}
```

## **3**. 展示广告

> 如果您需要在加载成功的回调（**didFinishLoadingADWithPlacementID:**）中展示广告，为了避免广告无法正常展示，请您确保当前应用位于**活跃状态(UIApplicationState==UIApplicationStateActive)**。

复制代码

```
/// 展示广告
/// - Parameters:
///   - placementID: 广告位ID
- (void)showInterstitialADWithPlacementID:(NSString *)placementID {
    // 展示前需判断广告是否准备就绪
    BOOL isReady = [[ATInterstitialAutoAdManager sharedInstance] autoLoadInterstitialReadyForPlacementID:placementID];
    if (isReady) {
       [[ATInterstitialAutoAdManager sharedInstance] showAutoLoadInterstitialWithPlacementID:placementID inViewController:self delegate:self];
    }
}
```

## **4**. API说明

| **类名/文件名** | **简介** |
| --- | --- |
| **[ATAdManager](/cn/docs/ATAdManager)** | 广告的基础操作类，包括广告加载、过滤广告、场景统计等功能。 |
| **[ATInterstitialAutoAdManager](/cn/docs/ATInterstitialAutoAdManager)** | 全自动加载插屏广告管理类，提供开启全自动加载、移除全自动加载、设置本地参数、检查就绪状态、展示广告、场景统计功能。 |
| [**ATAdLoadingDelegate**](/cn/docs/ATAdLoadingDelegate) | 广告的基础代理回调声明，包括广告位与广告源级别的加载成功或失败回调，以及竞价广告源的竞价结束与竞价失败回调。 |
| [**ATInterstitialDelegate**](/cn/docs/ATInterstitialDelegate-EVh0) | 针对插屏广告类型的代理回调，包括展示、点击和关闭等。 |
| [**ATSDKGlobalSetting**](/cn/docs/ATSDKGlobalSetting) | 通用设置类，提供形如清除广告内存中的缓存、自定义流量分组设置、测试模式、设置第三方广告SDK相关信息等功能，还声明了一些通用的属性。 |
