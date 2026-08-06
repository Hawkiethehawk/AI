---
title: "插屏广告集成说明"
source: "https://help.toponad.net/cn/docs/cha-ping-guang-gao-ji-cheng-shuo-ming"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "集成基础说明", "插屏广告集成说明"]
content_sha256: "1d0c41fe36415811c067cc5fe5682434876b73612f71c2f7be64d1a396b35554"
knowledge_role: "reference_only"
has_article_body: true
---

# 插屏广告集成说明

## **1**. 插屏广告介绍

插屏广告是聚合了其他第三方广告平台的图片插屏广告和视频插屏广告，两种广告类型都是可以使用ATAdManager的API来实现广告的加载和播放。目前支持两种集成方式，具体说明如下：

| 模式（二选一） | 说明 |
| --- | --- |
| 手动请求模式 | 由自行通过API选择合适的时机调用广告加载，具体参照文档下方集成建议 |
| 全自动加载模式 | TopOn推出的一站式请求维护方案，能够根据用户的使用状态和广告消耗进度，自动判断下一条广告的预加载和缓存时机，以达到更优的加载效果，具体见：[插屏广告全自动加载模式](/cn/docs/TeO2Eo) |

## **2**. 接入流程建议

1. 启动应用时通过ATInterstitialAd#loadInterstitialAd来执行加载广告
2. 在需要展示广告的位置通过ATInterstitialAd#hasInterstitialAdReady判断是否能展示

false：重新执行ATInterstitialAd#loadInterstitialAd来加载广告

true：执行ATInterstitialAd#showInterstitialAd展示广告，在onInterstitialAdClose的回调中再执行ATInterstitialAd#loadInterstitialAd来预加载下一次的广告（在onInterstitialAdClose的回调里可直接调用loadInterstitialAd不需要经过hasInterstitialAdReady的判断，有助于提升优先级比较高的广告源的展示量.）

3.广告预加载：

插屏广告展示后，onInterstitialAdShow（v5.8.10及之后）或onInterstitialAdClose（低于v.5.8.10）的回调中无需ATInterstitialAd#hasInterstitialAdReady判断，直接调用ATInterstitialAd#loadInterstitialAd进行预加载（有助于提升优先级比较高的广告源的展示量）

可参考自动请求广告，开启自动请求广告（若已实现上方展示后预加载则不用开启）

4.如需使用广告场景区分不同业务场景的数据，具体参考示例代码

## **3**. API说明

ATInterstitialAd：

