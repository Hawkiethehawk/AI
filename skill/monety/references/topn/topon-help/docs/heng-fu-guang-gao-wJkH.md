---
title: "自定义横幅广告"
source: "https://help.toponad.net/cn/docs/heng-fu-guang-gao-wJkH"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "自定义广告平台", "自定义广告平台 SDK 版本 < 6.4.94", "自定义横幅广告"]
content_sha256: "8aa3004647b8e758aa436c218f98d307149d8fcc64539fd0f5e6f99deda64163"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义横幅广告

您已经在TopOn后台添加并配置了自定义广告平台。若您尚未进行相关操作，请[前往此处](/cn/docs/fRMh7C)。

> 以下案例为非竞价广告实现，自定义广告平台实现竞价，请[参考此处](/cn/docs/zi-ding-yi-gao-ji-pei-zhi)。

## **1**. 创建Adapter类

根据您在TopOn后台添加的类名，创建BannerAdapter类（本例中以CustomBannerAdapter命名）。

复制代码

```
// CustomBannerAdapter.h

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface CustomBannerAdapter : NSObject

@end

NS_ASSUME_NONNULL_END
```

复制代码

```
// CustomBannerAdapter.m

#import "CustomBannerAdapter.h"

@interface CustomBannerAdapter ()

@end

@implementation CustomBannerAdapter

@end
```

## **2**. 遵循并实现ATAdAdapter协议

将上一步创建的CustomBannerAdapter类遵循ATAdAdapter协议并实现其中必选方法。

查看更多ATAdAdapter协议的信息，请[点击这里](/cn/docs/kYu4R6)。

复制代码

```
#import "CustomBannerAdapter.h"
#import <AnyThinkSDK/AnyThinkSDK.h>
#import <AnyThinkBanner/ATBanner.h>

@interface CustomBannerAdapter() <ATAdAdapter>

@end

@implementation CustomBannerAdapter

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

/// 必须实现，用于判断自定义广告平台的广告是否已经是准备完成的状态(或处于广告有效期内)
/// - Parameters:
///   - customObject: 自定义广告对象
///   - info: 服务端配置的参数字典
+ (BOOL)adReadyWithCustomObject:(id)customObject info:(NSDictionary*)info {

    BOOL flag = YES;
    //广告是否准备就绪逻辑

    return flag;
}

///  当TopOn iOS SDK触发广告展示时，会调用此方法触发广告SDK的广告展示逻辑。
/// - Parameters:
///   - banner: 自定义广告banner对象
///   - view: TopOn iOS SDK内部定义的BannerView容器
///   - viewController: 当前视图控制器
+ (void)showBanner:(ATBanner*)banner inView:(UIView*)view presentingViewController:(UIViewController*)viewController {

    // 展示广告

}

@end
```

## **3**. 创建广告回调CustomEvent类

自定义实现一个CustomEvent类(本例中命名为BannerCustomEvent)，继承ATBannerCustomEvent类，并通过这个类添加自定义广告平台对应的回调代理，当第三方广告平台有回调时，调用本类中您定义的事件方法，这个您定义的事件方法中，您需要调用继承自ATBannerCustomEvent的方法，将事件回传给TopOn iOS SDK。本例中仅举例广告加载完成回调，其他方法由您自行添加。

请[点击这里](/cn/docs/sxuTux)查看ATBannerCustomEvent类具体说明。

复制代码

```
//BannerCustomEvent.h

#import <AnyThinkBanner/AnyThinkBanner.h>

NS_ASSUME_NONNULL_BEGIN

@interface BannerCustomEvent : ATBannerCustomEvent

@end

NS_ASSUME_NONNULL_END
```

复制代码

```
@implementation BannerCustomEvent

/// 这是您广告平台SDK的广告加载完成回调，具体方法名称及参数请查看您广告平台SDK文档
- (void)your3rdSDKInterstitialAdDidLoad:(id)rewardedVideoAd {
    ...
    //将信息回传给TapOn iOS SDK
    [self trackBannerAdLoaded:rewardedVideoAd adExtra:nil];
}

...
其他需要回传的方法

@end
```
