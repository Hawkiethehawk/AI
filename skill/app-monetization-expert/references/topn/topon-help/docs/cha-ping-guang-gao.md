---
title: "插屏广告"
source: "https://help.toponad.net/cn/docs/cha-ping-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-03-20"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "广告样式", "插屏广告"]
content_sha256: "d21089da6e6fa48fde32f630dde591838a3371a460152d39db40255bf0dce5a8"
knowledge_role: "reference_only"
has_article_body: true
---

# 插屏广告

## 1. 集成建议

### 1.1 展示广告

- 展示前判断 `isAdReady` 是否准备好，准备好后再调用 `show` 进行广告展示；若未准备好则发起广告加载，等待广告加载成功；
- 如果需要在加载成功的回调 `onInterstitialAdLoaded`  中展示广告，必须先判断当前应用在前台才能执行展示方法，否则有可能会引起广告在应用外展示或者无法正常展示的情况；

### 1.2 广告预加载

- 请提前调用加载方法进行广告的请求（比如在应用启动就开始加载广告），以便需要触发广告时可以快速展示
- 在广告展示后， `onInterstitialAdVideoStart` 的回调中无需 `isAdReady` 判断，直接调用 `load` 进行预加载 （有助于提升优先级比较高的广告源的展示量）

---

## 2. 加载广告

建议您能提前调用该步骤，这样能减少用户因加载广告耗时造成的等待。

java
复制代码

```
ATInterstitial mInterstitialAd = new ATInterstitial(activity, "your placement id");
//设置广告监听
mInterstitialAd.setAdListener(new ATInterstitialListener() {
    @Override
    public void onInterstitialAdLoaded() {
        // 加载成功回调
        // 重置重试加载次数
        retryAttempt = 0;
    }

    @Override
    public void onInterstitialAdLoadFail(AdError adError) {
        // 加载失败回调
        // 我们建议您按照指数递增的方式延长重试间隔，直到达到最大延迟时间（本例为 8 秒）或最大重试次数（本例为 3 次）
        if (retryAttempt >= 3) return;
        retryAttempt++;
        long delayMillis = TimeUnit.SECONDS.toMillis((long) Math.pow(2, Math.min(3, retryAttempt)));
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                mInterstitialAd.load();
            }
        }, delayMillis);
    }

    @Override
    public void onInterstitialAdShow(ATAdInfo adInfo) {
        //建议在此回调中调用load进行广告的加载，方便下一次广告的展示（不需要调用isAdReady()）
        mInterstitialAd.load();
    }

    @Override
    public void onInterstitialAdVideoStart(ATAdInfo adInfo) {}

    @Override
    public void onInterstitialAdVideoEnd(ATAdInfo adInfo) {}

    @Override
    public void onInterstitialAdVideoError(AdError adError, ATAdInfo adInfo) {
        // 展示失败回调
        mInterstitialAd.load();
    }

    @Override
    public void onInterstitialAdClose(ATAdInfo adInfo) {
        // 广告关闭回调
        mInterstitialAd.load();
    }

    @Override
    public void onInterstitialAdClicked(ATAdInfo adInfo) {}
});
mInterstitialAd.load();
```

java
复制代码

```
TUInterstitial mInterstitialAd = new TUInterstitial(activity, "your placement id");
//设置广告监听
mInterstitialAd.setAdListener(new TUInterstitialListener() {
    @Override
    public void onInterstitialAdLoaded() {
        // 加载成功回调
        // 重置重试加载次数
        retryAttempt = 0;
    }

    @Override
    public void onInterstitialAdLoadFail(AdError adError) {
        // 加载失败回调
        // 我们建议您按照指数递增的方式延长重试间隔，直到达到最大延迟时间（本例为 8 秒）或最大重试次数（本例为 3 次）
        if (retryAttempt >= 3) return;
        retryAttempt++;
        long delayMillis = TimeUnit.SECONDS.toMillis((long) Math.pow(2, Math.min(3, retryAttempt)));
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                mInterstitialAd.load();
            }
        }, delayMillis);
    }

    @Override
    public void onInterstitialAdShow(TUAdInfo adInfo) {
        //建议在此回调中调用load进行广告的加载，方便下一次广告的展示（不需要调用isAdReady()）
        mInterstitialAd.load();
    }

    @Override
    public void onInterstitialAdVideoStart(TUAdInfo adInfo) {}

    @Override
    public void onInterstitialAdVideoEnd(TUAdInfo adInfo) {}

    @Override
    public void onInterstitialAdVideoError(AdError adError, TUAdInfo adInfo) {
        // 展示失败回调
        mInterstitialAd.load();
    }

    @Override
    public void onInterstitialAdClose(TUAdInfo adInfo) {
        // 广告关闭回调
        mInterstitialAd.load();
    }

    @Override
    public void onInterstitialAdClicked(TUAdInfo adInfo) {}
});
mInterstitialAd.load();
```

