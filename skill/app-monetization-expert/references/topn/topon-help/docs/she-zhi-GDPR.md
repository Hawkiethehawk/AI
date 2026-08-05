---
title: "海外隐私配置"
source: "https://help.toponad.net/cn/docs/she-zhi-GDPR"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "政策合规", "海外隐私配置"]
content_sha256: "4f4c4693a8429df0fa6ac32ec036b665e126c12266ac738890d9fce62365fc5e"
knowledge_role: "reference_only"
has_article_body: true
---

# 海外隐私配置

> 关于使用Pangle SDK的额外配置说明
>
> Pangle SDK 在v7.1+ 移除了 COPPA及CCPA设置，统一使用 PAConsent 。TopOn SDK 在 v6.4.56 及以上版本中增加了对应的API来方便您根据情况自行设置。
>
> 注：未设置时 Pangle SDK 默认状态为 Consent。

复制代码

```
#import <AnyThinkPangleAdapter/AnyThinkPangleAdapter.h>

typedef NS_ENUM(NSInteger, ATPAGPAConsentType) {
    ATPAGPAConsentTypeConsent     =  0,   ///< User has granted the consent
    ATPAGPAConsentTypeNoConsent   =  1,   ///< User doesn't grant consent
};

+ (void)setPAGPAConsentType:(ATPAGPAConsentType)consentType;

示例代码
//填充广告
[ATPangleConfigure setPAGPAConsentType:ATPAGPAConsentTypeConsent];

//不填充广告
[ATPangleConfigure setPAGPAConsentType:ATPAGPAConsentTypeNoConsent];
```

## ● GDPR

> 欧盟发布的《**通用数据保护条例**》(GDPR)于 2018 年 5 月 25 日生效。 为支持GDPR协议，我们更新了隐私政策，请开发者从我们官网了解 [***Privacy Policy***](/cn/docs/ByIf1V)的相关内容。同时，为保障用户的数据隐私安全，TopOn iOS SDK加入了数据保护功能，请您参考以下内容了解如何配置。

### 1.使用TopOn提供的弹窗


> - present方式，请勿在此时present您的窗口
> - 若不传入ViewController参数，默认会自动获取并显示。
> - 使用以下代码前**须移除**其他位置的ATT申请代码，请不要在 `- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions` 中使用，因为苹果要求在
>
>   `applicationDidBecomeActive` 后之后调用ATT申请。

以上效果接入代码示例如下：

复制代码

```
//导入头文件
#import <AnyThinkSDK/ATAPI.h>
#import <AppTrackingTransparency/AppTrackingTransparency.h>

- (void)initFlow {

    [[ATAPI sharedInstance] showGDPRConsentDialogInViewController:[UIApplication sharedApplication].keyWindow.rootViewController dismissalCallback:^{
        // 这里示例在用户同意，或者数据同意未知情况下的非首次启动申请ATT权限，您可以根据应用实际情况进行调整。
        if (([ATAPI sharedInstance].dataConsentSet == ATDataConsentSetUnknown && ([[NSUserDefaults standardUserDefaults] boolForKey:@"GDPR_First_Flag"] == YES))

            || [ATAPI sharedInstance].dataConsentSet == ATDataConsentSetPersonalized) {

            if (@available(iOS 14, *)) {
                [ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(ATTrackingManagerAuthorizationStatus status) {

                }];
            }
        }

        //初始化SDK
        [[ATAPI sharedInstance] startWithAppID:kTakuAppID appKey:kTakuAppKey error:nil];

        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"GDPR_First_Flag"];
    }];

    //......其他代码
}
```

### 2. 使用自有逻辑让用户选择，并通知TopOn DataConsent等级

在用户选择后，通过以下方法来给TopOn设置GDPR级别，其中consentString参数是为Flurry预留的。我们提供了三个级别的数据保护：

复制代码

```
typedef NS_ENUM(NSInteger, ATDataConsentSet) {
    /*
    这是默认值，当开发者未设置时采用此值；这种情况下，如果用户在GDPR区域内，SDK初始化将失败，
    后续广告请求也会因为失败。不能用setDataConsentSet方法设置该类型
    */
    ATDataConsentSetUnknown = 0,
    /*
    这个级别代表用户同意SDK收集并使用他的个人数据来为他提供相关性更高、更适合他的广告。
    */
    ATDataConsentSetPersonalized = 1,
    /*
    如果数据保护级别设置为这个值，SDK不会收集用户个人数据，因为提供的广告可能不会符合用户的情况。
    另外，在这种情况下，某些不涉及用户隐私的数据可能仍会被收集。
    */
    ATDataConsentSetNonpersonalized = 2
};

//用户根据您的逻辑选择完毕后，您可以调用如下API来设置
[[ATAPI sharedInstance] setDataConsentSet:ATDataConsentSetUnknown consentString:[NSDictionary dictionary]];
```

## ● CCPA

> [加州消费者隐私法案 (CCPA)](https://oag.ca.gov/privacy/ccpa) 向加州消费者提供各种各样的隐私权利。 受到 CCPA 管制的企业将对这些消费者履行多项义务，包括信息披露、与欧盟一般数据保护条例 (GDPR) 类似的消费者权利、“选择退出”特定数据传输的权利，以及“选择加入”未成年人要求的权利。

请在[TopOn后台-应用](https://app.toponad.com/m/app) 页面，然后单击“**编辑**”按钮进行CCPA的设置，如下图所示：



## ● COPPA

> [美国儿童在线隐私权保护法(COPPA)](https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy)主要针对在线收集 13 岁以下儿童个人信息的行为。根据[COPPA常见问题解答](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)，开发者有责任确定其应用是否针对13岁以下儿童并考虑包括但不限于下述因素：“应用的主题、视觉内容、使用动画角色或面向儿童的活动和激励措施、音乐或其他音频内容、模特年龄、儿童名人或吸引儿童的名人的存在、 网站或在线服务的语言或其他特征，以及推广或出现在网站或在线服务上的广告是否针对儿童“。

1. 请在[TopOn后台-应用](https://app.toponad.com/m/app) 页面，然后单击“**编辑**”按钮进行COPPA的设置，如下图所示：



2. 在**初始化SDK之前**通过如下方式传入`用户的年龄`

> - ⚠️当传入的用户的年龄为***13周岁以下***，将会遵守COPPA的相关规定。
> - 获取用户年龄的逻辑由您自己应用实现，例如弹窗等。

复制代码

```
[ATAPI sharedInstance].customData = @{kATCustomDataAgeKey:@"用户的年龄"};
```
