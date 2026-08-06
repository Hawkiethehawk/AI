---
title: "Pangle"
source: "https://help.toponad.net/cn/docs/JyIwIP"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "Pangle"]
content_sha256: "fc6ed05d760c120e5110c85b33369e16f2fec03938f0844da3c14584b9c06889"
knowledge_role: "reference_only"
has_article_body: true
---

# Pangle

## Step1. 创建Pangle账号

### 1. 穿山甲&Pangle说明

(1) 自2021年9月1日起，穿山甲针对不同地区客户提供不同平台：

① 中国大陆地区：提供穿山甲平台（英文展示为CSJ，对应平台地址为 [**pangle.cn**](https://www.pangle.cn/) ）

② 非中国大陆地区：提供Pangle平台（对应平台地址为 [**pangleglobal.com**](https://www.pangleglobal.com/) ）

(2) 自2021年9月1日起，TopOn 分别提供 **穿山甲（英文展示为CSJ）**和 **Panlge**两个广告平台供开发者使用：

① 您在**穿山甲（CSJ）**新创建的应用和广告位，在TopOn通过**穿山甲**广告平台进行配置。[**了解如何配置**](/cn/docs/PP2H2s)

② 您在**Panlge**新创建的应用和广告位，在TopOn通过**Pangle**广告平台进行配置。

### 2. Panlge平台集成说明

(1) 下载新版本的TopOn SDK:

| 系统平台 | 说明 |
| --- | --- |
| Android | 在[**TopOn SDK集成工具页面**](https://portal.toponad.net/m/sdk/download)，选择**是否为中国内地=否**，下载**非中国大陆地区**的Pangle SDK |
| iOS | 在[**TopOn SDK集成工具页面**](https://portal.toponad.net/m/sdk/download)，同时下载**穿山甲 和 Pangle SDK** 1. 选择**是否为中国内地 = 是**，下载**中国大陆地区**的穿山甲 SDK 2. 选择 **是否为中国内地 = 否**，下载**非中国大陆地区**的Pangle SDK |

(2) 针对iOS平台，按同时接入穿山甲 & Pangle SDK的逻辑处理([查看接入文档](/cn/docs/zODjLF#4.3_Pangle%E4%B8%8E%E7%A9%BF%E5%B1%B1%E7%94%B2%E8%AF%B4%E6%98%8E))

(3) 在TopOn的Pangle广告平台下配置Panlge广告源

## Step2. 创建Pangle的应用和广告位

(1) 在 **应用管理--> +新建** 中创建应用



(2) 在 **应用管理--> 广告位--> 添加** 中创建广告位



## Step3. 开通Pangle的Report API

(1) 当您的账号流水达到Pangle要求时，可以向Pangle商务申请开通Report API的权限。Pangle后台会显示对应API和用于通过Report API拉取收益数据的配置信息，具体如下：

**我们推荐您使用Pangle Reporting API 2.0**

① 用户ID：即您当前登录账户的ID

② Role ID

③ Security Key



推荐您使用TopOn自动创建广告源功能，您需要向Pangle申请开通**Pangle Management API**权限，并在TopOn后台打开自动创建广告源开关，配置对应参数

**(2) 在TopOn开发者后台开通Pangle的Report API**

① 登录TopOn后台→广告平台→添加广告平台（Pangle）→编辑（开通报表API，且版本号=2.0）→填写 用户ID、Role ID和Security Key

② 可选择开通自动创建广告源功能：自动创建广告源=是



**注意：** 如果您的账号未开通ReportAPI权限，**报表API**可以先选择 **未开通**，这不影响您后面配置广告位的操作，后续我们将在**上传三方数据**支持Pangle平台。

## Step3(1). 开通自动创建广告源功能

配置好上述参数后，可选择开通自动创建广告源功能，实现自动在广告后台同步创建广告位。



## Step4. TopOn平台配置Pangle广告位说明

Pangle的广告样式跟TopOn的广告类型对应关系如下：

| Pangle-广告样式 | TopOn-广告类型 |
| --- | --- |
| 信息流广告 | 原生广告 Native |
| Banner广告 | Banner广告 |
| 插屏广告 | 插屏广告(视频) Interstitial(Video) |
| 激励广告 | 激励视频广告 Rewarded Video |
| 开屏 | 开屏广告 Splash |

## Step5. 在TopOn开发者后台上绑定Pangle

(1) 以下Pangle的2个参数需要配置在TopOn开发者后台, 这样才能通过TopOn SDK展示Pangle广告, 以及通过TopOn开发者后台展示Pangle的数据：

| 参数名称 | 说明 |
| --- | --- |
| 应用 ID | Pangle每个应用对应的唯一的应用ID |
| 代码位 ID | Pangle每个广告单元对应的唯一的代码位 ID |

**(2) 将Pangle的参数配置在TopOn开发者后台**

① 添加广告源，登录TopOn后台→广告平台→广告源管理（Pangle）→添加广告源

② 填写TopOn应用对应的Pangle应用的**应用ID** 、 **代码位 ID**

③ 设置广告源的eCPM价格（可针对不同的流量分组进行独立设置）

**广告源将依据eCPM价格进行排序，请填写广告平台设置的真实eCPM价格。请在Pangle后台针对广告位设置eCPM价格（竞价类型=全球统一设价，全球统一CPM=固定CPM）**

**(3) 使用Pangle的应用内竞价**

① 在Pangle平台创建应用内竞价广告位（竞价类型=应用内竞价)



② 在TopOn广告源配置打开头部竞价



## Step6. 将Pangle adapter添加进应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
