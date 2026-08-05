---
title: "如何测试广告"
source: "https://help.toponad.net/cn/docs/5xiiue"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-26"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "集成测试", "如何测试广告"]
content_sha256: "458227d43e44294af861addcffc44d80b417c8f80b45d25c504a19c730d2a7e5"
knowledge_role: "reference_only"
has_article_body: true
---

# 如何测试广告

## 1. SDK日志开关

> **注意**：应用上线前需要关闭日志功能

java
复制代码

```
ATSDK.setNetworkLogDebug(true);
```

打开日志开关之后：

- 在AndroidStudio的Logcat中，以 `"secmtp"` 为 tag 进行过滤，查看SDK的日志
- TopOn SDK初始化时会打印如下日志，可以从日志中获取设备ID
- 如果没有打印GAID的值，请检查当前手机有没有Google服务，需要使用带Google服务的手机机型测试

复制代码

```
anythink: ****************************************************************************
anythink: GAID(ADID): b796a53f-61bf-4e91-bc67-d505cdb97cf8 , AndroidID: f669f2b7137d82b9
anythink: ****************************************************************************
```

Log示例：

复制代码

```
anythink_network:
╔═══════════════════════════════════════════════════════════════════════════════════════
║ {
║     "placementId": "b5bbdc725768fa",  //发起了加载的广告位id
║     "adType": "inter",  //发起加载的广告位类型
║     "mixedFormatAdType": -1,
║     "action": "request_result",  //发起广告加载后的动作：request(广告请求)，request_result(广告返回的结果)，impression（广告展示），click（广告点击），close（广告关闭）
║     "refresh": 0,
║     "result": "fail",  //结果参数，success(成功)，fail(失败)
║     "segmentId": 0,  // 当前广告源所在的流量分组，0表示默认分组
║     "adSourceId": "1423289",  //广告源id
║     "position": 0,  //当前广告源在广告位下的排序位置
║     "networkType": 6,  //TopOn用来区分第三方广告平台的唯一ID，对应关系可查看（https://docs.toponad.com/#/zh-cn/android/android_doc/android_access_doc?id=network_firm_id）
║     "networkName": "Mintegral",  //广告平台名称
║     "networkVersion": "MAL_16.1.41",  //广告平台SDK版本
║     "networkUnit": "{\"is_video\":\"0\",\"video_muted\":\"0\",\"suport_video\":\"1\",\"appkey\":\"ef13ef712aeb0f6eb3d698c4c08add96\",\"unitid\":\"1726152\",\"appid\":\"100947\"}",  //TopOn后台此广告源的配置（对应第三方广告平台的app和placement信息）
║     "isHB": 0,//是否是头部竞价广告源
║     "msg": "code:[ 4001 ]desc:[ Return Ad is empty. ]platformCode:[  ]platformMSG:[ EXCEPTION_UNIT_ADTYPE_ERROR ]",  //如果出现加载失败，这里会输出完整的错误信息
║     "hourly_frequency": 0,  //当前小时展示的次数
║     "daily_frequency": 0,  //当前天展示的次数
║     "network_list": "6,6,6",  //当前第三方广告平台请求列表的id，以&ldquo;,&rdquo;间隔
║     "request_network_num": 1,  //表示同时发起多少个第三方广告平台广告源的加载（对应TopOn后台高级设置中的并行请求数）
║     "handle_class": "com.anythink.network.mintegral.MintegralATInterstitialAdapter"  //调用广告平台API的类名
║ }
╚═══════════════════════════════════════════════════════════════════════════════════════
```

java
复制代码

```
TUSDK.setNetworkLogDebug(true);
```

打开日志开关之后：

- 在AndroidStudio的Logcat中，以 `"thinkup"` 为 tag 进行过滤，查看SDK的日志
- TopOn SDK初始化时会打印如下日志，可以从日志中获取设备ID
- 如果没有打印GAID的值，请检查当前手机有没有Google服务，需要使用带Google服务的手机机型测试

复制代码

```
thinkup: ****************************************************************************
thinkup: GAID(ADID): b796a53f-61bf-4e91-bc67-d505cdb97cf8 , AndroidID: f669f2b7137d82b9
thinkup: ****************************************************************************
```

