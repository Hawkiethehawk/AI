---
title: "Start.io"
source: "https://help.toponad.net/cn/docs/ad6T2Z"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "Start.io"]
content_sha256: "23aaf0f87772d7c85b93ca6fc92778a84a39a2f588666a2c035840a5d81fe672"
knowledge_role: "reference_only"
has_article_body: true
---

# Start.io

| **系统平台** | **竞价类型** | **广告类型** |
| --- | --- | --- |
| Android | 常规广告源、服务端竞价（v6.5.31及以上版本） | 激励视频、插屏、横幅、原生 |
| iOS | 常规广告源 | 激励视频、插屏、横幅、原生 |

##

## Step1. 创建Start.io账号

[**注册并登录**](https://portal.start.io/#/signin)Start.io账号

## Step2. 创建并查看APPID

(1) **添加应用**

在 Publisher - My Apps 面板中点击 Add New APP，填写必要的字段，创建应用。获取APP ID



（2）广告位

创建start.io bidding 广告位 无需在start.io后台配置，直接在Topon后台创建bidding广告源，广告源的AD Tag需要按照以下格式填写： APP ID\_placement，例如配置banner广告，app ID是12345，则AD Tag 可以是12345\_ banner

## Step3. 开通Start.io的Report API

(1) 联系Start.io的对接人获取**PartnerID**和**Token**

**(2) 在TopOn开发者后台开通Start.io的Report API**

填写PartnerID和Token 登录TopOn后台→广告平台→添加广告平台（Start.io）→编辑（开通报表API）



## Step4. 在TopOn开发者后台上绑定Start.io

(1) 以下Start.io的2个参数需要配置在TopOn开发者后台, 这样才能通过TopOn SDK展示Start.io广告, 以及通过TopOn开发者后台展示Start.io的数据：

| 参数名称 | 说明 |
| --- | --- |
| APP ID | Start.io每个应用对应的唯一的应用ID |
| AD Tag | 自定义填写，建议格式：APP ID\_Placement |

① 在**My Apps**中查看**APP ID**



**(2) 将Start.io的参数配置在TopOn开发者后台**

① 添加广告源，登录TopOn后台→广告平台→广告源管理（Start.io）→添加广告源

② 填写TopOn应用对应的Start.io的应用ID（APP ID）、AD Tag（AD Tag）



## Step5. 将Start.io adapter添加进应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
