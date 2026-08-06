---
title: "Google UMP 适配使用指南"
source: "https://help.toponad.net/cn/docs/Google-UMP-shi-pei-shi-yong-zhi-nan-IKqd"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "政策合规", "Google UMP 适配使用指南"]
content_sha256: "0225acb8ea99b589fc6a6debd39d10be262ea44a0052781a2c41a8c0ca5d1ad8"
knowledge_role: "reference_only"
has_article_body: true
---

# Google UMP 适配使用指南

## 1. 背景

> 自 2024 年 1 月 16 日起，使用 Google AdSense、Ad Manager 或 AdMob 的发布商和开发者在面向欧洲经济区或英国的用户投放广告时，必须使用通过 Google 认证且已与 [IAB 的透明度和用户意见征求框架](https://iabeurope.eu/transparency-consent-framework/) (TCF) 相集成的意见征求管理平台 (CMP)。

TopOn SDK从**6.2.87版本**开始提供兼容UMP SDK方式配置GDPR等级，TopOn SDK内部会根据该等级去设置第三方广告平台GDPR上报等级。

---

## 2. UMP使用流程

### 2.1 在Admob后台启用UMP

> ① 访问Admob后台登录Admob账号 -在 AdMob 中添加你的应用（如果您尚未添加应用）
> ② 点击“隐私权和消息”
> ③ 点击“欧洲法规-管理”
> ④ 点击“创建消息”，等待GDPR消息页面打开
> ⑤ 在GDPR消息页面中点击右上角“选择应用”，选择您想要显示GDPR信息的应用
> ⑥ 选择您想要显示消息的语言
> ⑦ 在“定位”栏目中选择“须遵守 GDPR 的国家/地区（EEA 和 UK）”选项

> 以下配置可以提高用户同意GDPR概率
> ① “用户选项-关闭（不同意）”选择关闭
> ② 样式调整，选择“样式“栏目
>
> - 按钮栏目下的“次要颜色“调整为白色（#ffffff）
> - 按钮栏目下的“次要字体颜色“调整为灰色（#6e6e6e）
>
> 调整后整体效果如下图所示，最后点击右上角 **“发布”** 即可。

### 2.2 自行指定的广告合作伙伴

> **注意** ：默认情况下，Google 可能不会在您的 GDPR 消息中显示您项目中集成的所有广告平台。 如果您未能包含这些广告平台，可能会对您的广告收入产生不利影响。 请按照本部分中的步骤操作，确保您项目中集成的所有广告平台都出现在 GDPR 消息中。

自定义 GDPR 消息中显示哪些广告合作伙伴：

(1) 在Admob后台 **“隐私权和消息”** 中点击“GDPR设置”，打开GDPR设置


(2) 点击 **“检查您的广告合作伙伴”** 部分下的编辑图标 ()

(3) 参考下方表格，勾选您项目中集成的所有广告平台

| Google Name | TopOn SDK Network |
| --- | --- |
| Facebook | Meta |
| AppLovin Corp | Applovin |
| ironSource Mobile | IronSource |
| InMobi Choice | InMobi |
| BIGOAds | Bigo |
| Chartboost | Chartboost |
| UnityAds | Unity Ads |
| Ogury Ltd | Ogury |
| Google | Admob |
| StartApp | [Start.io](http://Start.io) |
| Verve Group | Verve |
| Tapjoy | Tapjoy |
| Liftoff | Vungle |
| F@N communications | Nend |
| Fyber | Digital Turbine(Fyber) |
| Kidoz | Kidoz |
| Mobvista/Mintegral | Mintegral |

> **Tips** ：不在此表格中的广告平台如Pangle、Maio、Appnext、MyTarget、Yandex、Helium等，由于不在Admob GDPR广告合作伙伴列表中，TopOn内部会使用弹窗同意结果设置这些广告平台GDPR上报等级。

(4) 点击 **“确认”**

(5) 点击GDPR设置页面最底部的 **“保存”** 按钮

> **注意** ：如果有弹出“重新向所有符合条件的用户征求意见？”弹窗时需要选择 **“重新提示”**

****

### **2.3 项目中启用UMP**

(1) 首先将Google User Messaging Platform SDK 的依赖项添加到模块的应用级 Gradle 文件（通常为 `app/build.gradle`）中

Groovy
复制代码

```
dependencies {
    implementation("com.google.android.ump:user-messaging-platform:3.1.0")
}
```

(2) 在AndroidManifest.xml中添加`gms.ads.APPLICATION_ID`，value值需配置Admob后台创建的应用的ID

manifest
复制代码

```
<manifest>
    <application>
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"/>
    </application>
</manifest>
```

(3) 混淆配置`proguard-android.txt`文件增加以下配置

复制代码

```
-keep public class com.google.android.ump.*
```

(4) 调用`ATSDK.showGDPRConsentDialog`并在`onDismiss`回调内进行SDK初始化。`ATSDK.showGDPRConsentDialog`内部会判断是否有集成UMP SDK，有集成时会使用UMP SDK API弹出GDPR信息弹窗，无集成时在欧盟地区会使用TopOn GDPR信息弹窗给用户选择GDPR等级。

> **注意** ：
>
> - 需要在SDK初始化后再发起广告请求
> - **请确保手机网络能够访问外部网络**（Google服务器），避免UMP SDK因为网络问题导致弹窗弹出失败

java
复制代码

```
ATSDK.showGDPRConsentDialog(activity, new ATGDPRConsentDismissListener() {
    @Override
    public void onDismiss(ConsentDismissInfo consentDismissInfo) {
        //注意：需要在此回调中进行SDK初始化并且初始化后再进行广告加载
        ATSDK.init(activity, appId, appKey);
    }
},"appId");
```

(5) 测试阶段，可以通过下方示例代码模拟在欧盟地区弹出UMP GDPR弹窗

> **注意** ：上线前需要移除此测试代码

java
复制代码

```
/**
 * deviceId: 调用ATSDK.showGDPRConsentDialog后在logcat中过滤关键字"addTestDeviceHashedId"获取
 */
ATSDK.setDebuggerConfig(activity, "",
        new ATDebuggerConfig.Builder().setUMPTestDeviceId("deviceid").build());
```

(4) 调用`TUSDK.showGDPRConsentDialog`并在`onDismiss`回调内进行SDK初始化。`TUSDK.showGDPRConsentDialog`内部会判断是否有集成UMP SDK，有集成时会使用UMP SDK API弹出GDPR信息弹窗，无集成时在欧盟地区会使用TopOn GDPR信息弹窗给用户选择GDPR等级。

> **注意** ：
>
> - 需要在SDK初始化后再发起广告请求
> - **请确保手机网络能够访问外部网络**（Google服务器），避免UMP SDK因为网络问题导致弹窗弹出失败

java
复制代码

```
TUSDK.showGDPRConsentDialog(activity, new TUGDPRConsentDismissListener() {
    @Override
    public void onDismiss(ConsentDismissInfo consentDismissInfo) {
        //注意：需要在此回调中进行SDK初始化并且初始化后再进行广告加载
        TUSDK.init(activity, appId, appKey);
    }
},"appId");
```

(5) 测试阶段，可以通过下方示例代码模拟在欧盟地区弹出UMP GDPR弹窗

> **注意** ：上线前需要移除此测试代码

java
复制代码

```
/**
 * deviceId: 调用TUSDK.showGDPRConsentDialog后在logcat中过滤关键字"addTestDeviceHashedId"获取
 */
TUSDK.setDebuggerConfig(activity, "",
        new TUDebuggerConfig.Builder().setUMPTestDeviceId("deviceid").build());
```

### 2.4 在应用中添加可供用户撤消同意的链接

6.5.50版本新增showGDPRConsentSecondDialog方法允许改意见征求流程，可以二次选择GDPR

java
复制代码

```
ATSDK.showGDPRConsentSecondDialog(activity, new ATGDPRConsentDismissListener() {
    @Override
    public void onDismiss(ConsentDismissInfo consentDismissInfo) {
        //注意：需要在此回调中进行SDK初始化并且初始化后再进行广告加载
        ATSDK.init(activity, appId, appKey);
    }
},"appId");
```

java
复制代码

```
TUSDK.showGDPRConsentSecondDialog(activity, new TUGDPRConsentDismissListener() {
    @Override
    public void onDismiss(ConsentDismissInfo consentDismissInfo) {
        //注意：需要在此回调中进行SDK初始化并且初始化后再进行广告加载
        TUSDK.init(activity, appId, appKey);
    }
},"appId");
```

> **注意** ：撤消同意是欧洲经济区 (EEA)、英国和瑞士的用户同意投放个性化广告后可以撤消该同意的过程。要求必须在应用的菜单中提供相应链接，方便希望撤消同意的用户这么做，然后重新向其显示用户意见征求消息。

如需了解详情，请参阅[这里](https://support.google.com/admob/answer/10113915?hl=zh-Hans&ref_topic=10113206&sjid=8371632926513349913-AP)。

请参阅[Google AdMob Ads SDK 开发者文档](https://developers.google.com/admob/android/privacy?hl=zh-cn#privacy_options)实现隐私设置选项。

---

## 3. 常见问题

**(1) 项目中已集成UMP SDK，更新TopOn至6.2.87以上版本如何处理？**

由于TopOnSDK初始化时会优先读取UMP SDK设置的GDPR相关设置去设置第三方广告平台GDPR上报等级，所以开发者需要确保Admob后台GDPR设置中的 **“广告合作伙伴”**列表需要包含**你应用中集成的所有广告平台**（Pangle，Huawei，Maio，Appnext，MyTarget，Yandex、Helium平台除外），具体可参考上方[自行指定的广告合作伙伴](https://help.toponad.net/cn/docs/Google-UMP-shi-pei-shi-yong-zhi-nan-IKqd#2.2_%E8%87%AA%E8%A1%8C%E6%8C%87%E5%AE%9A%E7%9A%84%E5%B9%BF%E5%91%8A%E5%90%88%E4%BD%9C%E4%BC%99%E4%BC%B4)进行配置。
除此以外建议使用TopOn SDK的showGDPRConsentDialog替代原有UMP SDK Api调用代码，参考上方示例代码，在onDismiss回调中进行SDK初始化。如果希望保留项目中原有UMP SDK Api调用逻辑，那需要参考[Admob UMP使用指南](https://developers.google.com/admob/android/privacy?hl=zh-cn#request-ads)中示例，在OnConsentFormDismissedListener#onConsentFormDismissed()回调或者判断consentInformation.canRequestAds为true后进行TopOn SDK初始化

**(2) 项目中已集成UMP SDK、后续App更新时又移除了UMP SDK的使用，更新TopOn至6.2.87以上版本如何处理？**

由于TopOnSDK初始化时会优先读取UMP SDK设置的GDPR相关设置，即使移除UMP SDK，旧的GDPR配置缓存文件依然保留在本地。开发者需要在移除UMP SDK版本同时调用以下代码移除缓存数据，示例代码如下：
注意：此方法移除UMP SDK GDPR本地缓存后可能会影响到Admob面向欧洲经济区或英国的用户投放广告

java
复制代码

```
SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
SharedPreferences.Editor editor = sharedPreferences.edit();
editor.remove("IABTCF_TCString");
editor.remove("IABTCF_AddtlConsent");
editor.remove("IABTCF_VendorConsents");
editor.remove("IABTCF_PurposeConsents");
editor.commit();
```
