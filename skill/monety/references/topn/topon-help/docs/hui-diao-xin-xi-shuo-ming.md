---
title: "回调信息说明"
source: "https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-11-11"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "回调信息说明"]
content_sha256: "542bec32ef5e78bc2e04689dd977a59e883cbcb167e702314c57a8a0b6cf01d9"
knowledge_role: "reference_only"
has_article_body: true
---

# 回调信息说明

## 1. AdInfo

可通过设置回调监听来获取参数AdInfo，进而获取当前广告的信息

| 方法 | 说明 |
| --- | --- |
| int getNetworkFirmId() | 获取 广告平台对应的ID，用于区分广告平台，参考 [Network Firm Id](https://help.toponad.net/cn/docs/2KR6QU#TopOn_%E6%94%AF%E6%8C%81%E8%81%9A%E5%90%88%E4%BB%A5%E4%B8%8B%E5%B9%BF%E5%91%8A%E5%B9%B3%E5%8F%B0) |
| String getNetworkName() | 获取 广告平台名称(v6.3.10+支持) |
| String getNetworkPlacementId() | 获取 广告平台的广告位ID |
| String getAdsourceId() | 获取 广告源ID. 可在开发者后台或TopOn Open API 通过广告源ID查询具体的Network信息 |
| int getAdsourceIndex() | 获取 当前广告源在WaterFall中的排序 **（从0开始，0优先级最高）** |
| double getEcpm() | 获取TopOn预估eCPM。即每次广告展示的预估eCPM：常规广告源是TopOn后台对应广告源填写的排序价格，竞价广告源是实时竞价返回的价格。**eCPM的货币单位可通过currency获取，通常为元（CNY）或美元（USD），精度可通过precision获取。** eCPM含义：每千次广告展示收益。假设广告源A的eCPM=1美元，则展示一次广告源A之后，展示收益为0.001美元 |
| String getEcpmPrecision() | 获取eCPM精度 **"publisher\_defined"**：开发者在TopOn后台为广告源定义的eCPM **（交叉推广的eCPM也属于该类型)** **"estimated":** 在TopOn后台开启广告源的**自动价格**功能后，TopOn根据历史数据计算出的eCPM **"exact"**：实时竞价的eCPM (Meta广告平台除外) **"ecpm\_api"**： 针对Meta广告源生效，根据Meta的ReportAPI数据预估的历史eCPM API |
| String getCurrency() | 获取 TopOn收益货币单位。根据返回的货币单位，确定当前eCPM或收益的价格，通常为元（CNY）或美元（USD）。 例如："USD"，则返回的价格为“美元”，**getEcpm()**和**getPublisherRevenue**()两个方法返回的价格单位均为“美元”。 |
| int isHeaderBiddingAdsource() | 是否为头部竞价的广告源，**1：是，0：否** |
| String getShowId() | 获取 每次**展示广告**时生成的独立ID |
| double getPublisherRevenue() | 获取 TopOn广告位展示收益。即每次广告展示后，预估可获得的收益。单位可通过currency获取，通常为元（CNY）或美元（USD），精度可通过 precision 获取 |
| String getCountry() | 获取 国家代码， 例如：”CN" |
| String getPlacementId() | 获取 TopOn广告位ID |
| String getFormat() | 获取 广告类型，包括：**"Native"、"RewardedVideo"、"Banner""Interstitial"、"Splash"** |
| String getAdNetworkType() | 获取 Network类型 **"Network"**：第三方广告平台 **"Cross\_Promotion"**：交互推广 **"Adx"**：TopOn Adx |
| int getEcpmLevel() | 获取 广告源的eCPM层级(对应开发者后台**聚合管理**页面的**优先级**），**头部竞价广告源默认为0** |
| int getSegmentId() | 获取 流量分组ID |
| String getScenarioId() | 获取 广告场景ID |
| String getScenarioRewardName() | 获取 广告场景的激励名称，**仅Rewarded Video支持** |
| int getScenarioRewardNumber() | 获取 广告场景的激励数量，**仅Rewarded Video支持** |
| String getSubChannel() | 获取子渠道信息 |
| String getChannel() | 获取 渠道信息 |
| String getCustomRule() | 获取 **Placement+App维度**的自定义规则的**Json字符串** |
| String getABTestId() | 获取 AB测试ID。具体AB测试ID可以从AB测试页面查询 |
| Map getExtInfoMap() | 获取 广告的自定义信息，针对**Adx、OnlineAPI、直投广告、交叉推广**以及自定义广告平台，**Adx、OnlineAPI、直投广告、交叉推广**相关Key参考下文[2.NETWORK\_CUSTOM\_KEY](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming#3._NETWORK_CUSTOM_KEY) 获取 |
| Map getLocalExtra() | 获取加载广告前传入的本地参数 以插屏广告为例：返回的是`setLocalExtra(Map map)`方法的参数 |
| int getPlacementType() | 获取广告位类型 1：真实广告位 2：共享广告位 |
| String getSharedPlacementId() | 获取共享广告位id，**仅展示共享广告位缓存时返回** |
| double getBidFloor() | 返回TopOn后台配置竞价广告源竞价底价 |
| int getDismissType() | 获取关闭类型，仅激励视频、插屏广告、开屏广告支持 具体枚举值见ATAdConst.DISMISS\_TYPE |
| int getAdSourceAdType() | 获取当前广告源广告类型 (v6.2.90+支持) 0：Native 1：Rewarded 2：Banner 3：Interstitial 4：Splash 当激励视频广告位使用激励视频广告源时，返回1；当激励视频广告位使用插屏广告源时，返回3，使用开屏广告源时，返回4； |
| String getAdSourceCustomExt() | 获取在TopOn后台广告源配置的自定义参数（v6.2.90+支持） |
| String getShowCustomExt() | (v6.3.10+) 获取展示时传入的自定义参数，对应`setShowConfig()`传入的参数 |
| String getEncEcpmInfo() | (v6.3.65+) 获取加密后的ecpm信息 |
| int getSecretId() | (v6.3.65+)获取解密ecpm信息的私钥ID，可以通过在**TopOn后台-帐号管理-Key**找到相应的私钥去解密 |
| String toString() | 获取 所有回调信息的Json字符串，**所有key值如下**： "**id**"：对应getShowId() "**publisher\_revenue**"：对应getPublisherRevenue() "**currency**"：对应 getCurrency() "**country**"：对应 getCountry() "**adunit\_id**"：对应 getPlacementId() "**adunit\_format**"：对应 getAdFormat() "**precision**"：对应 getEcpmPrecision() "**network\_type**"：对应 getAdNetworkType() "**network\_placement\_id**"：对应 getNetworkPlacementId() "**ecpm\_level**"：对应 getEcpmLevel() "**segment\_id**"：对应 getSegmentId() "**scenario\_id**"：对应 getScenarioId() "**scenario\_reward\_name**"：对应 getScenarioRewardName() "**scenario\_reward\_number**"：对应 getScenarioRewardNumber() "**channel**"：对应 getChannel() "**sub\_channel**"：对应 getSubChannel() "**custom\_rule**"：对应 getCustomRule() "**network\_firm\_id**"：对应 getNetworkFirmId() "**adsource\_id**"：对应 getAdsourceId() "**adsource\_index**"：对应 getAdsourceIndex() "**adsource\_price**"：对应 getEcpm() "**adsource\_isheaderbidding**"：对应 isHeaderBiddingAdsource() "**abtest\_id**"：对应getABTestId() "**ext\_info**"：对应 getExtInfoMap() "**reward\_custom\_data**"：对应AdConst.KEY.USER\_CUSTOM\_DATA "**user\_load\_extra\_data**"：对应 getLocalExtra() "**placement\_type**"：对应 getPlacementType() "**shared\_placement\_id**"：对应 getSharedPlacementId() "**bid\_floor**"：对应 getBidFloor() "**dismiss\_type**"：对应 getDismissType() "**ad\_source\_type**": 对应getAdSourceAdType() "**ad\_source\_custom\_ext**": 对应getAdSourceCustomExt() |

---

## 2. NETWORK\_CUSTOM\_KEY

| NETWORK\_CUSTOM\_KEY | 说明 |
| --- | --- |
| OFFER\_ID | Adx、OnlineAPI、直投广告、交叉推广 Offer的广告 ID |
| CREATIVE\_ID | Adx、OnlineAPI、直投广告 Offer的素材 ID |
| IS\_DEEPLINK\_OFFER | 判断Adx、OnlineAPI、直投广告、交叉推广 Offer的单子类型是否为**Deeplink或JumpURL**的单子 0：否 1：是 |

---

## 3. AdMob展示收益

> **❗ 特别说明**
> **Admob 2025年7月17号政策的调整，影响TopOn SDK跑Admob Bidding广告单元，在广告展示时不能返回Admob SDK的展示收益** ，请使用 `adInfo#getPublisherRevenue()` 和 `adInfo#getEcpm()` 获取广告收益价值
