---
title: "Banner广告集成说明"
source: "https://help.toponad.net/cn/docs/Banner-guang-gao-ji-cheng-shuo-ming"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-16"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "集成基础说明", "Banner广告集成说明"]
content_sha256: "e03d6b7d19d27d9ea685da05004ddfa07c014d60db8c2eee3c96e5214e8f0420"
knowledge_role: "reference_only"
has_article_body: true
---

# Banner广告集成说明

## **1**. 接入流程建议

1. 启动应用时通过ATBannerAd#loadBannerAd来执行加载广告
2. 广告加载成功后首次展示时，执行ATBannerAd#showBannerAd(string placementid，string position)展示广告
3. 如果需要隐藏广告，可执行ATBannerAd#hideBannerAd；隐藏后需要重新展示，需要执行ATBannerAd#showBannerAd(string placementid)
4. 可通过TopOn后台广告位-高级设置，配置刷新时间以开启自动刷新功能

## **2**. API说明

ATBannerAd：

| API | 参数 | 说明 |
| --- | --- | --- |
| loadBannerAd | string placementid，Dictionary extra | 加载广告 |
| setListener | ATBannerAdListener listener | 设置监听回调接口 **（5.9.51版本之后废弃）** |
| showBannerAd | string placementid，string position | 初次显示广告 postion：ATBannerAdLoadingExtra.kATBannerAdShowingPisitionTop（显示在屏幕顶部） ATBannerAdLoadingExtra.kATBannerAdShowingPisitionBottom(显示在屏幕底部) |
| hideBannerAd | string placementid | 隐藏广告 |
| showBannerAd | string placementid | 显示 已经隐藏的广告 |
| cleanBannerAd | string placementid | 移除广告 |

## **3**. 加载Banner广告

使用以下代码加载Banner广告

java
复制代码

```
public void loadBannerAd()
{
   ATBannerAd.Instance.client.onAdLoadEvent += onAdLoad;
   ATBannerAd.Instance.client.onAdLoadFailureEvent +=onAdLoadFail;
   ATBannerAd.Instance.client.onAdImpressEvent += onAdImpress;
   ATBannerAd.Instance.client.onAdAutoRefreshEvent += onAdAutoRefresh;
   ATBannerAd.Instance.client.onAdAutoRefreshFailureEvent += onAdAutoRefreshFail;
   ATBannerAd.Instance.client.onAdClickEvent += onAdClick;
   ATBannerAd.Instance.client.onAdCloseEvent += onAdCloseButtonTapped;

  Dictionary<string object=""> jsonmap = new Dictionary<string>();
  //配置Banner要展示的宽度，高度，是否使用pixel为单位
  //（只针对iOS有效，Android 使用pixel为单位）
  //注意不同平台的横幅广告有一定限制，例如配置的穿山甲横幅广告640*100
  //为了能填充完屏幕宽，计算高度H = (屏幕宽 *100)/640
  //那么在load的extra的size为（屏幕宽：H）
  ATSize bannerSize = new ATSize(this.screenWidth, 100, true);
  jsonmap.Add(ATBannerAdLoadingExtra.kATBannerAdLoadingExtraBannerAdSizeStruct, bannerSize);

  //v5.6.5新增，只针对Admob的自适应Banner
  jsonmap.Add(ATBannerAdLoadingExtra.kATBannerAdLoadingExtraInlineAdaptiveWidth, bannerSize.width);
  jsonmap.Add(ATBannerAdLoadingExtra.kATBannerAdLoadingExtraInlineAdaptiveOrientation,ATBannerAdLoadingExtra.kATBannerAdLoadingExtraInlineAdaptiveOrientationCurrent);

  ATBannerAd.Instance.loadBannerAd(mPlacementId_native_all, jsonmap);
}
```

请继续阅读以了解如何获得有关Banner广告事件的通知，例如加载成功/失败，展示和点击。

## **4**. 展示Banner广告

目前可以用两种方法来展示banner广告。

### 4.1 用预定义的位置来展示banner广告

1）把banner展示在屏幕顶部

java
复制代码

```
ATBannerAd.Instance.showBannerAd(mPlacementId_native_all, ATBannerAdLoadingExtra.kATBannerAdShowingPisitionTop);
```

2）把banner展示在屏幕底部

java
复制代码

```
ATBannerAd.Instance.showBannerAd(mPlacementId_native_all, ATBannerAdLoadingExtra.kATBannerAdShowingPisitionBottom);
```

当使用预定义位置来展示banner广告的时候，AnyThinkSDK已经考虑了刘海屏等Safe Area相关空白区域了。

### 4.2 用ATRect来展示banner广告

java
复制代码

