---
title: "Google Ad Manager"
source: "https://help.toponad.net/cn/docs/CjzilL"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "Google Ad Manager"]
content_sha256: "97fad7f0ea0654a73fc16fc884f4ae165b2d68a838083d1e72a41b9e02c6d3de"
knowledge_role: "reference_only"
has_article_body: true
---

# Google Ad Manager

## Step1. 创建Google Ad Manager账号

① 注册[**Google**](https://accounts.google.com/signup/v2/webcreateaccount?service=admob&continue=https://apps.admob.com/&gmb=exp&biz=false&flowName=GlifWebSignIn&flowEntry=SignUp&nogm=true)

② 登录[**Google Ad Manager**](https://admanager.google.com/home/)

## Step2. 创建 Google Ad Manager 应用和广告源

① 点击**Inventry - Apps - Add app**



② 点击**Inventry - Ad units - New ad unit**



## Step3. 在TopOn开发者后台上绑定Google Ad Manager

(1) 添加广告平台

登录TopOn后台-广告平台-添加广告平台，选择Google Ad Manager



(2) 添加广告源

在Google Ad Manager后台，广告单元页面，点击对应的广告源；点击**Tags**，Tag type选择**Mobile application tag**，点击continue复制Ad unit ID






然后在TopOn后台添加Google Ad Manager广告源



(3) 底价设置
需要向 Google Ad Manager AM 申请设置。

## Step4. 将Admob adapter添加进应用代码

**重要：Google Ad Manager采用Admob SDK加载和显示广告，请确保您的项目已添加Admob SDK**

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