Log示例：

复制代码

```
thinkup_network:
╔═══════════════════════════════════════════════════════════════════════════════════════
║ {
║     "placementId": "b5bbdc725768fa",  //发起了加载的广告位id
║     "adType": "inter",  //发起加载的广告位类型
║     "mixedFormatAdType": -1,
║     "action": "request_result",  //发起广告加载后的动作：request(广告请求)，request_result(广告返回的结果)，impression（广告展示），click（广告点击），close（广告关闭）
║     "refresh": 0,
║     "result": "fail",  //结果参数，success(成功)，fail(失败)
║     "segmentId": 0,  // 当前广告源所在的流量分组，0表示默认分组
║     "adSourceId": "1423289",  //广告源id
║     "position": 0,  //当前广告源在广告位下的排序位置
║     "networkType": 6,  //TopOn用来区分第三方广告平台的唯一ID，对应关系可查看（https://docs.toponad.com/#/zh-cn/android/android_doc/android_access_doc?id=network_firm_id）
║     "networkName": "Mintegral",  //广告平台名称
║     "networkVersion": "MAL_16.1.41",  //广告平台SDK版本
║     "networkUnit": "{\"is_video\":\"0\",\"video_muted\":\"0\",\"suport_video\":\"1\",\"appkey\":\"ef13ef712aeb0f6eb3d698c4c08add96\",\"unitid\":\"1726152\",\"appid\":\"100947\"}",  //TopOn后台此广告源的配置（对应第三方广告平台的app和placement信息）
║     "isHB": 0,//是否是头部竞价广告源
║     "msg": "code:[ 4001 ]desc:[ Return Ad is empty. ]platformCode:[  ]platformMSG:[ EXCEPTION_UNIT_ADTYPE_ERROR ]",  //如果出现加载失败，这里会输出完整的错误信息
║     "hourly_frequency": 0,  //当前小时展示的次数
║     "daily_frequency": 0,  //当前天展示的次数
║     "network_list": "6,6,6",  //当前第三方广告平台请求列表的id，以&ldquo;,&rdquo;间隔
║     "request_network_num": 1,  //表示同时发起多少个第三方广告平台广告源的加载（对应TopOn后台高级设置中的并行请求数）
║     "handle_class": "com.thinkup.network.mintegral.MintegralTUInterstitialAdapter"  //调用广告平台API的类名
║ }
╚═══════════════════════════════════════════════════════════════════════════════════════
```

> 注意：
>
> - 如果所有的action类型日志的result字段结果均为success，则该广告平台集成正常。
> - 如果某条日志的result字段结果为fail，说明该广告行为出现错误。您需要查看日志中msg字段的内容，格式如下：

复制代码

```
"code[ " + code + " ],desc[ " + desc + " ],platformCode[ " + platformCode + " ],platformMSG[ " + platformMSG + " ]"

code：TopOnSDK的内部错误码
desc：TopOnSDK的内部错误描述
platformCode：第三方广告平台的错误码（广告没有填充的时候需要检查的错误码）
platformMsg：第三方广告平台的错误信息（广告没有填充的时候需要检查的错误信息）
```

