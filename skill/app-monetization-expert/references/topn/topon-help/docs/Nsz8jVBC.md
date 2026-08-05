---
title: "开屏广告"
source: "https://help.toponad.net/cn/docs/Nsz8jVBC"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "广告样式", "开屏广告"]
content_sha256: "e1991a0ccaad9112f68447106c59ec4f0ce4e5a83383b3e6ac6e6c11a58bd116"
knowledge_role: "reference_only"
has_article_body: true
---

# 开屏广告

> **💡Tips**
>
> - 开屏通过 `ATSplashAd` 实例接入：**一个 placementId 对应一个实例**。
> - 开屏 `load()` 支持设置**拉取超时**（`fetchAdTimeout`，毫秒）；加载失败 / 超时经监听器回调上报。
> - 开屏**无自动加载模式**（仅插屏 / 激励支持 AutoLoad）。
> - 开屏默认全屏展示；半屏 / 自定义高度依赖原生侧配置（公开 TS 类型暂未开放高度字段，详见 §5）。
> - 展示前可调用 `ATSplashAd.entryAdScenario(placementId, scenarioId)` 上报进入广告场景（用于场景化统计）。

---

## 1. 设置回调监听

tsx
复制代码

```
import {
  ATSplashAd,
  type ATSplashListener,
} from '@anythink/react-native-sdk';

const listener: ATSplashListener = {
  onSplashAdLoaded: (isTimeout) => {
    // 加载成功；isTimeout 表示是否为超时后兜底返回
  },
  onSplashAdLoadFail: (error) => {
    console.log('load fail:', error.fullErrorInfo);
  },
  onSplashAdTimeout: () => {
    // 加载超时（可在此跳过开屏直接进主页）
  },
  onSplashAdShow: (info) => {
    // 展示成功
  },
  onSplashAdShowFailed: (error) => {
    // 展示失败
  },
  onSplashAdClick: (info) => {
    // 点击
  },
  onSplashAdClose: (info) => {
    // 关闭（在此跳转主页面）
  },
};
```

---

## 2. 创建实例并注册监听

tsx
复制代码

```
import { useEffect, useRef } from 'react';
import { ATSplashAd } from '@anythink/react-native-sdk';

const adRef = useRef<ATSplashAd | null>(null);

useEffect(() => {
  const ad = new ATSplashAd('your placement id');
  ad.setAdListener(listener);
  adRef.current = ad;
  return () => ad.removeAdListener();
}, []);
```

---

## 3. 加载广告

tsx
复制代码

```
// 直接加载
adRef.current?.load();

// 带拉取超时（毫秒）与请求参数
adRef.current?.load({ channelSource: 1 }, 5000);
```

> 💡 开屏对时效敏感，建议在闪屏页一进入就 `load()`，并通过 `fetchAdTimeout` 设定兜底超时，避免长时间白屏。

---

## 4. 判断广告是否就绪

tsx
复制代码

```
const ready = await adRef.current?.isAdReady();
```

---

## 5. 展示广告

`show()` 支持三种入参形态：

tsx
复制代码

```
// ① 直接展示（默认全屏）
adRef.current?.show();

// ② 带广告场景 ID
adRef.current?.show('your_scenario_id');

// ③ 带展示配置（场景 ID + 自定义透传）
adRef.current?.show({
  scenarioId: 'your_scenario_id',
  showCustomExt: 'your_custom_ext',
});
```

> 💡 开屏默认全屏展示。`SplashShowConfig` 当前在 TS 类型上仅暴露 `scenarioId` / `showCustomExt`（高度相关字段未在公开类型中开放）。如需半屏 / 预留底部 Logo 区的开屏，请参考原生侧配置或联系 TopOn 技术支持。

---

## 6. 完整示例

tsx
复制代码

```
import { useEffect, useRef } from 'react';
import {
  ATSplashAd,
  type ATSplashListener,
} from '@anythink/react-native-sdk';

export function SplashDemo({ onFinish }: { onFinish: () => void }) {
  const adRef = useRef<ATSplashAd | null>(null);

  const listener: ATSplashListener = {
    onSplashAdLoaded: () => adRef.current?.show(),
    onSplashAdLoadFail: () => onFinish(),
    onSplashAdTimeout: () => onFinish(),
    onSplashAdClose: () => onFinish(),
  };

  useEffect(() => {
    const ad = new ATSplashAd('your placement id');
    ad.setAdListener(listener);
    adRef.current = ad;
    ad.load(undefined, 5000); // 5s 兜底超时
    return () => ad.removeAdListener();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
```

---

## 7. 监听器字段速查

| 回调 | 入参 | 说明 |
| --- | --- | --- |
| `onSplashAdLoaded` | `boolean`（isTimeout） | 加载成功 |
| `onSplashAdLoadFail` | `AdError` | 加载失败 |
| `onSplashAdTimeout` | — | 加载超时 |
| `onSplashAdShow` | `ATAdInfo` | 展示成功 |
| `onSplashAdShowFailed` | `AdError` | 展示失败 |
| `onSplashAdClick` | `ATAdInfo` | 点击 |
| `onSplashAdClose` | `ATAdInfo` | 关闭 |
| `onDeeplinkCallback` | `ATAdInfo, boolean` | DeepLink 跳转结果 |
| `onDownloadConfirm` | `ATAdInfo` | 下载二次确认 |
