---
title: "FAQ及错误码"
source: "https://help.toponad.net/cn/docs/kns0ei"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Flutter接入指南", "FAQ及错误码"]
content_sha256: "f73521c17bf365be3adc800915d87f4f6d06fa732b08413cb1cb9198782535d6"
knowledge_role: "reference_only"
has_article_body: true
---

# FAQ及错误码

TopOn SDK的错误码及FAQ指引请参考：

| 系统平台 | 说明 |
| --- | --- |
| TopOn Android SDK | [查看](/cn/docs/qYfOSS) |
| TopOn iOS SDK | [查看](/cn/docs/cuo-wu-ma-shuo-ming) |

**问：** 在pod install进行依赖三方库的时候，出现如图的错误，如何解决？



**答：** 从蓝色划线的部分得知该错误是链接静态库异常导致的，在我们下载资源文件 **anythink\_sdk.podspec** 中添加 **s.static\_framework = true ，** 如图所示



**问：** 如何使用模拟器来运行加载广告呢？

**答：** 正常情况下，我们不推荐使用模拟器进行加载广告的，因为广告的填充率变低，实在需要使用，我们推荐使用CocoaPods接入，然后在Xcode项目中的Podfile中添加代码配置：

复制代码

```
installer.pods_project.build_configurations.each do |config|
      config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"
    end
```



使用pod install重新更新依赖库，然后在TARGET —— Build Settings —— Excluded Architectures 配置 arm64



完成上述步骤，可以尝试使用模拟器运行，还有其他问题，请联系我们。
