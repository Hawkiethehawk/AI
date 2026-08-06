---
title: "自动加载模式（AutoLoad）"
source: "https://help.toponad.net/cn/docs/4hgahcLt"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "高级功能", "自动加载模式（AutoLoad）"]
content_sha256: "a0bc661ee5a659e1b2ee55e925f927403887ba6bfedeea34936fbd95906ac101"
knowledge_role: "reference_only"
has_article_body: true
---

# 自动加载模式（AutoLoad）

> **💡Tips**
>
> - 自动加载由 SDK **托管广告的加载与补量**：注册广告位后，SDK 自动并行请求、维护缓存，广告关闭后自动补量，开发者无需手动 `load`。
> - 仅 **插屏**（`ATInterstitialAutoAd`）与 **激励视频**（`ATRewardVideoAutoAd`）支持自动加载；开屏 / 横幅 / 原生不支持。
> - 自动加载与手动模式**复用同一套事件通道**，回调名（`onXxxLoaded` / `onReward` 等）与手动完全一致，监听器接口也相同。
> - 自动加载入口为**静态类**（按 placementId 传参），无需 `new` 实例。

---

## 1. 注册监听

监听器类型与手动模式相同（激励用 `ATRewardVideoListener`，插屏用 `ATInterstitialListener`）：

tsx
复制代码

```
import {
  ATRewardVideoAutoAd,
  type ATRewardVideoListener,
} from '@anythink/react-native-sdk';

const pid = 'your placement id';

const listener: ATRewardVideoListener = {
  onRewardedVideoAdLoaded: () => {},
  onRewardedVideoAdFailed: (e) => console.log(e.fullErrorInfo),
  onReward: () => {
    // 发奖
  },
  onRewardedVideoAdClosed: () => {
    // 关闭后 SDK 自动补量，无需手动再 load
  },
};

ATRewardVideoAutoAd.setAdListener(pid, listener);
```

---

## 2. 加入 / 移除自动加载

tsx
复制代码

```
// 加入自动加载（SDK 开始托管该广告位的加载与缓存）
ATRewardVideoAutoAd.addPlacement(pid);

// 可传 settings
ATRewardVideoAutoAd.addPlacement(pid, { /* 自定义参数 */ });

// 不再需要时移除
ATRewardVideoAutoAd.removePlacement(pid);
```

---

## 3. 判断就绪并展示

> ⚠️ 自动加载模式的 `isAdReady` 为**同步**方法（直接返回 `boolean`），与手动模式的 `Promise<boolean>` 不同。

tsx
复制代码

```
if (ATRewardVideoAutoAd.isAdReady(pid)) {
  // ① 直接展示
  ATRewardVideoAutoAd.show(pid);

  // ② 带场景 ID
  ATRewardVideoAutoAd.show(pid, 'your_scenario_id');

  // ③ 带展示配置
  ATRewardVideoAutoAd.show(pid, {
    scenarioId: 'your_scenario_id',
    showCustomExt: 'your_custom_ext',
  });
}
```

`show()` 返回 `Promise<void>`，可按需 `await`。

---

## 4. 插屏自动加载

接口完全对称，把类名换成 `ATInterstitialAutoAd`、监听器换成 `ATInterstitialListener` 即可：

tsx
复制代码

```
import {
  ATInterstitialAutoAd,
  type ATInterstitialListener,
} from '@anythink/react-native-sdk';

const pid = 'your placement id';
const listener: ATInterstitialListener = {
  onInterstitialAdLoaded: () => {},
  onInterstitialAdClose: () => {},
};

ATInterstitialAutoAd.setAdListener(pid, listener);
ATInterstitialAutoAd.addPlacement(pid);

if (ATInterstitialAutoAd.isAdReady(pid)) {
  ATInterstitialAutoAd.show(pid);
}
```

---

## 5. 方法速查

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `setAdListener(pid, listener)` | `void` | 注册监听（与手动模式同款监听器） |
| `removeAdListener(pid)` | `void` | 注销监听 |
| `addPlacement(pid, settings?)` | `void` | 加入自动加载 |
| `removePlacement(pid)` | `void` | 移除自动加载 |
| `isAdReady(pid)` | `boolean`（同步） | 是否有缓存可展示 |
| `show(pid, scenarioOrConfig?)` | `Promise<void>` | 展示 |

---

## 6. 手动 vs 自动 选型

| 维度 | 手动模式 | 自动加载模式 |
| --- | --- | --- |
| 入口 | `new ATXxxAd(pid)` 实例 | `ATXxxAutoAd` 静态类 |
| 加载 | 业务自行 `load()` | SDK 托管，关闭后自动补量 |
| `isAdReady` | `Promise<boolean>` | `boolean`（同步） |
| `show()` | `void` | `Promise<void>` |
| 适用场景 | 需精确控制加载时机 | 高频展示、希望随时有广告可展示 |
| 支持广告样式 | 全部 | 仅插屏 / 激励视频 |
