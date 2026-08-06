---
title: "全自动加载模式"
source: "https://help.toponad.net/cn/docs/quan-zi-dong-jia-zai"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-07-22"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "全自动加载模式"]
content_sha256: "c4cb9fc24ff986548b0ab31efef60eeb1171d2d43d8a2ac999664baa80b082a0"
knowledge_role: "reference_only"
has_article_body: true
---

# 全自动加载模式

# 激励视频广告

## 1. 集成建议

### ● 广告加载

> - 广告位如果设置为全自动加载则**不需要**调用`ATRewardVideoAd#load()`方法进行广告加载
> - 建议在主页面进行全自动激励视频广告的初始化
> - `ATRewardVideoAutoAd#init()`的**context**必须是**Activity**，避免部分平台无法正常加载

> - 广告位如果设置为全自动加载则**不需要**调用`TURewardVideoAd#load()`方法进行广告加载
> - 建议在主页面进行全自动激励视频广告的初始化
> - `TURewardVideoAutoAd#init()`的**context**必须是**Activity**，避免部分平台无法正常加载

### ● 广告展示

> - 展示前判断`isAdReady()`是否准备好，准备好后再调用`show()`进行广告展示；若未准备好则发起广告加载，等待广告加载成功；
> - 展示前需要先判断当前**应用在前台**，如果在后台调用`show()`有可能会引起广告在应用外展示或者无法正常展示的情况；
> - 全自动激励视频内部实现自动加载逻辑，所以请避免在`onRewardVideoAutoLoaded`回调中直接执行广告展示

### ● 服务器回调

