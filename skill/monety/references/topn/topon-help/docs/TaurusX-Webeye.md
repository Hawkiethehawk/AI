---
title: "TaurusX(Webeye)"
source: "https://help.toponad.net/cn/docs/TaurusX-Webeye"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-05-19"
category_path: ["三方广告平台配置指南", "TaurusX(Webeye)"]
content_sha256: "cec6c8c1b3f3c9c5f4fe55314e6792f9d7913526771f754708fba4e4f15260f1"
knowledge_role: "reference_only"
has_article_body: true
---

# TaurusX(Webeye)

**TopOn支持已支持TaurusX(webeye)广告平台，您可以更新TopOn SDK Android v6.4.18、iOS v6.5.43及以上版本使用**

| 系统平台 | 竞价类型 | 广告类型 |
| --- | --- | --- |
| Android、iOS（v6.5.43及以上版本） | 常规广告源、服务端竞价S2S | 激励视频、插屏、开屏、原生、Banner |

## Step1. 创建**TaurusX**账号

前往 [TaurusX](https://publisher.taurusx.com/register)创建账号并登录。



## Step2. 在TaurusX后台添加应用和广告位

**(1) 添加应用**

前往 **应用管理** 页面，点击 **新建**按钮，按平台提示添加您的App。



**(2) 添加广告位**

应用创建完毕后，您可以在**应用管理 > 广告位 页面添加**

① 如果使用**竞价广告源**时，**竞价类型**必须选择 **竞价**

② 如果使用**常规广告源**时，**竞价类型**必须选择 **瀑布流**





## Step3. 开通TaurusX的Report API

(1) 在**TaurusX**后台，点击右上角头像，即可获取 **Token**



(2) 在TopOn开发者后台开通TaurusX的Report API

登录TopOn后台→广告平台→添加广告平台（TaurusX）→编辑（开通报表API）

填写**TaurusX****Token**

****

(3) 如果开通“自动创建广告源”功能，还需要填写“企业ID”

具体参数获取路径参考： TaurusX后台→账号管理→公司信息，查看企业ID



## Step4. 在TopOn配置TaurusX广告平台

TauruX的广告样式跟TopOn的广告类型对应关系如下：

| TauruX-广告样式 | TopOn-广告类型 |
| --- | --- |
| Native | 原生广告 Native |
| Banner | Banner广告-300×50 |
| MREC | Banner广告-300×250 |
| Intersitial | Interstitial |
| Rewarded | Rewarded Video |
| Splash | 开屏广告 Splash |

(1) 将TaurusX配置在TopOn开发者后台，需要的TaurusX参数如下：

| 参数名称 | 说明 |
| --- | --- |
| 应用 ID | TaurusX为每个应用生成的id，用于SDK初始化和API报表拉取 |
| 广告位ID | TaurusX为每个广告位生成的唯一id |

**(2) 获取TaurusX的应用 ID，广告位ID**

① 前往 **应用管理**，在这里可以找到每个应用的**应用ID**



② 前往**广告位** ，在这里可以找到所有的广告位ID。



**(2) 将TaurusX参数配置到TopOn开发者后台**

登录TopOn后台 → 广告平台 → 广告源管理（TaurusX）→ 添加广告源。填写第一点中获取的App ID，App Secret和广告单元ID。



## Step5. 将TaurusX(Webeye)添加进应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
