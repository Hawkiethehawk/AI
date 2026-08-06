---
title: "服务端激励"
source: "https://help.toponad.net/cn/docs/msbnkj"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "高级功能", "服务端激励"]
content_sha256: "d92e192b1e7c160c2a628c41163337bff4d3e5d9ea9792f24e17f666ce27c9b0"
knowledge_role: "reference_only"
has_article_body: true
---

# 服务端激励

## **1**. 服务端激励介绍

服务端激励（Server-to-Server）：允许开发者自己判断是否下发奖励给观看激励视频的用户。当用户看完激励视频时，将通知开发者的服务器，由开发者自己进行奖励的下发

- TopOn SDK 第三方广告平台服务端激励
- TopOn SDK >= v5.7.56 开发者可以使用[TopOn服务端激励](/cn/docs/msbnkj#outline_4)

> 注意：
> 1.为了保障服务端激励的准确性，针对第三方广告平台建议开发者优先使用第三方广告平台的服务端激励回调。
> 2.针对TopOn Adx、直投、交叉推广，开发者可以直接使用TopOn的服务端激励回调。您可以根据 Network Firm ID来判断是否只接受TopOn服务端激励回调：
> TopOn Adx的Network Firm ID=66
> TopOn 直投广告的Network Firm ID=67
> TopOn 交叉推广的Network Firm ID=35

## **2.** 第三方广告平台服务端激励的使用流程

1. 开发者需要到第三方广告平台的后台设置开发者自己服务器的回调URL地址
2. 开发者在代码中通过TopOn SDK的API传入**UserID（用户唯一ID）**、**UserCustomData（用户自定义数据)**. 这些参数最终将通过回调URL通知开发者
3. 当用户看完激励视频时，广告平台将通过设置的回调URL地址通知开发者，由开发者自行判断并下发奖励

**支持服务端激励的广告平台如下：（可点击跳转到广告平台关于服务端激励的文档说明，不能跳转的请直接登录广告平台后台进行回调URL的设置）**

### 2.1 Android

| 广告平台 | 参考网址 | 备注 |
| --- | --- | --- |
| Facebook | <https://developers.facebook.com/docs/audience-network/guides/ad-formats/rewarded-video/android> |  |
| Admob & Google Ad Manger | <https://support.google.com/admob/answer/9603226?hl=zh-Hans&ref_topic=7382891> |  |
| Applovin | - | 请登录Applovin后台设置回调URL |
| Mintegral | <http://cdn-adn.rayjump.com/cdn-adn/v2/markdown_v2/index.html?file=sdk-m_sdk-android&lang=cn> |  |
| Mopub | <https://developers.mopub.com/publishers/android/rewarded-video/#passing-custom-data> |  |
| ironSource | <https://developers.ironsrc.com/ironsource-mobile/android/advanced-settings/#step-2> |  |
| UnityAds | <http://unityads.unity3d.com/help/resources/s2s-redeem-callbacks> |  |
| Vungle | <https://support.vungle.com/hc/en-us/articles/204374244-Setting-Up-Rewarded-Ads#server-to-server-s2s-callbacks-0-0> |  |
| AdColony | <https://github.com/AdColony/AdColony-Android-SDK/wiki/Showing-Rewarded-Interstitial-Ads#server-side-rewards> |  |
| Pangle | <https://www.pangleglobal.com/integration/android-rewarded-video-ads#9a8t5of7omo0> |  |
| AppNext | <https://developers.appnext.com/docs/appnext-android-rewarded-fullscreen#server-side-postback---rewarded-video> |  |
| Ogury | <https://ogury-ltd.gitbook.io/android/ad-formats/opt-in-video-ad> |  |
| Huawei | - | 请登录Huawei后台设置回调URL |

### 2.2 iOS

