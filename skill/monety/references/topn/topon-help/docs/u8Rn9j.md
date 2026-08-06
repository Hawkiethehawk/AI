---
title: "横幅广告"
source: "https://help.toponad.net/cn/docs/u8Rn9j"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Flutter接入指南", "横幅广告"]
content_sha256: "7f4ecd04df6aa1eda2c0aa2999c3dc4e7912f35a5e4969a045d143a8db51860a"
knowledge_role: "reference_only"
has_article_body: true
---

# 横幅广告

## 1.横幅广告

**横幅广告SDK的导入**：

复制代码

```
import 'package:secmtp_sdk/at_index.dart';
```

复制代码

```
import 'package:thinkup_sdk/at_index.dart';
```

### 1.1 加载横幅广告

**使用以下代码加载Banner广告**

复制代码

```
 _loadBannerAd() async {
         ATBannerManager
        .loadBannerAd(placementID: 'you placementId', extraMap: {
      ATCommon.getAdSizeKey():
      // 该高度是根据横幅宽高比为320:50来计算，如果是其他宽高比请按实际来计算。
      ATBannerManager.createLoadbannerAdSize(width, width * (50 / 320)),
    });
  }
```

**ATBannerManager.createLoadbannerAdSize(width,height)函数说明**:

**width**：Banner展示区域的宽度

**height**：Banner展示区域的高度

**注意**：加载Banner广告时必须传入该参数设置，否则会出现Banner不能达到预期展示效果。

**Admob自适应banner**:

复制代码

```
// 针对Admob平台，支持Admob banner广告自适应

    //ATBannerManager.adaptiveOrientationCurrent() 自适应
    //ATBannerManager.adaptiveOrientationPortrait() 竖屏
    //ATBannerManager.adaptiveOrientationLandscape() 横屏

 _loadBannerAd() async {
         ATBannerManager
        .loadBannerAd(placementID: 'you placementId', extraMap: {
      ATCommon.getAdSizeKey():
        ATBannerManager.createLoadbannerAdSize(width, width * (50 / 320)),
      ATBannerManager.getAdaptiveWidthKey(): width,
      ATBannerManager.getAdaptiveOrientationKey(): ATBannerManager.adaptiveOrientationCurrent(),
    });
  }
```

### 1.2 判断是否有广告缓存以及获取广告状态

**使用以下代码判断是否有广告缓存**：

复制代码

```
_hasBannerAdReady() async {
    await ATBannerManager
        .bannerAdReady(
      placementID: 'b5bacad80a0fb1',
    )
        .then((value) {
      print('flutter横幅广告视频缓存$value');
    });
  }
```

### 1.3 到达场景

复制代码

```
entryBannerScenario() async {
        ATBannerManager.entryBannerScenario(
        placementID:  'you placementId',
        sceneID: 'you sceneID',
        );
  }
```

### 1.4 展示横幅广告

#### **1.4.1** platformView

横幅广告实现方式为platformView时，只需要在广告加载成功后，初始化PlatformBannerWidget这个组件即可使用，需要注意的是，使用该方式展示的横幅广告，无法使用以下方法。

**注意：建议做好Banner视图状态控制，避免Flutter频繁刷新界面时，Banner 广告出现的空白情况。**

复制代码

```
// 隐藏横幅广告
ATBannerManager.hideBannerAd(placementID:'xxx')
// 移除横幅广告
ATBannerManager.removeBannerAd(placementID:'xxx')
// 显示横幅广告
ATBannerManager.afreshShowBannerAd(placementID:'xxx')
```

**PlatformBannerWidget属性说明:**

**placementID**: 广告ID

**sceneID**: 场景ID(可选参数)

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
          height: 200,
          color: Colors.black,
          child: PlatformBannerWidget(
            Configuration.bannerPlacementID,
          ),
        )
      ),
    );
  }
}
```

#### 1.4.2 Show API

这种方式是渲染视图进行布局展示到界面上，我们提供了几种API使用

复制代码

```
// 使用坐标进行展示
ATBannerManager.showBannerInRectangle(placementID:'xx',extraMap:{});
// 使用坐标进行展示，并区分场景
ATBannerManager.showSceneBannerInRectangle(placementID:'xx',sceneID:'xxx',extraMap:{})
// 使用固定位置进行展示，提供了固定底部(getAdATBannerAdShowingPositionBottom)和固定顶部(getAdATBannerAdShowingPositionTop)
ATBannerManager.showAdInPosition(placementID:'xx',position:ATCommon.getAdATBannerAdShowingPositionBottom());
// 使用固定位置进行展示，带场景id，提供了固定底部(getAdATBannerAdShowingPositionBottom)和固定顶部(getAdATBannerAdShowingPositionTop)
ATBannerManager.showSceneBannerAdInPosition(placementID:'xx',sceneID:'xx',position:ATCommon.getAdATBannerAdShowingPositionBottom());
```

可以使用以下方式管理视图

复制代码

```
// 隐藏横幅广告
ATBannerManager.hideBannerAd(placementID:'xxx')
// 移除横幅广告
ATBannerManager.removeBannerAd(placementID:'xxx')
// 显示横幅广告
ATBannerManager.afreshShowBannerAd(placementID:'xxx')
```

### 1.5 实现横幅的监听器

**ATBannerResponse属性介绍:**

**BannerStatus**: 横幅广告状态

**placementID**: placementID

**requestMessage**: 请求信息（错误信息）

**extraMap**: [回调信息](/cn/docs/f2CoYu)

**isDeeplinkSuccess**: isDeeplinkSuccess

**要获得有关各种Banner广告事件（加载成功/失败，展示和点击）的通知，示例代码如下:**

复制代码

```
_bannerListen() {

    ATListenerManager.bannerEventHandler.listen((value) {

      switch (value.bannerStatus) {
        //广告加载失败
        case BannerStatus.bannerAdFailToLoadAD:
          print("flutter bannerAdFailToLoadAD ---- placementID: ${value.placementID} ---- errStr:${value.requestMessage}");
          break;
        //广告加载成功
        case BannerStatus.bannerAdDidFinishLoading:
          print("flutter bannerAdDidFinishLoading ---- placementID: ${value.placementID}");
          break;
        //广告自动刷新成功
        case BannerStatus.bannerAdAutoRefreshSucceed:
          print("flutter bannerAdAutoRefreshSucceed ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告被点击
        case BannerStatus.bannerAdDidClick:
          print("flutter bannerAdDidClick ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //Deeplink
        case BannerStatus.bannerAdDidDeepLink:
          print("flutter bannerAdDidDeepLink ---- placementID: ${value.placementID} ---- extra:${value.extraMap} ---- isDeeplinkSuccess:${value.isDeeplinkSuccess}");
          break;
        //广告展示成功
        case BannerStatus.bannerAdDidShowSucceed:
          print("flutter bannerAdDidShowSucceed ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告关闭按钮被点击
        case BannerStatus.bannerAdTapCloseButton:
          print("flutter bannerAdTapCloseButton ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告自动刷新失败
        case BannerStatus.bannerAdAutoRefreshFail:
          print("flutter bannerAdAutoRefreshFail ---- placementID: ${value.placementID} ---- errStr:${value.requestMessage}");
          break;
        case BannerStatus.bannerAdUnknown:
          print("flutter bannerAdUnknown");
          break;
      }
    });
  }
```
