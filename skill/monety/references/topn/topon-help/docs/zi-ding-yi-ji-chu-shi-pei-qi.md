---
title: "自定义基础适配器"
source: "https://help.toponad.net/cn/docs/zi-ding-yi-ji-chu-shi-pei-qi"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-01-05"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "自定义广告平台", "自定义广告平台 SDK 版本 >= 6.4.94", "自定义基础适配器"]
content_sha256: "5312f021ede3dc02915a6bece148d70e77b47b2374b3392f8386759bb380f0c8"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义基础适配器

# 自定义基础适配器

本文基于Demo中 `DemoCustomBaseAdapter` 示例代码，详细介绍如何创建自定义基础适配器。这个适配器的功能主要是来初始化第三方广告平台SDK，并返回其版本号信息。

> **💡 Tips**
>
> - 类名可以自定义，基础适配器与初始化适配器的类名不需要添加至后台
> - 建议将基础适配器和初始化适配器放在同一个模块中便于管理
> - 初始化适配器负责SDK初始化，基础适配器负责指定初始化适配器类名

## 1. 需要重写的方法

您需要继承 **ATBaseMediationAdapter** 和 **ATBaseInitAdapter** 并重写相关方法：

### 1.1 初始化适配器必要方法

| 方法 | 参数说明 | 作用 |
| --- | --- | --- |
| - (void)initWithInitArgument:(ATAdInitArgument \*)adInitArgument | adInitArgument: 包含服务器下发的初始化参数 | 用于初始化第三方广告平台SDK，设置相关参数 |
| - (nullable NSString \*)sdkVersion | ----- | 返回广告平台SDK的版本号 |
| - (nullable NSString \*)adapterVersion | ----- | 返回适配器版本号 |

### 1.2 基础适配器必要方法

| 方法 | 参数说明 | 作用 |
| --- | --- | --- |
| - (Class)initializeClassName | ----- | 返回初始化适配器的类名，用于指定初始化适配器 |

---

## 2. 推荐的文件结构

复制代码

```
├── Base/                           # 基础适配器模块
│   ├── DemoCustomAdapterCommonHeader.h    # 用于声明一些公共的头文件
│   ├── DemoCustomBaseAdapter.h            # 基础适配器头文件
│   ├── DemoCustomBaseAdapter.m            # 基础适配器实现，定义指定初始发适配器的类名
│   ├── DemoCustomInitAdapter.h            # 初始化适配器头文件
│   └── DemoCustomInitAdapter.m            # 初始化适配器实现
```

---

## 3. 实现步骤

### 步骤一：实现DemoCustomInitAdapter.h

> 1. 引入头文件`#import <AnyThinkSDK.h>`
> 2. 继承`ATBaseInitAdapter`
>
> 示例如下:
>
> objc
> 复制代码
>
> ```
> #import <Foundation/Foundation.h>
> #import "DemoCustomAdapterCommonHeader.h"
>
> @interface DemoCustomInitAdapter : ATBaseInitAdapter
>
> @end
> ```

### 步骤二：实现DemoCustomInitAdapter.m

> 实现以下方法:
>
> objc
> 复制代码
>
> ```
> /// Init Ad SDK
> /// - Parameter adInitArgument: server info
> - (void)initWithInitArgument:(ATAdInitArgument *)adInitArgument{
>     //从adInitArgument对象中拿取后台配置的信息，例如adInitArgument.serverContentDic[@"appId"]
>   //拿取到相关信息后，调用广告平台SDK的初始化方法进行初始化，您可以根据需要，在这里对广告平台的SDK进行设置，例如海外平台的隐私设置（如：CCPA，COPPA，GDPR）等。
>   //如果广告平台SDK初始化有返回值，使用[self notificationNetworkInitSuccess];通知我们初始化成功；
>   //如果第三方初始化失败，使用[self notificationNetworkInitFail:error];通知我们初始化失败。
>   //如果广告平台SDK初始化没有成功或者失败，可直接通知我们初始化成功，使用:[self notificationNetworkInitSuccess];
> }
>
> /// 返回广告平台SDK 的版本号
> - (nullable NSString *)sdkVersion {
>     //例如
>     return [YourAdSDK getVersion];
> }
>
> /// 返回适配器版本号
> - (nullable NSString *)adapterVersion {
>     return [YourAdapter getVersion];
> }
> ```

### 步骤三：实现DemoCustomBaseAdapter.h

> 1. 引入头文件`#import <AnyThinkSDK.h>`
> 2. 继承`ATBaseMediationAdapter`
>
> 示例如下：
>
> objc
> 复制代码
>
> ```
> @interface DemoCustomBaseAdapter : ATBaseMediationAdapter
>
> @end
> ```

### 步骤四：实现DemoCustomBaseAdapter.m

> 实现以下方法:
>
> objc
> 复制代码
>
> ```
> #pragma mark - adapter init class name define
> - (Class)initializeClassName {
>     //返回文档 步骤一 中创建的初始化适配器类
>     return [DemoCustomInitAdapter class];
> }
> ```

---

## 4. 其他设置

> ### 4.1 GDPR
>
> 获取您通过TopOn SDK`-[ATAPI setDataConsentSet:consentString:]`方法设置的数据同意级别
>
> objc
> 复制代码
>
> ```
> //typedef NS_ENUM(NSInteger, ATDataConsentSet) {
> //    /*
> //    这是默认值，当您未设置时采用此值；这种情况下，如果用户在GDPR区域内，SDK初始化将失败，
> //    后续广告请求也会因为失败。不能用setDataConsentSet方法设置该类型
> //    */
> //    ATDataConsentSetUnknown = 0,
> //    /*
> //    这个级别代表用户同意SDK收集并使用他的个人数据来为他提供相关性更高、更适合他的广告。
> //    */
> //    ATDataConsentSetPersonalized = 1,
> //    /*
> //    如果数据保护级别设置为这个值，SDK不会收集用户个人数据，因为提供的广告可能不会符合用户的情况。
> //    另外，在这种情况下，某些不涉及用户隐私的数据可能仍会被收集。
> //    */
> //    ATDataConsentSetNonpersonalized = 2
> //};
> // 引入头文件`#import <AnyThinkSDK.h>`
> //获取数据同意级别
> [ATAPI sharedInstance].dataConsentSet
> ```
>
> ### 4.2 COPPA
>
> 获取您通过TopOn SDK设置的用户年龄
> 开发者调用
> `[ATSDKGlobalSetting sharedManager].customData = @{kATCustomDataAgeKey:@"13",......};`
> 进行年龄设置后，您可以通过
> `[[ATSDKGlobalSetting sharedManager].customData valueForKey:kATCustomDataAgeKey]`
> 获取到开发者设置的用户年龄。
>
> ### 4.3 个性化广告
>
> 获取开发者通过TopOn SDK设置的个性化广告状态
> 开发者调用
> `[[ATAPI sharedInstance] setPersonalizedAdState:ATPersonalizedAdStateType]`
> 进行个性化广告状态设置后，您可以通过
> `[ATAPI sharedInstance].getPersonalizedAdState`
> 获取到开发者设置的个性化广告状态。
