---
title: "自定义开屏广告适配器"
source: "https://help.toponad.net/cn/docs/zi-ding-yi-kai-ping-guang-gao-shi-pei-qi"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-01-05"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "自定义广告平台", "自定义广告平台 SDK 版本 >= 6.4.94", "自定义开屏广告适配器"]
content_sha256: "b8bfe3731240450c167494ddaeca0e085e791cfce49ee25052f86697474c3ca5"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义开屏广告适配器

**💡Tips**: 类名可以自定义，但需要与后台配置的自定义广告平台类名保持一致，例如后台添加的适配器类名为：**DemoCustomSplashAdapter**，则需对应创建**DemoCustomSplashAdapter.m**文件

## 1. 推荐的文件结构

复制代码

```
Splash/
├── DemoCustomSplashAdapter.h          # 开屏广告适配器头文件
├── DemoCustomSplashAdapter.m          # 开屏广告适配器实现文件
├── DemoCustomSplashDelegate.h         # 开屏广告代理头文件
└── DemoCustomSplashDelegate.m         # 开屏广告代理实现文件
```

## 2. 必要重写的方法

您需要继承 **[DemoCustomBaseAdapter](https://help.toponad.net/cn/docs/XZLXDakO)** 并重写相关方法：

- 开发者调用广告加载 API 时，会调用到自定义 Adapter 的 `loadADWithArgument:` 方法
- 开发者调用广告准备状态检查 API 时，会调用到自定义 Adapter 的 `adReadySplashWithInfo:` 方法
- 开发者调用广告展示 API 时，会调用到自定义 Adapter 的`showSplashInViewController:` 方法

| 方法 | 参数说明 | 作用 |
| --- | --- | --- |
| - (void)loadADWithArgument:(ATAdMediationArgument \*)argument | argument: 包含有服务器下发和本地配置的参数 | 用于获取服务器下发和本地配置的参数，实现自定义广告的加载逻辑 |
| - (void)showSplashInViewController:(UIViewController \*)viewController | viewController: 展示广告时传入的 UIViewController | 实现展示自定义广告的逻辑 |
| - (BOOL)adReadySplashWithInfo:(NSDictionary \*)info | info: 广告信息字典 | 用于展示广告前判断自定义广告是否准备就绪 |

## 3. 回调方法说明

开屏广告适配器支持以下回调方法，这些方法继承自 `ATBaseTrackProtocol` 协议：

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
| - (void)atOnAdDidRevenue:(NSDictionary \*)extraDic | 广告收益回调给开发者 |

---

## 4. 实现步骤

### 4.1 实现DemoCustomSplashDelegate.h

> 1. 导入了头文件`#import <AnyThinkSDK.h>`
> 2. 添加属性：`@property (nonatomic, strong) ATAdStatusBridge * adStatusBridge;`
> 3. 遵循您的第三方广告 SDK 开屏广告的回调协议
>
> 示例如下:
>
> objc
> 复制代码
>
> ```
> //导入头文件
> #import <AnyThinkSDK/AnyThinkSDK.h>
> #import <Foundation/Foundation.h>
>
> @interface DemoCustomSplashDelegate : NSObject<YourSplashAdDelegate>
>
> @property (nonatomic, strong) ATAdStatusBridge * adStatusBridge;
>
> @end
> ```

### 4.2 实现DemoCustomSplashDelegate.m

> 1. 实现您的第三方 SDK 的协议方法，例如广告加载成功，广告点击，广告关闭等。
> 2. 在第三方SDK的广告加载成功事件中，调用通知我们广告加载成功
>
> objc
> 复制代码
>
> ```
> // 广告加载成功
> - (void)splashAdDidLoad:(YourSplashAd *)splashAd {
>     [self.adStatusBridge atOnAdMetaLoadFinish:{}];
> }
> ```
>
> 3. 在第三方SDK的广告加载失败事件中，调用通知我们广告加载失败
>
> objc
> 复制代码
>
> ```
> // 广告加载失败
> - (void)splashAdDidFailToLoad:(YourSplashAd *)splashAd error:(NSError *)error {
>     [self.adStatusBridge atOnAdLoadFailed:error adExtra:nil];
> }
> ```
>
> 4. 参考我们SDK协议，实现其他广告事件并通知我们：
>
> objc
> 复制代码
>
> ```
> // 广告加载成功
> - (void)splashAdDidLoad:(YourSplashAd *)splashAd {
>     [self.adStatusBridge atOnAdMetaLoadFinish:{}];
> }
>
>
> // 广告展示成功
> - (void)splashAdDidShow:(YourSplashAd *)splashAd {
>     [self.adStatusBridge atOnAdShow:nil];
> }
>
> // 广告点击
> - (void)splashAdDidClick:(YourSplashAd *)splashAd {
>     [self.adStatusBridge atOnAdClick:nil];
> }
>
> // 广告关闭
> - (void)splashAdDidClose:(YourSplashAd *)splashAd {
>     [self.adStatusBridge atOnAdClosed:nil];
> }
> ```

### 4.3 实现DemoCustomSplashAdapter.h

> 1. 继承 [DemoCustomBaseAdapter](https://help.toponad.net/cn/docs/XZLXDakO)
> 2. 导入了头文件`#import <AnyThinkSDK.h>`
> 3. 遵循`ATBaseSplashAdapterProtocol`协议

### 4.4 实现DemoCustomSplashAdapter.m

> 1. 添加以下属性:
>
> objc
> 复制代码
>
> ```
> @interface DemoCustomSplashAdapter()
>
> @property (nonatomic, strong) DemoCustomSplashDelegate *splashDelegate;
> @property (nonatomic, strong) YourSplashAd *splashAd;
>
> @end
> ```
>
> 2. 初始化`splashDelegate`属性
>
> objc
> 复制代码
>
> ```
> #pragma mark - lazy
> - (DemoCustomSplashDelegate *)splashDelegate{
>     if (_splashDelegate == nil) {
>         _splashDelegate = [[DemoCustomSplashDelegate alloc] init];
>         _splashDelegate.adStatusBridge = self.adStatusBridge;
>     }
>     return _splashDelegate;
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
>     self.splashAd = [[YourSplashAd alloc] init];
>     self.splashAd.delegate = self.splashDelegate;
>
>     [self.splashAd loadAdWithSlotId:argument.serverContentDic[@"slot_id"]];
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
> - (void)showSplashInViewController:(UIViewController *)viewController {
>     [self.splashAd showInViewController:viewController];
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
> - (BOOL)adReadySplashWithInfo:(NSDictionary *)info {
>     return self.splashAd.isAdValid;
> }
> ```

---
