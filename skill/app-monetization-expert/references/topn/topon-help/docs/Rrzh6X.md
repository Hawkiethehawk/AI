---
title: "Verve"
source: "https://help.toponad.net/cn/docs/Rrzh6X"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "Verve"]
content_sha256: "e07e3378357dd8cb05cd9970484e60ad6dd6f627d9d9dcc563fd3ab903fc1ce3"
knowledge_role: "reference_only"
has_article_body: true
---

# Verve

**TopOn支持已支持Verve Group广告平台，您可以更新TopOn SDK v6.1.53及以上版本使用**

| 系统平台 | 竞价类型 | 广告类型 |
| --- | --- | --- |
| Android | 常规广告源、竞价广告源 | 激励视频、插屏、横幅、原生 |
| iOS | 常规广告源 、竞价广告源 | 激励视频、插屏、横幅、原生 |

## Step1. 注册Verve Group账户

Verve Group账户采用审核制，为开发者提供全托管服务。您可以通过以下两种方式注册账户：

(1) 直接联系您的TopOn AM/BD。他们会介绍您到一个Verve Group联络人，帮助您快速设置账户。

(2) 在 <https://verve.com/contact/>上填写表格，并说明您是TopOn开发者。这将加快流程，确保您收到快速响应。



## Step2. 激活您的账号

完成注册流程后，Verve Group将发送电子邮件激活您的账户。账户激活后，您将收到来自Verve Group的对接邮件，其中包含以下信息：

(1) App token

(2) Zone ID(Zone number)

① App-ads.txt list

② SKAdNetwork ID(适用于iOS)

根据您使用的是瀑布方法还是竞价，Verve Group可能会要求提供其他信息。 **开发者不需要自己在Verve Group的后台创建App。Verve Group的AM会帮忙创建，配置并提供相应的对接信息**

| 竞价模式 | 说明 |
| --- | --- |
| 瀑布流 | 分App和广告单元提供Token和Zone ID |
| 应用内竞价 | 一个账号提供一个Token和Zone ID |

## Step3. 访问报告

(1) 您可以登录[Verve Group](https://dashboard.pubnative.net/) 开发者后台查看数据，或使用Reporting API。Reporting API key可以从您的开发者后台上复制.

① 点击右上角账号打开**Reporting API Key**

② 点击**Reporting API Key**即可复制



**(2) 在TopOn开发者后台开通Verve Group的Report API**

登录TopOn后台→广告平台→添加广告平台（Verve）→编辑（开通报表API）

填写**API Key**



## Step4. 在TopOn配置Verve Group广告平台

(1) 将Verve Group配置在TopOn开发者后台，需要的Verve Group参数如下：

| 参数名称 | 说明 |
| --- | --- |
| App Token | Verve提供的唯一id |
| App ID | Verve后台的应用ID |
| Zone ID | Verve提供的Zone ID |

可根据下列步骤找到对应参数

  

  

**(2) 将Verve Group参数配置到TopOn开发者后台**

**添加广告源**

① 登录TopOn后台 → 广告平台 → 广告源管理（Verve）→ 添加广告源

② 可以选择使用头部竞价的方式进行变现，或者使用普通的瀑布流方式。

## Step5. 将Verve Group adapter添加至应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
