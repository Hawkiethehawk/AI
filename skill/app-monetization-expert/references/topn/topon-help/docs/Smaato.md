---
title: "Smaato"
source: "https://help.toponad.net/cn/docs/Smaato"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-01-05"
category_path: ["三方广告平台配置指南", "Smaato"]
content_sha256: "db656759b204911ea8701c3b721a077b348b293c56392b3d792eb12551889f32"
knowledge_role: "reference_only"
has_article_body: true
---

# Smaato

**TopOn支持已支持Smaato广告平台，您可以更新TopOn SDK v6.4.50及以上版本使用**

| 系统平台 | 竞价类型 | 广告类型 |
| --- | --- | --- |
| Android、IOS | 常规广告源、服务端竞价 | 激励视频、插屏、横幅、原生 |

注意：IOS上Smaato 的广告位ID不能共用，需要校验唯一性；**Smaato 常规广告位需联系平台配置；**

## Step1. 创建Smaato账号

前往 **[Smaato](https://spx.smaato.com/)**创建账号并登录。

## Step2. 在Smaato后台添加应用和广告位

**(1) 添加应用**

前往首页，点击 New APP+ 按钮，按平台提示添加您的App。



**(2) 添加广告位**

应用创建完毕后，您可以在**Inventory > 点击APP > 点击 +NEW Adspeace**

① [Adspace 创建可参考Smaato文档](https://developers.smaato.com/publishers/spx-adspaces/)

② Publisher ID和Adspace ID可分别在APP信息和Adspace信息页面获取





## Step3. 开通Smaato的Report API

**[Smaato官方report API开通文档](https://developers.smaato.com/publishers/spx-reporting-api/)**

(1) 登录您的 SPX 帐户，然后转到 SPX 右上角用户菜单中的 OAuth API 凭据。



(2) 生成 API 凭证



(3) 单击“创建客户端 ID” ，您将获得必要的凭证



(4) 通过单击“生成”直接从此页面生成访问令牌



## Step4. 在TopOn配置Smaato广告平台

(1) 将Smaato配置在TopOn开发者后台，需要的参数如下：

| 参数名称 | 说明 |
| --- | --- |
| Smaato Client Id(client\_id ) | 通过[OAuth 2.0 authentication](https://developers.smaato.com/publishers/spx-authentications/)申请获得 |
| Smaato Client Secret(client\_secret) | 通过[OAuth 2.0 authentication](https://developers.smaato.com/publishers/spx-authentications/)申请获得 |
| Smaato Publisher ID | Smaato为每个应用生成的id，用于SDK初始化 |
| unit\_id（speace id） | Smaaato为每个广告位生成的唯一id |

(2) 将Smaato参数配置到TopOn开发者后台

登录TopOn后台 → 广告平台 → 广告源管理（Smaato）→ 添加广告源。填写第一点中获取的client\_id ，client\_secret，Publisher ID 和unit\_id

## Step5. 底价设置

(1) 在**【Smaato Exchange】**点击 **【+New Line Item】**



(2) 填写广告位名称，选择**【Floor Pirce】**，设置底价。



(3) 在**【Targeting】**里选择对应的应用，点击前面的**“+”**号，再选择需要设置底价的广告位，点击**【+Add】**，点击保存。



## Step6. 将Smaato adapter添加至应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)