---

## 3. 展示广告

> **💡Tips:**
>
> ● 在展示广告之前，建议先调用 `mInterstitialAd.isAdReady()` ，值为 **true** 则展示广告，值为 **false** 则实时加载等待加载成功后再展示广告

java
复制代码

```
if (mInterstitialAd.isAdReady()) {
   ATShowConfig showConfig = new ATShowConfig.Builder()
                .scenarioId("your scenario id")
                .build();
    mInterstitialAd.show(activity，showConfig);
} else {
   mInterstitialAd.load();
}
```

java
复制代码

```
if (mInterstitialAd.isAdReady()) {
   TUShowConfig showConfig = new TUShowConfig.Builder()
                .scenarioId("your scenario id")
                .build();
    mInterstitialAd.show(activity，showConfig);
} else {
   mInterstitialAd.load();
}
```

---

## 4. 广告场景统计

> [**统计场景到达率**](https://help.toponad.com/cn/docs/1RWLAv) ，呈现在后台的 数据报表 -> 漏斗分析报表 -> 到达广告场景 ，建议您在正确的地方进行调用
>
> 1. 先调用 `entryAdScenario()`
> 2. 再调用 `isAdReady()`
> 3. 最后调用 `show()` 展示

| 方法 | 说明 |
| --- | --- |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.com/cn/docs/1RWLAv) placementId: 广告位ID scenarioId: 广告场景ID（非必传，传null会统计到默认场景） |
| void entryAdScenario(String scenarioId) | （v6.5.80及以上) 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.com/cn/docs/1RWLAv) placementId: 广告位ID scenarioId: 广告场景ID（非必传，传null会统计到默认场景） |

java
复制代码

```
ATInterstitial.entryAdScenario("your placement id", "your scenario id");
//6.5.80及以上
mInterstitialAd.entryAdScenario("your scenario id");
if (mInterstitialAd.isAdReady()) {
   ATShowConfig showConfig = new ATShowConfig.Builder()
                .scenarioId("your scenario id")
                .build();
    mInterstitialAd.show(activity，showConfig);
} else {
   mInterstitialAd.load();
}
```

java
复制代码

```
TUInterstitial.entryAdScenario("your placement id", "your scenario id");
//6.5.80及以上
mInterstitialAd.entryAdScenario("your scenario id");
if (mInterstitialAd.isAdReady()) {
   TUShowConfig showConfig = new TUShowConfig.Builder()
                .scenarioId("your scenario id")
                .build();
    mInterstitialAd.show(activity，showConfig);
} else {
   mInterstitialAd.load();
}
```

---

## 5. API说明

● ATInterstitial

> 插屏广告的操作类，负责广告加载、监听、显示等。

