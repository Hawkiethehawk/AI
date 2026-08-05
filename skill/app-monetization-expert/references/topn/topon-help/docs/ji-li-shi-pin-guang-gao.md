---
title: "激励视频广告"
source: "https://help.toponad.net/cn/docs/ji-li-shi-pin-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-04-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "广告样式", "激励视频广告"]
content_sha256: "16090e399e54e13adc8d1a4757f39e20d9f12d7155d88eaff4447b57040dccbe"
knowledge_role: "reference_only"
has_article_body: true
---

# 激励视频广告

# 激励视频广告

## 1. 集成建议

### 1.1 展示激励视频广告

- 展示前建议判断是否准备好，准备好后再进行展示操作
- 如果需要在广告位加载成功的回调(**didFinishLoadingADWithPlacementID**)中展示广告，必须先判断(**UIApplicationState==UIApplicationStateActive**)才能执行展示方法，否则可能会导致无法正常展示广告而影响收益。

### 1.2 广告预加载

- 您可以提前于展示场景，来调用加载方法请求广告（比如在应用启动后**UIApplicationState==UIApplicationStateActive**时就开始加载广告），以便到达需要展示广告的场景时，可以快速展示

### 1.3 服务器回调

- 激励视频支持服务器回调的激励下发机制，同时也支持各广告平台的服务器回调功能，请参考[服务端激励](/cn/docs/msbnkj)
- 客户端用于服务端激励回调的自定义参数可以在加载广告时传入，也可以在展示广告时传入。在展示广告时传入自定义参数的好处之一是可以让用户ID与奖品轻松对应。详情请见本文第五小节。

### 1.4 示例代码

