---
title: "插屏广告"
source: "https://help.toponad.net/cn/docs/rMQKmdVN"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "广告样式", "插屏广告"]
content_sha256: "63ea65b6d8b1a6c1288f0e4c4dea96b612beab6c5154db935bbbe2a6a3be71d6"
knowledge_role: "reference_only"
has_article_body: true
---

# 插屏广告

> **💡Tips**
>
> - 插屏通过 `ATInterstitialAd` 实例接入：**一个 placementId 对应一个实例**。
> - 与激励视频不同，插屏**无发奖回调**，但有展示成功（`onInterstitialAdShow`）与视频播放回调。
> - 加载失败经 `onInterstitialAdLoadFail` 回调上报；展示失败经 `onInterstitialAdShowFailed` 回调上报，均不走 Promise.reject。
> - 展示前可调用 `ATInterstitialAd.entryAdScenario(placementId, scenarioId)` 上报进入广告场景（用于场景化统计）。
> - 如需由 SDK 托管加载、关闭后自动补量，请参考[自动加载模式](https://help.toponad.net/cn/docs/4hgahcLt)。

---

## 1. 设置回调监听

tsx
复制代码

```
import {
  ATInterstitialAd,
  type ATInterstitialListener,
} from '@anythink/react-native-sdk';

const listener: ATInterstitialListener = {
  onInterstitialAdLoaded: () => {
    // 加载成功
  },
  onInterstitialAdLoadFail: (error) => {
    console.log('load fail:', error.fullErrorInfo);
  },
  onInterstitialAdShow: (info) => {
    // 展示成功
  },
  onInterstitialAdShowFailed: (error) => {
    console.log('show fail:', error.fullErrorInfo);
  },
  onInterstitialAdClicked: (info) => {
    // 点击
  },
  onInterstitialAdClose: (info) => {
    // 关闭
  },
  onInterstitialAdVideoStart: (info) => {
    // 视频开始（视频类插屏）
  },
  onInterstitialAdVideoEnd: (info) => {
    // 视频结束
  },
  onInterstitialAdVideoError: (error) => {
    console.log('video error:', error.fullErrorInfo);
  },
};
```

---

## 2. 创建实例并注册监听

tsx
复制代码

```
import { useEffect, useRef } from 'react';
import { ATInterstitialAd } from '@anythink/react-native-sdk';

const adRef = useRef<ATInterstitialAd | null>(null);

useEffect(() => {
  const ad = new ATInterstitialAd('your placement id');
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
adRef.current?.load();

// 或带请求参数
adRef.current?.load({
  adxBidFloorInfo: { bidFloor: 1.0, currency: 'USD' },
});
```

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
// ① 直接展示
adRef.current?.show();

// ② 带广告场景 ID
adRef.current?.show('your_scenario_id');

// ③ 带展示配置
adRef.current?.show({
  scenarioId: 'your_scenario_id',
  showCustomExt: 'your_custom_ext',
});
```

---

## 6. 完整示例

tsx
复制代码

```
import { useEffect, useRef } from 'react';
import { Button, View } from 'react-native';
import {
  ATInterstitialAd,
  type ATInterstitialListener,
} from '@anythink/react-native-sdk';

export function InterstitialDemo() {
  const adRef = useRef<ATInterstitialAd | null>(null);

  const listener: ATInterstitialListener = {
    onInterstitialAdLoaded: () => console.log('loaded'),
    onInterstitialAdLoadFail: (e) => console.log('fail', e.fullErrorInfo),
    onInterstitialAdClose: () => console.log('closed'),
  };

  useEffect(() => {
    const ad = new ATInterstitialAd('your placement id');
    ad.setAdListener(listener);
    adRef.current = ad;
    return () => ad.removeAdListener();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View>
      <Button title="加载" onPress={() => adRef.current?.load()} />
      <Button
        title="展示"
        onPress={async () => {
          if (await adRef.current?.isAdReady()) {
            adRef.current?.show();
          }
        }}
      />
    </View>
  );
}
```

---

## 7. 监听器字段速查

| 回调 | 入参 | 说明 |
| --- | --- | --- |
| `onInterstitialAdLoaded` | — | 加载成功 |
| `onInterstitialAdLoadFail` | `AdError` | 加载失败 |
| `onInterstitialAdShow` | `ATAdInfo` | 展示成功 |
| `onInterstitialAdShowFailed` | `AdError` | 展示失败 |
| `onInterstitialAdClose` | `ATAdInfo` | 关闭 |
| `onInterstitialAdClicked` | `ATAdInfo` | 点击 |
| `onInterstitialAdVideoStart` | `ATAdInfo` | 视频开始 |
| `onInterstitialAdVideoEnd` | `ATAdInfo` | 视频结束 |
| `onInterstitialAdVideoError` | `AdError` | 视频播放失败 |
| `onDeeplinkCallback` | `ATAdInfo, boolean` | DeepLink 跳转结果 |
| `onDownloadConfirm` | `ATAdInfo` | 下载二次确认 |
