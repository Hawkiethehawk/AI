---
title: "一键静音"
source: "https://help.toponad.net/cn/docs/yi-jian-jing-yin-nEAm"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-01-05"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "一键静音"]
content_sha256: "c5a363bb882a5e5b746c95368f2df448d3df6bc592619c815a8db1652ada0e62"
knowledge_role: "reference_only"
has_article_body: true
---

# 一键静音

## 1. 功能说明

您可以通过代码设置一键关闭第三方广告SDK的音量。本接口是实时生效的，您可以在初始化的时候设置，也可以在想要静音的广告位加载前设置。

> 此功能在SDK v6.5.15及其以上版本支持。

## 2. 支持范围

| 支持的广告平台 | 支持的广告样式 |
| --- | --- |
| AdMob | 所有广告形式 |
| Inmobi | 所有广告形式 |
| AppLovin | 所有广告形式 |
| Mintegral | 原生、插屏、激励视频 |
| Fyber | 激励、插屏、Banner |
| Bigo | 原生 |
| Xiaomi Columbus | 原生 |
| Max | 所有广告形式 |
| Appnext | 原生 |
| Taurusx | 激励、插屏、开屏 |

> 温馨提示: 自定义广告平台不支持

## 3. 示例代码

java
复制代码

```
 // v6.5.15及以上支持，SDK初始化之前调用
ATSDKGlobalSetting.setAdMuted(true);
```

java
复制代码

```
 // v6.5.15及以上支持，SDK初始化之前调用
TUSDKGlobalSetting.setAdMuted(true);
```

> ### 注意事项
>
> - 如果调用了setAdMuted API，设置为true则静音，设为false则不静音
> - setAdMuted API优先级大于后台配置，若API和后台都设置则以API设置为准。
