---
title: "自定义激励视频广告"
source: "https://help.toponad.net/cn/docs/ji-li-shi-pin-UGcC"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "自定义广告平台", "自定义广告平台 SDK 版本 < 6.4.94", "自定义激励视频广告"]
content_sha256: "0f9bab870cb46c4bcc3a1b5695efc3ee8a2649e3d1a6883e721abd50edf31add"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义激励视频广告

您已经在TopOn后台添加并配置了自定义广告平台。若您尚未进行相关操作，请[前往此处](/cn/docs/fRMh7C)。

> 以下案例为非竞价广告实现，自定义广告平台实现竞价，请[参考此处](/cn/docs/zi-ding-yi-gao-ji-pei-zhi)。

## **1**. 创建Adapter类

根据您在TopOn后台添加的激励视频类名，创建RewardedVideoAdapter类（本例中以CustomRewardedVideoAdapter命名）。

复制代码

```
// CustomRewardedVideoAdapter.h

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface CustomRewardedVideoAdapter : NSObject

@end

NS_ASSUME_NONNULL_END
```

复制代码

```
// CustomRewardedVideoAdapter.m

#import "CustomRewardedVideoAdapter.h"

@interface CustomRewardedVideoAdapter ()

@end

@implementation CustomRewardedVideoAdapter

@end
```

## **2**. 遵循并实现ATAdAdapter协议

将上一步创建的CustomRewardedVideoAdapter类遵循ATAdAdapter协议并实现其中必选方法。

查看更多ATAdAdapter协议的信息，请[点击这里](/cn/docs/kYu4R6)。

复制代码

```
#import "CustomRewardedVideoAdapter.h"
#import <AnyThinkSDK/AnyThinkSDK.h>
#import <AnyThinkRewardedVideo/ATRewardedVideo.h>

@interface CustomRewardedVideoAdapter() <ATAdAdapter>

@end

@implementation CustomRewardedVideoAdapter

/// 必须实现，用于初始化自定义adapter，非竞价广告进入，竞价广告请参考文档。
/// - Parameters:
///   - serverInfo: 服务端配置的参数字典
///   - localInfo: 本次加载传入的参数字典
- (instancetype)initWithNetworkCustomInfo:(NSDictionary*)serverInfo localInfo:(NSDictionary*)localInfo {
    self = [super init];
    if (self != nil) {
        // 在这里添加您的广告SDK初始化方法
    }
    return self;
}

/// 必须实现，自定义广告平台加载广告的逻辑
/// - Parameters:实现自定义广告平台加载广告的逻辑
///   - serverInfo: 服务端配置的参数字典
///   - localInfo: 本次加载传入的参数字典
///   - completion: 完成回调
- (void)loadADWithInfo:(NSDictionary*)serverInfo localInfo:(NSDictionary*)localInfo completion:(void (^)(NSArray<NSDictionary *> *, NSError *))completion {

    // 加载广告
}

/// 必须实现，用于判断自定义广告平台的激励视频广告是否已经是准备完成的状态(或广告有效期内)
/// - Parameters:
///   - customObject: 自定义广告对象
///   - info: 服务端配置的参数字典
+ (BOOL)adReadyWithCustomObject:(id)customObject info:(NSDictionary*)info {

    BOOL flag = YES;
    //广告是否准备就绪逻辑

    return flag;
}

/// 实现展示自定义广告平台激励视频的逻辑
/// - Parameters:
///   - rewardedVideo: 激励视频对象
///   - viewController: 当前视图控制器
///   - delegate: 广告对象代理
+ (void)showRewardedVideo:(ATRewardedVideo*)rewardedVideo inViewController:(UIViewController*)viewController delegate:(id) delegate {

    // 展示广告

}

@end
```

## **3**. 创建广告回调CustomEvent类

自定义实现一个CustomEvent类(本例中命名为RewardedVideoCustomEvent)，继承ATRewardedVideoCustomEvent类，并通过这个类添加自定义广告平台对应的回调代理，当第三方广告平台有回调时，调用本类中您定义的事件方法，这个您定义的事件方法中，您需要调用继承自ATRewardedVideoCustomEvent的方法，将事件回传给TopOn iOS SDK。本例中仅举例激励视频加载完成回调，其他方法由您自行添加。

请[点击这里](/cn/docs/dxpmjW)查看ATRewardedVideoCustomEvent类具体说明。

> 在给用户下发激励回调前，TopOn SDK回传方法将rewardGranted参数需要设置为YES，用于标识是否已经下发奖励。

复制代码

```
//RewardedVideoCustomEvent.h

#import <AnyThinkRewardedVideo/AnyThinkRewardedVideo.h>

NS_ASSUME_NONNULL_BEGIN

@interface RewardedVideoCustomEvent : ATRewardedVideoCustomEvent

@end

NS_ASSUME_NONNULL_END
```

复制代码

```
@implementation RewardedVideoCustomEvent

/// 您的广告平台SDK激励视频加载完成回调，具体方法名称及参数请查看您广告平台SDK文档
- (void)your3rdSDKRewardedVideoAdDidLoad:(id)rewardedVideoAd {
    ...
    //将信息回传给TopOn iOS SDK
    [self trackRewardedVideoAdLoaded:rewardedVideoAd adExtra:nil];
}

...
其他需要回传的方法

@end
```
