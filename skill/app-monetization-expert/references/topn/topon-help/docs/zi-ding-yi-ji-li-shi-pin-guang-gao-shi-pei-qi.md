---
title: "自定义激励视频广告适配器"
source: "https://help.toponad.net/cn/docs/zi-ding-yi-ji-li-shi-pin-guang-gao-shi-pei-qi"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-01-05"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "自定义广告平台", "自定义广告平台 SDK 版本 >= 6.4.94", "自定义激励视频广告适配器"]
content_sha256: "0759862095b162185a2ac95e431cec4d8aaa015b3cd2fae45a667144e3c23384"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义激励视频广告适配器

**💡Tips**: 类名可以自定义，但需要与后台配置的自定义广告平台类名保持一致，例如后台添加的适配器类名为：**DemoCustomRewardVideoAdapter**，则需对应创建**DemoCustomRewardVideoAdapter.m**文件

## 1. 推荐的文件结构

复制代码

```
RewardVideo/
├── DemoCustomRewardVideoAdapter.h          # 激励视频适配器头文件
├── DemoCustomRewardVideoAdapter.m          # 激励视频适配器实现文件
├── DemoCustomRewardVideoDelegate.h         # 激励视频代理头文件
└── DemoCustomRewardVideoDelegate.m         # 激励视频代理实现文件
```

> 温馨提示:类名可以自定义，但需要与后台配置的自定义广告平台类名匹配，例如后台添加的适配器类名为：**DemoCustomRewardVideoAdapter**，则应对应创建**DemoCustomRewardVideoAdapter.m**文件

## 2. 必要重写的方法

