---
title: "原生广告"
source: "https://help.toponad.net/cn/docs/yiXh9k"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Flutter接入指南", "原生广告"]
content_sha256: "092baa4a46d7183f561db0a48b3cb161463debb2940bb1d0a3033ef64dbf26ce"
knowledge_role: "reference_only"
has_article_body: true
---

# 原生广告

## 1.原生广告

**原生广告SDK的导入**：

复制代码

```
import 'package:secmtp_sdk/at_index.dart';
```

复制代码

```
import 'package:thinkup_sdk/at_index.dart';
```

**Android上需要注意的： 使用原生的视频广告必须在AndroidManifest开启硬件加速，处理方式如下** ：

复制代码

```
<application
        android:hardwareAccelerated="true">
        ....
</application>
```

### 1.1 加载原生广告

**加载原生广告时需要传入广告展示的宽高**

复制代码

```
 _loadnativeAd() async {
        ATNativeManager.loadNativeAd(placementID: 'you placementId',
        extraMap: {
          ATCommon.isNativeShow(): false, //是否使用platformView
          ATCommon.getAdSizeKey(): ATNativeManager.createNativeSubViewAttribute(
            300,
            250,
          ),//设置加载广告宽高
          ATNativeManager.isAdaptiveHeight(): false  //是否自适应高度，部分广告平台支持，如穿山甲，快手，京媒
        });
  }
```

### 1.2 判断是否有广告缓存以及获取广告状态

**使用以下代码判断是否有广告缓存**：

复制代码

```
 _hasNativeAdReady() async {
    await ATNativeManager
        .nativeAdReady(
      placementID: 'b5bacad80a0fb1',
    ).then((value) {
      print('flutter原生广告视频缓存$value');
    });
  }
```

### 1.3 到达场景

复制代码

```
entryNativeScenario() async {
        ATNativeManager.entryNativeScenario(
        placementID:  'you placementId',
        sceneID: 'you sceneID',
        );
  }
```

### 1.4 展示原生广告

**原生广告实现方式为platformView，所以只需要在广告加载成功后，初始化PlatformNativeWidget这个组件即可使用**

#### **1.4.1 PlatformNativeWidget属性说明:**

**placementID**: 广告ID

**extraMap**: 原生广告内部子控件的坐标和大小

**sceneID**: 场景ID(可选参数)

**您可以使用以下代码显示原生广告**：

复制代码

```
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("native text"),
      ),
      body: SafeArea(
          child: Container(
            height: topSizeTool.getHeight(),
            color: Colors.black,
            child: PlatformNativeWidget(
              Configuration.nativePlacementID,
                {
                    ATNativeManager.parent(): ATNativeManager.createNativeSubViewAttribute(
                      topSizeTool.getWidth(), 340,
                      backgroundColorStr: '#FFFFFF'
                    ),
                    ATNativeManager.appIcon(): ATNativeManager.createNativeSubViewAttribute(
                        50, 50,
                        x: 10, y: 40, backgroundColorStr: 'clearColor'),
                    ATNativeManager.mainTitle(): ATNativeManager.createNativeSubViewAttribute(
                      topSizeTool.getWidth() - 190,
                      20,
                      x: 70,
                      y: 40,
                      textSize: 15,
                    ),
                    ATNativeManager.desc(): ATNativeManager.createNativeSubViewAttribute(
                        topSizeTool.getWidth() - 190, 20,
                        x: 70, y:70, textSize: 15),
                    ATNativeManager.cta(): ATNativeManager.createNativeSubViewAttribute(
                      100,
                      50,
                      x: topSizeTool.getWidth() - 110,
                      y: 40,
                      textSize: 15,
                      textColorStr: "#FFFFFF",
                      backgroundColorStr: "#2095F1"
                    ),
                    ATNativeManager.mainImage(): ATNativeManager.createNativeSubViewAttribute(
                        topSizeTool.getWidth() - 20, topSizeTool.getWidth() * 0.6,
                        x: 10, y: 100, backgroundColorStr: '#00000000'),
                    ATNativeManager.adLogo(): ATNativeManager.createNativeSubViewAttribute(
                        20, 10,
                        x: 10,
                        y: 10,
                        backgroundColorStr: '#00000000'),
                    ATNativeManager.dislike(): ATNativeManager.createNativeSubViewAttribute(
                      20,
                      20,
                      x: topSizeTool.getWidth() - 30,
                      y: 10,
                    ),
                    ATNativeManager.elementsView(): ATNativeManager.createNativeSubViewAttribute(
                      topSizeTool.getWidth(),
                      25,
                      x: 0,
                      y: 315,
                      textSize: 12,
                      textColorStr: "#FFFFFF",
                      backgroundColorStr: "#7F000000"
                    ),
              }
            ),
          )
      ),
    );
  }
```

#### **1.4.2** ATNativeManager.createNativeSubViewAttribute

##### 1.4.2.1 Map中key解释说明:

**parent**：控制的是Native的总体大小，如下图红圈区域：

**appIcon** : appIcon属性控制广告的图标属性，如下图1所示：

**mainImage**: mainImage控制广告的封面图，如下图2所示：

**title**: title控制广告标题，如下图3所示：

**desc** : desc控制广告描述文字，如下图4所示

**adLogo** : adLogo控制广告标识属性，如下图5所示. 注意： 有的平台的广告标识位置是内部固定，不支持开发者指定，比如Admob。

**cta**: cta控制点击按钮，如下图6所示

**dislike**：关闭按钮

**elementsView**：（v6.2.37新增）apk六要素（仅Android中国区SDK生效）

**customView**：（v6.2.37新增）自定义控件，参考下方ATCustomViewNative说明
**原生自渲染信息流素材示例图图解：**

复制代码

