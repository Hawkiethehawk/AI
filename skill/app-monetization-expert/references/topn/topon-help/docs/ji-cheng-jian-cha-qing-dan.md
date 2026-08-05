---
title: "集成检查清单"
source: "https://help.toponad.net/cn/docs/ji-cheng-jian-cha-qing-dan"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-01-05"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "集成检查清单"]
content_sha256: "00007fd3beb38b62183c596d739644ffea5b0e082e02b8c5e825cc252fb99725"
knowledge_role: "reference_only"
has_article_body: true
---

# 集成检查清单

本清单旨在帮助您系统性地核查应用集成流程，确保广告SDK的无缝对接与高效运行。

---

## 一、API 使用检查

- 应用初始化时，务必使用正确的 `App Key` 和 `App ID`，并确保各广告格式的广告位 ID 与TopOn后台配置一致。
- SDK 初始化后，所有广告位应能正常加载并展示广告。

---

## 二、广告样式检查

● 激励视频广告

- 正确初始化 `ATRewardVideoAd` 实例并设置 `广告位ID`
- 设置广告事件Listener（`ATRewardVideoListener`）
- 正确调用广告加载方法（`load`）
- 展示广告前检查广告是否准备就绪（`isReady`）
- 正确调用广告展示方法（`show`）
- 正确进行预加载（`onRewardedVideoAdFailed`, `onRewardedVideoAdPlayFailed`, `onRewardedVideoAdClosed`）
- ❗注意：`onRewardedVideoAdFailed`中**禁止**直接重试加载广告，需要进行延迟操作，详情请见[示例Code](/cn/docs/ji-li-shi-pin#2.%20%E5%8A%A0%E8%BD%BD%E5%B9%BF%E5%91%8A)
- [可选] 设置广告收益监听（`setAdRevenueListener`）

● 插屏广告

- 正确初始化 `ATInterstitial` 实例并设置 `广告位ID`
- 设置广告事件Listener（`ATInterstitialListener`）
- 正确调用广告加载方法（`load`）
- 展示广告前检查广告是否准备就绪（`isReady`）
- 正确调用广告展示方法（`show`）
- 正确进行预加载（`onInterstitialAdLoadFail`, `onInterstitialAdVideoError`, `onInterstitialAdClose`）
- ❗注意：`onInterstitialAdLoadFail`中**禁止**直接重试加载广告，需要进行延迟操作，详情请见[示例Code](/cn/docs/cha-ping-guang-gao#2.%20%E5%8A%A0%E8%BD%BD%E5%B9%BF%E5%91%8A)
- [可选] 设置广告收益监听（`setAdRevenueListener`）

● 开屏广告

- 正确初始化 `ATSplashAd` 实例并设置 `广告位ID`和`超时时间（单位：毫秒）`
- 设置广告事件Listener（`ATSplashAdEZListener`）
- 正确调用广告加载方法（`loadAd`）
- 展示广告前检查广告是否准备就绪（`isReady`）
- 正确调用广告展示方法（`show`）并正确传入`SplashAdContainer`
- **注**：如果有品牌logo区域，需要传入`SplashAdContainer`正确的宽高信息，高度尽量大于屏幕的80%
- 正确进行预加载（`onAdDismiss`）用于热启开屏
- [可选] 设置广告收益监听（`setAdRevenueListener`）

● 横幅广告

- 正确初始化 `ATBannerView` 实例并设置 `广告位ID`和`BannerViewContainer`
- Add ATBannerView时需设置宽高信息 `ATBannerView.setLayoutParams(new FrameLayout.LayoutParams(width, height));`
- 设置广告事件Listener（`ATBannerListener`）
- 正确设置Banner Size（`setLocalExtra`）
- 正确调用广告加载方法（`loadAd`）
- 正确设置容器的可见性，以正确呈现广告
- 正确调用广告展示方法（`show`）
- [可选] 设置广告收益监听（`setAdRevenueListener`）
- 正确释放广告资源（`destroy`）

● 原生广告

- 正确初始化 `ATNative` 实例并设置 `广告位ID`
- 设置广告事件Listener（`ATNativeNetworkListener`）
- 正确调用广告加载方法（`makeAdRequest`）
- 自渲染广告：正确绑定`ATNativePrepareInfo`和`SelfRenderView`
- 模板广告：`ATNativeAdView`需设置宽高且正确调用`renderAdContainer`和`prepare`方法
- 正确进行预加载（`onNativeAdLoadFail`）
- ❗注意：`onNativeAdLoadFail`中**禁止**直接重试加载广告，需要进行延迟操作，详情请见[示例Code](/cn/docs/yuan-sheng-guang-gao#2.%20%E5%8A%A0%E8%BD%BD%E5%B9%BF%E5%91%8A)
- [可选] 设置广告收益监听（`setAdRevenueListener`）
- 正确释放广告资源（`destroy`）

● 激励视频广告

- 正确初始化 `TURewardVideoAd` 实例并设置 `广告位ID`
- 设置广告事件Listener（`TURewardVideoListener`）
- 正确调用广告加载方法（`load`）
- 展示广告前检查广告是否准备就绪（`isReady`）
- 正确调用广告展示方法（`show`）
- 正确进行预加载（`onRewardedVideoAdFailed`, `onRewardedVideoAdPlayFailed`, `onRewardedVideoAdClosed`）
- [可选] 设置广告收益监听（`setAdRevenueListener`）

● 插屏广告

- 正确初始化 `TURewardedInterstitial` 实例并设置 `广告位ID`
- 设置广告事件Listener（`TURewardedInterstitialListener`）
- 正确调用广告加载方法（`load`）
- 展示广告前检查广告是否准备就绪（`isReady`）
- 正确调用广告展示方法（`show`）
- 正确进行预加载（`onInterstitialAdLoadFail`, `onInterstitialAdVideoError`, `onInterstitialAdClose`）
- [可选] 设置广告收益监听（`setAdRevenueListener`）

● 开屏广告

- 正确初始化 `TUSplashAd` 实例并设置 `广告位ID`和`超时时间（单位：毫秒）`
- 设置广告事件Listener（`TUSplashAdEZListener`）
- 正确调用广告加载方法（`loadAd`）
- 展示广告前检查广告是否准备就绪（`isReady`）
- 正确调用广告展示方法（`show`）并正确传入`SplashAdContainer`
- **注**：如果有品牌logo区域，需要传入`SplashAdContainer`正确的宽高信息，高度尽量大于屏幕的80%
- 正确进行预加载（`onAdDismiss`）用于热启开屏
- [可选] 设置广告收益监听（`setAdRevenueListener`）

● 横幅广告

- 正确初始化 `TUBannerView` 实例并设置 `广告位ID`和`BannerViewContainer`
- Add `TUBannerView`时需设置宽高信息 `TUBannerView.setLayoutParams(new FrameLayout.LayoutParams(width, height));`
- 设置广告事件Listener（`TUBannerListener`）
- 正确设置Banner Size（`setLocalExtra`）
- 正确调用广告加载方法（`loadAd`）
- 正确设置容器的可见性，以正确呈现广告
- [可选] 设置广告收益监听（`setAdRevenueListener`）
- 正确释放广告资源（`destroy`）

● 原生广告

- 正确初始化 `TUNative` 实例并设置 `广告位ID`
- 设置广告事件Listener（`TUNativeNetworkListener`）
- 正确调用广告加载方法（`makeAdRequest`）
- 自渲染广告：正确绑定`TUNativePrepareInfo`和`SelfRenderView`
- 模板广告：`TUNativeAdView`需设置宽高且正确调用`renderAdContainer`和`prepare`方法
- 正确进行预加载（`onNativeAdLoadFail`）
- [可选] 设置广告收益监听（`setAdRevenueListener`）
- 正确释放广告资源（`destroy`）

---

## 三、通用检查项

- 使用[调试工具](https://help.toponad.net/cn/docs/5xiiue#2._%E9%80%9A%E8%BF%87%E6%B5%8B%E8%AF%95%E5%B7%A5%E5%85%B7%E6%B5%8B%E8%AF%95%E5%B9%BF%E5%91%8A)验证广告集成（`ATDebuggerUITest.showDebuggerUI(context);`）
- 调试阶段开启debug日志开关（`ATSDK.setNetworkLogDebug(true);`）

- 使用[调试工具](https://help.toponad.net/cn/docs/5xiiue#2._%E9%80%9A%E8%BF%87%E6%B5%8B%E8%AF%95%E5%B7%A5%E5%85%B7%E6%B5%8B%E8%AF%95%E5%B9%BF%E5%91%8A)验证广告集成（`TUDebuggerUITest.showDebuggerUI(context);`）
- 调试阶段开启debug日志开关（`TUSDK.setNetworkLogDebug(true);`）

---

## 四、合规性检查

- 已正确上传 `app-ads.txt` 文件

---

## 五、三方收益回传

- 取值上报请参考[示例Code](https://help.toponad.net/cn/docs/san-fang-shou-yi-hui-chuan-J6Fz)

---