| 广告平台 | 参考网址 | 备注 |
| --- | --- | --- |
| Facebook | <https://developers.facebook.com/docs/audience-network/guides/ad-formats/rewarded-video/ios> |  |
| Admob & Google Ad Manger | <https://developers.google.com/admob/ios/rewarded-video-ssv> |  |
| Applovin | <https://dash.applovin.com/docs/integration#iosRewardedVids> |  |
| Mintegral | <http://cdn-adn.rayjump.com/cdn-adn/v2/markdown_v2/index.html?file=sdk-m_sdk-ios&lang=cn> |  |
| ironSource | <https://developers.ironsrc.com/ironsource-mobile/ios/advanced-settings-2/#step-3> |  |
| Vungle | <https://support.vungle.com/hc/en-us/articles/204374244-Setting-Up-Rewarded-Ads#server-to-server-s2s-callbacks-0-0> |  |
| AdColony | <https://github.com/AdColony/AdColony-iOS-SDK/wiki/Showing-Rewarded-Interstitial-Ads#server-side-rewards> |  |
| 穿山甲(Pangle) | <https://www.pangle.cn/union/media/union/download/detail?id=23&docId=5de8d72ab1afac00129330e6&osType=ios#620104> |  |
| AppNext | <https://developers.appnext.com/docs/appnext-ios-rewarded-fullscreen#server-side-postback---rewarded-video-ad> |  |
| Ogury | <https://ogury-ltd.gitbook.io/ios/ad-formats/opt-in-video-ad> |  |
| Nend | [点击查看](https://github.com/fan-ADN/nendSDK-iOS/wiki/%E6%BF%80%E5%8A%B1%E6%80%A7%E8%A7%86%E9%A2%91%E5%B9%BF%E5%91%8A%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B#%E7%94%A8%E6%88%B7id%E7%9A%84%E8%AE%BE%E7%BD%AE) |  |
| Sigmob | [https://support.sigmob.com/#/平台操作指南/Sigmob变现/激励视频服务端验证/](https://support.sigmob.com/#/%E5%B9%B3%E5%8F%B0%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97/Sigmob%E5%8F%98%E7%8E%B0/%E6%BF%80%E5%8A%B1%E8%A7%86%E9%A2%91%E6%9C%8D%E5%8A%A1%E7%AB%AF%E9%AA%8C%E8%AF%81/) | **v5.7.41版本开始**，支持customData的传入，以Json字符串的形式通过开发者设置的回调URL通知开发者（Key为**user\_custom\_data**，Value为customeData） |
| UnityAds | <https://unityads.unity3d.com/help/resources/s2s-redeem-callbacks> |  |
| Tapjoy | - | 请登录Tapjoy后台设置回调URL |
| 腾讯广告 | <https://developers.adnet.qq.com/doc/ios/union/union_reward_video> | 请登录腾讯广告 后台设置回调URL **TopOn SDK v5.7.8及以上版本支持** |
| 快手 | <https://static.yximgs.com/udata/pkg/KSAdSDKTarGz/doc/ksadsdk-iOS-readme-ad-3.3.9.pdf> |  |
| 百度 | <https://union.baidu.com/miniappblog/2020/08/11/iOSSDK/> |  |

## **3**. TopOn服务端激励的使用说明

- TopOn SDK >= v5.7.56可以使用TopOn服务激励回调
- TopOn SDK >= v5.7.78及以上版本支持在TopOn服务激励回调中返回展示级别的数据（开发者可以在回调URL中添加{ilrd}参数获取相应数据)

### 3.1 服务端激励使用流程

1. 开发者需要在TopOn后台的激励视频广告位上打开服务端激励，并设置回调URL地址
2. 开发者需要在代码中通过TopOn SDK的API传入UserID（用户唯一ID）、UserCustomData（用户自定义数据). 这些参数最终将通过回调URL通知开发者
3. 当用户看完激励视频时，TopOn平台将通过设置的回调URL地址通知开发者，由开发者自行判断并下发奖励

### 3.2 开发者的服务端激励接入指南

1. 开发者需要TopOn后台的激励视频广告位打开服务端激励，并设置开发者服务端激励的**回调URL**，示例如下：



