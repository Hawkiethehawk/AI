---
title: "横幅广告"
source: "https://help.toponad.net/cn/docs/svjyFwBb"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "广告样式", "横幅广告"]
content_sha256: "467e7d3462f6ec9ed5b21c97cca79b2c7f15eb8f7a86ccb9bee84c1d467fac19"
knowledge_role: "reference_only"
has_article_body: true
---

# 横幅广告

> **💡Tips**
>
> - 横幅接入分两部分：**命令式控制类** `ATBannerView`（加载 / 查询 / 销毁 / 监听）+ **Fabric 视图组件** `<ATBannerViewComponent>`（在 RN 视图树中渲染）。
> - 横幅支持**自动刷新**，对应 `onBannerAdAutoRefreshed` / `onBannerAdAutoRefreshFail` 回调。
> - **MREC**（300×250 中等矩形）通过设置横幅尺寸为 `300×250` 实现，接入方式与横幅完全一致。
> - 常用尺寸速查（dp）：标准横幅 `320×50` · 大横幅 `320×100` · MREC `300×250` · 平板横幅 `728×90`。
> - 关键约束：命令式 `loadAd()` 的尺寸与视图组件的 `width`/`height` **必须一致**，否则可能出现展示空白 / 裁剪。
> - 展示前推荐调用 `ad.setShowConfig({ scenarioId })` 设置场景 ID；也可配合 `ATBannerView.entryAdScenario(placementId, scenarioId)` 上报进入广告场景（用于场景化统计）。不要在 `<ATBannerViewComponent>` 上直接设置 `sceneID`。

---

## 1. 设置回调监听

tsx
复制代码

```
import {
  ATBannerView,
  type ATBannerListener,
} from '@anythink/react-native-sdk';

const listener: ATBannerListener = {
  onBannerAdLoaded: () => {
    // 加载成功
  },
  onBannerAdLoadFail: (error) => {
    console.log('load fail:', error.fullErrorInfo);
  },
  onBannerAdShow: (info) => {
    // 展示成功
  },
  onBannerAdClicked: (info) => {
    // 点击
  },
  onBannerAdClose: (info) => {
    // 用户点击关闭按钮
  },
  onBannerAdAutoRefreshed: (info) => {
    // 自动刷新成功
  },
  onBannerAdAutoRefreshFail: (error) => {
    // 自动刷新失败
  },
};
```

---

## 2. 创建控制类并加载

`ATBannerView` 通过 `setPlacementId` 绑定广告位，再 `loadAd` 加载。`loadAd` 的尺寸需与第 3 节视图组件保持一致：

tsx
复制代码

```
import { useEffect, useRef } from 'react';
import { ATBannerView } from '@anythink/react-native-sdk';

const BANNER_W = 320;
const BANNER_H = 50;

const adRef = useRef<ATBannerView | null>(null);

useEffect(() => {
  const ad = new ATBannerView();
  ad.setPlacementId('your placement id');
  ad.setBannerAdListener(listener);
  adRef.current = ad;
  return () => ad.destroy(); // 卸载时释放
}, []);

// 加载（尺寸与视图组件一致）
adRef.current?.loadAd(undefined, { width: BANNER_W, height: BANNER_H });
```

---

## 3. 在视图树中渲染

加载后，在 RN 视图树中挂载 `<ATBannerViewComponent>` 完成渲染。位置 / 布局由 RN 的 `style` 控制：

tsx
复制代码

```
import { View, StyleSheet } from 'react-native';
import {
  ATBannerViewComponent,
  BannerCallback,
} from '@anythink/react-native-sdk';

function BannerArea() {
  return (
    <View style={styles.bannerArea}>
      <ATBannerViewComponent
        placementID="your placement id"
        width={320}
        height={50}
        onAdEvent={(p) => {
          if (p.callbackName === BannerCallback.close) {
            // 处理关闭
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bannerArea: { height: 50, alignItems: 'center', justifyContent: 'center' },
});
```

> ⚠️ **监听槽说明（重要）**：SDK 按 `placementID` 维护**单个**监听槽。`ATBannerView`（命令式类）与 `<ATBannerViewComponent>`（视图组件）若用**同一 placementId**，后注册者会覆盖前者——视图组件挂载后，展示 / 刷新 / 关闭事件（`onBannerAdShow` / `onBannerAdAutoRefreshed` / `onBannerAdClose`）将改由组件的 `onAdEvent` 触发，且组件卸载时会一并移除该监听。
>
> 推荐用法（与官方 Demo 一致）：**加载期事件**（`onBannerAdLoaded` / `onBannerAdLoadFail`）走 `setBannerAdListener`，**先 `loadAd` 再挂载视图**；视图挂载后的展示 / 刷新 / 关闭事件以组件 `onAdEvent` 为准。不要期望同一 placementId 上两套监听同时生效。

`ATBannerViewComponent` 关键 props：

| prop | 类型 | 说明 |
| --- | --- | --- |
| `placementID` | `string` | 广告位 ID（必填） |
| `width` | `number` | 请求广告宽（dp，必填） |
| `height` | `number` | 请求广告高（dp，必填） |
| `isAdaptiveHeight` | `boolean?` | 自适应高度 |
| `onAdEvent` | `(payload) => void` | 视图级事件回调 |

> 💡 视图组件挂载时会按 `placementID` 自动注册事件监听，卸载时自动注销。

如需设置广告场景 ID，请在挂载视图前通过命令式 API 配置：

tsx
复制代码

```
// 挂载前设置场景 ID
adRef.current?.setShowConfig({ scenarioId: 'your_scenario_id' });
// 可选：同时上报进入场景
ATBannerView.entryAdScenario('your placement id', 'your_scenario_id');
```

---

## 4. MREC（300×250）

MREC 是 300×250 的中等矩形广告，接入方式与横幅一致，只需把尺寸改为 `300×250`：

tsx
复制代码

```
const MREC_W = 300;
const MREC_H = 250;

// 命令式加载
adRef.current?.loadAd(undefined, { width: MREC_W, height: MREC_H });
```

tsx
复制代码

```
// 视图渲染
<ATBannerViewComponent placementID="your mrec placement id" width={300} height={250} />
```

---

## 5. 释放资源

横幅不再使用时，调用 `destroy()` 释放（停止刷新、注销监听）：

tsx
复制代码

```
adRef.current?.destroy();
```

> ⚠️ 调用 `destroy()` 后该广告位的回调将停止触发；如需再次展示，需重新 `setPlacementId` + `loadAd`，并重新挂载视图组件。

---

## 6. 监听器字段速查

| 回调 | 入参 | 说明 |
| --- | --- | --- |
| `onBannerAdLoaded` | — | 加载成功 |
| `onBannerAdLoadFail` | `AdError` | 加载失败 |
| `onBannerAdShow` | `ATAdInfo` | 展示成功 |
| `onBannerAdClicked` | `ATAdInfo` | 点击 |
| `onBannerAdClose` | `ATAdInfo` | 点击关闭按钮 |
| `onBannerAdAutoRefreshed` | `ATAdInfo` | 自动刷新成功 |
| `onBannerAdAutoRefreshFail` | `AdError` | 自动刷新失败 |
| `onDeeplinkCallback` | `ATAdInfo, boolean` | DeepLink 跳转结果 |
| `onDownloadConfirm` | `ATAdInfo` | 下载二次确认 |
