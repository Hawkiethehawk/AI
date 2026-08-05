---
title: "原生广告"
source: "https://help.toponad.net/cn/docs/Cv4Tupsn"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "广告样式", "原生广告"]
content_sha256: "b67818f0c5830ff135c89ac7746a014e8f4b7b43b7c0f87c9d11bfe986c24118"
knowledge_role: "reference_only"
has_article_body: true
---

# 原生广告

> **💡Tips**
>
> - 原生接入分两层：**加载器** `ATNative`（一 placementId 一实例，负责加载与缓存）+ **广告对象** `NativeAd`（从缓存消费的单条广告）+ **渲染组件** `<ATNativeAdView>`。
> - 同一广告位可能返回两类 offer：**模板(express)** 由 SDK 自渲染版式；**自渲染** 由开发者用 `AssetView` 组件在 JS 侧摆放素材。`<ATNativeAdView>` 会自动识别并切换，开发者只需为自渲染准备好 AssetView 子节点。
> - 支持在列表中同时展示多条原生广告：每条广告由内部 `adId` 区分，事件按 `placementID#adId` 精确分流，互不串位。
> - 展示前可调用 `ATNative.entryAdScenario(placementId, scenarioId)` 上报进入广告场景（用于场景化统计）。

---

## 1. 创建加载器并注册加载监听

tsx
复制代码

```
import { useEffect, useRef } from 'react';
import { ATNative } from '@anythink/react-native-sdk';

const nativeRef = useRef<ATNative | null>(null);

useEffect(() => {
  const native = new ATNative('your placement id');
  native.setAdListener({
    onNativeAdLoaded: () => {
      // 至少一条广告进入缓存，可以消费并渲染
    },
    onNativeAdLoadFail: (error) => {
      console.log('load fail:', error.fullErrorInfo);
    },
  });
  nativeRef.current = native;
  return () => {
    // 卸载时释放：销毁缓存 + 释放 placementID 订阅
    native.destroy();
    native.dispose();
  };
}, []);
```

---

## 2. 加载广告

tsx
复制代码

```
nativeRef.current?.makeAdRequest();

// 可传请求参数
nativeRef.current?.makeAdRequest({ channelSource: 1 });
```

---

## 3. 从缓存消费一条广告

`onNativeAdLoaded` 后，调用 `getNativeAd()` 从缓存池取一条 `NativeAd`（列表场景可多次调用各取一条；池空返回 `null`，此时可再次 `makeAdRequest` 补量）：

tsx
复制代码

```
const ad = await nativeRef.current?.getNativeAd();
if (!ad) {
  // 缓存为空，补量
  nativeRef.current?.makeAdRequest();
  return;
}

// 注册展示期监听
ad.setNativeEventListener({
  onNativeAdShow: (info) => {},
  onNativeAdClicked: (info) => {},
  onNativeAdClose: (info) => {
    // 用户关闭，销毁并移除视图
    ad.destroy();
  },
  onNativeAdVideoStart: () => {},
  onNativeAdVideoEnd: () => {},
  onNativeAdVideoProgress: (progress) => {},
});
```

---

## 4. 渲染广告

把 `NativeAd` 传给 `<ATNativeAdView ad={ad}>`。组件会自动识别 offer 类型：

### 4.1 模板（express）

模板 offer 由 SDK 绘制版式，**不要放 AssetView 子节点**，建议给定宽高：

tsx
复制代码

```
import { ATNativeAdView } from '@anythink/react-native-sdk';

<ATNativeAdView ad={ad} adWidth={320} adHeight={250} style={{ width: 320, height: 250 }} />
```

### 4.2 自渲染

自渲染 offer 由开发者摆放 `AssetView` 组件，SDK 会把对应素材填入并接管点击 / 曝光。可用的 AssetView 组件：

| 组件 | 对应素材 |
| --- | --- |
| `ATNativeTitleView` | 标题 |
| `ATNativeDescView` | 描述 |
| `ATNativeCtaView` | 行动按钮文案（如"查看详情"） |
| `ATNativeIconView` | 应用图标 |
| `ATNativeMainImageView` | 主图 |
| `ATNativeMediaView` | 视频 / 大图媒体位 |
| `ATNativeCloseView` | 关闭按钮 |

tsx
复制代码

```
import {
  ATNativeAdView,
  ATNativeTitleView,
  ATNativeDescView,
  ATNativeCtaView,
  ATNativeIconView,
  ATNativeMainImageView,
  ATNativeMediaView,
} from '@anythink/react-native-sdk';
import { View, StyleSheet } from 'react-native';

<ATNativeAdView ad={ad} style={styles.card}>
  <View style={styles.row}>
    <ATNativeIconView style={styles.icon} />
    <View style={styles.textCol}>
      <ATNativeTitleView style={styles.title} />
      <ATNativeDescView style={styles.desc} />
    </View>
  </View>
  <View style={styles.imageArea}>
    <ATNativeMediaView style={StyleSheet.absoluteFill} />
    <ATNativeMainImageView style={StyleSheet.absoluteFill} resizeMode="cover" />
  </View>
  <ATNativeCtaView style={styles.cta} />
</ATNativeAdView>
```

> 💡 AssetView 从组件内部 Context 自动取素材渲染，无需手动 `getAdMaterial`。视频类 offer 用 `ATNativeMediaView` 占位，图片类用 `ATNativeMainImageView`，两者叠放即可自动按 offer 类型显示。

---

## 5. 生命周期与销毁

| 方法 | 作用域 | 说明 |
| --- | --- | --- |
| `NativeAd.onResume()` | 单条 | 前台且可见时调用 |
| `NativeAd.onPause()` | 单条 | 切后台 / 滑出可视区时调用 |
| `NativeAd.destroy()` | 单条 | 销毁这一条广告（不影响同位其他条） |
| `ATNative.destroy()` | 整位 | 销毁本广告位缓存（含已 load 未 show 的条） |
| `ATNative.dispose()` | 整位 | 加载器整体不再使用时，释放其 placementID 订阅 |

tsx
复制代码

```
// 组件卸载时
useEffect(() => {
  return () => {
    nativeRef.current?.destroy();
    nativeRef.current?.dispose();
  };
}, []);
```

---

## 6. 列表多广告

在 `FlatList` 等列表中展示多条原生广告时：

- 用同一个 `ATNative` 加载器多次 `getNativeAd()`，每次取出一条独立的 `NativeAd`。
- 每个列表项渲染各自的 `<ATNativeAdView ad={ad}>`，并给定稳定的 `key`。
- 事件按 `placementID#adId` 分流到对应列表项，不会串位。
- 每条广告滑出 / 移除时调用其 `NativeAd.destroy()`。

---

## 7. 监听器字段速查

**加载期**（`ATNative.setAdListener`）：

| 回调 | 入参 | 说明 |
| --- | --- | --- |
| `onNativeAdLoaded` | — | 加载成功（缓存有广告） |
| `onNativeAdLoadFail` | `AdError` | 加载失败 |

**展示期**（`NativeAd.setNativeEventListener`）：

| 回调 | 入参 | 说明 |
| --- | --- | --- |
| `onNativeAdShow` | `ATAdInfo` | 展示成功 |
| `onNativeAdClicked` | `ATAdInfo` | 点击 |
| `onNativeAdClose` | `ATAdInfo` | 关闭 |
| `onNativeAdVideoStart` | — | 视频开始 |
| `onNativeAdVideoEnd` | — | 视频结束 |
| `onNativeAdVideoProgress` | `number` | 视频播放进度 |
| `onDeeplinkCallback` | `ATAdInfo, boolean` | DeepLink 跳转结果 |
