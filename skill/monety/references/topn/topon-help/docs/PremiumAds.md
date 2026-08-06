---
title: "PremiumAds"
source: "https://help.toponad.net/cn/docs/PremiumAds"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-04-07"
category_path: ["三方广告平台配置指南", "PremiumAds"]
content_sha256: "b426803fad314567aa7c9b236a488f9fb6552c6f8253e60213f11f4390c93ac4"
knowledge_role: "reference_only"
has_article_body: true
---

# PremiumAds

## Step1. 创建PremiumAds账号

[**注册并登录**](https://apps.premiumads.net/)PremiumAds账号

## Step2. 创建PremiumAds广告单元

注册账号后，可在PremiumAds后台添加应用。添加成功后，需要联系 PremiumAds 客户经理 (AM) 创建 PremiumAds 广告单元。



## Step3. 开通PremiumAds的Report API

(1) 请联系PremiumAds的客户经理开通PremiumAds的Report API功能。

| 参数名称 | 说明 |
| --- | --- |
| PremiumAds Access Token | 即PremiumAds的**API Token**。可在PremiumAds后台的**Reporting API**处获取，或联系PremiumAds的客户经理获取 |

**PremiumAds Acess Token获取路径**：Setting - Reporting API



**(2) 在TopOn开发者后台开通PremiumAds的Report API**

填写PremiumAds广告平台信息：
登录TopOn后台→广告平台→添加广告平台（PremiumAds）→编辑（开通报表API）



## Step4.在TopOn开发者后台上绑定PremiumAds

(1) 以下PremiumAds的1个参数需要配置在TopOn开发者后台，才能通过TopOn展示PremiumAds广告以及通过TopOn开发者后台展示PremiumAds的数据：

| 参数名称 | 说明 |
| --- | --- |
| 广告单元 ID | 即PremiumAds提供的广告单元ID |

**(2) 将PremiumAds的参数配置在Topon开发者后台**

**添加广告源**

① 登录**Topon后台→聚合管理→选择对应的应用和广告位→添加广告源**

② 填写Topon广告位对应的PremiumAds提供的广告单元ID



## Step5. 将Admob adapter添加进应用代码

**重要：PremiumAds采用Admob SDK加载和显示广告，请确保您的项目已添加Admob SDK**

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
