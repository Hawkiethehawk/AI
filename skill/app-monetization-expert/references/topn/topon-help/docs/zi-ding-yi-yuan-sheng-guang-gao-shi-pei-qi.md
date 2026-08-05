---
title: "自定义原生广告适配器"
source: "https://help.toponad.net/cn/docs/zi-ding-yi-yuan-sheng-guang-gao-shi-pei-qi"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-01-05"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "自定义广告平台", "自定义广告平台 SDK 版本 >= 6.4.94", "自定义原生广告适配器"]
content_sha256: "f52a22d946dda64765933eed88b244bf2209416d43d76b9d52bfd12320fb2d14"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义原生广告适配器

**💡Tips**: 类名可以自定义，但需要与后台配置的自定义广告平台类名保持一致，例如后台添加的适配器类名为：**DemoCustomNativeAdapter**，则需对应创建**DemoCustomNativeAdapter.m**文件

## 1. 推荐的文件结构

复制代码

```
Native/
├── DemoCustomNativeAdapter.h          # 原生广告适配器头文件
├── DemoCustomNativeAdapter.m          # 原生广告适配器实现文件
├── DemoCustomNativeDelegate.h         # 原生广告代理头文件
├── DemoCustomNativeDelegate.m         # 原生广告代理实现文件
├── DemoCustomNativeObject.h           # 原生广告对象头文件
└── DemoCustomNativeObject.m           # 原生广告对象实现文件
```

## 2. 必要重写的方法

