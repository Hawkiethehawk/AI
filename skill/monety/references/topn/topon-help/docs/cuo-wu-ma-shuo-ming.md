---
title: "错误码说明"
source: "https://help.toponad.net/cn/docs/cuo-wu-ma-shuo-ming"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "集成测试", "错误码说明"]
content_sha256: "f77033a5f3321d42bb4c7c674cd260de757da0cb722ff8d84fc38229a571876f"
knowledge_role: "reference_only"
has_article_body: true
---

# 错误码说明

> 温馨提示：
>
> 您可以通过Error的Domain段来判断该错误是TopOn SDK抛出（anythink）还是第三方广告平台抛出。若由三方SDK抛出，请点击下方链接前往对应广告平台文档进行错误排查。

## **1**. TopOn错误码信息说明

> 调试您自身广告位配置时，请您留意：
>
> 1. 应移除TopOn SDK调试模式代码
>
> 2. 应等待修改后台配置生效（5-15分钟），并且本地设备已清除沙盒缓存（可删除重装清除）。

以下是错误码摘要：

| 错误码 | Note |
| --- | --- |
| 2001 | (没有设置GDPR) GDPR consent not set **建议：** 由于处于数据保护区域(欧盟等)，请在初始化前设置数据收集意见，可参考[GDPR](/cn/docs/she-zhi-GDPR)文档 |
| 1001 | （无效策略）Placement strategy invalid \*\*建议：\*\*1.检查广告源是否开启，检查TopOn初始化时传入的appid、appkey和placement id是否匹配 2.检查参数无误后删除重装再尝试获取策略 |
| 1003 | 广告加载失败了，会有两种情况： **建议：** 1、瀑布流广告配置——详情请查看后台日志分析，如果是开发阶段请查看[日志输出](/cn/docs/ru-he-ce-shi-guang-gao-rKsm#2.3.2_%E8%8E%B7%E5%8F%96%E6%97%A5%E5%BF%97%E4%BF%A1%E6%81%AF) 2、error msg 含有 **Bid request have failed** ——竞价失败，详情请实现bidding的代理来查看**didFailBiddingADSourceWithPlacementID** |
| 1005 | (没有广告展示)No ad found when trying to show ad **建议：** 请在调用展示广告之前，先判断该广告位是否已经准备完成，可查看对应广告类型的判断API进行判断 |
| 1006 | (展示过于频繁)Ad show too frequent **建议：** 请稍后再次尝试展示，可以设定一点时间的展示时间间隔来避免该问题，也可以使用TopOn后台的聚合管理来设置展示间隔时间 |
| 1007 | (展示超过小时内最多展示次数)Ad show too many time within the same hour **建议：** 在测试的情况下可以增加每小时的展示次数，如已发布的话，该code算是正常的情况。 |
| 1008 | (展示超过一天内最多展示次数)Ad show too many time within the same day **建议：** 在测试的情况下可以增加每小时的展示次数，如已发布的话，该code算是正常的情况。 |
| 1009 | (没有导入对应的Adapter)The adapter not found **建议：** 请根据日志打印的信息集成对应的广告平台的adapter |
| 10010 | (广告加载超时)Ad loading timeout **建议：** 请更换测试设备的网络再次尝试加载广告 |
| 1013 | (没有导入第三方平台的SDK或导入了错误的版本，AnythinkiOS和子包版本请对应)Third party SDK not imported or wrong version's being used **建议：** 请参考我们后台的下载界面选择相对应的adapter版本进行集成 |
| 1014 | (无效的App ID、App Key 或Placement ID)Invalid parameters encountered(App ID、App Key orPlacement ID being nil) **建议：** 1.请核对是否正确上面信息并准确填入到初始化和广告加载中。2.请核对是否未初始化SDK就发起了广告加载。 |
| 1015 | (广告位没有开启广告投放)Ad delivery not turned on for the placement **建议：** 请在TopOn后台管理系统打开对应的广告位 |
| 1017 | (广告位策略中没有包含任何广告源)The placement strategy does not contain any ad sources, please check the mediation configuration in TopOn. **建议：** 请在对应的广告位中添加所要加载的广告源，在广告平台后台创建好广告，将广告id填入到广告位中 |
| 1018 | (广告源已过滤)Ad sources are filtered, no ad source is currently available \*\*建议：\*\*1. 广告源已经被过滤了，可能是在初始化的时候填入的过滤API中，检查是否有填入。2.后台没开启任何一个广告源。 |
| 1019 | (上一次加载失败时间内，请求过于频繁The placementID load too frequently within the specified times period after the previous load failure **建议：** 请在上一次请求失败后，间隔至少10s以上再发起新的请求 |
| 1020 | (在指定的时间段内，广告位加载次数过多)The placement load too many times within the specified time period **建议：** 请调整一下广告位加载的次数，避免在一段时间内过多的加载 |
| 1029 | (调试模式，广告位策略中没有包含任何广告源，请检查调试模式配置)The placement strategy does not contain any ad sources, please check the debugger configuration in ATAPI setDebuggerConfig **建议：** 可以检查一下传入的ifa是否为该设备的idfa，其次查看使用的调式模式平台是否错误，如果上述没有问题，可以反馈给我们，我们进行排查。 |
| 1030 | （广告源被过滤了，没有填充）Ad source not filled, cause by customize fillter. **建议：** 该广告源广告被自定义过滤器设置为过滤的配置，导致没有加载填充。可以检查初始化的自定义过滤器的设置 |
| 10004 | Server returns invalid response,code:10004,msg:Invalid placement. **建议：** 1.AppID要与PlacementID对应 2. podfile中的SDK要使用SDK下载中心配套生成的 |

## **2**. 第三方广告平台错误码&FAQ（常见问题）

### Facebook

| 常见错误 | 解决方案 |
| --- | --- |
| 1001 - No Fill | 无填充。最常见的原因是，在测试您的移动应用程序时用户未登录Facebook应用程序，或者在测试您的移动网站时用户未登录Facebook移动网站 |
| 1000 - Network Error | 网络问题，检查是否翻墙 |

更多的Facebook的错误信息请查看： [Facebook错误码](https://developers.facebook.com/docs/audience-network/testing/checklist-errors)

### Admob

| 常见错误 | 解决方案 |
| --- | --- |
| 0 | 1、使用TopOn后台广告位，采用**调试模式**来进行测试 2、检查是否翻墙 |
| 1 | 广告请求无效；检查广告源参数配置 |
| 2 | 由于网络连接，广告请求失败。检查是否翻墙 |
| 3 | 广告请求成功，但由于缺少广告资源而没有返回广告。使用TopOn后台广告位，采用**调试模式**来进行测试 |

更多的Admob的错误信息请查看： [Admob错误码](https://support.google.com/admob/thread/3494603?hl=en)

### 穿山甲

| 常见错误 | 解决方案 |
| --- | --- |
| 40029 | 检查穿山甲代码位的渲染类型，TopOn后台穿山甲广告源的配置需与穿山甲后台的配置保持一致 |
| 40025 | 到穿山甲后台下载SDK，替换掉TopOn提供的穿山甲SDK |
| 40019 - 媒体配置adtype和请求不一致 | TopOn后台穿山甲广告源配置问题 |
| 40018 - 媒体包名与录入不一致 | **代码中配置的包名**与穿山甲后台的不一致 |
| 40016 - slot\_id 与 app\_id对应关系不合法 | TopOn后台穿山甲广告源配置问题 |
| 40006 - 广告位ID不合法 | TopOn后台穿山甲广告源配置问题 |
| 102 - 未匹配到主模板：主模板没有下载到本地导致。偶发在首次请求广告时属于正常情况 | 可多请求几次广告进行尝试 |
| 103 - 未匹配到子模板：偶发在接入初期，没有匹配到模板导致。待sdk将模板下载成功后不会出现。 | 可多请求几次广告进行尝试 |
| 107 - 模板渲染超时未回调，可能原因有1. 网络原因或者2. 硬件原因，因此导致渲染失败，可以更换手机或者网络环境测试。 | 可多请求几次广告进行尝试 |

更多的穿山甲的错误信息请查看：（需登录） [穿山甲错误码](https://ad.oceanengine.com/union/media/doc?id=5de4cc6d78c8690012a90aa5)

### Pangle

Pangle的错误信息请查看： [Pangle错误码](https://www.pangleglobal.com/zh/integration/error-code)

### Mintegral

| 错误码 | msg | 描述 | 解决方案 |
| --- | --- | --- | --- |
| -1 | EXCEPTION\_RETURN\_EMPTY | 没有广告填充，可能导致的原因：1.您在测试期间所获取的广告均为Mintegral的正式广告，因此会受到算法智能优化的影响，若一段时间内大量加载和展示广告，可能导致一段时间后没有广告填充的现象。 | 国内版： 1、确保Mintegral后台-应用设置中开启了**是否接受apk广告投放** 海外版： 1、检查是否翻墙或者VPN到美国地区 上述检查后仍有问题，使用TopOn后台广告位，采用**调试模式**来进行测试 |
| -1201 | EXCEPTION\_UNIT\_NOT\_FOUND | 该unitID不存在/填写错误 | TopOn后台Mintegral广告源配置问题 |
| -1203 | EXCEPTION\_UNIT\_NOT\_FOUND\_IN\_APP | 在该appID和unitID不匹配 | TopOn后台Mintegral广告源配置问题 |
| -1205 | EXCEPTION\_UNIT\_ADTYPE\_ERROR | 传入的unitID广告类型不符 | TopOn后台Mintegral广告源配置问题 |

更多的Mintegral的错误信息请查看： [Mintegral错误码](https://dev.mintegral.com/doc/index.html?file=sdk-m_sdk-ios&lang=cn) ->接口状态返回说明

### 腾讯广告

| 错误码 | 描述 |
| --- | --- |
| 4013 | 系统不支持，原生视频模板广告只支持 iOS 9 及以上系统 |
| 4020 | window为空，需要在AppDelegate中添加window属性 |
| 5006 | 包名校验非法 **代码中配置的包名**与广点通后台的不一致 |
| 6000 | 未知错误，联系腾讯广告商务同事协助排查。 |

更多的腾讯广告的错误信息请查看： [Tencent Ad错误码](https://developers.adnet.qq.com/doc/ios/union/union_debug#%E9%94%99%E8%AF%AF%E7%A0%81)

### AppLovin

| 常见错误 | 解决方案 |
| --- | --- |
| 204 | 无填充，可将手机地区调整为美国，并代理网络至美国后尝试 |

更多的AppLovin的错误信息请查看： [AppLovin错误码](https://dash.applovin.com/documentation/mediation/ios/getting-started/errorcodes)

### Vungle

| 常见错误 | 解决方案 |
| --- | --- |
| 获取不到广告 | 通过Vungle后台开启测试模式进行测试 |
| 预加载了Vungle的激励视频和插屏广告并且成功后，播放了其中一个Vungle的广告，另一个广告的isAdReady()返回false | Vungle的激励视频和插屏广告存在共用同一份广告源资源的情况 |

更多的Vungle的错误信息请查看： [Vungle错误码](https://support.vungle.com/hc/zh-cn/sections/360006006692-%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)

### 快手

| 常见错误 | 解决方案 |
| --- | --- |
| 40003 - 广告数据为空 | 必现时，联系快手相关人员 |
| 310002 - appId无效 | TopOn后台快手广告源配置问题 |
| 310004 - packageName与注册的packageName不一致 | **代码中配置的包名**与快手后台的不一致 |
| 330002 - posId无效 | TopOn后台快手广告源配置问题 |
| 330004 - posId与注册的appId信息不一致 | TopOn后台快手广告源配置问题 |

更多的快手的错误信息请查看：(需登录下载) [快手错误码](https://ssp.e.kuaishou.com/#/access/sdk)

### Sigmob

| 常见错误 | 解决方案 |
| --- | --- |
| 200000 - 无广告填充 | 通过Sigmob后台添加测试设备进行测试 |
| 500420 - 请求的app已经关闭广告服务 | 通过Sigmob后台添加测试设备进行测试 |
| 500473 - 请求的app不存在 | TopOn后台Sigmob广告源配置问题 |
| 500701 - app未开通任何广告渠道 | 检查Sigmob后台应用状态 |

更多的Sigmob的错误信息请查看： [Sigmob错误码](https://doc.sigmob.com/#/Sigmob%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97/SDK%E9%9B%86%E6%88%90%E8%AF%B4%E6%98%8E/iOS/%E9%94%99%E8%AF%AF%E7%A0%81/)

### 百度

更多的百度的错误信息请查看：（需登录下载） [百度错误码](http://union.baidu.com/bqt/appco.html#/union/download/sdk)

### Bigo Ads

更多的Bigo\_Ads的错误信息请查看：[Bigo Ads错误码](https://www.bigossp.com/guide/sdk/ios/document)

| **常见错误** | **解决方案** |
| --- | --- |
| 10102 | 无广告填充，请尝试更换代理网络或设备重试。竞价广告请检查ads.txt配置，如有必要请前往Bigo后台添加测试设备，并等待30~60分钟生效后重试。 |

### UnityAds

更多的UnityAds的错误信息请查看： [UnityAds错误码](https://docs.unity.com/ads/en/manual/iOSAPI#UnityAdsLoadError)

| **常见错误** | **解决方案** |
| --- | --- |
| Code=2 - adMarkup is missing | 请检查 Monetization Dashboard 中的项目设置 → 中介合作伙伴中的“中介合作伙伴”是否设置正确 |

### Chartboost

更多的Chartboost的错误信息请查看： [Chartboost错误码](https://answers.chartboost.com/en-us/articles/204377039#iOS)

### Ironsource

更多的Ironsource的错误信息请查看： [Ironsource错误码](https://developers.ironsrc.com/ironsource-mobile/ios/advanced-settings-2/#step-6)

### Oneway

更多的Oneway的错误信息请查看： [Oneway错误码](http://doc.oneway.mobi/SDK/#/CN/iOS/iOS-API-CN?id=%e9%94%99%e8%af%af%e8%af%b4%e6%98%8e-)

### StartApp

更多的StartApp的错误信息请查看： [StartApp错误码](https://support.start.io/hc/en-us/articles/360013093679-Testing-Your-iOS-Integration#helpful-log-information-0-1)

### Ogury

更多的Ogury的错误信息请查看： [Ogury错误码](https://docs.ogury.co/ios/ad-formats/opt-in-video-ad#error-codes)

### 游可赢

更多的游可赢的错误信息请查看： [游可赢 错误码](https://yky.qq.com/doc/sdk/iOS#%E9%94%99%E8%AF%AF%E7%A0%81%E8%AF%B4%E6%98%8E)

### Inmobi

| **常见错误** | **解决方案** |
| --- | --- |
| com.inmobi.ads.requeststatus Code=6 The SDK encountered an internal error. | 网络原因，网络位于无效的区域。 解决方案：前往Inmobi后台添加测试设备测试广告。 |
| Inmobi测试模式没有生效 | 15分钟生效，需要使用代理请求广告。 |

更多的Inmobi的错误信息请查看： [Inmobi错误码](https://support.inmobi.com/choice/how-to-guide/common-errors/common-errors-ios#1--errors-in--delegate)
