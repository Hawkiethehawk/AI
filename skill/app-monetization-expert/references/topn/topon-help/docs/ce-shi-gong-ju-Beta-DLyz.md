---
title: "DebugUI 调试工具"
source: "https://help.toponad.net/cn/docs/ce-shi-gong-ju-Beta-DLyz"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-05-09"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "集成测试", "DebugUI 调试工具"]
content_sha256: "bc8460fdece61036d911247beda03eff510e249e3099594169c2f78ec149351c"
knowledge_role: "reference_only"
has_article_body: true
---

# DebugUI 调试工具

> 您可以使用DebugUI验证TopOn iOS SDK的接入情况，以及在您的项目中测试各广告平台功能，但DebugUI不能测试您App自身的广告逻辑。
>
> **温馨提示：自定义广告平台**仅支持线上广告位测试功能，其他功能不支持。

# 更新说明

| SDK版本 | DebugUI版本号 |
| --- | --- |
| v6.4.93、v6.5.34 | 1.0.6 |
| v6.5.40及其以上版本 | 1.0.7 |
| v6.5.60及其以上版本 | 1.0.8 |

## 1. 前提环境

- 您的项目中已经导入并可以成功使用TopOn iOS SDK
- 安装了Cocoapods
- SDK 版本与 DebugUI版本对应（请查看更新说明）

## 2. 导入TopOn iOS DebugUI

请您根据已集成的TopOn iOS SDK版本来选择在您的podfile中添加不同的信息：

ruby
复制代码

```
pod 'TPNDebugUISDK','x.x.x'
```

添加完毕后，请执行 `pod install --repo-update`

## 3. 在项目中启用TopOn iOS DebugUI

### 3.1 在TopOn后台获取Debug Key

获取步骤是 `登录TopOn后台` -> `帐号管理` -> `Key` -> `SDK Debug Key`

### 3.2 获取IDFA

IDFA弹窗请选择允许，DebugUI需要代码获取到IDFA信息才能正常使用，若您不清楚如何获取IDFA，请您[参考这里](/cn/docs/ji-cheng#4._%E5%90%91%E7%94%A8%E6%88%B7%E8%AF%B7%E6%B1%82%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E8%B7%9F%E8%B8%AA%E6%9D%83%E9%99%90%E4%BB%A5%E8%8E%B7%E5%8F%96IDFA)。

#### 3.2.1 如何验证SDK能够正常成功获取到IDFA

开启SDK日志开关，日志搜索IDFA，在初始化SDK后，ATAdLog有打印出IDFA即算成功。



### 3.3 显示 DebugUI

> 在您调用DebugUI显示API之前，您需要确保：
>
> - iOS SDK已经成功[初始化](/cn/docs/ji-cheng#7._%E5%88%9D%E5%A7%8B%E5%8C%96SDK)
> - 不会触发加载广告(load)的逻辑
> - ATAdLog有打印出IDFA
> - 关闭[调试模式](/cn/docs/ru-he-ce-shi-guang-gao-rKsm#2.2_%E4%BD%BF%E7%94%A8%E8%B0%83%E8%AF%95%E6%A8%A1%E5%BC%8F%E8%BF%9B%E8%A1%8C%E5%8F%97%E9%99%90%E7%9A%84%E5%B9%BF%E5%91%8A%E6%B5%81%E7%A8%8B%E6%B5%8B%E8%AF%95)

> 在您App上线打包之前，请将DebugUI相关代码**删除**。

在您的**AppDelegate**或**首视图控制器**中，填写DebugKey并用以下API来显示DebugUI :

objc
复制代码

```
//导入头文件
#import <AnyThinkDebuggerUISDK/ATDebuggerAPI.h>

//调用，请注意push方式需要有导航控制器，控制器对象参数不要继承重写一些方法，如果参数正确且IDFA正常被SDK获取还未显示，可用GCD延时2秒调用以下API
[[ATDebuggerAPI sharedInstance] showDebuggerInViewController:self showType:ATShowDebugUIPush debugkey:@"Your Debug Key"];

或

//延时两秒再展示示例
dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    [[ATDebuggerAPI sharedInstance] showDebuggerInViewController:self showType:ATShowDebugUIPush debugkey:@"Your Debug Key"];
});
```

## 4. DebugUI 功能介绍

> DebugUI支持长按复制信息和当前页面数据分享。

### 4.1 查看基础信息



### 4.2 查看TopOn SDK 设置



### 4.3 集成检测



### 4.4 调试模式测试

> - **调试海外广告平台时，您可能需要使用代理网络，其中InMobi建议代理到东南亚地区，印度最佳，Pangle代理到非美国区域。其他海外平台加载广告可以尝试代理到平台所在国家地区，提高广告的填充率。**
> - **调试模式下广告源并非百分百填充，例如Meta广告平台需要在测试手机安装了Facebook的应用，使用优质设备与代理网络，才能获得较低的填充概率。**
> - **调试模式原理是使用了TopOn预先配置的广告源，并非百分之百填充成功广告。**

① 您可以在以下页面勾选开关打开调试模式。



② 选择一个完成集成的广告平台进入**调试模式**。



③ 选择广告平台的广告样式进行测试操作



### 4.5 线上ID测试

> 线上ID测试功能，仅在iOS DebugUI 1.0.3及以上版本中可用。

#### 4.5.1 显示应用信息与广告位配置



#### 4.5.2 线上广告位测试

① 点击某一广告位进入广告位测试页面



② 进行线上广告位测试


