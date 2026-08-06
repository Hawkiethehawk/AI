---
title: "ironSource"
source: "https://help.toponad.net/cn/docs/wTA6QW"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "ironSource"]
content_sha256: "2c1f0c50cf2e477126b3f6b4009f495868a4a40d5133de07f9ee4c0aa1a99568"
knowledge_role: "reference_only"
has_article_body: true
---

# ironSource

| 系统平台 | 竞价类型 | 广告类型 |
| --- | --- | --- |
| Android、IOS | 服务端竞价（iOS 6.4.88、Android 6.5.06） | 激励视频、插屏、横幅 |

##

## Step1. 创建ironSource账号

登录[**ironSource官网**](https://platform.ironsrc.com/partners/signup)申请开通账号

## Step2. 创建ironSource的应用和广告位

(1) 在 **ironSource > Ads >Apps > Add App** 中创建应用



(2) 在 **SETUP  > Instances，创建Instance ID**

【注意这里是ironSouce的选项卡】。这里不要选错，否则会无法创建instance。





## Step3. 开通ironSource的Report API

(1) ironSource会提供用于通过Report API拉取收益数据的配置信息，具体如下

① Secret Key

② Refresh Token

**(2) 在ironSource后台获取Secure Key**

导航到 [**My Account**](https://platform.ironsrc.com/partners/account/apiDetails) ，切换到**API**的Tab页面，查看Secret Key、Refresh Token



**(3) 在Topon开发者后台开通ironSource的Report API**

登录Topon后台→广告平台→变现平台→添加广告平台（ironSource）→编辑（开通报表API）→填写Secret Key、Refresh Token



## Step4. Topon平台配置ironSource广告单元说明

ironSource的广告单元跟Topon的广告类型对应关系如下：

| ironSource-广告单元 | Topon-广告类型 |
| --- | --- |
| Interstitial | 插屏广告(视频)Interstitial(Video) |
| Rewarded Video | 激励视频广告 Rewarded Video |
| Banner | 横幅广告（Banner) |

## Step5. 在Topon开发者后台上绑定ironSource

(1) 以下ironSource的2个参数需要配置在Topon开发者后台, 这样才能通过Topon SDK展示ironSource广告, 以及通过Topon开发者后台展示ironSource的数据：

| 参数名称 | 说明 |
| --- | --- |
| APP KEY | ironSource每个应用对应的唯一的应用KEY |
| Instance Id | ironSource每个广告单元对应的唯一的广告单元ID |

① 在 **Ads--> Setup --> Instances**中查看**APP KEY**和**Instance Id**



② 如果您的应用未上线，您需要ironSource平台的**Ads--> SETUP --> Test devices**添加测试设备进行测试



**(2) 将ironSource的参数配置在Topon开发者后台**

① 添加广告源，登录Topon后台→广告平台→变现平台→广告源管理（ironSource）→添加广告源

② 填写Topon应用对应的ironSource的**应用KEY（APP KEY）**、**广告单元ID（Instance Id）**

③ 设置广告源的eCPM价格（可针对不同的流量分组进行独立设置）

**广告源将依据eCPM价格进行排序，请填写广告平台设置的真实eCPM价格**



## Step6. 将ironSource adapter添加进应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
