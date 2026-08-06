---
title: "点击跳转地址配置说明"
source: "https://help.toponad.net/cn/docs/1oU8Bm"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-05-30"
category_path: ["平台使用指南", "高级功能", "交叉推广", "点击跳转地址配置说明"]
content_sha256: "2a54be85ad670f9be21f54a7b2c7696b649588f88e7cce0472780f8e72a0b892"
knowledge_role: "reference_only"
has_article_body: true
---

# 点击跳转地址配置说明

## 1. 不使用三方监测平台

| **平台** | **说明** | **示例** |
| --- | --- | --- |
| iOS | 填写应用在App Stores的地址 | <https://apps.apple.com/app/id123> |
| Android海外 | 填写应用在Google Play的地址 | <https://play.google.com/store/apps/details?id=com.abc> |
| Android国内 | 可以直接填写APK下载地址，地址需要包含APK关键字且支持APK下载。**跳转方法**选择**APK下载** | <http://www.abc.com/abc.apk> |

## 2. 使用三方监测平台

如果您的应用使用三方监测平台进行归因统计，可以在三方监测平台生成Tracking链接并按照以下配置说明完成配置。后续用户点击TopOn 交叉推广的链接并产生安装时，您可以在TopOn 交叉推广报表查看安装数据。 目前TopOn 交叉推广已对接好**Appsflyer、Adjust、Kochava、Tenjin**等三方监测平台，可以接收上述三方监测平台的安装数据。

### 2.1 Appsflyer配置说明

(1) 登陆AppsFlyer平台，并在Configuration --> Integrated Partners中查找 TopOn。 找到Toponad并点击进入。

(2) 在Integration选项中，打开Activate partner 和 In-app events postback。



(3) 在**Attribution Link**选项中，复制**Click attribution link**并配置到TopOn平台的**点击跳转地址。**



### 2.2 Adjust配置说明

(1) 在Adjust后台选择需要推广的游戏，并通过**自定义方式**创建点击链接和展示链接。

- 点击链接示例：<https://app.adjust.com/cbtest>
- 展示链接示例：<https://app.adjust.com/impression>



