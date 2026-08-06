---
title: "高级设置"
source: "https://help.toponad.net/cn/docs/D1RWUEA9"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-05-14"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "高级设置"]
content_sha256: "93887809f2878f9dc9c5fcd0f94bba0d7abc15c27c4922926b193016b326ffff"
knowledge_role: "reference_only"
has_article_body: true
---

# 高级设置

## ● 屏蔽指定平台

> **💡Tips**
>
> - TopOn SDK 版本要求：v6.3.40及以上
> - 需要在`load()`之前调用
> - [**network\_firm\_id**](https://help.toponad.net/cn/docs/2KR6QU#TopOn_%E6%94%AF%E6%8C%81%E8%81%9A%E5%90%88%E4%BB%A5%E4%B8%8B%E5%B9%BF%E5%91%8A%E5%B9%B3%E5%8F%B0) 其中`自定义平台id` 可在[TopOn后台](https://portal.toponad.com/m/network) 点击自定义平台获取

### ● 全局维度

java
复制代码

```
List<String> networkFirmIdList = new ArrayList<>();
// 传入需要屏蔽的指定广告平台的平台id
// networkFilmIdList.add("network_firm_id");

//设置屏蔽指定平台id
ATSDK.setForbidNetworkFirmIdList(networkFirmIdList);
```

java
复制代码

```
List<String> networkFirmIdList = new ArrayList<>();
// 传入需要屏蔽的指定广告平台的平台id
// networkFilmIdList.add("network_firm_id");

//设置屏蔽指定平台id
TUSDK.setForbidNetworkFirmIdList(networkFirmIdList);
```

### ● 广告位维度

java
复制代码

```
List<String> networkFirmIdList = new ArrayList<>();
// 传入需要屏蔽的指定广告平台id
// networkFilmIdList.add("network_firm_id");

// 设置屏蔽指定平台id
ATSDK.setFilterNetworkFirmIdList("your placement id", networkFirmIdList);

// 设置允许指定平台展示
ATSDK.setAllowedShowNetworkFimIdList("your placement id", networkFirmIdList);

// 设置指定平台不展示
ATSDK.setForbidShowNetworkFirmIdList("your placement id", networkFirmIdList);

-----------------------------------------------------------------------------------

List<String> adSourceIdList = new ArrayList<>();
// 传入需要屏蔽的指定广告源id
// adSourceIdList.add("ad_source_id");

// 设置屏蔽指定平台id
ATSDK.setFilterAdSourceIdList("your placement id", adSourceIdList);
```

java
复制代码

```
List<String> networkFirmIdList = new ArrayList<>();
// 传入需要屏蔽的指定广告平台id
// networkFilmIdList.add("network_firm_id");

// 设置屏蔽指定平台id
TUSDK.setFilterNetworkFirmIdList("your placement id", networkFirmIdList);

// 设置允许指定平台展示
TUSDK.setAllowedShowNetworkFimIdList("your placement id", networkFirmIdList);

// 设置指定平台不展示
TUSDK.setForbidShowNetworkFirmIdList("your placement id", networkFirmIdList);

-----------------------------------------------------------------------------------

List<String> adSourceIdList = new ArrayList<>();
// 传入需要屏蔽的指定广告源id
// adSourceIdList.add("ad_source_id");

// 设置屏蔽指定平台id
TUSDK.setFilterAdSourceIdList("your placement id", adSourceIdList);
```

---

## ● 标记风险设备

> **💡Tips**
>
> - TopOn SDK 版本要求：v6.4.60及以上
>
> java
> 复制代码
>
> ```
> /**
>  * 标记风险设备，过滤掉指定广告平台
>  * @param risk 风险标记（1=启用过滤，0=禁用过滤）
>  * @param networkFirmIdList 广告平台ID
>  */
> ATSDK.setRiskFilterNetworkFirmIdList(int risk, List<String> networkFirmIdList);
> ```
>
> - [请参考这里查询各广告平台ID](https://help.toponad.net/cn/docs/2KR6QU#TopOn_%E6%94%AF%E6%8C%81%E8%81%9A%E5%90%88%E4%BB%A5%E4%B8%8B%E5%B9%BF%E5%91%8A%E5%B9%B3%E5%8F%B0)

java
复制代码

```
// 示例
// 开启过滤并过滤掉指定广告平台的请求
ATSDK.setRiskFilterNetworkFirmIdList(1, Arrays.asList("平台1", "平台2"));

// 开启过滤并过滤掉所有广告平台的请求
ATSDK.setRiskFilterNetworkFirmIdList(1, null);
```

> **💡Tips**
>
> - TopOn SDK 版本要求：v6.4.60及以上
>
> java
> 复制代码
>
> ```
> /**
>  * 标记风险设备，过滤掉指定广告平台
>  * @param risk 风险标记（1=启用过滤，0=禁用过滤）
>  * @param networkFirmIdList 广告平台ID
>  */
> TUSDK.setRiskFilterNetworkFirmIdList(int risk, List<String> networkFirmIdList);
> ```
>
> - [请参考这里查询各广告平台ID](https://help.toponad.net/cn/docs/2KR6QU#TopOn_%E6%94%AF%E6%8C%81%E8%81%9A%E5%90%88%E4%BB%A5%E4%B8%8B%E5%B9%BF%E5%91%8A%E5%B9%B3%E5%8F%B0)

java
复制代码

```
// 示例
// 开启过滤并过滤掉指定广告平台的请求
TUSDK.setRiskFilterNetworkFirmIdList(1, Arrays.asList("平台1", "平台2"));

// 开启过滤并过滤掉所有广告平台的请求
TUSDK.setRiskFilterNetworkFirmIdList(1, null);
```

---

## ● 自定义过滤规则

> **💡Tips**
>
> - TopOn SDK 版本要求：v6.4.60及以上
>
> java
> 复制代码
>
> ```
> /**
>  * 针对广告位添加自定义过滤规则
>  * @param placementId 广告位ID
>  * @param filter 过滤条件对象
>  */
> ATSDK.putFilter(String placementId, ATAdFilter filter)
> ```
>
> - [请参考这里查询各广告平台ID](https://help.toponad.net/cn/docs/2KR6QU#TopOn_%E6%94%AF%E6%8C%81%E8%81%9A%E5%90%88%E4%BB%A5%E4%B8%8B%E5%B9%BF%E5%91%8A%E5%B9%B3%E5%8F%B0)
> - `filterNetworkIds`, `filterBidTypes`, `filterNetworkPlacementIds`, `filterAdPrice`可根据实际需要自行组合成过滤规则
>
> java
> 复制代码
>
> ```
> // 针对广告位移除自定义过滤规则
> ATSDK.removeFilterWithPlacementId("your placement id");
>
> // 移除所有自定义过滤规则
> ATSDK.removeFilters();
> ```

> **💡Tips**
>
> - TopOn SDK 版本要求：v6.4.60及以上
>
> java
> 复制代码
>
> ```
> /**
>  * 针对广告位添加自定义过滤规则
>  * @param placementId 广告位ID
>  * @param filter 过滤条件对象
>  */
> TUSDK.putFilter(String placementId, ATAdFilter filter)
> ```
>
> - [请参考这里查询各广告平台ID](https://help.toponad.net/cn/docs/2KR6QU#TopOn_%E6%94%AF%E6%8C%81%E8%81%9A%E5%90%88%E4%BB%A5%E4%B8%8B%E5%B9%BF%E5%91%8A%E5%B9%B3%E5%8F%B0)
> - `filterNetworkIds`, `filterBidTypes`, `filterNetworkPlacementIds`, `filterAdPrice`可根据实际需要自行组合成过滤规则
>
> java
> 复制代码
>
> ```
> // 针对广告位移除自定义过滤规则
> TUSDK.removeFilterWithPlacementId("your placement id");
>
> // 移除所有自定义过滤规则
> TUSDK.removeFilters();
> ```

**● 示例1**

> **过滤规则：需同时满足以下过滤条件：**
>
> 1. 平台限制
>    - 目标平台ID：平台1、平台2
> 2. 竞价类型限制
>    - 过滤类型：竞价广告（C2S/S2S）、非竞价广告（NORMAL）（即同时排除实时竞价与非竞价广告类型）
> 3. 广告平台的广告位限制
>    - 目标平台的广告位ID：广告位1、广告位2
>    - （对应广告平台的NetworkPlacementId字段）
> 4. 价格区间限制（**⚠️若将价格范围写成 ≤10 且 ≥50 则判为无效范围）**
>    - 货币单位：USD美元
>    - 价格范围：≥10 且 ≤50

java
复制代码

```
ATSDK.putFilter("your placement id", new ATWaterfallFilter()
        .filterNetworkIds(Arrays.asList("平台1", "平台2")) // 过滤掉指定平台id
        .filterBidTypes(Arrays.asList(ATWaterfallFilter.NORMAL, ATWaterfallFilter.C2S, ATWaterfallFilter.S2S)) //过滤掉竞价和非竞价类型
        .filterNetworkPlacementIds(Arrays.asList("广告平台的广告位1", "广告平台的广告位2")) // 过滤掉广告平台的广告位id
        .filterAdPrice(new ATWaterfallFilter.PriceInterval(ATAdConst.CURRENCY.USD) // 选择货币单位，过滤掉指定价格范围
                // 如下示例 过滤掉的价格范围为 [10，50]
                .moreThanPrice(10) // 大于等于10
                .lessThanPrice(50) // 小于等于50
        )
);
```

java
复制代码

```
TUSDK.putFilter("your placement id", new TUWaterfallFilter()
        .filterNetworkIds(Arrays.asList("平台1", "平台2")) // 过滤掉指定平台id
        .filterBidTypes(Arrays.asList(TUWaterfallFilter.NORMAL, TUWaterfallFilter.C2S, TUWaterfallFilter.S2S)) //过滤掉竞价和非竞价类型
        .filterNetworkPlacementIds(Arrays.asList("广告平台的广告位1", "广告平台的广告位2")) // 过滤掉广告平台的广告位id
        .filterAdPrice(new TUWaterfallFilter.PriceInterval(TUAdConst.CURRENCY.USD) // 选择货币单位，过滤掉指定价格范围
                // 如下示例 过滤掉的价格范围为 [10，50]
                .moreThanPrice(10) // 大于等于10
                .lessThanPrice(50) // 小于等于50
        )
);
```

**● 示例2**

> **过滤规则：满足条件1 or 条件2即可 (💡各条件之间用`.orFilter()` 连接)**
>
> 条件1
>
> 1. 平台限制
>    - 目标平台ID：平台1、平台2
> 2. 竞价类型限制
>    - 过滤类型：非竞价广告（NORMAL）
> 3. 广告平台的广告位限制
>    - 目标平台的广告位ID：广告位1、广告位2
>    - （对应广告平台的NetworkPlacementId字段）
> 4. 价格区间限制
>    - 货币单位：RMB\_CENT人民币分
>    - 价格范围：≤5000
>
> 条件2
>
> 1. 平台限制
>    - 目标平台ID：平台3
> 2. 竞价类型限制
>    - 过滤类型：竞价广告（C2S/S2S）
> 3. 广告平台的广告位限制
>    - 目标平台的广告位ID：广告位1（对应广告平台的NetworkPlacementId字段）
> 4. 价格区间限制
>    - 货币单位：RMB人民币元
>    - 价格范围：≥10

java
复制代码

```
ATSDK.putFilter("your placement id", new ATWaterfallFilter()
        // 条件1
        .filterNetworkIds(Arrays.asList("平台1", "平台2")) // 过滤掉指定平台id
        .filterBidTypes(Arrays.asList(ATWaterfallFilter.NORMAL)) //过滤掉非竞价类型
        .filterNetworkPlacementIds(Arrays.asList("广告平台的广告位1", "广告平台的广告位2")) // 过滤掉广告平台的广告位id
        .filterAdPrice(new ATWaterfallFilter.PriceInterval(ATAdConst.CURRENCY.RMB_CENT) // 选择货币单位 人民币分，过滤掉指定价格范围
                .lessThanPrice(5000) // 小于等于5000
        )
        .orFilter()
        // 条件2
        .filterNetworkIds(Arrays.asList("平台3")) // 过滤掉指定平台id
        .filterBidTypes(Arrays.asList(ATWaterfallFilter.C2S, ATWaterfallFilter.S2S)) //过滤掉竞价类型
        .filterNetworkPlacementIds(Arrays.asList("广告平台的广告位1")) // 过滤掉广告平台的广告位id
        .filterAdPrice(new ATWaterfallFilter.PriceInterval(ATAdConst.CURRENCY.RMB) // 选择货币单位 人民币元，过滤掉指定价格范围
                .moreThanPrice(10) // 大于等于10
        )
);
```

java
复制代码

```
TUSDK.putFilter("your placement id", new TUWaterfallFilter()
        // 条件1
        .filterNetworkIds(Arrays.asList("平台1", "平台2")) // 过滤掉指定平台id
        .filterBidTypes(Arrays.asList(TUWaterfallFilter.NORMAL)) //过滤掉非竞价类型
        .filterNetworkPlacementIds(Arrays.asList("广告平台的广告位1", "广告平台的广告位2")) // 过滤掉广告平台的广告位id
        .filterAdPrice(new TUWaterfallFilter.PriceInterval(TUAdConst.CURRENCY.RMB_CENT) // 选择货币单位 人民币分，过滤掉指定价格范围
                .lessThanPrice(5000) // 小于等于5000
        )
        .orFilter()
        // 条件2
        .filterNetworkIds(Arrays.asList("平台3")) // 过滤掉指定平台id
        .filterBidTypes(Arrays.asList(TUWaterfallFilter.C2S, TUWaterfallFilter.S2S)) //过滤掉竞价类型
        .filterNetworkPlacementIds(Arrays.asList("广告平台的广告位1")) // 过滤掉广告平台的广告位id
        .filterAdPrice(new TUWaterfallFilter.PriceInterval(TUAdConst.CURRENCY.RMB) // 选择货币单位 人民币元，过滤掉指定价格范围
                .moreThanPrice(10) // 大于等于10
        )
);
```
