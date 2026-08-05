---
title: "过滤广告源"
source: "https://help.toponad.net/cn/docs/guo-lyu-guang-gao-yuan"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "过滤广告源"]
content_sha256: "29e85f1974134e9fb17a189f1e3b7a4463cb977c813ad497371e040f7eb35ad2"
knowledge_role: "reference_only"
has_article_body: true
---

# 过滤广告源

您可在广告位调用Load方法前通过API传入本次需要过滤的广告源列表，广告加载的时候会过滤此列表的广告源，具体配置如下：

复制代码

```
// 过滤placementid中某一个广告源的加载
[[ATAdManager sharedManager] setExludePlacementid:@"you placement id" unitIDArray:@[@"3628" ]];

// 过滤placementid中某些平台的广告加载
[[ATAdManager sharedManager] setExludePlacementid:@"you placement id" networkFirmIDArray:@[@(ATNetworkFirmIDTypeFacebook),
                                                                                                 @(ATNetworkFirmIDTypeAdmob),
                                                                                                 @(ATNetworkFirmIDTypeCSJ)]];
```

温馨提示：

1. unitID是您在TopOn后台广告源ID，如图所示：
2. networkFirmID定义在`ATAPI`头文件中，请前往`ATAPI.h`中的`ATNetworkFirmIDType`枚举查看映射关系。Swift项目请先 `<span class="s1"><strong>import</strong></span> AnyThinkSDK`,点击进入`import AnyThinkSDK.ATAPI`中查看该枚举的定义。

   > 自定义广告平台需要您前往后台->左侧菜单-广告平台中查看广告平台 ID(即networkFirmID)

   
