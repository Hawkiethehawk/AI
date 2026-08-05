---
title: "自定义广告平台"
source: "https://help.toponad.net/cn/docs/fRMh7C"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-09-02"
category_path: ["三方广告平台配置指南", "自定义广告平台"]
content_sha256: "e5f82bb7012b66fe29f6c6027f252eda6c4e4c42be5b519ca717caa70a8ef23d"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义广告平台

您可以通过TopOn的自定义广告平台功能，添加TopOn暂未聚合的广告平台。

## Step1. 创建自定义广告平台

(1) 添加广告平台账号配置

①若您未添加过自定义广告平台，可点击添加自定义广告平台入口，添加广告平台



②填写自定义广告平台信息



③请务必填写需要使用的广告样式的Adapter

⚠️注意：Android平台请填写如下图所示 Adapter 的全路径类名



④添加自定义广告平台的时候，会同步创建一个自定义广告平台账号

(2) 查看自定义广告平台的Network Firm ID

TopOn SDK支持在回调中返回广告源的信息，其中包括当前广告源所属的广告平台。您可以在广告平台列表中查看已添加的自定义广告平台的Network Firm ID



## Step2. 添加自定义广告平台账号

若您已经添加过自定义广告平台，需要创建另外的账号，可以直接添加自定义广告平台账号





## Step3. 关联广告平台

在您需要添加的自定义广告平台上创建应用和广告位等信息（请到对应广告平台后台操作）

在应用管理页面，找到需要接入已添加的自定义广告平台的应用，点击【关联广告平台】进行关联操作。

① 选择刚刚添加的自定义广告平台及账号

② 根据自定义广告平台的实际情况，填写自定义广告平台应用维度参数。例如，自定义广告平台需要传入应用id，则需要在此处输入应用id的key（用于下发给SDK使用，请和您的开发同学确认后再填写）及应用id的value（具体应用id的数值）。支持填写多个应用维度的参数或不填写应用维度参数。



③ 后续如果需要调整应用维度参数，请提前与开发同学同步，确保参数下发正确&完整



## Step4. 添加自定义广告平台的广告源

您可以在TopOn后台的聚合管理和广告平台页面添加自定义广告平台的广告源。

① 在添加自定义广告平台的广告源时，需要填写该广告源的参数。注意：T**opOn已生成****默认参数【代码位id】（对应的key为slot\_id（广告平台的广告位ID）****）**，用于填写自定义广告平台用于加载广告的唯一代码位ID。实际请求参数可以通过广告源维度参数填写。

② 广告源的参数将通过TopOn SDK传递给自定义广告平台的Adapter使用。

③ 建议广告源维度参数中包含自定义广告平台 SDK需要的全部参数，如Ad Size等。

填写方式：key-value，**其中****key用于下发给SDK使用，请和您的开发同学确认后再填写**



④ 自定义广告平台的广告源暂不支持自动价格

## Step5. TopOn SDK接入自定义广告平台

1. 实现自定义广告平台Adapter

您需要根据TopOn的自定义广告平台Adapter规范，自行实现自定义广告平台各个广告类型的Adapter类。具体的规范如下：

|  |  |
| --- | --- |
| 系统平台 | 接入规范 |
| Android | [查看](https://help.toponad.net/cn/docs/ji-ben-liu-cheng) |
| iOS | [查看](https://help.toponad.net/cn/docs/ji-ben-liu-cheng-0Q29) |

2. 实现自定义广告平台客户端竞价

如果您接入的自定义广告平台支持客户端实时出价，您可以在自定义广告平台实现客户端竞价功能。

客户端竞价加载流程如下图：



您需要根据TopOn的自定义Client Bidding广告规范，自行实现自定义广告平台的客户端竞价功能。具体的规范如下：

|  |  |
| --- | --- |
| 系统平台 | 接入规范 |
| Android | [查看](https://help.toponad.net/cn/docs/zi-ding-yi-Client-Bidding-guang-gao) |
| iOS | [查看](https://help.toponad.net/cn/docs/zi-ding-yi-gao-ji-pei-zhi) |

3. 将自定义广告平台Adapter添加进应用代码

参考TopOn SDK集成说明文档，将TopOn SDK集成进您的应用中。

(1) 下载TopOn SDK

|  |  |
| --- | --- |
| 支持自定义广告平台的版本号 | 下载地址 |
| TopOn Android SDK V5.6.5 及以上 | [下载](https://portal.toponad.net/m/sdk/download) |
| TopOn iOS SDK V5.6.5 及以上 | [下载](https://portal.toponad.net/m/sdk/download) |

(2) 参考TopOn SDK集成说明文档

|  |  |
| --- | --- |
| 系统平台 | 说明 |
| TopOn Android SDK | [查看](https://help.toponad.net/cn/docs/ji-ben-liu-cheng) |
| TopOn iOS SDK | [查看](https://help.toponad.net/cn/docs/zi-ding-yi-gao-ji-pei-zhi) |

## Step6. 查看自定义广告平台的数据

您可以在TopOn后台的综合报表中查看自定义广告平台的数据。

自定义广告平台已支持手动上传数据，请在 开发者后台操作指南 -> 上传三方数据 章节查看具体上传步骤


