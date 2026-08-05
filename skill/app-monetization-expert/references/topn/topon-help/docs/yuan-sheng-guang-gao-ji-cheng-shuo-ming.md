---
title: "原生广告集成说明"
source: "https://help.toponad.net/cn/docs/yuan-sheng-guang-gao-ji-cheng-shuo-ming"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "集成基础说明", "原生广告集成说明"]
content_sha256: "c89d6b091858e98c9a72795cbcfa483e3f1977ed11b9241ed63a920442ac76e6"
knowledge_role: "reference_only"
has_article_body: true
---

# 原生广告集成说明

**Android上需要注意的：**
目前使用Unity直接打出Android的APK是不能使用原生视频广告，因为Unity打包APK默认会把游戏的Activity硬件加速关闭，所以无法展示视频。如果需要展示原生广告视频的话，必须使用export project的方式处理，处理方式如下：

**(1)选择Export Project的模式导出Android工程** 

**(2)修改AndroidManifest里的属性，将图中的hardwareAccelerated的属性设置成true** 

**完成以上步骤之后，使用当前的Android工程进行打包即可。**

## **1**. 接入流程建议

1. 启动应用时通过调用ATNativeAd#loadNativeAd来加载广告
2. 在需要展示广告的位置通过ATNativeAd#hasAdReady判断是否能展示
3. 如需使用[广告场景](/cn/docs/1RWLAv)区分不同业务场景的数据，具体参考示例代码

## **2**. API说明

ATNativeAd：

| API | 参数 | 说明 |
| --- | --- | --- |
| loadNativeAd | string placementid，Dictionary | 加载广告\*\*（从v5.6.8开始，针对穿山甲模板渲染、Mintegral自动渲染广告等必须通过extra参数传递宽高，否则广告大小可能显示异常）\*\* |
| setListener | ATNativeAdListener listener | 设置监听回调接口 **（5.9.51版本之后废弃）** |
| hasAdReady | string placementid | 判断是否有广告缓存 |
| renderAdToScene | string placementid，ATNativeAdView anyThinkNativeAdView | 显示广告 |
| entryScenarioWithPlacementID | string placementId, string scenarioID | 设置进入可展示广告场景 |

## **3**. 加载原生广告

您可以使用以下代码加载原生广告：

java
复制代码

```
public void loadNative()
{
        Debug.Log ("Developer load native, unit id = " + mPlacementId_native_all);
           ATNativeAd.Instance.client.onAdLoadEvent += onAdLoad;
           ATNativeAd.Instance.client.onAdLoadFailureEvent += onAdLoadFail;
        ATNativeAd.Instance.client.onAdImpressEvent += onAdImpressed;
        ATNativeAd.Instance.client.onAdClickEvent += onAdClick;
        ATNativeAd.Instance.client.onAdCloseEvent += onAdClose;
        ATNativeAd.Instance.client.onAdVideoStartEvent += onAdVideoStart;
        ATNativeAd.Instance.client.onAdVideoEndEvent += onAdVideoEnd;
        ATNativeAd.Instance.client.onAdVideoProgressEvent += onAdVideoProgress;

        //----- v5.6.8以上 -----
        Dictionary jsonmap = new Dictionary();

        #if UNITY_ANDROID
            ATSize nativeSize = new ATSize(width, height);
            jsonmap.Add(ATNativeAdLoadingExtra.kATNativeAdLoadingExtraNativeAdSizeStruct, nativeSize);
        #elif UNITY_IOS || UNITY_IPHONE
            ATSize nativeSize = new ATSize(width, height, false);
            jsonmap.Add(ATNativeAdLoadingExtra.kATNativeAdLoadingExtraNativeAdSizeStruct, nativeSize);

        ATNativeAd.Instance.loadNativeAd(mPlacementId_native_all, jsonmap);
}
```

**注:** 请继续阅读以了解如何在加载成功/失败事件时得到通知。

## **4**. 判断是否有广告缓存

java
复制代码

```
ATNativeAd.Instance.hasAdReady(mPlacementId_native_all);
```

## [5. 展示原生广告](https://docs.toponad.com/#/zh-cn/unity/unity_doc/unity_access_native_doc?id=_5-%e5%b1%95%e7%a4%ba%e5%8e%9f%e7%94%9f%e5%b9%bf%e5%91%8a)

