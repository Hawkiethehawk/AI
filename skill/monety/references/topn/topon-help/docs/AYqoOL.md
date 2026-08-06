---
title: "导入和配置"
source: "https://help.toponad.net/cn/docs/AYqoOL"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-04-13"
category_path: ["TopOn SDK接入指南", "Flutter接入指南", "导入和配置"]
content_sha256: "62551e5a95d15e23bd769ffc974ef18ba389ee4a70be242d56b6a381b642bb03"
knowledge_role: "reference_only"
has_article_body: true
---

# 导入和配置

## 1. 概述

**Flutter版本要求**: `flutter: ">=2.12.0"`

iOS SDK 版本要求

| Flutter SDK Version | iOS SDK Version |
| --- | --- |
| <= 1.0.8 | 6.4.93 |
| >=1.0.9 | 6.5.34、6.5.43 |

## 2. 账号及相关ID准备

您可以可通过[账号及相关ID准备](/cn/docs/pzi00q)进行账号注册及登录的操作指引。

## 3. 导入Flutter SDK

参考Demo [Flutter Demo Github地址（点击跳转）](https://github.com/toponteam/TPN-Flutter-Demo.git)

支持以下两种方式导入SDK :

### **3.1 从pub.dev导入**

1. 在终端命令行中运行以下命令：（参考）

java
复制代码

```
flutter pub add secmtp_sdk
```

运行命令后，将在项目工程的pubspec.yaml中，自动添加以下代码并触发flutter pub get，您也可以手动在pubspec.yaml输入以下代码：

复制代码

```
dependencies:
  secmtp_sdk: ^1.0.8
```

2. 成功后即可引入以下头文件并使用：

复制代码

```
import 'package:secmtp_sdk/at_init.dart';
```

### **3.2 手动导入**

1. [下载TopOn\_Flutter\_SDK压缩包](https://portal.toponad.com/m/sdk/download)，解压缩。

2. 将解压出的文件添加进您的工程，您也可以将解压出的文件导入新建的目录中。

3. 在工程中找到pubspec.yaml，添加本地依赖：

复制代码

```
secmtp_sdk:
  path: ../
```

4. 在类中引入头文件:

复制代码

```
import 'package:secmtp_sdk/at_init.dart';
```

1. 在终端命令行中运行以下命令：（参考）

java
复制代码

```
flutter pub add thinkup_sdk
```

运行命令后，将在项目工程的pubspec.yaml中，自动添加以下代码并触发flutter pub get，您也可以手动在pubspec.yaml输入以下代码：

复制代码

```
dependencies:
  thinkup_sdk: ^1.0.8
```

2. 成功后即可引入以下头文件并使用：

复制代码

```
import 'package:thinkup_sdk/at_init.dart';
```

### **3.2 手动导入**

1. [下载TopOn\_Flutter\_SDK压缩包](https://portal.toponad.com/m/sdk/download)，解压缩。

2. 将解压出的文件添加进您的工程，您也可以将解压出的文件导入新建的目录中。

3. 在工程中找到pubspec.yaml，添加本地依赖：

复制代码

```
thinkup_sdk:
  path: ../
```

4. 在类中引入头文件:

复制代码

```
import 'package:thinkup_sdk/at_init.dart';
```

## 4. 导入iOS SDK

### 4.1 前提准备

- 最新版本的Xcode
- 已安装 CocoaPods 1.15.2 或以上版本

### 4.2 找到正确的anythink\_sdk.podspec文件

> 温馨提示：因不同开发者之间在SDK 下载中心下载的 flutter 插件存在命名差异，**anythink\_sdk.podspec**也可能是**thinkup\_sdk.podspec**，具体以您下载的插件为准。

- **若您使用pub.dev引入Flutter SDK**

1. 引入头文件，将鼠标放在引入的头文件上： 
2. 复制红框地址，使用Finder打开就能找到anythink\_sdk.podspec的位置（或上述温馨提示中所描述的**thinkup\_sdk.podspec**）。

- **若您手动导入Flutter SDK**

目标文件为：您工程目录中的anythink\_sdk.podspec文件（或上述温馨提示中所描述的**thinkup\_sdk.podspec**）。

### 4.3 获取iOS SDK Cocoapods代码

请点击[这里](https://portal.toponad.com/m/sdk/download)前往SDK下载中心，勾选需要集成的平台，是否Cocoapods接入选择：是，然后点击生成接入代码。（以iOS 6.4.26为例，推荐使用**最新版本**的iOS SDK）



### 4.4 在正确的anythink\_sdk.podspec中添加iOS SDK依赖

将上一步生成的CocoaPods引用代码转换为.podspec文件所需要的代码后，填入anythink\_sdk.podspec中，转换前后示例：

复制代码

```
//转换前：
pod 'TPNiOS','x.x.xx'
pod 'TPNPangleSDKAdapter','x.x.xx'
pod 'TPNFacebookSDKAdapter','x.x.xx'
pod 'TPNAdmobSDKAdapter','x.x.xx'
pod 'TPNMintegralSDKAdapter','x.x.xx'

仅需将pod替换为s.dependency

//转换后：
s.dependency 'TPNiOS','x.x.xx'
s.dependency 'TPNPangleSDKAdapter','x.x.xx'
s.dependency 'TPNFacebookSDKAdapter','x.x.xx'
s.dependency 'TPNAdmobSDKAdapter','x.x.xx'
s.dependency 'TPNMintegralSDKAdapter','x.x.xx'
```

### 4.5 安装iOS SDK

在编写完**anythink\_sdk.podspec**后，使用终端打开iOS podfile所在目录，等待安装完毕。(如非首次操作，可能需要删除**podfile.lock** 后再执行下方命令)

复制代码

```
pod install --repo-update
```



## 5. 配置iOS工程

### 5.1 更新Info.plist

#### 5.1.1 打开Info.plist



#### 5.1.2 添加SKAdNetworkItems键

> UnityAds的SKAdNetwork ID每个项目均不相同，若您选择了该广告平台，请以UnityAds后台生成为准，需要您前往UnityAds管理后台查看。

请您回到上文中打开的"SDK下载中心"网页，将"SKAdNetwork IDs代码"栏目中所列出的内容添加至您的Info.plist文件中，请参考下图:



#### 5.1.3 添加LSApplicationQueriesSchemes键

请您再次回到上文中打开的"SDK下载中心"网页，或直接复制下方代码，将如下栏目中所列出的内容添加至您的Info.plist文件中，请参考下图:



#### 5.1.4 **添加NSUserTrackingUsageDescription键**

> 从iOS14.5开始，只有在获得用户明确许可的前提下，应用才可以访问用户的IDFA数据并向用户投放定向广告。
>
> 在应用程序调用 [App Tracking Transparency](https://developer.apple.com/documentation/apptrackingtransparency?language=objc) 框架向最终用户提出应用程序跟踪授权请求之前，IDFA将不可用。如果某个应用未提出此请求，则读取到的IDFA将返回全为0的字符串。

复制代码

```
<key>NSUserTrackingUsageDescription</key>
<string>此处修改为您希望用户看到的权限请求描述，可本地化</string>
```

#### 5.1.5 添加NSAppTransportSecurity键

> iOS10之后，Allow Arbitrary Loads in Web Content键存在时会忽略Allow Arbitrary Loads的设置

复制代码

```
<key>NSAppTransportSecurity</key>
<dict>
	<key>NSAllowsArbitraryLoads</key>
	<true></true>
</dict>
```

#### 5.1.6 AdMob平台添加**GADApplicationIdentifier键(可选)**

> 若您勾选使用了Admob平台才添加该键。关于更多信息，请前往[此处](https://support.google.com/admob/answer/7356431?hl=zh-Hans)。

复制代码

```
<key>GADApplicationIdentifier</key>
<string>Your GADApplicationIdentifier </string>
<!-- 上述值格式例如：ca-app-pub-9488501426181082~7319780494   -->
```

### 5.2 设置-ObjC



## 6. 导入Android SDK

### 6.1 注册插件

在生成的Android工程中的GeneratedPluginRegistrant类中注册SDK插件:

复制代码

```
public final class GeneratedPluginRegistrant {
  public static void registerWith(@NonNull FlutterEngine flutterEngine) {
    flutterEngine.getPlugins().add(new com.secmtp.flutter.SecmtpSdkPlugin());
  }
}
```

### 6.2 下载并导入Android原生SDK（需使用v6.5.12及以上版本）

1. 请至[官网下载页面](https://portal.toponad.com/m/sdk/download)，勾选需要集成的平台，点击下载；下载完成后，解压下载所得的Android SDK压缩包。
2. （如果压缩包中有build.gradle文件存在时）将压缩包中的build.gradle中的内容复制到工程build.gradle中。
3. （如果压缩包中有res目录且res目录中有文件时）将Android SDK压缩包中res目录中的内容对应复制到工程的res目录中。

## 7. 安卓工程配置

### 7.1 AndroidManifest配置

1. 将Android SDK压缩包中的AndroidManifest.xml中的内容添加到工程中的AndroidManifest.xml里
2. 如果聚合了Admob，则必须在AndroidManifest.xml中添加以下配置（value值需配置Admob后台创建的应用的ID）：

复制代码

```
<manifest>
    <application>
        <!-- Sample AdMob App ID: ca-app-pub-3940256099942544~3347511713 -->
        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"></meta-data>
    </application>
</manifest>
```

详情可参考Admob配置文档：[更新您的 AndroidManifest.xml](https://developers.google.com/admob/android/quick-start#update_your_androidmanifestxml)

### 7.2 Android9及以上适配

请参考：[Android 集成与初始化](/cn/docs/ji-cheng-rnnt)

### 7.3 SDK混淆配置说明

1. Flutter SDK混淆配置

java
复制代码

```
-keep public class com.secmtp.flutter.**
-keepclassmembers class com.secmtp.flutter.** {
   public *;
}
```

java
复制代码

```
-keep public class com.thinkup.flutter.**
-keepclassmembers class com.thinkup.flutter.** {
   public *;
}
```

2. Android SDK广告平台混淆配置

请参考：Android SDK压缩包中的**proguard-android.txt**内容