| API | 参数 | 说明 |
| --- | --- | --- |
| loadInterstitialAd | string placementid，Dictionary extra | 加载广告 |
| setListener | ATInterstitialAdListener listener | 设置监听回调接口 **（5.9.51版本之后废弃）** |
| hasInterstitialAdReady | string placementid | 判断是否有广告缓存 |
| checkAdStatus | string placementid | **（v5.7.03新增）** 获取当前广告位的状态（Json字符串）： 1、isLoading：是否正在加载 2、isReady：是否有广告缓存（与hasInterstitialAdReady作用相同） 3、AdInfo：当前优先级最高的广告缓存信息（参考[ATCallbackInfo说明](/cn/docs/7eTr5G#outline_2)） |
| getValidAdCaches | string placementid | **（v5.7.54新增）** 获取加载成功的全部广告缓存信息（JSON字符串） （参考[ATCallbackInfo说明](/cn/docs/7eTr5G#outline_2)） |
| showInterstitialAd | string placementid，Dictionary extra | 显示广告 |
| entryScenarioWithPlacementID | string placementId, string scenarioID | 设置进入可展示广告场景 |

## **4**. 加载插屏广告

使用以下代码加载插屏广告

java
复制代码

```
public void loadInterstitialAd()
{

    ATInterstitialAd.Instance.client.onAdLoadEvent += onAdLoad;
    ATInterstitialAd.Instance.client.onAdLoadFailureEvent += onAdLoadFail;
    ATInterstitialAd.Instance.client.onAdShowEvent += onShow;
    ATInterstitialAd.Instance.client.onAdClickEvent += onAdClick;
    ATInterstitialAd.Instance.client.onAdCloseEvent += onAdClose;
    ATInterstitialAd.Instance.client.onAdShowFailureEvent += onAdShowFail;
    ATInterstitialAd.Instance.client.onAdVideoStartEvent  += startVideoPlayback;
    ATInterstitialAd.Instance.client.onAdVideoEndEvent  += endVideoPlayback;
    ATInterstitialAd.Instance.client.onAdVideoFailureEvent  += failVideoPlayback;

    Dictionary<string> jsonmap = new Dictionary<string>();

    ATInterstitialAd.Instance.loadInterstitialAd(mPlacementId_interstitial_all, jsonmap);
}</string></string>
```

**注:** 请参阅下文，了解如何获得有关插屏广告事件的通知（加载成功/失败，展示，点击，视频开始/结束）。

## **5**. 判断是否有广告缓存

java
复制代码

```
ATInterstitialAd.Instance.hasInterstitialAdReady(mPlacementId_interstitial_all);
```

## **6**. 展示插屏广告

与激励视频相同，插屏广告只要调用展示api并传递展示广告位ID作为参数：

java
复制代码

```
public void showInterstitialAd()
{
    ATInterstitialAd.Instance.showInterstitialAd(mPlacementId_interstitial_all);
}
```

当用到 **场景** 功能时：

java
复制代码

```
public void showInterstitialAd()
{
    Dictionary<string string=""> jsonmap = new Dictionary<string string="">();
    jsonmap.Add(AnyThinkAds.Api.ATConst.SCENARIO, showingScenarioID);
    ATInterstitialAd.Instance.showInterstitialAd(mPlacementId_interstitial_all, jsonmap);
}</string></string>
```

## **7. 实现插屏广告的事件监听器**

回调信息详情请查看：[回调信息说明](/cn/docs/7eTr5G)

使用以下代码实现多个监听器

java
复制代码

```
        //广告加载成功
        ATInterstitialAd.Instance.client.onAdLoadEvent += onAdLoad;
        //广告加载失败
        ATInterstitialAd.Instance.client.onAdLoadFailureEvent += onAdLoadFail;
        //广告展示（可以依赖该回调进行展示统计）
        ATInterstitialAd.Instance.client.onAdShowEvent += onShow;
        //广告点击
        ATInterstitialAd.Instance.client.onAdClickEvent += onAdClick;
        //广告关闭
        ATInterstitialAd.Instance.client.onAdCloseEvent += onAdClose;
        //广告展示失败
        ATInterstitialAd.Instance.client.onAdShowFailureEvent += onAdShowFail;
        //视频广告播放开始
        ATInterstitialAd.Instance.client.onAdVideoStartEvent  += startVideoPlayback;
        //视频广告播放结束
        ATInterstitialAd.Instance.client.onAdVideoEndEvent  += endVideoPlayback;
        //视频广告播放失败
        ATInterstitialAd.Instance.client.onAdVideoFailureEvent  += failVideoPlayback;
```

方法定义参数如下代码（**注意 : 方法名可参考以下代码或者自定义方法名，但参数必须一致**）

java
复制代码

```
    //sender 为广告类型对象，erg为返回信息
    //广告被点击
    public void onAdClick(object sender,ATAdEventArgs erg)
    {
        Debug.Log("Developer callback onInterstitialAdClick :" + erg.placementId);
    }
    //广告被关闭
    public void onAdClose(object sender,ATAdEventArgs erg)
    {
        Debug.Log("Developer callback onInterstitialAdClose :" + erg.placementId);
    }
    //广告视频播放结束，部分广告平台有此回调
    public void endVideoPlayback(object sender,ATAdEventArgs erg)
    {
        Debug.Log("Developer callback onInterstitialAdEndPlayingVideo :" + erg.placementId);
    }
    //广告视频播放失败，部分广告平台有此回调
    public void failVideoPlayback(object sender,ATAdEventArgs erg)
    {
        Debug.Log("Developer callback onInterstitialAdFailedToPlayVideo :" + erg.placementId + "--code:" + erg.code + "--msg:" + erg.message);
    }
    //广告加载成功
    public void onAdLoad(object sender,ATAdEventArgs erg)
    {
        Debug.Log("Developer callback onInterstitialAdLoad :" + erg.placementId);
    }
    //广告加载失败
    public void onAdLoadFail(object sender,ATAdErrorEventArgs erg )
    {
        Debug.Log("Developer callback onInterstitialAdLoadFail :" + erg.placementId + "--erg.code:" + code + "--msg:" + erg.message);
    }
    //广告展示成功
    public void onShow(object sender,ATAdEventArgs erg)
    {
        Debug.Log("Developer callback onInterstitialAdShow :" +erg. placementId);
    }
    //广告视频开始播放，部分平台有此回调
    public void startVideoPlayback(object sender,ATAdEventArgs erg)
    {
        Debug.Log("Developer callback onInterstitialAdStartPlayingVideo :" + erg.placementId);
    }
    //广告展示失败
    public void failVideoPlayback(object sender,ATAdEventArgs erg)
    {
        Debug.Log("Developer callback onInterstitialAdFailedToShow :" + erg.placementId);
    }
```