您需要继承 **[DemoCustomBaseAdapter](https://help.toponad.net/cn/docs/XZLXDakO)** 并重写相关方法：

- 开发者调用广告加载 API 时，会调用到自定义 Adapter 的 `loadADWithArgument:` 方法
- 开发者调用广告准备状态检查 API 时，会调用到自定义 Adapter 的 `adReadyRewardedWithInfo:` 方法
- 开发者调用广告展示 API 时，会调用到自定义 Adapter 的`showRewardedVideoInViewController:` 方法

| 方法 | 参数说明 | 返回值 | 作用 |
| --- | --- | --- | --- |
| - (void)loadADWithArgument:(ATAdMediationArgument \*)argument | argument: 包含有服务器下发和本地配置的参数 | void | 用于获取服务器下发和本地配置的参数，实现自定义广告的加载逻辑 |
| - (void)showRewardedVideoInViewController:(UIViewController \*)viewController | viewController: 展示广告时传入的 UIViewController | void | 实现展示自定义广告的逻辑 |
| - (BOOL)adReadyRewardedWithInfo:(NSDictionary \*)info | info: 广告信息字典 | BOOL | 用于展示广告前判断自定义广告是否准备就绪 |

## 3. 回调方法说明

激励视频广告适配器支持以下回调方法，这些方法继承自 `ATBaseTrackProtocol` 和 `ATRewardedTrackProtocol` 协议：

### 3.1 基础广告事件回调

| 方法 | 说明 |
| --- | --- |
| - (void)atOnAdMetaLoadFinish:(NSDictionary \*)adExtra | 广告数据加载完成时执行回调给开发者 |
| - (void)atOnAdLoadFailed:(NSError \*)error adExtra:(NSDictionary \*)adExtra | 广告加载失败时执行回调给开发者 error: 错误信息 |
| - (void)atOnAdShow:(NSDictionary \*)adExtra | 广告展示成功时执行回调给开发者 |
| - (void)atOnAdShowFailed:(NSError \*)error extra:(NSDictionary \*)extraDic | 广告展示失败时执行回调给开发者 error: 错误信息 |
| - (void)atOnAdClick:(NSDictionary \*)adExtra | 广告被用户点击时执行回调给开发者 |
| - (void)atOnAdWillClosed:(NSDictionary \*)extra | 广告即将关闭时执行回调给开发者 |
| - (void)atOnAdClosed:(NSDictionary \*)extra | 广告已关闭时执行回调给开发者 |
| - (void)atOnAdDetailWillShow:(NSDictionary \*)extra | 广告详情页即将展现时执行回调给开发者 |
| - (void)atOnAdDetailClosed:(NSDictionary \*)extra | 广告详情页已关闭时执行回调给开发者 |
| - (void)atOnAdDeeplinkOrJumpResult:(BOOL)success | 广告 Deeplink 跳转结果回调给开发者 |
| - (void)atOnAdVideoStart:(NSDictionary \*)extra | 广告视频开始播放时执行回调给开发者 |
| - (void)atOnAdVideoEnd:(NSDictionary \*)extra | 广告视频播放结束时执行回调给开发者 |
| - (void)atOnAdDidFailToPlayVideo:(NSError \*)error extra:(NSDictionary \*)extraDic | 广告视频播放失败时执行回调给开发者 error: 错误信息 |
| - (void)atOnAdDidRevenue:(NSDictionary \*)extraDic | 广告收益回调给开发者 |

### 3.2 激励视频广告专用事件回调

| 方法 | 说明 |
| --- | --- |
| - (void)atOnRewardedAdLoadedExtra:(NSDictionary \*)adExtra | 激励视频广告加载成功时执行回调给开发者 |
| - (void)atOnRewardedVideoAdRewarded | 激励视频用户获得奖励时执行回调给开发者 |
| - (BOOL)getRewardGranted | 获取是否已发放奖励的状态 |
| - (void)atOnRewardedVideoAdRewardedFailWithExtra:(NSDictionary \*)adExtra | 激励视频奖励发放失败时执行回调给开发者 |

## 4. 实现步骤

> ### 4.1 实现DemoCustomRewardVideoDelegate.h
>
> 步骤:
>
> 1. 导入了头文件`#import <AnyThinkSDK.h>`
> 2. 添加属性：`@property (nonatomic, strong) ATRewardedAdStatusBridge * adStatusBridge;`
> 3. 遵循您的第三方激励视频广告回调协议
>
> 最终效果如下:
>
> objc
> 复制代码
>
> ```
> //导入头文件
> #import <AnyThinkSDK/AnyThinkSDK.h>
> #import <Foundation/Foundation.h>
>
> @interface DemoCustomRewardVideoDelegate : NSObject<YourCustomRewardVideoAdDelegate>
>
> @property (nonatomic, strong) ATRewardedAdStatusBridge * adStatusBridge;
>
> @end
> ```

### 4.2 实现DemoCustomRewardVideoDelegate.m

> 步骤:
>
> 1. 实现您的第三方 SDK 的协议方法，例如广告加载成功，广告点击，广告关闭等。
> 2. 在第三方SDK的广告加载成功事件中，调用通知我们广告加载成功，例如:
>
> objc
> 复制代码
>
> ```
> /**
>  视频数据下载成功回调，已经下载过的视频会直接回调,在该回调中调用show接口
>  @param msRewardVideoAd MSRewardVideoAd 实例
>  */
> - (void)msRewardVideoCached:(MSRewardVideoAd *)msRewardVideoAd { //这是第三方 SDK 的协议方法，广告加载成功时调用
>     [self.adStatusBridge atOnRewardedAdLoadedExtra:{}];
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
>  视频广告各种错误信息回调
>  回调说明：如收到该回调说明本次请求已失败
>  @param msRewardVideoAd MSRewardVideoAd 实例
>  @param error 具体错误信息
>  */
> - (void)msRewardVideoError:(MSRewardVideoAd *)msRewardVideoAd error:(NSError *)error {//这是第三方 SDK 的协议方法，广告加载失败时调用
>     //通知我们加载失败
>     [self.adStatusBridge atOnAdLoadFailed:error adExtra:nil];
> }
> ```
>
> 4. 参考我们SDK`ATRewardedVideoTrackProtocol`协议与`ATBaseTrackProtocol`协议，实现其他广告事件并通知我们，例如:
>
> objc
> 复制代码
>
> ```
> /**
>  视频广告信息点击回调
>  @param msRewardVideoAd MSRewardVideoAd 实例
>  */
> - (void)msRewardVideoClicked:(MSRewardVideoAd *)msRewardVideoAd {
>     [self.adStatusBridge atOnAdClick:nil];
> }
>
> /**
>  视频广告曝光回调
>  @param msRewardVideoAd MSRewardVideoAd 实例
>  */
> - (void)msRewardVideoShow:(MSRewardVideoAd *)msRewardVideoAd {
>     // 广告展示成功回调
>     [self.adStatusBridge atOnAdShow:nil];
> }
>
> /**
>  视频播放页关闭回调
>  @param msRewardVideoAd MSRewardVideoAd 实例
>  */
> - (void)msRewardVideoClosed:(MSRewardVideoAd *)msRewardVideoAd {
>     [self.adStatusBridge atOnAdClosed:nil];
> }
>
> /**
>  视频广告开始播放回调
>  @param msRewardVideoAd MSRewardVideoAd 实例
>  */
> - (void)msRewardVideoStartPlaying:(MSRewardVideoAd *)msRewardVideoAd {
>     // 视频开始播放回调
>     [self.adStatusBridge atOnAdVideoStart:nil];
> }
>
> /**
>  视频广告视频播放完成
>  @param msRewardVideoAd MSRewardVideoAd 实例
>  */
> - (void)msRewardVideoFinish:(MSRewardVideoAd *)msRewardVideoAd {
>     // 视频播放完成回调
>     [self.adStatusBridge atOnAdVideoEnd:nil];
> }
>
> /**
>  视频广告播放达到激励条件回调
>  @param msRewardVideoAd MSRewardVideoAd 实例
>  @param adInfo 激励信息
>  */
> - (void)msRewardVideoReward:(MSRewardVideoAd *)msRewardVideoAd extInfo:(NSDictionary *)adInfo {
>     if ([[adInfo valueForKey:@"rewardVerify"] intValue] == 1) {
>         [self.adStatusBridge atOnRewardedVideoAdRewarded];
>     }
> }
>
> /**
>  激励视频渲染失败
>  */
> - (void)msRewardVideoRenderFail:(MSRewardVideoAd *)msRewardVideoAd error:(NSError *)error {
>     [self.adStatusBridge atOnAdShowFailed:error extra:nil];
> }
>
> /**
>  视频广告播放异常回调，当广告无效时或播放途中出现错误时调用
>  @param msRewardVideoAd MSRewardVideoAd 实例
>  @param error 播放错误信息
>  */
> - (void)msRewardVideoPlayingError:(MSRewardVideoAd *)msRewardVideoAd error:(NSError *)error {
>     [self.adStatusBridge atOnAdDidFailToPlayVideo:error extra:nil];
> }
> ```

### 4.3 实现DemoCustomRewardVideoAdapter.h

> 步骤:
>
> 1. 继承 [DemoCustomBaseAdapter](https://help.toponad.net/cn/docs/XZLXDakO)
> 2. 导入了头文件`#import <AnyThinkSDK.h>`
> 3. 遵循`ATBaseRewardedAdapterProtocol`协议

### 4.4 实现DemoCustomRewardVideoAdapter.m

> 步骤:
>
> 1. 添加以下属性:
>
> objc
> 复制代码
>
> ```
> @interface DemoCustomRewardVideoAdapter()
>
> // 本文档4.1中实现的
> @property (nonatomic, strong) DemoCustomRewardVideoDelegate *rewardedVideoDelegate;
>
> // 第三方SDK 的激励视频广告对象
> @property (nonatomic, strong) MSRewardVideoAd *rewardAd;
>
> @end
> ```
>
> 2. 初始化`rewardedVideoDelegate`属性
>
> objc
> 复制代码
>
> ```
> #pragma mark - lazy
> - (DemoCustomRewardVideoDelegate *)rewardedVideoDelegate{
>     if (_rewardedVideoDelegate == nil) {
>         _rewardedVideoDelegate = [[DemoCustomRewardVideoDelegate alloc] init];
>         _rewardedVideoDelegate.adStatusBridge = self.adStatusBridge;
>     }
>     return _rewardedVideoDelegate;
> }
> ```
>
> 3. 实现广告加载方法:
>
> objc
> 复制代码
>
> ```
> #pragma mark - Ad load
> - (void)loadADWithArgument:(ATAdMediationArgument *)argument {
>     //通过argument对象获取必要的加载信息，创建好必要的参数，准备传入给第三方的激励视频加载方法，开始加载广告
>     self.rewardAd = [[MSRewardVideoAd alloc] init];
>     //注意设置代理给DemoCustomRewardVideoDelegate
>     self.rewardAd.delegate = self.rewardedVideoDelegate;
>
>     MSRewardAdConfigParams *adParam = [[MSRewardAdConfigParams alloc]init];
>     adParam.userId = argument.localInfoDic[kATAdLoadingExtraUserIDKey];
>     adParam.videoMuted = [argument.localInfoDic[@"video_muted"] intValue] == 0 ? NO : YES;
>
>     [self.rewardAd loadRewardVideoAdWithPid:argument.serverContentDic[@"slot_id"] adConfigParams:adParam];
> }
> ```
>
> 4. 实现广告展示方法:
>
> objc
> 复制代码
>
> ```
> #pragma mark - Ad show
> - (void)showRewardedVideoInViewController:(UIViewController *)viewController {
>     [self.rewardAd showRewardVideoAdFromRootViewController:viewController];
> }
> ```
>
> 5. 实现广告准备状态检查方法:
>
> objc
> 复制代码
>
> ```
> #pragma mark - Ad ready
> - (BOOL)adReadyRewardedWithInfo:(NSDictionary *)info {
>     return self.rewardAd.isAdValid;
> }
> ```

---
