---
title: "Meta(Facebook)"
source: "https://help.toponad.net/cn/docs/ZCERpc"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["三方广告平台配置指南", "Meta(Facebook)"]
content_sha256: "bc27b4ae4347a361f4789bffee8602203bc7beebfd7f8bdb5ff6565d04fb8967"
knowledge_role: "reference_only"
has_article_body: true
---

# Meta(Facebook)

## Step1. 创建Meta账号

注册[**Meta账号**](https://www.facebook.com/r.php?next=https%3A%2F%2Fwww.facebook.com%2F&locale=zh_CN&display=page)

**Tips：**

- Meta注册时建议不要选择中国，原因涉及到收款账号的填写。如果不慎选择了中国地区，建议更换邮箱重新注册或者联系Meta方修改。
- 收款信息必须填写**非大陆**的银行，如需要填写大陆银行信息，需要联系 Meta 对接人开白名单后才能使用大陆银行信息收款。

## Step2. 创建Meta商务管理平台

[**创建商务管理平台**](https://business.facebook.com/select/?next=https%3A%2F%2Fbusiness.facebook.com%2Fpub%2Fhome%3Fhelpref%3Dhelp)，按照步骤创建商务管理平台。



## Step3. 创建Meta资产

**(1)** 登录[Meta开发者后台](https://developers.facebook.com/)，**我的应用** > **创建应用**





**【用例】**步骤选择**【广告和变现】**>勾选**【利用 Meta Audience Network 在你的应用中投放广告】**。根据指引绑定业务资产



**(2) 添加Audience Network（创收管理工具）**



**(3) 按照指引，创建资源组**



创建完成后，会默认跳转到刚创建的资源组中（所有的创建的资源组，可以在左侧tab栏【集成】>【资源组】中查看）



**(4) 创建应用**

在**资源组**中创建应用

① 应用必须在AppStore或Google play上架才能使用Meta创收

② 每个应用最多只能创建于一个资源组，若应用曾经在其他资源组中创建过，则必须向Meta对接人申请解绑于原有资源组，该应用才能继续在新的资源组中创建



**(5) 创建广告专区和版位**

① 每个应用可对应多个广告专区，广告专区相当于用于存放各广告版位的文件夹。

② 每个广告专区可对应多个广告版位，广告版位即对应应用内各广告场景类型的广告位。



选择新建的广告专区，创建版位，按照指引完成创建



**注意：**Meta的奖励式视频广告（即激励视频）和激励插屏广告只适用于游戏类应用，若非游戏类应用需要使用则需要向Meta对接人申请开通。



**(6)****验证Meta SDK集成**

集成Meta SDK的应用未上线无法获取Meta的正式广告，需要配置测试设备进行验证。 测试设备编号：IDFA（IOS）/GAID（Android）



**(7) 完善收款账户信息**

在商务管理平台完善收款账户信息。



**(8) 开始创收**

应用上线后，当通知提示可以创收且广告版位状态为绿色提示“正在接收广告”，说明该应用正在使用Meta广告进行创收了。



## Step4. 开通Meta的Report API

**在Topon后台创建Meta广告平台**

登录**Topon后台 > 广告平台 > 变现平台 > 添加广告平台（Meta）**



## Step4(1). 开通自动创建广告源功能

完善相关信息后，点击**Login with Meta**登录Meta账号，进行Oauth认证授权。此时可开启自动创建广告源功能。



**注意：**通过Meta的API拉取Meta后台广告位数据时，若数据太少，API会出现不返回数据的情况。即**数据量太小的情况，无法通过API拉取Meta的展示和收益数据**到TopOn后台。详细请[通过Meta的API文档了解](https://developers.facebook.com/docs/audience-network/optimization/report-api/guide-v2)。

##

## Step5. Topon平台配置Meta广告位说明

Meta版位和Topon广告位的对应关系如下

| Meta版位类型 | Topon广告位类型 | 备注 |
| --- | --- | --- |
| Rewarded Video | 激励视频 | 广告位类型=激励视频 |
| Rewarded-Interstitial | 激励视频 | 广告位类型=插页式激励广告 |
| Interstitial | 插屏 | - |
| Native | 原生 | **广告位类型=原生广告(自渲染) 或 (模板渲染)** |
| Native Banner | 原生 | **广告位类型=原生横幅广告(自渲染) 或 (模板渲染)** |
| Banner | Banner | - |
| Native | 开屏 (广告源类型=原生广告 ) | Topon SDK v6.1.78及以上支持Meta的原生广告拼接开屏广告源。**使用此功能时请在开屏广告底部预留25%的区域显示应用Logo** |

(更多Topon支持聚合的广告平台，其广告类型与Topon后台配置的广告类型，对应关系速查可见此[汇总文档](https://help.toponad.net/cn/docs/SfGJi6))

## Step6. 在Topon开发者后台上绑定Meta

##

### 1.在meta后台获取相关参数信息

**(1) 应用编号**

① 登录[商务管理平台](https://business.facebook.com/pub/properties)

② 【集成】>【资源组】，选择对应应用



③ 点击应用右侧小标，复制应用编号



**(2) 版位编号**

选择对应广告专区，复制版位编号

****

****

### 2.在Topon配置meta的相关参数

**添加广告源**

① 填写Topon广告位对应的Meta版位的**应用编号**和**版位编号**



注：以上应用编号必须是从**Meta后台广告变现页面**（对应[链接](https://business.facebook.com/pub/properties?business_id)）获取的变现资产的应用编号，不是Meta后台开发者页面（[对应链接](https://developers.facebook.com/apps/)）的开发者资产的应用编号（如下图，容易配置错误）。

如何检查：TopOn后台创建广告源时，填写的【版位编号】的前半段跟TopOn后台填写的【应用编号】需要保持一致。如果不一致，大概率就是配置错误，使用了Meta后台开发者页面的开发者资产的应用编号。



## Step7. 将Meta adapter添加进应用代码

[参考Topon SDK集成说明文档](https://help.toponad.net/cn/docs/bPMOE6)

**【iOS14 重要说明】** 为了保证Meta广告变现效果，在集成Topon SDK同时，您还需要按Facebook集成文档要求完成[**启用广告追踪功能(Advertising Tracking Enabled)**](https://developers.facebook.com/docs/audience-network/guides/advertising-tracking-enabled/)和 [**SKAdNetwork**](https://developers.facebook.com/docs/SKAdNetwork)的设置

## Step8. Meta测试流程

注意：集成测试时不要多次使用Meta的正式ID测试，特别是不要使用测试设备点击Meta正式ID广告，否则可能会被误判为假量封号（建议参考Topon的测试指引或使用Meta官方测试ID测试）

**(1) 测试前提条件**

① 测试设备上已经下载Meta APP，且登录有效账户。（不能是被封的或者是被限制的账户） 原因是Meta只对登录自己APP的有效用户有广告填充。

② VPN到美国（因为美国地区填充高，容易测试到。优先使用美国地区VPN进行测试。）

**(2) 使用测试广告进行测试**

① 使用Topon调试模式。
为方便开发者对自己的广告集成情况进行测试和验证，Topon提供了调试模式（DebuggerConfig）。您可以在自己的项目中调用API，配置测试所需的信息，使用Topon预先为各个广告平台配置的测试广告源，进行各种广告行为，然后通过日志输出来定位广告集成中存在的问题。

- [**ios**](/docs/HUbBSf)
- [**安卓**](/docs/ZkqOxS)

② 使用自己应用的Meta版位ID，在Meta后台配置测试设备。

路径：[**Meta后台**](https://business.facebook.com/)--变现管理工具--资产--测试

添加测试设备参考：使用测试设备测试 Audience Network 集成 | Facebook Business 帮助中心

③ 使用Meta正式ID/或者Topon测试ID（均可），在代码中设置测试模式，进行测试。

调用ATSDK.setBiddingTestDevice("AndroidId");打开Bidding测试模式。（AndroidId在log打印中获取） 如果打开Bidding测试模式后竞价成功，并且广告填充成功则Meta广告集成正确

④ 如果无法显示广告，请根据日志的错误码排查问题ios安卓

⑤ 使用测试ID或者测试模式正常后，即集成正常。

**(3) 集成正常后，使用正式id测试（注意不要多次请求，建议尽量用测试id测试）**

如果是正式ID无法展示，排查步骤：

① 检查Topon后台的广告源配置 首先确认Meta的应用ID和代码位是否配置正确。 然后排查广告类型是否匹配正确。 如：开屏是否匹配开屏等。具体Topon跟Meta的**广告样式匹配参考链接**

② Meta后台

a. 补充Meta后台付款项付款资料： 收款账户是否填写完整，使用非中国大陆账户。

b. 检查资产状态：检查Meta后台的应用新建流程是否走完，如果没有走完，相应完善步骤。

**注意：**下方的应用详情，收款账户，验证的部分，都必须是绿色打钩状态。



c. 检查账户状态：检查首页，问题等选项卡，是否有待解决的问题，并且相应解决。



d. 判断Meta广告版位状态，如果是新创建的可能需要等待一段时间生效。参考[版位状态参考链接](https://www.facebook.com/business/help/190480988843577?id=211412110064838)并相应调整。



**建议措施：**版位广告位ID创建时间太长：新建Meta的ID，使用美国VPN，进行测试（手机清除缓存，时间调整到2小时后）；尝试更换设备测试。 广告位ID创建时间太短：等待2小时后测试。

③ 确认是否使用美国VPN测试。

④ 检查应用情况。注意安卓和iOS应用都需要正式上线，可能上线一段时间后Meta才能识别到。 如果是安卓应用，确认Google Play后台是public状态。

⑤ 添加测试设备以测试正式ID。可以在Meta后台添加测试设备，使用正式ID测试。 参考上面第二点，第3步。 使用自己应用的Meta版位ID，在Meta后台配置测试设备。

路径：[Meta后台](https://business.facebook.com/)--变现管理工具--资产--测试

添加测试设备参考：使用测试设备测试 Audience Network 集成 | Facebook Business 帮助中心

⑥ 按照测试的log里面的错误码解决问题，以下为Topon错误码链接

- [ios](https://help.takuad.com/docs/2HXlmO#1._Taku%E9%94%99%E8%AF%AF%E7%A0%81%E4%BF%A1%E6%81%AF%E8%AF%B4%E6%98%8E)
- [安卓](/docs/qYfOSS)

⑦ Meta问题Checklist链接（在以下链接后方补充property\_id，查看在对接过程中还缺少什么步骤）<https://developers.facebook.com/tools/property/checklist/?property_id=>



## 常见问题

### （1）Meta帮助中心在哪？

① 广告变现接入指引
提供了通过Meta进行应用内广告变现的指引 [**Audience Network 简介**](https://www.facebook.com/business/help/452287605232720?id=211412110064838)

② Meta付款问题帮助
通过此链接向Meta发起付款相关的工单[**创收者专用 Facebook支付帮助**](https://www.facebook.com/help/contact/478646722539653?core_payouts_redirect)

### （2）Meta Reporting API授权过期怎么办？

① 登录之前用于给Topon授权的Facebook账户

② 前往[**Facebook-设置与隐私-业务集成工具**](https://www.facebook.com/settings?tab=business_tools&ref=settings)移除对Topon的授权



③ 在Topon后台对Meta重新登录授权
路径为：**Topon后台-广告平台**-Meta-编辑-点击重新授权



### （3）如何提交工单给meta团队

①登录[meta后台](https://business.facebook.com/pub/properties)

②按照下图指引操作即可



### （4）TopOn 后台显示的 Meta 收益或展示数据与 Meta 平台后台数据存在偏差（Gap）怎么办？

①检查时区设置（必要前提），请确保 TopOn 后台与 Meta 后台的时区设置完全一致。

- Meta 后台时区查看路径： 通常跟Meta用户账号时区一致。 [[广告管理工具 - 报告 - 管理](https://adsmanager.facebook.com/adsmanager/reporting/view?act=147190556729167&ads_manager_write_regions=true&event_source=AUTO_REDIRECT)]





- TopOn 后台时区查看路径：[【账号管理】>【账号信息】>【基础信息】](https://portal.toponad.net/m/account/info/base)



②核对维度与汇总数据

若时区一致，请查看应用维度的 Meta 预估收益与 Meta 收益 API 数据是否一致。如果应用维度汇总数据一致，说明整体数据同步正常；否则建议下钻至“分天”维度，定位具体哪一天出现较大的收益 Gap。

③提交排查工单

如果确认了具体日期存在较大偏差，或每天的汇总数据均存在显著 Gap，请联系 TopOn AM 协助处理。请提供分天、分 Meta 广告位的详细数据明细（需包含导出数据、已注明对应时区）。

**注意：**若出现“单应用、单地区、单广告位”的日展示量 < 100，可能导致分地区或者分广告类型（即进行细拆维度）查看时数据无法对齐。

- 原因： 受 Meta 官方隐私政策限制，当数据量未达到阈值时，Meta 不会通过 API 返回对应收益数据，因此会导致 TopOn 后台无法获取精确数值。
- 政策参考： [Privacy Policy | Meta Open Source](https://opensource.fb.com/legal/privacy/)