您可以根据**code、desc**查询相关 [TopOn错误码](https://help.toponad.net/cn/docs/qYfOSS)，如果**code=4001**，需根据**platformCode、platformMSG**查询 [第三方广告平台错误码&常见问题](https://help.toponad.net/cn/docs/qYfOSS#2._%E7%AC%AC%E4%B8%89%E6%96%B9%E5%B9%BF%E5%91%8A%E5%B9%B3%E5%8F%B0%E9%94%99%E8%AF%AF%E7%A0%81) 进行排查。

## 2. 通过测试工具测试广告

### 2.1 测试工具简介

- 基础信息：检测应用、设备、sdk的相关信息
- TopOn SDK设置信息：检测隐私设置、权限是否成功配置
- 集成检测：检测集成三方平台SDK和adapter集成情况和测试建议，以及测试三方广告平台的广告加载

> **注意** ：
>
> - 支持在接入TopOn SDK后进行检测使用
> - 测试工具仅作为检测SDK集成，并不能代替APP自身的广告逻辑测试
> - 在测试结束后，APP上线前需将调用测试工具的相关代码删除
> - SDK版本要求：v6.2.70及以上

#### ● 版本说明

| TopOn SDK 版本 | 测试工具版本 | 说明 |
| --- | --- | --- |
| **v6.6.21 及以上（推荐）** | v1.1.5 | 适配高版本 SDK，优化已知问题 |
| v6.5.50 及以上 | v1.1.3 | 适配高版本 SDK，优化已知问题 |
| v6.4.88 及以上 | v1.1.2 | 适配高版本 SDK，优化已知问题 |
| v6.4.87 及以下 | v1.1.0 | 优化已知问题 |

> **💡Tips** ：使用测试工具进行测试时需**重点关注**以下内容
>
> 1. **关注广告平台的SDK的集成显示是否正确**
> 2. **广告平台的各个样式的请求，展示，点击是否正常**

### 2.2 测试工具接入

(1) 参考[TopOn SDK接入指南](https://help.toponad.net/cn/docs/bPMOE6)，集成SDK

(2) 引入测试工具，`build.gradle`中添加引用

复制代码

```
repositories {
    maven {
        url "https://jfrog.anythinktech.com/artifactory/debugger"
    }
}
dependencies {
    // Debugger UI Tools
    implementation 'com.anythink.sdk:debugger-ui-tpn:1.1.3'
}
```

(3) 调起测试工具

> **注意**：必须在初始化TopOn SDK之后，调用下面的方法才能使用测试工具。

java
复制代码

```
ATDebuggerUITest.showDebuggerUI(context);
```

复制代码

```
repositories {
    maven {
        url "https://jfrog.anythinktech.com/artifactory/debugger"
    }
}
dependencies {
    // Debugger UI Tools
    implementation 'com.thinkup.sdk:debugger-ui:1.1.3'
}
```

(3) 调起测试工具

> **注意**：必须在初始化TopOn SDK之后，调用下面的方法才能使用测试工具。

java
复制代码

```
TUDebuggerUITest.showDebuggerUI(context);
```

### 2.3 测试工具使用

#### 2.3.1 基本信息



> 💡**Tips** ：GAID为空将无法正常使用测试工具进行测试，若为空请检查:
>
> 1. 测试手机是否有安装Google服务
> 2. 项目中是否调用了如下的方法，这两种方法都会**限制**获取GAID
>
>    复制代码
>
>    ```
>    ATSDK.deniedUploadDeviceInfo(DeviceDataInfo.GAID);
>
>    ATSDK.setGDPRUploadDataLevel(ATSDK.NONPERSONALIZED);
>    ```

> 💡**Tips** ：GAID为空将无法正常使用测试工具进行测试，若为空请检查:
>
> 1. 测试手机是否有安装Google服务
> 2. 项目中是否调用了如下的方法，这两种方法都会`限制`获取GAID
>
>    复制代码
>
>    ```
>    TUSDK.deniedUploadDeviceInfo(DeviceDataInfo.GAID);
>
>    TUSDK.setGDPRUploadDataLevel(TUSDK.NONPERSONALIZED);
>    ```

#### 2.3.2 TopOn SDK设置

TopOn SDK设置包括两部分：隐私设置和权限设置。

(1) 隐私设置

[已限制上报的设备隐私数据](https://help.toponad.net/cn/docs/MWsWVm)、[GDPR](https://help.toponad.net/cn/docs/MWsWVm)

(2) 权限设置：应用已申请的权限列表。



#### 2.3.3 集成检测

(1) 查看广告平台列表的集成状态 ：**集成异常** 、 **完成集成** 、**未集成**。



(2) 勾选开关打开调试模式。



(3) 选择广告平台进入**调试模式**，点击右上角分享当前页面的广告平台信息。

(4) 选择广告平台的广告样式进行测试操作。



#### 2.3.4 线上ID测试

线上ID测试支持使用TopOn后台配置的广告位来测试广告，支持筛选广告位下的广告源进行测试。

> **注意**：在运行线上ID测试后，再切换回开发者应用内去测试需要重启应用，避免应用内测试广告位和测试工具广告位一致导致缓存问题。

**(1) 前提条件**

- SDK版本：v6.3.68及以上
- 测试工具版本：v1.0.5及以上
- 设置SDK Debug Key：获取步骤是 `登录后台` -> `帐号管理` -> `Key` -> `SDK Debug Key`
- 调试模式处于关闭状态

**(2) 开始使用**

示例代码如下：

复制代码

```
//1.初始化SDK
ATSDK.init(context, "your app id", "your app key");
//2.设置Debug Key进入测试工具
ATDebuggerUITest.showDebuggerUI(context, "your debug key");
```

复制代码

```
//1.初始化SDK
TUSDK.init(context, "your app id", "your app key");
//2.设置Debug Key进入测试工具
TUDebuggerUITest.showDebuggerUI(context, "your debug key");
```

**(3) 线上ID列表**

- 支持查看应用信息：应用名字，App ID，应用包名，SDK版本
- 支持查看该应用下配置的广告位列表
- 支持查看广告位信息：名字，ID
- 支持点击广告位跳转到广告位测试页面进行测试（视频流广告暂时不支持测试）



**(4) 广告位测试**

- 支持切换流量分组
- 支持竞价和瀑布流的广告源
- 支持筛选广告源：未勾选的广告源在发起load时会被过滤



## 3. 通过调试模式测试广告

- 使用调试模式，您可以锁定单个广告平台，使用TopOn预先配置的测试广告源，对广告平台集成情况进行测试和验证。
- 测试开始后，首先需要打开SDK的日志功能，并获取测试设备ID；然后调用针对各个广告平台的API，配置测试设备、测试广告平台和测试广告类型，开启调试模式；最后根据日志输出的结果，执行相应的调整。
- 每个广告平台有单独的方法，不同的广告样式有不同的参数配置，请您根据所需要测试的广告平台、广告样式来选择调用的方法。各广告平台支持广告样式请参考：[聚合平台概况](https://help.toponad.net/cn/docs/2KR6QU)
- 我们推荐在TopOn SDK初始化之前调用API进行设置。
- 配置完成后，测试设备上的所有广告位均只会请求配置中指定广告平台的测试广告源。

> **注意** ：
>
> - 对于竞价广告源，该配置仅支持Meta（Facebook）和TopOn ADX。其他的竞价广告源无法通过本方法进行测试。
> - 测
>   试海外广告平台时，需要代理到海外网络，其中InMobi建议代理到东南亚地区，印度最佳，Pangle代理到非美国区域，Meta平台需要在测试手机安
>   装了Facebook的应用，填充率比较低，可能需要多次尝试。其他海外平台加载广告可以尝试代理到平台所在国家地区，提高广告的填充率。

### 3.1 调试模式支持的广告平台

● Meta（Bidding）

> **Tips：**
>
> 1. Meta在美国填充率高
> 2. 测试设备上需安装Facebook应用
> 3. Facebook需处于登录状态，且账号能正常使用
> 4. Meta广告源的App ID与Placement ID的前缀一致

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(Facebook_NETWORK).build());
//高级用法
ATSDK.setDebuggerConfig(context, AndroidID,new ATDebuggerConfig.Builder(Facebook_NETWORK).setNativeType(nativeType).build());
参数说明：
nativeType：设置原生广告类型，支持以下类型
    Facebook_NATIVE_SELF_RENDER：原生广告（自渲染）
    Facebook_NATIVE_BANNER_TEMPLATE：原生横幅广告（模板渲染）
    Facebook_NATIVE_TEMPLATE：原生广告（模板渲染）
    Facebook_NATIVE_BANNER_SELF_RENDER：原生横幅广告（自渲染）
```

● AdMob

> **Tips：**
>
> 1. AdMob在美国填充率高
> 2. 测试设备上需有Google Play 且能获取到GAID

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(Admob_NETWORK).build());
//高级用法
ATSDK.setDebuggerConfig(context, AndroidID, new ATDebuggerConfig.Builder(Admob_NETWORK).setNativeType(nativeType).setInterstitial(interType).build());
参数说明：
nativeType：设置原生广告类型，支持以下类型
    Admob_NATIVE_IMAGE：图片
    Admob_NATIVE_VIDEO：视频
interType：设置插屏广告类型，支持以下类型
    Admob_INTERSTITIAL_IMAGE：插屏图片
    Admob_INTERSTITIAL_VIDEO：插屏视频
```

● Mintegral

> **Tips：在**欧美地区填充率高

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(Mintegral_NETWORK) .setInterstitial(Mintegral_INTERSTITIAL_VIDEO).build());
//高级用法
ATSDK.setDebuggerConfig(context, AndroidID, new ATDebuggerConfig.Builder(Mintegral_NETWORK).setNativeType(nativeType).build());
参数说明：
nativeType：设置原生广告类型，支持以下类型
    Mintegral_NATIVE_SELF_RENDER： 原生自定义渲染
    Mintegral_NATIVE_TEMPLATE：原生自动渲染
```

● Huawei

> **Tips：**需使用海外版本华为手机（语言**不能**是中国-中文，美国-英文）或已安装HMS Core手机

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(Huawei_NETWORK).build());
//高级用法
ATSDK.setDebuggerConfig(context, AndroidID, new ATDebuggerConfig.Builder(Huawei_NETWORK).setNativeType(nativeType).setInterstitial(interType).build());
参数说明：
nativeType：设置原生广告类型，支持以下类型
    Huawei_NATIVE_VIDEO：视频
    Huawei_NATIVE_IMAGE：小图片
    Huawei_NATIVE_BIG_IMAGE：大图片
interType：设置插屏广告类型，支持以下类型
    Huawei_INTERSTITIAL_IMAGE：插屏图片
    Huawei_INTERSTITIAL_VIDEO：插屏视频
```

● ADX

java
复制代码

```
String gaid = "<静态写死指定测试设备的GAID，不要动态获取当前设备GAID，避免影响线上用户>";
String aid = "<静态写死指定测试设备的AndroidID，不要动态获取当前设备GAID，避免影响线上用户>";

//通用设置
ATSDK.setDebuggerConfig(context, gaid, new ATDebuggerConfig.Builder(Adx_NETWORK).build());
//高级用法
ATSDK.setDebuggerConfig(context, aid, new ATDebuggerConfig.Builder(Adx_NETWORK).setNativeType(nativeType).setInterstitial(interType).setBannerType(bannerType).build());
参数说明：
nativeType：设置原生广告类型，支持以下类型
    ADX_NATIVE_EXPRESS_LEFT_PIC_RIGHT_TEXT：左图右文
    ADX_NATIVE_EXPRESS_LEFT_TEXT_RIGHT_PIC：左文右图
    ADX_NATIVE_EXPRESS_TOP_PIC_BOTTOM_TEXT：上图下文
    ADX_NATIVE_EXPRESS_TOP_TEXT_BOTTOM_PIC：上文下图
    ADX_NATIVE_SELF_RENDER：自渲染
interType：设置插屏广告类型，支持以下类型
    Adx_INTERSTITIAL_FULL_SCREEN：全屏插屏
    Adx_INTERSTITIAL_HALF_SCREEN：半屏插屏
bannerType：设置横幅广告类型，支持以下类型
    ADX_BANNER_SIZE_320_50：320x50尺寸
    ADX_BANNER_SIZE_320_90：320x90尺寸
    ADX_BANNER_SIZE_300_250：300x250尺寸
    ADX_BANNER_SIZE_728_90：728x90尺寸
```

● InMobi

> **Tips**：InMobi在印度填充率高

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(Inmobi_NETWORK).build());
```

● AppLovin

> **Tips**：在中国、美国填充率高

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(Applovin_NETWORK).build());
```

● Chartboost

> **Tips**：在中国、美国填充率高

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(Chartboost_NETWORK).build());
```

● IronSource

> **Tips**：在中国填充率高

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(Ironsource_NETWORK).build());
```

