---
title: "自定义横幅广告适配器"
source: "https://help.toponad.net/cn/docs/zi-ding-yi-heng-fu-guang-gao-shi-pei-qi"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-01-05"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "自定义广告平台", "自定义广告平台 SDK 版本 >= 6.4.94", "自定义横幅广告适配器"]
content_sha256: "9e6703ea66ed38a44a0c45c4bf5f7287fb9d36de911f160e3e33d4ec05c80b1e"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义横幅广告适配器

**💡Tips**: 类名可以自定义，但需要与后台配置的自定义广告平台类名保持一致，例如后台添加的适配器类名为：**DemoCustomBannerAdapter**，则需对应创建**DemoCustomBannerAdapter.m**文件

## 1. 推荐的文件结构

复制代码

```
Banner/
├── DemoCustomBannerAdapter.h          # 横幅广告适配器头文件
├── DemoCustomBannerAdapter.m          # 横幅广告适配器实现文件
├── DemoCustomBannerDelegate.h         # 横幅广告代理头文件
└── DemoCustomBannerDelegate.m         # 横幅广告代理实现文件
```

## 2. 必要重写的方法

- 您需要继承 **[DemoCustomBaseAdapter](https://help.toponad.net/cn/docs/XZLXDakO)** 并重写相关方法：
- 开发者调用广告加载 API 时，会调用到自定义 Adapter 的 `loadADWithArgument:` 方法

| 方法 | 参数说明 | 作用 |
| --- | --- | --- |
| - (void)loadADWithArgument:(ATAdMediationArgument \*)argument | argument: 包含有服务器下发和本地配置的参数 | 用于获取服务器下发和本地配置的参数，实现自定义广告的加载逻辑 |

## 3. 回调方法说明

横幅广告适配器支持以下回调方法，这些方法继承自 `ATBaseTrackProtocol` 和 `ATBannerTrackProtocol` 协议：

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

### 3.2 横幅广告专用事件回调

| 方法 | 说明 |
| --- | --- |
| - (void)atOnBannerAdLoadedWithView:(UIView \*)bannerView adExtra:(NSDictionary \*)adExtra | 横幅广告加载成功时执行回调给开发者 |

## 4. 实现步骤

### 4.1 实现DemoCustomBannerDelegate.h

> 1. 导入头文件`#import <AnyThinkSDK.h>`
> 2. 添加属性：`@property (nonatomic, strong) ATBannerAdStatusBridge * adStatusBridge;`
> 3. 遵循您的第三方广告 SDK 横幅广告回调协议
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
> @interface DemoCustomBannerDelegate : NSObject<YourBannerViewDelegate>
>
> @property (nonatomic, strong) ATBannerAdStatusBridge * adStatusBridge;
>
> @end
> ```

### 4.2 实现DemoCustomBannerDelegate.m

> 1. 实现您的第三方 SDK 的协议方法，例如广告加载成功，广告点击，广告关闭等。
> 2. 在第三方SDK广告加载成功事件中，调用通知我们广告加载成功，并回传我们Banner对象，例如:
>
> objc
> 复制代码
>
> ```
> /**
>    平台广告准备就绪，可以进行展示
>  */
> - (void)yourBannerAdReadySuccess:(YourBannerView *)bannerAd { //这是第三方 SDK 的协议方法，广告加载成功时调用
>     //将第三方广告 SDK 回调中附带的横幅广告对象传递给我们聚合 SDK
>     [self.adStatusBridge atOnBannerAdLoadedWithView:bannerAd adExtra:@{}];
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
>  * 请求广告失败后调用
>  */
> - (void)yourBannerError:(YourBannerView *)bannerAd error:(NSError *)error {//这是第三方 SDK 的协议方法，广告加载失败时调用
>     //通知我们加载失败
>     [self.adStatusBridge atOnAdLoadFailed:error adExtra:nil];
> }
> ```
>
> 4. 参考我们SDK`ATBannerTrackProtocol`协议与`ATBaseTrackProtocol`协议，实现其他广告事件并通知我们，例如:
>
> objc
> 复制代码
>
> ```
> /**
>  *  banner条点击回调
>  */
> - (void)yourBannerClicked:(YourBannerView *)bannerAd {
>     [self.adStatusBridge atOnAdClick:nil];
> }
> ```

### 4.3 实现DemoCustomBannerAdapter.h

> 1. 继承 [DemoCustomBaseAdapter](https://help.toponad.net/cn/docs/XZLXDakO)
> 2. 导入了头文件`#import <AnyThinkSDK.h>`
> 3. 遵循`ATBaseBannerAdapterProtocol`协议

### 4.4 实现DemoCustomBannerAdapter.m

> 1. 添加以下属性:
>
> objc
> 复制代码
>
> ```
> @interface DemoCustomBannerAdapter()
>
> // 本文档步骤一中实现的
> @property (nonatomic, strong) DemoCustomBannerDelegate * bannerDelegate;
>
> // 第三方SDK 的banner广告对象
> @property (nonatomic, strong) YourBannerView *bannerView;
>
> @end
> ```
>
> 2. 初始化`bannerDelegate`属性
>
> objc
> 复制代码
>
> ```
> #pragma mark - lazy
> - (DemoCustomBannerDelegate *)bannerDelegate{
>     if (_bannerDelegate == nil) {
>         _bannerDelegate = [[DemoCustomBannerDelegate alloc] init];
>         _bannerDelegate.adStatusBridge = self.adStatusBridge;
>     }
>     return _bannerDelegate;
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
>     dispatch_async(dispatch_get_main_queue(), ^{ //通常需要在主线程执行
>         //通过argument对象获取必要的加载信息，如尺寸等，创建好必要的参数，准备传入给第三方的横幅加载方法，开始加载广告
>         CGSize bannerSize = CGSizeMake(320, 50);
>         if (!CGSizeEqualToSize(argument.bannerSize, CGSizeZero)) {
>             bannerSize = argument.bannerSize;
>         }
>
>         self.bannerView = [[YourBannerView alloc] initWithFrame:CGRectMake(0, 0, bannerSize.width, bannerSize.height)];
>         //注意设置代理给DemoCustomBannerDelegate
>         self.bannerView.delegate = self.bannerDelegate;
>
>         YourBannerAdConfigParams *adParam = [[YourBannerAdConfigParams alloc]init];
>         adParam.showCloseBtn = NO;
>         adParam.interval = 0;
>         //调用第三方广告 SDK 的加载方法
>         [self.bannerView loadAdAndShowWithPid:argument.serverContentDic[@"slot_id"] presentVC:argument.viewController adParams:adParam];
>     });
> }
> ```

---
