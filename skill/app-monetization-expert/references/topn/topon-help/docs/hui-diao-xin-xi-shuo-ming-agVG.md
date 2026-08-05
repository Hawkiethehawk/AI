---
title: "回调信息说明"
source: "https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming-agVG"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "集成基础说明", "回调信息说明"]
content_sha256: "8934b3fc9e29f1778c92f4e06ed9736d202c264dd99130797a222ee2d2bd5f62"
knowledge_role: "reference_only"
has_article_body: true
---

# 回调信息说明

## ATAdEventArgs参数说明

| 变量 | 类型 | 说明 |
| --- | --- | --- |
| placementId | String | 广告位id |
| callbackInfo | ATCallbackInfo | 广告事件的详细内容 **（详细请看ATCallbackInfo说明）** |
| isTimeout | bool | 广告加载是否超时（**只适用于开屏广告**） |

## ATAdErrorEventArgs参数说明

| 变量 | 类型 | 说明 |
| --- | --- | --- |
| placementId | String | 广告位id |
| callbackInfo | ATCallbackInfo | 广告事件的详细内容 **（详细请看ATCallbackInfo说明）** |
| errorCode | String | 错误码 |
| errorMessage | String | 错误内容 |

## ATCallbackInfo说明

| 变量 | 类型 | 说明 |
| --- | --- | --- |
| network\_firm\_id | int | 获取 广告平台对应的ID，用于区分广告平台 |
| adsource\_id | string | 获取 广告源ID. 可在开发者后台或TopOn Open API 通过广告源ID查询具体的Network信息 |
| adsource\_index | int | 获取 当前广告源在WaterFall中的排序 **（从0开始）** |
| adsource\_price | dounble | 获取 ECPM，单位可通过 **"currency"** 获取 |
| adsource\_isheaderbidding | int | 是否为头部竞价的广告源，**1：是，2：否** |
| id | string | 获取 每次**展示广告**时生成的独立ID |
| publisher\_revenue | double | 获取 展示收益 |
| currency | string | 获取 货币单位，例如："USD" |
| country | string | 获取 国家代码， 例如：”CN" |
| adunit\_id | string | 获取 TopOn广告位ID |
| adunit\_format | string | 获取 广告类型，包括：**"Native"、"RewardedVideo"、"Banner""Interstitial"、"Splash"** |
| precision | string | 获取 ECPM精度 **"publisher\_defined"**：开发者在TopOn后台为广告源定义的eCPM\*\*（交互推广的eCPM也属于该类型)\*\* **"estimated":** TopOn的预估eCPM（auto eCPM) **"exact"**：Header Bidding实时竞价的eCPM(Meta广告平台除外) **"ecpm\_api"**： 针对Meta广告平台生效，根据Meta的ReportAPI数据预估的历史eCPM API。TopOn SDK v5.9.60及以上版本支持。 |
| network\_type | string | 获取 Network类型 **"Network"**：第三方广告平台 **"Cross\_Promotion"**：交互推广 **"Adx"**：TopOn Adx |
| network\_placement\_id | string | 获取 Network的广告位ID |
| ecpm\_level | int | 获取 广告源的eCPM层级，**头部竞价广告源默认为0** |
| segment\_id | int | 获取 流量分组ID |
| scenario\_id | string | 获取 广告场景ID，**仅Rewarded Video&Interstitial支持(v5.7.20开始，支持Native&Banner)** |
| scenario\_reward\_name | string | 获取 广告场景的激励名称，**仅Rewarded Video支持** |
| scenario\_reward\_number | int | 获取 广告场景的激励数量，**仅Rewarded Video支持** |
| sub\_channel | string | 获取 子渠道信息 |
| channel | string | 获取 渠道信息 |
| custom\_rule | Dictionary | 获取 **Placement+App维度**的自定义规则的**Json字符串** |