您需要继承 **[DemoCustomBaseAdapter](https://help.toponad.net/cn/docs/XZLXDakO)** 并重写相关方法：

- 开发者调用广告加载 API 时，会调用到自定义 Adapter 的 `loadADWithArgument:` 方法
- 开发者调用广告注册 API 时，会调用到自定义原生广告对象的 `registerClickableViews:withContainer:registerArgument:` 方法
- 开发者调用广告配置 API 时，会调用到自定义原生广告对象的 `setNativeADConfiguration:` 方法

| 方法 | 参数说明 | 作用 |
| --- | --- | --- |
| - (void)loadADWithArgument:(ATAdMediationArgument \*)argument | argument: 包含有服务器下发和本地配置的参数 | 用于获取服务器下发和本地配置的参数，实现自定义广告的加载逻辑 |
| - (void)registerClickableViews:(NSArray<UIView \*> \*)clickableViews withContainer:(UIView \*)container registerArgument:(ATNativeRegisterArgument \*)registerArgument | clickableViews: 可点击视图数组 container: 容器视图 registerArgument: 注册参数 | 实现原生广告的点击事件注册和渲染逻辑 |
| - (void)setNativeADConfiguration:(ATNativeAdRenderConfig \*)configuration | configuration: 原生广告渲染配置 | 设置原生广告的渲染配置参数 |

## 3. 回调方法说明

原生广告适配器支持以下回调方法，这些方法继承自 `ATBaseTrackProtocol` 和 `ATNativeTrackProtocol` 协议：

### 3.1 基础广告事件回调

| 方法 | 说明 |
| --- | --- |
| - (void)atOnAdMetaLoadFinish:(NSDictionary \*)adExtra | 广告数据加载完成时执行回调给开发者 |
| - (void)atOnAdLoadFailed:(NSError \*)error adExtra:(NSDictionary \*)adExtra | 广告加载失败时执行回调给开发者 |
| - (void)atOnAdShow:(NSDictionary \*)adExtra | 广告展示成功时执行回调给开发者 |
| - (void)atOnAdShowFailed:(NSError \*)error extra:(NSDictionary \*)extraDic | 广告展示失败时执行回调给开发者 |
| - (void)atOnAdClick:(NSDictionary \*)adExtra | 广告被用户点击时执行回调给开发者 |
| - (void)atOnAdWillClosed:(NSDictionary \*)extra | 广告即将关闭时执行回调给开发者 |
| - (void)atOnAdClosed:(NSDictionary \*)extra | 广告已关闭时执行回调给开发者 |
| - (void)atOnAdDetailWillShow:(NSDictionary \*)extra | 广告详情页即将展现时执行回调给开发者 |
| - (void)atOnAdDetailClosed:(NSDictionary \*)extra | 广告详情页已关闭时执行回调给开发者 |
| - (void)atOnAdDeeplinkOrJumpResult:(BOOL)success | 广告 Deeplink 跳转结果回调给开发者 |
| - (void)atOnAdVideoStart:(NSDictionary \*)extra | 广告视频开始播放时执行回调给开发者 |
| - (void)atOnAdVideoEnd:(NSDictionary \*)extra | 广告视频播放结束时执行回调给开发者 |
| - (void)atOnAdDidFailToPlayVideo:(NSError \*)error extra:(NSDictionary \*)extraDic | 广告视频播放失败时执行回调给开发者 |
| - (void)atOnAdDidRevenue:(NSDictionary \*)extraDic | 广告收益回调给开发者 |

### 3.2 原生广告专用事件回调

| 方法 | 说明 |
| --- | --- |
| - (void)atOnNativeAdLoadedArray:(NSArray <ATCustomNetworkNativeAd *>*)nativeObjectArray adExtra:(NSDictionary \*)adExtra | 原生广告加载成功时执行回调给开发者 |
| - (void)atOnNativeAdDidEnterFullScreenVideoInAdViewWithAdExtra:(NSDictionary \*)adExtra | 原生广告进入全屏视频模式时执行回调给开发者 |
| - (void)atOnNativeAdDidExitFullScreenVideoInAdViewWithAdExtra:(NSDictionary \*)adExtra | 原生广告退出全屏视频模式时执行回调给开发者 |

---

## 4. 实现步骤

### 4.1 实现DemoCustomNativeObject.h

> 1. 导入相关头文件
> 2. 继承`ATCustomNetworkNativeAd`基类
> 3. 添加第三方SDK的原生广告相关属性
>
> 示例如下:
>
> objc
> 复制代码
>
> ```
> #import <AnyThinkSDK/AnyThinkSDK.h>
> #import <Foundation/Foundation.h>
> #import "DemoCustomAdapterCommonHeader.h"
>
> @interface DemoCustomNativeObject : ATCustomNetworkNativeAd
>
> @property (nonatomic, strong) YourNativeFeedAdModel *feedAdModel;
>
> @property (nonatomic, strong) id<YourFeedAdMeta> feedAdMetaad;
>
> @end
> ```

### 4.2 实现DemoCustomNativeObject.m

> 1. 实现广告注册容器方法，并处理自渲染和模板渲染两种模式，如果您的自定义广告平台只有其中一种渲染模式，则您根据实际情况处理分支逻辑。
>
> objc
> 复制代码
>
> ```
> - (void)registerClickableViews:(NSArray<UIView *> *)clickableViews withContainer:(UIView *)container registerArgument:(ATNativeRegisterArgument *)registerArgument {
>
>     if (self.nativeAdRenderType == ATNativeAdRenderExpress) {
>         //在这里处理第三方 SDK 所需要的模板广告需要的参数，赋值给第三方广告对象
>
>         return;
>     }
>     //在这里处理第三方 SDK 所需要的自渲染广告参数，通常是注册事件
>
> }
> ```
>
> 2. 实现配置设置方法:
>
> objc
> 复制代码
>
> ```
> - (void)setNativeADConfiguration:(ATNativeAdRenderConfig *)configuration {
>     //configuration对象是外界传入的配置对象，这里拿到后取出里面的属性设置给第三方 SDK。
>     self.configuration = configuration;
>     [self getYourFeedVideoView].presentVc = configuration.rootViewController;
> }
> ```
>
> 3. 实现资源清理方法：
>
> objc
> 复制代码
>
> ```
> - (void)dealloc {
>     [[self getYourFeedVideoView] unregisterDataObject];
>     [self.feedAdMetaad unAttachAd];
> }
> ```

### 4.3 实现DemoCustomNativeDelegate.h

> 1. 导入了头文件`#import <AnyThinkSDK.h>`
> 2. 添加属性：`@property (nonatomic,strong) ATNativeAdStatusBridge *adStatusBridge;`
> 3. 添加属性：`@property (nonatomic, strong) ATAdMediationArgument *adMediationArgument;`
> 4. 遵循您的第三方广告 SDK 原生广告回调协议
>
> 示例如下:
>
> objc
> 复制代码
>
> ```
> #import <Foundation/Foundation.h>
> #import "DemoCustomAdapterCommonHeader.h"
>
> @interface DemoCustomNativeDelegate : NSObject<YourNativeFeedAdDelegate,YourFeedVideoDelegate>
>
> @property (nonatomic,strong) ATNativeAdStatusBridge *adStatusBridge;
>
> @property (nonatomic, strong) ATAdMediationArgument *adMediationArgument;
>
> @end
> ```

### 4.4 实现DemoCustomNativeDelegate.m

> 1. 实现您的第三方 SDK 的协议方法，例如广告加载成功，广告点击，广告关闭等。
> 2. 在第三方 SDK 的广告加载成功事件中，将第三方广告 SDK 的原生广告对象，组装为我们聚合 SDK 所需要的`DemoCustomNativeObject`对象，并调用通知我们广告加载成功，例如:
>
> objc
> 复制代码
>
> ```
> /**
>  *  第三方的新原生广告加载广告数据成功回调，返回为广告物料的数组
>  */
> - (void)yourNativeFeedAdLoaded:(YourNativeFeedAd *)nativeFeedAd feedAds:(NSArray <YourNativeFeedAdModel *> *)feedAds { //这是第三方 SDK 的协议方法，广告加载成功时调用
>     self.nativeFeedAd = nativeFeedAd;
>     [self nativeRenderingFeedAds:feedAds];
> }
>
> - (void)nativeRenderingFeedAds:(NSArray <YourNativeFeedAdModel *> *)feedAds {
>
>     YourNativeFeedAdModel *feedAdModel = feedAds.firstObject;
>     //判断是自渲染广告还是模版广告，走对应不同的处理逻辑
>     if (feedAdModel.isNativeExpress) {
>         [self _expressRenderingFeedAds:feedAds];
>     }else{
>         [self _selfRenderingFeedAds:feedAds];
>     }
> }
> ```
>
> 3. 在第三方SDK的广告加载失败事件中，调用通知我们广告加载失败，例如:
>
> objc
> 复制代码
>
> ```
> /**
>  *  新原生广告加载广告数据失败回调
>  */
> - (void)yourNativeFeedAdError:(YourNativeFeedAd *)nativeFeedAd withError:(NSError *)error {//这是第三方 SDK 的协议方法，广告加载失败时调用
>     //通知我们加载失败
>     [self.adStatusBridge atOnAdLoadFailed:error adExtra:nil];
> }
> ```
>
> 4. 实现自渲染广告处理方法:
>
> objc
> 复制代码
>
> ```
> - (void)_selfRenderingFeedAds:(NSArray <YourNativeFeedAdModel *> *)feedAds {
>
>     NSMutableArray *offerArray = [NSMutableArray array];
>
>     //如果需要实现客户端竞价，还需要获取第三方的广告价格
>     NSDictionary *infoDic = [DemoCustomBaseAdapter getC2SInfo:[feedAds.firstObject ecpm]];
>
>     [feedAds enumerateObjectsUsingBlock:^(YourNativeFeedAdModel * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
>
>         id<YourFeedAdMeta> ad = obj.adMaterialMeta;
>         //根据第三方的内容，创建我们 SDK 需要的原生广告对象
>         DemoCustomNativeObject *nativeObject = [[DemoCustomNativeObject alloc] init];
>         nativeObject.feedAdMetaad = ad;
>         nativeObject.nativeAdRenderType = ATNativeAdRenderSelfRender;
>         nativeObject.title = ad.metaContent;
>         nativeObject.mainText = ad.metaContent;
>         nativeObject.ctaText = ad.metaActionTitle;
>         nativeObject.rating = @([ad.metaAppScore doubleValue]);
>         nativeObject.appPrice = ad.metaAppPrice;
>         nativeObject.videoDuration = ad.metaVideoDuration;
>
>         CGSize imageSize = ad.metaMainImageSize;
>         nativeObject.mainImageWidth = imageSize.width;
>         nativeObject.mainImageHeight = imageSize.height;
>
>         nativeObject.iconUrl = ad.metaIcon;
>         nativeObject.imageUrl = ad.metaImageUrls.firstObject;
>         nativeObject.imageList = ad.metaImageUrls;
>         // 视频广告相关处理，若第三方那边是含有视频的广告
>         if (ad.metaCreativeType == YourCreativeTypeVideo) {
>
>             nativeObject.isVideoContents = YES;
>
>             YourFeedVideoConfig *config = [YourFeedVideoConfig new];
>             config.isMute = [self.adMediationArgument.serverContentDic[@"video_muted"] intValue] == 0 ? NO : YES;;
>             config.isAutoPlay = NO;
>
>             YourFeedVideoView *feedVideoView = [[YourFeedVideoView alloc] init];
>             feedVideoView.videoConfig = config;
>             //重要：设置代理
>             feedVideoView.delegate = self;
>             //重要：将媒体视图赋值
>             nativeObject.mediaView = feedVideoView;
>         }
>
>         [offerArray addObject:nativeObject];
>     }];
>     //将组装好的对象，回传给我们 SDK
>     [self.adStatusBridge atOnNativeAdLoadedArray:offerArray adExtra:infoDic];
> }
> ```
>
> 5. 实现模板渲染广告处理方法:
>
> objc
> 复制代码
>
> ```
> - (void)_expressRenderingFeedAds:(NSArray <YourNativeFeedAdModel *> *)feedAds {
>
>     NSMutableArray *offerArray = [NSMutableArray array];
>     //如果需要实现客户端竞价，还需要获取第三方的广告价格
>     NSDictionary *infoDic = [DemoCustomBaseAdapter getC2SInfo:[feedAds.firstObject ecpm]];
>
>     [feedAds enumerateObjectsUsingBlock:^(YourNativeFeedAdModel * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
>
>         UIView *nativeAdView = obj.feedView;
>         //根据第三方的内容，创建我们 SDK 需要的原生广告对象
>         DemoCustomNativeObject *nativeObject = [[DemoCustomNativeObject alloc] init];
>         nativeObject.feedAdModel = obj;
>         nativeObject.templateView = nativeAdView;
>         nativeObject.nativeAdRenderType = ATNativeAdRenderExpress;
>         nativeObject.nativeExpressAdViewWidth = nativeAdView.frame.size.width;
>         nativeObject.nativeExpressAdViewHeight = nativeAdView.frame.size.height;
>         nativeObject.isVideoContents = obj.isVideo;
>
>         [offerArray addObject:nativeObject];
>     }];
>     //将组装好的对象，回传给我们 SDK
>     [self.adStatusBridge atOnNativeAdLoadedArray:offerArray adExtra:infoDic];
> }
> ```
>
> 6. 参考我们SDK`ATNativeTrackProtocol`协议与`ATBaseTrackProtocol`协议，实现其他广告事件并通知我们，例如:
>
> objc
> 复制代码
>
> ```
> /**
>  *  广告被点击
>  */
> - (void)yourNativeFeedAdClick:(YourNativeFeedAdModel *)feedAd {
>     [self.adStatusBridge atOnAdClick:nil];
> }
>
> /**
>  *注意⚠️：当该广告物料是⚠️[模版广告]⚠️时触发此回调
>  *  广告被关闭
>  *  详解:广告点击关闭后回调
>  */
> - (void)yourNativeFeedAdClosed:(YourNativeFeedAdModel *)feedAd {
>     [self.adStatusBridge atOnAdClosed:nil];
> }
>
> /**
>  *注意⚠️：当该广告物料是⚠️自渲染广告⚠️时触发此回调
>  * 新原生广告点击以后，内置AppStore或是内置浏览器被关闭时回调
>  */
> - (void)yourNativeFeedAdDetailClosed {
>     [self.adStatusBridge atOnAdDetailClosed:nil];
> }
> ```

### 4.5 实现DemoCustomNativeAdapter.h

> 1. 继承基础 Adapter，本例中是：`DemoCustomBaseAdapter`
> 2. 导入了头文件`#import <AnyThinkSDK.h>`
> 3. 遵循`ATBaseNativeAdapterProtocol`协议

### 4.6 实现DemoCustomNativeAdapter.m

> 1. 添加以下属性:
>
> objc
> 复制代码
>
> ```
> @interface DemoCustomNativeAdapter()
>
> // 本文档4.3中实现的
> @property (nonatomic, strong) DemoCustomNativeDelegate * nativeDelegate;
>
> // 第三方SDK 的原生广告对象
> @property (nonatomic, strong) YourNativeFeedAd           * nativeExpressAd;
>
> @end
> ```
>
> 2. 初始化`nativeDelegate`属性
>
> objc
> 复制代码
>
> ```
> #pragma mark - lazy
> - (DemoCustomNativeDelegate *)nativeDelegate{
>     if (_nativeDelegate == nil) {
>         _nativeDelegate = [[DemoCustomNativeDelegate alloc] init];
>         _nativeDelegate.adStatusBridge = self.adStatusBridge;
>     }
>     return _nativeDelegate;
> }
> ```
>
> 3. 实现广告加载方法:
>
> objc
> 复制代码
>
> ```
> #pragma mark - init
> - (void)loadADWithArgument:(ATAdMediationArgument *)argument {
>
>     dispatch_async(dispatch_get_main_queue(), ^{
>         //通过argument对象获取必要的加载信息，如尺寸等，创建好必要的参数，准备传入给第三方的原生加载方法，开始加载广告
>         self.nativeExpressAd = [[YourNativeFeedAd alloc]init];
>         //注意设置代理给DemoCustomNativeDelegate
>         self.nativeExpressAd.delegate = self.nativeDelegate;
>
>         self.nativeDelegate.adMediationArgument = argument;
>
>         YourNativeFeedAdConfigParams *adParam = [[YourNativeFeedAdConfigParams alloc]init];
>         adParam.adCount = [argument.at_serverDic[@"request_num"] intValue] ? [argument.at_serverDic[@"request_num"] intValue] : 1;
>         adParam.videoMuted = [argument.at_serverDic[@"video_muted"] intValue] == 0 ? NO : YES;;
>         adParam.isAutoPlay = NO;
>
>         if ([argument.localInfoDic[kATExtraInfoNativeAdSizeKey] respondsToSelector:@selector(CGSizeValue)]) {
>             CGSize size = [argument.localInfoDic[kATExtraInfoNativeAdSizeKey] CGSizeValue];
>             adParam.prerenderAdSize = size;
>         }
>         [self.nativeExpressAd loadAdWithPid:argument.serverContentDic[@"slot_id"]  adParam:adParam];
>     });
> }
> ```

---

## 5. 高级设置

### 5.1 实现原生广告的视频相关控制

> 实现方式是在`DemoCustomNativeObject.m`中实现`ATAdLoadedNativeDataSource`中的协议方法，有关视频控制的内容如下：
>
> objc
> 复制代码
>
> ```
> @protocol ATAdLoadedNativeDataSource
>
> #pragma mark - Video
> /**
>  * The duration of the video ad playing, unit ms
>  */
> - (CGFloat)videoPlayTime;
> /**
>  * Video ad duration, unit ms
>  */
> - (CGFloat)videoDuration;
> /**
>  Play mute switch
>  @param flag whether to mute
>  */
> - (void)muteEnable:(BOOL)flag;
> /**
>  * The video ad play
>  */
> - (void)videoPlay;
> /**
>  * set voice button hidden, only suport TopOn Adx ad
>  */
> - (void)updateVoiceBtnHidden:(BOOL)hidden;
> /**
>  * The video ad pause
>  */
> - (void)videoPause;
>
> - (void)setVideoAutoPlay:(NSInteger)autoPlayType;
>
> /// The destroy  network native ad
> - (void)destroyNative;
>
> @end
> ```
>
> 举例说明，例如我需要外部代码控制视频是否静音，则需要在`DemoCustomNativeObject.m`中实现
>
> objc
> 复制代码
>
> ```
> @implementation DemoCustomNativeObject
>
> - (void)muteEnable:(BOOL)flag {
>
>     //获取外部传入的是否静音标识，传入给第三方 SDK
>
> }
>
> ......其他对接代码
> @end
> ```

---