1. 开发者的**回调URL**示例如下：

java
复制代码

```
https://www.toponad.com/onrewardedverify?user_id={user_id}&trans_id={trans_id}&reward_amount={reward_amount}&reward_name={reward_name}&placement_id={placement_id}&extra_data={extra_data}&network_firm_id={network_firm_id}&adsource_id={adsource_id}&scenario_id={scenario_id}&sign={sign}&ilrd={ilrd}
```

1. TopOn会以 **GET 方式**请求开发者的**回调URL**，并拼接以下参数回传：

java
复制代码

```
user_id={user_id}&trans_id={trans_id}&reward_amount={reward_amount}&reward_name={reward_name}&placement_id={placement_id}&extra_data={extra_data}&network_firm_id={network_firm_id}&adsource_id={adsource_id}&scenario_id={scenario_id}&sign={sign}&ilrd={ilrd}
```

开发者url自定义回调信息的占位符如下，注意

• 不一定要配置所有占位符，即需要哪些信息就配置哪些占位符

• **如果需要签名机制（即有配置：sign={sign}），那么涉及签名相关（见下面：sign签名规则说明）的所有占位符都需要配置**

• 回调给开发者的url除了自定义配置信息外，某些情况还有可能额外返回人民币转美元汇率信息（例如：exch\_rate\_c2u=0.1375），不关注可忽略

• 使用开发者后台创建或编辑服务端激励广告位时，默认会回调一次开发者在后台配置的激励url，目的是为了一开始就检测开发者配置的url是否正常，即此时回调的url占位符是没有替换的并且会增加回调参数：is\_test=1

| 参数 | 说明 | 备注 |
| --- | --- | --- |
| {user\_id} | 用户ID | 由开发者通过TopOn SDK API设置 |
| {extra\_data} | 用户业务参数 | 由开发者通过TopOn SDK API设置 |
| {trans\_id} | TopOn服务端生成的trans\_id，具有唯一性 | **强烈建议开发者在服务器发放激励前校验trans\_id是否已发放激励，以规避对相同的trans\_id重复发放激励** |
| {reward\_name} | 激励名称 | 在开发者后台设置(支持**广告位**或**广告场景**设置） |
| {reward\_amount} | 激励数量 | 在开发者后台设置 (支持**广告位**或**广告场景**设置） |
| {placement\_id} | TopOn广告位ID | - |
| {network\_firm\_id} | TopOn聚合的广告平台ID | 【特别注意】1). 如果您需要使用服务端激励，同时有使用TopOn Adx、直投、交叉推广时：针对第三方广告平台建议您优先使用第三方广告平台的服务端激励回调；针对TopOn Adx、直投、交叉推广，您可以使用TopOn的服务端激励回调。2). 您可以根据 Network Firm ID来判断是否只接受TopOn服务端激励回调： 1. TopOn Adx的Network Firm ID=66 2. TopOn 直投广告的Network Firm ID=67 3. TopOn 交叉推广的Network Firm ID=35 [查看TopOn广告平台ID列表](/cn/docs/JSLSJN#outline_3) |
| {adsource\_id} | TopOn广告源ID | - |
| {scenario\_id} | TopOn广告场景ID | 由开发者通过TopOn SDK API设置 |
| {package\_name} | 开发者应用的包名或Bundle ID | 由TopOn SDK获取开发者的应用包名或Bundle ID |
| {platform} | 系统平台，Android 或 iOS | 按以下枚举类型返回，1：Android，2：iOS |
| {ilrd} | TopOn SDK回调的展示级别数据. **数据为json字符串** | **TopOn SDK v5.7.78及以上版本支持**。TopOn SDK在回调激励视频OnReward时给开发者提供展示级别的数据，[具体数据格式参考](/cn/docs/msbnkj#5._ILRD%E6%95%B0%E6%8D%AE%E8%AF%B4%E6%98%8E) |
| {sign} | 签名信息 | 参考签名规则说明 |

1. **sign**签名规则说明

开发者在收到TopOn的服务端激励回调时，可以通过sign对回调参数进行校验。

- TopOn服务器按以下规则生成sign签名（不带ilrd)

java
复制代码

```
sign =MD5("trans_id="+trans_id+"&placement_id="+placement_id+"&adsource_id="+adsource_id+"&reward_amount="+reward_amount+"&reward_name="+reward_name+"&sec_key="+sec_key)
```

- TopOn服务器按以下规则生成sign签名（带ilrd)

