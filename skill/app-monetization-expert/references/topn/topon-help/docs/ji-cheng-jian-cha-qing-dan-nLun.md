---
title: "集成检查清单"
source: "https://help.toponad.net/cn/docs/ji-cheng-jian-cha-qing-dan-nLun"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-09-30"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "集成检查清单"]
content_sha256: "ac95d51af4c0de136a4f82874c04303ce94ee6043d141869cd64b439045f1d9d"
knowledge_role: "reference_only"
has_article_body: true
---

# 集成检查清单

本清单旨在帮助您系统性地核查应用集成流程，确保广告SDK的无缝对接与高效运行。

---

## 一、API 使用检查

- 应用初始化时，务必使用正确的 `App Key` 和 `App ID`，并确保各广告格式的广告位ID与TopOn后台配置一致；同时请检查应用`Bundle ID`与配置匹配
- 检查Info.plist中例如ATT、HTTP的权限配置
- SDK 初始化后，所有广告位应能正常加载并展示广告

---

## 二、广告样式检查

### 激励视频广告

- 正确设置 `广告位ID`
- 实现广告事件Delegate（`ATRewardedVideoDelegate`）
- 正确调用广告加载方法（`loadADWithPlacementID`）
- 展示广告前检查广告是否准备就绪（`rewardedVideoReadyForPlacementID`）
- 正确调用广告展示方法,并设置代理（`showRewardedVideoWithPlacementID:config:inViewController:delegate:`），避免在`- (void)viewWillAppear:(BOOL)animated`和`- (void)viewWillDisappear:(BOOL)animated`中调用展示API
- 正确进行预加载（`didFailToLoadADWithPlacementID`中必须延迟后发起预加载,详情请见[示例 Code](/cn/docs/ji-li-shi-pin-guang-gao#2.%20%E5%8A%A0%E8%BD%BD%E6%BF%80%E5%8A%B1%E8%A7%86%E9%A2%91%E5%B9%BF%E5%91%8A) ;`rewardedVideoDidFailToPlayForPlacementID`中不需要延迟; `rewardedVideoDidCloseForPlacementID`中不需要延迟）
- [可选] 设置广告收益监听（`didRevenueForPlacementID`）

### 插屏广告

- 正确设置 `广告位ID`
- 实现广告事件Delegate（`ATInterstitialDelegate`）
- 正确调用广告加载方法（`loadADWithPlacementID`）
- 展示广告前检查广告是否准备就绪（`interstitialReadyForPlacementID`）
- 正确调用广告展示方法,并设置代理,确保输入参数控制器在广告场景中可以正常 present 出广告（`showInterstitialWithPlacementID:showConfig:inViewController:delegate:nativeMixViewBlock:`），避免在`- (void)viewWillAppear:(BOOL)animated`和`- (void)viewWillDisappear:(BOOL)animated`中调用展示API
- 正确进行预加载（`didFailToLoadADWithPlacementID`中必须延迟后发起预加载,详情请见[示例 Code](/cn/docs/cha-ping-guang-gao-8CtT#2.%20%E5%8A%A0%E8%BD%BD%E6%8F%92%E5%B1%8F%E5%B9%BF%E5%91%8A) ;`interstitialDidFailToPlayVideoForPlacementID`中不需要延迟; `interstitialDidCloseForPlacementID`中不需要延迟）
- [可选] 设置广告收益监听（`didRevenueForPlacementID`）

### 开屏广告

- 正确设置 `广告位ID`
- 设置广告事件Delegate（`ATSplashDelegate`）
- 正确调用广告加载方法（`loadADWithPlacementID`）
- 展示广告前检查广告是否准备就绪（`showSplashWithPlacementID:config:window:inViewController:extra:delegate:`）
- 正确调用广告展示方法,并设置代理,确保输入参数Window和控制器在广告场景中可以正常 present 出广告（`showAdWithWindow:viewController:withExtra:`），避免在`- (void)viewWillAppear:(BOOL)animated`和`- (void)viewWillDisappear:(BOOL)animated`中调用展示API
- 保证开屏广告展示方法在应用位于前台且活跃状态时才调用(didBecomeActive)
- 正确设置超时时间（`kATSplashExtraTolerateTimeoutKey`）
- 若有热启动开屏场景，正确进行预加载（`splashDidCloseForPlacementID`中进行预加载）
- [可选] 设置广告收益监听（`didRevenueForPlacementID`）

### 横幅广告

- 正确设置 `广告位ID`
- 设置广告事件Delegate（`ATBannerDelegate`）
- 正确设置Banner Size（`kATAdLoadingExtraBannerAdSizeKey`）
- 正确调用广告加载方法（`loadADWithPlacementID`）
- 展示广告前检查广告是否准备就绪（`bannerAdReadyForPlacementID`）
- 正确调用广告展示方法（`retrieveBannerViewForPlacementID`）
- 正确设置`ATBannerView`及其容器的可见性，以正确呈现广告
- 正确设置`ATBannerView`的代理`delegate`，及其`presentingViewController`
- [可选] 设置广告收益监听（`revenueDelegate`）
- `自动刷新`功能配置：[Taku 后台 > 应用管理 > 选择目标应用 > 进入目标横幅广告位 > 高级设置]
- 临时不展示时可以设置横幅对象的`isHidden`，永久不展示时需要销毁`destroyBanner`

### 原生自渲染广告

- 正确设置 `广告位ID`
- 设置广告事件Delegate（`ATNativeADDelegate`）
- 正确调用广告加载方法（`loadADWithPlacementID`）
- 通过`ATNativeADConfiguration`来进行展示前的配置
- 通过`getNativeAdOfferWithPlacementID`正确创建`ATNativeAdOffer`，并且判空后使用
- 自渲染广告：创建自渲染视图view，同时根据`ATNativeAdOffer`中的信息内容去给组件正确赋值与布局
- 通过`[[ATNativeADView alloc] initWithConfiguration:config currentOffer:placementID:]`正确创建原生广告视图
- 自渲染广告：正确调用`[nativeADView getMediaView]`获取`mediaView`对象，并判空，如不为空需要正确添加布局
- 自渲染广告：调用`registerClickableViewArray`正确传入注册点击事件的UI控件
- 自渲染广告：调用`ATNativePrepareInfo loadPrepareInfo:`正确传入绑定待渲染的UI控件
- 正确调用`rendererWithNativeAdView:selfRenderView:adInfo:`进行渲染，之后设置`nativeADView`为可见
- 正确进行预加载（`didFailToLoadADWithPlacementID`中必须延迟后发起预加载,详情请见[示例 Code](/cn/docs/yuan-sheng-guang-gao-K2JK#2.%20%E5%8A%A0%E8%BD%BD%E5%B9%BF%E5%91%8A) ;`didTapCloseButtonInAdView`中不需要延迟）
- [可选] 设置广告收益监听（`didRevenueForPlacementID`）
- 正确释放广告资源（`destroyNative`,`ATNativeAdOffer=nil`）

### 原生模板广告

- 正确设置 `广告位ID`
- 设置广告事件Delegate（`ATNativeADDelegate`）
- 正确调用广告加载方法（`loadADWithPlacementID`）
- 通过`ATNativeADConfiguration`来进行展示前的配置
- 通过`getNativeAdOfferWithPlacementID`正确创建`ATNativeAdOffer`，并且判空后使用
- 通过`[[ATNativeADView alloc] initWithConfiguration:config currentOffer:placementID:]`正确创建原生广告视图
- 正确调用`rendererWithNativeAdView:selfRenderView:adInfo:`进行渲染，之后设置`nativeADView`为可见
- 正确进行预加载（`didFailToLoadADWithPlacementID`中必须延迟后发起预加载,详情请见[示例 Code](/cn/docs/yuan-sheng-guang-gao-K2JK#2.%20%E5%8A%A0%E8%BD%BD%E5%B9%BF%E5%91%8A) ; `didTapCloseButtonInAdView`中不需要延迟）
- [可选] 设置广告收益监听（`didRevenueForPlacementID`）
- 正确释放广告资源（`destroyNative`）

---

## 三、通用检查项

- 使用调试工具验证广告集成状况（`[[ATDebuggerAPI sharedInstance] showDebuggerInViewController:vc showType:ATShowDebugUIPresent debugkey:@"填入您的DebugKey，DebugKey在后台->账号管理->Key中获取，DebugKey需要与AppID，AppKey对应"];`）
- 调试阶段开启debug日志开关（`[ATAPI setLogEnabled:YES];`）

---

## 四、三方收益回传

- 取值上报请参考[示例Code](/cn/docs/san-fang-shou-yi-hui-chuan-v6-4-12-yi-xia)
