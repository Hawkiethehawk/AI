---
title: "Mintegral"
source: "https://help.toponad.net/cn/docs/YBoLGn"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-26"
category_path: ["三方广告平台配置指南", "Mintegral"]
content_sha256: "2c22643cd0c16409bd81e706741149ec50a2f58d6df0ed6f4cf6b5c7dbbd9170"
knowledge_role: "reference_only"
has_article_body: true
---

# Mintegral

## Step1. 创建Mintegral账号

登录[Mintegral官网](https://dev.mintegral.com/user/login)申请开通账号，注册后需要联系平台AM激活账号。

## Step2. 创建Mintegral的应用和广告位

(1) 在 **应用设置--> 添加应用** 中创建应用



(2) 在 **版位&广告单元-->应用列表--> 新建广告版位** 中创建广告版本



创建广告单元可以选择**竞价模式**：

| 竞价模式 | 说明 |
| --- | --- |
| 传统方式 | 创建一个**常规**的广告单元，可以设置该广告单元的eCPM Floor |
| 应用内竞价 | 创建一个**头部竞价**的广告单元，该广告单元可以使用Mintegral的头部竞价功能 |



## Step3. 开通Mintegral的Report API

**(1) 开通报表API&自动创建广告源**

Mintegral会提供用于通过ReportAPI拉取收益数据的配置信息，具体如下：

| 参数名称 | 说明 |
| --- | --- |
| App key | 即发布商密钥，每个Mintegral账号对应一个发布商App 密钥 |
| Skey | 即发布商密钥，每个Mintegral账号对应一个发布商密钥 |
| Secret(密钥) | 即密钥口令，每个发布商对应一个密钥口令 |

① 在**应用设置**中查看**APP Key**



② 在**账户管理--接口工具**中查看**Skey**和**Secret(密钥)**



**(2) 在Topon开发者后台开通Mintegral的Report API**

登录Topon后台→广告平台→变现平台→添加广告平台（Mintegral）→编辑（开通报表API&自动创建广告源）→填写**App Key、Skey、密钥**



## Step3(1). 开通自动创建广告源功能

配置好上述参数后，如果希望使用自动创建广告源功能，实现自动在广告后台同步创建广告位，可在对应按钮处开启。



## Step4. Topon平台配置Mintegral广告位说明

**(1) Mintegral广告位介绍**

Mintegral广告位跟Topon的广告类型对应关系如下：

| Mintegral- 广告位 | Topon-广告类型 | 备注 |
| --- | --- | --- |
| 原生广告 (自定义渲染) | 原生广告(广告位类型=自定义渲染) | 本广告类型支持头部竞价(header bidding)功能，如需要使用头部竞价功能，请联系Mintegral开通 |
| 原生广告(自动渲染) | 原生广告(广告位类型=自动渲染) | Topon SDK V5.5.9及以上支持 |
| 横幅广告 | Banner广告 | 本广告类型支持头部竞价(header bidding)功能，如需要使用头部竞价功能，请联系Mintegral开通 |
| 新插屏广告 | 插屏视频(新插屏广告) | Topon SDK V5.7.98及以上支持Mintegral新插屏广告，V5.7.98以下版本需要在Mintegral后台选中【广告位大小：全屏】且【素材类型：视频】。本广告类型支持头部竞价(header bidding)功能，如需要使用头部竞价功能，请联系Mintegral开通 |
| 激励视频 | 激励视频广告 | 本广告类型支持头部竞价(header bidding)功能，如需要使用头部竞价功能，请联系Mintegral开通 |
| 开屏广告 | 开屏 | 无 |

(更多Topon支持聚合的广告平台，其广告类型与Topon后台配置的广告类型，对应关系速查可见此[汇总文档](https://help.toponad.net/cn/docs/SfGJi6))

## Step5. 在Topon开发者后台上绑定Mintegral

以下Mintegral的4个参数需要配置在Topon开发者后台，这样才能通过Topon SDK展示Mintegral广告,以及通过Topon开发者后台展示Mintegral的数据：

| 参数名称 | 说明 |
| --- | --- |
| APP ID(应用ID) | Mintegral每个应用对应的唯一的应用ID |
| Placement ID(广告版位ID) | Mintegral广告版位下可以创建多个广告单元**（Topon后台暂不需要填写Placement ID）** |
| AD Unit ID (广告单元ID) | Mintegral每个广告单元对应的唯一的**广告单元ID** |

● 在**应用设置**中查看**应用 ID** , **APP Key**



● 在**版位&广告单元**中查看**广告单元ID**



### 1. 手动创建Mintegral广告源

**(1) 将Mintegral的参数配置在Topon开发者后台**

① 添加广告源，登录Topon后台→广告平台→变现平台→选择Mintegral平台广告源管理→添加广告源

② 填写Topon应用对应的Mintegral的**广告版位ID(可选项)，****广告单元 ID(必填项)**

③ 设置广告源的eCPM价格（可针对不同的流量分组进行独立设置）

**广告源将依据eCPM价格进行排序，请填写广告平台设置的真实eCPM价格。请跟Mintegral商务沟通设置广告源的eCPM价格**



**(2) 头部竞价**支持以下2种选项：

**Mintegral的一个Unit ID只能创建一个常规广告源或Header bidding广告源**

| 头部竞价 | 描述 |
| --- | --- |
| 关 | 只创建一个**常规广告源** |
| 开 | 只创建一个**头部竞价广告源**. 请跟Mintergal商务沟通您的广告位是否已开通头部竞价功能 |

### 2. 自动创建Mintegral广告源

① 如果您已经开通Mintegral的自动创建广告源功能，您在创建Mintegral广告源时可以选择**自动创建广告源=是**



② 开启Mintegral的**自动创建广告源**功能，当您在Topon后台创建Mintegral广告源时，Topon会自动在Mintegral后台创建广告版位和广告单元。

③ Topon支持自动创建常规广告源和头部竞价广告源。

- 当自动创建Mintegral的常规广告源时，**排序价格**会自动同步到Mintegral后台的广告单元ID的eCPM底价上（eCPM底价设置的地区为全球）
- 当在**广告平台**的**广告源管理**自动创建Mintegral的常规广告源时，**默认分组**的**排序价格**会自动同步到Mintegral后台的广告单元ID的eCPM底价上（eCPM底价设置的地区为全球）



## Step6. 将Mintegral adapter添加进应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
