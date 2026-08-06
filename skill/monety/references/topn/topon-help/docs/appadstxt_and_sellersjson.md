---
title: "App-ads.txt与Sellers.json"
source: "https://help.toponad.net/cn/docs/appadstxt_and_sellersjson"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-05-30"
category_path: ["三方广告平台配置指南", "TopOn ADX", "App-ads.txt与Sellers.json"]
content_sha256: "8a2b4971e25805f56311ead482c268169361cd0859eb0721f8e9761b073c1677"
knowledge_role: "reference_only"
has_article_body: true
---

# App-ads.txt与Sellers.json

# 1. Ads.txt文件

## 1.1 什么是app-ads.txt

2017年，美国互动广告局（Interactive Advertising Bureau, 简称IAB）技术实验室推出ads.txt计划，旨在防止未经授权的流量销售。在一个碎片化的广告生态系统中，ads.txt是一种提高DSP透明度的方法。目前，ads.txt在整个行业的WEB端流量中得到了广泛的应用，DSP已经不会再购买未经ads.txt验证的网络流量。



2019年，IAB基于授权数字卖方 (ads.txt) 进行了延伸和扩展，推出授权应用卖方 (app-ads.txt)计划。ads.txt是用于保护WEB端流量的广告资源，app-ads.txt 在 ads.txt 的基础上进行了扩展可以应用于App上，帮助保护开发者的应用广告资源免遭广告欺诈。

## 1.2 App-ads.txt带来的好处

**App发布商部署app-ads.txt的最大好处是保障广告收益**。广告主对真实流量的要求越来越高，所以DSP在不久的未来将不会购买缺少app-ads.txt文件的APP的流量，未实施app-ads.txt的App可能会从DSP的目标媒体池中删除。

**另一方面，app-ads.txt的实施将打击广告欺诈**。许多非法移动应用程序通过伪造展示、点击、下载、安装等方式虚空增加广告库存，骗取品牌主预算。app-ads.txt 能有效减少欺诈事件，最大限度为开发者创造一个公平竞争的市场环境，并**获取更多广告主预算**。

## 1.3 app-ads.txt部署流程

#### 1. 确保您在Google Play和App Store应用商店的程序页面上登记您的网站。

广告平台将通过应用商店里所登记的网站来验证app-ads.txt文件。

#### 2. 向TopOn提供域名

在[**TopOn开发者后台 -> ADX设置**](https://portal.toponad.net/m/adx/set/app-ads)**[-> app-ads.txt](https://portal.toponad.net/m/adx/set/app-ads)页面**，填写您的主域名和公司名称，并获取对应需要部署的app-ads.txt

- 应用的域名需要与应用商店所登记的网站域名一致。（在开发者后台创建应用填写商店地址后，点搜索会自动匹配域名）
- 若应用没有上架商店，或希望登记不同的域名，可在app-ads.txt应用编辑中手动添加/更改域名

注意：域名无需填写协议与www.开头，只需要填写域名部分即可

示例：

- [v]正确文件路径：https://example.com/app-ads.txt
- [x]错误文件路径：https://example.com/ads/app-ads.txt



#### 3. 在开发者网站部署app-ads.txt

- 首先，请在[**TopOn开发者后台 -> ADX设置**](https://portal.toponad.net/m/adx/set/app-ads)**[-> app-ads.txt](https://portal.toponad.net/m/adx/set/app-ads)页面** 获取域名对应的app-ads.txt内容。注意每个域名的app-ads.txt文件不同，请分别处理。



- 然后，在记事本中创建一个app-ads.txt文件，点击“一键复制”，将TopOn ADX的app-ads.txt内容完整复制添加至您的app-ads.txt文件中。里面列出了所有已授权的广告变现平台提供的应用程序授权数字卖方信息。如下所示：
  - 排序分别对应：广告系统域名，开发者的帐户ID，账户/关系类型（直接或经销商），证书颁发机构ID。

```
toponad.com, XXXXXXX, DIRECT, XXXXXXX
smaato.com, XXXXXXX, RESELLER, XXXXXXX
inmobi.com, XXXXXXX, RESELLER, XXXXXXX
ironsrc.com, XXXXXXX, RESELLER, XXXXXXX
```

- 最后，将app-ads.txt文件上传到您在上述第2步中提供的域名的根目录中，并确保根域名路径能访问该文件。

> 例如：
> 您在第2步中提供（即填写在TopOn开发者后台）的域名为：publisher.com
> 那么需要部署的app-ads.txt具体的地址路径为：https://publisher.com/app-ads.txt
>
> 请确保根域名路径能访问该文件，因为平台爬虫遇到https://www.publisherc.om/app-ads.txt时，将会改为爬取https://publisher.com/app-ads.txt
>
> 平台也不会爬取https://publisher.com/dir/app-ads.txt

**注意：若您在应用商店配置的开发者网站采用多个域名，需在每个域名的根目录下都添加上TopOn的app-ads.txt。**

## 1.4 app-ads.txt工作原理

app-ads.txt文件由APP开发者在各个广告平台创建，并部署到开发者网站。app-ads.txt文件列出了授权销售该开发者广告资源的广告来源，DSP可以抓取此文件并检查他们购买的广告资源是否合法。

**App-ads.txt文件的校验流程如下：**

1. App向广告平台请求广告；
2. 广告平台向DSP发起竞价；
3. 当DSP想要对应用广告资源出价时，DSP会扫描开发者网站上的app-ads.txt文件，以验证哪些广告平台被授权销售该应用的流量。DSP仅接受来自文件中列出的广告来源的出价请求。



# 2. Sellers.json文件

## 2.1 什么是sellers.json文件

Sellers.json 是一项 IAB Tech Lab 标准，可提高广告生态系统的透明度并帮助打击欺诈行为。Sellers.json 通过公示流量卖方的域名和开发者名称这些基本信息，为买方广告主提供可靠的方式来发现和验证开发者的身份。

更多详情，请参考IAB对于sellers.json的[介绍](https://iabtechlab.com/sellers-json/)。

## 2.2 如何将开发者自己的信息加入TopOn的sellers.json

TopOn的sellers.json文件部署在我们的官网域名根目录下。我们建议开发者在此提供自己的域名和名称等信息，这有助于买方广告主验证您的广告资源。如果您的信息不透明，广告客户将无法看到您的名称，这可能会影响您的收入。

您可以前往[TopOn开发者后台 -> ADX设置 -> app-ads.txt](https://portal.toponad.net/m/adx/set/app-ads) 页面，填写自己的官网域名和开发者名称的信息。请使用包含了ads.txt文件的那个域名。同时，请使用根域名，不要带“www”、“https://”、“http://”或 “ftp://”。开发者名称请使用英文或者拼音。

若您成功部署了app-ads.txt，将在我们的[sellers.json](https://www.toponad.net/sellers.json)上看到您所部署的域名与公司名。sellers.json将在UTC+8的00:00更新，您可自行检查。
