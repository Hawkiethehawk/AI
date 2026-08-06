---
title: "流量分组与策略配置"
source: "https://help.toponad.net/cn/docs/m1sEjR3y"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "高级功能", "流量分组与策略配置"]
content_sha256: "9c1864dfe64170011a52e8f4441109788f0bad75f88886ec4658f52c589e3bb2"
knowledge_role: "reference_only"
has_article_body: true
---

# 流量分组与策略配置

> **💡Tips**
>
> - 流量分组相关的全局配置（渠道、自定义参数）建议在 `ATSDK.init()` **之前**调用。
> - 广告源过滤、瀑布过滤等策略可在运行时按广告位动态设置。

---

## 1. 渠道与子渠道

tsx
复制代码

```
import { ATSDK } from '@anythink/react-native-sdk';

ATSDK.setChannel('your_channel');     // 渠道名
ATSDK.setChannelSource(1);            // 渠道来源
```

---

## 2. 自定义参数（流量分组）

用于按用户属性 / 业务维度做流量分组：

tsx
复制代码

```
// 全局自定义参数
ATSDK.initCustomMap({ user_group: 'vip', level: 12 });

// 指定广告位的自定义参数
ATSDK.initPlacementCustomMap('your placement id', { scene: 'home_feed' });
```

---

## 3. 广告位级 LocalExtra / TKExtra

各广告实例支持设置本地附加参数与统计透传参数：

tsx
复制代码

```
// 本地附加参数（透传给广告源）
ad.setLocalExtra({ key: 'value' });

// 统计透传参数（用于数据分析）
ad.setTKExtra({ tk_key: 'tk_value' });
```

> 横幅通过 `bannerView.setLocalExtra` / `setTKExtra`，原生通过 `native.setLocalExtra` / `setTKExtra`，用法一致。

---

## 4. 广告场景上报

进入某个广告展示场景时上报，便于场景化数据统计（各广告类均有同名静态方法）：

tsx
复制代码

```
ATRewardVideoAd.entryAdScenario('your placement id', 'your_scenario_id');
```

---

## 5. 广告源 / 广告网络过滤

按广告位过滤指定广告源或广告网络：

tsx
复制代码

```
// 过滤指定广告源 ID（adSourceId）
ATSDK.setFilterAdSourceIdList('your placement id', ['source_id_1']);

// 过滤指定广告网络（networkFirmId）
ATSDK.setFilterNetworkFirmIdList('your placement id', ['1', '2']);

// 全局禁用某些广告网络
ATSDK.setForbidNetworkFirmIdList(['1']);

// 按广告位禁止展示某些广告网络
ATSDK.setForbidShowNetworkFirmIdList('your placement id', ['1']);

// 按广告位仅允许展示某些广告网络
ATSDK.setAllowedShowNetworkFirmIdList('your placement id', ['2']);

// 按风险等级过滤广告网络
ATSDK.setRiskFilterNetworkFirmIdList(1, ['3']);
```

---

## 6. 瀑布过滤（putFilter）

通过 `putFilter` 对某广告位设置瀑布过滤规则。规则按 `groups` 组织，**组间 OR、组内 AND**：

tsx
复制代码

```
import { ATSDK } from '@anythink/react-native-sdk';

ATSDK.putFilter('your placement id', {
  groups: [
    {
      networkId: ['1'],
      biddingType: ['0'],
      e_cpm: { currency: 'USD', moreThanPrice: 1.0, lessThanPrice: 10.0 },
    },
  ],
});

// 移除某广告位的过滤规则
ATSDK.removeFilterWithPlacementId('your placement id');

// 移除全部过滤规则
ATSDK.removeFilters();
```

`ATWaterfallFilterSpec` 每个 group 支持字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `networkId` | `string[]?` | 广告网络 ID |
| `biddingType` | `string[]?` | 竞价类型 |
| `networkPlacementId` | `string[]?` | 广告网络的广告位 ID |
| `e_cpm` | `object?` | eCPM 区间（`currency` / `moreThanPrice` / `lessThanPrice`） |

---

## 7. 方法速查

| 方法 | 说明 |
| --- | --- |
| `ATSDK.setChannel(string)` | 设置渠道名 |
| `ATSDK.setChannelSource(number)` | 设置渠道来源 |
| `ATSDK.initCustomMap(map)` | 全局自定义参数 |
| `ATSDK.initPlacementCustomMap(pid, map)` | 广告位自定义参数 |
| `ATSDK.setFilterAdSourceIdList(pid, ids)` | 过滤广告源 |
| `ATSDK.setFilterNetworkFirmIdList(pid, ids)` | 过滤广告网络 |
| `ATSDK.setForbidNetworkFirmIdList(ids)` | 全局禁用广告网络 |
| `ATSDK.setForbidShowNetworkFirmIdList(pid, ids)` | 按位禁止展示 |
| `ATSDK.setAllowedShowNetworkFirmIdList(pid, ids)` | 按位仅允许展示 |
| `ATSDK.setRiskFilterNetworkFirmIdList(risk, ids)` | 按风险过滤 |
| `ATSDK.putFilter(pid, spec)` | 设置瀑布过滤 |
| `ATSDK.removeFilterWithPlacementId(pid)` | 移除某位过滤 |
| `ATSDK.removeFilters()` | 移除全部过滤 |
