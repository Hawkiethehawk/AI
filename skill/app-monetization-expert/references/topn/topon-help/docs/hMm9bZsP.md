---
title: "海外隐私配置"
source: "https://help.toponad.net/cn/docs/hMm9bZsP"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "政策合规", "海外隐私配置"]
content_sha256: "8e690b111d66a3917759b58710414691ca872d812afda4af683262b7069835e7"
knowledge_role: "reference_only"
has_article_body: true
---

# 海外隐私配置

> **💡Tips**
>
> - ⚠️ 隐私合规相关配置建议在 `ATSDK.init()` **之前**调用，以确保 SDK 初始化时即遵循对应策略。
> - 出海应用需遵守 GDPR（欧盟）、COPPA / CCPA（美国）等隐私法规。
> - TopOn React Native SDK 通过 **GDPR 数据上传等级** + **个性化广告开关**控制数据合规，并提供 EU 流量判定与内置同意弹窗。

---

## 1. 概述

| 能力 | 对应方法 |
| --- | --- |
| 设置个性化广告开关 | `ATSDK.setPersonalizedAdStatus(status)` |
| 设置 GDPR 数据上传等级 | `ATSDK.setGDPRUploadDataLevel(level)` |
| 读取 GDPR 数据等级 | `ATSDK.getGDPRDataLevel()` |
| 弹出 GDPR 授权弹窗 | `ATSDK.showGDPRConsentDialog(appId?)` |
| 判定是否 EU 流量 | `ATSDK.checkIsEuTraffic()` / `ATSDK.isEUTraffic()` |
| 限制设备信息上传 | `ATSDK.deniedUploadDeviceInfo(...keys)` |
| 设置广告源隐私策略 | `ATSDK.setAdSourcePrivacyPolicy(policyJson)` |

---

## 2. 个性化广告开关

用 `setPersonalizedAdStatus` 设置是否投放个性化广告，入参取以下常量：

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `ATSDK.PERSONALIZED` | `0` | 允许个性化广告 |
| `ATSDK.NONPERSONALIZED` | `1` | 限制为非个性化广告 |
| `ATSDK.UNKNOWN` | `2` | 未知 / 未设置 |

tsx
复制代码

```
import { ATSDK } from '@anythink/react-native-sdk';

// 用户同意个性化广告
ATSDK.setPersonalizedAdStatus(ATSDK.PERSONALIZED);

// 用户不同意
ATSDK.setPersonalizedAdStatus(ATSDK.NONPERSONALIZED);
```

---

## 3. GDPR 数据上传等级

适用于欧盟及欧洲经济区用户。根据用户授权状态设置数据上传等级（取值同上常量）：

tsx
复制代码

```
// 用户同意 → 允许上传个性化数据
ATSDK.setGDPRUploadDataLevel(ATSDK.PERSONALIZED);

// 用户不同意 → 仅上传非个性化数据
ATSDK.setGDPRUploadDataLevel(ATSDK.NONPERSONALIZED);

// 读取当前等级
const level = await ATSDK.getGDPRDataLevel();
```

> 📌 当设置为非个性化时，SDK 会通知各广告平台不进行个性化投放，部分平台可能降低填充率或收益。

---

## 4. EU 流量判定与同意弹窗

可先判定当前是否为受 GDPR 约束的 EU 流量，再决定是否弹出授权：

tsx
复制代码

```
const isEu = await ATSDK.checkIsEuTraffic();
if (isEu) {
  // 弹出 GDPR 同意弹窗（appId 可选）
  ATSDK.showGDPRConsentDialog();

  // 二次确认弹窗
  // ATSDK.showGDPRConsentSecondDialog();
}
```

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `checkIsEuTraffic()` | `Promise<boolean>` | **判定 EU 流量首选** |
| `isEUTraffic()` | `Promise<boolean>` | 同义兼容接口，已有 `checkIsEuTraffic` 时无需再用 |
| `showGDPRConsentDialog(appId?)` | `void` | **弹出 GDPR 同意弹窗首选** |
| `showGDPRConsentSecondDialog(appId?)` | `void` | 二次确认弹窗（用户首次未明确选择时补充弹出） |
| `showGdprAuth()` | `void` | GDPR 授权入口（特定授权场景使用） |

> 💡 选型建议：判定流量用 `checkIsEuTraffic()`、弹同意框用 `showGDPRConsentDialog()` 即可覆盖绝大多数场景；`isEUTraffic` / `showGdprAuth` / `showGDPRConsentSecondDialog` 为兼容 / 特定场景接口，按需选用。以上 5 个方法均在 SDK 中真实存在。

---

## 5. 限制设备信息上传

按需禁止上传特定设备信息字段：

tsx
复制代码

```
ATSDK.deniedUploadDeviceInfo('imei', 'oaid');
```

> 💡 入参为设备信息字段名的可变参数（如 `imei` / `oaid` 等），可传入一个或多个。可禁止上传的具体字段集以原生 SDK 文档为准——传入未识别的字段不会报错，但也不产生效果。

---

## 6. 广告源隐私策略

如需对各广告源单独下发隐私策略，传入 JSON 字符串：

tsx
复制代码

```
const policy = {
  networkFirmIds: [1, 2, 3],  // 仅对指定平台生效；省略则全部
  agreePrivacyStrategy: true,
  isCanUseAppList: false,
  isCanUseOaid: false,
  isCanUseAndroidId: false,
  isCanUseLocation: false,
  isCanUseWifiState: true,
  customOaid: 'your-oaid-if-needed',
  customLocation: { latitude: 39.9, longitude: 116.4 },
};

ATSDK.setAdSourcePrivacyPolicy(JSON.stringify({ /* policy */ }));
```

---

## 7. 注意事项

| 方法 | 调用时机 | 说明 |
| --- | --- | --- |
| `setPersonalizedAdStatus` | 建议 `init` 之前 | 未设置时按 SDK 默认 |
| `setGDPRUploadDataLevel` | 建议 `init` 之前 | 影响初始化阶段的数据上传策略 |
| `deniedUploadDeviceInfo` | 建议 `init` 之前 | 限制设备信息采集 |

## 8. COPPA / CCPA

> ⚠️ **RN SDK 层未暴露 COPPA / CCPA 专用 API** —— `ATSDK` 不提供 `setIsAgeRestrictedUser` / `setDoNotSell` 之类的方法，**接入侧无需额外代码**。

| 法规 | 适用地区 | 配置方式 |
| --- | --- | --- |
| COPPA | 美国（13 岁以下儿童） | TopOn 控制台开关 |
| CCPA | 美国加利福尼亚州 | TopOn 控制台开关 |

配置步骤：登录 [TopOn 控制台](https://www.toponad.com/) → 进入目标应用 → 隐私合规模块 → 启用 COPPA / CCPA 开关。控制台配置后，SDK 在请求广告时即按对应法规处理，RN 端无需调用任何方法。

> 📌 出海美国市场的应用请勿仅用 GDPR 覆盖欧洲而忽略 CCPA / COPPA，相关开关在控制台启用即可生效。