● Unity Ads

> **Tips**：在美国填充率高

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(UnityAds_NETWORK).build());
```

● Vungle

> **Tips**
>
> 1. 测试建议：先VPN到美国，然后卸载应用重新安装后再去加载广告
> 2. 如果打开竞价调试模式也无法竞价成功，可到Vungle后台添加测试设备 [如何使用测试模式和测试设备 – Vungle CN](https://support.vungle.com/hc/zh-cn/articles/360036210192-%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%E6%B5%8B%E8%AF%95%E6%A8%A1%E5%BC%8F%E5%92%8C%E6%B5%8B%E8%AF%95%E8%AE%BE%E5%A4%87#-test-devices-0-3)

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(Vungle_NETWORK).build());
```

● [Start.io](http://Start.io)

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(StartApp_NETWORK).build());
```

● MyTarget

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(MyTarget_NETWORK).build());
```

● Fyber

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(Fyber_NETWORK).build());
```

● Pangle

> **Tips**：在韩国、日本填充率高

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(Pangle_NETWORK).build());
```

● Bigo

> **Tips**：在新加坡填充率高

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(BigoAds_NETWORK).build());
```

● Kwai

java
复制代码

```
//通用设置
ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(KWAI_NETWORK).build());
```

● Meta（Bidding）

> **Tips**
>
> 1. Meta在美国填充率高
> 2. 测试设备上需安装Facebook应用
> 3. Facebook需处于登录状态，且账号能正常使用
> 4. Meta广告源的App ID与Placement ID的前缀一致

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(Facebook_NETWORK).build());
//高级用法
TUSDK.setDebuggerConfig(context, AndroidID,new TUDebuggerConfig.Builder(Facebook_NETWORK).setNativeType(nativeType).build());
参数说明：
nativeType：设置原生广告类型，支持以下类型
    Facebook_NATIVE_SELF_RENDER：原生广告（自渲染）
    Facebook_NATIVE_BANNER_TEMPLATE：原生横幅广告（模板渲染）
    Facebook_NATIVE_TEMPLATE：原生广告（模板渲染）
    Facebook_NATIVE_BANNER_SELF_RENDER：原生横幅广告（自渲染）
```

