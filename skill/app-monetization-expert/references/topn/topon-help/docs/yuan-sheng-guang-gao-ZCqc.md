---
title: "自定义原生广告"
source: "https://help.toponad.net/cn/docs/yuan-sheng-guang-gao-ZCqc"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "自定义广告平台", "自定义广告平台 SDK 版本 < 6.4.94", "自定义原生广告"]
content_sha256: "cefb1ab1c1bc996d1a0f2d4e261d18bf76bc7610d73bfe58f5db36daa762c527"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义原生广告

您已经在TopOn后台添加并配置了自定义广告平台。若您尚未进行相关操作，请[前往此处](/cn/docs/fRMh7C)。

> 以下案例为非竞价广告实现，自定义广告平台实现竞价，请[参考此处](/cn/docs/zi-ding-yi-gao-ji-pei-zhi)。

## **1**. 创建Adapter类

根据您在TopOn后台添加的类名，创建NativeAdapter类（本例中以CustomNativeAdapter命名）。

复制代码

```
// CustomNativeAdapter.h

#import <foundation>

NS_ASSUME_NONNULL_BEGIN

@interface CustomNativeAdapter : NSObject

@end

NS_ASSUME_NONNULL_END</foundation>
```

复制代码

```
// CustomNativeAdapter.m

#import "CustomNativeAdapter.h"

@interface CustomNativeAdapter ()

@end

@implementation CustomNativeAdapter

@end
```

## **2**. 创建广告回调CustomEvent类

自定义实现一个CustomEvent类(本例中命名为NativeCustomEvent)，继承ATNativeCustomEvent类，并通过这个类添加自定义广告平台对应的回调代理，当第三方广告平台有回调时，调用本类中您定义的事件方法，这个您定义的事件方法中，您需要调用继承自ATNativeADCustomEvent的方法，将事件回传给TopOn iOS SDK。本例中仅举例广告加载完成回调，其他方法由您自行添加。

请[点击这里](/cn/docs/sxuTux)查看ATNativeADCustomEvent类具体说明。

> 此类中，您需要在回调中将广告平台返回的原生广告素材映射到TopOn的对应的asset字典中，请前往[CustomEvent映射](/cn/docs/sxgAaZ)章节。

复制代码

```
//NativeCustomEvent.h

#import <anythinknative>

NS_ASSUME_NONNULL_BEGIN

@interface NativeCustomEvent : ATNativeADCustomEvent

@end

NS_ASSUME_NONNULL_END</anythinknative>
```

复制代码

```
@implementation NativeCustomEvent

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

## **2**. 创建您的渲染类

TopOn iOS SDK内部针对原生广告的渲染做了一层封装，因此，实现自定义原生广告Adapter时，需要您实现一个Renderer类(本例中为YourCustomNativeRenderer)，将广告平台返回的原生参数映射到TopOn内部对象。

请[点击这里](/cn/docs/ATNativeRenderer)查看ATNativeRenderer类具体说明。

请[点击这里](/cn/docs/O8oja1)查看ATNativeADRenderer协议具体说明。

> 您可能会使用下载图片相关方法，前往[图片下载API](/cn/docs/VvtCpC)来查看。

复制代码

```
#import <foundation>
#import <anythinknative>

NS_ASSUME_NONNULL_BEGIN

@interface YourCustomNativeRenderer : ATNativeRenderer

@end

NS_ASSUME_NONNULL_END</anythinknative></foundation>
```

复制代码

```
#import "YourCustomNativeRenderer.h"
#import "NativeCustomEvent.h"
#import <anythinknative>

@interface YourCustomNativeRenderer()

@property (nonatomic, weak) NativeCustomEvent * customEvent;

@end

@implementation YourCustomNativeRenderer

/// 将资源渲染到相关的广告视图上。
/// 您可以根据广告平台的要求，做渲染之后再做一些注册点击事件的功能
- (void)renderOffer:(ATNativeADCache *)offer {
    ...
}

/// 如果广告形式存在MediaView，则需要实现createMediaView，以返回mediaview对象给到TopOn iOS SDK
- (__kindof UIView*)getNetWorkMediaView {
    return yourMeidaView;
}

@end</anythinknative>
```

## **3**. 遵循并实现ATAdAdapter协议

将第一步中创建的CustomNativeAdapter类遵循ATAdAdapter协议并实现其中必选方法。

查看更多ATAdAdapter协议的信息，请[点击这里](/cn/docs/kYu4R6)。

复制代码

```
#import "CustomNativeAdapter.h"
#import <anythinksdk>

@interface CustomNativeAdapter() <atadadapter>

@end

@implementation CustomNativeAdapter

/// 用于返回自定义Renderer类
+ (Class)rendererClass {
    return [YourRendererClass class];
}

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
- (void)loadADWithInfo:(NSDictionary*)serverInfo localInfo:(NSDictionary*)localInfo completion:(void (^)(NSArray<nsdictionary> *, NSError *))completion {

    // 加载广告
}

@end</nsdictionary></atadadapter></anythinksdk>
```