您可以使用以下代码显示原生广告：

java
复制代码

```
public void showNative()
{
        Debug.Log ("Developer show native....");
        ATNativeConfig conifg = new ATNativeConfig ();

        string bgcolor = "#ffffff";
        string textcolor = "#000000";
        int rootbasex = 100, rootbasey = 100;

        int x = rootbasex,y = rootbasey,width = 300*3,height = 200*3,textsize = 17;
        conifg.parentProperty = new ATNativeItemProperty(x,y,width,height,bgcolor,textcolor,textsize, true);

        //adlogo
        x = 0*3;y = 0*3;width = 30*3;height = 20*3;textsize = 17;
        conifg.adLogoProperty  = new ATNativeItemProperty(x,y,width,height,bgcolor,textcolor,textsize, true);

        //adicon
        x = 0*3;y = 50*3-50;width = 60*3;height = 50*3;textsize = 17;
        conifg.appIconProperty  = new ATNativeItemProperty(x,y,width,height,bgcolor,textcolor,textsize, true);

        //ad cta
        x = 0*3;y = 150*3;width = 300*3;height = 50*3;textsize = 17;
        conifg.ctaButtonProperty  = new ATNativeItemProperty(x,y,width,height,"#ff21bcab","#ffffff",textsize, true);

        //ad desc
        x = 60*3;y = 100*3;width = 240*3-20;height = 50*3-10;textsize = 10;
        conifg.descProperty  = new ATNativeItemProperty(x,y,width,height,bgcolor,"#777777",textsize, true);

        //ad image
        x = 60*3;y = 0*3+20;width = 240*3-20;height = 100*3-10;textsize = 17;
        conifg.mainImageProperty  = new ATNativeItemProperty(x,y,width,height,bgcolor,textcolor,textsize, true);

        //ad title
        x = 0*3;y = 100*3;width = 60*3;height = 50*3;textsize = 12;
        conifg.titleProperty  = new ATNativeItemProperty(x,y,width,height,bgcolor,textcolor,textsize, true);

        //（v5.7.21新增）ad dislike button (close button)
        x = 300*3 - 75;y = 0;width = 75;height = 75;
        conifg.dislikeButtonProperty  = new ATNativeItemProperty(x,y,width,height,"#00000000",textcolor,textsize, true);

        ATNativeAdView anyThinkNativeAdView = new ATNativeAdView(conifg);
        AnyThinkAds.Demo.ATManager.anyThinkNativeAdView = anyThinkNativeAdView;
        Debug.Log("Developer renderAdToScene--->");
        ATNativeAd.Instance.renderAdToScene(mPlacementId_native_all, anyThinkNativeAdView);
}
```

当用到 **场景** 功能时：

java
复制代码

```
public void showNative()
{
    ...
    Dictionary jsonmap = new Dictionary();
    jsonmap.Add(AnyThinkAds.Api.ATConst.SCENARIO, showingScenarioID);
    ATNativeAd.Instance.renderAdToScene(mPlacementId_native_all, anyThinkNativeAdView, jsonmap);
}
```

传递给ATNativeItemProperty类的构造函数的尾部参数表示是否使用像素\*\*（只针对iOS有效）\*\*。 例如，在iPhone 6上，如果分别为x，y，宽度和高度分别传递30、120、300、450，则在iPhone 7上传递给Objective-C代码的实际值将为15、60、150、225 这些值将是10、40、100、150； 也就是说，最终值决定于目标设备的屏幕比例。

正如您在上面看到的，我们为您定义了一个ATNativeConfig类，用于配置本机资产的各种属性（bgColor，textColor，textSize，position等），例如CTA按钮，应用程序图标，标题文本，说明文本，封面图片 等等。 请随时修改config对象中的属性，并查看根据您的修改会发生什么。

#### [关于ATNativeConfig&ATNativeItemProperty详细说明](https://docs.toponad.com/#/zh-cn/unity/unity_doc/unity_access_native_doc?id=%e5%85%b3%e4%ba%8eatnativeconfigampatnativeitemproperty%e8%af%a6%e7%bb%86%e8%af%b4%e6%98%8e)

