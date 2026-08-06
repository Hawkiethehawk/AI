---
title: "A4G(Admob）"
source: "https://help.toponad.net/cn/docs/eyIOrk"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "A4G(Admob）"]
content_sha256: "772a0460cbba23a9abe8ca47a7a6b693a00196b2d4f274d34c0720aade831191"
knowledge_role: "reference_only"
has_article_body: true
---

# A4G(Admob）

## Step1. 创建A4G账号

[**注册并登录**](https://traffic.a4g.com/www/admin/index.php)A4G账号

## Step2. 创建A4G广告单元

请联系A4G商务并创建A4G的广告单元

## Step3. 开通A4G的Report API

(1) 请联系A4G商务开通A4G的Report API功能。

| 参数名称 | 说明 |
| --- | --- |
| A4G账号ID | 即A4G的**affiliateid**。可通过A4G后台的**Company Info**链接获取，或联系A4G商务获取 |
| API Key | 在A4G后台获取，或联系A4G商务获取 |

**API Key获取路径**：Inventory - Report API



**(2) 在Topon开发者后台开通A4G的Report API**

填写A4G广告平台信息：
登录Topon后台→广告平台→添加广告平台（A4G）→编辑（开通报表API）



## Step4.在Topon开发者后台上绑定A4G(Admob)

(1) 以下A4G(Admob)的1个参数需要配置在Topon开发者后台才能通过Topon展示A4G(Admob)广告以及通过Topon开发者后台展示A4G(Admob)的数据：

| 参数名称 | 说明 |
| --- | --- |
| 广告单元 ID | 即A4G提供的广告单元ID，联系A4G商务获取 |

**(2) 将A4G(Admob)的参数配置在Topon开发者后台**

**添加广告源**

① 登录**Topon后台→聚合管理→选择对应的应用和广告位→添加广告源**

② 填写Topon广告位对应的A4G提供的广告单元ID



## Step5. 将Admob adapter添加进应用代码

**重要：A4G(Admob)采用Admob SDK加载和显示广告，请确保您的项目已添加Admob SDK**

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
