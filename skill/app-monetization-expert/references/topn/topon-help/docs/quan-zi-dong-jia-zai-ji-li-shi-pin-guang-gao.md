---
title: "激励视频广告全自动加载"
source: "https://help.toponad.net/cn/docs/quan-zi-dong-jia-zai-ji-li-shi-pin-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "全自动加载", "激励视频广告全自动加载"]
content_sha256: "dbfdfd4410853e353d4ba519e03b8959ce35d1d5ca37cb8c2c8d9b6503f1950e"
knowledge_role: "reference_only"
has_article_body: true
---

# 激励视频广告全自动加载

## **1**. 集成建议

### 1.1 广告加载

- 相同广告位ID仅需调用一次全自动加载的API。
- 不需要调用 `ATAdManager` 的 `loadADWithPlacementID:` 方法进行广告加载。

### 1.2 广告展示

- 请避免在（**didFinishLoadingADWithPlacementID:**）回调中执行广告展示，这样会导致加载-展示循环。
- 展示前需要**应用处于活跃状态(UIApplicationState==UIApplicationStateActive)。**

### 1.3 服务器回调

- 激励视频支持服务器回调的激励下发机制，同时也支持各广告平台的服务器回调功能，请参考[服务端激励。](/cn/docs/msbnkj)

### 1.4 自定义回传参数

> 关于全自动加载激励视频广告回传参数相关，您需要关注以下回调方法：

复制代码

```
- (void)rewardedVideoDidStartPlayingForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {
    NSLog(@"ATRewardedVideoViewController::rewardedVideoDidStartPlayingForPlacementID:%@ extra:%@", placementID, extra);

    /* 设置extra，自定义参数，会在代理的Extra回传，可以用于该广告位的自定义规则匹配；
     开启服务器激励视频回调时，通过设置该值，然后在激励下发的时候回传给开发者。
     特别说明：如果使用三方激励视频服务器回调服务，由于我们SDK内部有广告缓存功能，可能导致传入的扩展参数无法做到实时更改的效果，因此如果有此类需
     求，请使用我们提供的激励视频服务器回调服务，在展示的API设置相应的扩展参数(需使用普通激励视频加载方式)。
     */
    [[ATRewardedVideoAutoAdManager sharedInstance] setLocalExtra:
      @{kATAdLoadingExtraUserIDKey:@"test_user_id"} placementID:@"your rv placementID"];

}
```

## **2**. 开启全自动加载

复制代码

```
//导入头文件
#import

/// 设置全自动加载激励视频广告
/// - Parameter placementID: 广告位ID
- (void)loadRewardedVideoADWithPlacementID:(NSString *)placementID {
    [ATRewardedVideoAutoAdManager sharedInstance].delegate = self;
    // 设置extra，自定义参数，会在代理的Extra回传，可以用于该广告位的自定义规则匹配；
    // 开启服务器激励视频回调时，通过设置该值，然后在激励下发的时候回传给开发者。
    [[ATRewardedVideoAutoAdManager sharedInstance] setLocalExtra:
    @{kATAdLoadingExtraUserIDKey:@"test_user_id"} placementID:placementID];
    [[ATRewardedVideoAutoAdManager sharedInstance] addAutoLoadAdPlacementIDArray:@[placementID]];
}
```

## **3.** 展示广告

> - 请避免在（**didFinishLoadingADWithPlacementID:**）回调中执行广告展示，这样会导致加载-展示循环。
> - 展示前需要先判断当前**应用在前台。**

复制代码

```
/// 展示广告
/// - Parameters:
///   - placementID: 广告位ID
- (void)showRewardedVideoADWithPlacementID:(NSString *)placementID {
    // 展示前需判断广告是否准备就绪
    BOOL isReady = [[ATRewardedVideoAutoAdManager sharedInstance] autoLoadRewardedVideoReadyForPlacementID:placementID];
    if (isReady) {
       [[ATRewardedVideoAutoAdManager sharedInstance] showAutoLoadRewardedVideoWithPlacementID:placementID inViewController:self delegate:self];
    }
}
```

## **4**. API说明

| **类名/文件名** | **简介** |
| --- | --- |
| **[ATAdManager](/cn/docs/ATAdManager)** | 广告的基础操作类，包括广告加载、过滤广告、场景统计等功能。 |
| **[ATRewardedVideoAutoAdManager](/cn/docs/ATRewardedVideoAutoAdManager)** | 全自动加载激励视频广告的管理类，提供开启全自动加载、移除全自动加载、设置本地参数、检查就绪状态、展示广告、场景统计功能。 |
| [**ATAdLoadingDelegate**](/cn/docs/ATAdLoadingDelegate) | 广告的基础代理回调声明，包括广告位与广告源级别的加载成功或失败回调，以及竞价广告源的竞价结束与竞价失败回调。 |
| [**ATRewardedVideoDelegate**](/cn/docs/ATRewardedVideoDelegate) | 针对激励视频广告类型的代理回调，包括展示、点击和关闭等。 |
| [**ATSDKGlobalSetting**](/cn/docs/ATSDKGlobalSetting) | 通用设置类，提供形如清除广告内存中的缓存、自定义流量分组设置、测试模式、设置第三方广告SDK相关信息等功能，还声明了一些通用的属性。 |
