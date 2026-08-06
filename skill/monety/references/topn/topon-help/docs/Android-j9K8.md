---
title: "Android"
source: "https://help.toponad.net/cn/docs/Android-j9K8"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "常见问题", "Android"]
content_sha256: "95c57b8a206775fb49718810875837c06f37c4160aecd7ea40bbd61f4bd41054"
knowledge_role: "reference_only"
has_article_body: true
---

# Android

## ● 激励视频广告

#### ● 广告展示了但无展示成功回调

1. 检查布局是否有遮挡重叠的情况
2. 检查是否全自动模式和手动模式方法弄混

#### ● 激励视频关闭按钮无反应

1. 检查布局是否有遮挡重叠的情况
2. 是否倒计时结束才可以点击关闭，这个属于正常情况（由广告平台控制的）

#### ● 使用服务器激励服务器没有收到回调

检查url格式是否正常（参考[服务端激励文档](/cn/docs/msbnkj)），是否刚刚在TopOn后台配置（需要五分钟才生效），通过网页请求自己先验证下服务端回调url是否正常，有没有过滤校验的逻辑

#### ● 激励服务端回调自定义参数对不上

SDK缓存机制会存在一次广告加载请求缓存多个广告的情况，加载前本地传参`setLocalExtra(localMap)`是和当时加载请求时那次填充的广告绑定的，所以会出现服务器激励回调接收到的自定义参数不一致的情况，可以结合回调信息**ATAdInfo**中的**showid**和服务器回调返回的**transid**对比是否一致，加上回调信息里面的**自定义参数**和服务器回调**user\_custom\_data**做校验就能确保是有效广告了，另外如果是在topon后台配置服务端激励可以使用`show(Activity activity, ATShowConfig showConfig)`这个方法来传参实时获取参数

#### ● 发现部分服务端激励回调中user\_id字段返回是空

检查下`setLocalExtra`方法`user_id`有没有传值，服务端收到后才会透传的

## ● 插屏广告

#### ● 广告展示了但无展示成功回调

是否被遮挡重叠的情况，其次是否全自动模式和手动模式方法弄混

###

#### ● 插屏广告展示不全

移除项目内引入AutoSize，AutoLayout框架

#### ● 更改插屏广告展示方向

1. 部分平台可以通过TopOn后台-聚合管理页面更改广告源的配置
2. 找到广告平台的广告Activity的Manifest配置，根据需求重写`screenOrientation`

#### ● 视频黑屏或者显示透明

在AndroidManifest.xml中开启硬件加速

复制代码

```
<application
    ...
    android:hardwareaccelerated="true">
    ...
</application>
```

#### ● 插屏广告支持主动关闭吗？

没有主动关闭方法，需要手动点击关闭

## ● 开屏广告

#### ● 广告展示了但无展示成功回调

1. 检查屏幕显示区域是否太小或者被遮挡重叠的情况
2. 是否存在自己外部倒计时移除广告视图逻辑

#### ● 开屏广告点击跳过按钮无反应

检查布局是否有遮挡

#### ● 开屏广告无填充

**● 广告源的AppID、PlacementID不匹配**

1. 检查TopOn后台该广告源的配置跟广告平台后台的配置信息是否一致
2. 检查代码中是否有单独初始化广告平台SDK的逻辑（项目中同时初始化两个不同的AppID就会出现问题，保证初始化同一个AppID即可）
3. 检查是否开启了后台广告位的测试模式（由于测试模式的appId跟开发者广告源的appId不同，项目中同时初始化两个不同的appId就会出现问题，关闭TopOn后台的测试模式后重试）
4. 检查开屏广告是否有使用传入`ATMediationRequestInfo`实例且传入了错误的应用以及广告位参数（传入错误时会导致使用错误的ID初始化广告平台的SDK）

#### ● 开屏广告经常超时

请参考[SDK预制策略](/cn/docs/wERYJv)进行配置