如果回调URL中有 {ilrd} 参数，需要使用以下sign签名规则：

java
复制代码

```
sign =MD5("trans_id="+trans_id+"&placement_id="+placement_id+"&adsource_id="+adsource_id+"&reward_amount="+reward_amount+"&reward_name="+reward_name+"&sec_key="+sec_key+"&ilrd="+ilrd)
```

- sign签名示例

| 参数 | 示例 |
| --- | --- |
| trans\_id | xxxxxxxxxxxxxxxx |
| placement\_id | b5b449fb3d89d7 |
| adsource\_id | 56789 |
| reward\_amount | 1 |
| reward\_name | coin |
| sec\_key | cyvmwmzrqts7csphhexpqxqxxgljfisb |
| ilrd | abc |

sign签名示例如下：

sign=MD5(trans\_id=xxxxxxxxxxxxxxxx&placement\_id=b5b449fb3d89d7&adsource\_id=56789&reward\_amount=1&reward\_name=coin&sec\_key=cyvmwmzrqts7csphhexpqxqxxgljfisb&ilrd=abc)

1. 开发者回调URL收到TopOn的服务端激励回调后，需给TopOn服务器返回状态码**200 或 601或 602** 。TopOn收到成功或失败状态码后，都不会重发服务端激励回调。

特别注意：回调的数据有时可能很大（特别是包含ilrd时候），开发者应保证去除GET回调Url的长度限制，否则开发者服务器可能会报414错误（例如使用了nginx, 默认有长度限制）

| 返回状态码 | 说明 |
| --- | --- |
| 200 | 成功 |
| 601 | 签名验证失败 |
| 602 | 其他失败 |

1. TopOn服务器发起服务端激励回调后2秒内无响应则视为超时，超时后会每隔一会（比如2秒，4秒，8秒等）重试发送激励回调。TopOn最大重试5次还超时，则不再向开发者回调URL发起激励回调

### 3.3 分广告场景的服务端激励

为了满足开发者在不同的激励视频广告场景下发不同的激励，TopOn允许开发者除了在不同的广告场景上设置不同的激励名称和激励数量，具体使用流程如下：

1. 打开激励视频广告位的服务端激励回调，并在**回调URL**中接收TopOn回调的**广告场景ID{scenario\_id}**
2. 在TopOn后台的广告场景下设置**激励数量**和**激励名称**，参考如下：



1. 开发者在收到TopOn的服务端激励回调时，根据\*\*广告场景ID{scenario\_id}\*\*下发不同的激励

### 3.4 服务端激励规则快捷复用

为了减少开发者手动配置服务端回调规则的时间，TopOn允许开发者快捷复用服务端回调规则，步骤如下：

1. 在**高级功能**的下拉界面中，进入**服务端回调**
2. 新建**回调规则**，编辑好后保存规则。



1. 在新建或修改广告位时，打开服务端回调按钮，选择对应规则，即可实现该规则的快捷复用。



## **4**. TopOn SDK接入

### 4.1 TopOn Android SDK代码示例

java
复制代码

```
Map localMap = new HashMap();
localMap.put(ATAdConst.KEY.USER_ID, "test_user_id");
localMap.put(ATAdConst.KEY.USER_CUSTOM_DATA, "test_user_data");
mRewardVideoAd.setLocalExtra(localMap);

mRewardVideoAd.load();
```

### 4.2 TopOn iOS SDK代码示例

java
复制代码

