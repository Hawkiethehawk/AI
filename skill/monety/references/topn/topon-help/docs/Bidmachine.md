---
title: "Bidmachine"
source: "https://help.toponad.net/cn/docs/Bidmachine"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-05-11"
category_path: ["三方广告平台配置指南", "Bidmachine"]
content_sha256: "c14f7e0ed1f1c40aa863a328e389e65bad9528dc384f1fc89c168bdca711e104"
knowledge_role: "reference_only"
has_article_body: true
---

# Bidmachine

**TopOn支持已支持Bidmachine广告平台，您可以更新TopOn SDK v6.4.56及以上版本使用**

| **系统平台** | **竞价类型** | **广告类型** |
| --- | --- | --- |
| Android/iOS | 常规广告源、服务端竞价 | 激励视频、插屏、横幅、原生 |

## Step1. 创建Bidmachine账号

前往 [Bidmachine](https://bidmachine.io/)创建账号或者联系BidMachine（邮箱：hi@bidmachine.io）申请一个帐户。

## Step2. 在Bidmachine创建Source ID

(1) Source ID仅能由Biamachine代表提供，需联系对方提供；需要有该ID才能请求广告。

(2) Bidmachine后台无需创建应用和广告位，但在Topon后台需要命名每个广告位名字，用户区分广告数据；

## Step3. 在TopOn配置Bidmachine广告平台

(1) 将Bidmachine配置在TopOn开发者后台，需要的参数如下：

| **参数名称** | **说明** |
| --- | --- |
| Source ID | 用于广告请求 |
| 账号ID | 用户请求Report API广告数据 |
| 账号密码 | 用户请求Report API广告数据 |

(2) 将Bidmachine参数配置到TopOn开发者后台

登录TopOn后台 → 广告平台 → 广告源管理（Bidmachine）→ 添加广告源。填写第一点中获取的Source ID、账号ID、账号密码；



(3) 聚合管理 → 添加广告源，需要自定义Placement id填入，用于广告数据区分；



## Step4. 将Bidmachine adapter添加至应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
