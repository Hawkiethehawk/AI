---
title: "开屏广告"
source: "https://help.toponad.net/cn/docs/kai-ping-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-03-20"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "广告样式", "开屏广告"]
content_sha256: "9883f24aa9202ed33459131752a2d3e553c2ff6754daad3f03681edb24a18775"
knowledge_role: "reference_only"
has_article_body: true
---

# 开屏广告

## 1. 集成建议

> - 为了提高开屏广告的加载效率可以参考 [冷启动策略](https://help.toponad.net/cn/docs/XRu5iv) 和 [SDK预置策略](https://help.toponad.net/cn/docs/wERYJv) ，详情请参考 [开屏广告接入最佳实践](https://help.toponad.net/cn/docs/kai-ping-guang-gao-jie-ru-zui-jia-shi-jian-8Ivz)
> - 您可根据实际业务需要传入期望的 **开屏广告加载超时时间，** 建议传入 6000ms - 10000ms
>
> **⚠️注意**
>
> - 广告加载超时时间，即可以等待开屏广告加载的最长时间（仅为等待广告加载的超时，不包括广告展示的时间）
> - 传入的超时时间太短或没有根据传入的超时时间去作为开屏等待加载广告的时间，可能会影响开屏广告的效果

---

## 2. 加载广告

建议您能提前调用该步骤，这样能减少用户因加载广告耗时造成的等待。

java
复制代码

```
ATSplashAd splashAd = new ATSplashAd(context, "your placement id", new ATSplashAdEZListener() {

    @Override
    public void onAdLoaded() {
        //当前Activity处于前台时进行广告展示
        if (inForeBackground) {
            //container大小至少占屏幕75%
            splashAd.show(activity, container);
        }
    }

    @Override
    public void onNoAdError(AdError adError) {
        //加载失败直接进入主界面
        ...
    }

    @Override
    public void onAdShow(ATAdInfo adInfo) { }

    @Override
    public void onAdClick(ATAdInfo adInfo) { }

    @Override
    public void onAdDismiss(ATAdInfo adInfo, ATSplashAdExtraInfo splashAdExtraInfo) {
        if (container != null) {
          container.removeAllViews();
        }
        // 热启开屏推荐进行pre-load
        // splashAd.loadAd();
        //开屏广告展示关闭后进入主界面
        ...
    }
}, xxxx); // 注：xxx需要替换为您的开屏广告超时时间，单位：毫秒
splashAd.loadAd();
```

java
复制代码

```
TUSplashAd splashAd = new TUSplashAd(context, "your placement id", new TUSplashAdEZListener() {

    @Override
    public void onAdLoaded() {
        //当前Activity处于前台时进行广告展示
        if (inForeBackground) {
            //container大小至少占屏幕75%
            splashAd.show(activity, container);
        }
    }

    @Override
    public void onNoAdError(AdError adError) {
        //加载失败直接进入主界面
        ...
    }

    @Override
    public void onAdShow(TUAdInfo adInfo) { }

    @Override
    public void onAdClick(TUAdInfo adInfo) { }

    @Override
    public void onAdDismiss(TUAdInfo adInfo, TUSplashAdExtraInfo splashAdExtraInfo) {
        if (container != null) {
          container.removeAllViews();
        }
        // 热启开屏推荐进行pre-load
        // splashAd.loadAd();
        //开屏广告展示关闭后进入主界面
        ...
    }
}， xxxx); // 注：xxx需要替换为您的开屏广告超时时间，单位：毫秒
splashAd.loadAd();
```

---

## 3. 展示广告

> **💡Tips:**
>
> - 在展示广告之前，建议先调用 `splashAd#isAdReady()` ，值为 **true** 再展示广告，值为 **false** 则实时加载等待加载成功后再展示广告
> - 开屏广告展示前需要判断当前Activity是否处于前台
> - 开屏广告展示的容器大小至少占屏幕75%

java
复制代码

```
if(splashAd.isAdReady()){
    ATShowConfig showConfig = new ATShowConfig.Builder().scenarioId("your scenario id").build();
    //container大小至少占屏幕75%
    splashAd.show(activity, container, null, showConfig);
}else{
    //重新加载
    splashAd.load();
}
```

java
复制代码

```
if(splashAd.isAdReady()){
    TUShowConfig showConfig = new TUShowConfig.Builder().scenarioId("your scenario id").build();
    //container大小至少占屏幕75%
    splashAd.show(activity, container, null, showConfig);
}else{
    //重新加载
    splashAd.load();
}
```

---

## 4. 广告场景统计

> [**统计场景到达率**](https://help.toponad.com/cn/docs/1RWLAv) ， 呈现在后台的数据 数据报表 -> 漏斗分析报表 -> 到达广告场景 ，建议您在正确的地方进行调用
>
> 1. 先调用 `entryAdScenario()`
> 2. 再调用 `isAdReady()`
> 3. 最后调用 `show()` 展示

| 方法 | 说明 |
| --- | --- |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.com/cn/docs/1RWLAv) **placementId**: 广告位ID **scenarioId**: 广告场景ID（非必传，传null会统计到默认场景） |
| void entryAdScenario(String scenarioId) | (v6.5.80及以上) 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.com/cn/docs/1RWLAv) **placementId**: 广告位ID **scenarioId**: 广告场景ID（非必传，传null会统计到默认场景） |

