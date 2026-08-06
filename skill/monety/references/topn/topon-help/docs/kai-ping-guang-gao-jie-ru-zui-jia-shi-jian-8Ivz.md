---
title: "开屏广告接入最佳实践"
source: "https://help.toponad.net/cn/docs/kai-ping-guang-gao-jie-ru-zui-jia-shi-jian-8Ivz"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-07-22"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "广告样式", "开屏广告", "开屏广告接入最佳实践"]
content_sha256: "8533f229331eaee664bab89ec1460fee120fc077e91be14a6447e4710cc191e2"
knowledge_role: "reference_only"
has_article_body: true
---

# 开屏广告接入最佳实践

## ● 应用冷启动开屏



### 1. 加载广告

> - 在应用或游戏启动后，调用 `ATSplashAd#loadAd` 方法并传入您的开屏广告超时时间进行开屏广告的加载
> - 为了避免开屏广告加载超时，将其他形式的广告预加载逻辑和其他消耗网络资源的请求放在开屏广告展示之后执行
> - 建议使用SDK预置策略以提高首次安装后开屏广告的加载效率

> - 在应用或游戏启动后，调用 `TUSplashAd#loadAd` 方法并传入您的开屏广告超时时间进行开屏广告的加载
> - 为了避免开屏广告加载超时，将其他形式的广告预加载逻辑和其他消耗网络资源的请求放在开屏广告展示之后执行
> - 建议使用SDK预置策略以提高首次安装后开屏广告的加载效率

---

### 2. 展示广告

> 当 `onAdLoaded()` 回调触发时，需满足以下条件再调用 `ATSplashAd#show(activity,container)` 进行展示
>
> - 应用处于前台
> - 开屏广告展示容器已被添加到布局且处于可视状态

> 当 `onAdLoaded()` 回调触发时，需满足以下条件再调用 `TUSplashAd#show(activity,container)` 进行展示
>
> - 应用处于前台
> - 开屏广告展示容器已被添加到布局且处于可视状态

---

### 3. 跳转进界面时机

> - 广告加载失败时（`onNoAdError()`回调），直接进入主界面
> - 广告关闭后跳转至主界面（`onAdDismiss()`回调）
> - **注意**: 应用内部需要限制不会重复跳转至主界面

---

## ● 应用热启动开屏

### 1. 加载广告

> - 可以在进入首页后调用loadAd发起热启动开屏预加载
> - 在开屏广告onAdShow展示回调中调用loadAd方法进行开屏广告的预加载

---

### 2. 展示广告

> 在应用从后台回到前台时，调用 `ATSplashAd#isAdReady()` 方法判断当前是否有广告缓存
>
> - 值为 **true** ，调用 `ATSplashAd#show()` 展示广告
> - 值为 **false** ，调用 `ATSplashAd#loadAd()` 进行广告的加载

> 在应用从后台回到前台时，调用 `TUSplashAd#isAdReady()` 方法判断当前是否有广告缓存
>
> - 值为 **true** ，调用 `TUSplashAd#show()` 展示广告
> - 值为 **false** ，调用 `TUSplashAd#loadAd()` 进行广告的加载

---

### 3. 可选优化点

> - 在应用切换至后台时可以判断 `isReady` ，当无广告缓存时可以执行预加载
> - 避免因为广告缓存过期导致热启动时 `ATSplashAd#isAdReady()` 为 **false** ，需要重新发起加载，等待加载后才能展示广告

> - 在应用切换至后台时可以判断 `isReady` ，当无广告缓存时可以执行预加载
> - 避免因为广告缓存过期导致热启动时 `TUSplashAd#isAdReady()` 为 **false** ，需要重新发起加载，等待加载后才能展示广告