| **方法** | **说明** |
| --- | --- |
| ATInterstitial(Context context, String placmentId) | 开屏广告的初始化方法context：Context上下文，建议传入ActivityplacmentId：插屏样式的广告位，通过TopOn后台创建插屏 **广告位** 获取的 |
| void setLocalExtra(Map map) | 加载广告前或者在展示时设置自定义信息 |
| void setAdListener([ATInterstitialListener](https://help.toponad.net/cn/docs/cha-ping-guang-gao#%E2%97%8F_ATInterstitialListener) listener) | 设置 **广告位层级** 的广告监听回调listener：广告位事件回调的接口类 |
| void load() | 发起广告加载 |
| void load(Context context) | 发起广告加载，开发者可通过调用此方法使用指定的Context进行广告的加载 |
| boolean isAdReady() | 判断当前广告位是否存在可展示的广告返回值：true=存在可展示的广告false=不存在可展示的广告 |
| void show(Activity activity, ATShowConfig showConfig) | 展示广告，传入展示广告时的自定义参数和 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) 参数2：展示广告配置，包括自定义参数和广告场景 |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法请查看广告场景placementId: 广告位IDscenarioId: 广告场景ID（非必传，传null会统计到默认场景） |
| void entryAdScenario(String scenarioId) | (6.5.80及以上) 进入业务场景当前广告位缓存状态统计，具体用法请查看广告场景placementId: 广告位IDscenarioId: 广告场景ID（非必传，传null会统计到默认场景） |

● ATInterstitialListener

> **广告位层级** 的广告事件回调

| **方法** | **说明** |
| --- | --- |
| void onInterstitialAdLoaded() | 广告加载成功回调 |
| void onInterstitialAdLoadFail(AdError error) | 广告加载失败回调，可通过AdError.getFullErrorInfo()获取全部错误信息 error：错误信息 **注意**: 禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿 |
| void onInterstitialAdShow([ATAdInfo](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming#1._ATAdInfo) adInfo) | 广告展示回调 adInfo：广告信息对象 |
| void onInterstitialAdVideoStart(ATAdInfo adInfo) | 视频广告开始播放回调 adInfo：广告信息对象 |
| void onInterstitialAdVideoEnd(ATAdInfo adInfo) | 视频广告播放结束回调 adInfo：广告信息对象 |
| void onInterstitialAdVideoError(AdError errorCode) | 视频广告播放失败回调 errorCode：错误信息 |
| void onInterstitialAdClose(ATAdInfo adInfo) | 广告关闭回调， 建议在此回调中调用load进行广告的加载，方便下一次广告的展示 adInfo：广告信息对象 |
| void onInterstitialAdClicked(ATAdInfo adInfo) | 广告点击回调 adInfo：广告信息对象 |

● TUInterstitial

> 插屏广告的操作类，负责广告加载、监听、显示等。

| **方法** | **说明** |
| --- | --- |
| TUInterstitial(Context context, String placmentId) | 开屏广告的初始化方法context：Context上下文，建议传入ActivityplacmentId：插屏样式的广告位，通过TopOn后台创建插屏 **广告位** 获取的 |
| void setLocalExtra(Map map) | 加载广告前或者在展示时设置自定义信息 |
| void setAdListener([TUInterstitialListener](https://help.toponad.net/cn/docs/cha-ping-guang-gao#%E2%97%8F_TUInterstitialListener) listener) | 设置 **广告位层级** 的广告监听回调listener：广告位事件回调的接口类 |
| void load() | 发起广告加载 |
| void load(Context context) | 发起广告加载，开发者可通过调用此方法使用指定的Context进行广告的加载 |
| boolean isAdReady() | 判断当前广告位是否存在可展示的广告返回值：true=存在可展示的广告false=不存在可展示的广告 |
| void show(Activity activity, TUShowConfig showConfig) | 展示广告，传入展示广告时的自定义参数和 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) 参数2：展示广告配置，包括自定义参数和广告场景 |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法请查看广告场景placementId: 广告位IDscenarioId: 广告场景ID（非必传，传null会统计到默认场景） |

● TUInterstitialListener

> **广告位层级** 的广告事件回调

| **方法** | **说明** |
| --- | --- |
| void onInterstitialAdLoaded() | 广告加载成功回调 |
| void onInterstitialAdLoadFail(AdError error) | 广告加载失败回调，可通过AdError.getFullErrorInfo()获取全部错误信息 error：错误信息 **注意**: 禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿 |
| void onInterstitialAdShow([TUAdInfo](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming#1._TUAdInfo) adInfo) | 广告展示回调 adInfo：广告信息对象 |
| void onInterstitialAdVideoStart(TUAdInfo adInfo) | 视频广告开始播放回调 adInfo：广告信息对象 |
| void onInterstitialAdVideoEnd(TUAdInfo aInfo) | 视频广告播放结束回调 adInfo：广告信息对象 |
| void onInterstitialAdVideoError(AdError errorCode) | 视频广告播放失败回调 errorCode：错误信息 |
| void onInterstitialAdClose(TUAdInfo adInfo) | 广告关闭回调， 建议在此回调中调用load进行广告的加载，方便下一次广告的展示 adInfo：广告信息对象 |
| void onInterstitialAdClicked(TUAdInfo adInfo) | 广告点击回调 adInfo：广告信息对象 |

---

## 6. 高级设置

[全自动加载](https://help.toponad.net/cn/docs/quan-zi-dong-jia-zai#%E6%8F%92%E5%B1%8F%E5%B9%BF%E5%91%8A) ：TopOn推出的一站式请求维护方案，能够根据用户的使用状态和广告消耗进度，多节点智能判断下一条广告的预加载和缓存时机。

[自定义插屏广告](https://help.toponad.net/cn/docs/cha-ping-hun-yong-yuan-sheng-guang-gao) ：在插屏广告位上配置原生广告。

[预置策略](https://help.toponad.net/cn/docs/wERYJv) ：可通过配置预置策略， 提高首次冷启动的广告加载效果。

---

## 7. 接入参考

示例代码： [Demo](https://github.com/toponteam/TopOn-Android-Demo) 的InterstitialAdActivity.java
