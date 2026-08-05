---
title: "Inmobi"
source: "https://help.toponad.net/cn/docs/6Ditdn"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "Inmobi"]
content_sha256: "5ab9f171816013a83798720269600c8074a1e58819c1c36fa74b8c1755447a9d"
knowledge_role: "reference_only"
has_article_body: true
---

# Inmobi

## Step1. 创建Inmobi账号

[**注册并登录**](https://publisher.inmobi.com/signup)Inmobi账号



## Step2. 创建Inmobi应用和广告位

**(1) 添加应用**

**注：**应用若不在AppStore或Google play上架可先点击“App not published yet?”，创建应用，待后续应用上架再补充填写商店链接。



**(2) 添加广告位**

选择广告位类型创建对应的广告位。



注：创建placement时，partner选择Custom Mediation



## Step3. 开通Inmobi的Report API

**(1) 开通Inmobi的Report API需要获取以下参数：Account ID、Client ID (Email)、Secret Key**

| 参数名称 | 说明 |
| --- | --- |
| Account ID | 您在Inmobi的Account ID |
| Client ID (Email) | 您在Inmobi的生成API Key的时候使用的对应邮件 |
| Secret Key | Inmobi的API Key |

通过下列步骤获取上述参数：登录inmobi后台 → My Account → Account Settings → API Key。

首次可点击 Generate API Key按钮，选择对应邮箱发送Key文件（收到的Key.pdf文件，解压密码为对应邮箱）。



解压后上述所有参数均可在pdf中找到。文件内容示例如下：



**(2) 在Topon开发者后台开通Inmobi的Report API**

登录Topon后台→广告平台→添加广告平台（Inmobi）→编辑（开通报表API）→依次填写Account ID、Client ID (Email)、Secret Key



## Step3(1). 开通自动创建广告源功能

若需要使用自动创建广告源功能，在广告平台账号页面，选择自动创建广告源=是，填写Account ID、Client ID (Email)、Secret Key。获取参数流程参考上述Step3。



## Step4. Topon平台配置Inmobi广告位说明

**Inmobi的广告类型和Topon的广告类型对应关系如下：**

| Inmobi-广告类型 | Topon-广告类型 |
| --- | --- |
| Rewarded Video | 激励视频 |
| Interstitial | 插屏 |
| Banner | Banner |
| Native Content | 原生 |

(更多Topon支持聚合的广告平台，其广告类型与Topon后台配置的广告类型，对应关系速查可见此[汇总文档](https://help.toponad.net/cn/docs/SfGJi6))

## Step5. 在Topon开发者后台上绑定Inmobi

(1) 以下Inmobi的参数需要配置在Topon开发者后台才能通过Topon展示Inmobi广告以及通过Topon开发者后台展示Inmobi的数据：

| 参数名称 | 说明 |
| --- | --- |
| Placement ID | Inmobi每个应用广告位对应的唯一的位置ID |



**(2) 将Inmobi的参数配置在Topon开发者后台**

添加广告源

① 登录Topon后台→广告平台→广告源管理（Inmobi）→添加广告源

② 填写Topon广告位对应的Inmobi Placement ID



如果开启了自动创建广告源功能，还需要填写APP KEY

Inmobi后台查看对应参数的具体位置可参考下图

##

## Step6. 将Inmobi adapter添加进应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
