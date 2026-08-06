---
title: "Admob内容映射功能"
source: "https://help.toponad.net/cn/docs/Admob-nei-rong-ying-she-gong-neng"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "Admob内容映射功能"]
content_sha256: "30ce1ed20998215063967d88ca240a86115d94bec15ed9359dfc82a09671ac23"
knowledge_role: "reference_only"
has_article_body: true
---

# Admob内容映射功能

## **1**. Admob内容映射说明

借助应用内容映射，您可以面向用户投放与内容相关的广告，并确保广告放置在适合您广告客户的内容附近。详情请参考 [Admob参考文档](https://support.google.com/admob/answer/11050896?hl=zh-Hans&visit_id=638180095957216940-1250837351&rd=1)

> 默认只可以传 1 个URL。 通过向admob提出申请，您可以让内容网址(multi-content url)支持到最多4个，

- 支持的广告类型：所有广告样式
- 开始支持版本：v6.2.65

## **2**. 示例代码

### 2.1 添加内容映射网址

复制代码

```
// 支持传入1-4个 URL
NSMutableDictionary *mutableDict = [NSMutableDictionary dictionary];
mutableDict[kATAdLoadingExtraAdmobContentURLStringsKey] = @[@"https://www.example1.com", @"https://www.example2.com"];
[[ATAdManager sharedManager] loadADWithPlacementID:@"你的广告位"  extra:mutableDict delegate:self containerView:nil];
```

> 注意： 传入的内容映射网址会一直生效，您不需要每次请求的时候都传入相同的url。 如果需要更换，再次传入新内容即可。

### 2.2 取消内容映射网址

每次需要传入参数，才能生效，如果不传，代表不使用内容映射。
