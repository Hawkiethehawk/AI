---
title: "VK（原myTarget）"
source: "https://help.toponad.net/cn/docs/7Dmura"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-15"
category_path: ["三方广告平台配置指南", "VK（原myTarget）"]
content_sha256: "cbbd67811217b916bab40e228a2f2b95bf21355449e05d595b5a61b307bb359b"
knowledge_role: "reference_only"
has_article_body: true
---

# VK（原myTarget）

## Step1. 创建VK账号

注册并登录[VK（原mytarget）](https://ads.vk.com/hq/registration/partner)



##

## Step2. 创建VK应用和广告单元

**(1) 添加App**

注：应用必须在AppStore或Google play上架才可使用VK创收.



**(2) 添加Placement**

根据应用广告场景需要创建对应的**Ad Placement**。



① 创建**常规Ad Placement**

常规**Ad Placement**可设置eCPM Floor，Topon将会根据eCPM Floor进行排序。在创建广告位时，**集成类型**选择**直接集成**



② **创建****头部竞价Ad Placement**

**头部竞价Ad Placement**在请求广告前会进行实时竞价**。**在创建广告位时，**集成类型**选择**in-app bidding**



## Step3. 开通VK的Report API

**(1) 开通VK的Report API需要获取Access Tokens**

可以在**设置 -->统计数据 API**生成 Access Tokens



**(2) 在Topon开发者后台开通VK的Report API**

① 登录**Topon后台→广告平台→添加广告平台（VK）→编辑（开通报表API）**

② 填写**Access Tokens**



## Step4. 在Topon开发者后台上绑定VK

(1) 以下VK的3个参数需要配置在Topon开发者后台才能通过Topon展示VK广告以及通过Topon开发者后台展示VK的数据：

① 在**Apps**页面查看**App ID**



② 选择**App**，查看已创建**Ad placement**的**Slot ID** &**Placement ID。**Placement ID和Slot ID相同。



(2) 将VK的参数配置在Topon开发者后台

① 登录**Topon后台→聚合管理→选择对应的应用和广告位→添加广告源**

② 填写Topon应用对应的**Slot ID、Placement ID（两个相同）**

- **Slot ID** ： VK Ad SDK会使用 Slot ID请求广告
- **Placement ID**：Topon会使用VK的Placement ID拉取VK的收益数据



## Step5. 将VK adapter添加进应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
