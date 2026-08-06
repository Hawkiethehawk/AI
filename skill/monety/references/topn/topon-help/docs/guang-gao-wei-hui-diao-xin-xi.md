---
title: "回调信息说明"
source: "https://help.toponad.net/cn/docs/guang-gao-wei-hui-diao-xin-xi"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-04-13"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "回调信息说明"]
content_sha256: "8071f944d80eedbb466f33b413b446f4e94146939e42c7b39f3ad83e0d99adab"
knowledge_role: "reference_only"
has_article_body: true
---

# 回调信息说明

> - 本章节对应的SDK版本为 >=6.3.61，如果您当前版本低于6.3.61，建议您更新SDK。
> - 另外，您也可以在回调方法中通过extra参数获取自定义信息，使用该功能请参考[extra参数](/cn/docs/extra-can-shu)章节。

## 1. 如何获取回调信息

获取回调信息有两种方式。

- **方式一**：实现广告事件协议方法，包括 `ATAdLoadingDelegate`、`ATBannerDelegate`、`ATInterstitialDelegate`、`ATNativeADDelegate`、`ATRewardedVideoDelegate` 和 `ATMediaVideoDelegate`。可以通过这些方法中的 `extra` 参数获取回调信息。
  例如：
- **方式二**：在展示广告前，使用ATAdManager的单例对象方法查询缓存，从返回的字典数组中获取信息。包括 `getInterstitialValidAdsForPlacementID`、`getRewardedVideoValidAdsForPlacementID`、`getSplashValidAdsForPlacementID`、`getBannerValidAdsForPlacementID` 和 `getNativeValidAdsForPlacementID` 等方法。**使用此方式获取信息，广告位必须加载成功且内存中存在有效的广告缓存**。
  例如：
  

回调信息打印示例：

json
复制代码

```
{
    "id": "84c3c5940e4fab2d8712299d631e09b3", // 每次广告展示生成的展示ID
    "publisher_revenue": "0.0015", // 每次展示产生的收益
    "adsource_id": 9805, // 广告源ID。可通过此ID在开发者后台或TopOn Open API查询网络信息
    "network_firm_id": 8, // 参考网络平台ID表
    "adsource_isHeaderBidding": 0, // 是否为Header Bidding广告源（1表示Header Bidding）
    "adsource_price": 1.5, // eCPM值（货币单位）
    "precision": "publisher_defined", // eCPM精度：publisher_defined - 开发者定义的ecpm；exact - HB实时竞价ecpm；estimated - SDK 估算ecpm
    "adsource_index": 0, // 广告源优先级（0表示最高优先级）
    "ecpm_level": 1, // 基于eCPM的排名等级
    "ad_source_type": 0, // 获取真实的广告源类型（SDK >= v6.4.92支持），常用于混合广告样式。值如下：0: Native，1: Rewarded，2: Banner，3: Interstitial，4: Splash。例如：当激励视频广告位使用插屏广告源时，返回3；当使用开屏广告源时，返回4。
    "segment_id": 0, // 流量分组ID
    "adunit_format": "Splash", // 广告格式类型
    "adunit_id": "b5e65ad3ab084b", // 广告单元ID（SDK 广告位ID）
    "country": "CN", // 国家代码
    "currency": "USD", // 货币单位
    "network_placement_id": 887305510, // 第三方平台的单元ID
    "network_type": "Network", // 网络类型：Network - 第三方广告；Cross_Promotion - 交叉推广
    "scenario_id": "f5e549727efc49", // 广告场景ID
    "scenario_reward_name": "rewardedSence", // 广告场景的激励名称
    "scenario_reward_number": 0, // 广告场景的激励数量
    "channel": "test_channel", // 渠道标识
    "sub_channel": "test_subchannel", // 子渠道标识
    "custom_rule": {
        "custom_data_key": "custom_data_val"
    }, // 自定义规则
    "ext_info": {
        "creative_id": "42-348448957", // Offer的创意素材ID
        "is_deeplink": 0, // 是否为Deeplink或JumpURL offer（1表示Deeplink/JumpURL）
        "offer_id": "GDTONLINE-348448957", // Offer的广告ID
        "currencyCode": "USD", // Admob展示收益货币单位 [注：此字段已修改，请参考文档末尾]
        "precision": 0, // Admob展示收益精度：0-未知，1-估算，2-发布商提供，3-精确 [注：已弃用]
        "value": 0.1, // Admob展示收益具体值 [注：已弃用]
        "en_p": "5GWtXa-X-sazi-xluLlqMyBCGWIIAZQ_8p7bM2-LqeQ" // 百度价格加密字段（需要TakuSDK>6.3.63且百度SDK≥5.37）
    }, // Adx & OnlineAPI Offer & Admob的附加信息
    "placement_type": 1, // 广告位类型：1 - 真实广告位，2 - 共享广告位
    "shared_placement_id": "p1en19jjiirsf3", // 共享广告位ID
    "user_load_extra_data": {
        "user_custom_data": "media_val"
    } // Load前传入的自定义参数信息
}
```

## 2. 字段信息

> 关于 `network_firm_id` 字段对应的广告平台列表，请[点击这里](/cn/docs/2KR6QU)。

