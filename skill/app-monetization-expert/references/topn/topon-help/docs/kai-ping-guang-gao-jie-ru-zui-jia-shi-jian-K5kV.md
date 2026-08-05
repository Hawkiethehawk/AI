---
title: "开屏广告最佳接入实践"
source: "https://help.toponad.net/cn/docs/kai-ping-guang-gao-jie-ru-zui-jia-shi-jian-K5kV"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-07-31"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "广告样式", "开屏广告", "开屏广告最佳接入实践"]
content_sha256: "9d501bdc2fed075680a4018442fcfa22a5c7d079a5fed8c1745fc6d76e03803e"
knowledge_role: "reference_only"
has_article_body: true
---

# 开屏广告最佳接入实践

## 1. 冷启动开屏广告



冷启动开屏最佳实践实现流程图

### 1.1 加载广告并传入超时时间

> - 填充超时时间 = **kATSplashExtraTolerateTimeoutKey** - waterfall启动时间和本次load开始时间的时间差 - 0.1s。
> - 请不要将**kATSplashExtraTolerateTimeoutKey**设置为0。
> - **kATSplashExtraTolerateTimeoutKey**默认5秒，支持小数点。

1. 在应用启动后，调用 `loadADWithPlacementID` 方法进行开屏广告的加载，您可以在此步骤传入`kATSplashExtraTolerateTimeoutKey`指定超时时间

### 1.2 展示广告

当 `didFinishLoadingSplashADWithPlacementID:isTimeout:` 回调触发时，需满足以下条件再调用 `showSplashWithPlacementID`进行展示

1. 在加载未超时的情况下`isTimeout==NO`
2. 应用处于活跃状态`didBecomeActive`
3. 展示开屏广告的控制器或窗口处于可视状态

### 1.3 进入应用主界面

- 进入时机1：广告加载超时（收到 `didTimeoutLoadingSplashADWithPlacementID`）
- 进入时机2：广告加载失败（收到 `didFailToLoadADWithPlacementID: error:`）
- 进入时机3：广告关闭后（收到`splashDidCloseForPlacementID:extra:`）

> 温馨提示：
>
> - 请注意防止重复跳转
> - 调试时请解除断点，因为断点操作可能会影响内部计时器工作，可能会导致不符合预期的现象

### 1.5 自有定时器开屏最佳实践



自有定时器+冷启动开屏最佳实践实现流程图

- 当您的项目中有额外定时器逻辑，需要定时器启动后马上调用 `loadADWithPlacementID`方法进行开屏广告的加载
- 加载load 广告时传入的 extra 超时时间`kATSplashExtraTolerateTimeoutKey`不大于您自有定时器的时间
- 您需要避免因为SDK 代理回调与您自身逻辑同时触发而造成冲突

## 2. 热启动开屏

### 2.1 加载广告

1. 可以在进入首页后调用`loadADWithPlacementID`发起热启动开屏预加载
2. 在开屏广告`splashDidShowForPlacementID: extra:`展示回调中调用 `loadADWithPlacementID`方法进行开屏广告的预加载

### 2.2 展示广告

在应用从后台回到前台时，调用`splashReadyForPlacementID`方法判断当前是否有广告缓存

- YES：调用 `showSplashWithPlacementID` 方法展示广告
- NO：调用 `loadADWithPlacementID` 方法进行广告加载

### 2.3 优化案例

在应用切换至后台时您可以判断广告isReady状态，当无广告缓存时可以执行预加载。这样可以避免因为广告缓存过期导致热启动时判断返回NO时，需要重新发起加载，等待加载后才能展示广告的情况
