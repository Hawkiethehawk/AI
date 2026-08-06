---
title: "集成"
source: "https://help.toponad.net/cn/docs/ji-cheng"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-26"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "集成"]
content_sha256: "9954738dbc2aa97aeb27ce9821d571c53c47530c32f0185059aa645c3dac7b55"
knowledge_role: "reference_only"
has_article_body: true
---

# 集成

## 1. 前提准备

- 最新版本的Xcode
- [注册并登录](https://portal.toponad.com/m/login)TopOn账号并在[应用管理](https://portal.toponad.com/m/app)中添加应用
- 下载[Demo工程](https://github.com/toponteam/TopOn-iOS-Pod-Demo)

> 您可以前往[AppStore](https://developer.apple.com/xcode/)中下载或更新Xcode，也可以登录[苹果开发者资源中心](https://developer.apple.com/download/all/?q=Xcode)进行指定版本的下载。。

## 2. 导入 SDK 至项目工程

我们提供如下两种方式导入SDK :

- CocoaPods（首选）
- 手动下载并导入

> 要将 SDK 导入 iOS 项目，最简单的方法是使用 CocoaPods。如果您刚开始接触 CocoaPods，请参阅[CocoaPods官方网站。](https://guides.cocoapods.org/using/using-cocoapods)

### 2.1 CocoaPods (首选）

请点击[这里](https://portal.toponad.com/m/sdk/download)前往SDK下载中心，您可以参考以下图片步骤，按照您的需求选择并生成Podfile中的代码。

> 请您在生成完毕相关代码后不要离开SDK下载中心网页，后续对接流程还会使用其中的内容。




> 切换至podfile所在路径后，在终端执行`pod install --repo-update`执行安装

### 2.2 手动下载并导入

#### 2.2.1 手动下载SDK

请点击[这里](https://portal.toponad.com/m/sdk/download)前往SDK下载中心，您可以参考以下示例图片，按照您的需求选择广告平台然后下载 SDK。

> - 请您在下载完毕SDK后不要离开SDK下载中心网页，后续对接流程还会使用其中的内容。
> - 在您点击”生成接入代码“后，系统将立即处理您的请求，在您的耐心等待后，下载链接将成功生成，并可点击”下载“按钮。





#### 2.2.2 手动导入TopOn iOS SDK

① 请将您在上一步中下载好的ZIP文件进行解压缩，之后将它们拖入您的Xcode项目工程中。

② Xcode工程Build Setting修改（请参考下图操作）。



③ 请回到SDK下载中心网页，查看"SDK引入提示"栏目，将栏目中列出的依赖项在Xcode工程中进行添加。

> 根据您勾选的广告平台的种类差异，可能会额外出现"SDK引入提示"栏目（如下图），若您勾选完毕广告平台，并点击"生成接入代码"后，未出现"SDK引入提示"栏目，则您可跳过此步骤，继续进行后续接入流程。




> 至此，您已经完成TopOn iOS SDK的引入，但请您不要离开"SDK下载中心"网页，后续对接流程还会使用其中的内容。

## 3. 更新您的Info.plist

### 3.1 打开Info.plist



### 3.2 添加SKAdNetworkItems键

> UnityAds的SKAdNetwork ID每个项目均不相同，若您选择了该广告平台，请以UnityAds后台生成为准，需要您前往UnityAds管理后台查看。

请您回到上文中打开的"SDK下载中心"网页，将"SKAdNetwork IDs代码"栏目中所列出的内容添加至您的Info.plist文件中，请参考下图:



### 3.3 添加LSApplicationQueriesSchemes键

请您再次回到上文中打开的"SDK下载中心"网页，或直接复制下方代码，将如下栏目中所列出的内容添加至您的Info.plist文件中，请参考下图:



### 3.4 **添加NSUserTrackingUsageDescription键**

> - 从iOS14.5开始，只有在获得用户明确许可的前提下，应用才可以访问用户的IDFA数据并向用户投放定向广告。
> - 在应用程序调用 [App Tracking Transparency](https://developer.apple.com/documentation/apptrackingtransparency?language=objc) 框架向最终用户提出应用程序跟踪授权请求之前，IDFA将不可用。如果某个应用未提出此请求，则读取到的IDFA将返回全为0的字符串。

markup
复制代码

```
<key>NSUserTrackingUsageDescription</key>
<string>此处修改为您希望用户看到的权限请求描述，可本地化</string>
```

### 3.5 添加NSAppTransportSecurity键

markup
复制代码

```
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

### 3.6 AdMob平台添加**GADApplicationIdentifier键**

> 因AdMob要求，若您勾选使用了该平台才添加该键。关于更多信息，请前往[此处](https://support.google.com/admob/answer/7356431?hl=zh-Hans)。

markup
复制代码

```
<key>GADApplicationIdentifier</key>
<string>Your GADApplicationIdentifier </string>
<!-- 上述值格式例如：ca-app-pub-9438501426181082~7319780494 -->
```

## 4. 向用户请求应用程序跟踪权限以获取IDFA

您需要通过App Tracking Transparency来向用户申请获取应用程序跟踪权限。

> - 在您使用下面的方法之前，您需要在Info.plist文件中设置NSUserTrackingUsageDescription键值。[点击此处](/cn/docs/ji-cheng#3.4_%E6%B7%BB%E5%8A%A0NSUserTrackingUsageDescription%E9%94%AE)查看详情。
> - 如果您项目中需要适配GDPR或谷歌UMP，[请前往这里](/cn/docs/Google-UMP-shi-pei-shi-yong-zhi-nan-fMgm)进行配置，无需添加以下代码。

objc
复制代码

```
//导入头文件
#import <AppTrackingTransparency/AppTrackingTransparency.h>
#import <AdSupport/AdSupport.h>
#import <AnyThinkSDK/AnyThinkSDK.h>

//若使用AppDelegate
@implementation AppDelegate

- (void)applicationDidBecomeActive:(UIApplication *)application {
    if (@available(iOS 14, *)) {
        //iOS 14
        [ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(ATTrackingManagerAuthorizationStatus status) {

        }];
    } else {
        // 可以直接获取
        NSString * idfaStr = [ASIdentifierManager sharedManager].advertisingIdentifier.UUIDString;
    }
}

@end
```

> 在iOS 15及以上版本时，只有在应用程序状态为`UIApplicationStateActive`时，调用此API才会提示授权。如果另一个权限请求正在等待用户确认，则不会显示授权提示。

## 5. 开启调试日志

objc
复制代码

```
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

    //....
    //开启日志
    [ATAPI setLogEnabled:YES];//Turn on debug logs
    //....

    return YES;
}
```

## 6. SDK集成验证

您可以根据本方法输出的日志，检查各个广告平台的SDK集成是否正常。

> 请注意，上架包需要移除掉本功能。

objc
复制代码

```
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

    //....
    //开启日志
    [ATAPI setLogEnabled:YES];//Turn on debug logs

    //开启日志后，调用检查集成情况方法
    [ATAPI integrationChecking];

    return YES;
}
```

输出示例：



## 7. 初始化SDK

> 1. 如果您的应用有在`欧盟地区`投放，请您在`初始化前`进行[GDPR配置](/cn/docs/she-zhi-GDPR)。如果您选择了`Admob平台`，那么在`欧盟地区`投放需要设置[Google UMP](/cn/docs/Google-UMP-shi-pei-shi-yong-zhi-nan-fMgm)，设置Google UMP后不用额外进行GDPR配置
>
> 2. 如果您的应用需要在用户首次启动应用时展示隐私政策并请求用户同意，请参考[TopOn隐私政策](/cn/docs/1Mn1B7)与[隐私合规](/cn/docs/ByIf1V)

objc
复制代码

```
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

    // 初始化SDK
    [[ATAPI sharedInstance] startWithAppID:@"Your AppID" appKey:@"Your appKey" error:nil];

    return YES;
}
```
