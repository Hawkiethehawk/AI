---
title: "Helium"
source: "https://help.toponad.net/cn/docs/4eCEdR"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-26"
category_path: ["三方广告平台配置指南", "Helium"]
content_sha256: "53bf33ec363811de4f8197ae46a444be511beba719b9fcfb5731833dd145008e"
knowledge_role: "reference_only"
has_article_body: true
---

# Helium

**Helium**是**Chartboost**的头部竞价广告平台。**Helium**除了支持Chartboost平台的头部竞价外，还支持**Facebook、Adcolony、Tapjoy**的头部竞价，您可以根据需求自行添加上述平台的头部竞价功能。

## Step1. 创建Helium账号

① 注册并登录[**Chartboost**](https://dashboard.chartboost.com/login)，点击Mediation进入Helium平台

**② 如果没找到Helium入口，请联系Chartboost商务人员开通**



## Step2. 创建Helium应用和广告单元

(1) 添加**App**

注：应用必须在AppStore或Google play上架才可使用Helium创收. **Helium会自动同步Charboost上已创建的App**



(2) 添加**Placement**

根据应用广告场景需要创建对应的Placement。



(3) 添加**Networks**(可选）

除了**Chartboost(Helium)**平台的头部竞价外，您还可以在**Networks**自行添加**Facebook、Adcolony、Tapjoy**的头部竞价。 注：添加**Facebook、Adcolony、Tapjoy**的头部竞价配置后，请联系Helium工作人员确认配置是否生效。



## Step3. 开通Helium的Report API

**(1) 开通Helium的Report API需要获取用户ID(User ID)和用户签名(User Signature)两个参数**



**(2) 在Topon开发者后台开通Helium的Report API**

① 登录**Topon后台→广告平台→添加广告平台（Chartboost & Helium）→编辑（开通报表API）**

② 填写**用户ID(User ID)、用户签名(User Signature)**



## Step4. 在Topon开发者后台上绑定Helium

(1) 以下Helium的3个参数需要配置在Topon开发者后台才能通过Topon展示Helium广告以及通过Topon开发者后台展示Helium的数据：

① 在**Apps --> Overview**，选择App并查看**Helium App ID** 和 **Helium Signature**



② 在**Apps --> Placements**查看该应用下已创建的**Placement**



**(2) 将Helium的参数配置在Topon开发者后台**

① 登录**Topon后台→聚合管理→选择对应的应用和广告位→添加广告源**

② 填写TopOn应用对应的**应用ID(Helium App ID) 、应用签名（Helium Signature)、广告位名称(Placement)**



## Step5. 将Helium adapter添加进应用代码

(1) 在[TopOn SDK 集成工具](https://portal.toponad.net/m/sdk/download) 下载 **Chartboost & Helium SDK**。**Chartboost SDK 已经包含 Helium SDK**



(2) [参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
