---
title: "海外隐私配置"
source: "https://help.toponad.net/cn/docs/MWsWVm"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-09-24"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "政策合规", "海外隐私配置"]
content_sha256: "286be72ef079c75ede205b5baa93dba512c69ef30d2195ea7f7dc949b815337f"
knowledge_role: "reference_only"
has_article_body: true
---

# 海外隐私配置

## ● GDPR

> 自2018年5月25日起，欧盟《一般数据保护条例》将正式生效。为了保护开发人员和用户的利益和隐私，我们更新了"[TopOn隐私政策](https://help.toponad.net/cn/docs/1Mn1B7)"。同时，我们也在SDK中增加了隐私权限设置。请根据以下内容检查SDK的配置。

### 1. TopOn SDK配置GDPR

#### 1.1 通过TopOn SDK API设置TopOn GDPR等级

（设置之后，内部根据该等级去设置第三方广告平台GDPR上报等级）:

java
复制代码

```
ATSDK.setGDPRUploadDataLevel(context, level);

//level有以下选择
ATSDK.PERSONALIZED, //设备数据允许上报
ATSDK.NONPERSONALIZED, //设备数据不允许上报
ATSDK.UNKNOWN //未知等级，只能通过getGDPRDataLevel方法获取，不能用setGDPRUploadDataLevel方法设置
```

java
复制代码

```
TUSDK.setGDPRUploadDataLevel(context, level);

//level有以下选择
TUSDK.PERSONALIZED, //设备数据允许上报
TUSDK.NONPERSONALIZED, //设备数据不允许上报
TUSDK.UNKNOWN //未知等级，只能通过getGDPRDataLevel方法获取，不能用setGDPRUploadDataLevel方法设置
```

#### 1.2 通过TopOn提供的授权的页面设置TopOn GDPR等级

（授权页会根据用户的选择设置上报等级）：

java
复制代码

```
ATSDK.showGDPRConsentDialog(context, new ATGDPRConsentDismissListener() {
    @Override
    public void onDismiss(ConsentDismissInfo consentDismissInfo) {
        ATSDK.init(context, "your app id", "your app key");
    }
});
```

java
复制代码

```
TUSDK.showGDPRConsentDialog(context, new TUGDPRConsentDismissListener() {
    @Override
    public void onDismiss(ConsentDismissInfo consentDismissInfo) {
        TUSDK.init(context, "your app id", "your app key");
    }
});
```

### 2. 欧盟地区的GDPR配置流程建议

> 建议增加以下 GDPR的设置流程，如果您未设置GDPR,当用户在欧盟地区时，TopOn SDK将采用广告平台的GDPR默认设置。

java
复制代码

```
ATSDK.showGDPRConsentDialog(context, new ATGDPRConsentDismissListener() {
	@Override
	public void onDismiss(ConsentDismissInfo consentDismissInfo) {
		ATSDK.init(context, "your app id", "your app key");
	}
});
```

java
复制代码

```
TUSDK.showGDPRConsentDialog(context, new TUGDPRConsentDismissListener() {
	@Override
	public void onDismiss(ConsentDismissInfo consentDismissInfo) {
		ATUSDK.init(context, "your app id", "your app key");
	}
});
```



---

## ● CCPA

