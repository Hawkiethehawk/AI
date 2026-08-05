---
title: "初始化说明"
source: "https://help.toponad.net/cn/docs/RgL9Yt"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-16"
category_path: ["TopOn SDK接入指南", "Flutter接入指南", "初始化说明"]
content_sha256: "a546fe6b01a3238f4adf76d925079e57a74dc7a4dd38bae74a9a59bf16be4748"
knowledge_role: "reference_only"
has_article_body: true
---

# 初始化说明

• 您的App需要制订《隐私政策》，同时在用户首次启动App时展示《隐私政策》并取得用户同意。App制订的《隐私政策》，请参考[《隐私合规指南》](https://help.toponad.com/cn/docs/XTVV9t)
**请务必确保用户同意App《隐私政策》之后，再初始化TopOn SDK。**

- 使用SDK加载和展示广告前，需要调用initSDK方法；

• 涉及欧盟地区或者相关用户隐私协议控制，可通过setGDPRLevel控制数据上报权限；

• 通过setLogEnabled方法，可以开启调试日志，方便定位SDK集成中遇到的问题；

• SDK需要的appid、appkey等参数可通过开发者后台创建app之后获取

## 1. SDK初始化

您可以通过以下代码初始化SDK，另外由于加载广告时异步进行的，所以想要获取广告的状态，请实现各广告类型的监听方法。

**导入ATSDK** `import 'package:secmtp_sdk/at_index.dart';`

复制代码

```
 _initTopon() async {
     await ATInitManager.initSDK(
         appidStr: 'your appid',
         appidkeyStr: 'your appkey')
  }
```

**完整的示例代码：**

复制代码

```
import 'package:secmtp_sdk/at_index.dart';
import '../configuration_sdk.dart';

final InitManger = InitTool();

class InitTool{
  // 打开SDK的Debug log，强烈建议在测试阶段打开，方便排查问题。
  setLogEnabled() async {
         ATInitManger
        .setLogEnabled(
      logEnabled: true,
    );
  }
  // 设置渠道，可用于统计数据和进行流量分组
  setChannelStr() async {
         ATInitManger
        .setChannelStr(
      channelStr: "test_setChannel",
    );
  }
  // 设置子渠道，可用于统计数据和进行流量分组
  setSubchannelStr() async {
         ATInitManger
        .setSubChannelStr(
      subchannelStr: "test_setSubchannelStr",
    );
  }
  // 设置自定义的Map信息，可匹配后台配置的对应流量分组（App纬度）（可选配置）
  setCustomDataDic() async {
      ATInitManger.setCustomDataMap(
      customDataMap: {
        'setCustomDataDic': 'myCustomDataDic',
      },
    );
  }
  // 设置排除交叉推广App列表
  setExludeBundleIDArray() async {
      ATInitManger.setExludeBundleIDArray(
      exludeBundleIDList: ['test_setExludeBundleIDArray'],
    );
  }
  // 设置自定义的Map信息，可匹配后台配置的对应的流量分组（Placement纬度）（可选配置）
  setPlacementCustomData() async {
      ATInitManger.setPlacementCustomData(
      placementIDStr: 'b5b72b21184aa8',
      placementCustomDataMap: {'setPlacementCustomData': 'test_setPlacementCustomData'},
    );
  }
  // 判断是否位于欧盟地区
  getUserLocation() async {
      ATInitManger.getUserLocation().then((value) {
      print('flutter: Get user location -- ${value.toString()}');
    });
  }
  // 获取GDPR的授权级别
  getGDPRLevel() async {
     await ATInitManger.getGDPRLevel().then((value) {
      print('flutter:Get GDPR --${value.toString()}');
    });
  }
  setDataConsentSet() async {

        ATInitManger.setDataConsentSet(
        gdprLevel:
    ATInitManger.dataConsentSetPersonalized());
  }

  deniedUploadDeviceInfo() async {

       ATInitManger
        .deniedUploadDeviceInfo(
        deniedUploadDeviceInfoList: [ATInitManger.aOAID()]);
  }
  // 初始化TopOn的SDK
  initTopon() async {
    await ATInitManger.initAnyThinkSDK(
        appidStr: Configuration.appidStr,
        appidkeyStr: Configuration.appidkeyStr);
  }
  // 展示GDPR的界面 (v6.2.87废弃，请使用showGDPRConsentDialog()代替)
  showGDPRAuth()async{
     ATInitManger.showGDPRAuth();
  }
  // v6.2.87+, 展示GDPR的界面(UMP)
  showGDPRConsentDialog()async{
     ATInitManger.showGDPRConsentDialog();
  }

  // 获取GDPR的监听事件回调
  initListen() {
    ATListenerManager.initEventHandler.listen((value) {

      if (value.userLocation != null) {
        switch (value.userLocation) {
          case InitUserLocation.initUserLocationInEU:
            print("flutter Monitor initial user location in the EU--");

            ATInitManger.getGDPRLevel().then((value) {
              if (value == ATInitManger.dataConsentSetUnknown()) {
                showGDPRAuth();
              }
            });
            break;
          case InitUserLocation.initUserLocationOutOfEU:
            print("flutter: flutter The location of the listening initial user is not in the EU");
            break;
          case InitUserLocation.initUserLocationUnknown:
            print("flutter: flutter The location of the initial listening user is unknown");
            break;
        }
      }

      if (value.consentDismiss != null) {
        print("flutter: flutter consent dismiss callback");
      }

    });
  }
}
```

**导入TUSDK** `import 'package:thinkup_sdk/at_index.dart';`

复制代码

```
 _initTopon() async {
     await ATInitManager.initAnyThinkSDK(
         appidStr: 'you appid',
         appidkeyStr: 'you appkey')
  }
```

**完整的示例代码：**

复制代码

```
import 'package:thinkup_sdk/at_index.dart';
import '../configuration_sdk.dart';

final InitManger = InitTool();

class InitTool{
  // 打开SDK的Debug log，强烈建议在测试阶段打开，方便排查问题。
  setLogEnabled() async {
         ATInitManger
        .setLogEnabled(
      logEnabled: true,
    );
  }
  // 设置渠道，可用于统计数据和进行流量分组
  setChannelStr() async {
         ATInitManger
        .setChannelStr(
      channelStr: "test_setChannel",
    );
  }
  // 设置子渠道，可用于统计数据和进行流量分组
  setSubchannelStr() async {
        ATInitManger
        .setSubChannelStr(
      subchannelStr: "test_setSubchannelStr",
    );
  }
  // 设置自定义的Map信息，可匹配后台配置的对应流量分组（App纬度）（可选配置）
  setCustomDataDic() async {
      ATInitManger.setCustomDataMap(
      customDataMap: {
        'setCustomDataDic': 'myCustomDataDic',
      },
    );
  }
  // 设置排除交叉推广App列表
  setExludeBundleIDArray() async {
      ATInitManger.setExludeBundleIDArray(
      exludeBundleIDList: ['test_setExludeBundleIDArray'],
    );
  }
  // 设置自定义的Map信息，可匹配后台配置的对应的流量分组（Placement纬度）（可选配置）
  setPlacementCustomData() async {
      ATInitManger.setPlacementCustomData(
      placementIDStr: 'b5b72b21184aa8',
      placementCustomDataMap: {'setPlacementCustomData': 'test_setPlacementCustomData'},
    );
  }
  // 判断是否位于欧盟地区
  getUserLocation() async {
      ATInitManger.getUserLocation().then((value) {
      print('flutter: Get user location -- ${value.toString()}');
    });
  }
  // 获取GDPR的授权级别
  getGDPRLevel() async {
     await ATInitManger.getGDPRLevel().then((value) {
      print('flutter:Get GDPR --${value.toString()}');
    });
  }
  setDataConsentSet() async {

        ATInitManger.setDataConsentSet(
        gdprLevel:
    ATInitManger.dataConsentSetPersonalized());
  }

  deniedUploadDeviceInfo() async {

     ATInitManger
        .deniedUploadDeviceInfo(
        deniedUploadDeviceInfoList: [ATInitManger.aOAID()]);
  }
  // 初始化TopOn的SDK
  initTopon() async {
    await ATInitManger.initAnyThinkSDK(
        appidStr: Configuration.appidStr,
        appidkeyStr: Configuration.appidkeyStr);
  }
  // 展示GDPR的界面 (v6.2.87废弃，请使用showGDPRConsentDialog()代替)
  showGDPRAuth()async{
     ATInitManger.showGDPRAuth();
  }
  // v6.2.87+, 展示GDPR的界面(UMP)
  showGDPRConsentDialog()async{
     ATInitManger.showGDPRConsentDialog();
  }

  // 获取GDPR的监听事件回调
  initListen() {
    ATListenerManager.initEventHandler.listen((value) {

      if (value.userLocation != null) {
        switch (value.userLocation) {
          case InitUserLocation.initUserLocationInEU:
            print("flutter Monitor initial user location in the EU--");

            ATInitManger.getGDPRLevel().then((value) {
              if (value == ATInitManger.dataConsentSetUnknown()) {
                showGDPRAuth();
              }
            });
            break;
          case InitUserLocation.initUserLocationOutOfEU:
            print("flutter: flutter The location of the listening initial user is not in the EU");
            break;
          case InitUserLocation.initUserLocationUnknown:
            print("flutter: flutter The location of the initial listening user is unknown");
            break;
        }
      }

      if (value.consentDismiss != null) {
        print("flutter: flutter consent dismiss callback");
      }

    });
  }
}
```

**打开SDK的Debug log，强烈建议在测试阶段打开，方便排查问题。**

复制代码

```
  _setLogEnabled() async {
       ATInitManager
        .setLogEnabled(
      logEnabled: true,
    );
  }
```

## **2. App自定义规则**

### **2.1 设置渠道**

复制代码

```
  _setChannelStr() async {
       ATInitManager
        .setChannelStr(
      channelStr: "123",
    );
  }
```

### **2.2 设置子渠道**

复制代码

```
_setSubchannelStr() async {
      ATInitManager
        .setSubchannelStr(
      subchannelStr: "456",
    );
  }
```

### **2.3 设置自定义的Map信息**

可匹配后台配置的对应流量分组（App纬度）（可选配置）

复制代码

```
 _setCustomDataDic() async {
      ATInitManager.setCustomDataMap(
      customDataMap: {
        '1': 'a',
      },
    );
  }
```

### **2.4 设置广告位自定义的Map信息**

可匹配后台配置的对应的流量分组（Placement纬度）（可选配置）

复制代码

```
  _setPlacementCustomData() async {
      ATInitManager.setPlacementCustomData(
      placementIDStr: '4',
      placementCustomDataMap: {'b': '4'},
    );
  }
```

## **3. 交叉推广**

**设置排除交叉推广App列表，移除不需要进行广告推广的项目，传入项目的Appid(苹果后台的id)数组。**

复制代码

```
 _setExludeBundleIDArray() async {
      ATInitManager.setExludeBundleIDList(
      exludeBundleIDList: ['3'],
    );
  }
```

## **4. GDPR说明**

GDPR是欧盟发布于2018年5月25日的《通用数据保护条例》简称，如果你的项目需要在欧盟地区发布，请完成接入。

### 4.1 Google UMP（v6.2.87+）

请参考  [Android Google UMP 适配使用指南](https://help.toponad.com/cn/docs/Google-UMP-shi-pei-shi-yong-zhi-nan-IKqd) 、 [iOS Google UMP 适配使用指南](https://help.toponad.com/cn/docs/Google-UMP-shi-pei-shi-yong-zhi-nan-fMgm) 完成UMP的集成和配置，并使用以下api进行UMP GDPR弹窗和SDK初始化

复制代码

```
  // v6.2.87+, 展示GDPR的界面(UMP)
  showGDPRConsentDialog()async{
     ATInitManger.showGDPRConsentDialog();
  }

  // 获取GDPR的监听事件回调
  initListen() {
    ATListenerManager.initEventHandler.listen((value) {
      //注意：需要在此回调中进行SDK初始化并且初始化后再进行广告加载
      if (value.consentDismiss != null) {
        print("flutter: flutter consent dismiss callback");
      }
    });
  }
```

**注意：** 需要在SDK初始化后再发起广告请求

### **4.2 获取GDPR等级**

复制代码

```
 _getGDPRLevel() async {
    await  ATInitManager.getGDPRLevel().then((value) {
      print('获取GDPR');
    });
  }
```

### **4.3 设置GDPR等级（v6.2.87以下版本）**

**ATInitManager.dataConsentSetPersonalized()**: 这个级别代表用户同意SDK收集并使用他的个人数据来为他提供相关性更高、更适合他的广告。

**ATInitManager.dataConsentSetNonpersonalized()**: 如果数据保护级别设置为这个值，SDK不会收集用户个人数据，因为提供的广告可能不会符合用户的情况。另外，在这种情况下，某些不涉及用户隐私的数据可能仍会被收集。

复制代码

```
   setDataConsentSet() async {

        ATInitManager.setDataConsentSet(
        gdprLevel:
    ATInitManager.dataConsentSetPersonalized());
  }
```

**判断是否位于欧盟地区，针对欧盟地区初始化时做的处理**

复制代码

```
  _getUserLocation() async {
     ATInitManager.getUserLocation();
  }
```

**如果处于欧盟地区且等级是UNKNOW时，就执行授权弹窗**

复制代码

```
  showGDPRAuth()async{
     ATInitManager.showGDPRAuth();
  }

  initListen() {
    ATListenerManager.initEventHandler.listen((value) {
      switch (value.userLocation) {
        case InitUserLocation.initUserLocationInEU:
          print("flutter监听初始化用户位置在欧盟--");

          ATInitManager.getGDPRLevel().then((value) {
              if (value == ATInitManager.dataConsentSetUnknown()) {
                showGDPRAuth();
              }
          });

          break;
        case InitUserLocation.initUserLocationOutOfEU:
          print("flutter监听初始化用户位置不在欧盟");
          break;
        case InitUserLocation.initUserLocationUnknown:
          print("flutter监听初始化用户位置未知");
          break;
      }
    });
  }
```

## **5. 限制上报隐私数据**

注意：当开发者限制了上报的设备数据时可能会影响TopOn功能的正常使用，如**流量分组、交叉推广、TopOn Adx**等功能，**请开发者谨慎设置**。

复制代码

```
deniedUploadDeviceInfo() async {

        ATInitManager
        .deniedUploadDeviceInfo(
        deniedUploadDeviceInfoList: [
          ATInitManager.aVersionNameKey(),
          ATInitManager.aVersionCodeKey(),
          ATInitManager.aPackageNameKey(),
          ATInitManager.aAppVersionNameKey(),
          ATInitManager.aAppVersionCodeKey(),
          ATInitManager.aBrandKey(),
          ATInitManager.aModelKey(),
          ATInitManager.aScreenKey(),
          ATInitManager.aNetworkTypeKey(),
          ATInitManager.aMNCKey(),
          ATInitManager.aMCCKey(),
          ATInitManager.aLanguageKey(),
          ATInitManager.aTimeZoneKey(),
          ATInitManager.aUserAgentKey(),
          ATInitManager.aOrientKey(),
          ATInitManager.aIDFAKey(),
          ATInitManager.aIDFVKey(),
          ATInitManager.aANDROID(),
          ATInitManager.aGAID(),
          ATInitManager.aINSTALLER(),
          ATInitManager.aMAC(),
          ATInitManager.aIMEI(),
          ATInitManager.aOAID(),

        ]);
    });
  }
```

参数说明：

| Key | Note |
| --- | --- |
| ATInitManager.aVersionNameKey() | 系统版本名 |
| ATInitManager.aVersionCodeKey() | 系统版本号 |
| ATInitManager.aPackageNameKey() | 应用包名 |
| ATInitManager.aAppVersionNameKey() | 应用版本名 |
| ATInitManager.aAppVersionCodeKey() | 应用版本号 |
| ATInitManager.aBrandKey() | 设备品牌 |
| ATInitManager.aModelKey() | 设备型号 |
| ATInitManager.aScreenKey() | 屏幕分辨率 |
| ATInitManager.aNetworkTypeKey() | 网络类型 |
| ATInitManager.aMNCKey() | 移动网络代码 |
| ATInitManager.aMCCKey() | 移动国家代码 |
| ATInitManager.aLanguageKey() | 系统语言 |
| ATInitManager.aTimeZoneKey() | 时区 |
| ATInitManager.aUserAgentKey() | User Agent |
| ATInitManager.aOrientKey() | 屏幕方向 |
| ATInitManager.aIDFAKey() | idfa |
| ATInitManager.aIDFVKey() | idfv |
| ATInitManager.aANDROID() | Android ID |
| ATInitManager.aGAID() | Google Ad ID |
| ATInitManager.aINSTALLER() | 应用安装来源 |
| ATInitManager.aMAC() | MAC地址 |
| ATInitManager.aIMEI() | 国际移动设备识别码 |
| ATInitManager.aOAID() | OAID |