```
public void showBannerAd()
{
    // 请跟load广告时传入的size的宽和高一致，按需求设置x、y轴坐标。
    ATRect arpuRect = new ATRect(0,70, screenWidth, 100, true);
    ATBannerAd.Instance.showBannerAd(mPlacementId_native_all, arpuRect);
}
```

传递给ATRect类的构造函数的末尾参数表示是否使用像素 **（只针对iOS有效）**。 例如，在iPhone 6上，如果分别为x，y，宽度和高度分别传递30、120、300、450，则在iPhone 7上传递给Objective-C代码的实际值将为15、60、150、225 这些值将是10、40、100、150； 也就是说，最终值将决定于目标设备的屏幕比例。

当用到 **场景** 功能时：

java
复制代码

```
public void showBannerAd()
{
    Dictionary<string string=""> jsonmap = new Dictionary<string string="">();
    jsonmap.Add(AnyThinkAds.Api.ATConst.SCENARIO, showingScenarioID);
    ATBannerAd.Instance.showBannerAd(mPlacementId_banner_all,     ATBannerAdLoadingExtra.kATBannerAdShowingPisitionBottom, jsonmap);
    //ATBannerAd.Instance.showBannerAd(mPlacementId_native_all, arpuRect, jsonmap);
}
```

如果需要，请使用以下代码从屏幕上**移除**Banner：

java
复制代码

```
public void removeBannerAd()
{
    ATBannerAd.Instance.cleanBannerAd(mPlacementId_native_all);
}
```

如果您只想**暂时隐藏** Banner（而不是**从屏幕上移除**），请在此处使用代码：

java
复制代码

```
public void hideBannerAd()
{
    ATBannerAd.Instance.hideBannerAd(mPlacementId_native_all);
}
```

隐藏Banner后，可以使用以下代码重新显示它：

java
复制代码

```
public void reshowBannerAd()
{
    ATBannerAd.Instance.showBannerAd(mPlacementId_native_all);
}
```

**注意:** 请注意，此处的showBannerAd方法不接受rect参数，这与您首次显示Banner广告时不同。

移除Banner广告和隐藏Banner广告的区别在于，从屏幕上移除Banner广告时也会破坏它（这意味着在再次显示之前，必须先加载Banner广告），而隐藏Banner只需调用showBannerAd方法即可重新显示以前隐藏的Banner广告**不传递ATRect参数**

## **5. 实现Banner事件监听器**

回调信息详情请查看：[回调信息说明](/cn/docs/7eTr5G)

使用以下代码实现多个监听器

java
复制代码

```
//广告加载成功
ATBannerAd.Instance.client.onAdLoadEvent += onAdLoad;
//广告加载失败
ATBannerAd.Instance.client.onAdLoadFailureEvent += onAdLoadFail;
//广告展示成功
ATBannerAd.Instance.client.onAdImpressEvent += onAdImpress;
//广告自动刷新成功
ATBannerAd.Instance.client.onAdAutoRefreshEvent += onAdAutoRefresh;
//广告自动刷新失败
ATBannerAd.Instance.client.onAdAutoRefreshFailureEvent += onAdAutoRefreshFail;
//广告被点击
ATBannerAd.Instance.client.onAdClickEvent += onAdClick;
//广告关闭
ATBannerAd.Instance.client.onAdCloseEvent += onAdCloseButtonTapped;
```

方法定义参数如下代码（**注意 : 方法名可参考以下代码或者自定义方法名，但参数必须一致**）

java
复制代码

```
//sender 为广告类型对象，erg为返回信息
//加载广告
//广告自动刷新成功
public void onAdAutoRefresh(object sender,ATAdEventArgs erg)
{
  Debug.Log("Developer callback onAdAutoRefresh :" + erg.placementId );
}
//广告自动刷新失败
public void onAdAutoRefreshFail(object sender,ATAdErrorEventArgs erg )
{
  Debug.Log("Developer callback onAdAutoRefreshFail : "+ erg.placementId );
}
//广告被点击
public void onAdClick(object sender,ATAdEventArgs erg)
{
  Debug.Log("Developer callback onAdClick :" + erg.placementId);
}

//广告展示成功
public void onAdImpress(object sender,ATAdEventArgs erg)
{
  Debug.Log("Developer callback onAdImpress :" + erg.placementId);
}
//广告加载成功
public void onAdLoad(object sender,ATAdEventArgs erg)
{
  Debug.Log("Developer callback onAdLoad :" + erg.placementId);
}
//广告加载失败
public void onAdLoadFail(object sender,ATAdErrorEventArgs erg )
{
  Debug.Log("Developer callback onAdLoadFail : : " + erg.placementId + "--code:" + erg.code + "--msg:" + erg.message);
}
//广告关闭按钮被点击
public void onAdCloseButtonTapped(object sender,ATAdEventArgs erg)
{
  Debug.Log("Developer callback onAdCloseButtonTapped :" + erg.placementId);
}
```
