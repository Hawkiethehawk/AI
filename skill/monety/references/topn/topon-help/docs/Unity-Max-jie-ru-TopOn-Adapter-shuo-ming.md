---
title: "（Unity）MAX 接入TopOn Adapter 说明"
source: "https://help.toponad.net/cn/docs/Unity-Max-jie-ru-TopOn-Adapter-shuo-ming"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-05-30"
category_path: ["三方广告平台配置指南", "TopOn ADX", "（Unity）MAX 接入TopOn Adapter 说明"]
content_sha256: "2ab2b51272613b9e69a9d81ba340b1f9b142e6cc1e2b683c80d5ddad64a203f1"
knowledge_role: "reference_only"
has_article_body: true
---

# （Unity）MAX 接入TopOn Adapter 说明

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
- Android Adapter Class Name: 输入 **`com.applovin.mediation.topon.TopOnAdxAdapter`**
- iOS Adapter Class Name: 输入 **`ALTopOnMediationAdapter`**



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

### 1、引入依赖库

1）Android

**● 版本说明**

| TopOn Adapter | 说明 |
| --- | --- |
| **v1.1.8** | 支持适配 Applovin SDK **v13.0.0** |
| v1.1.7 | 支持适配 Applovin SDK版本 **≤ v12.6.1** |

在 Assets/MaxSdk/Mediation 目录下添加文件：`TopOn/Editor/Dependencies.xml`，[请前往SDK下载中心](https://portal.toponad.com/m/sdk/download)获取最新版本 SDK。

```
<dependencies>
    <androidPackages>
        <repositories>
            <repository>https://jfrog.anythinktech.com/artifactory/overseas_sdk</repository>
        </repositories>
        <androidPackage spec="com.anythink.sdk:core-tpn:XXX"/>
        <androidPackage spec="com.anythink.sdk:nativead-tpn:XXX"/>
        <androidPackage spec="com.anythink.sdk:banner-tpn:XXX"/>
        <androidPackage spec="com.anythink.sdk:interstitial-tpn:XXX"/>
        <androidPackage spec="com.anythink.sdk:rewardedvideo-tpn:XXX"/>
        <androidPackage spec="androidx.appcompat:appcompat:1.1.0"/>
        <androidPackage spec="androidx.browser:browser:1.4.0"/>

       <androidPackage spec="com.anythink.sdkadx:max-mediation-adapter:1.1.8"/>
    </androidPackages>
</dependencies>
```

2） iOS

在 Assets/MaxSdk/Mediation 目录下添加文件：`TopOn/Editor/Dependencies.xml`

```
<?xml version="1.0" encoding="utf-8"?>
<dependencies>
 <iosPods>
     <iosPod name="TopOnMaxAdapter" version=""/>
 </iosPods>
</dependencies>
```

更新info.plist，**强烈建议开发者更新Info.plist，否则影响广告变现**

```
<dict>
      <key>SKAdNetworkIdentifier</key>
      <string>kbd757ywx3.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>mls7yz5dvl.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>4fzdc2evr5.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>4pfyvq9l8r.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>ydx93a7ass.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>cg4yq2srnc.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>p78axxw29g.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>737z793b9f.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>v72qych5uu.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>6xzpu9s2p8.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>ludvb6z3bs.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>mlmmfzh3r3.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>c6k4g5qg8m.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>wg4vff78zm.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>523jb4fst2.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>ggvn48r87g.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>22mmun2rn5.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>3sh42y64q3.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>f38h382jlk.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>24t9a8vw3c.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>hs6bdukanm.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>prcb7njmu6.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>m8dbw4sv7c.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>9nlqeag3gk.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>cj5566h2ga.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>cstr6suwn9.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>w9q455wk68.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>wzmmz9fp6w.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>yclnxrl5pm.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>4468km3ulz.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>t38b2kh725.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>k674qkevps.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>7ug5zh24hu.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>5lm9lj6jb7.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>9rd848q2bz.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>7rz58n8ntl.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>4w7y6s5ca2.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>feyaarzu9v.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>ejvt5qm6ak.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>9t245vhmpl.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>n9x2a789qt.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>44jx6755aq.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>zmvfpc5aq8.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>tl55sbb4fm.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>2u9pt9hc89.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>5a6flpkh64.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>8s468mfl3y.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>glqzh8vgby.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>av6w8kgt66.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>klf5c3l5u5.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>dzg6xy7pwj.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>y45688jllp.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>hdw39hrw9y.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>ppxm28t8ap.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>424m5254lk.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>5l3tpt7t6e.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>uw77j35x4d.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>4dzt52r2t5.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>mtkv5xtk9e.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>gta9lk7p23.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>5tjdwbrq8w.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>3rd42ekr43.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>g28c52eehv.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>su67r6k2v3.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>rx5hdcabgc.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>2fnua5tdw4.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>32z4fx6l9h.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>xy9t38ct57.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>54nzkqm89y.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>9b89h5y424.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>pwa73g5rt2.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>79pbpufp6p.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>kbmxgpxpgc.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>275upjj5gd.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>rvh3l7un93.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>qqp299437r.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>294l99pt4k.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>74b6s63p6l.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>44n7hlldy6.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>6p4ks3rnbw.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>f73kdq92p3.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>e5fvkxwrpn.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>97r2b46745.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>3qcr597p9d.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>578prtvx9j.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>n6fk4nfna4.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>b9bk5wbcq9.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>84993kbrcf.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>24zw6aqk47.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>pwdxu55a5a.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>cs644xg564.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>6964rsfnh4.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>9vvzujtq5s.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>a7xqa6mtl2.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>r45fhb6rf7.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>c3frkrj4fj.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>6g9af3uyq4.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>u679fj5vs4.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>g2y4y55b64.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>zq492l623r.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>a8cz6cu7e5.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>s39g8k73mm.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>dbu4b84rxf.skadnetwork</string>
    </dict>
  </array>
```

### 2、app-ads.txt 填写

强烈建议填写 app-ads.txt 以保障**广告收益**。

广告主对真实流量的要求越来越高，所以DSP在不久的未来将不会购买缺少app-ads.txt文件的APP的流量，未实施app-ads.txt的App可能会从DSP的目标媒体池中删除。

配置方式如下：

- 在 ***TopOn 开发者后台 > ADX设置  > [app-ads.txt](https://portal.toponad.com/m/advanced/adx-set?tab=AppAds)*** 页面，填写您的域名和公司名称；
- 建议您在应用商店 (Google Play 或 Apple App Store) 配置相同域名的开发者网站，广告网络或DSP也将通过该网站验证app-ads.txt文件；



---

## 步骤四、广告加载渲染

各种广告类型的请求与渲染方式可参考 [MAX 官方文档](https://dash.applovin.com/documentation/mediation/unity/getting-started/integration)

---

## 步骤五、验证 TopOn 广告

在应用正式发布前，通过如下方式来验证SDK 是否成功集成。

### 1、打开 MAX SDK 日志

```
AppLovinSdk.getInstance(this).settings.setVerboseLogging(true)
```

> 打开后，可在 Logcat 中过滤此 TAG 查看相关日志：`AppLovinSdk|TopOn|anythink`

可通过以下日志获取设备ID(GAID)

```
anythink: ********************************** UA_6.3.01 *************************************
anythink: GAID(ADID): ********-****-****-****-************ , AndroidID: ****************
anythink: ********************************** UA_6.3.01 *************************************
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
