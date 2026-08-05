---
title: "过滤交叉推广应用"
source: "https://help.toponad.net/cn/docs/guo-lyu-jiao-cha-tui-guang-ying-yong"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "过滤交叉推广应用"]
content_sha256: "71f4f059f6ad7b71836e98d1d6d5fe7a824c25222e061b75075035335f3f08f1"
knowledge_role: "reference_only"
has_article_body: true
---

# 过滤交叉推广应用

针对交叉推广设置排除已安装AppID的列表，被排除的AppID所对应的产品不会再被推广，示例代码如下：

复制代码

```
[[ATAPI sharedInstance] setExludeAppleIdArray:@[@"id529479190"]];
```

> **以上传入的AppleId与后台配置的交叉推广产品App Store ID一致才能成功过滤排除，请参考下图**

****
