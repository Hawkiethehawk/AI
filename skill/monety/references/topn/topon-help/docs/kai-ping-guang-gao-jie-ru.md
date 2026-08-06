---
title: "开屏广告接入"
source: "https://help.toponad.net/cn/docs/kai-ping-guang-gao-jie-ru"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "集成基础说明", "开屏广告接入"]
content_sha256: "48d74274b62985253057e8c2001985cf16596bfd0c504c31cac9199ec108863c"
knowledge_role: "reference_only"
has_article_body: true
---

# 开屏广告接入

## **1**. 广告介绍

[TopOn Unity插件2.0.0](/cn/docs/hd01b0)支持通过C# API接入开屏广告。开屏广告类似于插屏广告，但展现时机一般是在应用冷启动或者热启动时显示。

## **2**. 集成建议

1.冷启动（应用进程不存在时，应用的初次启动）

处理冷启动的首选方法是新建一个场景作为启动页面，在这个场景的 Start()方法加载广告，如果加载超时，则不再显示广告，具体请参考示例代码。

启动应用或者游戏后发起 ATSplashAd.Instance.loadSplashAd() 进行开屏广告加载

将其他广告形式的预加载逻辑以及其他消耗网络资源的请求放到开屏广告展示之后，以减少开屏加载超时的情况

若广告加载超时（onAdLoadTimeoutEvent(object sender, ATAdEventArgs erg)），则不需继续等待广告填充，直接进入主界面；本次开屏广告仍在加载，若加载成功会触发

onAdLoadEvent(object sender, ATAdEventArgs erg)onAdLoadEvent(object sender, ATAdEventArgs erg)回调触发时，当加载未超时（ATAdEventArgs.isTimeout为false时），调用ATSplashAd.Instance.showSplashAd()展示广告

2.热启动（应用通过home键暂时退到后台，在该应用进程还存在时，重新回到应用）

应用回到前台时，调用ATSplashAd.Instance.hasSplashAdReady()判断当前是否有广告缓存，true则调用ATSplashAd.Instance.showSplashAd()展示广告，false则调用 ATSplashAd.Instance.loadSplashAd()进行广告的预加载。

3.建议进入可展示广告场景后调用 ATSplashAd.Instance.entryScenarioWithPlacementID()统计当前广告位的缓存状态，具体的统计说明可查看广告场景区分不同业务场景的数据。

4.广告预加载：开屏广告展示后，在onAdLoadEvent或onAdCloseEvent回调中调用load进行预加载。

若需在热启动时展示开屏广告，建议在应用退到后台时，调用ATSplashAd.Instance.hasSplashAdReady()判断当前是否有广告缓存，true则调用ATSplashAd.Instance.showSplashAd()展示广告，false则调用ATSplashAd.Instance.loadSplashAd()进行广告的预加载。

5.后台配置兜底开屏广告源减少加载超时情况，配置方法见 兜底开屏广告。

6.在Unity，监听APP前台事件:

要收到应用程序前台事件的通知，建议您收听 OnApplicationPauseevent。 通过重写 OnApplicationPause 方法，您的应用程序将收到应用程序启动和前台事件的警报，并且能够显示广告。

**注意：**

1. 必须在TopOn SDK初始化成功之后才去调用load加载广告。
2. 只支持全屏开屏广告。

## **3**. API说明

ATSplashAd:

| API | 参数 | 说明 |
| --- | --- | --- |
| loadSplashAd | string placementId, Dictionary | 加载广告 |
| hasSplashAdReady | string placementId | 判断是否有广告缓存 |
| showSplashAd | string placementid，Dictionary | 显示广告 |
| entryScenarioWithPlacementID | string placementId, string scenarioID | 设置进入可展示广告场景 |

## **4**. 实现广告的事件监听器

