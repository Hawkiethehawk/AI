---
title: "AdMob内容映射功能"
source: "https://help.toponad.net/cn/docs/MW03yX"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-07-22"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "AdMob内容映射功能"]
content_sha256: "9b099e12371d3fabc8acb48adbe81808e78d76d85a7c160f4fbd7bf125aef968"
knowledge_role: "reference_only"
has_article_body: true
---

# AdMob内容映射功能

## 1. AdMob内容映射说明

借助应用内容映射，您可以面向用户投放与内容相关的广告，并确保广告放置在适合您广告客户的内容附近。 详情请参考：[AdMob文档](https://support.google.com/admob/answer/11050896?hl=zh-Hans&visit_id=638180095957216940-1250837351&rd=1)

> **注意：**
>
> - 默认只可以传 1 个url。 多内容网址(multi-content url)支持到最多4个，您需要向AdMob提出申请
> - 支持的广告类型：所有广告样式
> - 支持的版本：v6.2.65及以上

---

## 2. 示例代码

### 2.1 添加内容映射网址

java
复制代码

```
// 支持传入1-4个 URL
Map<String, Object> localExtra = new HashMap<>();
ArrayList<String> urls = new ArrayList<String>();
urls.add("https://www.example1.com");
urls.add("https://www.example2.com");
urls.add("https://www.example3.com");
urls.add("https://www.example4.com");
localExtra.put(AdmobATConst.CONTENT_URLS,urls);

//以Native原生广告作为示例,请求广告前调用setLocalExtra传入内容映射URLS
mNative.setLocalExtra(localExtra);

//请求广告
mNative.makeAdRequest();
```

> **注意：** 传入的内容映射网址会一直生效，您不需要每次请求的时候都传入相同的url。 如果需要更换，再次传入新内容即可。

### 2.2 取消内容映射网址

如果需要取消内容映射网址，再次传入空urls即可。

java
复制代码

```
// 传入一个空urls
Map<String, Object> localExtra = new HashMap<>();
ArrayList<String> urls = new ArrayList<String>();
localExtra.put(AdmobATConst.CONTENT_URLS,urls);

//以Native原生广告作为示例,请求广告前调用setLocalExtra传入内容映射URLS
mNative.setLocalExtra(localExtra);

//请求广告
mNative.makeAdRequest();
```