(2) [打开Adjust的自定义链接生成页面](https://partners.adjust.com/) (以下展示生成点击链接的步骤，展示链接的生成方式类似)。



**填写地址如下：**

```
https://app.adjust.com/abc?network=topon&gps_adid={gaid}&android_id={androidid}&idfa={idfa}&idfv={idfv}&campaign={offer_id}&adgroup={package_name}&creative={placement_id}
```

- **?**号前的内容，为广告主生成的自定义点击链接（必须）。
- **?**号后的内容，为推广渠道信息。由TopOn自动补充并传递给Adjust（可选，建议加上。方便在Adjust后台分渠道查看安装数）。

| Adjust参数名称 | Adjust接收参数 | TopOn占位符 |
| --- | --- | --- |
| network层级 | network | topon |
| GAID（重要） | gps\_adid | {gaid} |
| Android ID（重要） | android\_id | {androidid} |
| IDFA（重要） | idfa | {idfa} |
| IDFV（重要） | idfv | {idfv} |
| campaign层级 | campaign | {offer\_id} |
| 子渠道层级 | adgroup | {package\_name} |
| 素材层级 | creative | {placement\_id} |

(3) 配置**Install Callback**

添加Install Callback后，当TopOn渠道产生安装时，Adjust会向TopOn回传安装数据。填写以下TopOn的Install PostBack地址：

```
https://postback.mosspf.net/install?click_id={clickid}
```



(4) Generated URLs

在**Generated URLs**中点击Copy URL，并填写到TopOn页面

[了解Adjust更多配置说明](https://help.adjust.com/en/resources/network-guides/integrating-adjust#manually-set-up-callbacks-from-adjust)

### 2.3 Tenjin配置说明

(1) 登陆Tenjin平台，创建一个TopOn的自定义渠道。参考Tenjin的自定义渠道创建流程。

(2) 为TopOn自定义渠道创建自定义CallBack。当TopOn渠道产生安装时，Tenjin会向TopOn回传安装数据。

① 在Tenjin的**CallBack**中选择**Create Custom Callback。**

② 在**Setting**的**URL**中填写TopOn的安装回调接收地址：

```
https://postback.mosspf.net/install?click_id={{click_id}}
```

③ 在**Marketing Channels**中选择第一步已配置的TopOn渠道



(3) 为应用创建Tracking链接。[参考Tenjin的Tracking链接创建流程](https://docs.tenjin.com/docs/zh/custom-channel)
Tracking 链接创建成功后，得到以下链接

- 点击链接示例： <https://track.tenjin.io/v0/click/abc>
- 展示链接示例： <https://track.tenjin.io/v0/impression/abc>

(4) Tracking链接的占位符替换

- **建议在Tenjin生成的链接后增加TopOn支持的占位符以提高归因效果**

| 平台 | 建议添加占位符 |
| --- | --- |
| iOS | advertising\_id={idfa}&click\_id={clickid}&campaign\_id={offer\_id}&site\_id={placement\_id}&ip\_address={ip}&user\_agent={user\_agent} |
| Android | advertising\_id={gaid}&click\_id={clickid}&campaign\_id={offer\_id}&site\_id={placement\_id}&ip\_address={ip}&user\_agent={user\_agent} |

- 添加占位符后的链接地址填写到TopOn平台，示例如下：

```
 https://track.tenjin.io/v0/click/abc?advertising_id={idfa}&click_id={clickid}&campaign_id={offer_id}&site_id={placement_id}&ip_address={ip}&user_agent={user_agent}
```

- [查看Tenjin支持的全部占位符](https://docs.tenjin.com/docs/zh/callback-macros)

### 2.4 Kochava配置说明

(1) 登陆Kochava(FreeAppAnalytics)平台，并选择需要生成Tracking链接的应用，选择**Campaign Manager。**



(2) 点击**Add a Tracker** 创建一个Tracker



(3) 在**Media Partner**中选择**TopOn**



(4) 将生成的Tracking链接填写到TopOn平台

### 2.5 热云配置说明

(1) 登陆热云平台，为TopOn交叉推广的广告生成Tracking链接。

① 在热云平台【**配置】-【渠道管理】-【自定义渠道】**，创建**自定义渠道。**



② 在【**推广管理】-【推广活动管理】**，创建自定义渠道的推广活动。



③ 复制热云生成的点击监测链接

```
// 热云链接示例

https://uri6.com/tkio/abc
```

(2) 在热云的点击监测链接上补充TopOn的Tracking占位符。

- iOS补充以下占位符：**?idfa={idfa}&ip={ip}&clickid={clickid}&\_ry\_adplan\_id={app\_id}&\_ry\_adcreative\_id={placement\_id}**

```
//补充占位符示例

https://uri6.com/tkio/abc?idfa={idfa}&ip={ip}&clickid={clickid}&_ry_adplan_id={app_id}&_ry_adcreative_id={placement_id}
```

- Android补充以下占位符：**?imei={imei}&mac={mac}&androidid={androidid}&oaid={oaid}&ip={ip}&clickid={clickid}&\_ry\_adplan\_id={app\_id}&\_ry\_adcreative\_id={placement\_id}**

```
// 补充占位符示例

https://uri6.com/tkio/abc?imei={imei}&mac={mac}&androidid={androidid}&oaid={oaid}&ip={ip}&clickid={clickid}&_ry_adplan_id={app_id}&_ry_adcreative_id={placement_id}
```

(3) 配置Install CallBack**(可选)**

如需要将热云的安装数据回传到TopOn，可以在补充完占位符的链接后增加Topon CallBack地址：**&callback=http%3A%2F%2Fpostback.mosspf.net%2Finstall%3Fclick\_id%3D{clickid}**

```
// 补充占位符示例

https://uri6.com/tkio/abc?imei={imei}&mac={mac}&androidid={androidid}&oaid={oaid}&ip={ip}&clickid={clickid}&_ry_adplan_id={app_id}&_ry_adcreative_id={placement_id}&callback=http%3A%2F%2Fpostback.mosspf.net%2Finstall%3Fclick_id%3D{clickid}
```

### 2.6 其他三方监测平台

(1) 在三方监测平台中生成Tracking链接。

(2) 使用TopOn支持占位符替换Tracking链接。

- 目前TopOn平台支持在Tracking中使用以下占位符



- 建议在Tracking中至少包含以下参数

| 参数名称 | TopOn占位符 |
| --- | --- |
| Click ID | {click\_id} |
| GAID | {gaid} |
| Android ID | {androidid} |
| IDFA | {idfa} |
| IDFV | {idfv} |

(3) 配置Install CallBack**(可选)**

- 参考三方监测平台的对接文档，在三方监测平台上配置TopOn的Install Callback地址。TopOn的install Callback地址为：

```
https://postback.mosspf.net/install?click_id={click_id}
```