回调信息详情请查看：[回调信息说明](https://docs.toponad.com/#zh-cn/unity/unity_doc/unity_access_callback_doc.md)

使用以下代码实现多个监听器:

java
复制代码

```
    var client = ATSplashAd.Instance.client;
    //广告加载成功
    client.onAdLoadEvent += onAdLoad;
    //广告加载失败
    client.onAdLoadFailureEvent += onAdLoadFailed;
    //广告加载已超时
    client.onAdLoadTimeoutEvent += onAdLoadTimeout;
    //广告成功显示
    client.onAdShowEvent += onAdShow;
    //广告关闭
    client.onAdCloseEvent += onAdClose;
    //广告点击
    client.onAdClickEvent += onAdClick;
```

方法定义参数如下代码：（**注意 : 方法名可参考以下代码或者自定义方法名，但参数必须一致**）

java
复制代码

```
        //广告加载成功
        public void onAdLoad(object sender,ATAdEventArgs erg)
    {
                if (!erg.isTimeout)    //未加载超时
        {
              Debug.Log("Developer onAdLoad------" + erg.placementId);
        }
          else    //已加载超时
        {
              Debug.Log("Developer onAdLoad timeout ------" + erg.placementId);
        }
    }
        //广告加载失败
        public void onAdLoadFailed(object sender,ATAdEventArgs erg)
    {
          Debug.Log("Developer onAdLoadFailed------" + erg.placementId);
    }
        //广告加载超时
        public void onAdLoadTimeout(object sender,ATAdEventArgs erg)
    {
          Debug.Log("Developer onAdLoadTimeout------" + erg.placementId);
    }
        //广告显示
        public void onAdShow(object sender,ATAdEventArgs erg)
    {
          Debug.Log("Developer onAdShow------" + erg.placementId);
    }
        //广告关闭
        public void onAdClose(object sender,ATAdEventArgs erg)
    {
          Debug.Log("Developer onAdClose------" + erg.placementId);
    }
        //广告点击
        public void onAdClick(object sender,ATAdEventArgs erg)
    {
          Debug.Log("Developer onAdClick------" + erg.placementId);
    }
```

## [5. 示例代码](https://docs.toponad.com/#/zh-cn/unity/unity_doc/unity_access_splash_doc_new?id=_5-%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81)

java
复制代码

```
public class ExampleHomeScreen : MonoBehaviour, ATSDKInitListener
{
       void Start()
       {
       #if UNITY_ANDROID
        ATSDKAPI.initSDK("Your Android AppId", "Your Android AppKey", this);
#elif UNITY_IOS || UNITY_IPHONE
        ATSDKAPI.initSDK("Your iOS AppId", "Your iOS AppKey", this);
#endif
       }

      void OnDestroy()
    {
        ATSplashAd.Instance.client.onAdLoadEvent -= onAdLoad;
        ATSplashAd.Instance.client.onAdLoadTimeoutEvent -= onAdLoadTimeout;
        ATSplashAd.Instance.client.onAdLoadFailureEvent -= onAdLoadFailed;
                ATSplashAd.Instance.client.onAdCloseEvent -= onAdClose;
    }

      //SDK初始化成功
       public void initSuccess()
       {
        ATSplashAd.Instance.client.onAdLoadEvent += onAdLoad;
        ATSplashAd.Instance.client.onAdLoadTimeoutEvent += onAdLoadTimeout;
        ATSplashAd.Instance.client.onAdLoadFailureEvent += onAdLoadFailed;
        ATSplashAd.Instance.client.onAdCloseEvent += onAdClose;
        ATSplashManager.Instance.ShowAdIfReady();
       }

        public void initFail(string msg)
    {
          Debug.Log("Developer callback SDK initFail:" + msg);
    }
        //广告加载成功，则直接显示
          public void onAdLoad(object sender, ATAdEventArgs erg)
    {
           if (!erg.isTimeout)
        {
            ATSplashManager.Instance.ShowAdIfReady();
        }
        else
        {
            //加载超时，不再调用show展示广告
        }
    }
      //广告加载超时，不需继续等待广告填充，直接进入首页
       public void onAdLoadTimeout(object sender, ATAdEventArgs erg)
       {

       }
        //广告加载失败
    public void onAdLoadFailed(object sender, ATAdErrorEventArgs args)
    {

    }
      //广告关闭，进入首页
      public void onAdClose(object sender, ATAdEventArgs erg)
    {

    }
         //监听APP前台事件
       private void OnApplicationPause(bool pauseStatus)
       {
         if (!pauseStatus)    //从后台返回前台
         {
             ATSplashManager.Instance.ShowAdIfReady();
         }
       }
}

public class ATSplashManager
    {
#if UNITY_ANDROID
        private const string SPLASH_PLACEMENT_ID = "Your PlacementId";
#elif UNITY_IOS || UNITY_IPHONE
        private static string SPLASH_PLACEMENT_ID = "Your PlacementId";
#endif

        private static ATSplashManager instance = new ATSplashManager();

        public static ATSplashManager Instance
        {
            get
            {
                return instance;
            }
        }

        public void ShowAdIfReady()
        {
            var splashAd = ATSplashAd.Instance;
            if (splashAd.hasSplashAdReady(SPLASH_PLACEMENT_ID))
            {
                splashAd.showSplashAd(SPLASH_PLACEMENT_ID, new Dictionary());
            }
            else
            {
                splashAd.loadSplashAd(SPLASH_PLACEMENT_ID, new Dictionary());
            }
        }
    }
```
