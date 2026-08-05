---
title: "Cocos"
source: "https://help.toponad.net/cn/docs/Cocos"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "常见问题", "Cocos"]
content_sha256: "b0c18c3361b5535595b76946f77eb0080b459c40698410996b4f11abc3e13d73"
knowledge_role: "reference_only"
has_article_body: true
---

# Cocos

### ● 展示广告过程中按home键退到后台，再点击应用logo回来，广告不见了或者没有回调

检查应用的启动Activity的Manifest.xml配置，**launchMode需要是standard**。在启动Activity的onCreate()方法中添加如下代码：

复制代码

```
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    ......
    if ((getIntent().getFlags() & Intent.FLAG_ACTIVITY_BROUGHT_TO_FRONT) != 0) {
        finish();
        return;
    }
    ......
}
```

> **注意：** 需要导出Android工程进行处理

### ● 展示广告时，在最近任务列表中同个应用出现了多个进程，怎么解决？

将AndroidManifest.xml里的Application中的`android:taskAffinity`这一配置去掉