● AdMob

> **Tips**
>
> 1. AdMob在美国填充率高
> 2. 测试设备上需有Google Play 且能获取到GAID

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(Admob_NETWORK).build());
//高级用法
TUSDK.setDebuggerConfig(context, AndroidID, new TUDebuggerConfig.Builder(Admob_NETWORK).setNativeType(nativeType).setInterstitial(interType).build());
参数说明：
nativeType：设置原生广告类型，支持以下类型
    Admob_NATIVE_IMAGE：图片
    Admob_NATIVE_VIDEO：视频
interType：设置插屏广告类型，支持以下类型
    Admob_INTERSTITIAL_IMAGE：插屏图片
    Admob_INTERSTITIAL_VIDEO：插屏视频
```

● Mintegral

> **Tips**：在欧美地区填充率高

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(Mintegral_NETWORK) .setInterstitial(Mintegral_INTERSTITIAL_VIDEO).build());
//高级用法
TUSDK.setDebuggerConfig(context, AndroidID, new TUDebuggerConfig.Builder(Mintegral_NETWORK).setNativeType(nativeType).build());
参数说明：
nativeType：设置原生广告类型，支持以下类型
    Mintegral_NATIVE_SELF_RENDER： 原生自定义渲染
    Mintegral_NATIVE_TEMPLATE：原生自动渲染
```

