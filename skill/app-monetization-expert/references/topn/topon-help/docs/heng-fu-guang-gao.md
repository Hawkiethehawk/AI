---
title: "横幅广告"
source: "https://help.toponad.net/cn/docs/heng-fu-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-03-20"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "广告样式", "横幅广告"]
content_sha256: "3d8d8ed6df1208c57e1435c8d37c474b2cc8825c88d273b9bb517764dd1a5a84"
knowledge_role: "reference_only"
has_article_body: true
---

# 横幅广告

## 1. 集成建议

**1.1 宽高设置**

- 可以自定义宽高，但需要与在TopOn后台配置的宽高比一致，并根据实际效果进行调整，具体实现请参考 [Demo](https://github.com/toponteam/TPN-Android-Demo) 。

**1.2 自动刷新**

- 默认情况下不开启，可以在TopOn后台的广告位高级设置中配置刷新时间开启或者禁止刷新。
- 横幅广告的View必须添加到窗口并可见，才会触发自动刷新。
- 如果广告平台有提供自动刷新功能，则建议关闭广告平台的自动刷新，只需要用TopOn提供的自动刷新就行，避免冲突导致一些不可预知的问题。
- 开启自动刷新功能后，将`ATBannerView`添加到布局中，并保证其处于可见状态后调用一次`load()`方法，之后的展示和刷新都会由SDK自动执行。

- 默认情况下不开启，可以在TopOn后台的广告位高级设置中配置刷新时间开启或者禁止刷新。
- 横幅广告的View必须添加到窗口并可见，才会触发自动刷新。
- 如果广告平台有提供自动刷新功能，则建议关闭广告平台的自动刷新，只需要用TopOn提供的自动刷新就行，避免冲突导致一些不可预知的问题。
- 开启自动刷新功能后，将`TUBannerView`添加到布局中，并保证其处于可见状态后调用一次`load()`方法，之后的展示和刷新都会由SDK自动执行。

**1.3 销毁资源**

- 当不再需要展示横幅广告时，从布局中移除ATBannerView，并调用`ATBannerView#destroy()`方法销毁当前的广告资源。

- 当不再需要展示横幅广告时，从布局中移除TUBannerView，并调用`TUBannerView#destroy()`方法销毁当前的广告资源。

---

## 2. 加载展示广告

java
复制代码

```
ATBannerView mBannerView = new ATBannerView(activity);
mBannerView.setPlacementId("your placment id");

//设置广告视图mBannerView的布局参数
//设定一个宽度值，比如屏幕宽度
int width = getResources().getDisplayMetrics().widthPixels;
int height = ViewGroup.LayoutParams.WRAP_CONTENT;
mBannerView.setLayoutParams(new FrameLayout.LayoutParams(width, height));

//把ATBannerView添加到广告容器中
//如需手动控制广告的展示时机，可以根据自己的业务逻辑选择合适的时机调用此方法
frameLayout.addView(mBannerView);

mBannerView.setBannerAdListener(new ATBannerListener() {
    @Override
    public void onBannerLoaded() {}

    @Override
    public void onBannerFailed(AdError adError) {
        //注意：禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿
    }

    @Override
    public void onBannerClicked(ATAdInfo adInfo) {}

    @Override
    public void onBannerShow(ATAdInfo adInfo) {}

    @Override
    public void onBannerClose(ATAdInfo adInfo) {
        if (mBannerView != null && mBannerView.getParent() != null) {
            ((ViewGroup) mBannerView.getParent()).removeView(mBannerView);
        }
    }

    @Override
    public void onBannerAutoRefreshed(ATAdInfo adInfo) {}

    @Override
    public void onBannerAutoRefreshFail(AdError adError) {}
});
//可以通过ATAdConst.KEY.AD_WIDTH和ATAdConst.KEY.AD_HEIGHT去设置广告平台返回的横幅广告的宽高
//目前支持设置宽高的广告平台有：AdColony、Mintegral、Pangle、UnityAds、Yandex、Admob
//假设横幅广告的宽高为320x50
Map localMap = new HashMap<>();
localMap.put(ATAdConst.KEY.AD_WIDTH, dip2px(320));
localMap.put(ATAdConst.KEY.AD_HEIGHT, dip2px(50));
mBannerView.setLocalExtra(localMap);

mBannerView.loadAd();

public int dip2px(int dipValue) {
    float scale = getResources().getDisplayMetrics().density;
    return (int) (dipValue * scale + 0.5f);
}
```

java
复制代码

```
TUBannerView mBannerView = new TUBannerView(activity);
mBannerView.setPlacementId("your placment id");

//设置广告视图mBannerView的布局参数
//设定一个宽度值，比如屏幕宽度
int width = getResources().getDisplayMetrics().widthPixels;
int height = ViewGroup.LayoutParams.WRAP_CONTENT;
mBannerView.setLayoutParams(new FrameLayout.LayoutParams(width, height));

//把TUBannerView添加到广告容器中
//如需手动控制广告的展示时机，可以根据自己的业务逻辑选择合适的时机调用此方法
frameLayout.addView(mBannerView);

mBannerView.setBannerAdListener(new TUBannerListener() {
    @Override
    public void onBannerLoaded() {}

    @Override
    public void onBannerFailed(AdError adError) {
        //注意：禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿
    }

    @Override
    public void onBannerClicked(TUAdInfo adInfo) {}

    @Override
    public void onBannerShow(TUAdInfo adInfo) {}

    @Override
    public void onBannerClose(TUAdInfo adInfo) {
        if (mBannerView != null && mBannerView.getParent() != null) {
            ((ViewGroup) mBannerView.getParent()).removeView(mBannerView);
        }
    }

    @Override
    public void onBannerAutoRefreshed(TUAdInfo adInfo) {}

    @Override
    public void onBannerAutoRefreshFail(AdError adError) {}
});
//可以通过TUAdConst.KEY.AD_WIDTH和TUAdConst.KEY.AD_HEIGHT去设置广告平台返回的横幅广告的宽高
//目前支持设置宽高的广告平台有：AdColony、Mintegral、Pangle、UnityAds、Yandex、Admob
//假设横幅广告的宽高为320x50
Map localMap = new HashMap<>();
localMap.put(TUAdConst.KEY.AD_WIDTH, dip2px(320));
localMap.put(TUAdConst.KEY.AD_HEIGHT, dip2px(50));
mBannerView.setLocalExtra(localMap);

mBannerView.loadAd();

public int dip2px(int dipValue) {
    float scale = getResources().getDisplayMetrics().density;
    return (int) (dipValue * scale + 0.5f);
}
```

---

## 3. 广告场景统计

> [**统计场景到达率**](https://help.toponad.com/cn/docs/1RWLAv) ， 呈现在后台的数据 数据报表 -> 漏斗分析报表 -> 到达广告场景 ，建议您在正确的地方进行调用
>
> 1. 先调用 `entryAdScenario()`
> 2. 再调用 `setShowConfig()`
> 3. 最后展示广告

| 方法 | 说明 |
| --- | --- |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.com/cn/docs/1RWLAv) placementId: 广告位ID scenarioId: 广告场景ID（非必传，传null会统计到默认场景） |
| void entryAdScenario(String scenarioId) | (v6.5.80及以上) 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.com/cn/docs/1RWLAv) placementId: 广告位ID scenarioId: 广告场景ID（非必传，传null会统计到默认场景） |
| void setShowConfig(ATShowConfig showConfig) | 设置广告场景（针对后续展示的广告） showConfig：可传入展示时的额外参数，如下 1.`ATShowConfig#showCustomExt(String showCustomExt)` ：可传入展示时自定义参数，传入的该参数将通过 `ATAdInfo#getShowCustomExt()` 返回 2.`ATShowConfig#scenarioId(String scenarioId)` ：可传入广告场景ID |

