---
title: "Unity"
source: "https://help.toponad.net/cn/docs/Unity-8xiG"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "常见问题", "Unity"]
content_sha256: "3ab0bb020a91aea208320e9da0b9face7accbe500a4db15a41adf6929d84adee"
knowledge_role: "reference_only"
has_article_body: true
---

# Unity

## ● 插屏广告

#### ● 展示广告过程中按home键退到后台，再点击应用logo回来，广告不见了或者没有回调

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

## ● 其他

#### ● 编译时报错 "unity cannot use '@try' with Objective-C exceptions disabled"

**答：** 解决方法如下：

1. 打开 Unity 工程，选择 `Target(UnityFramework)`。
2. 进入 `Build Settings`。
3. 找到 `Apple Clang - Language - Objective-C`。
4. 将 `Enable Objective-C Exceptions` 设置为 `YES`。

#### ● 接入 Unity SDK 后，应用运行时崩溃，报错"Library not loaded: @rpath/XX.framework/XXX"

**答：** 您可以通过以下两个步骤来解决这个问题：

1. 打开 `Target`，进入 `Build Settings`。

   - 找到 `Runpath Search Paths`，并添加 `@executable_path/Frameworks`。
2. 检查项目中的 `Podfile` 文件：

   - 确认文件中是否包含 `use_frameworks!`。
   - 如果有，请将其移除后，重新执行 `pod install`。

#### ● 原生信息流广告，同一个广告位调用 `show` 方法两次，为什么只出现一个原生广告？

**答：** Unity 项目不支持在同一界面上展示两个或多个相同广告位的原生信息流广告。因此，即使调用 `show` 方法多次，也只有一个广告会被显示。
