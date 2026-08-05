---
title: "测试工具"
source: "https://help.toponad.net/cn/docs/ce-shi-gong-ju-Beta-rcnP"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "集成测试", "测试工具"]
content_sha256: "82fabe46d45f193473a0ecba8e09af7efd4a86bb74f4e9419d39bf89e467a971"
knowledge_role: "reference_only"
has_article_body: true
---

# 测试工具

**注意事项：**

- 支持开发者在接入TopOn SDK后进行检测使用
- 测试工具仅作为检测SDK集成，并不能代替APP自身的广告逻辑测试
- 开发者在测试结束后，上线前将调用测试工具的相关代码删除
- 版本要求：Android（v6.2.78及以上），iOS（v6.2.78及以上）

# 一、产品简介

通过使用测试工具提高开发者接入测试的效率：

- 基础信息：检测应用、设备、sdk的相关信息
- TopOn SDK设置信息：检测隐私设置、权限是否成功配置
- 集成检测：检测集成三方平台SDK和adapter集成情况和测试建议，以及测试三方广告平台的广告加载

**版本说明**

- [Android 测试工具版本说明](/cn/docs/5xiiue#%E4%B8%80%E3%80%81%E4%BA%A7%E5%93%81%E7%AE%80%E4%BB%8B)
- [iOS测试工具版本说明](/cn/docs/ce-shi-gong-ju-Beta-DLyz#%E4%B8%80%E3%80%81%E4%BA%A7%E5%93%81%E7%AE%80%E4%BB%8B)

# **二、接入流程**

注意：在接入测试工具之前，需要先集成TopOn SDK。SDK集成方式可以参考 [unity插件使用说明](https://help.toponad.net/cn/docs/hd01b0) 。

## **Android接入流程**

1. 导入测试工具的依赖库，按照以下两个操作：
   第一步：先在Unity的项目/**Assets/AnyThinkAds/Plugins/Android**目录下新建一个名为**Editor**的文件夹;
   第二步：创建**Dependencies.xml**文件并在文件中添加以下内容，然后放到第一步创建的**Editor**目录下。

   复制代码

   ```
   <dependencies>
       <androidpackages>
           <repositories>
               <repository>https://jfrog.anythinktech.com/artifactory/debugger</repository>
           </repositories>
           <androidpackage spec="com.anythink.sdk:debugger-ui:1.1.0"></androidpackage>
       </androidpackages>
   </dependencies>
   ```

   注意：第一步文件夹命名必须是**Editor，**第二步文件命名必须是**Dependencies.xml**。
2. 完成测试工具依赖库导入后，就可以直接在Unity层调用C# API先调用SDK初始化后，再调用以下方法跳转到测试工具页面：

   复制代码

   ```
   //If you do not need to use online advertising ID testing, you can use ATSDKAPI.showDebuggerUI()
   //ATSDKAPI.showDebuggerUI();

   //Debug Key：used for online ID testing. You can get it from Backstage -> Account Management -> Key.
   //Requirements: 1. SDK version 6.3.68 and above  2. Debugger UI tool version 1.0.8 and above
   ATSDKAPI.showDebuggerUI("Your Debug Key");
   ```

   注意：必须先初始化SDK后才能跳转到测试工具页面。

## iOS接入流程

1. 导入测试工具的依赖库，按照以下两个操作：
   第一步：先在Unity的项目/**Assets/AnyThinkAds/Plugins/iOS**目录下新建一个名为**Editor**的文件夹;
   第二步：创建**Dependencies.xml**文件并在文件中添加以下内容，然后放到第一步创建的**Editor**目录下。

   复制代码

   ```
   <?xml version="1.0" encoding="utf-8"?>
   <dependencies>
       <iospods>
           <iospod name="TPNDebugUISDK" version="1.0.3"></iospod>
       </iospods>
   </dependencies>
   ```

   注意：第一步文件夹命名必须是**Editor，**第二步文件命名必须是**Dependencies.xml**。
2. 完成测试工具依赖库导入后，就可以直接在Unity层调用C# API先调用SDK初始化后，再调用以下方法跳转到测试工具页面：

   复制代码

   ```
   ATSDKAPI.showDebuggerUI("Your Debug Key");
   ```

   注意：
   a. 必须先初始化SDK后才能跳转到测试工具页面。
   b. 测试工具里面的功能还需要媒体端先获取到idfa ，才能使用，目前SDK初始化，是不会去获取idfa的。

注意：上线前需要将调用测试工具的相关代码删除

# 三、测试工具使用

## 1.基础信息

功能：支持长按复制信息和当前页面数据分享。

### Android基础信息

- **GAID**为Google Advertising ID，如果GAID显示为空，请检查以下因素：
  1.手机是否有谷歌服务。
  2.进入这个页面前，是否调用了以下方法限制**GAID**的获取。

  复制代码

  ```
  string[] deniedInfos = new string[] { "gaid" };
  ATSDKAPI.deniedUploadDeviceInfo(deniedInfos);
  ```
- **Android ID**为设备唯一标识符，如果AndroidId显示为空，请检查是否调用了以下方法限制AndroidId的获取：

  复制代码

  ```
  string[] deniedInfos = new string[] { "android_id" };
  ATSDKAPI.deniedUploadDeviceInfo(deniedInfos);
  ```
- **注意：**如果集成的SDK是**海外SDK**，开启下面的调试模式则需要**GAID**不为空，如果是**国内SDK**，则需要**AndroidId**不为空。
  

### iOS基础信息

- **IDFA**为设备唯一标识符，如果IDFA显示为空，请检查是否授予允许跟踪权限。
- **注意：如果IDFA为空，则无法成功开启广告调试，请在设置中授予跟踪权限**。
  

## 2.TopOn SDK设置

TopOn SDK设置包括两部分：隐私设置和权限设置。

- 设置GDPR：1.支持在unity直接设置，[点击查看](https://help.toponad.net/cn/docs/she-zhi-GDPR-fG73)；2.导出Android和iOS原生项目去设置，详情请查看[Android设置GDPR](https://help.toponad.net/cn/docs/MWsWVm)和[iOS设置GDPR](https://help.toponad.net/cn/docs/she-zhi-GDPR)。
- 权限设置：应用已申请的权限列表。
- Android页面
   
- iOS页面
   

## 3.集成检测

1. 看广告平台列表的集成状态：**集成异常、完成集成、未集成**。
    
2. 勾选开关打开调试模式。
   
3. 选择完成集成的广告平台进入**调试模式**。
4. 选择广告平台的广告样式进行测试操作。
     
5. 可点击右上角分享按钮，分享当前页面的广告平台调试信息。
