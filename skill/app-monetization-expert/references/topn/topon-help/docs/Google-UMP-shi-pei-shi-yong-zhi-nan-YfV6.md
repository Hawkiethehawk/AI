---
title: "Google UMP 适配使用指南"
source: "https://help.toponad.net/cn/docs/Google-UMP-shi-pei-shi-yong-zhi-nan-YfV6"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "政策合规", "Google UMP 适配使用指南"]
content_sha256: "1f1b9d3d43e7f206f82bc74bcf4e0a9d1623fbb72979c5bfe6420ff96d031360"
knowledge_role: "reference_only"
has_article_body: true
---

# Google UMP 适配使用指南

## **1**. 背景

> 自 2024 年 1 月 16 日起，使用 Google AdSense、Ad Manager 或 AdMob 的发布商和开发者在面向欧洲经济区或英国的用户投放广告时，必须使用通过 Google 认证且已与 [IAB 的透明度和用户意见征求框架](https://iabeurope.eu/transparency-consent-framework/) (TCF) 相集成的意见征求管理平台 (CMP)

TopOn SDK从**6.2.87**开始提供兼容UMP SDK方式配置GDPR等级，TopOn SDK内部根据该等级去设置第三方广告平台GDPR上报等级

## **2**. UMP使用流程

### 在Admob后台启用UMP

1. 访问[Admob后台](https://apps.admob.com/)登录Admob账号
   -[在 AdMob 中添加你的应用](https://support.google.com/admob/answer/9989980?sjid=7572347865551051335-NA)（如果您尚未添加应用）
2. 点击 **“隐私权和消息”**
3. 点击 **“欧洲法规-管理”**
4. 点击 **“创建消息”** ，等待GDPR消息页面打开
5. 在GDPR消息页面中点击右上角 **“选择应用”**，选择您想要显示GDPR信息的应用
6. 选择您想要显示消息的语言
7. 在 **“定位”** 栏目中选择“须遵守 GDPR 的国家/地区（EEA 和 UK）”选项

以下配置可以提高用户同意GDPR概率

1. “用户选项-关闭（不同意）”选择关闭
2. 样式调整，选择 **“样式“** 栏目
   -按钮栏目下的 **“次要颜色“** 调整为白色（#ffffff）
   -按钮栏目下的 **“次要字体颜色“** 调整为灰色（#6e6e6e）

调整后整体效果如下图



最后点击右上角 **“发布”** 即可

### 自行指定的广告合作伙伴

> **注意：** 默认情况下，Google 可能不会在您的 GDPR 消息中显示您项目中集成的所有广告平台。 如果您未能包含这些广告平台，可能会对您的广告收入产生不利影响。 请按照本部分中的步骤操作，确保您项目中集成的所有广告平台都出现在 GDPR 消息中。

自定义 GDPR 消息中显示哪些广告合作伙伴：

1. 在Admob后台 **“隐私权和消息”** 中点击“GDPR设置”，打开GDPR设置
   
2. 点击 **“检查您的广告合作伙伴”** 部分下的编辑图标 ()
3. 参考下方表格，勾选您项目中集成的所有广告平台

   | Google Name | TopOn SDK Network |
   | --- | --- |
   | Facebook | `Meta` |
   | AppLovin Corp | `Applovin` |
   | ironSource Mobile | `IronSource` |
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

   **备注：** 其余不在此表格中的广告平台如Pangle、Huawei、Maio、Appnext、MyTarget、Yandex、Helium等，由于不在Admob GDPR广告合作伙伴列表中，TopOn内部会使用弹窗同意结果设置这些广告平台GDPR上报等级
4. 点击 **“确认”**
5. 点击GDPR设置页面最底部的 **“保存”** 按钮
   **注意：**如果有弹出“重新向所有符合条件的用户征求意见？”弹窗时需要选择**“重新提示” **

### **项目中启用UMP**

**Android：**

将Google User Messaging Platform SDK 的依赖项添加到mainTemplate.gradle 文件中

复制代码

```
dependencies {
    implementation("com.google.android.ump:user-messaging-platform:2.1.0")
}
```

在Unity Editor中，打开 Player Setting > Publishing Settings，然后找到Custom Proguard File，勾选上以后，找到这个文件添加以下混淆规则

复制代码

```
-keep public class com.google.android.ump.*
```

**iOS:**

将Google User Messaging Platform SDK 的依赖项添加到Unity项目的podfile文件中

复制代码

```
pod 'GoogleUserMessagingPlatform'
```

### 展示UMP弹窗

用ATSDKAPI.showGDPRConsentDialog API并在onDismiss回调内进行SDK初始化。ATSDKAPI.showGDPRConsentDialog内部会判断是否有集成UMP SDK，有集成时会使用UMP SDK Api弹出GDPR信息弹窗，无集成时在欧盟地区会使用弹出TopOn GDPR信息弹窗给用户选择GDPR等级。
**注意：** 需要在SDK初始化后再发起广告请求

复制代码

```
public void showGDPRConsentDialog(){
    Debug.Log ("Developer showGDPRConsentDialog");
    //插件2.1.8版本新增
    ATSDKAPI.showGDPRConsentDialog(new ConsentDismissListener(),string appId);
}

private class ConsentDismissListener : ATConsentDismissListener
{
    public void onConsentDismiss()
    {
        Debug.Log("Developer callback onConsentDismiss(): call initSDK() to init sdk in this callback");
    }
}
```

### 在应用中添加可供用户撤消同意的链接

复制代码

```
//插件2.1.8版本新增showGDPRConsentSecondDialog方法允许改意见征求流程，可以二次选择GDPR
public void showGDPRConsentSecondDialog(){
    Debug.Log ("Developer showGDPRConsentDialog");

    ATSDKAPI.showGDPRConsentDialog(new ConsentDismissListener(),string appId);
}

private class ConsentDismissListener : ATConsentDismissListener
{
    public void onConsentDismiss()
    {
        Debug.Log("Developer callback onConsentDismiss(): call initSDK() to init sdk in this callback");
    }
}
```

> **注意：** 撤消同意是欧洲经济区 (EEA)、英国和瑞士的用户同意投放个性化广告后可以撤消该同意的过程。要求必须在应用的菜单中提供相应链接，方便希望撤消同意的用户这么做，然后重新向其显示用户意见征求消息。

如需了解详情，请参阅[这里](https://support.google.com/admob/answer/10113915?hl=zh-Hans&ref_topic=10113206&sjid=8371632926513349913-AP)。

请参阅[Google AdMob Ads SDK 开发者文档](https://developers.google.com/admob/unity/privacy?hl=zh-cn#privacy_options)实现隐私设置选项。
