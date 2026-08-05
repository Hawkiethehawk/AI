---
title: "Cocos SDK API 迁移指南"
source: "https://help.toponad.net/cn/docs/Cocos-SDK-API-qian-yi-zhi-nan"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-06-04"
category_path: ["TopOn SDK接入指南", "Cocos Creator接入指南", "Cocos SDK API 迁移指南"]
content_sha256: "7267d4165a685e2ccba169a302c621c7a1266a4ecf00213b389f24cd6b323d99"
knowledge_role: "reference_only"
has_article_body: true
---

# Cocos SDK API 迁移指南

本文档提供了从旧版 Cocos SDK API 迁移到新版 API 的详细指南。

## 文件名变化

| 旧版文件 | 新版文件 |
| --- | --- |
| ATJSSDK.ts | ATSDK.ts |
| ATBannerTSSDK.ts | ATBanner.ts |
| ATIntersitialTSSDK.ts | ATInterstitial.ts |
| ATIntersitialAutoTSSDK.ts | ATInterstitialAuto.ts |
| ATNativeTSSDK.ts | ATNative.ts |
| ATRewardedVideoTSSDK.ts | ATRewardedVideo.ts |
| ATRewardedAutoVideoTSSDK.ts | ATRewardedAutoVideo.ts |

---

## ATSDK 迁移

> - 导入变化
>
> typescript
> 复制代码
>
> ```
> // 旧版
> import { ATJSSDK } from "./ATJSSDK";
>
> // 新版
> import { ATSDK } from "./ATSDK";
> ```
>
> - 方法名**无**变化

---

## ATBanner 迁移

> - 导入变化
>
> typescript
> 复制代码
>
> ```
> // 旧版
> import { ATBannerTSSDK } from "./ATBannerTSSDK";
>
> // 新版
> import { ATBannerSDK } from "./ATBanner";
> ```
>
> - 方法名变化
>
> | 旧版方法 (ATBannerTSSDK) | 新版方法 (ATBannerSDK) | 说明 |
> | --- | --- | --- |
> | loadBanner | loadAd | 方法名变更 |
> | - | showAdInPositionAndScenario | 新增方法 |
> | - | showAdInRectangleAndScenario | 新增方法 |
> | 其余方法**无**变化 |  |  |

---

## ATInterstitial 迁移

> - 导入变化
>
> typescript
> 复制代码
>
> ```
> // 旧版
> import { ATIntersitialTSSDK } from "./ATIntersitialTSSDK";
>
> // 新版
> import { ATInterstitialSDK } from "./ATInterstitial";
> ```
>
> - 方法名变化
>
> | 旧版方法 (ATIntersitialTSSDK) | 新版方法 (ATInterstitialSDK) | 说明 |
> | --- | --- | --- |
> | loadInterstitial | loadAd | 方法名变更 |
> | - | entryAdScenario | 新增方法 |
> | 其余方法**无**变化 |  |  |

---

## ATInterstitialAuto 迁移

> - 导入变化
>
> typescript
> 复制代码
>
> ```
> // 旧版
> import { ATIntersitialAutoTSSDK } from "./ATIntersitialAutoTSSDK";
>
> // 新版
> import { ATInterstitialAutoAdSDK } from "./ATInterstitialAuto";
> ```
>
> - 方法名变化
>
> | 旧版方法 (ATIntersitialAutoTSSDK) | 新版方法 (ATInterstitialAutoAdSDK) | 说明 |
> | --- | --- | --- |
> | - | entryAdScenario | 新增方法 |
> | 其余方法**无**变化 |  |  |

---

## ATNative 迁移

