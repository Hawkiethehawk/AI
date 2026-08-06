---
title: "Amazon Publisher Services(APS)"
source: "https://help.toponad.net/cn/docs/Amazon-Publisher-Services-APS"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "Amazon Publisher Services(APS)"]
content_sha256: "fbb64ccccf1508d080e0fe7aa7d0d2bceaa74bf1af5f62be07d8a4bf3ded865c"
knowledge_role: "reference_only"
has_article_body: true
---

# Amazon Publisher Services(APS)

**TopOn支持已支持Amazon Publisher Services(APS)广告平台，您可以更新TopOn SDK v6.3.10及以上版本使用**

|  |  |  |
| --- | --- | --- |
| **系统平台** | **竞价类型** | **广告类型** |
| Android | 客户端竞价广告源 | 激励视频、插屏、横幅 |

## Step1. 创建APS账号

请前往 [APS](https://ams.amazon.com/webpublisher/mdtb/mobile_apps) 创建账号并登录

## Step2. 在APS后台添加应用和代码位

**(1) 添加应用**

请在APS后台进入**Inventory > App Management**页面，点击 Add APP开始创建应用



**(2) 添加代码位**

① 请在APS后台进入Inventory > App & Slot Integration页面，点击 Create Slots开始创建广告位



② 在代码位配置页面“Select Service”选择“OTHER”，进入下一步。



③ “Slot Configuration”选择按需求配置Media Type，Ad Size和Slot Name，进入下一步。



④ 选择代码位需要关联的APP，然后点击“Create Slots”,完成创建



## Step3. 在TopOn配置APS广告平台

将APS配置在TopOn开发者后台，需要的APS参数如下：

|  |  |
| --- | --- |
| **参数名称** | **说明** |
| APP ID | APS为每个应用生成的唯一ID |
| UUID | APS为每个代码位生成的唯一ID |
| Price Point | APS为每个代码位生成的价格区间文件 |

**(1) 获取APS的APP ID和UUID**

前往 **Inventory > App & Slot Integration** ，点击对应的应用，即可进入详情页



在详情页可以看到当前应用的APP ID，当前应用的代码位列表及对应的UUID和Price Point



**(2) 将APS参数配置到TopOn开发者后台**

登录TopOn后台 → 广告平台 → 广告源管理（APS）→ 添加广告源。填写APS后台获取的APP ID和UUID，Price Point需要从APS后台下载后在TopOn广告源上传。



## Step4. 将APS adapter添加至应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
