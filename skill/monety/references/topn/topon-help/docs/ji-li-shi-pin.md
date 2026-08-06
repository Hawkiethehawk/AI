---
title: "激励视频广告"
source: "https://help.toponad.net/cn/docs/ji-li-shi-pin"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-03-20"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "广告样式", "激励视频广告"]
content_sha256: "ad17383cbbdbd2263a2411168d5a3f0be673480d358d8c07c576906ed999c823"
knowledge_role: "reference_only"
has_article_body: true
---

# 激励视频广告

## 1. 集成建议

### 1.1 展示广告

- 展示前判断 `isAdReady` 是否准备好，准备好后再调用 `show` 进行广告展示；若未准备好则发起广告加载，等待广告加载成功；如果需要在加载成功的回调 `onRewardedVideoAdLoaded` 中展示广告，必须先判断当前应用在前台才能执行展示方法，否则有可能会引起广告在应用外展示或者无法正常展示的情况

### 1.2 广告预加载

- 请提前调用加载方法进行广告的请求（比如在应用启动就开始加载广告），以便需要触发广告时可以快速展示
- 在广告展示后， `onRewardedVideoAdPlayStart` 的回调中无需 `isAdReady` 判断，直接调用 `load` 进行预加载 （有助于提升优先级比较高的广告源的展示量）

---

## 2. 加载广告

建议您能提前调用该步骤，这样能减少用户因加载广告耗时造成的等待。

java
复制代码

```
ATRewardVideoAd mRewardVideoAd = new ATRewardVideoAd(this, "your placement id");
//设置广告监听
mRewardVideoAd.setAdListener(new ATRewardVideoListener() {
    @Override
    public void onRewardedVideoAdLoaded() {
        // 加载成功回调
        // 重置重试加载次数
        retryAttempt = 0;
    }

    @Override
    public void onRewardedVideoAdFailed(AdError adError) {
        // 加载失败回调
        // 我们建议您按照指数递增的方式延长重试间隔，直到达到最大延迟时间（本例为 8 秒）或最大重试次数（本例为 3 次）
        if (retryAttempt >= 3) return;
        retryAttempt++;
        long delayMillis = TimeUnit.SECONDS.toMillis((long) Math.pow(2, Math.min(3, retryAttempt)));
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                mRewardVideoAd.load();
            }
        }, delayMillis);
    }

    @Override
    public void onRewardedVideoAdPlayStart(ATAdInfo adInfo) {}

    @Override
    public void onRewardedVideoAdPlayEnd(ATAdInfo adInfo) {}

    @Override
    public void onRewardedVideoAdPlayFailed(AdError adError, ATAdInfo adInfo) {
        // 展示失败回调
        // pre-load
        mRewardVideoAd.load();
    }

    @Override
    public void onRewardedVideoAdClosed(ATAdInfo adInfo) {
        // 广告关闭回调
        // pre-load
        mRewardVideoAd.load();
    }

    @Override
    public void onReward(ATAdInfo adInfo) {
        //建议在此回调中下发奖励
    }

    @Override
    public void onRewardedVideoAdPlayClicked(ATAdInfo adInfo) {}
});
mRewardVideoAd.load();
```

java
复制代码

