# TopOn 分析数据约定

## 已登记报表类型

详细字段指纹见 `report-types.json`。

| 报表类型 | 典型结构 | 分析前处理 |
|---|---|---|
| 综合报表 | 通常一行对应一个日期及当前筛选维度组合 | 隔离首行区间汇总；比率、eCPM、DAU、DEU 和 ARPDAU 不直接求和 |
| 漏斗报表 | 同一日期按次数、设备、人均次数等统计方式拆成多行 | 必须按统计方式分层；不同统计方式严禁相加，使用专用漏斗分析器 |
| 聚合管理报表 | 首行 Total 加广告源明细 | 隔离 Total；区分流量请求与广告源请求，并检查第三方广告位 ID 复用 |

用户明确标为结构样例或低可信数据的文件，只用于字段映射、粒度识别和流程测试，不得据此评价业务或生成具体配置建议。

## 推荐粒度

一行表示一个日期下唯一的维度组合。优先保留以下维度：

| 类别 | 字段 |
|---|---|
| 时间 | `date`、时区 |
| 产品 | `app`、`app_id`、`platform`、`app_version` |
| 流量 | `country`、渠道、用户分层 |
| 广告 | `ad_unit`、`ad_unit_id`、`ad_format`、场景 |
| 聚合 | `network`、`ad_source`、`ad_source_id`、`third_party_ad_unit_id`、`traffic_group`、`waterfall`、竞价类型 |
| 配置 | 广告源实例/ID、层级顺序、底价、竞价类型、超时、延迟、配置生效时间 |
| 口径 | `currency`、`data_source`、预估或结算标记 |

脚本内置常见中英文字段别名。自动映射失败时，传入 `canonical_field -> source_column` JSON。

## 帮助中心语义层

机器可读的完整字段目录位于 `metric-catalog.json`。Data Analytics 只使用目录中的规范字段名、定义、公式和聚合规则；原始中文列名只用于映射和展示。

| TopOn 列名 | 规范字段 | 口径 |
|---|---|---|
| 预估收益 | `estimated_revenue` | TopOn 根据 SDK 展示和价格估算，不是第三方结算收益 |
| 收益 API | `revenue_api` | 第三方广告平台报表 API 收益 |
| 预估 eCPM | `estimated_ecpm` | `estimated_revenue / impressions * 1000` |
| 展示 | `impressions` | TopOn 收到广告平台 SDK 展示成功回调后统计 |
| 展示 API | `impressions_api` | 第三方广告平台报表 API 曝光数 |
| 收益 GAP | `revenue_gap_rate` | `(estimated_revenue - revenue_api) / revenue_api` |
| 展示 Gap | `impression_gap_rate` | `(impressions - impressions_api) / impressions_api` |
| 统计方式 | `statistic_type` | `event_count`、`device_count` 或 `per_device` |
| 广告平台 | `network` | 第三方广告平台，不等于广告源 |
| 广告源 | `ad_source` | TopOn 广告源名称，与 `ad_source_id` 配套 |
| 竞价胜出数 | `bidding_wins` | 瀑布流中的竞价胜出次数 |
| 竞胜率 | `bidding_win_rate` | `bidding_wins / (bidding_requests * bidding_response_rate)` |

`预估收益占比 = 预估收益 / 汇总预估收益`，`展示占比 = 展示数 / 汇总展示数`。标准化脚本优先读取导出汇总行作为分母；汇总行缺失时，只有在明细粒度互斥且覆盖同一筛选范围时才允许求和重建分母。

`新用户占比 = 新增用户 / DAU`；`竞价响应率 = 竞价响应次数 / 竞价次数`；`广告源填充率 = 广告源返回成功数 / 广告源请求数`；`广告 Ready 率 = 到达场景时已有缓存广告可播放数 / 到达广告场景数`；`isReady 成功率 = isReady 返回 True 次数 / isReady 调用次数`；`展示率 = 展示数 / 当前粒度填充数`。当前导出没有这些指标的全部原始分子、分母，因此定义已确认，但仍不能独立复算。

“展示成功率”的当前确认公式为 `展示 / 触发展示成功`。它表示成功触发第三方平台展示后，实际收到第三方平台展示成功回调的比例。用户于 2026-07-21 确认该口径，样例 14 个日期也全部复算一致；本地帮助中心快照中的旧公式不再作为当前分析口径。

聚合管理报表中，Total 行的“请求”是流量请求，广告源明细行的“请求”是广告源请求。两者不能相加或直接比较。若同一 `third_party_ad_unit_id` 出现在多个明细行，收益 API、展示 API 等第三方数据可能重复，汇总前必须去重或改用导出 Total。

## 可加指标

同一互斥粒度内可以求和：

