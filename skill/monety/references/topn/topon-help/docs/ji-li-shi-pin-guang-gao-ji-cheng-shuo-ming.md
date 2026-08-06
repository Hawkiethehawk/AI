---
title: "激励视频广告集成说明"
source: "https://help.toponad.net/cn/docs/ji-li-shi-pin-guang-gao-ji-cheng-shuo-ming"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "集成基础说明", "激励视频广告集成说明"]
content_sha256: "61e42345c197eebcf2cce3cc3c5918ee88502872876740f5e2a45740831f8b81"
knowledge_role: "reference_only"
has_article_body: true
---

# 激励视频广告集成说明

## **1**. 激励视频广告介绍

激励视频广告是聚合了其他第三方广告平台的激励视频广告，可以使用ATRewardedVideo的API来实现广告的加载和播放。目前支持两种集成方式，具体说明如下：

| 模式（二选一） | 说明 |
| --- | --- |
| 手动请求模式 | 由自行通过API选择合适的时机调用广告加载，具体参照文档下方集成建议 |
| 全自动加载模式 | TopOn推出的一站式请求维护方案，能够根据用户的使用状态和广告消耗进度，自动判断下一条广告的预加载和缓存时机，以达到更优的加载效果，具体见：[激励视频广告全自动加载模式](/cn/docs/Xactf8) |

## **2**. 接入流程建议

1. 启动应用时通过调用ATRewardedVideo#loadVideoAd来加载广告
2. 在需要展示广告的位置通过ATRewardedVideo#hasAdReady判断是否能展示
3. 广告预加载：
4. 如需使用[广告场景](/cn/docs/1RWLAv)区分不同业务场景的数据，具体参考示例代码

## **3**. API说明

ATRewardedVideo：

| API | 参数 | 说明 |
| --- | --- | --- |
| loadVideoAd | string placementid，Dictionary | 加载广告 |
| setListener | ATRewardedVideoListener listener | 设置监听回调接口 **（5.9.51版本之后废弃）** |
| hasAdReady | string placementid | 判断是否有广告缓存 |
| showAd | string placementid | 显示广告 |
| showAd | string placementid，Dictionary | 使用场景功能更显示广告 |
| entryScenarioWithPlacementID | string placementid，string scenarioID | 设置进入可展示广告场景 |

## **4**. 加载激励视频

使用以下代码加载激励视频广告:

java
复制代码

```
public void loadVideo()
{
    ATRewardedVideo.Instance.client.onAdLoadEvent += onAdLoad;
    ATRewardedVideo.Instance.client.onAdLoadFailureEvent += onAdLoadFail;
    ATRewardedVideo.Instance.client.onAdVideoStartEvent  += onAdVideoStartEvent;
    ATRewardedVideo.Instance.client.onAdVideoEndEvent  += onAdVideoEndEvent;
    ATRewardedVideo.Instance.client.onAdVideoFailureEvent += onAdVideoPlayFail;
    ATRewardedVideo.Instance.client.onAdClickEvent += onAdClick;
    ATRewardedVideo.Instance.client.onRewardEvent += onReward;
    ATRewardedVideo.Instance.client.onAdVideoCloseEvent += onAdVideoClosedEvent;

    Dictionary jsonmap = new Dictionary();
    //如果需要通过开发者的服务器进行奖励的下发（部分广告平台支持此服务器激励），则需要传递下面两个key
    //ATConst.USERID_KEY必传，用于标识每个用户;ATConst.USER_EXTRA_DATA为可选参数，传入后将透传到开发者的服务器
    jsonmap.Add(ATConst.USERID_KEY, "test_user_id");
    jsonmap.Add(ATConst.USER_EXTRA_DATA, "test_user_extra_data");

    ATRewardedVideo.Instance.loadVideoAd(mPlacementId_rewardvideo_all,jsonmap);
}
```

**注:** 请参阅下文，了解如何获得有关激励视频广告事件的通知（加载成功/失败，展示，点击，视频开始/结束和激励）。

## **5**. 判断是否有广告缓存

java
复制代码

```
ATRewardedVideo.Instance.hasAdReady(mPlacementId_rewardvideo_all);
```

## **6**. 展示激励视频