1. 将其他广告形式的预加载逻辑以及其他消耗网络资源的请求放到开屏广告展示之后，以减少开屏加载超时的情况
2. 后台配置兜底开屏广告源减少加载超时情况（兜底广告会在广告加载发起1秒后发起广告加载，当到达timeout时如果兜底广告已经加载成功了，就会触发onAdLoaded。建议配置一个高填充的广告源作为兜底广告）
3. 若需在热启动时展示开屏广告，建议在应用退到后台时，调用`ATSplashAd.isAdReady()`判断有无开屏广告缓存，若无则发起`load`进行预加载，或者在`onAdDismiss`时调用`load`进行预加载

## ● 横幅广告

#### ● 广告展示了但无展示成功回调

检查布局是否有遮挡

#### ● Banner广告点击没有回调

检查是否有东西挡住了Banner的View

#### ● Banner展示大小问题

Banner广告展示内容太大或太小、广告内容被截掉了一部分等，这些一般是代码中的宽高设置有问题导致的

1. 请参考示例code检查加载广告前是否有正确传递宽高，宽高要大于0，以及加载前与展示时传入的宽高是否一致

复制代码

```
    //设置广告视图mBannerView的布局参数
    //设定一个宽度值，比如屏幕宽度
    int width = getResources().getDisplayMetrics().widthPixels;
    int height = ViewGroup.LayoutParams.WRAP_CONTENT;
    mBannerView.setLayoutParams(new FrameLayout.LayoutParams(width, height));

    //----------------------- 注  意 ---------------------------------------
    //如果出现Banner有时高、有时低的情况，请使用如下代码
    //float ratio = 320/50f; //必须跟TopOn后台配置的Banner广告源宽高比例一致，假设尺寸为320x50
    //int width = getResources().getDisplayMetrics().widthPixels; //定一个宽度值，比如屏幕宽度
    //int height = (int) (width / ratio);
    //mBannerView.setLayoutParams(new FrameLayout.LayoutParams(width, height));
    //----------------------- 注  意 ---------------------------------------
```

2. 使用Android Studio的Layout Inspector（Tools -> Layout Inspector）检查当前布局，检查广告View以及父View的宽高大小

#### ● 自定义实现banner广告，已经调用了自定义回调的`onBannerAdShow`，但还是收不到`onBannerShow`或`onBannerAutoRefreshed`

删掉`mLoadListener.onAdCacheLoaded()`；重写下这个方法

复制代码

```
@Override
public boolean supportImpressionCallback() {
    return false;
}
```

#### ● Banner广告的自动刷新只能在后台设置吗？代码里面能控制吗？

是的 ，只能统一在后台控制

## ● 原生广告

#### ● 广告展示了但无展示成功回调

检查布局是否有遮挡

#### ● 自渲染信息流广告标识是否可以去掉

在调用`prepare`前，`ATNativePrepareInfo#setChoiceViewLayoutParams`传入一个`FrameLayout.LayoutParams`, 可以传入一个**负**值的marginLeft，让这个choiceicon移除可视区域外

###

#### ● Native广告点击没有回调

1. 检查是否有东西挡住了Native的View
2. 检查是否调用了prepare()方法；
3. 需使用同一个NativeAd对象调用`setNativeEventListener()`、`renderAdView()`和`prepare()`方法，每调用一次`getNativeAd()`方法，会返回不同的NativeAd对象

#### ● Native广告展示大小有问题

Native广告展示内容太大或太小、广告内容被截掉了一部分等，这些一般是代码中的宽高设置有问题导致的

1. 请参考示例code检查加载广告前是否有正确传递宽高，宽高要大于0，以及加载前与展示时传入的宽高是否一致

复制代码

