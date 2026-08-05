---
title: "Opera Ads"
source: "https://help.toponad.net/cn/docs/Opera-Ads"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-05-19"
category_path: ["三方广告平台配置指南", "Opera Ads"]
content_sha256: "6f59751e96d5ccd2feb06017312640f40a10692159ca45da3a80c1fb85aca08e"
knowledge_role: "reference_only"
has_article_body: true
---

# Opera Ads

**TopOn已支持Opera 广告平台，您可以按以下TopOn版本更新使用**

|  |  |  |  |
| --- | --- | --- | --- |
| **系统平台** | **竞价类型** | **广告类型** | **SDK版本要求** |
| Android | 服务端竞价S2S | 激励视频、插屏、Banner、原生、开屏 | TopOn Android **v6.6.20**及以上版本支持 |

##

## Step1. 创建Opera账号

前往 [Opera](https://ofp.adx.opera.com/login)创建账号并登录。

## Step2. 在Opera后台添加应用和广告位

**(1) 添加应用**

前往 **Inventory** 页面，点击 **New App/Site**按钮，按平台提示添加您的App，同时此页面在"**App / Site Name"**可以获取Raw APP ID信息

注：Raw APP ID必须复制完整格式，如：pub14171003xxxxxx/ep14171042xxxxxx/app14269547xxxxxx



**(2) 添加广告位**

应用创建完毕后，您可以在**Inventory**页面点击**Ad Placements，**点击 **New Ad Placement**新建广告位，同时在该页面 Ad Placement Name 下获取广告位id信息

注：Opera 广告位创建无需选择是否为bidding\waterfall 类型，当前二者均支持。广告位id格式为：s15006469xxxxxx



## Step3. 获取API请求参数

在**Opera**后台，点击 **Integrations**，获取**Reporting API和 Management API 的**Token，Management API用于自动创建广告位，如有需要请同步获取。



## Step4. 在TopOn配置Opera广告平台

(1) 将Opera配置在TopOn开发者后台，需要的参数如下：

| 参数名称 | 说明 |
| --- | --- |
| Raw APP ID | Opera为每个应用生成的id，用于SDK初始化、广告请求 |
| Placement ID | Opera为每个广告位生成的id，用于广告请求和API报表数据拉取 |
| Reporting API Token | 用于API报表数据拉取 |
| Management API Token | 用于自动创建&管理广告位 |

**(2)** **将Opera参数配置到TopOn开发者后台**

登录TopOn后台 → 聚合管理→ 添加广告源，选择“Opera”：

1）如从未添加过Opera账号，则需要填写账号相关信息，可选择是否开通报表API、自动创建广告源能力



2）关联账号后则需填写Raw APP ID、Placement ID等广告位信息

如：Raw APP ID：pub14171003xxxxxx/ep14171042xxxxxx/app14269547xxxxxx

Placement ID：s15006469xxxxxx



3) 广告平台管理

如在第一步时未选择开通报表API能力，则可以在：TopOn后台→广告平台→选择广告平台（Opera）→编辑（开通报表API）；

如需要关联新的Opera账号，亦可在此点击“+广告平台账号”新建

##

## Step5. 将Opera Network adapter添加至应用代码

[参考TopOn SDK集成说明文档](https://help.toponad.net/cn/docs/bPMOE6)
