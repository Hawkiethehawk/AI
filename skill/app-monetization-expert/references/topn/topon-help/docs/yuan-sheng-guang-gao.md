---
title: "原生广告"
source: "https://help.toponad.net/cn/docs/yuan-sheng-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-03-20"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "广告样式", "原生广告"]
content_sha256: "7e46e24eea56a4683248b4a69271d0a5f6a3248174942c890466a8ba791ca8e7"
knowledge_role: "reference_only"
has_article_body: true
---

# 原生广告

## 1. 集成建议

| **类型** | **说明** | **注意事项** |
| --- | --- | --- |
| 自渲染 | 三方广告平台返回广告素材由开发者来拼接成的类型。三方后台的类型选择需要和TopOn后台一致，否则会请求失败。 | [自渲染原生广告注意事项](https://help.toponad.net/cn/docs/native_ad_platform_notice) |
| 模板渲染 | 三方广告平台返回渲染好的view，开发者直接添加到一个容器就可以展示出来。 | - 模板广告有自己的宽高比例，可在广告平台后台进行查看。 **尽量在广告平台后台选择宽高比例一样或者接近的模板** ，在代码中以那个宽高比例传入宽高来加载、展示广告，以获得最佳展示效果。 - ATNativeAdView的宽高必须与 ATAdConst.KEY.AD\_WIDTH 和 ATAdConst.KEY.AD\_HEIGHT 所对应的宽高一致，否则可能出现展示不全或者展示过小的问题。 |

| **类型** | **说明** | **注意事项** |
| --- | --- | --- |
| 自渲染 | 三方广告平台返回广告素材由开发者来拼接成的类型。三方后台的类型选择需要和TopOn后台一致，否则会请求失败。 | [自渲染原生广告注意事项](https://help.toponad.net/cn/docs/native_ad_platform_notice) |
| 模板渲染 | 三方广告平台返回渲染好的view，开发者直接添加到一个容器就可以展示出来。 | - 模板广告有自己的宽高比例，可在广告平台后台进行查看。 **尽量在广告平台后台选择宽高比例一样或者接近的模板** ，在代码中以那个宽高比例传入宽高来加载、展示广告，以获得最佳展示效果。 - TUNativeAdView的宽高必须与TUAdConst.KEY.AD\_WIDTH和TUAdConst.KEY.AD\_HEIGHT所对应的宽高一致，否则可能出现展示不全或者展示过小的问题。 |

---

## 2. 加载广告

建议您能提前调用该步骤，这样能减少用户因加载广告耗时造成的等待。

java
复制代码

```
//初始化广告加载对象
ATNative atNative = new ATNative(context, "your placement id", new ATNativeNetworkListener() {
    @Override
    public void onNativeAdLoaded() {
        // 重置重试加载次数
        retryAttempt = 0;
    }

    @Override
    public void onNativeAdLoadFail(AdError adError) {
        // 加载失败回调
        // 我们建议您按照指数递增的方式延长重试间隔，直到达到最大延迟时间（本例为 8 秒）或最大重试次数（本例为 3 次）
        if (retryAttempt >= 3) return;
        retryAttempt++;
        long delayMillis = TimeUnit.SECONDS.toMillis((long) Math.pow(2, Math.min(3, retryAttempt)));
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                mNativeAdLoader.loadAd();
            }
        }, delayMillis);
    }
});
//发起广告请求
atNative.makeAdRequest();
```

java
复制代码

```
//初始化广告加载对象
TUNative tuNative = new TUNative(context, "your placement id", new TUNativeNetworkListener() {
    @Override
    public void onNativeAdLoaded() {
        // 重置重试加载次数
        retryAttempt = 0；
    }

    @Override
    public void onNativeAdLoadFail(AdError adError) {
        // 加载失败回调
        // 我们建议您按照指数递增的方式延长重试间隔，直到达到最大延迟时间（本例为 8 秒）或最大重试次数（本例为 3 次）
        if (retryAttempt >= 3) return;
        retryAttempt++;
        long delayMillis = TimeUnit.SECONDS.toMillis((long) Math.pow(2, Math.min(3, retryAttempt)));
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                mNativeAdLoader.loadAd();
            }
        }, delayMillis);
    }
});
//发起广告请求
tuNative.makeAdRequest();
```

---

## 3. 展示广告

> 注：展示广告前建议先了解 [自渲染原生广告注意事项](https://help.toponad.net/cn/docs/native_ad_platform_notice) ，避免出现展示、点击异常。

通过 `ATNative#getNativeAd()` 获取广告对象 `NativeAd` ，步骤如下：

(1) 通过 `NativeAd` 的 `isNativeExpress` 方法判断是自渲染还是模板渲染

| **渲染方式** | **实现步骤** |
| --- | --- |
| 自渲染 | ① 通过 **ATNativePrepareInfo** 对象绑定素材View。 ② 调用 `NativeAd#getAdMaterial()` 获取广告素材对象 [ATNativeMaterial](https://help.toponad.net/cn/docs/yuan-sheng-guang-gao#%E2%97%8F_ATNativeMaterial) ③ 调用 `NativeAd#renderAdContainer(ATNativeAdView, View)` 进行渲染，ATNativeAdView参数可以直接创建也可以在布局中定义，View参数是自定义布局。 ④ 调用 `NativeAd#prepare(ATNativeAdView, ATNativePrepareInfo)` ，ATNativePrepareInfo参数为第一步的 **ATNativePrepareInfo** 对象。 |
| 模板渲染 | ① 调用NativeAd的 `renderAdContainer(ATNativeAdView, View)` 方法进行渲染，ATNativeAdView参数可以直接创建也可以在布局中定义，View参数传null。 ② 调用NativeAd的 `prepare(ATNativeAdView, ATNativePrepareInfo)` 方法，ATNativePrepareInfo参数传null。 |

(2) 示例代码如下：

java
复制代码

```
//渲染广告必须创建的容器,可在xml布局定义（可参考Demo https://github.com/toponteam/TPN-Android-Demo）
ATNativeAdView mATNativeAdView = findViewById(R.id.native_ad_view);
//自定义布局的容器,可在xml布局定义
View mSelfRenderView = mATNativeAdView.findViewById(R.id.native_selfrender_view);
NativeAd mNativeAd= atNative.getNativeAd();
//您可以在调用getNativeAd后直接使用 ATNative#makeAdRequest 发起预加载下一次的广告
if (mNativeAd != null) {
    mNativeAd.setNativeEventListener(new ATNativeEventListener() {
        @Override
        public void onAdImpressed(ATNativeAdView view, ATAdInfo adInfo) {}

        @Override
        public void onAdClicked(ATNativeAdView view, ATAdInfo adInfo) {}

        @Override
        public void onAdVideoStart(ATNativeAdView view) {}

        @Override
        public void onAdVideoEnd(ATNativeAdView view) {}

        @Override
        public void onAdVideoProgress(ATNativeAdView view, int progress) {}
    });
    if (mNativeAd.isNativeExpress()) {
        //模板渲染
        mNativeAd.renderAdContainer(mATNativeAdView, null);
        mNativeAd.prepare(mATNativeAdView, null);
    } else {
        //自渲染
        ATNativePrepareInfo nativePrepareInfo = new ATNativePrepareInfo();
        //自渲染方式绑定素材方法bindSelfRenderView()
        //方法详情请参考 https://github.com/toponteam/TPN-Android-Demo/blob/main/NonChina_Jcenter/demo/app/src/main/java/com/test/ad/demo/SelfRenderViewUtil.java
        bindSelfRenderView(activity, mNativeAd.getAdMaterial(), mSelfRenderView, nativePrepareInfo);
        mNativeAd.renderAdContainer(mATNativeAdView, mSelfRenderView);
        mNativeAd.prepare(mATNativeAdView, nativePrepareInfo);
    }
}
```

> 注：展示广告前建议先了解 [自渲染原生广告注意事项](https://help.toponad.net/cn/docs/native_ad_platform_notice) ，避免出现展示、点击异常。

通过 `TUNative#getNativeAd()` 获取广告对象 `NativeAd` ，步骤如下：

(1) 通过 `NativeAd` 的 `isNativeExpress` 方法判断是自渲染还是模板渲染

| **渲染方式** | **实现步骤** |
| --- | --- |
| 自渲染 | ① 通过 **ATNativePrepareInfo** 对象绑定素材View。 ② 调用 `NativeAd#getAdMaterial()` 获取广告素材对象 [TUNativeMaterial](https://help.toponad.net/cn/docs/yuan-sheng-guang-gao#%E2%97%8F_ATNativeMaterial) ③ 调用 `NativeAd#renderAdContainer(TUNativeAdView, View)` 进行渲染，ATNativeAdView参数可以直接创建也可以在布局中定义，View参数是自定义布局。 ④ 调用 `NativeAd#prepare(TUNativeAdView, TUNativePrepareInfo)` ，TUNativePrepareInfo参数为第一步的 **ATNativePrepareInfo** 对象。 |
| 模板渲染 | ① 调用NativeAd的 `renderAdContainer(TUNativeAdView, View)` 方法进行渲染，TUNativeAdView参数可以直接创建也可以在布局中定义，View参数传null。 ② 调用NativeAd的 `prepare(TUNativeAdView, TUNativePrepareInfo)` 方法，TUNativePrepareInfo参数传null。 |

(2) 示例代码如下：

java
复制代码

```
//渲染广告必须创建的容器,可在xml布局定义（可参考Demo https://github.com/toponteam/TPN-Android-Demo）
TUNativeAdView mTUNativeAdView = findViewById(R.id.native_ad_view);
//自定义布局的容器,可在xml布局定义
View mSelfRenderView = mTUNativeAdView.findViewById(R.id.native_selfrender_view);
NativeAd mNativeAd= atNative.getNativeAd();
//您可以在调用getNativeAd后直接使用 TUNative#makeAdRequest 发起预加载下一次的广告
if (mNativeAd != null) {
    mNativeAd.setNativeEventListener(new TUNativeEventListener() {
        @Override
        public void onAdImpressed(TUNativeAdView view, TUNativeAdInfo adInfo) {}

        @Override
        public void onAdClicked(TUNativeAdView view, TUNativeAdInfo adInfo) {}

        @Override
        public void onAdVideoStart(TUNativeAdView view) {}

        @Override
        public void onAdVideoEnd(TUNativeAdView view) {}

        @Override
        public void onAdVideoProgress(TUNativeAdView view, int progress) {}
    });
    if (mNativeAd.isNativeExpress()) {
        //模板渲染
        mNativeAd.renderAdContainer(mTUNativeAdView, null);
        mNativeAd.prepare(mTUNativeAdView, null);
    } else {
        //自渲染
        ATNativePrepareInfo nativePrepareInfo = new ATNativePrepareInfo();
        //自渲染方式绑定素材方法bindSelfRenderView()
        //方法详情请参考 https://github.com/toponteam/TPN-Android-Demo/blob/main/NonChina_Jcenter/demo/app/src/main/java/com/test/ad/demo/SelfRenderViewUtil.java
        bindSelfRenderView(activity, mNativeAd.getAdMaterial(), mSelfRenderView, nativePrepareInfo);
        mNativeAd.renderAdContainer(mTUNativeAdView, mSelfRenderView);
        mNativeAd.prepare(mTUNativeAdView, nativePrepareInfo);
    }
}
```

---

## 4. 广告场景统计

> [**统计场景到达率**](https://help.toponad.com/cn/docs/1RWLAv) ， 呈现在后台的数据 数据报表 -> 漏斗分析报表 -> 到达广告场景 ，建议您在正确的地方进行调用
>
> 1. 先调用 `entryAdScenario()`
> 2. 再调用 `getNativeAd(ATShowConfig showConfig)`
> 3. 最后展示广告

| 方法 | 说明 |
| --- | --- |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.com/cn/docs/1RWLAv) placementId: 广告位ID scenarioId: 广告场景ID（非必传，传null会统计到默认场景） |
| void entryAdScenario(String scenarioId) | (v6.5.80及以上) 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.com/cn/docs/1RWLAv) placementId: 广告位ID scenarioId: 广告场景ID（非必传，传null会统计到默认场景） |
| NativeAd getNativeAd(ATShowConfig showConfig) | （v6.3.10新增）获取已经加载完成的广告（建议获取之后都要进行非null判断），并为之后展示的广告设置广告场景 showConfig：可传入展示时的额外参数，如下1.`ATShowConfig#showCustomExt(String showCustomExt)` ：可传入展示时自定义参数，传入的该参数将通过ATAdInfo#getShowCustomExt()返回 2.`ATShowConfig#scenarioId(String scenarioId)` ：可传入广告场景ID |

java
复制代码

```
ATNative.entryAdScenario("your placement id", "your scenario id");
//6.5.80及以上
mATNative.entryAdScenario("your scenario id");
......
ATShowConfig.Builder builder = new ATShowConfig.Builder();
builder.scenarioId("your scenario id");
builder.showCustomExt("your custom data");
// 注意：需要在展示广告前调用此方法
mATNative.getNativeAd(builder.build());
```

> [**统计场景到达率**](https://help.toponad.com/cn/docs/1RWLAv) ， 呈现在后台的数据 数据报表 -> 漏斗分析报表 -> 到达广告场景 ，建议您在正确的地方进行调用
>
> 1. 先调用 `entryAdScenario()`
> 2. 再调用 `getNativeAd(TUShowConfig showConfig)`
> 3. 最后展示广告

| 方法 | 说明 |
| --- | --- |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.com/cn/docs/1RWLAv) placementId: 广告位ID scenarioId: 广告场景ID（非必传，传null会统计到默认场景） |
| void entryAdScenario(String scenarioId) | (v6.5.80及以上) 进入业务场景当前广告位缓存状态统计，具体用法查看 [广告场景](https://help.toponad.com/cn/docs/1RWLAv) placementId: 广告位ID scenarioId: 广告场景ID（非必传，传null会统计到默认场景） |
| NativeAd getNativeAd(ATShowConfig showConfig) | （v6.3.10新增）获取已经加载完成的广告（建议获取之后都要进行非null判断），并为之后展示的广告设置广告场景 showConfig：可传入展示时的额外参数，如下1.`TUShowConfig#showCustomExt(String showCustomExt)` ：可传入展示时自定义参数，传入的该参数将通过ATAdInfo#getShowCustomExt()返回 2.`TUShowConfig#scenarioId(String scenarioId)` ：可传入广告场景ID |

java
复制代码

```
TUNative.entryAdScenario("your placement id", "your scenario id");
//6.5.80及以上
mTUNative.entryAdScenario("your scenario id");
......
TUShowConfig.Builder builder = new TUShowConfig.Builder();
builder.scenarioId("your scenario id");
builder.showCustomExt("your custom data");
// 注意：需要在展示广告前调用此方法
mTUNative.getNativeAd(builder.build());
```

---

## 5. 销毁资源

> **💡Tips:** 当不再需要展示原生广告时，从布局中移除原生广告相关View，并调用NativeAd的destory方法销毁当前的广告资源。
>
> java
> 复制代码
>
> ```
> @Override
> protected void onDestroy() {
>     super.onDestroy();
>     if (mNativeAd != null) {
>         mNativeAd.destory();
>     }
>     if (mATNative != null) {
>         mATNative.setAdListener(null);
>         mATNative.setAdSourceStatusListener(null);
>         mATNative.setAdMultipleLoadedListener(null);
>     }
> }
> ```

> **💡Tips:** 当不再需要展示原生广告时，从布局中移除原生广告相关View，并调用NativeAd的destory方法销毁当前的广告资源。
>
> java
> 复制代码
>
> ```
> @Override
> protected void onDestroy() {
>     super.onDestroy();
>     if (mNativeAd != null) {
>         mNativeAd.destory();
>     }
>     if (mTUNative != null) {
>         mTUNative.setAdListener(null);
>         mTUNative.setAdSourceStatusListener(null);
>         mTUNative.setAdMultipleLoadedListener(null);
>     }
> }
> ```

---

## 6. 关闭按钮（可选）

(1) 您可通过调用 `ATNativePrepareInfo#setCloseView()` 方法，将关闭按钮设置到ATNativePrepareInfo中，进行关闭按钮的绑定。

> **注：** 必须在调用prepare方法之前调用

java
复制代码

```
ATNativePrepareInfo nativePrepareInfo = new ATNativePrepareInfo();
View selfRenderView = LayoutInflater.from(activity).inflate(R.layout.native_selfrender_view, null);
bindSelfRenderView(activity, mNativeAd.getAdMaterial(), selfRenderView, nativePrepareInfo);
//渲染广告
mNativeAd.renderAdContainer(mATNativeAdView, selfRenderView);
mNativeAd.prepare(mATNativeAdView, nativePrepareInfo);

//自渲染方式绑定素材方法bindSelfRenderView()
//方法详情请参考 https://github.com/toponteam/TPN-Android-Demo/blob/main/NonChina_Jcenter/demo/app/src/main/java/com/test/ad/demo/SelfRenderViewUtil.java
public void bindSelfRenderView(Context context, ATNativeMaterial adMaterial, View selfRenderView, ATNativePrepareInfo nativePrepareInfo) {
    ...
    //您自己的关闭按钮
    View closeView = selfRenderView.findViewById(R.id.native_ad_close);
    ...
    nativePrepareInfo.setCloseView(closeView);
    ...
}
```

(2) 正确绑定关闭按钮后，设置关闭按钮的监听

java
复制代码

```
mNativeAd.setDislikeCallbackListener(new ATNativeDislikeListener() {
   @Override
   public void onAdCloseButtonClick(ATNativeAdView view, ATAdInfo entity) {
       //在这里您可实现广告View的移除操作
   }
});
```

(1) 您可通过调用 `TUNativePrepareInfo#setCloseView()` 方法，将关闭按钮设置到TUNativePrepareInfo中，进行关闭按钮的绑定。

> **注：** 必须在调用prepare方法之前调用

java
复制代码

```
TUNativePrepareInfo nativePrepareInfo = new TUNativePrepareInfo();
View selfRenderView = LayoutInflater.from(activity).inflate(R.layout.native_selfrender_view, null);
bindSelfRenderView(activity, mNativeAd.getAdMaterial(), selfRenderView, nativePrepareInfo);
//渲染广告
mNativeAd.renderAdContainer(mTUNativeAdView, selfRenderView);
mNativeAd.prepare(mTUNativeAdView, nativePrepareInfo);

//自渲染方式绑定素材方法bindSelfRenderView()
//方法详情请参考 https://github.com/toponteam/TPN-Android-Demo/blob/main/NonChina_Jcenter/demo/app/src/main/java/com/test/ad/demo/SelfRenderViewUtil.java
public void bindSelfRenderView(Context context, TUNativeMaterial adMaterial, View selfRenderView, TUNativePrepareInfo nativePrepareInfo) {
    ...
    //您自己的关闭按钮
    View closeView = selfRenderView.findViewById(R.id.native_ad_close);
    ...
    nativePrepareInfo.setCloseView(closeView);
    ...
}
```

(2) 正确绑定关闭按钮后，设置关闭按钮的监听

java
复制代码

```
mNativeAd.setDislikeCallbackListener(new TUNativeDislikeListener() {
   @Override
   public void onAdCloseButtonClick(TUNativeAdView view, TUNativeAdInfo adInfo) {
       //在这里您可实现广告View的移除操作
   }
});
```

---

## 7. API说明

● ATNative

> 原生广告的操作类，负责广告加载、监听、显示等。

| **方法** | **说明** |
| --- | --- |
| ATNative(Context context, String placementId, ATNativeNetworkListener listener) | 原生广告的初始化方法context：Context上下文，建议传入Activity placementId：广告id，通过TopOn后台创建 **原生广告位** 获取的listener：广告位事件回调监听 |
| void setLocalExtra(Map map) | 加载广告前或者在展示时设置自定义信息 |
| void setAdListener([ATNativeNetworkListener](https://help.toponad.net/cn/docs/yuan-sheng-guang-gao#%E2%97%8F_ATNativeNetworkListener) listener) | 设置 **广告位层级** 的广告监听回调listener：广告位事件回调的接口类 |
| void makeAdRequest() | 发起广告加载 |
| [NativeAd](https://help.toponad.net/cn/docs/yuan-sheng-guang-gao#%E2%97%8F_NativeAd) getNativeAd() | 获取广告对象，用于展示广告返回值：广告对象 |
| NativeAd getNativeAd(ATShowConfig showConfig) | （v6.3.10新增）获取已经加载完成的广告（建议获取之后都要进行非null判断），并为之后展示的广告设置广告场景showConfig：可传入展示时的额外参数，如下： 1.`ATShowConfig#showCustomExt(String showCustomExt)` ：可传入展示时自定义参数，传入的该参数将通过ATAdInfo#getShowCustomExt()返回 2.`ATShowConfig#scenarioId(String scenarioId)` ：可传入广告场景ID |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法可查看 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) placementId：横幅样式的广告位，通过TopOn后台创建横幅 **广告位** 获取scenarioId：广告场景（非必传，可以直接传null），可从后台创建场景参数 |

● ATNativeNetworkListener

> **广告位层级** 的广告事件回调

| **方法** | **说明** |
| --- | --- |
| void onNativeAdLoaded() | 广告加载成功回调 |
| void onNativeAdLoadFail(AdError error) | 广告加载失败回调，可通过AdError.getFullErrorInfo()获取全部错误信息error：错误信息 **注意**： 禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿 |

● NativeAd

> 原生广告对象，用于展示广告

| **方法** | **说明** |
| --- | --- |
| void setNativeEventListener([ATNativeEventListener](https://help.toponad.net/cn/docs/yuan-sheng-guang-gao#%E2%97%8F_ATNativeEventListener) listener) | 设置广告展示相关的事件监听回调 listener：广告展示事件监听 |
| boolean isNativeExpress() | 是否为模板渲染类型的广告 返回值：true=模板广告，false=自渲染广告 |
| [ATNativeMaterial](https://help.toponad.net/cn/docs/yuan-sheng-guang-gao#%E2%97%8F_ATNativeMaterial) getAdMaterial() | 获取广告素材对象，仅自渲染广告支持 返回值：广告素材对象 |
| void renderAdContainer(ATNativeAdView view, View selfRenderView) | 用于广告渲染 view：TopOn提供的广告容器，传空会导致展示失败 selfRenderView：开发者自定义的View，调用isNativeExpress()返回false时，selfRenderView必须传入开发者自定义的View，返回true时可传null |
| void prepare(ATNativeAdView view, [ATNativePrepareInfo](https://help.toponad.net/cn/docs/yuan-sheng-guang-gao#%E2%97%8F_ATNativePrepareInfo) nativePrepareInfo) | 用于配置广告点击事件、绑定自渲染元素等。 view：TopOn提供的广告容器，传空会导致展示失败 nativePrepareInfo：用于 **自渲染广告** 绑定自渲染元素和绑定点击事件等， **模板广告** 可以传空 **注**： prepare方法必须在renderAdContainer方法之后调用，不管是自渲染还是模板渲染 |
| void destory() | 销毁广告，调用后NativeAd对象不能再用于渲染展示广告 |

● ATNativeEventListener

> 广告展示相关的事件监听回调

| **方法** | **说明** |
| --- | --- |
| void onAdImpressed(ATNativeAdView view, ATAdInfo adInfo) | 广告展示成功回调 view：广告容器 |
| void onAdClicked(ATNativeAdView view, ATAdInfo adInfo) | 广告点击回调 view：广告容器 adInfo：广告信息对象 |
| void onAdVideoStart(ATNativeAdView view) | 视频广告开始播放回调 view：广告容器 |
| void onAdVideoProgress(ATNativeAdView view, int progress) | 视频广告播放进度回调 view：广告容器 progress：播放进度 |
| void onAdVideoEnd(ATNativeAdView view) | 视频广告播放结束回调 view：广告容器 |

● ATNativeMaterial

> 自渲染广告返回的广告素材对象（ **以下返回的素材都可能会出现为null的情况，因为部分广告平台不一定存在所有素材信息** ）

| 方法 | 说明 |
| --- | --- |
| String getIconImageUrl() | 获取广告图标的url **getAdIconView** 、 **getIconImageUrl** 同时返回时，优先选择 **getAdIconView** ，只需渲染其中一个 |
| View getAdIconView() | 获取广告IconView **getAdIconView** 、 **getIconImageUrl** 同时返回时，优先选择 **getAdIconView** ，只需渲染其中一个 |
| View getAdMediaView(Object.. object) | 获取广告大图的渲染容器（仅部分广告平台会存在），有可能是静态图和视频 **getAdMediaView** ， **getMainImageUrl** 同时返回时，优先选择 **getAdMediaView** ，只需渲染其中一个 |
| String getMainImageUrl | 获取大图Url **getAdMediaView** ， **getMainImageUrl** 同时返回时，优先选择 **getAdMediaView** ，只需渲染其中一个 |
| String getTitle() | 获取广告标题 **有返回时需要渲染** |
| String getDescriptionText() | 获取广告描述 **有返回时需要渲染** |
| String getCallToActionText() | 获取广告CTA按钮文字 **有返回时需要渲染** |
| String getAdFrom() | 获取广告来源 **Nend** 广告平台必须渲染该信息 |
| String getAdChoiceIconUrl() | 获取广告标识的图标url **getAdLogo、getAdLogoView** 之间选择其中一个渲染即可，不一定会存在 |
| Bitmap getAdLogo() | 获取AdLogo的Bitmap **getAdChoiceIconUrl、getAdLogoView** 之间选择其中一个渲染即可，不一定会存在 |
| View getAdLogoView() | 获取AdLogo的View **getAdChoiceIconUrl、getAdLogo** 之间选择其中一个渲染即可，不一定会存在 |
| List getImageUrlList() | 获取图片的url列表 |
| Double getStarRating() | 获取广告的评分 |
| String getAdType() | 获取广告类型（视频、图片）： CustomNativeAd.NativeAdConst.VIDEO\_TYPE：视频类型 CustomNativeAd.NativeAdConst.IMAGE\_TYPE：图片类型 CustomNativeAd.NativeAdConst.UNKNOWN\_TYPE：未知广告类型（不支持的平台或者获取不到的，均为未知广告类型） |
| int getNativeAdInteractionType() | 获取广告的交互类型 NativeAdInteractionType.APP\_DOWNLOAD\_TYPE:下载类广告； NativeAdInteractionType.H5\_TYPE: 网页类广告 NativeAdInteractionType.DEEPLINK\_TYPE: 应用跳转类广告 NativeAdInteractionType.UNKNOW: 未知广告类型 |
| int getNativeType() | 获取广告类型 CustomNativeAd.NativeType.FEED：信息流广告（原生广告） CustomNativeAd.NativeType.PATCH：贴片广告 |
| double getVideoDuration() | 获取视频总时长（double类型，单位：秒） |
| int getMainImageWidth() | 获取大图的宽度，不支持的平台会返回-1 |
| int getMainImageHeight() | 获取大图的高度，不支持的平台会返回-1 |
| int getVideoWidth() | 获取视频的宽度，不支持的平台会返回-1 |
| int getVideoHeight() | 获取视频的高度，不支持的平台会返回-1 |
| String getAdvertiserName() | 获取广告主名字 |
| String getDomain() | 返回广告商的域名 仅yandex支持 |
| String getWarning() | 返回警告文本 仅yandex支持 |

● ATNativePrepareInfo

> 用于 **自渲染广告** 绑定自渲染元素和绑定点击事件

| 方法 | 说明 |
| --- | --- |
| void setParentView(View parentView) | 绑定 父View |
| void setTitleView(View titleView) | 绑定 标题View **，建议绑定** |
| void setIconView(View iconView) | 绑定 应用图标 View **，建议绑定** |
| void setMainImageView(View mainImageView) | 绑定 大图View **，建议绑定** |
| void setDescView(View descView) | 绑定 描述View **，建议绑定** |
| void setCtaView(View ctaView) | 绑定 CTA按钮View **，建议绑定** |
| void setChoiceViewLayoutParams(FrameLayout.LayoutParams choiceViewLayoutParams) | 设置 广告标识的大小、位置 |
| void setClickViewList(List clickViewList) | 绑定 可触发点击的View集合 |
| void setCloseView(View closeView) | 绑定 关闭按钮 |
| void setAdFromView(View adFromView) | 绑定 广告来源View **，建议绑定（yandex必须绑定）** |
| void setAdLogoView(View adLogoView) | 绑定 AdLogo View |
| void setDomainView(View domainView) | 绑定 domainView **（yandex必须绑定）** |
| void setWarningView(View warningView) | 绑定 warningView **（yandex必须绑定）** |

● ATNativePrepareExInfo

> **继承自ATNativePrepareInfo，方法同ATNativePrepareInfo，额外方法说明如下**

| 方法 | 说明 |
| --- | --- |
| void setCreativeClickViewList(List creativeClickViewList) | 绑定 直接下载广告的点击View集合 |
| void setPermissionClickViewList(List permissionClickViewList) | 绑定 查看权限的点击View集合 |
| void setPrivacyClickViewList(List privacyClickViewList) | 绑定 查看隐私协议的点击View集合 |
| void setAppInfoClickViewList(List appInfoClickViewList) | 绑定 查看产品的点击View集合 |

● TUNative

> 原生广告的操作类，负责广告加载、监听、显示等。

| **方法** | **说明** |
| --- | --- |
| TUNative(Context context, String placementId, TUNativeNetworkListener listener) | 原生广告的初始化方法context：Context上下文，建议传入Activity placementId：广告id，通过TopOn后台创建 **原生广告位** 获取的listener：广告位事件回调监听 |
| void setLocalExtra(Map map) | 加载广告前或者在展示时设置自定义信息 |
| void setAdListener([TUNativeNetworkListener](https://help.toponad.net/cn/docs/yuan-sheng-guang-gao#%E2%97%8F_TUNativeNetworkListener) listener) | 设置 **广告位层级** 的广告监听回调listener：广告位事件回调的接口类 |
| void makeAdRequest() | 发起广告加载 |
| [NativeAd](https://help.toponad.net/cn/docs/yuan-sheng-guang-gao#%E2%97%8F_NativeAd) getNativeAd() | 获取广告对象，用于展示广告返回值：广告对象 |
| NativeAd getNativeAd(TUShowConfig showConfig) | （v6.3.10新增）获取已经加载完成的广告（建议获取之后都要进行非null判断），并为之后展示的广告设置广告场景showConfig：可传入展示时的额外参数，如下： 1.`TUShowConfig#showCustomExt(String showCustomExt)` ：可传入展示时自定义参数，传入的该参数将通过TUAdInfo#getShowCustomExt()返回 2.`TUShowConfig#scenarioId(String scenarioId)` ：可传入广告场景ID |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法可查看 [广告场景](https://help.toponad.net/cn/docs/1RWLAv) placementId：横幅样式的广告位，通过TopOn后台创建横幅 **广告位** 获取scenarioId：广告场景（非必传，可以直接传null），可从后台创建场景参数 |

● TUNativeNetworkListener

> **广告位层级** 的广告事件回调

| **方法** | **说明** |
| --- | --- |
| void onNativeAdLoaded() | 广告加载成功回调 |
| void onNativeAdLoadFail(AdError error) | 广告加载失败回调，可通过AdError.getFullErrorInfo()获取全部错误信息error：错误信息 **注意**： 禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿 |

● NativeAd

> 原生广告对象，用于展示广告

| **方法** | **说明** |
| --- | --- |
| void setNativeEventListener([TUNativeEventListener](https://help.toponad.net/cn/docs/yuan-sheng-guang-gao#%E2%97%8F_TUNativeEventListener) listener) | 设置广告展示相关的事件监听回调 listener：广告展示事件监听 |
| boolean isNativeExpress() | 是否为模板渲染类型的广告 返回值：true=模板广告false=自渲染广告 |
| [TUNativeMaterial](https://help.toponad.net/cn/docs/yuan-sheng-guang-gao#%E2%97%8F_TUNativeMaterial) getAdMaterial() | 获取广告素材对象，仅自渲染广告支持 返回值：广告素材对象 |
| void renderAdContainer(TUNativeAdView view, View selfRenderView) | 用于广告渲染 view：TopOn提供的广告容器，传空会导致展示失败 selfRenderView：开发者自定义的View，调用isNativeExpress()返回false时，selfRenderView必须传入开发者自定义的View，返回true时可传null |
| void prepare(TUNativeAdView view, [TUNativePrepareInfo](https://help.toponad.net/cn/docs/yuan-sheng-guang-gao#%E2%97%8F_TUNativePrepareInfo) nativePrepareInfo) | 用于配置广告点击事件、绑定自渲染元素等。 view：TopOn提供的广告容器，传空会导致展示失败 nativePrepareInfo：用于 **自渲染广告** 绑定自渲染元素和绑定点击事件等， **模板广告** 可以传空 **注**： prepare方法必须在renderAdContainer方法之后调用，不管是自渲染还是模板渲染 |
| void destory() | 销毁广告，调用后NativeAd对象不能再用于渲染展示广告 |

● TUNativeEventListener

> 广告展示相关的事件监听回调

| **方法** | **说明** |
| --- | --- |
| void onAdImpressed(TUNativeAdView view, TUAdInfo adInfo) | 广告展示成功回调 view：广告容器 |
| void onAdClicked(TUNativeAdView view, TUAdInfo adInfo) | 广告点击回调 view：广告容器 adInfo：广告信息对象 |
| void onAdVideoStart(TUNativeAdView view) | 视频广告开始播放回调 view：广告容器 |
| void onAdVideoProgress(TUNativeAdView view, int progress) | 视频广告播放进度回调 view：广告容器 progress：播放进度 |
| void onAdVideoEnd(TUNativeAdView view) | 视频广告播放结束回调 view：广告容器 |

● TUNativeMaterial

> 自渲染广告返回的广告素材对象（ **以下返回的素材都可能会出现为null的情况，因为部分广告平台不一定存在所有素材信息** ）

| 方法 | 说明 |
| --- | --- |
| String getIconImageUrl() | 获取广告图标的url **getAdIconView** 、 **getIconImageUrl** 同时返回时，优先选择 **getAdIconView** ，只需渲染其中一个 |
| View getAdIconView() | 获取广告IconView **getAdIconView** 、 **getIconImageUrl** 同时返回时，优先选择 **getAdIconView** ，只需渲染其中一个 |
| View getAdMediaView(Object.. object) | 获取广告大图的渲染容器（仅部分广告平台会存在），有可能是静态图和视频 **getAdMediaView** ， **getMainImageUrl** 同时返回时，优先选择 **getAdMediaView** ，只需渲染其中一个 |
| String getMainImageUrl | 获取大图Url **getAdMediaView** ， **getMainImageUrl** 同时返回时，优先选择 **getAdMediaView** ，只需渲染其中一个 |
| String getTitle() | 获取广告标题 **有返回时需要渲染** |
| String getDescriptionText() | 获取广告描述 **有返回时需要渲染** |
| String getCallToActionText() | 获取广告CTA按钮文字 **有返回时需要渲染** |
| String getAdFrom() | 获取广告来源 **Nend** 广告平台必须渲染该信息 |
| String getAdChoiceIconUrl() | 获取广告标识的图标url **getAdLogo、getAdLogoView** 之间选择其中一个渲染即可，不一定会存在 |
| Bitmap getAdLogo() | 获取AdLogo的Bitmap **getAdChoiceIconUrl、getAdLogoView** 之间选择其中一个渲染即可，不一定会存在 |
| View getAdLogoView() | 获取AdLogo的View **getAdChoiceIconUrl、getAdLogo** 之间选择其中一个渲染即可，不一定会存在 |
| List getImageUrlList() | 获取图片的url列表 |
| Double getStarRating() | 获取广告的评分 |
| String getAdType() | 获取广告类型（视频、图片）： CustomNativeAd.NativeAdConst.VIDEO\_TYPE：视频类型 CustomNativeAd.NativeAdConst.IMAGE\_TYPE：图片类型 CustomNativeAd.NativeAdConst.UNKNOWN\_TYPE：未知广告类型（不支持的平台或者获取不到的，均为未知广告类型） |
| int getNativeAdInteractionType() | 获取广告的交互类型 NativeAdInteractionType.APP\_DOWNLOAD\_TYPE:下载类广告； NativeAdInteractionType.H5\_TYPE: 网页类广告 NativeAdInteractionType.DEEPLINK\_TYPE: 应用跳转类广告 NativeAdInteractionType.UNKNOW: 未知广告类型 |
| int getNativeType() | 获取广告类型 CustomNativeAd.NativeType.FEED：信息流广告（原生广告） CustomNativeAd.NativeType.PATCH：贴片广告 |
| double getVideoDuration() | 获取视频总时长（double类型，单位：秒） |
| int getMainImageWidth() | 获取大图的宽度，不支持的平台会返回-1 |
| int getMainImageHeight() | 获取大图的高度，不支持的平台会返回-1 |
| int getVideoWidth() | 获取视频的宽度，不支持的平台会返回-1 |
| int getVideoHeight() | 获取视频的高度，不支持的平台会返回-1 |
| String getAdvertiserName() | 获取广告主名字 |
| String getDomain() | 返回广告商的域名 仅yandex支持 |
| String getWarning() | 返回警告文本 仅yandex支持 |

● TUNativePrepareInfo

> 用于 **自渲染广告** 绑定自渲染元素和绑定点击事件

| 方法 | 说明 |
| --- | --- |
| void setParentView(View parentView) | 绑定 父View |
| void setTitleView(View titleView) | 绑定 标题View **，建议绑定** |
| void setIconView(View iconView) | 绑定 应用图标 View **，建议绑定** |
| void setMainImageView(View mainImageView) | 绑定 大图View **，建议绑定** |
| void setDescView(View descView) | 绑定 描述View **，建议绑定** |
| void setCtaView(View ctaView) | 绑定 CTA按钮View **，建议绑定** |
| void setChoiceViewLayoutParams(FrameLayout.LayoutParams choiceViewLayoutParams) | 设置 广告标识的大小、位置 |
| void setClickViewList(List clickViewList) | 绑定 可触发点击的View集合 |
| void setCloseView(View closeView) | 绑定 关闭按钮 |
| void setAdFromView(View adFromView) | 绑定 广告来源View **，建议绑定（yandex必须绑定）** |
| void setAdLogoView(View adLogoView) | 绑定 AdLogo View |
| void setDomainView(View domainView) | 绑定 domainView **（yandex必须绑定）** |
| void setWarningView(View warningView) | 绑定 warningView **（yandex必须绑定）** |

● TUNativePrepareExInfo

> **继承自TUNativePrepareInfo，方法同TUNativePrepareInfo，额外方法说明如下**

| 方法 | 说明 |
| --- | --- |
| void setCreativeClickViewList(List creativeClickViewList) | 绑定 直接下载广告的点击View集合 |
| void setPermissionClickViewList(List permissionClickViewList) | 绑定 查看权限的点击View集合 |
| void setPrivacyClickViewList(List privacyClickViewList) | 绑定 查看隐私协议的点击View集合 |
| void setAppInfoClickViewList(List appInfoClickViewList) | 绑定 查看产品的点击View集合 |

---

## 8. 高级设置

[预置策略](https://help.toponad.net/cn/docs/wERYJv) ：可通过配置预置策略， 提高首次冷启动的广告加载效果。

---

## 9. 接入参考

示例代码： [Demo](https://github.com/toponteam/TPN-Android-Demo) 的NativeAdActivity.java

---

## 10. 广告平台特殊配置说明

### ● Huawei原生广告的关闭按钮和 i 图标

> **注意：** 如果您的应用需要 **上线** **华为应用市场** ，请 **不要** 使用第3个方案

(1) 显示关闭按钮，不显示 **i** 图标（可以指定关闭按钮位置）

java
复制代码

```
Map<String, Object> localExtra = new HashMap<>();
localExtra.put(HuaweiATConst.CUSTOM_DISLIKE, false);
// 设置关闭按钮位置
localExtra.put(ATAdConst.KEY.AD_CHOICES_PLACEMENT, ATAdConst.AD_CHOICES_PLACEMENT_TOP_RIGHT);
mATNative.setLocalExtra(localExtra);

mATNative.makeAdRequest();
```

(2) 显示 **i** 图标，不显示关闭按钮（可以指定 **i** 图标位置）

java
复制代码

```
Map<String, Object> localExtra = new HashMap<>();
localExtra.put(HuaweiATConst.CUSTOM_DISLIKE, true);
// 设置 i 图标的位置
localExtra.put(ATAdConst.KEY.AD_CHOICES_PLACEMENT, ATAdConst.AD_CHOICES_PLACEMENT_BOTTOM_RIGHT);
mATNative.setLocalExtra(localExtra);

mATNative.makeAdRequest();
```

(3) 既不显示 **i** 图标，也不显示关闭按钮

java
复制代码

```
Map<String, Object> localExtra = new HashMap<>();
localExtra.put(HuaweiATConst.CUSTOM_DISLIKE, true);
localExtra.put(ATAdConst.KEY.AD_CHOICES_PLACEMENT, ATAdConst.AD_CHOICES_PLACEMENT_INVISIBLE);
mATNative.setLocalExtra(localExtra);

mATNative.makeAdRequest();
```

java
复制代码

```
Map<String, Object> localExtra = new HashMap<>();
localExtra.put(HuaweiTUConst.CUSTOM_DISLIKE, false);
// 设置关闭按钮位置
localExtra.put(TUAdConst.KEY.AD_CHOICES_PLACEMENT, TUAdConst.AD_CHOICES_PLACEMENT_TOP_RIGHT);
mTUAdNative.setLocalExtra(localExtra);

mTUAdNative.makeAdRequest();
```

(2) 显示 **i** 图标，不显示关闭按钮（可以指定 **i** 图标位置）

java
复制代码

```
Map<String, Object> localExtra = new HashMap<>();
localExtra.put(HuaweiTUConst.CUSTOM_DISLIKE, true);
// 设置 i 图标的位置
localExtra.put(TUAdConst.KEY.AD_CHOICES_PLACEMENT, TUAdConst.AD_CHOICES_PLACEMENT_BOTTOM_RIGHT);
mTUAdNative.setLocalExtra(localExtra);

mTUAdNative.makeAdRequest();
```

(3) 既不显示 **i** 图标，也不显示关闭按钮

java
复制代码

```
Map<String, Object> localExtra = new HashMap<>();
localExtra.put(HuaweiTUConst.CUSTOM_DISLIKE, true);
localExtra.put(TUAdConst.KEY.AD_CHOICES_PLACEMENT, TUAdConst.AD_CHOICES_PLACEMENT_INVISIBLE);
mTUAdNative.setLocalExtra(localExtra);

mTUAdNative.makeAdRequest();
```
