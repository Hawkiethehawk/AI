---
title: "Unity Ads"
source: "https://help.toponad.net/cn/docs/7FhNeO"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "Unity Ads"]
content_sha256: "8765727e95d311e41288bb2fb99915a9b967e4773ef988d627e104452491951e"
knowledge_role: "reference_only"
has_article_body: true
---

# Unity Ads

**TopOn已支持Unity 广告平台，您可以按以下TopOn版本更新使用**

|  |  |  |  |
| --- | --- | --- | --- |
| **平台** | **竞价类型** | **广告样式** | **TopOn SDK 版本** |
| Android、iOS | S2S、WF | 激励视频、插屏、Banner | **Topon Android v6.5.71&iOS v6.5.43及以上版本支持unity ads bidding** |

## Step1. 创建UnityAds账号

① [**注册并登录**](https://cloud.unity.com/home/login)UnityAds账号



## Step2. 创建UnityAds应用和广告单元

**(1) 添加应用**
注：中国大陆安卓流量不要使用UnityAds进行广告创收

① 点击左侧工具栏的**项目**进入页面，并点击添加新项目，填写项目名称提交即可



② 点击左侧工具栏的Unity Ads Monetization模块，选择对应项目，点击 启用广告，选择“我将使用聚合”，并选择 聚合平台=其他（如有“Topon”选项，请选择它），完成各个步骤的选项后添加项目，如下图示。







成功创建项目并且获取集成的ID



**(2) 添加广告单元**

添加应用后，系统会自动在安卓和iOS平台下各创建一个激励视频、插页式视频、横幅广告

**方法1**：若自动创建的广告单元配置**不符合**您的需求，可使用方法1添加新的广告单元。注意，每个应用仅可添加10个广告单元。

**方法2**：若自动创建的广告单元配置**符合**您的需求，可通过方法2，在对应样式的广告单元下直接添加广告位



添加广告位的时候可以填写目标价，或选择不设置目标价的广告位。



## Step3. 开通UnityAds的Report API

(1) 开通UnityAds的Report API需要获取Organization core ID和API key两个参数。 如果是第一次获取 API Key，需要先 Create API Key。如果已经生成了 API Key，则无需重复生成。 第一次生成API Key时，请等候一段时间之后，再在Topon后台添加，否则Unity后台暂未生效可能会检测不到。

① 在如下位置获取Organization core ID



② 在如下位置获取API key



**(2) 在Topon开发者后台开通UnityAds的Report API**

填写Organization core ID和API key 登录Topon后台→广告平台→变现平台→添加广告平台（UnityAds）→编辑（开通报表API）



## Step3(2). 开通自动创建广告源功能

**若需要使用自动创建广告源功能**，需要额外获取Key ID、Secret Key。



(1) 创建新服务账户





(2) 点击添加密钥，生成后可获取Key ID、Secret Key（密钥）。**请保存密钥，后续无法再查看**。





(3) 添加key成功后，需要设置组织角色。点击管理组织角色，选择【Monetization】，全选下列所有内容后点击保存。**需要添加权限之后API才可使用，否则绑定广告平台配置时会报错**。



## Step4. Topon平台配置Unity Ads广告单元说明

Unity Ads的广告单元跟Topon的广告类型对应关系如下：

| Unity Ads-广告类型 | Topon-广告类型 |
| --- | --- |
| Rewarded | 激励视频 |
| Interstitial | 插屏 |
| Banner | Banner |

(更多Topon支持聚合的广告平台，其广告类型与Topon后台配置的广告类型，对应关系速查可见此[汇总文档](https://help.takuad.com/docs/SfGJi6))

## Step5. 在Topon开发者后台上绑定UnityAds

(1) 以下UnityAds的2个参数需要配置在Topon开发者后台才能通过Topon展示UnityAds广告以及通过Topon开发者后台展示UnityAds的数据：

① 在如下位置获取Game ID



② 在如下位置获取Placement ID，广告位名称即PlacementID。



**(2) 将UnityAds的参数配置在Topon开发者后台**

**添加广告源**

① 登录Topon后台→聚合管理→添加广告源(UnityAds)

② 填写Topon应用对应的UnityAds应用的Game ID/Placement ID



## Step6. 将UnityAds adapter添加进应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