```
TURewardVideoAd mRewardVideoAd = new TURewardVideoAd(this, "your placement id");
//设置广告监听
mRewardVideoAd.setAdListener(new TURewardVideoListener() {
    @Override
    public void onRewardedVideoAdLoaded() {
        // 加载成功回调
        // 重置重试加载次数
        retryAttempt = 0;
    }

    @Override
    public void onRewardedVideoAdFailed(AdError adError) {
        // 加载失败回调
        // 我们建议您按照指数递增的方式延长重试间隔，直到达到最大延迟时间（本例为 8 秒）或最大重试次数（本例为 3 次）
        if (retryAttempt >= 3) return;
        retryAttempt++;
        long delayMillis = TimeUnit.SECONDS.toMillis((long) Math.pow(2, Math.min(3, retryAttempt)));
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                mRewardVideoAd.load();
            }
        }, delayMillis);
    }

    @Override
    public void onRewardedVideoAdPlayStart(TUAdInfo adInfo) {}

    @Override
    public void onRewardedVideoAdPlayEnd(TUAdInfo adInfo) {}

    @Override
    public void onRewardedVideoAdPlayFailed(AdError adError, TUAdInfo adInfo) {
        // 展示失败回调
        // pre-load
        mRewardVideoAd.load();
    }

    @Override
    public void onRewardedVideoAdClosed(TUAdInfo adInfo) {
        // 广告关闭回调
        // pre-load
        mRewardVideoAd.load();
    }

    @Override
    public void onReward(TUAdInfo adInfo) {
        //建议在此回调中下发奖励
    }

    @Override
    public void onRewardedVideoAdPlayClicked(TUAdInfo adInfo) {}
});
mRewardVideoAd.load();
```

---

## 3. 展示广告

> **💡Tips:**
>
> ● 在展示广告之前，建议先调用 `mRewardVideoAd.isAdReady()` ，值为 **true** 则展示广告，值为 **false** 则实时加载等待加载成功后再展示广告

java
复制代码

```
if (mRewardVideoAd.isAdReady()) {
   ATShowConfig showConfig = new ATShowConfig.Builder()
                .scenarioId("your scenario id")
                .build();
    mRewardVideoAd.show(activity,showConfig);
} else {
   mRewardVideoAd.load();
}
```

java
复制代码

```
if (mRewardVideoAd.isAdReady()) {
   TUShowConfig showConfig = new TUShowConfig.Builder()
                .scenarioId("your scenario id")
                .build();
    mRewardVideoAd.show(activity,showConfig);
} else {
   mRewardVideoAd.load();
}
```

---

## 4. 广告场景统计

> [**统计场景到达率**](https://help.toponad.net/cn/docs/1RWLAv) ，呈现在后台的 数据报表 -> 漏斗分析报表 -> 到达广告场景 ，建议您在正确的地方进行调用
>
> 1. 先调用 `entryAdScenario()`
> 2. 再调用 `isAdReady()`
> 3. 最后调用 `show()` 展示

| 方法 | 说明 |
| --- | --- |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) **placementId**: 广告位ID **scenarioId**: 广告场景ID （非必传，传null会统计到默认场景） |
| void entryAdScenario(String scenarioId) | （6.5.80及以上）进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) **placementId**: 广告位ID **scenarioId**: 广告场景ID （非必传，传null会统计到默认场景） |

java
复制代码

```
ATRewardVideoAd.entryAdScenario("your placement id", "your scenario id");
//6.5.80及以上
mRewardVideoAd.entryAdScenario( "your scenario id");
if (mRewardVideoAd.isAdReady()) {
   ATShowConfig showConfig = new ATShowConfig.Builder()
                .scenarioId("your scenario id")
                .build();
    mRewardVideoAd.show(activity,showConfig);
} else {
   mRewardVideoAd.load();
}
```

java
复制代码

```
TURewardVideoAd.entryAdScenario("your placement id", "your scenario id");
//6.5.80及以上
mRewardVideoAd.entryAdScenario("your scenario id");
if (mRewardVideoAd.isAdReady()) {
   TUShowConfig showConfig = new TUShowConfig.Builder()
                .scenarioId("your scenario id")
                .build();
    mRewardVideoAd.show(activity,showConfig);
} else {
   mRewardVideoAd.load();
}
```

---

## 5. 设置自定义参数

- 在加载广告前或展示广告时传入自定义参数，可以在回调信息AdInfo获取
- 展示时传入的自定义参数跟加载时传入的自定义参数相互独立，同时TopOn的服务端激励回调也支持返回展示时传入的自定义参数

### 5.1 加载广告前传入激励相关参数

