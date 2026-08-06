---
title: "错误码说明"
source: "https://help.toponad.net/cn/docs/qYfOSS"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-01-06"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "集成测试", "错误码说明"]
content_sha256: "e2bdb810799edfa9c795ca5fd4b58939d9b04a0ae2d21766bce03e7b58421343"
knowledge_role: "reference_only"
has_article_body: true
---

# 错误码说明

> **Tips:**
>
> - 为快速定位问题原因，建议通过`AdError#getFullErrorInfo()`获取全部错误信息
>
>   复制代码
>
>   ```
>   "code[ " + code + " ],desc[ " + desc + " ],
>   platformCode[ " + platformCode + " ],
>   platformMSG[ " + platformMSG + " ]"
>
>   code: TopOn SDK的错误码
>   desc: TopOn SDK的错误信息
>   platformCode: 第三方广告平台的错误码（广告没有填充时需要检查的错误码）
>   platformMsg: 第三方广告平台的错误信息（广告没有填充时需要检查的错误信息）
>   ```

## 1. TopOn错误码信息说明

| 错误码 | 说明 |
| --- | --- |
| 10001 | App ID或App Key错误，请**检查初始化TopOn SDK时传入的App ID和App Key** |
| 10003 | 1. App ID错误，请**检查初始化TopOn SDK时传入的App ID** 2. TopOn广告位ID与App ID不匹配，请**检查代码中调用load方法时传入的Placement ID** |
| 10004 | TopOn广告位ID错误，请**检查调用load方法时传入的Placement ID** |
| 9999 | 1. 网络请求出现错误，检查网络状态是否正常 2. 出现错误信息：chain validation failed，请检查是否有调整过测试设备的系统时间 |
| 9990 | HTTP接口请求返回的状态错误，需要联系TopOn同事查看错误信息 |
| 9991 | 接口请求返回的业务代码错误，需要联系TopOn同事查看错误信息 |
| 9992 | GDPR的等级设置过低，检查是否手动设置了FORBIDDEN等级 |
| 2001 | 广告加载超时，检查当前的测试的广告源是否是海外平台，手机网络是否已经翻墙 |
| 2002 | TopOn的SDK包导入不全，缺失第三方广告平台的Adapter包，确认是否已经按照指引导入聚合的第三方需要的SDK包 |
| 2003 | 当前广告位的展示次数已经达到上限，需要确认TopOn的后台配置是否限制了该广告位的展示次数 |
| 2004 | 当前广告位处于非展示时间段，需要确认TopOn的后台配置是否限制了广告位的展示间隔 |
| 2005 | 该广告位处于加载阶段，同一个广告位发起请求后，在接收到加载成功或失败的回调之前，该广告位不能发起下一次的加载，请等待加载成功、失败的回调 |
| 2006 | 检查导入第三方广告平台的SDK包是否齐全，如果齐全则检查导入的版本是否与GitHub上指定的版本是否相符合，否则需要将第三方SDK包补充完整 |
| 2007 | 通常发生于，在加载失败的回调中立刻发起广告加载。禁止在加载失败的回调中立刻发起广告加载，距离上一次该广告位加载失败需满足一定时间间隔才可发起广告加载，请延迟调用广告加载的时间 |
| 2008 | 同一个广告位加载失败后禁止在加载失败的回调里立马调用load方法进行重试，请延迟2s以上再进行重试 |
| 2009 | 在一定时间间隔内广告位的加载次数达到上限 |
| 3001 | 策略获取错误 1. 检查网络是否正常 2. 检查使用的appid，appkey，placementid是否匹配 3. **检查代码中appid，appkey，placementid是否正确并且匹配（不能包含空格）** |
| 3002 | 传入的appid, appkey，placementid其中有一个为空字符，请检查这些参数 |
| 3003 | 广告位与调用的API不匹配，例如：Banner的广告位调用了激励视频的API去加载广告 |
| **4001** | 通常发生于第三方广告平台返回错误导致没有广告填充，**可通过`AdError.getFullErrorInfo()`获取完全的错误信息，通过`platformCode`及`platformMsg`查看广告平台的错误码及错误信息，请查看第三方广告平台错误码进行排查** |
| 4002 | Context的上下文已经被销毁，需要重新创建相应的广告类型对象再重新发起广告加载 |
| 4003 | 该广告位的状态已经关闭，检查TopOn后台该广告位的状态开关是否开启 |
| 4004 | **该广告位没有在TopOn后台配置广告源的信息，需要到TopOn后台-聚合管理 为广告位添加第三方广告平台的广告源** |
| 4005 | 广告位下的所有广告源被过滤，可能的原因如下： 1. 检查是否在TopOn后台设置了广告源的**展示上限**、**展示间隔** 2. 如果只配置了头部竞价广告源，竞价失败时，头部竞价广告源将被过滤 |
| 4006 | 视频播放失败，参照 **4001错误码** 进行排查 |
| 4007 | 广告源竞价失败，参照 **4001错误码** 进行排查 |
| 4008 | 因为开发者代码中的自定义过滤逻辑，导致广告源被过滤。如果过滤不符合预期，请排查自定义过滤逻辑 |
| 4009 | 调试模式下，该广告位没有配置广告源信息 |

---

## 2. 第三方广告平台错误码

| ● [AdMob](https://support.google.com/admob/thread/3494603) | ● [Meta](https://developers.facebook.com/docs/audience-network/setting-up/test/checklist-errors) | ● [Mintegral](https://dev.mintegral.com/doc/index.html?file=sdk-m_sdk-android) | ● [Pangle](https://www.pangleglobal.com/integration/error-code) |
| --- | --- | --- | --- |
| ● [Huawei](https://developer.huawei.com/consumer/en/doc/HMSCore-References/android-error-code-0000001130129080) | ● [AppLovin](https://developers.applovin.com/en/max/react-native/overview/error-handling#max-error-codes) | ● [Unity Ads](https://docs.unity.com/ads/en-us/manual/AndroidAPI#Enums) | ● [Digital Turbine(Fyber)](https://developer.fyber.com/hc/en-us/articles/360011618158-SDK-init#callback-completion-error-codes-0-2) |
| ● [Chartboost](https://docs.chartboost.com/en/mediation/integrate/android/error-codes/) | ● [ironSource](https://developers.is.com/ironsource-mobile/android/advanced-settings/#step-5) | ● [Liftoff(Vungle)](https://support.vungle.com/hc/zh-cn/articles/360047780372-%E9%AB%98%E7%BA%A7%E8%AE%BE%E7%BD%AE#h_01HDQ9W4QD3P8AKNYZDS939HHA) | ● [InMobi](https://support.inmobi.com/monetize/best-practices/advertiser-reporting-api-guide-v1.0/#page__error-codes) |
| ● [Ogury](https://ogury-ltd.gitbook.io/android) | ● [Maio](https://github.com/imobile-maio/maio-Android-SDK/wiki/API-Reference-(EN)#failnotificationreason-enum-1) | ● [Nend](https://github.com/fan-ADN/nendSDK-Android/wiki/Implementation-for-banner-ads#content-of-enum-nenderror) | ● [Yandex](https://yandex.com/dev/direct/doc/dg-v4/reference/ErrorCodes.html) |
| ● [Bigo](https://www.bigossp.com/guide/sdk/android/document) |  |  |  |
