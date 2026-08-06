---
title: "全自动加载插屏广告"
source: "https://help.toponad.net/cn/docs/TeO2Eo"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "集成基础说明", "插屏广告集成说明", "全自动加载插屏广告"]
content_sha256: "726405ceb3999b5b708472720343c49ce427c73266a614f7fa4771017bc3dde6"
knowledge_role: "reference_only"
has_article_body: true
---

# 全自动加载插屏广告

**全自动加载模式，是TopOn推出的一站式请求维护方案，能够根据用户的使用状态和广告消耗进度，多节点智能判断下一条广告的预加载和缓存时机。在满足开发者运营策略的基础上，规避广告数据实时加载的失败风险和展示机会被浪费，减轻用户因为广告未加载或加载不流畅造成的负面情绪。通过全自动加载方案，开发者可以避免反复冗杂的人工干预请求方案，效率提升立竿见影。**

## **1**. 接入流程建议

1. 启动应用时通过调用ATInterstitialAutoAd#addAutoLoadAdPlacementID来加载广告
2. 在需要展示广告的位置通过ATInterstitialAutoAd#autoLoadInterstitialAdReadyForPlacementID判断是否能展示
3. 如需使用[广告场景](/cn/docs/1RWLAv)区分不同业务场景的数据，具体参考示例代码

注：广告位如果设置为全自动加载则**不要**调用 **ATInterstitialAd#loadInterstitialAd**（**普通插屏广告**）进行广告加载

## **2**. API说明

ATInterstitialAutoAd：

| API | 参数 | 说明 |
| --- | --- | --- |
| addAutoLoadAdPlacementID | string placementIDList | 设置需要自动加载的广告位 |
| removeAutoLoadAdPlacementID | string placementId | 移除不需要自动加载的广告位 |
| setListener | ATRewardedVideoListener listener | **（5.9.51版本之后废弃）设置监听器** |
| autoLoadInterstitialAdReadyForPlacementID | string placementid | 判断是否有广告缓存 |
| showAutoAd | string mapJson | 显示广告 |
| showAutoAd | string placementid，Dictionary extra | 使用场景功能更显示广告 |
| entryAutoAdScenarioWithPlacementID | string placementid，string scenarioID | 设置进入可展示广告场景 |

## **3**. 加载广告

使用以下代码设置全自动加载插屏广告:

java
复制代码

```
public void addAutoLoadAdPlacementID()
{

    ATInterstitialAutoAd.Instance.client.onAdLoadEvent += onAdLoad;
    ATInterstitialAutoAd.Instance.client.onAdLoadFailureEvent += onAdLoadFail;
    ATInterstitialAutoAd.Instance.client.onAdShowEvent += onShow;
    ATInterstitialAutoAd.Instance.client.onAdClickEvent += onAdClick;
    ATInterstitialAutoAd.Instance.client.onAdCloseEvent += onAdClose;
    ATInterstitialAutoAd.Instance.client.onAdShowFailureEvent += onAdShowFail;
    ATInterstitialAutoAd.Instance.client.onAdVideoStartEvent  += startVideoPlayback;
    ATInterstitialAutoAd.Instance.client.onAdVideoEndEvent  += endVideoPlayback;
    ATInterstitialAutoAd.Instance.client.onAdVideoFailureEvent  += failVideoPlayback;

    string[] jsonList = {mPlacementId_interstitial_all};

    ATInterstitialAutoAd.Instance.addAutoLoadAdPlacementID(jsonList);
}
```

## **4**. 判断是否有广告缓存

java
复制代码

```
bool isReady = ATInterstitialAutoAd.Instance.autoLoadInterstitialAdReadyForPlacementID(mPlacementId_interstitial_all);
```

## **5**. 展示广告

java
复制代码

```
public void showAutoAd()
{
    ATInterstitialAutoAd.Instance.showAutoAd(mPlacementId_interstitial_all);
}
```

当用到 **场景** 功能时：

java
复制代码

```
public void showAutoAd()
{
        // 设置进入场景
    ATInterstitialAutoAd.Instance.entryAutoAdScenarioWithPlacementID(mPlacementId_interstitial_all, showingScenario);
    Dictionary<string string=""> jsonmap = new Dictionary<string string="">();
    jsonmap.Add(AnyThinkAds.Api.ATConst.SCENARIO, showingScenario);
    ATInterstitialAutoAd.Instance.showAutoAd(mPlacementId_interstitial_all,jsonmap);
}</string></string>
```

## **6. 实现全自动加载插屏广告的多个监听器**

回调信息详情请查看：[回调信息说明](/cn/docs/7eTr5G)

使用以下代码实现多个监听器

java
复制代码

```
        //广告加载成功
        ATInterstitialAutoAd.Instance.client.onAdLoadEvent += onAdLoad;
        //广告加载失败
        ATInterstitialAutoAd.Instance.client.onAdLoadFailureEvent += onAdLoadFail;
        //广告展示（可以依赖该回调进行展示统计）
        ATInterstitialAutoAd.Instance.client.onAdShowEvent += onShow;
        //广告点击
        ATInterstitialAutoAd.Instance.client.onAdClickEvent += onAdClick;
        //广告关闭
        ATInterstitialAutoAd.Instance.client.onAdCloseEvent += onAdClose;
        //广告展示失败
        ATInterstitialAutoAd.Instance.client.onAdShowFailureEvent += onAdShowFail;
        //视频广告播放开始
        ATInterstitialAutoAd.Instance.client.onAdVideoStartEvent  += startVideoPlayback;
        //视频广告播放结束
        ATInterstitialAutoAd.Instance.client.onAdVideoEndEvent  += endVideoPlayback;
        //视频广告播放失败
        ATInterstitialAutoAd.Instance.client.onAdVideoFailureEvent  += failVideoPlayback;
```

方法定义参数如下代码（**注意 : 方法名可参考以下代码或者自定义方法名，但参数必须一致**）

java
复制代码

```
    //sender 为广告类型对象，erg为返回信息
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

    //广告视频开始播放，部分平台有此回调
    public void startVideoPlayback(object sender,ATAdEventArgs erg)
    {
        Debug.Log("Developer callback onInterstitialAdStartPlayingVideo :" + erg.placementId);
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
```