| 字段名称 | 类型 | Extra参数对应的Key | 说明 |
| --- | --- | --- | --- |
| network\_firm\_id | int | **kATADDelegateExtraNetworkFirmIdKey** | 获取广告平台对应的ID，用于区分广告平台。参考[广告网络ID表](/cn/docs/2KR6QU) |
| adsource\_id | String | **kATADDelegateExtraAdSourceIdKey** | 获取广告源ID。可通过广告源ID在开发者后台或Open API查询具体的网络信息 |
| adsource\_index | int | **kATADDelegateExtraPriorityKey** | 获取当前广告源在当前执行的Waterfall中的排名 **（从0开始，优化等级最高）** |
| adsource\_price | double | **kATADDelegateExtraAdSourcePriceKey** | 获取预估eCPM（常规广告源为手动填写的eCPM价格，竞价广告源为实时竞价价格）。eCPM的货币单位可通过 **currency** 获取（对应美元或人民币等），精度可通过 **precision** 获取。 |
| adsource\_isheaderbidding | int | **kATADDelegateExtraIsHeaderBiddingKey** | 是否为header bidding广告源。**1：是，2：否** |
| id | String | **kATADDelegateExtraIDKey** | 获取每次 **广告展示** 生成的唯一ID |
| publisher\_revenue | double | **kATADDelegateExtraPublisherRevenueKey** | 获取本次展示带来的收益。单位可通过 **currency** 获取，精度可通过 **precision** 获取 |
| currency | String | **kATADDelegateExtraCurrencyKey** | 获取货币单位，例如："USD" |
| country | String | **kATADDelegateExtraCountryKey** | 获取国家代码，例如："CN" |
| adunit\_id | String | **kATADDelegateExtraAdunitIDKey** | 获取SDK广告位ID |
| adunit\_format | String | **kATADDelegateExtraFormatKey** | 获取广告类型，包括：**"Native"、"RewardedVideo"、"Banner"、"Interstitial"、"Splash"** |
| precision | String | **kATADDelegateExtraPrecisionKey** | 获取eCPM精度 **"publisher\_defined"**：开发者在后台为广告源定义的eCPM **（交叉推广eCPM也属于此类型）** **"estimated"：** 在后台启用广告源的自动价格功能后，SDK基于历史数据计算的eCPM **"exact"**：实时竞价的eCPM（Meta广告平台除外） **"ecpm\_api"**：对Meta广告平台有效，基于Meta的ReportAPI数据估算的历史eCPM API。SDK v5.9.60及以上版本支持。 |
| network\_type | String | **kATADDelegateExtraNetworkTypeKey** | 获取网络类型 **"Network"**：第三方广告平台 **"Cross\_Promotion"**：交叉推广 **"Adx"**：暂不支持 |
| network\_placement\_id | String | **kATADDelegateExtraNetworkPlacementIDKey** | 获取网络广告位ID |
| ecpm\_level | int | **kATADDelegateExtraECPMLevelKey** | 获取广告源的eCPM等级（对应开发者后台 **聚合管理** 页面的 **优先级**）。**header bidding广告源的默认值为0** |
| segment\_id | int | **kATADDelegateExtraSegmentIDKey** | 获取流量分组ID |
| scenario\_id | String | **kATADDelegateExtraScenarioIDKey** | 获取广告场景ID。**仅激励视频和插屏广告支持** |
| scenario\_reward\_name | String | **kATADDelegateExtraScenarioRewardNameKey** | 获取广告场景的奖励名称。**仅激励视频支持** |
| scenario\_reward\_number | int | **kATADDelegateExtraScenarioRewardNumberKey** | 获取广告场景的奖励数量。**仅激励视频支持** |
| channel | String | **kATADDelegateExtraChannelKey** | 获取渠道信息 |
| sub\_channel | String | **kATADDelegateExtraSubChannelKey** | 获取子渠道信息 |
| custom\_rule | String | **kATADDelegateExtraCustomRuleKey** | 获取 **广告位+App维度** 的自定义规则的 **Json字符串** |
| abtest\_id | String | **kATADDelegateExtraABTestIDKey** | 获取AB测试ID（v6.1.30新增）。具体的AB测试ID可在AB测试页面找到。 |
| ext\_info | String | **kATADDelegateExtraExtInfoKey** | 获取Adx、OnlineAPI Offer、直投广告、交叉推广和admob的附加信息，并以Json字符串输出 |
| placement\_type | String | **kATADDelegateExtraPlacementTypeKey** | 获取广告位类型 **1**：真实广告位 **2**：共享广告位 |
| shared\_placement\_id | String | **kATADDelegateExtraSharedPlacementIdKey** | 获取共享广告位ID。**仅在展示共享广告位缓存时返回。** |
| user\_load\_extra\_data | Dictionary | **kATADDelegateExtraUserCustomData** | 获取Load前传入的自定义参数信息 **并** 以字典格式输出 |
| ad\_source\_type | int | **kATADDelegateExtraADSourceTypeKey** | 获取真实的广告源类型（**SDK >= v6.4.92支持**），常用于混合广告样式。值如下：0: Native，1: Rewarded，2: Banner，3: Interstitial，4: Splash。例如：当激励视频广告位使用插屏广告源时，返回3；当使用开屏广告源时，返回4。 |
| req\_id | String | **kATADDelegateExtraRequestIDKey** | 聚合SDK当次请求ID |

## 3. Admob展示收益

> **❗特别说明**
> Admob 2025年7月17号政策的调整，影响SDK跑Admob Bidding广告单元，在广告展示时不能返回Admob SDK的展示收益，请使用回调信息字典中的publisher\_revenue取广告收益价值