> - 导入变化
>
> typescript
> 复制代码
>
> ```
> // 旧版
> import { ATNativeTSSDK } from "./ATNativeTSSDK";
>
> // 新版
> import { ATNativeSDK } from "./ATNative";
> ```
>
> - 方法名变化
>
> | 旧版方法 (ATNativeTSSDK) | 新版方法 (ATNativeSDK) | 说明 |
> | --- | --- | --- |
> | loadNative | loadAd | 方法名变更 |
> | - | entryAdScenario | 新增方法 |
> | 其余方法**无**变化 |  |  |
>
> - 类变化
>
> `AdViewProperty` 类保持不变，但需要从 `ATNative` 导入：
>
> typescript
> 复制代码
>
> ```
> // 旧版
> import { AdViewProperty } from "./ATNativeTSSDK";
>
> // 新版
> import { AdViewProperty } from "./ATNative";
> ```

---

## ATRewardedVideo 迁移

> - 导入变化
>
> typescript
> 复制代码
>
> ```
> // 旧版
> import { ATRewardedVideoTSSDK } from "./ATRewardedVideoTSSDK";
>
> // 新版
> import { ATRewardedVideoSDK } from "./ATRewardedVideo";
> ```
>
> - 方法名变化
>
> | 旧版方法 (ATRewardedVideoTSSDK) | 新版方法 (ATRewardedVideoSDK) | 说明 |
> | --- | --- | --- |
> | loadRewardedVideo | loadAd | 方法名变更 |
> | - | entryAdScenario | 新增方法 |
> | 其余方法**无**变化 |  |  |

---

## ATRewardedAutoVideo 迁移

> - 导入变化
>
> typescript
> 复制代码
>
> ```
> // 旧版
> import { ATRewardedAutoVideoTSSDK } from "./ATRewardedAutoVideoTSSDK";
>
> // 新版
> import { ATRewardedVideoAutoAdSDK } from "./ATRewardedAutoVideo";
> ```
>
> - 方法名变化
>
> | 旧版方法 (ATRewardedAutoVideoTSSDK) | 新版方法 (ATRewardedVideoAutoAdSDK) | 说明 |
> | --- | --- | --- |
> | - | entryAdScenario | 新增方法 |
> | 其余方法**无**变化 |  |  |

---

📌 迁移示例Code

typescript
复制代码

```
//初始化 SDK
// 旧版
import { ATJSSDK } from "./ATJSSDK";
ATJSSSDK.initSDK("appId", "appKey");
// 新版
import { ATSDK } from "./ATSDK";
ATSDK.initSDK("appId", "appKey");

// 加载横幅广告
// 旧版
import { ATBannerTSSDK } from "./ATBannerTSSDK";
ATBannerTSSDK.loadBanner("placementId", settings);
// 新版
import { ATBannerSDK } from "./ATBanner";
ATBannerSDK.loadAd("placementId", settings);

// 加载插屏广告
// 旧版
import { ATIntersitialTSSDK } from "./ATIntersitialTSSDK";
ATIntersitialTSSDK.loadInterstitial("placementId", settings);
// 新版
import { ATInterstitialSDK } from "./ATInterstitial";
ATInterstitialSDK.loadAd("placementId", settings);

// 加载原生广告
// 旧版
import { ATNativeTSSDK } from "./ATNativeTSSDK";
ATNativeTSSDK.loadNative("placementId", settings);
// 新版
import { ATNativeSDK } from "./ATNative";
ATNativeSDK.loadAd("placementId", settings);

// 加载激励视频广告
// 旧版
import { ATRewardedVideoTSSDK } from "./ATRewardedVideoTSSDK";
ATRewardedVideoTSSDK.loadRewardedVideo("placementId", settings);
// 新版
import { ATRewardedVideoSDK } from "./ATRewardedVideo";
ATRewardedVideoSDK.loadAd("placementId", settings);
```

---

## 总结

主要迁移变化：

1. 文件名简化，移除了 "TSSDK" 后缀
2. 主要加载方法统一为 `loadAd`
3. 部分模块新增了 `entryAdScenario` 方法
4. 类和常量的访问方式保持不变，但需要从新的模块导入

---
