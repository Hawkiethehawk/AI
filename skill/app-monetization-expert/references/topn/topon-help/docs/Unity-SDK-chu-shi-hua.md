---
title: "Unity SDK初始化"
source: "https://help.toponad.net/cn/docs/Unity-SDK-chu-shi-hua"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "集成基础说明", "Unity SDK初始化"]
content_sha256: "47abb8f5c7f921f264b5637fdef8f86bb5ac60625c15ce8fc383e8eb1ab1a05f"
knowledge_role: "reference_only"
has_article_body: true
---

# Unity SDK初始化

## **1**. API说明

| API | 参数 | 说明 |
| --- | --- | --- |
| initSDK | string appid, string appkey | 初始化SDK，其中appId和appKey需要在TopOn后台创建应用之后获取。 [如何获取App Key?](/cn/docs/pzi00q#outline_2) |
| setLogDebug | bool isDebug | 是否开启SDK的Debug log，**强烈建议在测试阶段开启，方便排查问题** |
| setChannel | string channel | 设置渠道信息，用于TopOn后台区分广告数据，只允许设置字符的规则：**A-Za-z0-9\\_** **注意：如果有使用initCustomMap()方法，必须在initCustomMap()方法之后调用此方法** |
| setSubChannel | string subChannel | 设置子渠道信息，只允许设置字符的规则：**A-Za-z0-9\\_** **注意：如果有使用initCustomMap()方法，必须在initCustomMap()方法之后调用此方法** |
| initCustomMap | Dictionary | 自定义key-value，可用于App维度匹配后端下发的广告列表信息 **App的自定义规则为全局设置，对全部Placement有效**. 开发者可以在TopOn后台的流量分组中设置相应的自定义规则，具体参考[流量分组使用说明](/cn/docs/AB0pfG) **注意：调用此方法会清除setChannel()、setSubChannel()方法设置的信息，如果有设置这些信息，请在调用此方法后重新设置** |
| setCustomDataForPlacementID | Dictionary | 自定义key-value，可用于广告位维度匹配后端下发的广告列表信息 **仅对当前Placement有效**，您可以在**App自定义规则**基础上增加Placement特有的自定义规则. 开发者可以在TopOn后台的流量分组中设置相应的自定义规则，具体参考[流量分组使用说明](/cn/docs/AB0pfG) |
| getUserLocation | ATGetUserLocationListener listener | 判断当前网络是否在欧盟地区 |
| getGDPRLevel | - | 获取当前隐私数据的上报等级 |
| showGDPRAuth | - | 展示GDPR授权页面 **注意**：v6.2.87开始废弃，请使用showGDPRConsentDialog代替 |
| showGDPRConsentDialog |  | \*\*（v6.2.87新增）\*\*展示Google UMP GDPR授权页面 |

## **2**. 示例代码

您的App需要制订《隐私政策》，同时在用户首次启动App时展示《隐私政策》并取得用户同意。App制订的《隐私政策》，请参考[《隐私合规指南》](/cn/docs/ByIf1V) **请务必确保用户同意App《隐私政策》之后，再初始化TopOn SDK**

您可以通过以下代码初始化 **AnyThinkSDK** ，详细参考[demo project](https://github.com/toponteam/TopOn-Unity-Demo-test):

java
复制代码

```
//（可选配置）设置自定义的Map信息，可匹配后台配置的广告商顺序的列表（App纬度）
//注意：调用此方法会清除setChannel()、setSubChannel()方法设置的信息，如果有设置这些信息，请在调用此方法后重新设置
ATSDKAPI.initCustomMap(new Dictionary { { "unity3d_data", "test_data" } });

//（可选配置）设置自定义的Map信息，可匹配后台配置的广告商顺序的列表（Placement纬度）
ATSDKAPI.setCustomDataForPlacementID(new Dictionary { { "unity3d_data_pl", "test_data_pl" } } ,placementId);

//（可选配置）设置渠道的信息，开发者可以通过该渠道信息在后台来区分看各个渠道的广告数据
//注意：如果有使用initCustomMap()方法，必须在initCustomMap()方法之后调用此方法
ATSDKAPI.setChannel("unity3d_test_channel");

//（可选配置）设置子渠道的信息，开发者可以通过该渠道信息在后台来区分看各个渠道的子渠道广告数据
//注意：如果有使用initCustomMap()方法，必须在initCustomMap()方法之后调用此方法
ATSDKAPI.setSubChannel("unity3d_test_subchannel");

//设置开启Debug日志（强烈建议测试阶段开启，方便排查问题）
ATSDKAPI.setLogDebug(true);

//（必须配置）SDK的初始化
ATSDKAPI.initSDK("a5c4ad280995c9", "7b4e37f819dbee652ef79c4506e14288");//Use your own app_id & app_key here
```

## **3**. 不同广告形式的接入

**完成初始化之后，可以开始各个广告形式的接入：**

[激励视频广告接入](/cn/docs/ji-li-shi-pin-guang-gao-ji-cheng-shuo-ming)
[插屏广告接入](/cn/docs/cha-ping-guang-gao-ji-cheng-shuo-ming)
[Banner广告接入](/cn/docs/Banner-guang-gao-ji-cheng-shuo-ming)
[原生广告接入](/cn/docs/yuan-sheng-guang-gao-ji-cheng-shuo-ming)
[开屏广告接入](/cn/docs/kai-ping-guang-gao-jie-ru)
