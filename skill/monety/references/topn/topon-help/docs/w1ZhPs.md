---
title: "激励广告"
source: "https://help.toponad.net/cn/docs/w1ZhPs"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Flutter接入指南", "激励广告"]
content_sha256: "fd620bed298c5c4a4fda31e49a505dd798843c6d5fd7ddeef6de2e4956e06efe"
knowledge_role: "reference_only"
has_article_body: true
---

# 激励广告

## 1. 激励视频广告

**激励广告SDK的导入**：

复制代码

```
import 'package:secmtp_sdk/at_index.dart';
```

复制代码

```
import 'package:thinkup_sdk/at_index.dart';
```

### 1.1 加载激励视频

如果需要通过开发者的服务器进行奖励的下发（部分广告平台支持服务器激励），则要传以下参数，传入后将透传到开发者的服务器。

kATAdLoadingExtraUserIDKey(): String，必传，用于标识每个用户，

kATAdLoadingExtraUserDataKeywordKey():String，选传，用户自定义一些参数。

复制代码

```
 _loadRewardedVideo() async {
        ATRewardedManager.loadRewardedVideo(
        placementID: 'you placementId',
        extraMap: {
          ATRewardedManager.kATAdLoadingExtraUserDataKeywordKey(): '1234',
          ATRewardedManager.kATAdLoadingExtraUserIDKey(): '1234',
        });
  }
```

### 1.2 判断是否有广告缓存以及获取广告状态

**使用以下代码判断是否有广告缓存**：

复制代码

```
 _hasAdReady() async {
    await ATRewardedManager
        .rewardedVideoReady(
      placementID: 'you placementId',
    ).then((value) {
      print('广告视频缓存$value');
    });
  }
```

### 1.3 到达场景

复制代码

```
entryRewardedVideoScenario(String placementID, String sceneID) async {
        ATRewardedManager.entryRewardedVideoScenario(
        placementID: 'you placementId',
        sceneID: 'you sceneID',
    );
  }
```

### 1.4 展示激励视频

**展示激励视频只要调用展示api并传递展示广告位ID**

复制代码

```
 _showAd() async {
        ATRewardedManager
        .showRewardedVideo(
      placementID: 'you placementId',
    );
  }
```

**当使用场景功能时，通过此api展示广告,参数为:广告位ID+场景ID(场景ID可通过TopOn后台创建）**

复制代码

```
showSceneRewardedAd() async {
         ATRewardedManager
        .showSceneRewardedVideo(
      sceneID: 'you sceneID',
      placementID: 'you placementId',
    );
  }
```

### 1.5 实现激励视频的监听器

**ATRewardResponse属性介绍:**

**RewardedStatus**: 激励视频状态

**placementID**: placementID

**requestMessage**: 请求信息（错误信息）

**extraMap**: [回调信息](/cn/docs/f2CoYu)

**isDeeplinkSuccess**: isDeeplinkSuccess

**可查看下面的示例代码:**

复制代码

```
_rewarderListen() {

    ATListenerManager.rewardedVideoEventHandler.listen((value) {

          switch (value.rewardStatus) {
              //广告加载失败
            case RewardedStatus.rewardedVideoDidFailToLoad:
              print("flutter rewardedVideoDidFailToLoad ---- placementID: ${value.placementID} ---- errStr:${value.requestMessage}");
              break;
            //广告加载成功
            case RewardedStatus.rewardedVideoDidFinishLoading:
              print("flutter rewardedVideoDidFinishLoading ---- placementID: ${value.placementID}");
              break;
            //广告开始播放
            case RewardedStatus.rewardedVideoDidStartPlaying:
              print("flutter rewardedVideoDidStartPlaying ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
              break;
            //广告结束播放
            case RewardedStatus.rewardedVideoDidEndPlaying:
              print("flutter rewardedVideoDidEndPlaying ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
              break;
            //广告播放失败
            case RewardedStatus.rewardedVideoDidFailToPlay:
              print("flutter rewardedVideoDidFailToPlay ---- placementID: ${value.placementID} ---- errStr:${value.extraMap}");
              break;
            //激励成功，建议在此回调中下发奖励
            case RewardedStatus.rewardedVideoDidRewardSuccess:
              print("flutter rewardedVideoDidRewardSuccess ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
              break;
            //广告被点击
            case RewardedStatus.rewardedVideoDidClick:
              print("flutter rewardedVideoDidClick ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
              break;
            //Deeplink
            case RewardedStatus.rewardedVideoDidDeepLink:
              print("flutter rewardedVideoDidDeepLink ---- placementID: ${value.placementID} ---- extra:${value.extraMap} ---- isDeeplinkSuccess:${value.isDeeplinkSuccess}");
              break;
            //广告被关闭
            case RewardedStatus.rewardedVideoDidClose:
              print("flutter rewardedVideoDidClose ---- placementID: ${value.placementID} ---- extra:${value.extraMap}");
              break;
            case RewardedStatus.rewardedVideoUnknown:
              print("flutter rewardedVideoUnknown");
              break;
          }
        });
 }
```
