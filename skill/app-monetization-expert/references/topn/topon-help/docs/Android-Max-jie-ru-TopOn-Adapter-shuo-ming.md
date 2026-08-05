---
title: "MAX 接入 TopOn Adapter 说明"
source: "https://help.toponad.net/cn/docs/Android-Max-jie-ru-TopOn-Adapter-shuo-ming"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-05-30"
category_path: ["三方广告平台配置指南", "TopOn ADX", "MAX 接入 TopOn Adapter 说明"]
content_sha256: "4c0476f4ca7f5d7ca9e3ce5c40f7ab9f597c75d1e8e74e65cd4bf61f3f6d0dad"
knowledge_role: "reference_only"
has_article_body: true
---

# MAX 接入 TopOn Adapter 说明

## 支持的广告格式

- 插屏
- 激励视频
- Banner
- 原生

---

## MAX Adapter 接入步骤

---

## 步骤一、配置 MAX Custom Network

### 1、添加 MAX Custom Network

1）在 MAX 首页，选择  ***MAX > Mediation > Manage > Networks ；***

2）点击页面底部添加 ***Custom Network；***

3）并添加相关信息：

- Network Type: 选择 **`SDK`**
- Name: 输入 **`TopOn`**
- iOS Adapter Class Name: 输入 **`ALTopOnMediationAdapter`**
- Android Adapter Class Name: 输入 **`com.applovin.mediation.topon.TopOnAdxAdapter`**



### 2、启用 MAX Custom Network

1）在  MAX 中打开 ***MAX > Mediation > Manage > Ad Units ；***

2）选择 ***Custom Network (SDK) - TopOn ；***

3）设置相应的 **App ID、App Key、Placement ID，**对于 **TopOn 而言，App ID 为必填项；**

以下为填写说明及示例。

**App ID：**输入格式为 `TopOnAppID_TopOnAppKey`（如：在 TopOn 后台创建的应用 App ID 为 "a5aa1f0deda26v"，App Key为"abcde5bfa2a243f80cd04d8d0c18d2f59"，则填入"a5aa1f0deda26v\_abcde5bfa2a243f80cd04d8d0c18d2f59"）

**Placement ID：**输入 `TopOn Placement ID`（如：在 TopOn 后台创建的广告位 Placement ID 为"b5fdc16c90007f"，则填入b5fdc16c90007f，）

**CPM Price：**输入期望设置的 Waterfall 底价；



