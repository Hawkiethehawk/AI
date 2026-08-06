---
title: "Digital Turbine(Fyber)"
source: "https://help.toponad.net/cn/docs/FSwnzK"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "Digital Turbine(Fyber)"]
content_sha256: "13c5f225814591f9dfe38524fd6da12c83af9089209ef7078813f396f02aa7c9"
knowledge_role: "reference_only"
has_article_body: true
---

# Digital Turbine(Fyber)

## Step1. 创建Fyber账号

[**注册并登录Fyber账号**](https://console.fyber.com/sign-up)

## Step2. 创建Fyber应用和Ad Spots

(1) 在 **Monetization-App Management** 页面，点击**Add App**，新建应用



(2) 在 **Monetization-App Management**界面，点击进入应用



(3) 在红框3标注处填写需要新建的广告位的信息，填写完毕后点击“**Add**”



(4) 点击“…”按钮里的 **Edit**，可以对广告位进行配置。



注：Placement Setup可以针对广告位设置Floor Price(eCPM底价)。

## Step3. 开通Fyber的Report API

**(1) 开通Fyber的Report API需要获取Reporting API Keys**

① 在 Fyber后台，点击左侧工具栏的头像，进入 User Profile。



② 在**User Profile**页面下滑可以找到**Reporting API Keys**，Reporting API Keys包括：**Publisher ID、Consumer Key、Consumer Secret**



**(2) 在Topon开发者后台开通Fyber的Report API**

填写**Publisher ID、Consumer Key、Consumer Secret** 登录Topon后台→广告平台→添加广告平台（Fyber）→编辑（开通报表API）



## Step3(1). 开通自动创建广告源功能

**若需要使用自动创建广告源功能**，需要额外获取Client ID、Client Secret。



1、在Digital Turbine后台查看User Profile



2、在Management API模块找到Client ID、Client Secret



注意：

DT后台有两种API，一种是高级报表API（Advanced Reporting APl-），一种是管理API（Management APl），这两个API对应的Client ID、Client Secret是不一样的，TopOn的自动创建需要的是Management APl的参数，首次开启需要根据文档指引生成。

## Step4. Topon平台配置Fyber广告单元说明

Fyber的广告单元跟Topon的广告类型对应关系如下：

| Fyber-广告单元 | Topon-广告类型 |
| --- | --- |
| Interstitial | 插屏广告 Interstitial |
| Rewarded | 激励视频广告 Rewarded Video |
| Banner | 横幅广告 Banner |

## Step5. 在Topon开发者后台上绑定Fyber

以下Fyber的2个参数需要配置在Topon开发者后台才能通过Topon展示Fyber广告以及通过Topon开发者后台展示Fyber的数据：

**(1) 在Fyber中获取App ID 和 Ad Spot ID**

① 在Fyber后台，**Monetization -> App Management**界面

② 点击进入对应应用，获取**App ID 、 Placement ID(Ad Spot ID)**



**(2) 将Fyber的参数配置在Topon开发者后台**

① 登录**Topon后台→聚合管理→选择对应的应用和广告位→添加广告源**

② 填写Topon应用对应的Fyber应用的**App ID、Placement ID(Ad Spot ID)**

③ 设置广告源的eCPM价格（可针对不同的流量分组进行独立设置）

**广告源将依据eCPM价格进行排序，请填写Fyber广告平台中设置的真实eCPM价格。Fyber支持针对Ad Spot设置eCPM价格**



##

## Step6. 将Fyber adapter添加进应用代码

**TopOn SDK V5.5.6 开始支持Fyber平台**。

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