- 详细激励视频广告示例代码请参考：[Demo](https://github.com/toponteam/TopOn-iOS-Pod-Demo) 中 `RewardedVC.m`

## 2. 加载激励视频广告

objc
复制代码

```
//导入头文件
#import <AnyThinkSDK/AnyThinkSDK.h>

@interface RewardedVC () <ATAdLoadingDelegate, ATRewardedVideoDelegate>

@property (nonatomic, assign) NSInteger retryAttempt; // 重试次数计数器

@end

@implementation RewardedVC

//广告位ID
#define RewardedPlacementID @"b67f4ab93eb3a7"

//场景ID，可选，可在后台生成。没有可传入空字符串
#define RewardedSceneID @""

#pragma mark - Load Ad 加载广告
- (void)loadAd {

    NSMutableDictionary * loadConfigDict = [NSMutableDictionary dictionary];
    // 可选接入，以下几个key参数适用于广告平台的服务端激励验证，将被透传
    [loadConfigDict setValue:@"media_val_RewardedVC" forKey:kATAdLoadingExtraMediaExtraKey];
    [loadConfigDict setValue:@"rv_test_user_id" forKey:kATAdLoadingExtraUserIDKey];
    [loadConfigDict setValue:@"reward_Name" forKey:kATAdLoadingExtraRewardNameKey];
    [loadConfigDict setValue:@3 forKey:kATAdLoadingExtraRewardAmountKey];

    // 发起广告加载
    [[ATAdManager sharedManager] loadADWithPlacementID:RewardedPlacementID extra:loadConfigDict delegate:self];
}

/// 广告位加载完成
/// - Parameter placementID: 广告位ID
- (void)didFinishLoadingADWithPlacementID:(NSString *)placementID {
    // 重置重试次数
    self.retryAttempt = 0;
}

/// 广告位加载失败
/// - Parameters:
///   - placementID: 广告位ID
///   - error: 错误信息
- (void)didFailToLoadADWithPlacementID:(NSString *)placementID error:(NSError *)error {
    // 重试已达到 3 次，不再重试加载
    if (self.retryAttempt >= 3) {
       return;
    }
    self.retryAttempt++;

    // Calculate delay time: power of 2, maximum 8 seconds
    NSInteger delaySec = pow(2, MIN(3, self.retryAttempt));

    // Delayed retry loading ad
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, delaySec * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
        [self loadAd];
    });
}
```

## 3. 展示激励视频广告

> - [**统计场景到达率**](/cn/docs/1RWLAv)，呈现在后台的 数据报表 -> 漏斗分析报表 -> 到达广告场景 ，在展示广告前调用。

objc
复制代码

```
#pragma mark - Show Ad 展示广告
/// 展示广告
- (void)showAd {

    //场景统计功能，呈现在后台的 数据报表 -> 漏斗分析报表 -> 到达广告场景 ，在展示广告前调用。可选接入
    [[ATAdManager sharedManager] entryRewardedVideoScenarioWithPlacementID:RewardedPlacementID scene:RewardedSceneID];

    //检查是否有就绪
    if (![[ATAdManager sharedManager] rewardedVideoReadyForPlacementID:RewardedPlacementID]) {
        [self loadAd];
        return;
    }

    //展示配置，Scene传入后台的场景ID，没有可传入空字符串，showCustomExt参数可传入自定义参数字符串
    ATShowConfig *config = [[ATShowConfig alloc] initWithScene:RewardedSceneID showCustomExt:@"testShowCustomExt"];

    //展示广告
    [[ATAdManager sharedManager] showRewardedVideoWithPlacementID:RewardedPlacementID config:config inViewController:self delegate:self];
}

#pragma mark - ATRewardedVideoDelegate
/// 激励成功
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息字典
- (void)rewardedVideoDidRewardSuccessForPlacemenID:(NSString *)placementID extra:(NSDictionary *)extra {}

/// 激励广告视频开始播放
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息字典
- (void)rewardedVideoDidStartPlayingForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {}

/// 激励广告视频播放完毕
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息字典
- (void)rewardedVideoDidEndPlayingForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra {}

/// 激励广告视频播放失败
/// - Parameters:
///   - placementID: 广告位ID
///   - error: 错误信息
///   - extra: 额外信息字典
- (void)rewardedVideoDidFailToPlayForPlacementID:(NSString*)placementID error:(NSError *)error extra:(NSDictionary *)extra {
     // 预加载
    [self loadAd];
}

/// 激励广告已关闭
/// - Parameters:
///   - placementID: 广告位ID
///   - rewarded: 是否已经激励成功，YES表示已经回调了激励成功
///   - extra: 额外信息字典
- (void)rewardedVideoDidCloseForPlacementID:(NSString *)placementID rewarded:(BOOL)rewarded extra:(NSDictionary *)extra {
    // 预加载
    [self loadAd];
}

/// 激励广告已点击
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外信息字典
- (void)rewardedVideoDidClickForPlacementID:(NSString*)placementID extra:(NSDictionary *)extra {}

/// 激励广告已打开或跳转深链接页面
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 广告位ID
///   - success: 是否成功
- (void)rewardedVideoDidDeepLinkOrJumpForPlacementID:(NSString *)placementID extra:(NSDictionary *)extra result:(BOOL)success {}
```

## 4. 下发奖励

通过注册ATRewardedVideoDelegate中的以下代理方法进行

objc
复制代码

```
/// 奖励发放
- (void)rewardedVideoDidRewardSuccessForPlacemenID:(NSString *)placementID extra:(NSDictionary *)extra {
}
```

## 5. 服务端激励客户端参数传递

### 5.1 加载时传入

加载广告时传入自定义参数方法与说明如下：

| 字段 Key | 含义说明 | 示例值 | 类型 |
| --- | --- | --- | --- |
| `kATAdLoadingExtraMediaExtraKey` | 自定义字符串 | `@"media_val_RewardedVC"` | NSString |
| `kATAdLoadingExtraUserIDKey` | 用户ID | `@"rv_test_user_id"` | NSString |
| `kATAdLoadingExtraRewardNameKey` | 奖励名称 | `@"reward_Name"` | NSString |
| `kATAdLoadingExtraRewardAmountKey` | 奖励数量 | `@3` | NSNumber |

代码实例：

ojbc
复制代码

```
NSMutableDictionary * loadConfigDict = [NSMutableDictionary dictionary];
// 可选接入，以下几个key参数适用于广告平台的服务端激励验证，将被透传给第三方广告平台 SDK
[loadConfigDict setValue:@"media_val_RewardedVC" forKey:kATAdLoadingExtraMediaExtraKey];
[loadConfigDict setValue:@"rv_test_user_id" forKey:kATAdLoadingExtraUserIDKey];
[loadConfigDict setValue:@"reward_Name" forKey:kATAdLoadingExtraRewardNameKey];
[loadConfigDict setValue:@3 forKey:kATAdLoadingExtraRewardAmountKey];

// 发起广告加载
[[ATAdManager sharedManager] loadADWithPlacementID:RewardedPlacementID extra:loadConfigDict delegate:self];
```

### 5.2 展示时传入

objc
复制代码

```
//展示配置，Scene传入后台的场景ID，没有可传入空字符串，showCustomExt参数可传入自定义参数字符串
ATShowConfig *config = [[ATShowConfig alloc] initWithScene:RewardedSceneID showCustomExt:@"testShowCustomExt"];

//展示广告
[[ATAdManager sharedManager] showRewardedVideoWithPlacementID:RewardedPlacementID config:config inViewController:self delegate:self];
```

> 温馨提示：使用TopOn服务端激励时，如果需要在展示时传入自定义参数，您需要在后台中的配置激励回调地址添加&ilrd={ilrd}，服务端解析show\_custom\_ext字段。**如果您选择在展示时使用`ATShowConfig`的`showCustomExt`传入自定义参数，则您必须在加载(load)广告时也使用我们的Key传入参数，展示时传入的参数内容可以与加载时传入的不同，它们都会发送给服务端。**

## 6. API说明

| **类名/文件名** | **简介** |
| --- | --- |
| [**ATAdManager**](/cn/docs/ATAdManager) | 广告的基础操作类，包括广告加载、过滤广告、场景统计等功能。 |
| [**ATAdManager (RewardedVideo)**](/cn/docs/ATAdManager-RewardedVideo) | 针对激励视频广告的操作拓展，提供广告展示、检查缓存、检查广告是否就绪、场景统计等功能，其中有激励视频Extra键的定义。 |
| [**ATAdLoadingDelegate**](/cn/docs/ATAdLoadingDelegate) | 广告的基础代理回调声明，包括广告位与广告源级别的加载成功或失败回调，以及竞价广告源的竞价结束与竞价失败回调。 |
| [**ATRewardedVideoDelegate**](/cn/docs/ATRewardedVideoDelegate) | 针对激励视频广告类型的代理回调，包括展示、点击和关闭等。 |
| [**ATSDKGlobalSetting**](/cn/docs/ATSDKGlobalSetting) | 通用设置类，提供形如清除广告内存中的缓存、自定义流量分组设置、测试模式、设置第三方广告SDK相关信息等功能，还声明了一些通用的属性。 |

## 7. 常见问题排查

- [收不到TopOn服务端激励回调排查](https://help.toponad.net/cn/docs/iOS-9PTJ?preview=1#%E2%97%8F_%E6%94%B6%E4%B8%8D%E5%88%B0%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%BF%80%E5%8A%B1%E5%9B%9E%E8%B0%83%E6%8E%92%E6%9F%A5)
- [共享广告位使用服务端激励如何传参](https://help.toponad.net/cn/docs/gong-xiang-guang-gao-wei-can-shu-she-zhi)

## 8. 进阶设置

[广告场景](/cn/docs/1RWLAv)：可帮助开发者了解广告场景维度的展示、点击和到达广告场景时的广告Ready率等数据。

[预置策略](/cn/docs/wERYJv)：可通过配置预置策略，提高首次冷启动的广告加载效果。