```
Map createNativeSubViewAttribute(
      double width,
      double height,
    { double x = 0,
      double y = 0,
      String backgroundColorStr = '#FFFFFF',
      String textColorStr = '#000000',
      String textAlignmentStr = 'left',
      double textSize = 15,
      bool isCustomClick =  true}
 )
```

函数说明:

1.**x:横坐标位置（以左上角为原点）**

2.**y:纵坐标位置（以左上角为原点）**

3.**width: 宽度**

4.**height: 高度**

5.**backgroundColor: 背景颜色**

6.**textColor: 字体颜色（只针对有Text的View有效）**

7.**textSize: 字体大小（只针对有Text的View有效）**

8.**textAlignment: 字体对齐方式（只针对有Text的View有效且只针对iOS），left:左对齐，center:居中对齐，right：右对齐**

9.**isCustomClick: 是否点击时直接下载（只针对Android且只针对腾讯广告平台的应用类广告有效）**

10.**ATCustomViewNative**:（v6.2.37新增）自定义控件的枚举类型\*\*（image：图片；label：文本；）\*\*

11.**imagePath**:（v6.2.37新增）开发项目中图片的放置路径（当ATCustomViewNative指定为**image**时有效）

12.**title**:（v6.2.37新增）需要展示的自定义文本字符串（当ATCustomViewNative指定为**label**时有效）

##### **1.3.2.2 颜色和高度说明**

**关于颜色的透明的设置**：

**Android**：可直接在原来设置的设置增加alpha的两位16进制的值即可，比如设置色值“#ffffff”的透明度为0，就设置成“#00ffffff”，这样颜色就是完全透明，透明的值可根据实际情况调整。

**iOS**：只能通过设置字符串：“clearColor” 来指定完全透明的颜色，不支持颜色的半透明设置。

**模板渲染广告自适应高度**：

开发者可通过以下步骤实现自适应高度（加载时自适应高度仅针对**Android的穿山甲、优量汇平台**）

**注意**：

- 使用自适应高度时，可能会出现比较高的模板广告，开发者可根据实际需求在广告平台后台勾选需要的宽高比例模板，去除不符合预期的模板
- 自适应高度不受parent的高度控制
- \*\*（此点仅针对Android）\*\*加载时开启自适应高度（需传入Key：ATNativeManager.isAdaptiveHeight()）

复制代码

```
loadNativeWith() async {
        ATNativeManager.loadNativeAd(
        placementID: Configuration.nativePlacementID,
        extraMap: {
          ATCommon.getAdSizeKey(): ATNativeManager.createNativeSubViewAttribute(
            topSizeTool.getWidth(),
            topSizeTool.getHeight(),
          ),
          ATNativeManager.isAdaptiveHeight(): true
        });
  }
```

- 展示时开启自适应高度（需传入isAdaptiveHeight为true）

复制代码

```
PlatformNativeWidget(Configuration.nativePlacementID, {...}
    ,isAdaptiveHeight: true);
```

### 1.5 实现原生广告的Listener

**ATNativeResponse属性介绍:**

**NativeStatus**: 原生广告状态

**placementID**: placementID

**requestMessage**: 请求信息（错误信息）

**extraMap**: [回调信息](/cn/docs/f2CoYu)

**isDeeplinkSuccess**: isDeeplinkSuccess

**要获得有关各种原生广告事件（加载成功/失败，展示和点击等）的通知，下面是一个示例**

复制代码

```
_nativeListen() {

    ATListenerManager.nativeEventHandler.listen((value) {

      switch (value.nativeStatus) {
        //广告加载失败
        case NativeStatus.nativeAdFailToLoadAD:
          print("flutter nativeAdFailToLoadAD ---- placementID: ${value.placementID} ---- errStr:${value.requestMessage}");
          break;
        //广告加载成功
        case NativeStatus.nativeAdDidFinishLoading:
          print("flutter nativeAdDidFinishLoading ---- placementID: ${value.placementID}");
          break;
        //广告被点击
        case NativeStatus.nativeAdDidClick:
          print("flutter nativeAdDidClick ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //Deeplink
        case NativeStatus.nativeAdDidDeepLink:
          print("flutter nativeAdDidDeepLink ---- placementID: ${value.placementID} ---- extra:${value.extraMap} ---- isDeeplinkSuccess:${value.isDeeplinkSuccess}");
          break;
        //广告视频结束播放，部分广告平台有此回调
        case NativeStatus.nativeAdDidEndPlayingVideo:
          print("flutter nativeAdDidEndPlayingVideo ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告进入全屏播放，仅iOS有此回调
        case NativeStatus.nativeAdEnterFullScreenVideo:
          print("flutter nativeAdEnterFullScreenVideo ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告离开全屏播放，仅iOS有此回调
        case NativeStatus.nativeAdExitFullScreenVideoInAd:
          print("flutter nativeAdExitFullScreenVideoInAd ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告展示成功
        case NativeStatus.nativeAdDidShowNativeAd:
          print("flutter nativeAdDidShowNativeAd ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告视频开始播放，部分广告平台有此回调
        case NativeStatus.nativeAdDidStartPlayingVideo:
          print("flutter nativeAdDidStartPlayingVideo ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告关闭按钮被点击，部分广告平台有此回调
        case NativeStatus.nativeAdDidTapCloseButton:
          print("flutter nativeAdDidTapCloseButton ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        case NativeStatus.nativeAdDidCloseDetailInAdView:
          print("flutter nativeAdDidCloseDetailInAdView ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告加载Draw成功，仅iOS有此回调
        case NativeStatus.nativeAdDidLoadSuccessDraw:
          print("flutter nativeAdDidLoadSuccessDraw ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        case NativeStatus.nativeAdUnknown:
          print("flutter downloadUnknown");
          break;
      }
    });
}
```
