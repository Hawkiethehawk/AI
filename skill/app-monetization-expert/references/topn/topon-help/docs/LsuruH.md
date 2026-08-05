---
title: "首页"
source: "https://help.toponad.net/cn/docs/LsuruH"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-05-30"
category_path: ["平台使用指南", "首页"]
content_sha256: "360b54ea6fa4b5520ab37f72887125c48e131167b329bb1d74818565877d1093"
knowledge_role: "reference_only"
has_article_body: true
---

# 首页

首页是您登录TopOn时看到的第一页，它提供了整个TopOn账号的数据概览



## 1. 报告时区

数据报表支持修改报告时区。目前支持UTC+8中国标准时间、UTC+0格林威治标准时间、UTC-8太平洋标准时间，**默认为UTC+8时间**。
TopOn SDK统计数据及如下广告平台数据已按所选时区汇总（Facebook、Mintegral、Applovin、UnityAds、Tapjoy），其余广告平台数据则以API返回的时区为准。

**报告时区修改路径：**
TopOn开发者后台-【账号管理】-【账号信息】-【基础信息】



## 2. 数据更新时间

不同的数据指标更新时间会有差异，具体如下：
(1) DAU：每2小时更新；
(2) 除了DAU以外的其他TopOn SDK统计数据：每5分钟更新；
(3) 广告平台的报表API数据（我们会在5个时间段拉取前一天的广告平台数据）：3:30,10:50,14:30,16:30,21:00。

## 3. 数据筛选项

支持选择各个图表的维度，可自定义日期数据




| 筛选项 | 说明 |
| --- | --- |
| 日期 | 数据产生的时间段。 |
| 应用 | 在TopOn创建的应用。[>>更多](/cn/docs/pzi00q) |
| 广告位 | 在TopOn创建的广告位。 [>>更多](/cn/docs/pzi00q#2._%E5%B9%BF%E5%91%8A%E4%BD%8D%E7%AE%A1%E7%90%86) |
| 广告样式 | 在TopOn创建的广告位对应的广告样式：激励视频、插屏、原生、开屏、Banner |
| 广告平台 | TopOn支持的多家广告平台SDK的接入。 [>>TopOn支持的广告平台](/cn/docs/Zz3Bk5) |
| 地区 | 用户所在的国家/地区 |
| 系统平台 | 安卓/IOS |

## 4. 数据指标



| 数据指标 | 说明 |
| --- | --- |
| 收益 | TopOn通过报表API向广告平台拉取到的实际收益。 |
| 展示 | TopOn统计的广告曝光次数。由于统计口径不一样，TopOn统计的展示与广告平台统计的展示（展示API）可能**存在一定差异**。 |
| DAU | 日活跃用户(Daily Active User)，即初始化TopOn SDK的设备用户数。 **注意**：根据GDPR协议，欧盟地区需要用户同意后才会统计数据。[>>什么是GDPR？](/cn/docs/MWsWVm) |
| 预估收益 | 根据TopOn SDK统计的展示数和eCPM价格进行预估的收益。计算公式：①常规广告源：人工填写的eCPM价格\*TopOn统计的展示/1000；②头部竞价广告源：实时的广告展示价格。[>>头部竞价说明](/cn/docs/dfnwQG) |
