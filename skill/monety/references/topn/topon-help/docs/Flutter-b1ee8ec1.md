---
title: "Flutter"
source: "https://help.toponad.net/cn/docs/Flutter"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "常见问题", "Flutter"]
content_sha256: "e34c6686633db69841c2867cfcbc06f955a5ac9d5d1f6af2c44d8eef64ea5983"
knowledge_role: "reference_only"
has_article_body: true
---

# Flutter

### ● 报错找不到SDK

一般是引入libs路径错误如下：



正确路径为 **api fileTree(dir: '../../plugins/anythink\_sdk/android/libs', include: ['\*.aar', '\*.jar'])**

### ● flutter高版本flutter.jar路径不对

1 local.properties中flutter.sdk改成自己路径

2新建libs compile 添加flutter.jar

3 依赖libs compile/flutter.jar (compileOnly fileTree(dir: libs compile , include: ['\*.jar'])

compileOnly fileTree(dir: libs , include: ['\*.aar','\*.jar'])