| 方法 | 说明 |
| --- | --- |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.com/cn/docs/1RWLAv) placementId: 广告位ID scenarioId: 广告场景ID（非必传，传null会统计到默认场景） |
| void setShowConfig(TUShowConfig showConfig) | 设置广告场景（针对后续展示的广告） showConfig：可传入展示时的额外参数，如下 1.`TUShowConfig#showCustomExt(String showCustomExt)` ：可传入展示时自定义参数，传入的该参数将通过 `TUAdInfo#getShowCustomExt()` 返回 2.`TUShowConfig#scenarioId(String scenarioId)` ：可传入广告场景ID |

---

## 4. API说明

● ATBannerView

> 横幅广告的操作类，负责广告加载、监听、显示等。

| **方法** | **说明** |
| --- | --- |
| ATBannerView(Context context) | 横幅广告的初始化方法 context：Context上下文，建议传入Activity。 **注意** ：如果有集成Mintegral、UnityAds、AdColony、Applovin、Chartboost、Kidoz、Pangle、StartApp则参数1必须是Activity |
| void setLocalExtra(Map map) | 加载广告前或者在展示时设置自定义信息 |
| void setBannerAdListener([ATBannerListener](https://help.toponad.net/cn/docs/heng-fu-guang-gao#%E2%97%8F_ATBannerListener) listener) | 设置**广告位层级**的广告监听回调 listener：广告位事件回调的接口类 |
| void load() | 发起广告加载 |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法请查看广告场景 placementId：横幅样式的广告位，通过TopOn后台创建横幅**广告位**获取 scenarioId：广告场景（非必传，可以直接传null），可从后台创建场景参数 |
| void entryAdScenario(String scenarioId) | (v6.5.80及以上) 进入业务场景当前广告位缓存状态统计，具体用法请查看广告场景 placementId：横幅样式的广告位，通过TopOn后台创建横幅**广告位**获取 scenarioId：广告场景（非必传，可以直接传null），可从后台创建场景参数 |

● ATBannerListener

> **广告位层级**的广告事件回调

| **方法** | **说明** |
| --- | --- |
| void onBannerLoaded() | 广告加载成功回调 |
| void onBannerFailed(AdError error) | 广告加载失败回调，可通过AdError.getFullErrorInfo()获取全部错误信息 error：错误信息 **注意** ：禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿 |
| void onBannerShow([ATAdInfo](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming#1._ATAdInfo) adInfo) | 广告展示回调 adInfo：广告信息对象 |
| void onBannerClicked(ATAdInfo adInfo) | 广告点击回调 adInfo：广告信息对象 |
| void onBannerClose(ATAdInfo adInfo) | 广告关闭回调 adInfo：广告信息对象 |
| void onBannerAutoRefreshed(ATAdInfo adInfo) | 广告自动刷新回调 adInfo：广告信息对象 |
| void onBannerAutoRefreshFail(ATAdInfo adInfo) | 广告自动刷新失败回调 adInfo：广告信息对象 |

● TUBannerView

> 横幅广告的操作类，负责广告加载、监听、显示等。

| **方法** | **说明** |
| --- | --- |
| TUBannerView(Context context) | 横幅广告的初始化方法 context：Context上下文，建议传入Activity。 **注意** ：如果有集成Mintegral、UnityAds、AdColony、Applovin、Chartboost、Kidoz、Pangle、StartApp则参数1必须是Activity |
| void setLocalExtra(Map map) | 加载广告前或者在展示时设置自定义信息 |
| void setBannerAdListener([TUBannerListener](https://help.toponad.net/cn/docs/heng-fu-guang-gao#%E2%97%8F_TUBannerListener) listener) | 设置**广告位层级**的广告监听回调 listener：广告位事件回调的接口类 |
| void load() | 发起广告加载 |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法请查看广告场景 placementId：横幅样式的广告位，通过TopOn后台创建横幅**广告位**获取 scenarioId：广告场景（非必传，可以直接传null），可从后台创建场景参数 |
| void entryAdScenario(String scenarioId) | (6.5.80及以上) 进入业务场景当前广告位缓存状态统计，具体用法请查看广告场景 placementId：横幅样式的广告位，通过TopOn后台创建横幅**广告位**获取 scenarioId：广告场景（非必传，可以直接传null），可从后台创建场景参数 |

● TUBannerListener

> **广告位层级**的广告事件回调

| **方法** | **说明** |
| --- | --- |
| void onBannerLoaded() | 广告加载成功回调 |
| void onBannerFailed(AdError error) | 广告加载失败回调，可通过AdError.getFullErrorInfo()获取全部错误信息 error：错误信息 **注意** ：禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿 |
| void onBannerShow([TUBannerAdInfo](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming#1._TUBannerAdInfo) adInfo) | 广告展示回调 adInfo：广告信息对象 |
| void onBannerClicked(TUBannerAdInfo adInfo) | 广告点击回调 adInfo：广告信息对象 |
| void onBannerClose(TUBannerAdInfo adInfo) | 广告关闭回调 adInfo：广告信息对象 |
| void onBannerAutoRefreshed(TUBannerAdInfo adInfo) | 广告自动刷新回调 adInfo：广告信息对象 |
| void onBannerAutoRefreshFail(TUBannerAdInfo adInfo) | 广告自动刷新失败回调 adInfo：广告信息对象 |

---

## 5. 高级设置

[自定义横幅广告](https://help.toponad.net/cn/docs/heng-fu-hun-yong-yuan-sheng-guang-gao)：使用横幅广告位配置原生广告。

[预置策略](https://help.toponad.net/cn/docs/wERYJv)：可通过配置预置策略，提高首次冷启动的广告加载效果。

---

## 6. 接入参考

示例代码：[Demo](https://github.com/toponteam/TPN-Android-Demo)的BannerAdActivity.java

---

## 7. 广告平台特殊配置说明

### ●  AdMob自适应横幅

TopOn SDK支持AdMob的自适应横幅，包括锚定自适应横幅、内嵌自适应横幅，推荐使用锚定自适应横幅。您需用以下代码设置自适应横幅的类型、根据哪种屏幕方向自适应以及横幅的宽度（单位：px），代码示例如下：

java
复制代码

```
ATBannerView mBannerView = new ATBannerView(activity);
mBannerView.setPlacementId("your placement id");
Map localExtra = new HashMap<>();

//since v5.7.0, Admob Adaptive banner（自适应锚定横幅、自适应大尺寸横幅）
localExtra.put(AdmobATConst.ADAPTIVE_TYPE, AdmobATConst.ADAPTIVE_ANCHORED);//自适应锚定横幅
//localExtra.put(AdmobATConst.ADAPTIVE_TYPE, AdmobATConst.ADAPTIVE_INLINE);//自适应大尺寸横幅

localExtra.put(AdmobATConst.ADAPTIVE_ORIENTATION, AdmobATConst.ORIENTATION_CURRENT);
//localExtra.put(AdmobATConst.ADAPTIVE_ORIENTATION, AdmobATConst.ORIENTATION_PORTRAIT);
//localExtra.put(AdmobATConst.ADAPTIVE_ORIENTATION, AdmobATConst.ORIENTATION_LANDSCAPE);

localExtra.put(AdmobATConst.ADAPTIVE_WIDTH, width);

mBannerView.setLocalExtra(localExtra);

mBannerView.loadAd();
```

java
复制代码

```
TUBannerView mBannerView = new TUBannerView(activity);
mBannerView.setPlacementId("your placement id");
Map localExtra = new HashMap<>();

//since v5.7.0, Admob Adaptive banner（自适应锚定横幅、自适应大尺寸横幅）
localExtra.put(AdmobTUConst.ADAPTIVE_TYPE, AdmobTUConst.ADAPTIVE_ANCHORED);//自适应锚定横幅
//localExtra.put(AdmobTUConst.ADAPTIVE_TYPE, AdmobTUConst.ADAPTIVE_INLINE);//自适应大尺寸横幅

localExtra.put(AdmobTUConst.ADAPTIVE_ORIENTATION, AdmobTUConst.ORIENTATION_CURRENT);
//localExtra.put(AdmobTUConst.ADAPTIVE_ORIENTATION, AdmobTUConst.ORIENTATION_PORTRAIT);
//localExtra.put(AdmobTUConst.ADAPTIVE_ORIENTATION, AdmobTUConst.ORIENTATION_LANDSCAPE);

localExtra.put(AdmobTUConst.ADAPTIVE_WIDTH, width);

mBannerView.setLocalExtra(localExtra);

mBannerView.loadAd();
```

> **注意** 当使用AdMob的自适应横幅时，不能限制Banner父容器的高度，示例如下：
>
> java
> 复制代码
>
> ```
> mBannerView.setLayoutParams(new FrameLayout.LayoutParams(width, ViewGroup.LayoutParams.WRAP_CONTENT));
> mBannerView.loadAd();
> ```
