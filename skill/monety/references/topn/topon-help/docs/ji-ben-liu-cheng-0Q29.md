---
title: "自定义广告平台 SDK 版本 < 6.4.94"
source: "https://help.toponad.net/cn/docs/ji-ben-liu-cheng-0Q29"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "自定义广告平台", "自定义广告平台 SDK 版本 < 6.4.94"]
content_sha256: "3ecc493b0d9fa2bbc7a0c6a482b7c081c7ef1444d8c49756871c2975974deddc"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义广告平台 SDK 版本 < 6.4.94

TopOn支持**自定义广告平台**功能，您可以通过本功能，添加TopOn暂未聚合的**广告平台**。

> 本文档适用于 SDK 版本 < 6.4.94，我们推荐您使用新版本的自定义广告平台接入方式，请(<https://help.toponad.net/cn/docs/Ee6uTinO>)前往新版文档

本章节将引导您实现iOS端的自定义广告平台(Adapter)，目前，TopOn iOS SDK自定义广告平台支持原生广告(Native)、激励视频广告(RewardVideo)、横幅广告(Banner)、插屏广告(Intersitial)和开屏广告(Splash)。

您需要在TopOn后台添加自定义广告平台后再进行相关代码编写工作，在此过程您需要记录您添加的相关类名，您可以[前往此处](/cn/docs/fRMh7C)了解如何操作。

> - 类的命名请参考默认引导，例如：激励视频(CustomRewardedVideoAdapter)，请替换Custom为您需要的内容，如(YourProjNameRewardedVideoAdapter)。
> - 在您按照上方指引完成TopOn后台相关操作后，请点击前往子章节继续完成接入。

下图展示了第三方广告平台作为TopOn iOS SDK自定义广告平台接入的基本流程：