```
[[ATAdManager sharedManager] loadADWithPlacementID:placementId extra:@{kATAdLoadingExtraMediaExtraKey:@"test_user_data", kATAdLoadingExtraUserIDKey:@"test_user_id"} delegate:self];
```

### 4.3 TopOn Unity SDK代码示例

java
复制代码

```
Dictionary jsonmap = new Dictionary();

jsonmap.Add(ATConst.USERID_KEY, "test_user_id");
jsonmap.Add(ATConst.USER_EXTRA_DATA, "test_user_data");

ATRewardedVideo.Instance.loadVideoAd(placementId, jsonmap);
```

### 4.4 TopOn Cocos2dx SDK代码示例

java
复制代码

```
cocos2d::ValueMap extra;
extra[ATCocosSdk::KEY_USER_ID] = "test_user_id";
extra[ATCocosSdk::KEY_MEDIA_EXT] = "test_user_data";
ATCocosSdk::loadRewardedVideoAd(placementId, extra);
```

### 4.5 TopOn CocosCreator SDK代码示例

java
复制代码

```
var setting = {};
setting[ATRewardedVideoJSSDK.userIdKey] = "test_user_id";
setting[ATRewardedVideoJSSDK.userDataKey] = "test_user_data";
ATRewardedVideoJSSDK.loadRewardedVideo(placementId, setting);
```

### 4.6 TopOn ReactNative SDK代码示例

java
复制代码

```
var setting = {};
settings[ATRewardedVideoRNSDK.userIdKey] = "test_user_id";
settings[ATRewardedVideoRNSDK.userDataKey] = "test_user_data";
ATRewardedVideoRNSDK.loadAd(placementId, settings);
```

## **5**. ILRD数据说明

| 变量 | 类型 | 说明 |
| --- | --- | --- |
| network\_firm\_id | int | 获取 广告平台对应的ID，用于区分广告平台 |
| adsource\_id | string | 获取 广告源ID. 可在开发者后台或TopOn Open API 通过广告源ID查询具体的Network信息 |
| adsource\_index | int | 获取 当前广告源在WaterFall中的排序\*\*（从0开始）\*\* |
| adsource\_price | double | 获取 ECPM，单位可通过\*\*"currency"\*\*获取 |
| adsource\_isheaderbidding | int | 是否为头部竞价的广告源，**1：是，2：否** |
| id | string | 获取 每次**展示广告**时生成的独立ID |
| publisher\_revenue | double | 获取 展示收益 |
| currency | string | 获取 货币单位，例如："USD" |
| country | string | 获取 国家代码， 例如：”CN" |
| adunit\_id | string | 获取 TopOn广告位ID |
| adunit\_format | string | 获取 广告类型，包括：**"Native"、"RewardedVideo"、"Banner""Interstitial"、"Splash"** |
| precision | string | 获取 ECPM精度 **"publisher\_defined"**：开发者在TopOn后台为广告源定义的eCPM\*\*（交互推广的eCPM也属于该类型)\*\* **"estimated":** TopOn的预估eCPM（auto eCPM) **"exact"**：Header Bidding实时竞价的eCPM |
| network\_type | string | 获取 Network类型 **"Network"**：第三方广告平台 **"Cross\_Promotion"**：交互推广 **"Adx"**：TopOn Adx |
| network\_placement\_id | string | 获取 Network的广告位ID |
| ecpm\_level | int | 获取 广告源的eCPM层级，**头部竞价广告源默认为0** |
| segment\_id | int | 获取 流量分组ID |
| scenario\_id | string | 获取 广告场景ID，**仅Rewarded Video&Interstitial支持(v5.7.20开始，支持Native&Banner)** |
| scenario\_reward\_name | string | 获取 广告场景的激励名称，**仅Rewarded Video支持** |
| scenario\_reward\_number | int | 获取 广告场景的激励数量，**仅Rewarded Video支持** |
| sub\_channel | string | 获取 子渠道信息 |
| channel | string | 获取 渠道信息 |
| custom\_rule | Dictionary | 获取 **Placement+App维度**的自定义规则的**Json字符串** |
