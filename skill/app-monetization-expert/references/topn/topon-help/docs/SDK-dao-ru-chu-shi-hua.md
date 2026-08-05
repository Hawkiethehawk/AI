---
title: "SDK导入&初始化"
source: "https://help.toponad.net/cn/docs/SDK-dao-ru-chu-shi-hua"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-08"
category_path: ["TopOn SDK接入指南", "Cocos Creator接入指南", "SDK导入&初始化"]
content_sha256: "2e5df6ef3511e4c6cb804b9be2a6e4c7cafd5f4309099f1507d159cbde56d6f5"
knowledge_role: "reference_only"
has_article_body: true
---

# SDK导入&初始化

## **1.** SDK下载

您可以从[TopOn SDK下载平台](https://portal.toponad.com/m/sdk/download)获取。



## **2**. SDK导入

> ⚠️注意：**CocosCreator SDK 需搭配Android或者iOS的 SDK进行使用**

**下载得到的压缩包目录说明：**

| 文件夹 | 描述 |
| --- | --- |
| Android | 集成Android平台需要的SDK包 |
| iOS | 集成iOS平台需要的SDK包 |
| Android\_iOS | 集成Android+iOS平台需要的SDK包 |

**平台目录的说明：**

| 文件夹／文件名 | 描述 |
| --- | --- |
| Scipt | Cocos Creator项目中需要引入的TS代码文件 |
| bridge/iOS | Xcode工程的bridge代码文件，需要引入到您游戏的Xcode工程 |
| bridge/Andorid | Android Studio工程bridge代码文件，分别提供了bridge的源码（source目录）以及aar包（library目录），可按需要选择使用在您游戏的Android工程 |

###

### 2.1 Android导入说明

(1).在SDK的压缩包里选择Android平台下的`*_cocosjs_bridge.aar`包放到项目工程`libs`目录下，并通过`build.gradle`进行引入

复制代码

```
dependencies {
    api fileTree(include: ['*.jar','*.aar'], dir: 'libs')
}
```

也可选择源码的方式，将源码放置在项目的`src/main/java`目录下，此时需要额外配置混淆规则：

复制代码

```
-keep public class com.**.cocosjs.**
-keepclassmembers class com.**.cocosjs.** {
   public *;
}
```

(2).请前往[TopOn SDK下载中心](https://portal.toponad.com/m/sdk/download?type=Android)，具体引入说明可参考[Android接入指南](/cn/docs/ji-cheng-rnnt)

###

### 2.2 iOS导入说明

(1).把`iOSCocosCreatorBridge`文件夹拖到Xcode左边的文件列表中，在弹出的对话框中作如下选择（如图所示）：

- Destination选项勾选Copy items if needed
- Added Folders选项勾选Create groups
- Add to targets勾选需要添加的target



(2).请前往[TopOn SDK下载中心](https://portal.toponad.com/m/sdk/download?type=iOS)，具体引入说明可参考[iOS 接入指南](/cn/docs/ji-cheng)

## **3**. SDK初始化

复制代码

```
import {ATSDK} from "db://assets/script/AnyThinkAds/ATSDK";

// ---------------使用 GDPR 初始化流程 start------------------------------
/*ATSDK.getUserLocation(function (userLocation: string | number) {
    if (userLocation === ATSDK.kATUserLocationInEU) {
        if (ATSDK.getGDPRLevel() === ATSDK.UNKNOWN) {
            ATSDK.showGDPRConsent(function () {
                ATSDK.initSDK("your app id", "your app key");
            });
        }
    }
});*/
// ---------------使用 GDPR 初始化流程 end------------------------------

ATSDK.initSDK("your app id", "your app key");
```
