---
title: "全自动加载激励视频"
source: "https://help.toponad.net/cn/docs/Xactf8"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "集成基础说明", "激励视频广告集成说明", "全自动加载激励视频"]
content_sha256: "b9f646ad0b7f1c47a3e6e27ee9bd9b88b0058d863f34f11599bc1fa47303a262"
knowledge_role: "reference_only"
has_article_body: true
---

# 全自动加载激励视频

**全自动加载模式，是TopOn推出的一站式请求维护方案，能够根据用户的使用状态和广告消耗进度，多节点智能判断下一条广告的预加载和缓存时机。在满足开发者运营策略的基础上，规避广告数据实时加载的失败风险和展示机会被浪费，减轻用户因为广告未加载或加载不流畅造成的负面情绪。通过全自动加载方案，开发者可以避免反复冗杂的人工干预请求方案，效率提升立竿见影。**

## **1**. 接入流程建议

1. 启动应用时通过调用ATRewardedAutoVideo#addAutoLoadAdPlacementID来加载广告
2. 在需要展示广告的位置通过ATRewardedAutoVideo#autoLoadRewardedVideoReadyForPlacementID判断是否能展示false：不需要做任何操作，SDK内部会自动去加载广告true：调用ATRewardedAutoVideo#showAutoAd展示广告
3. 如需使用广告场景区分不同业务场景的数据，具体参考示例代码

注：广告位如果设置为全自动加载则**不能再**调用 **ATRewardedVideo#loadVideoAd**（**普通激励视频**）进行广告加载

## **2**. API说明

ATRewardedAutoVideo：

| API | 参数 | 说明 |
| --- | --- | --- |
| addAutoLoadAdPlacementID | string\[\] placementIDList | 设置需要自动加载的广告位 |
| removeAutoLoadAdPlacementID | string placementId | 移除不需要自动加载的广告位 |
| setAutoLocalExtra | string placementId, string mapJson | 给广告位设置本地参数 |
| setListener | ATRewardedVideoListener listener | **（5.9.51版本之后废弃）设置监听器的方式具体参考：激励视频广告事件设置说明** |
| autoLoadRewardedVideoReadyForPlacementID | string placementid | 判断是否有广告缓存 |
| showAutoAd | string mapJson | 显示广告 |
| showAutoAd | string placementid，Dictionary extra | 使用场景功能更显示广告 |
| entryAutoAdScenarioWithPlacementID | string placementid，string scenarioID | 设置进入可展示广告场景 |

## 3.设置本地参数

如需支持服务器激励回调，则需要在**配置全自动广告位前**（对下次加载的激励视频广告生效）传入参数，示例代码：

java
复制代码

```
public void setAutoLoadExtra()
{
    Dictionary<string> jsonmap = new Dictionary<string>();
    //如果需要通过开发者的服务器进行奖励的下发（部分广告平台支持此服务器激励），则需要传递下面两个key
    //ATConst.USERID_KEY必传，用于标识每个用户;ATConst.USER_EXTRA_DATA为可选参数，传入后将透传到开发者的服务器
    jsonmap.Add(ATConst.USERID_KEY, "test_user_id");
    jsonmap.Add(ATConst.USER_EXTRA_DATA, "test_user_extra_data");

    ATRewardedAutoVideo.Instance.setAutoLocalExtra(mPlacementId_rewardvideo_all, jsonmap);
}</string></string>
```

## **4**. 加载广告

使用以下代码设置全自动加载激励视频广告:

java
复制代码

```
public void addAutoLoadAdPlacementID()
{

    ATRewardedAutoVideo.Instance.client.onAdLoadEvent += onAdLoad;
    ATRewardedAutoVideo.Instance.client.onAdLoadFailureEvent += onAdLoadFail;
    ATRewardedAutoVideo.Instance.client.onAdVideoStartEvent  += onAdVideoStartEvent;
    ATRewardedAutoVideo.Instance.client.onAdVideoEndEvent  += onAdVideoEndEvent;
    ATRewardedAutoVideo.Instance.client.onAdVideoFailureEvent += onAdVideoPlayFail;
    ATRewardedAutoVideo.Instance.client.onAdClickEvent += onAdClick;
    ATRewardedAutoVideo.Instance.client.onRewardEvent += onReward;

    ATRewardedAutoVideo.Instance.client.onAdVideoCloseEvent += onAdVideoClosedEvent;

    string[] jsonList = {mPlacementId_rewardvideo_all};
    ATRewardedAutoVideo.Instance.addAutoLoadAdPlacementID(jsonList);
}
```

**注:** 请参阅下文，了解如何获得有关全自动加载激励视频广告事件的通知（加载成功/失败，展示，点击，视频开始/结束和激励）。

## **5**. 判断是否有广告缓存

java
复制代码

```
bool isReady = ATRewardedAutoVideo.Instance.autoLoadRewardedVideoReadyForPlacementID(mPlacementId_rewardvideo_all);
```

## **6**. 展示广告

java
复制代码

```
public void showAutoAd()
{
    ATRewardedAutoVideo.Instance.showAutoAd(mPlacementId_rewardvideo_all);
}
```

当用到 **场景** 功能时：

java
复制代码

```
public void showAutoAd()
{
        // 设置进入场景
    ATRewardedAutoVideo.Instance.entryAutoAdScenarioWithPlacementID(mPlacementId_rewardvideo_all, showingScenario);
    Dictionary<string string=""> jsonmap = new Dictionary<string string="">();
    jsonmap.Add(AnyThinkAds.Api.ATConst.SCENARIO, showingScenario);
    ATRewardedAutoVideo.Instance.showAutoAd(mPlacementId_rewardvideo_all,jsonmap);
}</string></string>
```

## **7. 实现激励视频事件监听 (注意：仅在V5.9.51版本以上支持)**

回调信息详情请查看：[回调信息说明](/cn/docs/7eTr5G)

使用以下方式可支持设置多个Listener

java
复制代码

```
        //广告加载成功
        ATRewardedAutoVideo.Instance.client.onAdLoadEvent += onAdLoad;
        //广告加载失败
        ATRewardedAutoVideo.Instance.client.onAdLoadFailureEvent += onAdLoadFail;
        //广告展示的回调（可依赖这个回调统计展示数据）
        ATRewardedAutoVideo.Instance.client.onAdVideoStartEvent  += onAdVideoStartEvent;
        //广告播放结束
        ATRewardedAutoVideo.Instance.client.onAdVideoEndEvent  += onAdVideoEndEvent;
        //广告视频播放失败
        ATRewardedAutoVideo.Instance.client.onAdVideoFailureEvent += onAdVideoPlayFail;
        //广告点击
        ATRewardedAutoVideo.Instance.client.onAdClickEvent += onAdClick;
        //广告激励回调（可依赖该监听下发游戏激励）
        ATRewardedAutoVideo.Instance.client.onRewardEvent += onReward;
        //广告被关闭
        ATRewardedAutoVideo.Instance.client.onAdVideoCloseEvent += onAdVideoClosedEvent;
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
