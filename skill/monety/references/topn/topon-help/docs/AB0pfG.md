---
title: "自定义流量分组"
source: "https://help.toponad.net/cn/docs/AB0pfG"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "高级功能", "自定义流量分组"]
content_sha256: "5f02c397b24a23e64505c9cd9a8cc0f6862ed7c9cca3e11d502d12ac81541129"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义流量分组

> **💡Tips:**
>
> 1. 建议在TopOn SDK初始化之前调用相应的方法，传入自定义规则参数
> 2. 关于流量分组的更多说明请查阅《[流量分组](/cn/docs/KjVUSq)》

1. App全局的自定义规则设置

---

> **Note:** 此自定义规则为**全局**设置，对全部广告位有效

| 平台 | 方法 |
| --- | --- |
| Android | initCustomMap |
| iOS | customData |
| Unity | initCustomMap |

**● 自定义规则的预定义Key**

TopOn SDK在App全局的自定义规则中，预定义了以下key值：

| Key | 说明 |
| --- | --- |
| user\_id | 用户ID。由开发者定义并传入TopOn SDK，后续TopOn支持基于用户ID维度统计数据 |
| channel | 渠道。建议使用以下字符规则：大小写字母数字和下划线A-Za-z0-9\\_ |
| sub\_channel | 子渠道。建议使用以下字符规则：大小写字母数字和下划线A-Za-z0-9\\_ |
| user\_number | 用户编号。开发者可以用数字对用户进行编号，如每个用户对应一个全局不唯一的数字 仅Android SDK v6.1.32及以上支持 |
| age | 年龄 |
| gender | 性别, 如male、female、unknow |
| iap\_amount | 应用内付费金额 |
| iap\_currency | 应用内付费币种，如美元 “USD” |
| iap\_time | 应用内付费次数 |

> **Note:** 如果上述的预定义key无法满足需求，您可以自行添加key，但需要注意的是：在添加自定义流量分组的时候将key对应。

2. Placement的自定义规则设置

---

> ****Note:**** 此自定义规则仅对 **当前** Placement有效，您可以在App自定义规则基础上增加Placement特有的自定义规则

| 平台 | 方法 |
| --- | --- |
| Android | initPlacementCustomMap |
| iOS | setCustomData:forPlacementID |
| Unity | setCustomDataForPlacementID |

3. 示例代码

---

> **Note:** 以下代码示例为**年龄=18，** **男性，通过头条推广带来的用户**

**● Android**

复制代码

```
Map<String, String> customMap = new HashMap<>();
customMap.put("age","18");
customMap.put("gender","male");
customMap.put("channel","bytedance");
ATSDK.initCustomMap(customMap); //  对全部Placement有效
ATSDK.initPlacementCustomMap(placementId, customMap); // 仅对当前Placement有效
```

**● iOS**

复制代码

```
// 对全部Placement有效
[ATAPI sharedInstance].customData = @{kATCustomDataUserIDKey:@"test_custom_user_id",
    kATCustomDataChannelKey:@"custom_data_channel",
    kATCustomDataSubchannelKey:@"custom_data_subchannel",
    kATCustomDataAgeKey:@18,
    kATCustomDataGenderKey:@"male",
    kATCustomDataNumberOfIAPKey:@19,
    kATCustomDataIAPAmountKey:@20.0f,
    kATCustomDataIAPCurrencyKey:@"usd",
};

// 仅对当前Placement有效
[[ATAPI sharedInstance] setCustomData:@{
    kATCustomDataChannelKey:@"placement_custom_data_channel",
    kATCustomDataSubchannelKey:@"placement_custom_data_subchannel"
} forPlacementID:@"your placementID"];
```

**● Unity**

复制代码

```
//设置自定义的Map信息，可匹配后台配置的广告商顺序的列表（App维度）（可选配置）
ATSDKAPI.initCustomMap(new Dictionary<string, string> { { "unity3d_data", "test_data" } });

//设置自定义的Map信息，可匹配后台配置的广告商顺序的列表（Placement维度）（可选配置）
ATSDKAPI.setCustomDataForPlacementID(new Dictionary<string, string> { { "unity3d_data_pl", "test_data_pl" } } ,placementId);
```

**● Cocos**

复制代码

```
// 对全局生效
const customMap = {
    "appCustomKey1": "appCustomValue1",
    "appCustomKey2": "appCustomValue2"
};
ATSDK.initCustomMap(customMap);

// 仅对当前广告位生效
const currentPlacementId = "your placement id";
const placementCustomMap = {
    "placementCustomKey1": "placementCustomValue1",
    "placementCustomKey2": "placementCustomValue2"
};
ATSDK.setPlacementCustomMap(currentPlacementId, placementCustomMap);
```
