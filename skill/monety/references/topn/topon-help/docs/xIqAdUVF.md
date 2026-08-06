---
title: "集成检查清单"
source: "https://help.toponad.net/cn/docs/xIqAdUVF"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "集成检查清单"]
content_sha256: "5798a8c7619045766dbd166712779f409b7a551315713e43219da0d9aa805b67"
knowledge_role: "reference_only"
has_article_body: true
---

# 集成检查清单

本清单帮助你系统性核查 React Native 工程的广告 SDK 接入流程，确保上线质量。

## 一、环境与依赖

- 工程 RN 版本满足要求（SDK `>= 0.68`）；若使用新架构，已开启 `RCT_NEW_ARCH_ENABLED=1`（Paper 旧架构无需此项）。
- 已安装 `@anythink/react-native-sdk`。
- iOS 已执行 `pod install`，部署目标 `>= 13.0`。
- Android `minSdkVersion >= 21`、`compileSdkVersion 36`。
- 若接入 AdMob：iOS 已配 `GADApplicationIdentifier`、Android 已配 `APPLICATION_ID` meta-data。
- iOS 已配 `SKAdNetworkItems`、`NSUserTrackingUsageDescription`、`NSAppTransportSecurity`。

---

## 二、初始化检查

- 使用正确的 `appId` 与 `appKey`，且各广告位 ID 与 Topon 后台配置一致。
- 初始化顺序正确：日志 → `ATAdEvents.init()` → `integrationChecking` → 个性化开关 → `ATSDK.init()` → `ATSDK.start()`。
- 全局配置方法（日志、渠道、自定义参数、个性化开关）在 `ATSDK.init()` 之前调用。
- 隐私合规配置（GDPR 数据等级 / 个性化开关）已按目标地区设置，详见[海外隐私配置](https://help.toponad.net/cn/docs/hMm9bZsP)。

> 💡 **如何验证**：开启调试日志（`ATSDK.setNetworkLogDebug(true)`）后，初始化时应能在日志中依次看到 `setNetworkLogDebug` → `integrationChecking` → 个性化设置 → `init` → `start` 的调用输出；`ATSDK.integrationChecking()` 的自检结果也会打印在日志中（可搜索关键字 `Integration`）。

---

## 三、广告样式检查

### 开屏广告

- 正确调用 `load()`（可设置 `fetchAdTimeout`）。
- 展示前用 `isAdReady()` 检查就绪。
- 正确调用 `show()`。

### 横幅广告 & MREC

- 命令式 `loadAd()` 传入的尺寸 `{ width, height }` 与挂载的 `ATBannerViewComponent` 的 `width`/`height` 一致。
- 在 RN 视图树中挂载了 `ATBannerViewComponent`。
- 不再使用时调用 `destroy()` 释放资源。

### 插屏广告

- 正确调用 `load()`。
- 展示前用 `isAdReady()` 检查就绪。
- 正确调用 `show()`。

### 激励视频广告

- 正确调用 `load()`。
- 展示前用 `isAdReady()` 检查就绪。
- 正确调用 `show()`，并在 `onReward` 中处理发奖逻辑。

### 原生广告

- `onNativeAdLoaded` 后才渲染 `ATNativeAdView`。
- 区分**模板(express)**与**自渲染**两种 offer，自渲染时正确放置 `ATNativeTitleView` 等 AssetView 组件。
- 单条广告不再展示时调用 `NativeAd.destroy()`；加载器整体不用时调用 `ATNative.dispose()`。

> 💡 **如何验证广告样式**：① 就绪——`isAdReady()`（横幅 / 原生用 `checkAdStatus()`）返回 `true` 后再 `show()` / 挂载视图；② 展示成功——在 `onXxxAdShow` 回调中加 `console.log` 确认；③ 填充链路——在 Topon 调试面板（`showDebuggerUI`）查看各广告源的填充 / 展示日志。

---

## 四、回调与生命周期

- 每个广告实例都注册了监听（多数广告用 `setAdListener`；**横幅**用 `setBannerAdListener`，**原生**展示期用 `NativeAd.setNativeEventListener`），且在组件卸载时调用 `removeAdListener()` / `destroy()` / `dispose()`。
- 失败回调（`onXxxFail`）有处理逻辑，排查时读取 `error.fullErrorInfo`。
- 同一 placementId 多实例场景下，监听注册 / 注销成对出现，避免串位。

---

## 五、通用检查项

- 使用 Topon 调试面板（`ATSDK.showDebuggerUI(debugKey)`）验证广告集成。
- 调试阶段开启日志（`ATSDK.setNetworkLogDebug(true)`），**上线前关闭**。
- 收益回传字段从 `setAdRevenueListener` 回调的 `info`（即 `ATAdInfo`）中读取（`publisher_revenue` / `currency` / `adsource_price` 等），详见[回调信息说明](https://help.toponad.net/cn/docs/OKZCoAuh)。

> 💡 **如何验证集成**：调用 `ATSDK.showDebuggerUI(debugKey)` 后应弹出 Topon 调试面板，在面板中可逐一确认各广告网络适配器的接入状态与测试广告是否正常返回。收益字段名建议用 `console.log(JSON.stringify(info))` 打印整个 `ATAdInfo` 后按实际键名取值。