> - 全自动加载激励视频支持服务器回调（S2S）的激励下发机制，同时也支持各广告平台的服务器回调功能，请参考 [激励视频服务器激励(S2S)说明](https://help.toponad.net/cn/docs/msbnkj)

## 2. 加载广告

java
复制代码

```
//--------------------- 方式一 -------------------------
//直接在初始化时传入广告位id，支持传一到多个。
String[] placementIdArr = new String[]{"your placementId_1 ", "your placementId_2"};
//如果需要设置服务器回调localExtra信息,请务必在ATRewardVideoAutoAd.init()之前
setPlacementIdLocalExtra(placementIdArr);
ATRewardVideoAutoAd.init(activity, placementIdArr, new ATRewardVideoAutoLoadListener() {
    @Override
    public void onRewardVideoAutoLoaded(String placementId) {}

    @Override
    public void onRewardVideoAutoLoadFail(String placementId, AdError adError) {}
});
//--------------------- 方式一 -------------------------

//--------------------- 方式二 -------------------------
//先初始化，然后再传入广告位id，支持传一到多个
String[] placementIdArr = new String[]{"your placementId_1 ", "your placementId_2"};
//如果需要设置服务器回调localExtra信息,请务必在ATRewardVideoAutoAd.init()之前
setPlacementIdLocalExtra(placementIdArr);
ATRewardVideoAutoAd.init(activity, null, new ATRewardVideoAutoLoadListener() {
    @Override
    public void onRewardVideoAutoLoaded(String placementId) {}
    @Override
    public void onRewardVideoAutoLoadFail(String placementId, AdError adError) {}
});
//addPlacementId()必须在ATRewardVideoAutoAd.init()后再调用
ATRewardVideoAutoAd.addPlacementId(placementIdArr);
//--------------------- 方式二 -------------------------

//设置服务器回调localExtra信息
private void setPlacementIdLocalExtra(String... placementIdArr) {
    for (String placementId : placementIdArr) {
        String userid = "test_userid_001";
        String userdata = "test_userdata_001";
        Map localMap = new HashMap<>();
        localMap.put(ATAdConst.KEY.USER_ID, userid);
        localMap.put(ATAdConst.KEY.USER_CUSTOM_DATA, userdata);
        //从下一次的广告加载开始生效
        ATRewardVideoAutoAd.setLocalExtra(placementId, localMap);
    }
}
```

java
复制代码

```
//--------------------- 方式一 -------------------------
//直接在初始化时传入广告位id，支持传一到多个。
String[] placementIdArr = new String[]{"your placementId_1 ", "your placementId_2"};
//如果需要设置服务器回调localExtra信息,请务必在TURewardVideoAutoAd.init()之前
setPlacementIdLocalExtra(placementIdArr);
TURewardVideoAutoAd.init(activity, placementIdArr, new TURewardVideoAutoLoadListener() {
    @Override
    public void onRewardVideoAutoLoaded(String placementId) {}

    @Override
    public void onRewardVideoAutoLoadFail(String placementId, AdError adError) {}
});
//--------------------- 方式一 -------------------------

//--------------------- 方式二 -------------------------
//先初始化，然后再传入广告位id，支持传一到多个
String[] placementIdArr = new String[]{"your placementId_1 ", "your placementId_2"};
//如果需要设置服务器回调localExtra信息,请务必在TURewardVideoAutoAd.init()之前
setPlacementIdLocalExtra(placementIdArr);
TURewardVideoAutoAd.init(activity, null, new TURewardVideoAutoLoadListener() {
    @Override
    public void onRewardVideoAutoLoaded(String placementId) {}
    @Override
    public void onRewardVideoAutoLoadFail(String placementId, AdError adError) {}
});
//addPlacementId()必须在TURewardVideoAutoAd.init()后再调用
TURewardVideoAutoAd.addPlacementId(placementIdArr);
//--------------------- 方式二 -------------------------

//设置服务器回调localExtra信息
private void setPlacementIdLocalExtra(String... placementIdArr) {
    for (String placementId : placementIdArr) {
        String userid = "test_userid_001";
        String userdata = "test_userdata_001";
        Map localMap = new HashMap<>();
        localMap.put(TUAdConst.KEY.USER_ID, userid);
        localMap.put(TUAdConst.KEY.USER_CUSTOM_DATA, userdata);
        //从下一次的广告加载开始生效
        TURewardVideoAutoAd.setLocalExtra(placementId, localMap);
    }
}
```

> **注意：**
>
> - 如果广告位ID相同，则`init()`和`addPlacementId()`方法都只需要调用一次。

## 3. 展示广告

java
复制代码

```
ATRewardVideoAutoAd.show(activity, "your placement id", new ATRewardVideoAutoEventListener() {
    @Override
    public void onRewardedVideoAdPlayStart(ATAdInfo adInfo) {}

    @Override
    public void onRewardedVideoAdPlayEnd(ATAdInfo adInfo) {}

    @Override
    public void onRewardedVideoAdPlayFailed(AdError adError, ATAdInfo adInfo) {}

    @Override
    public void onRewardedVideoAdClosed(ATAdInfo adInfo) {}

    @Override
    public void onRewardedVideoAdPlayClicked(ATAdInfo adInfo) {}

    @Override
    public void onReward(ATAdInfo adInfo) {}
});
```

java
复制代码

```
TURewardVideoAutoAd.show(activity, "your placement id", new TURewardVideoAutoEventListener() {
    @Override
    public void onRewardedVideoAdPlayStart(TUAdInfo adInfo) {}

    @Override
    public void onRewardedVideoAdPlayEnd(TUAdInfo adInfo) {}

    @Override
    public void onRewardedVideoAdPlayFailed(AdError adError, TUAdInfo adInfo) {}

    @Override
    public void onRewardedVideoAdClosed(TUAdInfo adInfo) {}

    @Override
    public void onRewardedVideoAdPlayClicked(TUAdInfo adInfo) {}

    @Override
    public void onReward(TUAdInfo adInfo) {}
});
```

## 4. API说明

● ATRewardVideoAutoAd

> 全自动激励视频广告的加载、显示的操作类

| 方法 | 说明 |
| --- | --- |
| void init(Context context, String[] placementIds, [ATRewardVideoAutoLoadListener](https://help.toponad.net/cn/docs/ji-li-shi-pin-guang-gao-quan-zi-dong-jia-zai#%E2%97%8FATRewardVideoAutoLoadListener) loadListener) | 全自动激励视频广告的初始化方法，初始化后即自动对指定广告位发起广告加载 context：建议传入activity placementIds：开启全自动加载的广告位ID（可先传null，后续再调用`addPlacementId()`方法传广告位ID） loadListener：广告填充回调 |
| void addPlacementId(String... placementIds) | 设置全自动激励视频多个广告位id进行自动加载 placementIds：需全自动加载的广告位ID |
| void removePlacementId(String... placementIds) | 取消全自动激励视频多个广告位id进行自动加载 placementIds：不再需要全自动加载的广告位ID |
| void setLocalExtra(String placementId, Map<String, Object> localExtra) | 对指定广告位设置本地参数 placementId：广告位ID localExtra：本地参数，key通过**AdConst.KEY**进行获取 |
| boolean isAdReady(String placementId) | 判断该广告位是否存在可展示的广告 placementId：需查询的广告位ID |
| void show(Activity activity, String placementId, [ATRewardVideoAutoEventListener](https://help.toponad.net/cn/docs/ji-li-shi-pin-guang-gao-quan-zi-dong-jia-zai#%E2%97%8F_ATRewardVideoAutoEventListener) eventListener) | 展示该广告位的激励视频广告 activity：展示广告的Activity placementId：需展示的广告位ID eventListener：激励视频广告展示及激励回调 |
| void show(Activity activity, String placementId, ATShowConfig showConfig, ATRewardVideoAutoEventListener eventListener) | 展示该广告位激励视频广告  activity：展示广告的Activity placementId：需展示的广告位ID showConfig：展示广告配置，包括自定义参数和广告场景 eventListener：激励视频广告展示及激励回调 |

● ATRewardVideoAutoLoadListener

> 全自动激励视频广告的加载事件回调监听

| 方法 | 说明 |
| --- | --- |
| void onRewardVideoAutoLoaded(String placementId) | 对应广告位广告加载成功回调 placementId：对应广告位ID |
| void onRewardVideoAutoLoadFail(String placementId, AdError errorCode) | 对应广告位广告加载失败回调 placementId：广告位ID errorCode：广告加载失败信息 |

● ATRewardVideoAutoEventListener

> 全自动激励视频广告的展示相关事件回调监听

| 方法 | 说明 |
| --- | --- |
| void onRewardedVideoAdPlayStart([ATAdInfo](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming) adInfo) | 广告开始播放回调(即激励视频展示回调) adInfo：广告的信息对象 |
| void onRewardedVideoAdPlayEnd(ATAdInfo adInfo) | 广告播放结束回调 adInfo：广告的信息对象 |
| void onRewardedVideoAdPlayFailed(AdError adError, ATAdInfo adInfo) | 广告播放失败回调 adError：广告的信息对象 adInfo：广告展示失败信息 |
| void onReward(ATAdInfo adInfo) | 下发激励的时候会触发此回调，**建议开发者在此回调中下发奖励，一般在onRewardedVideoAdClosed之前回调** adInfo：广告的信息对象 |
| void onRewardedVideoAdClosed(ATAdInfo adInfo) | 广告关闭回调 adInfo：广告的信息对象 |
| void onRewardedVideoAdPlayClicked(ATAdInfo adInfo) | 广告点击 adInfo：广告的信息对象 |
| void onDeeplinkCallback(ATAdInfo adInfo, boolean isSuccess) | deeplink回调，针对Adx、OnlineApi广告 adInfo：广告的信息对象 isSuccess：是否成功，true=成功，false=不成功 |

● TURewardVideoAutoAd

> 全自动激励视频广告的加载、显示的操作类

| 方法 | 说明 |
| --- | --- |
| void init(Context context, String[] placementIds, [TURewardVideoAutoLoadListener](https://help.toponad.net/cn/docs/ji-li-shi-pin-guang-gao-quan-zi-dong-jia-zai#%E2%97%8FTURewardVideoAutoLoadListener) loadListener) | 全自动激励视频广告的初始化方法，初始化后即自动对指定广告位发起广告加载 context：建议传入activity placementIds：开启全自动加载的广告位ID（可先传null，后续再调用`addPlacementId()`方法传广告位ID） loadListener：广告填充回调 |
| void addPlacementId(String... placementIds) | 设置全自动激励视频多个广告位id进行自动加载 placementIds：需全自动加载的广告位ID |
| void removePlacementId(String... placementIds) | 取消全自动激励视频多个广告位id进行自动加载 placementIds：不再需要全自动加载的广告位ID |
| void setLocalExtra(String placementId, Map<String, Object> localExtra) | 对指定广告位设置本地参数 placementId：广告位ID localExtra：本地参数，key通过**TUAdConst.KEY**进行获取 |
| boolean isAdReady(String placementId) | 判断该广告位是否存在可展示的广告 placementId：需查询的广告位ID |
| void show(Activity activity, String placementId, [TURewardVideoAutoEventListener](https://help.toponad.net/cn/docs/ji-li-shi-pin-guang-gao-quan-zi-dong-jia-zai#%E2%97%8F_TURewardVideoAutoEventListener) eventListener) | 展示该广告位的激励视频广告 activity：展示广告的Activity placementId：需展示的广告位ID eventListener：激励视频广告展示及激励回调 |
| void show(Activity activity, String placementId, TUShowConfig showConfig, TURewardVideoAutoEventListener eventListener) | 展示该广告位激励视频广告  activity：展示广告的Activity placementId：需展示的广告位ID showConfig：展示广告配置，包括自定义参数和广告场景 eventListener：激励视频广告展示及激励回调 |

● TURewardVideoAutoLoadListener

> 全自动激励视频广告的加载事件回调监听

| 方法 | 说明 |
| --- | --- |
| void onRewardVideoAutoLoaded(String placementId) | 对应广告位广告加载成功回调 placementId：对应广告位ID |
| void onRewardVideoAutoLoadFail(String placementId, AdError errorCode) | 对应广告位广告加载失败回调 placementId：广告位ID errorCode：广告加载失败信息 |

● TURewardVideoAutoEventListener

> 全自动激励视频广告的展示相关事件回调监听

| 方法 | 说明 |
| --- | --- |
| void onRewardedVideoAdPlayStart([TUAdInfo](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming) adInfo) | 广告开始播放回调(即激励视频展示回调) adInfo：广告的信息对象 |
| void onRewardedVideoAdPlayEnd(TUAdInfo adInfo) | 广告播放结束回调 adInfo：广告的信息对象 |
| void onRewardedVideoAdPlayFailed(AdError adError, TUAdInfo adInfo) | 广告播放失败回调 adError：广告的信息对象 adInfo：广告展示失败信息 |
| void onReward(TUAdInfo adInfo) | 下发激励的时候会触发此回调，**建议开发者在此回调中下发奖励，一般在onRewardedVideoAdClosed之前回调** adInfo：广告的信息对象 |
| void onRewardedVideoAdClosed(TUAdInfo adInfo) | 广告关闭回调 adInfo：广告的信息对象 |
| void onRewardedVideoAdPlayClicked(TUAdInfo adInfo) | 广告点击 adInfo：广告的信息对象 |
| void onDeeplinkCallback(TUAdInfo adInfo, boolean isSuccess) | deeplink回调，针对Adx、OnlineApi广告 adInfo：广告的信息对象 isSuccess：是否成功，true=成功，false=不成功 |

---

## 5. Demo参考

代码示例：[Demo](https://github.com/toponteam/TPN-Android-Demo)的RewardVideoAdActivity

---

# 插屏广告

## 1. 集成建议

### ● 广告加载

> - 广告位如果设置为全自动加载则不要调用`ATInterstitial#load()`方法进行广告加载
> - 建议在主页面进行全自动激励视频广告的初始化
> - `ATInterstitialAutoAd#init()`的**context**必须是**Activity**，避免部分平台无法正常加载

> - 广告位如果设置为全自动加载则不要调用`TUInterstitial#load()`方法进行广告加载
> - 建议在主页面进行全自动激励视频广告的初始化
> - `TUInterstitialAutoAd#init()`的**context**必须是**Activity**，避免部分平台无法正常加载

### ● 广告展示

> - 展示前判断`isAdReady()`是否准备好，准备好后再调用`show()`进行广告展示；若未准备好则发起广告加载，等待广告加载成功；
> - 展示前需要先判断当前**应用在前台**，如果在后台调用`show()`有可能会引起广告在应用外展示或者无法正常展示的情况；
> - 全自动插屏内部实现自动加载逻辑，所以请避免在`onInterstitialAutoLoaded()`回调中直接执行广告展示

## 2. 加载广告

java
复制代码

```
//--------------------- 方式一 -------------------------
//直接在初始化时传入广告位id，支持传一到多个。
String[] placementIdArr = new String[]{"your placementId_1 ", "your placementId_2"};
ATInterstitialAutoAd.init(activity, placementIdArr, new ATInterstitialAutoLoadListener() {
    @Override
    public void onInterstitialAutoLoaded(String placementId) {}

    @Override
    public void onInterstitialAutoLoadFail(String placementId, AdError adError) {}
});
//--------------------- 方式一 -------------------------

//--------------------- 方式二 -------------------------
//先初始化，然后再传入广告位id，支持传一到多个
String[] placementIdArr = new String[]{"your placementId_1 ", "your placementId_2"};
ATInterstitialAutoAd.init(activity, null, new ATInterstitialAutoLoadListener() {
    @Override
    public void onInterstitialAutoLoaded(String placementId) {}

    @Override
    public void onInterstitialAutoLoadFail(String placementId, AdError adError) {}
});
//addPlacementId()必须在ATInterstitialAutoAd.init()后再调用
ATInterstitialAutoAd.addPlacementId(placementIdArr);
//--------------------- 方式二 -------------------------
```

java
复制代码

```
//--------------------- 方式一 -------------------------
//直接在初始化时传入广告位id，支持传一到多个。
String[] placementIdArr = new String[]{"your placementId_1 ", "your placementId_2"};
TUInterstitialAutoAd.init(activity, placementIdArr, new TUInterstitialAutoLoadListener() {
    @Override
    public void onInterstitialAutoLoaded(String placementId) {}

    @Override
    public void onInterstitialAutoLoadFail(String placementId, AdError adError) {}
});
//--------------------- 方式一 -------------------------

//--------------------- 方式二 -------------------------
//先初始化，然后再传入广告位id，支持传一到多个
String[] placementIdArr = new String[]{"your placementId_1 ", "your placementId_2"};
TUInterstitialAutoAd.init(activity, null, new TUInterstitialAutoLoadListener() {
    @Override
    public void onInterstitialAutoLoaded(String placementId) {}

    @Override
    public void onInterstitialAutoLoadFail(String placementId, AdError adError) {}
});
//addPlacementId()必须在TUInterstitialAutoAd.init()后再调用
TUInterstitialAutoAd.addPlacementId(placementIdArr);
//--------------------- 方式二 -------------------------
```

> **注意：**
>
> - 如果广告位ID相同，则`init()`和`addPlacementId()`都只需要调用一次

## 3. 展示广告

java
复制代码

```
ATInterstitialAutoAd.show(activity, "your placement id", new ATInterstitialAutoEventListener() {
    @Override
    public void onInterstitialAdShow(ATAdInfo adInfo) {}

    @Override
    public void onInterstitialAdVideoStart(ATAdInfo adInfo) {}

    @Override
    public void onInterstitialAdVideoEnd(ATAdInfo adInfo) {}

    @Override
    public void onInterstitialAdVideoError(AdError adError) {}

    @Override
    public void onInterstitialAdClose(ATAdInfo adInfo) {}

    @Override
    public void onInterstitialAdClicked(ATAdInfo adInfo) {}
});
```

java
复制代码

```
TUInterstitialAutoAd.show(activity, "your placement id", new TUInterstitialAutoEventListener() {
    @Override
    public void onInterstitialAdShow(TUAdInfo adInfo) {}

    @Override
    public void onInterstitialAdVideoStart(TUAdInfo adInfo) {}

    @Override
    public void onInterstitialAdVideoEnd(TUAdInfo adInfo) {}

    @Override
    public void onInterstitialAdVideoError(AdError adError) {}

    @Override
    public void onInterstitialAdClose(TUAdInfo adInfo) {}

    @Override
    public void onInterstitialAdClicked(TUAdInfo adInfo) {}
});
```

## 4. API说明

● ATInterstitialAutoAd

> 全自动插屏广告的加载、显示的操作类

| 方法 | 说明 |
| --- | --- |
| void init(Context context, String[] placementIds, [ATInterstitialAutoLoadListener](https://help.toponad.net/cn/docs/cha-ping-guang-gao-quan-zi-dong-jia-zai#%E2%97%8FATInterstitialAutoLoadListener) loadListener) | 全自动插屏广告的初始化方法，初始化后即自动对指定广告位发起广告加载 context：建议传入activity placementIds：开启全自动加载的广告位Id（可先传null，后续再调用`addPlacementId()`传广告位id） loadListener：广告填充回调 |
| void addPlacementId(String... placementIds) | 设置全自动插屏多个广告位id进行自动加载 placementIds：需要全自动加载广告位Id |
| void removePlacementId(String... placementIds) | 取消全自动插屏多个广告位id进行自动加载 placementIds：不再需要全自动加载的广告位ID |
| void setLocalExtra(String placementId, Map<String, Object> localExtra) | 对指定广告位设置自定义参数 placementId：广告位iD localExtra：自定义参数，key通过**ATAdConst.KEY**进行获取 |
| boolean isAdReady(String placementId) | 判断该广告位是否存在可展示的广告 placementId：需查询的广告位ID |
| void show(Activity activity, String placementId, [ATInterstitialAutoEventListener](https://help.toponad.net/cn/docs/cha-ping-guang-gao-quan-zi-dong-jia-zai#%E2%97%8FATInterstitialAutoEventListener) eventListener) | 展示该广告位的插屏广告 activity：展示广告的Activity placementId：需展示的广告位ID eventListener：插屏广告展示回调 |
| void show(Activity activity, String placementId, ATShowConfig showConfig, ATInterstitialAutoEventListener eventListener) | 展示该广告位下的插屏广告 activity：展示广告的Activity placementId：需展示的广告位ID showConfig：展示广告配置，包括自定义参数和广告场景 eventListener：插屏广告展示回调 |

● ATInterstitialAutoLoadListener

> 全自动插屏广告的加载事件回调监听

| 方法 | 说明 |
| --- | --- |
| void onInterstitialAutoLoaded(String placementId) | 对应广告位广告加载成功回调 placementId：对应广告位ID |
| void onInterstitialAutoLoadFail(String placementId, AdError adError) | 对应广告位广告加载失败回调 placementId：广告位ID adError：广告加载失败信息 |

● ATInterstitialAutoEventListener

> 全自动插屏广告的展示相关事件回调监听

| 方法 | 说明 |
| --- | --- |
| void onInterstitialAdShow([ATAdInfo](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming#1._ATAdInfo) adInfo) | 广告展示回调 adInfo：广告的信息对象 |
| void onInterstitialAdVideoStart(ATAdInfo adInfo) | 视频广告开始播放回调 adInfo：广告的信息对象 |
| void onInterstitialAdVideoAdPlayEnd(ATAdInfo adInfo) | 广告播放结束回调 adInfo：广告的信息对象 |
| void onInterstitialAdVideoError(AdError adError) | 广告展示失败回调 adError：广告展示失败信息 |
| void onInterstitialAdClose(ATAdInfo adInfo) | 广告关闭回调 adInfo：广告的信息对象 |
| void onInterstitialAdClicked(ATAdInfo adInfo) | 广告点击 adInfo：广告的信息对象 |
| void onDeeplinkCallback(ATAdInfo adInfo, boolean isSuccess) | deeplink回调，针对Adx、Online API广告 adInfo：广告的信息对象 isSuccess：是否成功，true=成功，false=不成功 |

● TUInterstitialAutoAd

> 全自动插屏广告的加载、显示的操作类

| 方法 | 说明 |
| --- | --- |
| void init(Context context, String[] placementIds, [TUInterstitialAutoLoadListener](https://help.toponad.net/cn/docs/cha-ping-guang-gao-quan-zi-dong-jia-zai#%E2%97%8FTUInterstitialAutoLoadListener) loadListener) | 全自动插屏广告的初始化方法，初始化后即自动对指定广告位发起广告加载 context：建议传入activity placementIds：开启全自动加载的广告位Id（可先传null，后续再调用`addPlacementId()`传广告位id） loadListener：广告填充回调 |
| void addPlacementId(String... placementIds) | 设置全自动插屏多个广告位id进行自动加载 placementIds：需要全自动加载广告位Id |
| void removePlacementId(String... placementIds) | 取消全自动插屏多个广告位id进行自动加载 placementIds：不再需要全自动加载的广告位ID |
| void setLocalExtra(String placementId, Map<String, Object> localExtra) | 对指定广告位设置自定义参数 placementId：广告位iD localExtra：自定义参数，key通过**TUAdConst.KEY**进行获取 |
| boolean isAdReady(String placementId) | 判断该广告位是否存在可展示的广告 placementId：需查询的广告位ID |
| void show(Activity activity, String placementId, [TUInterstitialAutoEventListener](https://help.toponad.net/cn/docs/cha-ping-guang-gao-quan-zi-dong-jia-zai#%E2%97%8FTUInterstitialAutoEventListener) eventListener) | 展示该广告位的插屏广告 activity：展示广告的Activity placementId：需展示的广告位ID eventListener：插屏广告展示回调 |
| void show(Activity activity, String placementId, TUShowConfig showConfig, TUInterstitialAutoEventListener eventListener) | 展示该广告位下的插屏广告 activity：展示广告的Activity placementId：需展示的广告位ID showConfig：展示广告配置，包括自定义参数和广告场景 eventListener：插屏广告展示回调 |

● TUInterstitialAutoLoadListener

> 全自动插屏广告的加载事件回调监听

| 方法 | 说明 |
| --- | --- |
| void onInterstitialAutoLoaded(String placementId) | 对应广告位广告加载成功回调 placementId：对应广告位ID |
| void onInterstitialAutoLoadFail(String placementId, AdError adError) | 对应广告位广告加载失败回调 placementId：广告位ID adError：广告加载失败信息 |

● TUInterstitialAutoEventListener

> 全自动插屏广告的展示相关事件回调监听

| 方法 | 说明 |
| --- | --- |
| void onInterstitialAdShow([TUAdInfo](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming#1._TUAdInfo) adInfo) | 广告展示回调 adInfo：广告的信息对象 |
| void onInterstitialAdVideoStart(TUAdInfo adInfo) | 视频广告开始播放回调 adInfo：广告的信息对象 |
| void onInterstitialAdVideoAdPlayEnd(TUAdInfo adInfo) | 广告播放结束回调 adInfo：广告的信息对象 |
| void onInterstitialAdVideoError(AdError adError) | 广告展示失败回调 adError：广告展示失败信息 |
| void onInterstitialAdClose(TUAdInfo adInfo) | 广告关闭回调 adInfo：广告的信息对象 |
| void onInterstitialAdClicked(TUAdInfo adInfo) | 广告点击 adInfo：广告的信息对象 |
| void onDeeplinkCallback(TUAdInfo adInfo, boolean isSuccess) | deeplink回调，针对Adx、Online API广告 adInfo：广告的信息对象 isSuccess：是否成功，true=成功，false=不成功 |

## 5. Demo参考

代码示例：[Demo](https://github.com/toponteam/TPN-Android-Demo)的InterstitialAdActivity.java
