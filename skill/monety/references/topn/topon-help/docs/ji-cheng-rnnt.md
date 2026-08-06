---
title: "集成与初始化"
source: "https://help.toponad.net/cn/docs/ji-cheng-rnnt"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-26"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "集成与初始化"]
content_sha256: "b6ccde51387532833b16e93f0bb6307cfe3ff2761dda53a3b3b0b0b0e0d3a164"
knowledge_role: "reference_only"
has_article_body: true
---

# 集成与初始化

## 1. SDK下载

您可以从 [TopOn SDK下载平台](https://portal.toponad.com/m/sdk/download) 获取。

 

① 选择TopOn SDK版本（ 必选 ）
② 选择广告样式（ 必选 ）
③ 选择广告平台（可选）
④ 选择采集素材（可选）
⑤ 点击生成接入代码，具体看集成配置。

---

## 2. 集成配置



### 2.1 Gradle

把上述截图生成的Gradle引用代码复制到您项目的build.gradle。

### 2.2 AndroidManifest.xml

除了复制上面截图生成的AndroidManifest.xml内容到您项目的AndroidManifest.xml外，还需要添加以下内容：

xml
复制代码

```
<application>
 <!-- Android 9以上适配 -->
 <uses-library android:name="org.apache.http.legacy" android:required="false"/>

 <!-- 如果有集成Admob SDK，则需要添加以下配置，value的值是Admob后台创建的应用的ID -->
  <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
                    android:value="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"/>

</application>
```

### 2.3 混淆配置

如果您的应用有打开混淆，必须复制上面截图生成的混淆配置规则到项目中。

### 2.4 资源优化

如果您的应用开启了 **shrinkResource** ，则需要下载SDK压缩包，并把里面的 **keep.xml** 文件放到res/raw路径下。（ [点击查看Android资源优化处理](https://developer.android.com/studio/build/shrink-code#keep-resources))

如果您的应用有用到 第三方的资源优化框架（如：AndResProguard），则需要将 SDK压缩包的 **whitelists.txt** 文件的内容 添加到资源优化框架的 **白名单** 中。

---

## 3. 初始化SDK

> - 如果您的应用有在`欧盟地区`投放，需要在`初始化前`进行 [GDPR配置](https://help.toponad.net/cn/docs/MWsWVm)
> - 如果有`集成Admob`且在`欧盟地区`投放则`必须`设置 [Google UMP](https://help.toponad.net/cn/docs/Google-UMP-shi-pei-shi-yong-zhi-nan-IKqd) ，设置Google UMP后就不用另外进行GDPR配置
> - 如果您的应用需要在用户首次启动应用时展示隐私政策并取得用户同意，请参考 [TopOn隐私政策](https://www.toponad.net/en/privacy-policy) 。
> - 如果您的应用需要在Google Play上架， [根据Google数据安全要求](https://support.google.com/googleplay/android-developer/answer/10787469?hl=zh-Hans) ，需要披露您App和集成在您App中的所有SDK收集的数据，可通过TopOn的 [Google数据安全指南](https://help.toponad.net/cn/docs/NNPNBt) 进行设置
> - **如果您的应用有使用多进程，请只在主进程中进行初始化SDK操作**

初始化示例代码：

java
复制代码

```
public class DemoApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate()
        ATSDK.init(this, "Your App ID", "Your App Key");
    }
}
```

java
复制代码

```
public class DemoApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate()
        TUSDK.init(this, "Your App ID", "Your App Key");
    }
}
```
