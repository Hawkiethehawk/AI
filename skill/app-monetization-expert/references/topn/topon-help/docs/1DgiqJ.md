---
title: "Bigo"
source: "https://help.toponad.net/cn/docs/1DgiqJ"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-11-24"
category_path: ["三方广告平台配置指南", "Bigo"]
content_sha256: "ec7bbd7a6b41eeb7d69422d42610ac83c653158abddef45d55f2278ee74fa921"
knowledge_role: "reference_only"
has_article_body: true
---

# Bigo

**Topon支持已支持Bigo Ads广告平台，您可以更新Topon SDK v6.1.52及以上版本使用**

| 系统平台 | 竞价类型 | 广告类型 |
| --- | --- | --- |
| Android | 常规广告源、服务端竞价广告源 | 激励视频、插屏、横幅、开屏、原生 |
| iOS | 常规广告源 | 激励视频、插屏、横幅、开屏、原生 |

## Step1. 创建Bigo Ads账号

前往 [**Bigo Ads platform**](https://www.bigossp.com/login) 创建账号并登录。

## Step2. 在Bigo Ads后台添加应用和广告位

**(1) 添加应用**

前往 **资源管理 > 应用和网站管理** 页面，点击 **新增**按钮，按平台提示添加您的App。



**(2) 添加广告位**

应用创建完毕后，您可以在**广告位管理 > 新增广告位**。

① 如果使用**竞价广告源**时，**竞价类型**必须选择**Server Bidding**

② 如果使用**常规广告源**时，**竞价类型**必须选择**WaterFall**



## Step3. 开通Bigo Ads的Report API

(1) 从Bigo Ads后台获取**开发者ID**和**Token**

① 点击账户信息页面查看**开发者ID**

****

② 在**接入指引 > API > 查看Token**里，获取**Token**



**如果您的账号没有看到Bigo Ads平台，请联系我们为您开启Bigo Ads广告平台。**

**(2) 在Topon开发者后台开通Bigo Ads的Report API**

登录Topon后台→广告平台→添加广告平台（Bigo）→编辑（开通报表API）

填写**开发者ID**和**Token**



## Step3(1). 开通自动创建广告源功能

填写好上述参数后，如果希望开启自动创建广告源功能，实现自动在广告后台同步创建广告位，可通过对应按钮开启。



## Step4. 在Topon配置Bigo Ads广告平台

(1) 将Bigo Ads配置在Topon开发者后台，需要的Bigo Ads参数如下：

| 参数名称 | 说明 |
| --- | --- |
| App ID | Bigo Ads为每个应用的唯一id |
| 广告位ID | Bigo Ads为每个广告位生成的唯一id |

**(2) 获取Bigo的App ID和广告位ID**

① 前往 **资源管理 > 应用和网站管理** ，在这里可以找到所有应用 ID。



② 前往 **资源管理 > 广告位管理** ，在这里可以找到所有广告位ID。



**(3) 将Bigo参数配置到Topon开发者后台**

① 登录**Topon后台→聚合管理→选择对应的应用和广告位→添加广告源**



② 可以选择使用头部竞价的方式进行变现，或者使用普通的瀑布流方式。

## Step5. 将Bigo adapter添加至应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