● Huawei

> **Tips**：需使用海外版本华为手机（语言**不能**是中国-中文，美国-英文）或已安装HMS Core手机

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(Huawei_NETWORK).build());
//高级用法
TUSDK.setDebuggerConfig(context, AndroidID, new TUDebuggerConfig.Builder(Huawei_NETWORK).setNativeType(nativeType).setInterstitial(interType).build());
参数说明：
nativeType：设置原生广告类型，支持以下类型
    Huawei_NATIVE_VIDEO：视频
    Huawei_NATIVE_IMAGE：小图片
    Huawei_NATIVE_BIG_IMAGE：大图片
interType：设置插屏广告类型，支持以下类型
    Huawei_INTERSTITIAL_IMAGE：插屏图片
    Huawei_INTERSTITIAL_VIDEO：插屏视频
```

● ADX

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(Adx_NETWORK).build());
//高级用法
TUSDK.setDebuggerConfig(context, AndroidID, new TUDebuggerConfig.Builder(Adx_NETWORK).setNativeType(nativeType).setInterstitial(interType).setBannerType(bannerType).build());
参数说明：
nativeType：设置原生广告类型，支持以下类型
    ADX_NATIVE_EXPRESS_LEFT_PIC_RIGHT_TEXT：左图右文
    ADX_NATIVE_EXPRESS_LEFT_TEXT_RIGHT_PIC：左文右图
    ADX_NATIVE_EXPRESS_TOP_PIC_BOTTOM_TEXT：上图下文
    ADX_NATIVE_EXPRESS_TOP_TEXT_BOTTOM_PIC：上文下图
    ADX_NATIVE_SELF_RENDER：自渲染
interType：设置插屏广告类型，支持以下类型
    Adx_INTERSTITIAL_FULL_SCREEN：全屏插屏
    Adx_INTERSTITIAL_HALF_SCREEN：半屏插屏
bannerType：设置横幅广告类型，支持以下类型
    ADX_BANNER_SIZE_320_50：320x50尺寸
    ADX_BANNER_SIZE_320_90：320x90尺寸
    ADX_BANNER_SIZE_300_250：300x250尺寸
    ADX_BANNER_SIZE_728_90：728x90尺寸
```