> **⚠️Tips**
>
> 传入的自定义参数可在 `onRewardedVideoAdLoaded()` 回调中通过 `ATAdInfo#getLocalExtra()` 获取到，注意保持 **KEY** 一致

java
复制代码

```
ATRewardVideoAd mRewardVideoAd = new ATRewardVideoAd(this, "your placement id");
String userdata = "test_userdata_001";
Map<String, Object> localMap = new HashMap<>();
localMap.put(ATAdConst.KEY.USER_CUSTOM_DATA, userdata);
//在广告加载前设置激励相关参数
mRewardVideoAd.setLocalExtra(localExtraMap);
mRewardVideoAd.setAdListener(new ATRewardVideoListener() {
    ...
    @Override
    public void onRewardedVideoAdPlayStart(ATAdInfo adInfo) {
        //在此回调中获取广告加载前设置的激励相关参数
        getUserCustomDataOnLoaded(adInfo);
    }
    ...
});

mRewardVideoAd.load();

private void getUserCustomDataOnLoaded(ATAdInfo adInfo) {
    if (adInfo != null) {
        Map localExtraMap = adInfo.getLocalExtra();
        if (localExtraMap != null) {
            //通过key（和广告加载前设置的key一致）获取自定义的参数
            Object userCustomData = localExtraMap.get(ATAdConst.KEY.USER_CUSTOM_DATA);
            //利用自定义参数userCustomData处理您的逻辑
            //...
        }
    }
}
```

> **⚠️Tips**
>
> 传入的自定义参数可在 `onRewardedVideoAdLoaded()` 回调中通过 `TUAdInfo#getLocalExtra()` 获取到，注意保持 **KEY** 一致

java
复制代码

```
TURewardVideoAd mRewardVideoAd = new TURewardVideoAd(this, "your placement id");
String userdata = "test_userdata_001";
Map<String, Object> localMap = new HashMap<>();
localMap.put(TUAdConst.KEY.USER_CUSTOM_DATA, userdata);
//在广告加载前设置激励相关参数
mRewardVideoAd.setLocalExtra(localExtraMap);
mRewardVideoAd.setAdListener(new TURewardVideoListener() {
    ...
    @Override
    public void onRewardedVideoAdPlayStart(TUAdInfo adInfo) {
        //在此回调中获取广告加载前设置的激励相关参数
        getUserCustomDataOnLoaded(adInfo);
    }
    ...
});

mRewardVideoAd.load();

private void getUserCustomDataOnLoaded(TUAdInfo adInfo) {
    if (adInfo != null) {
        Map localExtraMap = adInfo.getLocalExtra();
        if (localExtraMap != null) {
            //通过key（和广告加载前设置的key一致）获取自定义的参数
            Object userCustomData = localExtraMap.get(TUAdConst.KEY.USER_CUSTOM_DATA);
            //利用自定义参数userCustomData处理您的逻辑
            //...
        }
    }
}
```

### 5.2 展示广告时传入自定义参数

> **⚠️Tips**
>
> 传入的自定义参数可在 `onRewardedVideoAdPlayStart()` 回调中通过 `ATAdInfo#getShowCustomExt()` 获取到

java
复制代码

```
ATRewardVideoAd mRewardVideoAd = new ATRewardVideoAd(this, "your placement id");
mRewardVideoAd.setAdListener(new ATRewardVideoListener() {
    ...
    @Override
    public void onRewardedVideoAdLoaded() {
        ATShowConfig showConfig = new ATShowConfig.Builder()
                .showCustomExt("custom_show_data")
                .build();
        mRewardVideoAd.show(activity, showConfig);
    }

    @Override
    public void onRewardedVideoAdPlayStart(ATAdInfo adInfo) {
        if (adInfo != null) {
            String showCustomExt = adInfo.getShowCustomExt();
            //showCustomExt就是上面的custom_show_data
        }
    }
    ...
});
mRewardVideoAd.load();
```