> [加州消费者隐私法案 (CCPA)](https://oag.ca.gov/privacy/ccpa) 向加州消费者提供各种各样的隐私权利。 受到 CCPA 管制的企业将对这些消费者履行多项义务，包括信息披露、与欧盟一般数据保护条例 (GDPR) 类似的消费者权利、“选择退出”特定数据传输的权利，以及“选择加入”未成年人要求的权利。

请在[TopOn后台-应用](https://app.toponad.com/m/app) 页面，然后单击“**编辑**”按钮进行CCPA的设置，如下图所示：



---

## ● COPPA

> [美国儿童在线隐私权保护法(COPPA)](https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy)主要针对在线收集 13 岁以下儿童个人信息的行为。根据[COPPA常见问题解答](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)，
> 开发者有责任确定其应用是否针对13岁以下儿童并考虑包括但不限于下述因素：“应用的主题、视觉内容、使用动画角色或面向儿童的活动和激励措施、音乐或其
> 他音频内容、模特年龄、儿童名人或吸引儿童的名人的存在、 网站或在线服务的语言或其他特征，以及推广或出现在网站或在线服务上的广告是否针对儿童“。

1. 请在[TopOn后台-应用](https://app.toponad.com/m/app) 页面，然后单击“**编辑**”按钮进行COPPA的设置，如下图所示：



2. 在**初始化TopOn SDK之前**通过如下方式传入`用户的年龄`

> ⚠️当传入的用户的年龄为***13周岁以下***，将会遵守COPPA的相关规定

java
复制代码

```
Map<String, String> customMap = new HashMap<>();
customMap.put("age", "用户的年龄");
ATSDK.initCustomMap(customMap);
```

java
复制代码

```
Map<String, String> customMap = new HashMap<>();
customMap.put("age", "用户的年龄");
TUSDK.initCustomMap(customMap);
```

---

## ● 关于Pangle的PAConsent说明

> ⚠️**注意**
>
> - **Pangle 在v7.1.x.x 开始移除了COPPA及CCPA设置，统一使用 PAConsent**
> - TopOn SDK 在 v6.4.88 及以上版本中支持PAConsent的使用
> - 未进行如下设置将使用Pangle SDK 默认值 `同意`
> - 建议在TopOn SDK初始化之前进行设置

java
复制代码

```
// 同意
PangleATInitManager.getInstance().setPAConsent(PAGConstant.PAGPAConsentType.PAG_PA_CONSENT_TYPE_CONSENT);

// 不同意
PangleATInitManager.getInstance().setPAConsent(PAGConstant.PAGPAConsentType.PAG_GDPR_CONSENT_TYPE_NO_CONSENT);
```

java
复制代码

```
// 同意
PangleTUInitManager.getInstance().setPAConsent(PAGConstant.PAGPAConsentType.PAG_PA_CONSENT_TYPE_CONSENT);

// 不同意
PangleTUInitManager.getInstance().setPAConsent(PAGConstant.PAGPAConsentType.PAG_GDPR_CONSENT_TYPE_NO_CONSENT);
```

---

## ● 隐私信息开关

> - 为了保证您的App顺利通过检测，结合当前监管关注重点，我们可以将TopOn SDK的初始化放在用户同意隐私政策之后。
> - 如果有更高需求，可以使用以下方法进行控制，限制用户设备数据上报可能会对广告填充造成影响，请斟酌使用。
>   **TopOn SDK收集的数据** 详情请见：《[隐私合规指南](https://help.toponad.net/cn/docs/ByIf1V)》
> - TopOn SDK提供了API给您去限制这些隐私数据的上报，当限制了上报的设备数据时可能会影响TopOn功能的正常使用，如: 流量分组、交叉推广、TopOn Adx等功能，**请谨慎设置**。
> - GDPR不同意只会收集：手机系统版本名称，屏幕方向，应用集成的TopOn SDK版本号

java
复制代码

```
//初始化SDK之前调用此代码限制设备隐私数据的上报，传入的信息将被限制上报
ATSDK.deniedUploadDeviceInfo(
    DeviceDataInfo.DEVICE_SCREEN_SIZE, //屏幕分辨率
    DeviceDataInfo.ANDROID_ID, //Android ID
    DeviceDataInfo.APP_PACKAGE_NAME, //应用包名
    DeviceDataInfo.APP_VERSION_CODE, //应用版本号
    DeviceDataInfo.APP_VERSION_NAME, //应用版本名
    DeviceDataInfo.BRAND, //设备生产商
    DeviceDataInfo.GAID, //Google Ad ID
    DeviceDataInfo.LANGUAGE, //语言
    DeviceDataInfo.MCC, //移动网络代码
    DeviceDataInfo.MNC, //移动国家代码
    DeviceDataInfo.MODEL, //设备型号
    DeviceDataInfo.ORIENTATION, //屏幕方向
    DeviceDataInfo.OS_VERSION_CODE, //系统版本号
    DeviceDataInfo.OS_VERSION_NAME, //系统版本名
    DeviceDataInfo.TIMEZONE, //时区
    DeviceDataInfo.USER_AGENT, //User Agent
    DeviceDataInfo.NETWORK_TYPE, //网络类型
    DeviceDataInfo.INSTALLER //应用安装来源
);
```

java
复制代码

```
//初始化SDK之前调用此代码限制设备隐私数据的上报，传入的信息将被限制上报
TUSDK.deniedUploadDeviceInfo(
    DeviceDataInfo.DEVICE_SCREEN_SIZE, //屏幕分辨率
    DeviceDataInfo.ANDROID_ID, //Android ID
    DeviceDataInfo.APP_PACKAGE_NAME, //应用包名
    DeviceDataInfo.APP_VERSION_CODE, //应用版本号
    DeviceDataInfo.APP_VERSION_NAME, //应用版本名
    DeviceDataInfo.BRAND, //设备生产商
    DeviceDataInfo.GAID, //Google Ad ID
    DeviceDataInfo.LANGUAGE, //语言
    DeviceDataInfo.MCC, //移动网络代码
    DeviceDataInfo.MNC, //移动国家代码
    DeviceDataInfo.MODEL, //设备型号
    DeviceDataInfo.ORIENTATION, //屏幕方向
    DeviceDataInfo.OS_VERSION_CODE, //系统版本号
    DeviceDataInfo.OS_VERSION_NAME, //系统版本名
    DeviceDataInfo.TIMEZONE, //时区
    DeviceDataInfo.USER_AGENT, //User Agent
    DeviceDataInfo.NETWORK_TYPE, //网络类型
    DeviceDataInfo.INSTALLER //应用安装来源
);
```