与展示原生广告相比，展示激励视频要简单得多，只要调用展示api并传递展示广告位ID作为参数：

java
复制代码

```
public void showVideo()
{
    Debug.Log ("Developer show video....");
    ATRewardedVideo.Instance.showAd(mPlacementId_rewardvideo_all);
}
```

当用到 **场景** 功能时：

java
复制代码

```
public void showVideo()
{
    Debug.Log ("Developer show video....");
    Dictionary jsonmap = new Dictionary();
    jsonmap.Add(AnyThinkAds.Api.ATConst.SCENARIO, showingScenarioID);
    //插件2.1.8新增展示时透传自定义参数
    jsonmap.Add(AnyThinkAds.Api.ATConst.ShowConfig.SHOW_CUSTOM_EXT, showCustomExt);
    ATRewardedVideo.Instance.showAd(mPlacementId_rewardvideo_all, jsonmap);
}
```

## **7. 实现激励广告的多个监听器**

回调信息详情请查看：[回调信息说明](/cn/docs/hui-diao-xin-xi-shuo-ming-agVG)

使用以下代码实现多个监听器

java
复制代码

```
         /广告加载成功
        ATRewardedVideo.Instance.client.onAdLoadEvent += onAdLoad;
        //广告加载失败
        ATRewardedVideo.Instance.client.onAdLoadFailureEvent += onAdLoadFail;
        //广告展示的回调（可依赖这个回调统计展示数据）
        ATRewardedVideo.Instance.client.onAdVideoStartEvent  += onAdVideoStartEvent;
        //广告播放结束
        ATRewardedVideo.Instance.client.onAdVideoEndEvent  += onAdVideoEndEvent;
        //广告视频播放失败
        ATRewardedVideo.Instance.client.onAdVideoFailureEvent += onAdVideoPlayFail;
        //广告点击
        ATRewardedVideo.Instance.client.onAdClickEvent += onAdClick;
        //广告激励回调（可依赖该监听下发游戏激励）
        ATRewardedVideo.Instance.client.onRewardEvent += onReward;
        //广告被关闭
        ATRewardedVideo.Instance.client.onAdVideoCloseEvent += onAdVideoClosedEvent;
```

方法定义参数如下代码（**注意 : 方法名可参考以下代码或者自定义方法名，但参数必须一致**）

java
复制代码

```
    //广告加载成功
    public void onAdLoad(object sender,ATAdEventArgs erg)
    {
        Debug.Log("Developer callback onAdLoad :" + erg.placementId);
    }
    //广告加载失败
    public void onAdLoadFail(object sender,ATAdErrorEventArgs erg )
    {
        Debug.Log("Developer callback onAdLoadFail :" + erg.placementId + "--erg.code:" + code + "--msg:" + erg.message);
    }

     public void onAdVideoStartEvent(object sender, ATAdEventArgs erg) {
        Debug.Log("Developer onAdVideoStartEvent------" + "->" + JsonMapper.ToJson(erg.callbackInfo.toDictionary()));
    }

    public void onAdVideoEndEvent(object sender, ATAdEventArgs erg)
    {
        Debug.Log("Developer onAdVideoEndEvent------" + "->" + JsonMapper.ToJson(erg.callbackInfo.toDictionary()));
    }

    public void onAdVideoPlayFail(object sender, ATAdErrorEventArgs erg)
    {
        Debug.Log("Developer onAdVideoClosedEvent------" + "->" + JsonMapper.ToJson(erg.errorMessage));
    }

    //sender 为广告类型对象，erg为返回信息
    //广告被点击
    public void onAdClick(object sender,ATAdEventArgs erg)
    {
        Debug.Log("Developer callback onAdClick :" + erg.placementId);
    }

    public void onReward(object sender, ATAdEventArgs erg)
    {
        Debug.Log("Developer onReward------" + "->" + JsonMapper.ToJson(erg.callbackInfo.toDictionary()));
    }

    public void onAdVideoClosedEvent(object sender, ATAdEventArgs erg)
    {
        Debug.Log("Developer onAdVideoClosedEvent------" + "->" + JsonMapper.ToJson(erg.callbackInfo.toDictionary()));
    }
```
