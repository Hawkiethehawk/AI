---
title: "监听信息回调说明"
source: "https://help.toponad.net/cn/docs/f2CoYu"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-01-02"
category_path: ["TopOn SDK接入指南", "Flutter接入指南", "监听信息回调说明"]
content_sha256: "a6b377650f9691f7a2161a565b2d32b3006afde5b3bef9700edc50849253bac9"
knowledge_role: "reference_only"
has_article_body: true
---

# 监听信息回调说明

## 1. 广告事件回调

广告监听事件的回调的callbackInfo内容说明：

| 变量 | 类型 | 说明 |
| --- | --- | --- |
| [network\_firm\_id](/cn/docs/2KR6QU#TopOn_%E6%94%AF%E6%8C%81%E8%81%9A%E5%90%88%E4%BB%A5%E4%B8%8B%E5%B9%BF%E5%91%8A%E5%B9%B3%E5%8F%B0) | int | 获取 广告平台对应的ID，用于区分广告平台 |
| adsource\_id | string | 获取 广告源ID. 可在开发者后台或TopOn Open API 通过广告源ID查询具体的Network信息 |
| adsource\_index | int | 获取 当前广告源在WaterFall中的排序\*\*（从0开始）\*\* |
| adsource\_price | double | 获取 ECPM，单位可通过getCurrency()获取 |
| adsource\_isheaderbidding | int | 是否为头部竞价的广告源，**1：是，2：否** |
| id | string | 获取 每次**展示广告**时生成的独立ID |
| publisher\_revenue | double | 获取 展示收益 |
| currency | string | 获取 货币单位，例如："USD" |
| country | string | 获取 国家代码， 例如：”CN" |
| adunit\_id | string | 获取 TopOn广告位ID |
| adunit\_format | string | 获取 广告类型，包括：**"Native"、"RewardedVideo"、"Banner""Interstitial"、"Splash"** |
| precision | string | 获取 ECPM精度 **"publisher\_defined"**：开发者在TopOn后台为广告源定义的eCPM\*\*（交互推广的eCPM也属于该类型)\*\* **"estimated":** TopOn的预估eCPM（auto eCPM) **"exact"**：Header Bidding实时竞价的eCPM(Meta广告平台除外) **"ecpm\_api"**： 针对Meta广告源生效，根据Meta的ReportAPI数据预估的历史eCPM API。 TopOn SDK v5.9.60及以上版本支持。 |
| network\_type | string | 获取 Network类型 **"Network"**：第三方广告平台 **"Cross\_Promotion"**：交互推广 **"Adx"**：TopOn Adx |
| network\_placement\_id | string | 获取 Network的广告位ID |
| ecpm\_level | int | 获取 广告源的eCPM层级，**头部竞价广告源默认为0** |
| segment\_id | int | 获取 流量分组ID |
| scenario\_id | string | 获取 广告场景ID |
| scenario\_reward\_name | string | 获取 广告场景的激励名称，**仅Rewarded Video支持** |
| scenario\_reward\_number | int | 获取 广告场景的激励数量，**仅Rewarded Video支持** |
| sub\_channel | string | 获取子渠道信息 |
| channel | string | 获取渠道信息 |
| custom\_rule | Dictionary | 获取 **Placement+App维度**的自定义规则的**Json字符串** |