> **⚠️Tips**
>
> 传入的自定义参数可在 `onRewardedVideoAdPlayStart()` 回调中通过 `TUAdInfo#getShowCustomExt()` 获取到

java
复制代码

```
TURewardVideoAd mRewardVideoAd = new TURewardVideoAd(this, "your placement id");
mRewardVideoAd.setAdListener(new TURewardVideoListener() {
    ...
    @Override
    public void onRewardedVideoAdLoaded() {
        TUShowConfig showConfig = new TUShowConfig.Builder()
                .showCustomExt("custom_show_data")
                .build();
        mRewardVideoAd.show(activity,showConfig);
    }

    @Override
    public void onRewardedVideoAdPlayStart(TUAdInfo adInfo) {
        if (adInfo != null) {
            String showCustomExt = adInfo.getShowCustomExt();
            //showCustomExt就是上面的custom_show_data
        }
    }
    ...
});
mRewardVideoAd.load();
```

---

## 6. API说明

● ATRewardVideoAd

> 激励视频广告的操作类，负责广告加载、监听、显示等。

| **方法** | **说明** |
| --- | --- |
| ATRewardVideoAd(Context context, String placementID) | RewardedVideo广告的初始化方法; **context**：如果有集成以下平台：Ironsource、Kidoz、Maio、Tapjoy，context必须是Activity; **placementID**：激励视频样式的广告位，通过TopOn后台创建 **激励视频广告位** 获取的 |
| void setLocalExtra(Map map) | 加载广告前或者在展示时设置自定义信息 |
| void setAdListener([ATRewardVideoListener](https://help.toponad.net/cn/docs/ji-li-shi-pin#%E2%97%8F_ATRewardVideoListener) listener) | 设置 **广告位层级** 的广告监听回调 listener：广告位事件回调的接口类 |
| void load() | 发起广告加载 |
| void load(Context context) | 发起广告加载，开发者可通过调用此方法使用指定的Context进行广告的加载 |
| boolean isAdReady() | 判断当前广告位是否存在可展示的广告 返回值：true=存在可展示的广告false=不存在可展示的广告 |
| show(Activity activity) | 展示广告 |
| void show(Activity activity, ATShowConfig showConfig) | 展示广告，传入展示广告时的自定义参数和 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) showConfig：展示广告配置，包括自定义参数和广告场景 |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) **placementId**: 广告位ID; **scenarioId**: 广告场景ID （非必传，传null会统计到默认场景） |
| void entryAdScenario(String scenarioId) | （6.5.80及以上）进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) **placementId**: 广告位ID; **scenarioId**: 广告场景ID （非必传，传null会统计到默认场景） |

● ATRewardVideoListener

> **广告位层级** 的广告事件回调

