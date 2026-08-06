---
title: "隐私政策&数据收集"
source: "https://help.toponad.net/cn/docs/yin-si-xin-xi-shuo-ming"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "政策合规", "隐私政策&数据收集"]
content_sha256: "4cc4849b4d3284ba4561c75e50a4da21e32560ba76995aeceb9b573bf5d2a253"
knowledge_role: "reference_only"
has_article_body: true
---

# 隐私政策&数据收集

## **1**. 关于 iOS 隐私政策

从2020年12月8日开始，Apple App Store要求App更新和新App上架都必须披露[App隐私政策](https://developer.apple.com/app-store/app-privacy-details/)，即需要开发者提供App中以及App中所有第三方SDK使用的隐私信息。

本章节为您列出TopOn iOS SDK和TopOn iOS SDK聚合的第三方广告平台SDK收集的数据项目，您可以通过访问[《TopOn隐私政策》](/cn/docs/1Mn1B7)和[《隐私合规指南》](/cn/docs/ByIf1V)进一步了解我们的隐私政策以及我们对个人信息的处理和保护策略。

## **2**. TopOn iOS SDK 收集的信息

### 2.1 设备信息

TopOn iOS SDK 默认会收集以下设备信息：

| 参数 | 说明 |
| --- | --- |
| 操作系统 | 设备的操作系统（如：Android/iOS） |
| 系统版本名 | 设备的系统版本名 |
| 系统版本号 | 设备的系统版本号 |
| 应用包名 | 当前应用的包名 |
| 应用版本名 | 当前应用版本名 |
| 应用版本号 | 当前应用版本名 |
| 设备品牌 | 移动设备的品牌名称 |
| 设备型号 | 移动设备的型号名称 |
| 分辨率 | 设备的屏幕分辨率 |
| 屏幕方向 | 设备的屏幕方向（如：1：竖屏，2：横屏） |
| 网络类型 | 网络类型（如：WiFi、3G、4G） |
| 移动网络代码 | 移动设备网络代码 |
| 移动国家代码 | 移动设备国家代码 |
| 系统语言 | 系统语言（如：zh-CN） |
| 时区 | 时区（如：GMT+08:00） |
| IP地址 | 设备的IP地址 |
| User Agent | User Agent信息 |
| IDFA | 设备广告标识符 |
| IDFV | 应用开发商标识符 |
| 系统启动时间 | 设备的启动时间 |
| 传感器信息 | 陀螺仪相关信息 |

TopOn iOS SDK收集的设备信息将用于：

- 为了您可以基于设备信息，在TopOn调整广告投放策略。
- TopOn基于设备信息分析广告行为(如广告加载、展示、点击等）。

我们尊重您的设备信息共享选择权，如果您不希望其设备信息被我们处理，可以通过API限制我们上报相关信息：

复制代码

```
[[ATAPI sharedInstance] setDeniedUploadInfoArray:@[kATDeviceDataInfoOSVersionNameKey,
                                                   kATDeviceDataInfoOSVersionCodeKey,
                                                   kATDeviceDataInfoPackageNameKey,
                                                   kATDeviceDataInfoAppVersionNameKey,
                                                   kATDeviceDataInfoAppVersionCodeKey,
                                                   kATDeviceDataInfoBrandKey,
                                                   kATDeviceDataInfoModelKey,
                                                   kATDeviceDataInfoScreenKey,
                                                   kATDeviceDataInfoNetworkTypeKey,
                                                   kATDeviceDataInfoMNCKey,
                                                   kATDeviceDataInfoMCCKey,
                                                   kATDeviceDataInfoLanguageKey,
                                                   kATDeviceDataInfoTimeZoneKey,
                                                   kATDeviceDataInfoUserAgentKey,
                                                   kATDeviceDataInfoOrientKey,
                                                   kATDeviceDataInfoIDFAKey,
                                                   kATDeviceDataInfoIDFVKey]
 ];
```

- 所用参数说明如下：

| Key | Note |
| --- | --- |
| kATDeviceDataInfoOSVersionNameKey | 系统版本名 |
| kATDeviceDataInfoOSVersionCodeKey | 系统版本号 |
| kATDeviceDataInfoPackageNameKey | 应用包名 |
| kATDeviceDataInfoAppVersionNameKey | 应用版本名 |
| kATDeviceDataInfoAppVersionCodeKey | 应用版本号 |
| kATDeviceDataInfoBrandKey | 设备品牌 |
| kATDeviceDataInfoModelKey | 设备型号 |
| kATDeviceDataInfoScreenKey | 屏幕分辨率 |
| kATDeviceDataInfoOrientKey | 屏幕方向 |
| kATDeviceDataInfoNetworkTypeKey | 网络类型 |
| kATDeviceDataInfoMNCKey | 移动网络代码 |
| kATDeviceDataInfoMCCKey | 移动国家代码 |
| kATDeviceDataInfoLanguageKey | 系统语言 |
| kATDeviceDataInfoTimeZoneKey | 时区 |
| kATDeviceDataInfoUserAgentKey | User Agent |
| kATDeviceDataInfoIDFAKey | idfa |
| kATDeviceDataInfoIDFVKey | idfv |

### 2.2 关于设备ID（IDFA）

当您在没有授权APP获取设备ID时，TopOn iOS SDK中提供了API供您传入设备ID。您可以通过以下表格支持设置IDFA的平台有：

| 平台 |
| --- |
| 穿山甲 |
| 快手 |
| 游可盈 |

其他平台相关设置说明：

| 平台 | 说明 |
| --- | --- |
| Vungle | 是否收集IDFV |
| 优量汇 | 是否收集IDFA |
| 百度 | 是否收集CAID(中国广告协会互联网广告标识)( 5.3xx版本后，百度已经标识未废弃状态) |

没有说明的平台表明还没有相关支持。您可以参考如下示例代码：

复制代码

```
#import <AnyThinkKuaiShouAdapter/AnyThinkKuaiShouAdapter.h>
#import <AnyThinkKlevinAdapter/AnyThinkKlevinAdapter.h>
#import <AnyThinkTTAdapter/AnyThinkTTAdapter.h>
#import <AnyThinkBaiduAdapter/AnyThinkBaiduAdapter.h>
#import <AnyThinkGDTAdapter/AnyThinkGDTAdapter.h>

#import <BaiduMobAdSDK/BaiduMobAdSetting.h>
#import <KlevinAdSDK/KlevinAdSDK.h>
#import <GDTSDKConfig.h>
#import <VungleSDK/VungleSDK.h>

// 设置是否收集IDFV
[ATVungleExtraConfig setExtraConfig:^(VungleSDK * _Nullable configuration) {
    [VungleSDK setPublishIDFV:YES];
}];

// 设置是否收集IDFA
[ATGDTExtraConfig setExtraConfig:^(GDTSDKConfig * _Nullable configuration) {
    [GDTSDKConfig forbiddenIDFA:YES];
}];

// 设置是否收集CAID(中国广告协会互联网广告标识)
[ATBaiduExtraConfig setExtraConfig:^(BaiduMobAdSetting * _Nullable configuration) {
    // 5.3xx版本后，百度已经标识未废弃状态
    [configuration setBDPermissionEnable:YES];
}];

// 设置快手自定义IDFA
[ATKSExtraConfig setExtraConfig:^(KSAdSDKManager * _Nullable configuration) {

    [KSAdSDKManager setIdfaBlock:^NSString * _Nullable{
        return @"";
    }];
}];

// 设置游可盈自定义IDFA
[ATKlevinExtraConfig setExtraConfig:^(KlevinAdSDKConfiguration * _Nullable configuration) {
    configuration.mediaIDFA = @"";
}];

// 设置穿山甲自定义IDFA
[ATCSJExtraConfig setExtraConfig:^(BUAdSDKConfiguration * _Nullable configuration) {
    configuration.customIdfa = @"";
}];

// 设置TopOn自定义IDFA
[ATAPI setDeviceInfoConfig:^(ATDeviceInfoConfig * _Nullable deviceInfoConfig) {
    deviceInfoConfig.idfaStr = @"56A0A11B-D6D9-482D-83AD-AA8513E0D34C";
}];
```

## **3**. 欧盟区域

如果您需要在欧盟区域内上架应用或游戏，则需要支持GDPR协议，当您的TopOn iOS SDK 版本**不是** **6.2.87** 并且您没接入Admob平台时，请参考 [GDPR说明](/cn/docs/she-zhi-GDPR)。当您的TopOn iOS SDK 版本为6.2.87，且接入Admob平台时，请参考 [UMP说明](/cn/docs/Google-UMP-shi-pei-shi-yong-zhi-nan-fMgm)。

## **4**. 三方广告平台隐私政策

我们整理了TopOn 官方聚合的三方广告平台的隐私政策说明，以便您了解更多信息。

| 第三方平台 | 参考网址 | 备注 |
| --- | --- | --- |
| FaceBook | - |  |
| Admob | <https://support.google.com/admob/answer/9755590?hl=zh-Hans> |  |
| Pangle | <https://www.pangleglobal.com/privacy> |  |
| 穿山甲 | <https://www.csjplatform.com/supportcenter/5374> |  |
| 腾讯广告(优量汇) | <https://www.tencent.com/zh-cn/privacy-policy.html> |  |
| Mintegral | <https://www.mintegral.com/cn/privacy/#privacy-introduction> |  |
| Applovin | <https://www.applovin.com/privacy-cn/> |  |
| UnityAds | <https://unity3d.com/legal/privacy-policy> |  |
| Chartboost | <https://answers.chartboost.com/en-us/child_article/ios-privacy-methods> |  |
| Tapjoy | <https://dev.tapjoy.com/en/support/Info-sent-to-Tapjoy> |  |
| Vungle | <https://vungle.com/privacy/> | 收集IDFA，其他收集的信息不涉及Apple的隐私政策 |
| Inmobi | <https://www.inmobi.com/privacy-policy/> |  |
| Ironsource | <https://developers.ironsrc.com/ironsource-mobile/ios/apples-privacy-questionnaire-answers-ironsource/> |  |
| AdColony | <https://www.adcolony.com/privacy-policy/> |  |
| Appnext | <https://www.appnext.com/privacy-policy-oem-operators/> |  |
| Nend | <https://nend.net/privacy/sdkpolicy> |  |
| Maio | <https://www.i-mobile.co.jp/privacy.html> |  |
| 快手广告 | <https://www.kuaishou.com/about/policy?tab=privacy> |  |
| 百度 | <https://union.baidu.com/bqt/#/policies> |  |
| Sigmob | <https://www.sigmob.com/policy.html> |  |
| Ogury | <https://ogury.com/privacy-policy/> |  |
| StartApp | <https://www.startapp.com/policy/privacy-policy/> |  |
| Fyber | <https://www.fyber.com/privacy-policy/> |  |

## **5**. 广告个性化开关设置

目前个性化开关设置支持的广告平台如下：

国内：穿山甲，优量汇，快手，百度，Sigmob
海外：Facebook，Admob，MyTarget，Applovin，Chartboost，Helium，Inmobi，Ironsource，Mintegral，Mopub，Pangle，StartApp，Tapjoy，UnityAds，Vungle

默认情况是全部开启广告个性化推荐，如果手动设置关闭之后则全部广告平台关闭个性化推荐。 **针对海外平台，如果关闭个性化推荐，涉及用户隐私的数据将不会被收集，可能会影响广告平台功能的正常使用，请谨慎设置**。

复制代码

```
// ATPersonalizedAdStateType 开启个性化推荐 (默认)
// ATNonpersonalizedAdStateType 屏蔽个性化推荐
[[ATAPI sharedInstance] setPersonalizedAdState:ATPersonalizedAdStateType];
```
