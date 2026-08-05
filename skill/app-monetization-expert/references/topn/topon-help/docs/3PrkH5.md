---
title: "Yandex"
source: "https://help.toponad.net/cn/docs/3PrkH5"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-12-03"
category_path: ["三方广告平台配置指南", "Yandex"]
content_sha256: "73708e523837adbc7bea7dbd0ef4691e0d30691b32ad42dc18654e53566ffa9c"
knowledge_role: "reference_only"
has_article_body: true
---

# Yandex

## Step1. 创建Yandex账号

前往 [**Yandex's publisher platform**](https://ads.yandex.com/monetization/?utm_source=tocn) 创建账号并登录。

## Step2. 在Yandex后台添加应用和广告位（ad units）

**(1) 添加应用**

访问<https://partner.yandex.com/>，前往 **Ads in apps** 页面，点击 **Add app** 按钮，按平台提示添加您的App。



**(2) 添加广告位（ad units）**

① App创建完毕后，您可以在对应App下添加广告位（ad units）。选择您需要的广告类型。



② 如需添加Yandex的bidding广告位，可选择“Maximum Iincome”。



## Step3. 开通Yandex的Report API

(1) 从Yandex后台获取**Token**

点击页面右侧API入口，选择**Get OAuth token for statistics API**



**(2) 在Topon开发者后台开通Yandex的Report API**

登录Topon后台→广告平台→添加广告平台（Yandex）→编辑（开通报表API）

填写**Statistics API**



## Step3(1). 开通自动创建广告源功能

**若需要使用自动创建广告源功能**，需要额外获取Block Configuration API。



Yandex后台操作：

(1) 查看API列表，找到Block Configuration API

**如果没有这个API，需要联系Yandex的客户经理开通权限**



(2) 获取应用的appid（**只有开通了自动创建功能的yandex账号，在添加广告源的时候需要填写appid**）

点击对应的app进入app信息页面，复制appid



添加广告平台后，在TopOn后台添加广告源的时候，填写上述appid
( 路径：登录**Topon后台→聚合管理→选择对应的应用和广告位→添加广告源** )



## Step4. Topon平台配置Yandex广告单元说明

Yandex的广告单元跟Topon的广告类型对应关系如下：

| Yandex-广告类型 | Topon-广告类型 |
| --- | --- |
| Rewarded ads | 激励视频 |
| Interstitial | 插屏 |
| Banner | Banner |
| Native | Native |
| Feed | 原生 |
| App open ads | 开屏 |

## Step5. 在Topon配置Yandex广告平台

(1) 将Yandex配置在Topon开发者后台，需要的Yandex参数如下：

| 参数名称 | 说明 |
| --- | --- |
| Ad Unit ID | Yandex为每个广告位生成的唯一id |

**(2) Ad Unit ID**

前往 **Ads in apps** → **Ad units**，切换到 **Ad units** 页面，在这里可以找到所有广告位的ID（ad unit id）。



**(3) 添加广告源**

登录登录Topon后台→聚合管理→选择对应的应用和广告位→添加广告源 (Yandex)

可以选择使用头部竞价的方式进行变现，或者使用普通的瀑布流方式。

## Step6. 将Yandex adapter添加至应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