java
复制代码

```
ATSplashAd.entryAdScenario("your placement id", "your scenario id");
//6.5.80及以上
splashAd.entryAdScenario("your scenario id");
if (splashAd.isAdReady()) {
   ATShowConfig showConfig = new ATShowConfig.Builder()
                .scenarioId("your scenario id")
                .build();
    splashAd.show(activity，showConfig);
} else {
   splashAd.load();
}
```

java
复制代码

```
TUSplashAd.entryAdScenario("your placement id", "your scenario id");
//6.5.80及以上
splashAd.entryAdScenario("your scenario id");
if (splashAd.isAdReady()) {
   TUShowConfig showConfig = new TUShowConfig.Builder()
                .scenarioId("your scenario id")
                .build();
    splashAd.show(activity，showConfig);
} else {
   splashAd.load();
}
```

---

## 5. API说明

● ATSplashAd

> 开屏广告的操作类，负责广告加载、监听、显示等。

| **方法** | **说明** |
| --- | --- |
| ATSplash(Context context, String placmentId, [ATSplashAdEZListener](https://help.toponad.net/cn/docs/kai-ping-guang-gao#%E2%97%8F_ATSplashAdEZListener) listener, int fetchAdTimeout) | 开屏广告的初始化方法 **context**：Context上下文，建议传入ActivityplacmentId：开屏样式的广告位，通过TopOn后台创建开屏 **广告位** 获取的 **listener**：广告位纬度的广告事件监听回调 fetchAdTimeout：广告加载超时时间，单位毫秒 **注意：广告加载超时时间默认为10000ms** |
| ATSplash(Context context, String placmentId, ATSplashAdEZListener listener) | 开屏广告的初始化方法 **context**：Context上下文，建议传入Activity**placmentId**：开屏样式的广告位，通过TopOn后台创建开屏 **广告位** 获取的 **listener**：广告位纬度的广告事件监听回调 |
| void setLocalExtra(Map map) | 加载广告前或者在展示时设置自定义信息 |
| void setAdListener(ATSplashAdEZListener listener) | 设置 **广告位层级** 的广告监听回调，会覆盖ATSplash构造函数的监听 **listener**：广告位事件回调的接口类 |
| void load() | 发起广告加载 |
| boolean isAdReady() | 判断当前广告位是否存在可展示的广告 返回值：true=存在可展示的广告false=不存在可展示的广告 |
| void show(Activity activity, ViewGroup container) | 展示广告 activity：展示广告的activity container：展示广告的容器 |
| void show(Activity activity, ViewGroup container, ATSplashSkipInfo atSplashSkipInfo, ATShowConfig showConfig) | 展示广告，传入展示广告时的自定义参数和 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) **activity**：展示广告的activity container:展示广告的容器 **atSplashSkipInfo**：自定义SkipView功能类，仅对Adx有效，用法请参考Demo showConfig：展示广告配置，包括自定义参数和广告场景 |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法请查看广告场景 placementId：开屏样式的广告位，通过TopOn后台创建开屏 **广告位** 获取 scenarioId：广告场景（非必传，可以直接传null），可从后台创建场景参数 |
| void entryAdScenario(String scenarioId) | (v6.5.80及以上)进入业务场景当前广告位缓存状态统计，具体用法请查看广告场景 placementId：开屏样式的广告位，通过TopOn后台创建开屏 **广告位** 获取 scenarioId：广告场景（非必传，可以直接传null），可从后台创建场景参数 |

● ATSplashAdEZListener

> **广告位层级** 的广告事件回调

| **方法** | **说明** |
| --- | --- |
| void onAdLoaded() | 广告加载成功回调 |
| void onNoAdError(AdError error) | 广告加载失败回调，可通过AdError.getFullErrorInfo()获取全部错误信息 error：错误信息 **注意 ：** 禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿 |
| void onAdShow([ATAdInfo](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming#1._ATAdInfo) adInfo) | 广告展示回调 adInfo：广告信息对象 |
| void onAdClick(ATAdInfo adInfo) | 广告点击回调 adInfo：广告信息对象 |
| void onAdDismiss(ATAdInfo adInfo, ATSplashAdExtraInfo splashAdExtraInfo) | 广告关闭回调 adInfo：广告信息对象 splashAdExtraInfo：开屏广告关闭额外信息 |

● TUSplashAd

> 开屏广告的操作类，负责广告加载、监听、显示等。

| **方法** | **说明** |
| --- | --- |
| TUSplash(Context context, String placmentId, [TUSplashAdEZListener](https://help.toponad.net/cn/docs/kai-ping-guang-gao#%E2%97%8F_TUSplashAdEZListener) listener, int fetchAdTimeout) | 开屏广告的初始化方法 context：Context上下文，建议传入ActivityplacmentId：开屏样式的广告位，通过TopOn后台创建开屏 **广告位** 获取的 listener：广告位纬度的广告事件监听回调 fetchAdTimeout：广告加载超时时间，单位毫秒 **注意：广告加载超时时间默认为10000ms** |
| TUSplash(Context context, String placmentId, TUSplashAdEZListener listener) | 开屏广告的初始化方法 context：Context上下文，建议传入ActivityplacmentId：开屏样式的广告位，通过TopOn后台创建开屏 **广告位** 获取的 listener：广告位纬度的广告事件监听回调 |
| void setLocalExtra(Map map) | 加载广告前或者在展示时设置自定义信息 |
| void setAdListener(TUSplashAdEZListener listener) | 设置 **广告位层级** 的广告监听回调，会覆盖TUSplash构造函数的监听 listener：广告位事件回调的接口类 |
| void load() | 发起广告加载 |
| boolean isAdReady() | 判断当前广告位是否存在可展示的广告 返回值：true=存在可展示的广告false=不存在可展示的广告 |
| void show(Activity activity, ViewGroup container) | 展示广告 activity：展示广告的activity container：展示广告的容器 |
| void show(Activity activity, ViewGroup container, TUSplashSkipInfo atSplashSkipInfo, TUShowConfig showConfig) | 展示广告，传入展示广告时的自定义参数和 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) activity：展示广告的activity container:展示广告的容器 atSplashSkipInfo：自定义SkipView功能类，仅对Adx有效，用法请参考Demo showConfig：展示广告配置，包括自定义参数和广告场景 |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法请查看广告场景 placementId：开屏样式的广告位，通过TopOn后台创建开屏 **广告位** 获取 scenarioId：广告场景（非必传，可以直接传null），可从后台创建场景参数 |
| void entryAdScenario(String scenarioId) | (v6.5.80及以上) 进入业务场景当前广告位缓存状态统计，具体用法请查看广告场景 placementId：开屏样式的广告位，通过TopOn后台创建开屏 **广告位** 获取 scenarioId：广告场景（非必传，可以直接传null），可从后台创建场景参数 |

● TUSplashAdEZListener

> **广告位层级** 的广告事件回调

| **方法** | **说明** |
| --- | --- |
| void onAdLoaded() | 广告加载成功回调 |
| void onNoAdError(AdError error) | 广告加载失败回调，可通过AdError.getFullErrorInfo()获取全部错误信息 error：错误信息 **注意 ：** 禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿 |
| void onAdShow([TUAdInfo](https://help.toponad.net/cn/docs/hui-diao-xin-xi-shuo-ming#1._TUAdInfo) adInfo) | 广告展示回调 adInfo：广告信息对象 |
| void onAdClick(TUAdInfo adInfo) | 广告点击回调 adInfo：广告信息对象 |
| void onAdDismiss(TUAdInfo adInfo, TUSplashAdExtraInfo splashAdExtraInfo) | 广告关闭回调 adInfo：广告信息对象 splashAdExtraInfo：开屏广告关闭额外信息 |

## 6. 高级设置

[自定义开屏广告](https://help.toponad.net/cn/docs/kai-ping-hun-yong-yuan-sheng-guang-gao) ：使用开屏广告位配置原生广告。

[预置策略](https://help.toponad.net/cn/docs/wERYJv) ：可通过配置预置策略， 提高首次冷启动的广告加载效果。

---

## 7. 接入参考

示例代码： [Demo](https://github.com/toponteam/TPN-Android-Demo) 的SplashAdActivity.java

---

## 8. 广告平台特殊配置说明

### ● Admob

> Admob的开屏广告不需要依赖container进行展示，只能全屏进行展示，广告展示后不会进行倒计时且不会自动跳过
