---
title: "Sigmob"
source: "https://help.toponad.net/cn/docs/gYyQOU"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-05-19"
category_path: ["三方广告平台配置指南", "Sigmob"]
content_sha256: "f212673eedf5c644501703365812341f56df22a31fc55f12c26fa0ba78b4c604"
knowledge_role: "reference_only"
has_article_body: true
---

# Sigmob

## Step1. 创建Sigmob账号

登录[**Sigmob官网**](http://m.sigmob.com/)申请开通账号

## Step2. 创建Sigmob的应用和广告单元

(1) 在 **应用管理--> 新建应用** 中创建应用



(2) 在 **广告单元--> 新建广告单元** 中创建广告单元



## Step3. 开通Sigmob的Report API

(1) 您可以向Sigmob商务申请开通ReportAPI的权限。Sigmob会提供用于通过Report API拉取收益数据的配置信息，具体如下

- Public Key： 即发布商Key，每个Sigmob账号对应一个发布商Key
- Secure Key： 即密钥口令，每个发布商ID对应一个密钥口令

**(2) 在Topon开发者后台开通Sigmob的Report API**

登录Topon后台→广告平台→添加广告平台（Sigmob）→编辑（开通报表API）→填写Public Key和Secure Key



## Step4. Topon平台配置Sigmob广告单元说明

**(1) Sigmob广告单元介绍**

Sigmob的广告单元跟Topon的广告类型对应关系如下：

| Sigmob-广告单元 | Topon-广告类型 |
| --- | --- |
| 新插屏广告 | 插屏广告(视频)Interstitial(Video) |
| 开屏广告 | 开屏广告 Splash |
| 激励视频 | 激励视频广告 Rewarded Video |
| 原生广告 | 原生 Native |



## Step5. 在Topon开发者后台上绑定Sigmob

(1) 以下Sigmob的3个参数需要配置在Topon开发者后台, 这样才能通过Topon SDK展示Sigmob广告, 以及通过Topon开发者后台展示Sigmob的数据：

| 参数名称 | 说明 |
| --- | --- |
| APP ID | Sigmob每个应用对应的唯一的应用ID |
| APP Key | Sigmob每个应用对应的唯一的应用Key |
| Placement ID | Sigmob每个广告单元对应的唯一的广告单元ID |

① 在**应用管理**中查看**APP ID**和**APP Key**



② 在**广告单元**中查看**广告单元 ID**



③ 如果您的应用未上线，您需要Sigmob平台的**测试工具**页面添加测试设备



**(2) 将Sigmob的参数配置在Topon开发者后台**

① 添加广告源，登录Topon后台→聚合管理→选择对应的应用和广告位→添加广告源

② 填写Topon应用对应的Sigmob的应用ID（APP ID）、应用Key（APP Key）、广告单元ID（Ad Unit ID）

③ 设置广告源的eCPM价格（可针对不同的流量分组进行独立设置）

**广告源将依据eCPM价格进行排序，请填写广告平台设置的真实eCPM价格。请跟Sigmob商务沟通设置广告源的eCPM价格**



## Step6. 将Sigmob adapter添加进应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