> 您可以在此页面找到TopOn的应用ID & TopOn的广告位ID： [TonOn应用](https://portal.toponad.com/m/app)



> 您可以在此页面找到TopOn的App Key：[TonOn账户信息](https://portal.toponad.com/m/account/info)



如需更多详情可查阅 [Max 官方文档](https://dash.applovin.com/documentation/mediation/android/getting-started/integration)

---

## 步骤二、在 TopOn 配置底价

MAX Waterfall 的分层价格需要在 TopOn 的开发者后台配置。

### 1、关系说明

根据 MAX 需要配置的 Waterfall 的层级，创建对应的 TopOn 广告位，具体关系如下



假如需要设置 3 层 Waterfall ，那么需要在 TopOn 后台创建 3 个广告位，每个广告位的底价对应一层 Waterfall 价格。

### 2、在 TopOn 后台配置底价

1）进入 聚合管理 页面；

2）选择需要设置的应用、广告位；

3）点击高级设置，找到竞价底价；



4）输入步骤一在 MAX 后台设置的 Placement ID 对应的 CPM Price；



**注意**：

- 在集成初期，建议在 MAX 只设置一层 0.01 的底价，并让 TopOn  ADX 的预算有至少 1 天的时间对流量价值进行学习。在数据稳定后，再依据 TopOn 后台的数据报表调整 MAX 上的分层
- 请确保您的TopOn开发者账号币种必须是美元（USD），币种具体见 [账号管理](https://portal.toponad.com/m/account/info)

---

## 步骤三、集成 TopOn SDK & Adapter

### 1、 Android

**● 版本说明**

| TopOn Adapter | 说明 |
| --- | --- |
| **v1.1.8** | 支持适配 Applovin SDK **v13.0.0** |
| v1.1.7 | 支持适配 Applovin SDK版本 **≤ v12.6.1** |

#### 1.1 引入依赖库

将 TopOn SDK & Adapter SDK 的依赖项目添加至 **build.gradle** 文件中，[请前往SDK下载中心](https://portal.toponad.com/m/sdk/download?type=Android)获取最新版本 SDK。

```
repositories {
    //Anythink(Core)
    maven {
        url "https://jfrog.anythinktech.com/artifactory/overseas_sdk"
    }
}
​
dependencies {
    //Anythink (Necessary)  请前往 SDK下载中心 获取最新版本 SDK
    api "com.anythink.sdk:core-tpn:XXX"
    api "com.anythink.sdk:nativead-tpn:XXX"
    api "com.anythink.sdk:banner-tpn:XXX"
    api "com.anythink.sdk:interstitial-tpn:XXX"
    api "com.anythink.sdk:rewardedvideo-tpn:XXX"

    //Androidx (Necessary)
    api "androidx.appcompat:appcompat:1.1.0"
    api "androidx.browser:browser:1.4.0"

    api "com.anythink.sdkadx:max-mediation-adapter:1.1.8"
}
```

### 2、 iOS接入

**● 版本说明**

| TopOn Adapter | 说明 |
| --- | --- |
| v6.4.28 | 支持适配 Applovin SDK **v13.1.0，**如果需要接入其他max版本，请联系我们 |

#### 2.1 cocoapods引入（推荐）

在Podfile中添加以下代码，引入TopOn SDK和Adapter

```
pod 'AppLovinMediationTopOnAdxAdapter', '6.4.28'
```

### 3、 app-ads.txt 填写

强烈建议填写 app-ads.txt 以保障**广告收益**。

广告主对真实流量的要求越来越高，所以DSP在不久的未来将不会购买缺少app-ads.txt文件的APP的流量，未实施app-ads.txt的App可能会从DSP的目标媒体池中删除。

配置方式如下：

- 在 ***TopOn 开发者后台 > ADX设置  > [app-ads.txt](https://portal.toponad.com/m/advanced/adx-set?tab=AppAds)*** 页面，填写您的域名和公司名称；
- 建议您在应用商店 (Google Play 或 Apple App Store) 配置相同域名的开发者网站，广告网络或DSP也将通过该网站验证app-ads.txt文件；



---

## 步骤四、验证 TopOn 广告

在应用正式发布前，通过如下方式来验证SDK 是否成功集成。

### 1、打开 MAX SDK 日志

#### 1.1 Android

```
AppLovinSdk.getInstance(this).settings.setVerboseLogging(true)
```

> 打开后，可在 Logcat 中过滤此 TAG 查看相关日志：`AppLovinSdk|TopOn|anythink`

可通过以下日志获取设备ID(GAID)

```
anythink: ********************************** UA_X.X.XX *************************************
anythink: GAID(ADID): ********-****-****-****-************ , AndroidID: ****************
anythink: ********************************** UA_X.X.XX *************************************
```

#### 1.2 iOS

> 可在console中过滤此TAG查看相关日志：`ATAdLogger`

（1）可通过以下日志获取设备ID(IDFA或者IDFV)

```
ATAdLogger(UA_6.4.28) Message:
Device info:
*****************************
{
    IDFA = "xxxxxx";
    IDFV = "xxxxxx";
    Language = "zh-Hans-CN";
    Model = "iPhone13,3";
    NetworkType = "-2";
    OSVersionCode = "17.1";
    OSVersionName = iOS;
    PackageName = "xxxxx";
}
*****************************
```

### 2、打开 TopOn ADX 广告

1）进入[聚合管理](https://portal.toponad.com/m/mediation)页面；

2）选择需要测试的应用及广告位，并将下方的`TopOn ADX`的广告源开关打开。



### 3、开启 TopOn 测试模式

1）进入[测试模式](https://portal.toponad.com/m/advanced/test-mode)页面；

2）点击`+测试模式`按钮，并输入设备ID、设备名称；

3）选择要测试的应用及广告平台，点击`确定`。

- 设备ID：请使用 **Google Advertising ID (GAID)**，即上方说明中从日志里获取到的 **GAID(ADID)**
- 请等待 5~10 分钟，配置生效后，卸载重装应用再进行测试



> 更多信息请参考 [如何测试广告](https://help.toponad.com/cn/docs/5xiiue)
