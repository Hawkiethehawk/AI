---
title: "Moloco  bidding"
source: "https://help.toponad.net/cn/docs/Moloco-bidding"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-05-19"
category_path: ["三方广告平台配置指南", "Moloco  bidding"]
content_sha256: "eebd74a71445e0655284eeaa5ea0a218df825a34364546a8cbbacb15ab5affa6"
knowledge_role: "reference_only"
has_article_body: true
---

# Moloco  bidding

**TopOn已支持Moloco 广告平台，您可以按以下TopOn版本更新使用**

|  |  |  |  |
| --- | --- | --- | --- |
| **系统平台** | **竞价类型** | **广告类型** | **SDK版本要求** |
| Android、iOS | 服务端竞价S2S | 激励视频、插屏、Banner、原生 | TopOn Android **v6.5.50 &iOS 6.5.32**及以上版本支持 |

##

## Step1. 创建Moloco账号

前往 [Moloco](https://publisher.moloco.cloud/login)创建账号并登录。

## Step2. 在Moloco后台添加应用和广告位

**(1) 添加应用**

前往 **Overview-APPS** 页面，点击 **New App** 按钮，按平台提示添加您的App，同时获取**App Key**



**(2) 添加广告位**

应用创建完毕后，您可以在**Overview-Ad Units**页面点击**New Ad Unit，**同时获取对应广告位的**Ad Unit Id。**



## Step3. 获取Moloco Report API请求参数

在**Moloco**后台，点击 **Publisher settings**，获取 **Publisher ID和 Platform ID。**



## Step4. 在TopOn配置Moloco广告平台

(1) 将Moloco配置在TopOn开发者后台，需要的参数如下：

| 参数名称 | 说明 |
| --- | --- |
| App Key | Moloco为每个应用生成的id，用于SDK初始化、广告请求 |
| Ad Unit Id | Moloco为每个广告位生成的id，用于SDK初始化、广告请求和API报表数据拉取 |
| Publisher ID | 用于API报表数据拉取 |
| Platform ID | 用于API报表数据拉取 |

**(2)** **将Moloco参数配置到TopOn开发者后台**

登录TopOn后台 → 聚合管理→ 添加广告源，选择“Moloco”：

1）如从未添加过Moloco账号，则需要填写账号相关信息，可选择是否开通报表API能力，不开通则不用填写账号、密码、ID等信息。（注意：Moloco报表API 的请求数据为询价请求数量，对应Topon 报表指标“竞价” ）



2）关联账号后则需填写App key、Ad Unit Id等广告位信息



3) 广告平台管理

如在第一步时未选择开通报表API能力，则可以在：TopOn后台→广告平台→选择广告平台（Moloco）→编辑（开通报表API）；

如需要关联新的Moloco账号，亦可在此点击“+广告平台账号”新建



##

## Step5. 将Moloco Network adapter添加至应用代码

[参考TopOn SDK集成说明文档](https://help.toponad.net/cn/docs/bPMOE6)
