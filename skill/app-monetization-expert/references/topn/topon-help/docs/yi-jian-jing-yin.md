---
title: "一键静音"
source: "https://help.toponad.net/cn/docs/yi-jian-jing-yin"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-08-15"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "一键静音"]
content_sha256: "46ed059e4150096d76e316fb66e5e53ced8ef7a9632d5ba5ead87c32e3a9d4bd"
knowledge_role: "reference_only"
has_article_body: true
---

# 一键静音

## 1. 一键静音功能说明

您可以通过代码设置一键关闭第三方广告SDK的音量。本接口是实时生效的，您可以在初始化的时候设置，也可以在想要静音的广告位加载前设置。

> 此功能在SDK v6.4.89及其以上版本支持。

## 2. 支持范围

| 支持的广告平台 | 支持的广告样式 |
| --- | --- |
| AdMob | 所有广告形式 |
| Inmobi | 所有广告形式 |
| AppLovin | 所有广告形式 |
| Mintegral | 原生、插屏、激励视频 |
| Fyber | 插屏 |
| 腾讯优量汇 | 插屏、激励、原生 |
| 快手 | 插屏、激励、原生仅draw类型 |
| 爱奇艺 | 激励、横幅、原生 |
| 美数 | 插屏、激励、原生 |
| Tanx | 激励、原生 |

> 温馨提示: 自定义广告平台不支持

## 3. 示例代码

objc
复制代码

```
//#import <AnyThinkSDK/AnyThinkSDK.h>
[[ATSDKGlobalSetting sharedManager] setIsMute:YES];
```

> ### 注意事项
>
> - 如果调用了setIsMute API，即以API为准，设置为YES则静音，设为NO则不静音
> - 如果没有调用setIsMute API，TopOn后台又进行了配置，则以TopOn后台配置为准
> - 对于Admob，无论通过API 设置YES或者NO，或者通过TopOn后台开启或关闭，都会静音
