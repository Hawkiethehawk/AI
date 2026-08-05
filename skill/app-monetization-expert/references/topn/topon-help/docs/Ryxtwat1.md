---
title: "激励视频广告"
source: "https://help.toponad.net/cn/docs/Ryxtwat1"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "广告样式", "激励视频广告"]
content_sha256: "763b76f457cfc6e97bf9befa08fe4d382b30402448ba1b986e99fedbe768ac94"
knowledge_role: "reference_only"
has_article_body: true
---

# 激励视频广告

> **💡Tips**
>
> - 激励视频通过 `ATRewardVideoAd` 实例接入：**一个 placementId 对应一个实例**。
> - 加载 / 展示失败经监听器的 `onRewardedVideoAdFailed` 等回调上报，不走 Promise.reject。
> - 激励视频额外提供**发奖回调**（`onReward`）与视频播放状态回调。
> - 如需由 SDK 托管加载、关闭后自动补量，请参考[自动加载模式](https://help.toponad.net/cn/docs/4hgahcLt)。

---

## 1. 设置回调监听

加载前先注册激励视频监听器。`ATRewardVideoListener` 各字段均为可选，按需实现：

tsx
复制代码

```
import {
  ATRewardVideoAd,
  type ATRewardVideoListener,
} from '@anythink/react-native-sdk';

const listener: ATRewardVideoListener = {
  onRewardedVideoAdLoaded: () => {
    // 加载成功，可以展示
  },
  onRewardedVideoAdFailed: (error) => {
    // 加载失败
    console.log('load fail:', error.fullErrorInfo);
  },
  onRewardedVideoAdPlayStart: (info) => {
    // 开始播放
  },
  onRewardedVideoAdPlayEnd: (info) => {
    // 播放结束
  },
  onRewardedVideoAdClosed: (info) => {
    // 广告关闭
  },
  onRewardedVideoAdPlayClicked: (info) => {
    // 广告被点击
  },
  onReward: (info) => {
    // 发奖成功，在此处理奖励逻辑
  },
  onRewardFailed: (info) => {
    // 发奖失败
  },
};
```

---

## 2. 创建实例并注册监听

建议在组件中用 `useRef` 持有实例，并在卸载时注销监听：

tsx
复制代码

```
import { useEffect, useRef } from 'react';
import { ATRewardVideoAd } from '@anythink/react-native-sdk';

const adRef = useRef<ATRewardVideoAd | null>(null);

useEffect(() => {
  const ad = new ATRewardVideoAd('your placement id');
  ad.setAdListener(listener);
  adRef.current = ad;
  return () => ad.removeAdListener(); // 卸载时注销，避免串位
}, []);
```

---

## 3. 加载广告

tsx
复制代码

```
adRef.current?.load();
```

如需指定底价 / 渠道等请求参数，可传入 `ATAdRequest`：

tsx
复制代码

```
adRef.current?.load({
  channelSource: 1,
  adxBidFloorInfo: { bidFloor: 1.5, currency: 'USD' },
});
```

---

## 4. 判断广告是否就绪

tsx
复制代码

```
const ready = await adRef.current?.isAdReady();
if (ready) {
  // 有缓存广告，可以展示
}
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

// ③ 带展示配置（场景 ID + 自定义透传）
adRef.current?.show({
  scenarioId: 'your_scenario_id',
  showCustomExt: 'your_custom_ext',
});
```

> 💡 展示前可调用 `ATRewardVideoAd.entryAdScenario(placementId, scenarioId)` 上报进入广告场景（用于场景化数据统计）。

---

## 6. 二次激励（Again）

部分广告源支持二次激励，对应 `onRewardedVideoAdAgainPlayStart` / `onAgainReward` 等回调。如有此需求，在监听器中实现 `onXxxAgainXxx` 字段即可，调用方式与首次激励一致。

---

## 7. 完整示例

tsx
复制代码

```
import { useEffect, useRef, useState } from 'react';
import { Button, View } from 'react-native';
import {
  ATRewardVideoAd,
  type ATRewardVideoListener,
} from '@anythink/react-native-sdk';

export function RewardDemo() {
  const adRef = useRef<ATRewardVideoAd | null>(null);
  const [rewarded, setRewarded] = useState(false);

  const listener: ATRewardVideoListener = {
    onRewardedVideoAdLoaded: () => console.log('loaded'),
    onRewardedVideoAdFailed: (e) => console.log('fail', e.fullErrorInfo),
    onReward: () => setRewarded(true),
    onRewardedVideoAdClosed: () => {
      if (rewarded) {
        // 发放奖励给用户
      }
    },
  };

  useEffect(() => {
    const ad = new ATRewardVideoAd('your placement id');
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
            adRef.current?.show('your_scenario_id');
          }
        }}
      />
    </View>
  );
}
```

---

## 8. 监听器字段速查

| 回调 | 入参 | 说明 |
| --- | --- | --- |
| `onRewardedVideoAdLoaded` | — | 加载成功 |
| `onRewardedVideoAdFailed` | `AdError` | 加载失败 |
| `onRewardedVideoAdPlayStart` | `ATAdInfo` | 开始播放 |
| `onRewardedVideoAdPlayEnd` | `ATAdInfo` | 播放结束 |
| `onRewardedVideoAdPlayFailed` | `AdError, ATAdInfo?` | 播放失败 |
| `onRewardedVideoAdClosed` | `ATAdInfo` | 关闭 |
| `onRewardedVideoAdPlayClicked` | `ATAdInfo` | 点击 |
| `onReward` | `ATAdInfo` | 发奖成功 |
| `onRewardFailed` | `ATAdInfo` | 发奖失败 |
| `onDeeplinkCallback` | `ATAdInfo, boolean` | DeepLink 跳转结果 |
| `onDownloadConfirm` | `ATAdInfo` | 下载二次确认 |
| `onRewardedVideoAdAgain*` / `onAgainReward` | — | 二次激励相关 |
