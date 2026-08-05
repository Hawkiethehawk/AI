---
title: "Applovin"
source: "https://help.toponad.net/cn/docs/SDLzdz"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "Applovin"]
content_sha256: "9e18213fc6d9b9d83eff18dfa0453074ef3260c5a1bf078587a848e96952436f"
knowledge_role: "reference_only"
has_article_body: true
---

# Applovin

## Step1. 创建Applovin账号

[**注册**](https://dash.applovin.com/signup)Applovin账号



[登录](https://dash.applovin.com)Applovin账号



## Step2. 创建Applovin的应用和广告位

**(1) 添加应用**

Applovin后台不需要创建应用，当集成时初始化Applovin SDK即可自动获取应用信息。 下图Application页面用于应用的管理。



**(2) 添加广告位（Zone）**

根据应用广告场景需要创建对应的广告位（Zone）类型。



**注意：可给每个广告单元设置需要的底价**



## Step3. 开通Applovin的Report API

**(1) 开通Applovin的Report API需要获取SDK Key和Report Key两个参数。**

| 参数名称 | 说明 |
| --- | --- |
| SDK Key | Applovin的SDK Key |
| Report Key | Applovin的Report Key |

① SDK Key

Account→Keys→SDK Key



② Report Key

Account→keys→Report Key



**(2) 在Topon开发者后台开通Applovin的Report API**

**填写SDK Key和Report Key**

登录Topon后台→广告平台→变现平台→添加广告平台（Applovin）→编辑（开通报表API）→先填写SDK Key→再填写Report Key



## Step4. Topon平台配置Applovin广告位说明

**Applovin的广告类型和广告类型对应关系如下：**

| Applovin-广告类型 | Topon-广告类型 |
| --- | --- |
| Rewarded | 激励视频 |
| Banner | Banner |
| Non-Rewarded Full Screen | 插屏 |

(更多Topon支持聚合的广告平台，其广告类型与Topon后台配置的广告类型，对应关系速查可见此[汇总文档](https://help.toponad.net/cn/docs/SfGJi6))

## Step5.在Topon开发者后台上绑定Applovin

(1) 以下Applovin的1个参数需要配置在Topon开发者后台，才能通过Topon展示Applovin广告以及通过Topon开发者后台展示Applovin的数据：

| 参数名称 | 说明 |
| --- | --- |
| Zone ID | Applovin每个广告位对应的唯一的Zone ID |

Zone ID :

**AppDiscovery→Monetization→Zones**



**(2) 将Applovin的参数配置在Topon开发者后台**

**添加广告源**

① 登录Topon后台→聚合管理→添加广告源（Applovin）

② 填写Topon应用广告位对应的Applovin应用广告位的Zone ID



##

## Step6. 将Applovin adapter添加进应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
