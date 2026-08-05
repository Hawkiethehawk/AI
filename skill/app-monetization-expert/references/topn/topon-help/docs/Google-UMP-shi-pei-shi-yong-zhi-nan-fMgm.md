---
title: "Google UMP 适配使用指南"
source: "https://help.toponad.net/cn/docs/Google-UMP-shi-pei-shi-yong-zhi-nan-fMgm"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "政策合规", "Google UMP 适配使用指南"]
content_sha256: "b1a23c545a1904eb019dc4506d47a97d6f8797c33951dd30a20df201e89de41d"
knowledge_role: "reference_only"
has_article_body: true
---

# Google UMP 适配使用指南

## 背景

> 自 2024 年 1 月 16 日起，使用 Google AdSense、Ad Manager 或 AdMob 的发布商和开发者在面向欧洲经济区或英国的用户投放广告时，必须使用通过 Google 认证且已与 [IAB 的透明度和用户意见征求框架](https://iabeurope.eu/transparency-consent-framework/) (TCF) 相集成的意见征求管理平台 (CMP)。

您可以通过**TopOn提供的接口**来实现UMP流程，请参考以下步骤完整实现：

## **1**. 配置UMP

### 1.1 在Admob后台启用UMP

1. 访问[Admob后台](https://apps.admob.com/)登录Admob账号
   -[在 AdMob 中添加你的应用](https://support.google.com/admob/answer/9989980?sjid=7572347865551051335-NA)（如果您尚未添加应用）
2. 点击 **“隐私权和消息”**
3. 点击 **“欧洲法规-管理”**
4. 点击 **“创建消息”**，等待GDPR消息页面打开
5. 在GDPR消息页面中点击右上角 **“选择应用”**，选择您想要显示GDPR信息的应用
6. 选择您想要显示消息的语言
7. 在 **“定位”** 栏目中选择“须遵守 GDPR 的国家/地区（EEA 和 UK）”选项

以下配置可以提高用户同意GDPR概率

1. “用户选项-关闭（不同意）”选择关闭

   1. 样式调整，选择\*\*“样式“**栏目
      -按钮栏目下的**“次要颜色“**调整为白色（#ffffff）
      -按钮栏目下的**“次要字体颜色“\*\*调整为灰色（#6e6e6e）
2. 调整后整体效果如下图

   

最后点击右上角 **“发布”** 即可。

### 1.2 自行指定的广告合作伙伴

> 默认情况下，Google 可能不会在您的 GDPR 消息中显示您项目中集成的所有广告平台。 如果您未能包含这些广告平台，可能会对您的广告收入产生不利影响。 请按照本部分中的步骤操作，确保您项目中集成的所有广告平台都出现在 GDPR 消息中。

自定义 GDPR 消息中显示哪些广告合作伙伴：

1. 在Admob后台 **“隐私权和消息”** 中点击“GDPR设置”，打开GDPR设置
   
2. 点击\*\*“检查您的广告合作伙伴”\*\*部分下的编辑图标 ()
3. 参考下方表格，勾选您项目中集成的所有广告平台

   | Google Name | TopOn SDK Network |
   | --- | --- |
   | Facebook | `Meta` |
   | AppLovin Corp | `Applovin` |
   | ironSource Mobile | `IronSource` |
   | InMobi Choice | InMobi |
   | InMobi Choice | InMobi |
   | BIGOAds | `Bigo` |
   | Chartboost | Chartboost |
   | `UnityAds` | Unity Ads |
   | Ogury Ltd | Ogury |
   | `AdColony` | `AdColony` |
   | Google | `Admob` |
   | `StartApp` | `Start.io【StartApp】` |
   | Verve Group | `PubNative【Verve】` |
   | `Tapjoy` | `Tapjoy` |
   | Liftoff | `Vungle` |
   | `F@N communications` | Nend |
   | Fyber | Fyber |
   | `Kidoz` | `Kidoz` |
   | Mobvista/Mintegral | `Mintegral` |

   **备注：** 其余不在此表格中的广告平台如Pangle、Maio、MyTarget、Yandex等，由于不在Admob GDPR广告合作伙伴列表中，TopOn内部会使用弹窗同意结果设置这些广告平台GDPR上报等级
4. 点击 **“确认”**
5. 点击GDPR设置页面最底部的 **“保存”**按钮
   **注意：** 如果有弹出“重新向所有符合条件的用户征求意见？”弹窗时需要选择**“重新提示” **

### 1.3 Admob后台设置IDFA



### 1.4 代码流程说明



### **1.5 添加代码（请先完成上面的流程配置）**

> - present方式，请勿在此时present您的窗口
> - 若不传入ViewController参数，默认会自动获取并显示。
> - 温馨提示，请不要在`- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions`中使用，因为苹果要求在`applicationDidBecomeActive` 后之后调用ATT申请。
> - **以下代码适用于全球范围发行的应用。**

复制代码

```
//导入头文件
#import <AnyThinkSDK/ATAPI.h>
#import <AppTrackingTransparency/AppTrackingTransparency.h>

- (void)initFlow {

    [[ATAPI sharedInstance] showGDPRConsentDialogInViewController:[UIApplication sharedApplication].keyWindow.rootViewController dismissalCallback:^{
        // 这里示例在用户同意，或者数据同意未知情况下的非首次启动申请ATT权限，您可以根据应用实际情况进行调整。
        if ([ATAPI sharedInstance].dataConsentSet == ATDataConsentSetPersonalized) {

            if (@available(iOS 14, *)) {
                [ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(ATTrackingManagerAuthorizationStatus status) {

                }];
            }
        }

        //初始化SDK
        [[ATAPI sharedInstance] startWithAppID:kTopOnAppID appKey:kTopOnAppKey error:nil];
    }];

    //......其他代码
}
```

### 1.6 测试方法

在测试阶段，您可以通过使用**欧盟地区网络代理**，或者用以下方法来模拟在欧盟地区UMP GDPR弹窗场景。

> - API需要网络请求Google验证，请您满足相关网络环境要求。
> - umpTestDeviceIdentifiers可以通过调用ATAPI单例中showGDPRConsentDialogInViewController:dismissalCallback:方法后，在console控制台日志中查找“UMPDebugSettings.testDeviceIdentifiers”获取。
> - 上线请移除相关测试代码。

objc
复制代码

```
- (void)testUMPApply {
     /**
      * 上线前需要移除此测试代码
      * umpTestDeviceIdentifiers可以通过调用ATAPI单例中的showGDPRConsentDialogInViewController:dismissalCallback:方法后，
      * 在console控制台日志中过滤&ldquo;UMPDebugSettings.testDeviceIdentifiers&rdquo;获取
    */
    [ATSDKGlobalSetting sharedManager].umpTestDeviceIdentifiers = @[@"Your Device Identifiers"];
    [ATSDKGlobalSetting sharedManager].umpGeography = ATUMPDebugGeographyEEA;
}
```

### 1.7 在应用中添加可供用户撤消同意的链接

objc
复制代码

```
[[ATAPI sharedInstance] showSecondGDPRConsentDialogWithAppID:kTopOnAppID inViewController:self dismissalCallback:^{
        BOOL gdprConsent = [ATAPI sharedInstance].dataConsentSet == ATDataConsentSetNonpersonalized;
}];
```

> **注意：** 撤消同意是欧洲经济区 (EEA)、英国和瑞士的用户同意投放个性化广告后可以撤消该同意的过程。要求必须在应用的菜单中提供相应链接，方便希望撤消同意的用户这么做，然后重新向其显示用户意见征求消息。

- 如需了解详情，请参阅[这里](https://support.google.com/admob/answer/10113915?hl=zh-Hans&ref_topic=10113206&sjid=8371632926513349913-AP)。
- 请参阅[Google AdMob Ads SDK 开发者文档](https://developers.google.com/admob/ios/privacy?hl=zh-cn#privacy_options)实现隐私设置选项。

---

## 2. 常见问题

### 2.1 项目中已集成UMP SDK，更新TopOn至6.2.87以上版本如何处理？

由于TopOnSDK初始化时会优先读取UMP SDK设置的GDPR相关设置去设置第三方广告平台GDPR上报等级，所以开发者需要确保Admob后台GDPR设置中的\*\*“广告合作伙伴”**列表需要包含**你应用中集成的所有广告平台\*\*（Pangle，Maio，MyTarget，Yandex平台除外），具体可参考上方[自行指定的广告合作伙伴](/docs/Google-UMP-shi-pei-shi-yong-zhi-nan#fb0fff891951e95c303bccf1ded63a19)进行配置。
除此以外建议使用**ATAPI**的单例中的**showGDPRConsentDialogInViewController:dismissalCallback:**方法替代原有UMP SDK Api调用代码，参考上方示例代码，在**dismissalCallback**中进行SDK初始化。如果希望保留项目中原有UMP SDK Api调用逻辑，那需要参考[Admob UMP使用指南](https://developers.google.com/admob/ios/privacy?hl=zh-cn)中示例，在**UMPConsentForm**的**loadAndPresentIfRequiredFromViewController:completionHandler:**方法返回中或者判断**UMPConsentInformation.sharedInstance.canRequestAds**为**YES**后进行TopOn SDK初始化

### 2.2 项目中已集成UMP SDK、后续App更新时又移除了UMP SDK的使用，更新TopOn至6.2.87以上版本如何处理？

由于TopOnSDK初始化时会优先读取UMP SDK设置的GDPR相关设置，即使移除UMP SDK，旧的GDPR配置缓存文件依然保留在本地。开发者需要在移除UMP SDK版本同时调用以下代码移除缓存数据，示例代码如下：
注意：此方法移除UMP SDK GDPR本地缓存后可能会影响到Admob面向欧洲经济区或英国的用户投放广告

复制代码

```
[[NSUserDefaults standardUserDefaults] removeObjectForKey:@"IABTCF_TCString"];
[[NSUserDefaults standardUserDefaults] removeObjectForKey:@"IABTCF_PurposeConsents"];
[[NSUserDefaults standardUserDefaults] removeObjectForKey:@"IABTCF_AddtlConsent"];
[[NSUserDefaults standardUserDefaults] removeObjectForKey:@"IABTCF_VendorConsents"];
```