```
    int adViewWidth = mATNativeView.getWidth() != 0 ? mATNativeView.getWidth() : getResources().getDisplayMetrics().widthPixels;
    int adViewHeight = adViewWidth * 3 / 4;
    Map<string object> localExtra = new HashMap();
    localExtra.put(ATAdConst.KEY.AD_WIDTH, adViewWidth);
    localExtra.put(ATAdConst.KEY.AD_HEIGHT, adViewHeight);
    mATNative.setLocalExtra(localExtra);
    mATNative.makeAdRequest();
```

2. 使用Android Studio的Layout Inspector（Tools -> Layout Inspector）检查当前布局，检查广告View以及父View的宽高大小

#### ● 视频黑屏或者显示透明

在AndroidManifest.xml中开启硬件加速

复制代码

```
<application
    ...
    android:hardwareaccelerated="true">
    ...
</application>
```

#### ● 华为8.0设备上原生广告无法展示

华为8.0系统会对带有”AdView“ View自动设置为GONE，导致TopOn的ATNativeAdView无法正常展示，可以通过自定义View继承ATNativeAdView方式处理。

## ● 其他

#### ● 视频素材下载错误、广告中的图片显示不出来、视频资源缓存失败等

1. 检查下网络是否有切换到高填充率的国家/地区测试
2. 检查AndroidManifest.xml文件中添加如下配置

复制代码

```
    <application
        ...
        android:hardwareaccelerated="true">

        <!-- Android 9以上适配 -->
        <uses-library android:name="org.apache.http.legacy" android:required="false"></uses-library>
        ...
    </application>
```

#### ● 应用平台提示webview访问文件风险问题

TopOn SDK内部会用到webview去访问文件，`setAllowFileAccessFromFileURLs`、`setAllowUniversalAccessFromFileURLs`设置了为true, 已通过以下方法限制文件访问范围来防护：

1. 固定不变的 HTML 文件可以放在assets或res目录下 **file:///android asset和file:///android\_res** 在不开启API的情况下也可以访问；
2. 可能会更新的HTML文件放在 **/data/data/(app)** 目录下，避免被第三方替换或修改；
3. 对file域请求做白名单限制时，需要对“ **../../** ”特殊情况进行处

#### ● 自定义广告平台接口接入的日志报错This network don't support head bidding in current TopOn's version

确认下自定义Adapter时有无重写这个方法startBiddingRequest，并且return true

#### ● 有广告展示，场景ID的统计都统计到默认那里了，没有统计到具体的场景ID下面

广告场景展示统计需要在`show`方法中传入场景id，`entryAdScenario`表示进入场景统计

#### ● 引入Yandex的SDK后，application的onCreate会走多次，是不同的process id，这是什么情况？

Yandex中有一个provider使用process=":Metrica"。如果为了避免Application#onCreate 方法中的逻辑调用两次，可以在`Application#onCreate`中先判断是否是主进程再执行自己的逻辑，具体判断是否是主进程判断实例代码：

复制代码

```
public boolean isMainProcess(Context context) {
	try {
		if (null != context) {
			return context.getPackageName().equals(getProcessName(context));
		}
	} catch (Exception e) {
		return false;
	}
	return true;
}

public String getProcessName(Context cxt) {
	int pid = android.os.Process.myPid();
	ActivityManager am = (ActivityManager) cxt.getSystemService(Context.ACTIVITY_SERVICE);
	List runningApps = am.getRunningAppProcesses();
	if (runningApps == null) {
		return null;
	}
	for (ActivityManager.RunningAppProcessInfo procInfo : runningApps) {
		if (procInfo.pid == pid) {
			return procInfo.processName;
		}
	}
	return null;
}
```

#### ● 当前在某个自定义规则下的流量分组下，怎么切回没有自定义规则的默认分组下

参考示例code，可以传空Map进行切换

复制代码

```
Map<string string> customMap = new HashMap();
ATSDK.initCustomMap(customMap);
ATSDK.initPlacementCustomMap(placementId, customMap); </string>
```

#### ● AdMob写进app的那个AppID，可以做到动态下发调整吗？

AdMob的AppID是不支持通过API去动态配置的，只能在AndroidManifest.xml里面声明
