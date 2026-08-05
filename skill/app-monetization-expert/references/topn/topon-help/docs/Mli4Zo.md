---
title: "插屏广告"
source: "https://help.toponad.net/cn/docs/Mli4Zo"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Flutter接入指南", "插屏广告"]
content_sha256: "932ed90d053cd7bd1d2e63abfb7452824777c1cbb2b1ffb15ea2d051c7e640d3"
knowledge_role: "reference_only"
has_article_body: true
---

# 插屏广告

## 1. 插屏广告

**插屏广告SDK的导入**：

复制代码

```
import 'package:secmtp_sdk/at_index.dart';
```

复制代码

```
import 'package:thinkup_sdk/at_index.dart';
```

### 1.1 加载插屏广告

**使用以下代码加载Interstitial广告**

复制代码

```
loadInterstitialAd() async {
        ATinterstitialManager
        .loadInterstitialAd(placementID: 'you placementId', extraMap: {});
  }
```

**只针对Sigmob平台，Sigmob的激励视频广告源当做插屏使用**（可选，注意：开启后TopOn后台Sigmob插屏广告源需配置成Sigmob的激励视频参数）

复制代码

```
loadInterstitialAd() async {
         ATinterstitialManager
        .loadInterstitialAd(placementID: 'you placementId', extraMap: {
            ATinterstitialManager.UseRewardedVideoAsInterstitialKey(): true
        });
  }
```

### 1.2 判断是否有广告缓存以及获取广告状态

**使用以下代码判断是否有广告缓存**：

复制代码

```
 _hasInterAdReady() async {
    await ATinterstitialManager
        .hasInterstitialAdReady(
      placementID: 'you placementId',
    )
        .then((value) {
      print('flutter插屏广告视频缓存$value');
    });
  }
```

### 1.3 到达场景

复制代码

```
entryInterstitialScenario(String placementID, String sceneID) async {
        ATInterstitialManager.entryInterstitialScenario(
        placementID: 'you placementId',
        sceneID: 'you sceneID',
        );
  }
```

### 1.4 展示插屏广告

**插屏广告只要调用展示api并传递展示广告位ID**

复制代码

```
_showInterAd() async {
        ATinterstitialManager
        .showInterstitialAd(
      placementID: 'you placementId',
    );
  }
```

**当使用场景功能时，通过此api展示广告,参数为:广告位ID+场景ID(场景ID可通过TopOn后台创建）**

复制代码

```
showSceneInterstitialAd() async {
        ATinterstitialManager
        .showSceneInterstitialAd(
      placementID: 'you placementId',
      sceneID: 'you sceneID',
    );
  }
```

### 1.5 实现插屏的监听器

**ATInterstitialResponse属性介绍:**

**InterstitialStatus**: 插屏广告状态

**placementID**: placementID

**requestMessage**: 请求信息（错误信息）

**extraMap**: [回调信息](/cn/docs/f2CoYu)

**isDeeplinkSuccess**: isDeeplinkSuccess

**有关插屏广告事件的通知示例如下**:

复制代码

```
_interListen() {

    ATListenerManager.interstitialEventHandler.listen((value) {

      switch (value.interstatus) {
        //广告加载失败
        case InterstitialStatus.interstitialAdFailToLoadAD:
          print("flutter interstitialAdFailToLoadAD ---- placementID: ${value.placementID} ---- errStr:${value.requestMessage}");
          break;
        //广告加载成功
        case InterstitialStatus.interstitialAdDidFinishLoading:
          print("flutter interstitialAdDidFinishLoading ---- placementID: ${value.placementID}");
          break;
        //广告视频开始播放，部分平台有此回调
        case InterstitialStatus.interstitialAdDidStartPlaying:
          print("flutter interstitialAdDidStartPlaying ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告视频播放结束，部分广告平台有此回调
        case InterstitialStatus.interstitialAdDidEndPlaying:
          print("flutter interstitialAdDidEndPlaying ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告视频播放失败，部分广告平台有此回调
        case InterstitialStatus.interstitialDidFailToPlayVideo:
          print("flutter interstitialDidFailToPlayVideo ---- placementID: ${value.placementID} ---- errStr:${value.requestMessage}");
          break;
        //广告展示成功
        case InterstitialStatus.interstitialDidShowSucceed:
          print("flutter interstitialDidShowSucceed ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告展示失败
        case InterstitialStatus.interstitialFailedToShow:
          print("flutter interstitialFailedToShow ---- placementID: ${value.placementID} ---- errStr:${value.requestMessage}");
          break;
        //广告被点击
        case InterstitialStatus.interstitialAdDidClick:
          print("flutter interstitialAdDidClick ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //Deeplink
        case InterstitialStatus.interstitialAdDidDeepLink:
          print("flutter interstitialAdDidDeepLink ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;
        //广告被关闭
        case InterstitialStatus.interstitialAdDidClose:
          print("flutter interstitialAdDidClose ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
          break;

        case InterstitialStatus.interstitialUnknown:
          print("flutter interstitialUnknown");
          break;
      }
    });
}
```