● InMobi

> **Tips**：InMobi在印度填充率高

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(Inmobi_NETWORK).build());
```

● AppLovin

> **Tips**：在中国、美国填充率高

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(Applovin_NETWORK).build());
```

● Chartboost

> **Tips**：在中国、美国填充率高

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(Chartboost_NETWORK).build());
```

● IronSource

> **Tips**：在中国填充率高

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(Ironsource_NETWORK).build());
```

● Unity Ads

> **Tips**：在美国填充率高

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(UnityAds_NETWORK).build());
```

● Vungle

> **Tips**
>
> 1. 测试建议：先VPN到美国，然后卸载应用重新安装后再去加载广告
> 2. 如果打开竞价调试模式也无法竞价成功，可到Vungle后台添加测试设备 [如何使用测试模式和测试设备 – Vungle CN](https://support.vungle.com/hc/zh-cn/articles/360036210192-%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%E6%B5%8B%E8%AF%95%E6%A8%A1%E5%BC%8F%E5%92%8C%E6%B5%8B%E8%AF%95%E8%AE%BE%E5%A4%87#-test-devices-0-3)

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(Vungle_NETWORK).build());
```

● [Start.io](http://Start.io)

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(StartApp_NETWORK).build());
```

● MyTarget

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(MyTarget_NETWORK).build());
```

● Fyber

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(Fyber_NETWORK).build());
```

● Pangle

> **Tips**：在韩国、日本填充率高

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(Pangle_NETWORK).build());
```

● Bigo

> **Tips**：在新加坡填充率高

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(BigoAds_NETWORK).build());
```

● Kwai

java
复制代码

```
//通用设置
TUSDK.setDebuggerConfig(context, GAID, new TUDebuggerConfig.Builder(KWAI_NETWORK).build());
```

### **3.2 调试模式不支持的平台**

对于调试模式不支持的平台，可使用TopOn Demo的测试ID 进行测试

- 根据输出的日志，验证广告源，从Logcat的日志输出中，可以看到对各种广告动作的跟踪。
- 调用API配置测试规则后，即可开始进行各种广告动作。
- 根据`placementId`定位到需要验证的广告位。

## 4. GDPR验证

(1) 网络切换到欧盟地区

(2) 操作：首次启动应用预期。预期：弹窗GDPR咨询框

(3) 操作：不点击任何按钮，kill应用，再次启动。预期：弹出GDPR咨询框（只要不授权，每次启动都弹出咨询框）

(4) 操作：点击授权GDPR后，kill应用，再次启动。预期：不出现GDPR咨询框