| **方法** | **说明** |
| --- | --- |
| void onRewardedVideoAdLoaded() | 广告加载成功回调 |
| void onRewardedVideoAdFailed(AdError error) | 广告加载失败回调，可通过AdError.getFullErrorInfo()获取全部错误信息 error：错误信息 **注意 ：** 禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿 |
| void onRewardedVideoAdPlayStart([ATAdInfo](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming#1._ATAdInfo) adInfo) | 广告开始播放回调(即激励视频展示回调) adInfo：广告信息对象 |
| void onRewardedVideoAdPlayEnd(ATAdInfo adInfo) | 广告播放结束回调 adInfo：广告信息对象 |
| void onRewardedVideoAdPlayFailed(AdError errorCode, ATAdInfo adInfo) | 广告播放失败回调 errorCode：错误信息 adInfo：广告信息对象 |
| void onReward(ATAdInfo adInfo) | 下发激励的时候会触发此回调， 建议您在此回调中下发奖励，一般在onRewardedVideoAdClosed之前回调 adInfo：广告信息对象 |
| void onRewardedVideoAdClosed(ATAdInfo adInfo) | 广告关闭回调， 建议在此回调中调用load进行广告的加载，方便下一次广告的展示 adInfo：广告信息对象 |
| void onRewardedVideoAdPlayClicked(ATAdInfo adInfo) | 广告点击回调 atAdInfo：广告信息对象 |

● TURewardVideoAd

> 激励视频广告的操作类，负责广告加载、监听、显示等。

| **方法** | **说明** |
| --- | --- |
| TURewardVideoAd(Context context, String placementID) | RewardedVideo广告的初始化方法 **context**：如果有集成以下平台：Ironsource、Kidoz、Maio、Tapjoy，context必须是Activity， **placementID**：激励视频样式的广告位，通过TopOn后台创建 **激励视频广告位** 获取的 |
| void setLocalExtra(Map map) | 加载广告前或者在展示时设置自定义信息 |
| void setAdListener([TURewardVideoListener](https://help.toponad.net/cn/docs/ji-li-shi-pin#%E2%97%8F_TURewardVideoListener) listener) | 设置 **广告位层级** 的广告监听回调 listener：广告位事件回调的接口类 |
| void load() | 发起广告加载 |
| void load(Context context) | 发起广告加载，开发者可通过调用此方法使用指定的Context进行广告的加载 |
| boolean isAdReady() | 判断当前广告位是否存在可展示的广告 返回值：true=存在可展示的广告false=不存在可展示的广告 |
| show(Activity activity) | 展示广告 |
| void show(Activity activity, TUShowConfig showConfig) | 展示广告，传入展示广告时的自定义参数和 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) showConfig：展示广告配置，包括自定义参数和广告场景 |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) placementId: 广告位ID scenarioId: 广告场景ID （非必传，传null会统计到默认场景） |

● TURewardVideoListener

> **广告位层级** 的广告事件回调

| **方法** | **说明** |
| --- | --- |
| void onRewardedVideoAdLoaded() | 广告加载成功回调 |
| void onRewardedVideoAdFailed(AdError error) | 广告加载失败回调，可通过AdError.getFullErrorInfo()获取全部错误信息 error：错误信息 **注意 ：** 禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿 |
| void onRewardedVideoAdPlayStart([TUAdInfo](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming#1._TUAdInfo) adInfo) | 广告开始播放回调(即激励视频展示回调) adInfo：广告信息对象 |
| void onRewardedVideoAdPlayEnd(TUAdInfo adInfo) | 广告播放结束回调 adInfo：广告信息对象 |
| void onRewardedVideoAdPlayFailed(AdError errorCode, TUAdInfo adInfo) | 广告播放失败回调 errorCode：错误信息 adInfo：广告信息对象 |
| void onReward(TUAdInfo adInfo) | 下发激励的时候会触发此回调， 建议您在此回调中下发奖励，一般在onRewardedVideoAdClosed之前回调 adInfo：广告信息对象 |
| void onRewardedVideoAdClosed(TUAdInfo adInfo) | 广告关闭回调， 建议在此回调中调用load进行广告的加载，方便下一次广告的展示 adInfo：广告信息对象 |
| void onRewardedVideoAdPlayClicked(TUAdInfo adInfo) | 广告点击回调 adInfo：广告信息对象 |

---

## 7. 高级设置

[全自动加载](https://help.toponad.net/cn/docs/quan-zi-dong-jia-zai#%E6%BF%80%E5%8A%B1%E8%A7%86%E9%A2%91%E5%B9%BF%E5%91%8A) ：TopOn推出的一站式请求维护方案，能够根据用户的使用状态和广告消耗进度，多节点智能判断下一条广告的预加载和缓存时机

[预置策略](https://help.toponad.net/cn/docs/wERYJv) ：可通过配置预置策略， 提高首次冷启动的广告加载效果

---

## 8. 接入参考

代码示例： [Demo](https://github.com/toponteam/TPN-Android-Demo) 中的RewardVideoAdActivity.java
