---
title: "小米Columbus"
source: "https://help.toponad.net/cn/docs/xiao-mi-Columbus"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-26"
category_path: ["三方广告平台配置指南", "小米Columbus"]
content_sha256: "0bdf5915fd05999d990a4016ab152870de8828c05d26c9e340862c86a335a9ad"
knowledge_role: "reference_only"
has_article_body: true
---

# 小米Columbus

**Topon支持已支持小米Columbus广告平台，您可以更新Topon SDK Android v6.3.73及以上版本使用**

| 系统平台 | 竞价类型 | 广告类型 |
| --- | --- | --- |
| Android | 常规广告源、服务端竞价广告源 | 激励视频、插屏、横幅、原生 |

## Step1. 创建小米 Columbus账号

前往 [**小米 Columbus**](https://columbus.mi.com) 创建账号并登录。

## Step2. 在小米 Columbus后台添加应用和广告位

**(1) 添加应用**

前往 **应用列表** 页面，点击 **添加应用**按钮，按平台提示添加您的App。





**(2) 添加单元**

应用创建完毕后，您可以点击**【进入应用】**，**广告位管理 > 添加广告单元**。

① 如果使用**竞价广告源**时，**竞价类型**必须选择 **bidding**

② 如果使用**常规广告源**时，**竞价类型**必须选择 **瀑布流**







## Step3. 开通小米 Columbus的Report API

(1) 请联系小米获取**Reporting API Token**

(2) 在Topon开发者后台开通小米 Columbus的Report API

登录Topon后台→广告平台→添加广告平台（小米Columbus）→编辑（开通报表API）

填写**Reporting API Token**



## Step4. 在Topon配置小米 Columbus广告平台

(1) 将小米 Columbus配置在Topon开发者后台，需要的小米 Columbus参数如下：

| 参数名称 | 说明 |
| --- | --- |
| App ID | 小米 Columbus为每个应用生成的id，用于SDK初始化和API报表拉取 |
| App Secret | 小米 Columbus为每个应用生成的id，用于SDK初始化 |
| 广告单元ID | 小米 Columbus为每个广告位生成的唯一id |

**(2) 获取小米Columbus的App ID，App Secret和广告单元ID**

① 前往**应用**页面 ，在这里可以找到每个应用的**App ID(应用ID)**和**App Secret(应用密钥)**



② 点击**【进入应用】**进入广告单元管理页面 ，在这里可以找到所有广告单元ID。





**(2) 将小米Columbus参数配置到Topon开发者后台**

登录**Topon后台→聚合管理→选择对应的应用和广告位→添加广告源**。填写第一点中获取的App ID，App Secret和广告单元ID。



**(3) 小米Columbus现已支持非小米设备在支持国家广告填充，**请结合实际情况调整流量分组和广告请求，国家详情如下：

RU-俄罗斯
TR-土耳其
IN-印度
BR-巴西
ID-印尼
VN-越南
MY-马来西亚
TH-泰国
PH-菲律宾
ES-西班牙
DE-德国
IT-意大利
FR-法国
PT-葡萄牙
UZ-乌兹别克斯坦
KZ-哈萨克斯坦
KG-吉尔吉斯斯坦
PK-巴基斯坦
BD-孟加拉
EG-埃及
BY-白俄罗斯
IQ-伊拉克
MX-墨西哥
UA-乌克兰
CO-哥伦比亚
EC-厄瓜多尔
PE-秘鲁
AE-阿联酋
SA-沙特阿拉伯

## Step5. 将小米Columbus添加进应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
