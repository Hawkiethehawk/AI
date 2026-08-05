---
title: "Kwai Network"
source: "https://help.toponad.net/cn/docs/Kwai-Network"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "Kwai Network"]
content_sha256: "5ebfada18eed8608818bf462ba99559314900d3da7142bd16e46b5befd3652fb"
knowledge_role: "reference_only"
has_article_body: true
---

# Kwai Network

**TopOn支持已支持Kwai Network广告平台，您可以按以下TopOn版本更新使用**

|  |  |  |  |
| --- | --- | --- | --- |
| **系统平台** | **竞价类型** | **广告类型** | **TopOn version** |
| Android | 客户端竞价广告源 | 激励视频、插屏 | TopOn Android v6.3.30及以上版本支持 |
| iOS | 客户端竞价广告源 | 激励视频、插屏 | TopOn iOS v6.3.10及以上版本支持 |

##

## Step1. 创建**Kwai**账号

前往 [Kwai](https://kwainetwork.kwai.com/)创建账号并登录。



## Step2. 在Kwai后台添加应用和广告位

**(1) 添加应用**

前往 **应用管理** 页面，点击 **新增应用**按钮，按平台提示添加您的App。



**(2) 添加广告位**

应用创建完毕后，您可以在**应用管理** 页面点击**新增广告位**



## Step3. 开通Kwai的Report API

(1) 在**Kwai**后台，点击右上角头像，即可获取 **PublisherID和Api Key。**



(2) 在TopOn开发者后台开通Kwai的Report API

登录TopOn后台→广告平台→添加广告平台（Kwai）→编辑（开通报表API）

填写Kwai 的**Publisher ID**和**Api Key(token)**



## Step4. 在TopOn配置Kwai广告平台

(1) 将Kwai配置在TopOn开发者后台，需要的Kwai参数如下：

| 参数名称 | 说明 |
| --- | --- |
| 应用 ID | Kwai为每个应用生成的id，用于SDK初始化和API报表拉取 |
| Token | Kwai为每个账号生成的id，用于SDK初始化和API报表拉，参考上述steps3在kwai后台获取 |
| 广告位ID(Tag ID) | Kwai为每个广告位生成的唯一id，用于SDK请求 |

**(2) 获取Kwai的应用 ID，Token和广告位ID**

① 前往 **应用管理**，在这里可以找到每个应用的**应用ID**



② 前往**广告位** ，在这里可以找到所有广告位ID（TagID）。



**(3) 将Kwai参数配置到TopOn开发者后台**

登录TopOn后台 → 广告平台 → 广告源管理（Kwai）→ 添加广告源。填写应用 ID，Token和广告位ID(TagID)。



## Step5. 将Kwai Network adapter添加至应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