- `requests`：请求数。
- `responses`：返回或填充数。先确认导出口径。
- `impressions`：展示数。
- `clicks`：点击数。
- `estimated_revenue`：TopOn 预估收益。同币种、互斥粒度内可加。
- `revenue_api`：第三方平台 API 收益。同币种且 API 支持当前维度时可加。
- `revenue`：只用于已明确来源的一般收入字段。不得把“预估收益”自动放入此字段。

## 派生指标

从汇总后的分子、分母计算：

```text
traffic_fill_rate            = traffic_fills / traffic_requests
ad_source_fill_rate          = ad_source_fills / ad_source_requests
display_trigger_success_rate = display_trigger_successes / display_triggers
impression_success_rate      = impressions / display_triggers
ctr                          = clicks / impressions
estimated_ecpm               = estimated_revenue / impressions * 1000
estimated_arpdau             = estimated_revenue / dau
revenue_gap_rate             = (estimated_revenue - revenue_api) / revenue_api
impression_gap_rate          = (impressions - impressions_api) / impressions_api
```

若 TopOn 文档对具体报表使用不同定义，以对应页面为准，并在报告中写出公式。

广告场景到达率使用设备口径：`ad_scene_arrivals / app_starts`。广告触发率使用次数口径：`display_triggers / ad_scene_arrivals`。漏斗报表中的比率应在目录指定的统计方式内复算，不能跨“次数、设备、人均次数”取分子和分母。

## 非可加指标

DAU、广告用户数、留存率、ARPU、ARPDAU、eCPM 和各类比率不能跨重复粒度直接求和。计算 ARPDAU 前，先取得按日期和应用去重后的 DAU。无法确认重复方式时，保留原值并报告限制。

## 最小数据集

收入变化诊断至少需要：

```text
date, revenue, impressions
```

漏斗诊断再增加：

```text
requests, responses
```

配置定位至少增加一个可操作维度：

```text
country, ad_unit, network, traffic_group, platform, app_version
```

## 数据质量规则

- 记录币种、时区、导出时间和数据来源。
- TopOn 界面和导出中的 `$` 默认解释为美元（USD）；如项目另有币种约定，必须显式覆盖默认值。
- TopOn 报表统计时区默认解释为 UTC+0；如导出或项目另有时区约定，必须显式覆盖默认值。
- 检查重复行、合计行和小计行。
- 检查负收入、负请求、展示大于返回等异常，但不要在不知道口径时自动删除。
- 检查对比周期是否完整，避免用未结束当天对比完整日。
- 保留原始文件；清洗和字段映射写入 `derived/`。
- 对账时并列展示不同来源，不先强行合并。
- 多币种收入必须先按明确汇率和日期换算；多时区数据必须先统一统计日。
- 广告位请求与广告源请求属于不同漏斗层级。广告源请求可能是同一次瀑布请求中的多次尝试，不能跨广告源相加成广告位请求。
- 当前周期和基线周期必须覆盖相同数量的完整自然日；默认排除尚未结束的当天。
- 第三方平台 Report API 指标存在更新延迟。帮助中心说明 UTC+8/UTC+0 通常延迟 1 天，UTC-8 通常延迟 2 天；近期 `收益 API`、`展示 API` 和 GAP 指标必须先确认完成度。
- 只有日期的报表能看趋势，不能定位配置对象。配置建议至少需要地区、广告位、广告源、广告场景、流量分组或版本中的一个可行动维度。
- 导出收益和比率可能已按展示精度取整。公式复算出现小差异时保留差异，并区分“显示取整或隐藏精度”与“公式定义冲突”。

## Data Analytics 交接约定

- 先生成 `normalized_comprehensive.csv` 或 `normalized_funnel.csv`，再生成 `artifact.json`。
- snapshot 中每个 dataset 都是行对象数组，单个数据集不超过 2,000 行。
- `source.query.sql` 必须是可执行的 DuckDB SQL，并指向标准化 CSV。
- `source.query.metric_definitions` 必须来自 `metric-catalog.json`，包含定义、聚合规则和已确认公式。
- 综合报表保留一份规范数据集。漏斗报表拆成 `event_count`、`device_count`、`per_device` 三份数据集。
- artifact 继承 `observed` 或 `fixture` 信任状态；状态为 `fixture` 时禁止业务归因和配置建议。
- 调用 Data Analytics 的 `validate_artifact` 通过后，才能渲染或发布。

主要定义来源：**[IAA-TOPON-20-综合报表]** **[IAA-TOPON-08-漏斗分析]** **[IAA-TOPON-10-有效展示]** **[IAA-TOPON-21-Open API 综合报表]**。

## 瀑布和底价优化补充字段

常规综合报表不足以直接推导瀑布层数或底价。至少补充：

```text
source_instance, source_instance_id, layer_order, floor_price,
bidding_type, timeout_ms, latency_ms, config_effective_at
```

若能取得逐次请求或广告源实例级数据，再保留请求尝试、返回价格、是否展示和超时状态。没有这些字段时，只能定位候选广告位或广告源，不能把建议写成确定参数。
