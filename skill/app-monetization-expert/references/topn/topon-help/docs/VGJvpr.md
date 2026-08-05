---
title: "Liftoff(Vungle)"
source: "https://help.toponad.net/cn/docs/VGJvpr"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "Liftoff(Vungle)"]
content_sha256: "43bd6c878f8ea0cd19297375cd65223db166d84cc33ef652b8ca11823799227c"
knowledge_role: "reference_only"
has_article_body: true
---

# Liftoff(Vungle)

目前TopOn支持LiftOff(Vungle)的广告类型如下：

| Vungle 广告类型 | 头部竞价 | TopOn SDK版本 |
| --- | --- | --- |
| 激励视频 | 支持 | TopOn SDK v5.7.40及以上版本 |
| 插屏 | 支持 | TopOn SDK v5.7.40及以上版本 |
| Banner/MREC | 支持 | TopOn SDK v5.9.50及以上版本 |
| 原生 | 支持 | TopOn SDK v6.2.95 及以上版本 |
| 开屏 | 支持 | TopOn SDK v6.1.60及以上版本 |
| In-line ad | 支持 | TopOn SDK v6.4.80及以上版本(iOS暂未支持，配置在Topon Banner广告位下） |

##

## Step1. 创建Vungle账号

[**注册并登录**](https://publisher.vungle.com/login)Vungle账号

## Step2. 创建Vungle的应用和广告位

(1) 添加应用 若应用未上架AppStore或Google play，则先选择“我的应用程序尚未生效”，获取测试广告进行测试，待应用上架后再修改应用状态。



(2) 添加广告位置 根据应用广告场景需要创建对应的广告位置类型。



**注意：**若需要给每个广告位置设置底价，请向Vungle的对接人申请设置。

## Step3. 开通Vungle的Report API

(1) 开通Vungle的Report API需要获取API Key、Account ID参数。

| 参数名称 | 说明 |
| --- | --- |
| Reporting API Key | Vungle的Reporting API key |
| Account ID | Vungle的Account ID, 使用Vungle的头部竞价功能时需要填写 |
| Secret Token | 若需要开启自动创建功能，需要配置此Token |

① API Key： 报告→Reporting API key

② Account ID： 我的账号→Account ID

③ vungle：我的账户→概览→Secret Token

**(2) 在Topon开发者后台开通Vungle的Report API**

① 在Vungle后台获取Reporting API key。



②登录Taku后台→广告平台→添加广告平台（Vungle）→编辑（开通报表API）→填写对应参数



##

## Step3(1). 开通自动创建广告源功能

若需要开通自动创建功能，需要在Vungle后台找到**Secret Token**，具体路径如下：



并在topon后台填写相关参数。



## Step4. 在Topon开发者后台上绑定Vungle

(1) 以下Vungle的2个参数需要配置在Topon开发者后台才能通过Topon展示Vungle广告以及通过Topon开发者后台展示Vungle的数据：

| 参数名称 | 说明 |
| --- | --- |
| 应用 ID | Vungle每个应用对应的唯一的App ID |
| 广告位置参考 ID | Vungle每个广告位对应的唯一的广告位置参考 ID |

① App ID ：应用程序→选择应用→App ID



② 广告位置参考 ID ：选择应用→广告位置→广告位置参考 ID



**(2) 将Vungle的参数配置在Topon开发者后台**

添加广告源 登录Topon后台→广告平台→广告源管理（Vungle）→添加广告源

① 填写Topon应用对应的Vungle应用的**APP ID**

② 填写Topon广告位对应的Vungle广告位的**广告位置参考 ID**（Placement ID）



**(3) Banner&MREC&In-line 广告配置说明**

① 在Vungle后台创建对应样式广告位，并获取对应广告位置参考 ID



② 添加广告源：登录Topon后台→聚合管理→选择横幅广告位→添加广告源→ 选择Vungle，选择对应广告样式和尺寸类型



## Step4. Topon平台配置Vungle广告单元说明

Vungle的广告单元跟Topon的广告类型对应关系如下：

| Vungle-广告类型 | Topon-广告类型 |
| --- | --- |
| 插屏广告 | 插屏 |
| 奖励广告 | 激励视频 |
| Banner | Banner（广告位类型=横幅广告） |
| MREC | Banner（广告位类型=中矩形横幅广告） |
| Native | 原生 |
| App Open | 开屏 |
| In-Line | Banner(广告位类型=中矩形横幅广告） |

(更多Topon支持聚合的广告平台，其广告类型与Topon后台配置的广告类型，对应关系速查可见此[汇总文档](https://help.toponad.net/cn/docs/bPMOE6))

## Step5. 将Vungle adapter添加进应用代码

[参考TopOn SDK集成说明文档](https://help.toponad.net/cn/docs/bPMOE6)

## Step6. Vungle的头部竞价说明

### 1. 功能概况

TopOn 目前支持Vungle平台的头部竞价功能，后台创建广告位时开启“In-App Bidding”
注：如在Vungle后台无“In-App Bidding”的创建入口，请联系Vungle AM开通权限

### 2. 广告平台配置

Vungle的头部竞价需要填写**Account ID**，您需要在TopOn的Vungle广告平台完善**Account ID**



### 3. 广告源配置

在TopOn后台配置Vungle的广告源时，您需要打开**头部竞价**功能。