**ATNativeConfig**包含多个**ATNativeItemProperty**对象，用来控制Native广告的样式。**ATNativeItemProperty**控制单个Native广告元素的位置和样式；某些元素可能不支持**ATNativeItemProperty**中的一些属性，比如图片元素（icon, main image）只支持x, y, width, height, usesPixel，但不支持背景颜色、字体大小和字体颜色等，而文本元素(如title, cta, desc）则支持所有属性。在iOS游戏中，如果你想指定“透明”，则用"clearColor"，比如如果你想广告区域的背景是透明的，则把"clearColor"赋值给parentProperty的backgroundColor即可。 **注意：** 1）只有iOS支持clearColor，安卓系统如果需要指定透明背景，只需要使rgba中的a部分为0即可;

2）iOS不支持alpha，所以颜色值应该传类似#5aef00（六位rbg值），而安卓可以支持alpha，其颜色包含8位16进制，比如5a2b3c00

**parentProperty**

parentProperty 控制的是Native的总体大小，如下图红圈区域。



Native 广告元素说明如下：

- **appIconProperty** : appIconProperty属性控制广告的图标属性，如下**图1**所示：
- **mainImageProperty**: mainImageProperty控制广告的封面图，如下**图2**所示：
- **titleProperty**: titleProperty控制广告标题，如下**图3**所示：
- **descProperty** : descProperty控制广告描述文字，如下**图4**所示
- **adLogoProperty** :adLogoProperty控制广告标识属性，如下**图5**所示. **注意：** 有的平台的广告标识位置是内部固定，不支持开发者指定，比如Admob。
- **ctaButtonProperty**: ctaButtonProperty控制点击按钮，如下**图6**所示
- **dislikeButtonProperty**：\*\*（v5.7.21新增）\*\*dislikeButtonProperty控制关闭按钮（可不设置，则不显示关闭按钮）

**注：上述Native广告元素有返回时均需要渲染**



如果要从屏幕上删除原生广告，请使用以下代码：

java
复制代码

```
public void cleanView()
{
    Debug.Log ("Developer cleanView native....");
   ATNativeAd.Instance.cleanAdView(mPlacementId_native_all,AnyThinkAds.Demo.ATManager.anyThinkNativeAdView);
}
```

#### 关于模板渲染广告说明

- 只能通过parentProperty来控制模板渲染广告。调整其他属性（appIcon、title、desc、adLogo、ctaButton、mainImage等）无效，其中parentProperty、mainImageProperty必须设置，mainImageProperty的参数可与parentProperty一致
- parentProperty的宽高需与加载时传入的宽高一致，否则可能出现展示不全或者展示过大的问题
- 模板广告有自己的宽高比例，可在广告平台后台进行查看。尽量在广告平台后选择宽高比例一样或者接近的模板，在代码中以那个宽高比例传入宽高来加载、展示广告，以获得最佳展示效果
- 模板渲染广告自适应高度：开发者可通过以下步骤实现自适应高度（加载时自适应高度仅针对Android的穿山甲、优量汇平台）注意：
- 使用自适应高度时，可能会出现比较高的模板广告，开发者可根据实际需求在广告平台后台勾选需要的宽高比例模板，去除不符合预期的模板
- 自适应高度不受parentProperty的高度控制
- 1）（此点仅针对Android）加载时开启自适应高度（需传入Key：ADAPTIVE\_HEIGHT）

java
复制代码

```
Dictionary jsonmap = new Dictionary();

#if UNITY_ANDROID
    ATSize nativeSize = new ATSize(width, height);
    jsonmap.Add(ATNativeAdLoadingExtra.kATNativeAdLoadingExtraNativeAdSizeStruct, nativeSize);
    jsonmap.Add(AnyThinkAds.Api.ATConst.ADAPTIVE_HEIGHT, AnyThinkAds.Api.ATConst.ADAPTIVE_HEIGHT_YES);
...
ATNativeAd.Instance.loadNativeAd(mPlacementId_native_all, jsonmap);
```

- 2）展示时开启自适应高度（需传入Key：Key：ADAPTIVE\_HEIGHT）

java
复制代码

```
...
Dictionary jsonmap = new Dictionary();
jsonmap.Add(AnyThinkAds.Api.ATConst.ADAPTIVE_HEIGHT, AnyThinkAds.Api.ATConst.ADAPTIVE_HEIGHT_YES);

ATNativeAd.Instance.renderAdToScene(mPlacementId_native_all, anyThinkNativeAdView, jsonmap);
```

- 3）展示时，可控制广告居中显示在屏幕顶部或者底部

java
复制代码

```
...
Dictionary jsonmap = new Dictionary();
jsonmap.Add(AnyThinkAds.Api.ATConst.POSITION, AnyThinkAds.Api.ATConst.POSITION_BOTTOM);//屏幕底部居中
//jsonmap.Add(AnyThinkAds.Api.ATConst.POSITION, AnyThinkAds.Api.ATConst.POSITION_TOP);//屏幕顶部居中

ATNativeAd.Instance.renderAdToScene(mPlacementId_native_all, anyThinkNativeAdView, jsonmap);
```

## **6. 实现原生广告监听器**

回调信息详情请查看：[回调信息说明](https://docs.toponad.com/#zh-cn/unity/unity_doc/unity_access_callback_doc.md)

使用以下代码实现多个监听器

java
复制代码

```
        //广告加载成功
           ATNativeAd.Instance.client.onAdLoadEvent += onAdLoad;
           //广告加载失败
        ATNativeAd.Instance.client.onAdLoadFailureEvent += onAdLoadFail;
        //广告展示成功
        ATNativeAd.Instance.client.onAdImpressEvent += onAdImpressed;
        //广告被点击
        ATNativeAd.Instance.client.onAdClickEvent += onAdClick;
        //广告关闭按钮被点击，部分广告平台有此回调
        ATNativeAd.Instance.client.onAdCloseEvent += onAdClose;
        //广告视频开始播放，部分广告平台有此回调
        ATNativeAd.Instance.client.onAdVideoStartEvent += onAdVideoStart;
        //广告视频结束播放，部分广告平台有此回调
        ATNativeAd.Instance.client.onAdVideoEndEvent += onAdVideoEnd;
        //广告视频播放进度，部分广告平台有此回调
        ATNativeAd.Instance.client.onAdVideoProgressEvent += onAdVideoProgress;
```

方法定义参数如下代码（**注意 : 方法名可参考以下代码或者自定义方法名，但参数必须一致**）

java
复制代码

```
    //sender 为广告类型对象，erg为返回信息
   //广告加载成功
    public void onAdLoad(object sender, ATAdEventArgs erg)
    {
        Debug.Log("Developer onAdLoaded------:" + erg.placementId);
    }
    //广告加载失败
    public void onAdLoadFail(object sender, ATAdEventArgs erg)
    {
        Debug.Log("Developer onAdLoadFail------:" + erg.placementId + "--code:" + erg.code + "--msg:" + erg.message);
    }
    //广告展示成功
    public void onAdImpressed(object sender, ATAdEventArgs erg)
    {
        Debug.Log("Developer onAdImpressed------:" + erg.placementId);
    }
    //广告被点击
    public void onAdClicked(object sender, ATAdEventArgs erg)
    {
        Debug.Log("Developer onAdClicked------:" + erg.placementId);
    }
    //广告视频开始播放，部分广告平台有此回调
    public void onAdVideoStart(object sender, ATAdEventArgs erg)
    {
        Debug.Log("Developer onAdVideoStart------:" + erg.placementId);
    }
    //广告视频结束播放，部分广告平台有此回调
    public void onAdVideoEnd(object sender, ATAdEventArgs erg)
    {
        Debug.Log("Developer onAdVideoEnd------:" + erg.placementId);
    }
    //广告视频播放进度，部分广告平台有此回调
    public void onAdVideoProgress(object sender, ATAdProgressEventArgs erg)
    {
        Debug.Log("Developer onAdVideoProgress------:" + erg.placementId);
    }
    //广告关闭按钮被点击，部分广告平台有此回调
    public void onAdCloseButtonClicked(object sender, ATAdEventArgs erg)
    {
        Debug.Log("Developer onAdCloseButtonClicked------:" + erg.placementId);
   }
```
