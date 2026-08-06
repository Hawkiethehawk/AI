---
title: "如何测试广告"
source: "https://help.toponad.net/cn/docs/ru-he-ce-shi-guang-gao-rKsm"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-26"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "集成测试", "如何测试广告"]
content_sha256: "245adb233c0a078dd57554d2ef3e49ab427329ec214a4da73658d1aaa77bec11"
knowledge_role: "reference_only"
has_article_body: true
---

# 如何测试广告

## 1. SDK集成验证

**温馨提示：自定义广告平台不支持集成验证功能。**

### 1.1 使用日志+集成验证API验证所有广告平台集成情况

调用以下代码，开启日志与集成检测功能：

objc
复制代码

```
#import <AnyThinkSDK/AnyThinkSDK.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [ATAPI setLogEnabled:YES];//Turn on debug logs
    [ATAPI integrationChecking];
    ....
    return YES;
}
```

根据输出的日志，检查各个广告平台的SDK集成是否正常。


以下表格中给您解释了各字段的含义：

| Field | Note |
| --- | --- |
| Status | 集成广告平台SDK的状态 |
| Reason | 集成存在的问题的原因 |
| Recommended Versions | 推荐导入的三方SDK版本 |
| Use Versions | 用户导入的三方SDK版本 |

### 1.2 使用DebugUI 调试工具验证集成情况

请前往 [DebugUI](/cn/docs/ce-shi-gong-ju-Beta-DLyz) 调试工具章节。

## 2. 调试广告

TopOn后台广告位配置生效时间为**5-15分钟**左右，当您修改相关广告位相关设置后（如添加修改广告源），可能需要等待后才会生效。

TopOn SDK为后台配置提供了沙盒缓存，时间为**30分钟**，当您修改配置后，需要等待缓存时间结束后才会请求最新的后台配置（缓存过期当次仍然使用老配置进行请求）。

您可根据当前开发阶段选择以下三种流程进行测试。

### 2.1 使用DebugUI 调试工具验证您线上广告源配置 （适用于验证广告源配置）

当您在TopOn后台与其他广告平台后台完成配置后，使用DebugUI 调试工具的线上ID测试功能，可以快速验证这些配置是否正确。

### 2.2 使用调试模式进行受限的广告流程测试

- 调试海外广告平台时，您可能需要使用代理网络，其中InMobi建议代理到东南亚地区，印度最佳，Pangle代理到非美国区域。其他海外平台加载广告可以尝试代理到平台所在国家地区，提高广告的填充率
- 调试模式下广告源并非百分百填充，例如Meta广告平台需要在测试手机安装了Facebook的应用，使用优质设备与代理网络，才能获得较低的填充概率，因为调试模式原理是使用了TopOn预先配置的广告源
- 每次仅能调试一个广告平台，`请您测试完毕后务必关闭本功能`
- 需要获得idfa授权后，调用如下API配置测试设备idfa、配置目标广告平台和广告类型。
- 调试模式所需参数列表可以[前往此处](/cn/docs/tiao-shi-mo-shi-can-shu-lie-biao)查看

**温馨提示：自定义广告平台不支持。**

objc
复制代码

```
#import <AnyThinkSDK/AnyThinkSDK.h>
 // 设置测试的idfa，例如Meta广告测试设备等
 [ATAPI setHeaderBiddingTestModeWithDeviceID:@"<静态写死指定测试设备的IDFA，不要动态获取当前设备IDFA，避免影响线上用户>"];
 // 注意事项：调用该代码，广告请求会使用服务器下发的广告配置，如果测试完成，需要使用自己的广告配置，需要把这段去掉。
 [ATAPI setDebuggerConfig:^(ATDebuggerConfig *debuggerConfig) {
    // Device idfa
    debuggerConfig.deviceIdfaStr = @"<静态写死指定测试设备的IDFA，不要动态获取当前设备IDFA，避免影响线上用户>";
    // 指定测试的广告平台，其他平台类型请点击进入头文件中查看
    debuggerConfig.netWorkType = ATAdNetWorkCSJType;
    // 指定穿山甲 具体广告类型
    debuggerConfig.csj_nativeAdType = ATCSJNativeAdFeedSelfRenderType;
  }];
```

### 2.3 使用您自己的广告位及广告源配置进行测试 （适用于上线环境测试）

移除DebugUI SDK，关闭调试模式，完全使用您应用中的展示广告逻辑与您TopOn后台配置来测试。

#### 2.3.1 如何一个个测试广告源是否正常(自定义规则)



可以通过配置流量分组 , 添加自定义规则来实现，首先参考这里创建带有自定义key-value规则的流量分组，每个流量分组中放入待测试的广告源(例如A流量分组仅放入快手，B流量分组仅放入腾讯，这里演示模拟放入百度)，然后通过以下代码进行测试。（代码添加完毕后，需等待数分钟后台配置的流量分组生效后，删除重装应用在验证）。例如：


> ⚠️温馨提示
>
> - 调试完毕后记得删除测试用的setCustomData代码。
> - 以下代码仅用于自定义规则或自定义规则（新）。
> - 您可能需要前往各广告平台后台添加自己的测试设备（需要广告平台支持）。

**后台修改后, 5分钟左右生效 ; 本地策略缓存沙盒30分钟, 建议您生效后删除App清下沙盒缓存，再请求。**

objc
复制代码

```
//在各种类型的广告加载（load）API调用前进行设置 调试完毕后记得删除测试用的setCustomData代码
[[ATSDKGlobalSetting sharedManager] setCustomData:@{@"baiduTest":@"yes"} forPlacementID:xxxx];

//注：xxx为实际代码中的参数
[[ATAdManager sharedManager] loadADWithPlacementID:xxx extra:xxx delegate:xxx];
```

#### 2.3.2 如何测试一批广告源是否正常(设备IDFA规则)

您可以创建测试流量分组，并添加您测试设备的IDFA。之后复制或创建您想要调试的一个或几个广告源，等待配置生效后，清除本机缓存，允许SDK获取到IDFA（可从初始化日志中看到SDK打印的IDFA即为成功）这之后再发起广告加载，即可附加上设备IDFA信息去发起广告请求。如果您的广告加载请求在获取IDFA之后进行，需要调整系统时间30分钟过后 , 回到应用再次请求一次，且重复该操作一次，更新沙盒策略缓存后即可。


### 2.4 使用自己配置的广告源请求广告

**测试广告**: 请前往广告平台后台添加测试设备（需广告平台支持）。

**正式广告**: 无法控制填充，受多种因素相关。增加正式非竞价广告填充的技巧：1.降低固定价格配置；2.海外广告平台多换一些节点设备尝试；对于海外项目，测试正式竞价广告前请检查app-ads.txt是否正确配置(TopOn、三方平台都需要检查。对于三方广告平台，请前往其文档中查找app-ads.txt相关配置教程)。

## 3. 查看广告加载失败原因

### 3.1 为广告位与广告源代理添加打印

> 广告源代理方法可以输出来自于第三方广告平台 SDK 的原始信息，对于排查广告加载失败原因非常有用。

- 一个广告位(Placement)中可以配置多个广告源(AdSource)。接收某一个广告源加载事件，需要使用广告源级别的代理回调方法接收。若所有广告源都请求失败，或广告位整体请求超时，则使用广告位级别失败回调接收事件。
- 开启 SDK 日志开关后，SDK 默认会打印广告源的加载失败信息，若您想自行收集并打印这些信息，请实现这些代理方法。
- 若您的广告源中包含竞价广告时，则需要实现下列BiddingADSource代理方法来获取广告源竞价相关信息。
- 打印error对象中的描述字段查看错误详细信息，可前往[错误码说明](/cn/docs/cuo-wu-ma-shuo-ming)文档进行查看错误码含义。

objc
复制代码

```
#pragma mark - 广告源 级别回调
- (void)didStartLoadingADSourceWithPlacementID:(NSString *)placementID extra:(NSDictionary*)extra {
    NSLog(@"广告源--AD--开始--didStartLoadingADSourceWithPlacementID:%@---extra:%@", placementID,extra);
}

- (void)didFinishLoadingADSourceWithPlacementID:(NSString *)placementID extra:(NSDictionary*)extra {
    NSLog(@"广告源--AD--完成--didFinishLoadingADSourceWithPlacementID:%@---extra:%@", placementID,extra);
}

- (void)didFailToLoadADSourceWithPlacementID:(NSString*)placementID extra:(NSDictionary*)extra error:(NSError*)error {
    NSLog(@"广告源--AD--失败--didFailToLoadADSourceWithPlacementID:%@---error:%@", placementID,error);
}

/*
若您的广告源中包含竞价广告时，则需要实现下列代理方法来获取广告源竞价的流程信息，如果遇到竞价失败，可以提供相关失败信息，然后给我们反馈，或者直接到三方平台错误码说明进行查看。
*/
#pragma mark - 广告源 级别回调 - 竞价
- (void)didStartBiddingADSourceWithPlacementID:(NSString *)placementID extra:(NSDictionary*)extra {
    NSLog(@"广告源--bid--开始--didStartBiddingADSourceWithPlacementID:%@---extra:%@", placementID,extra);
}

- (void)didFinishBiddingADSourceWithPlacementID:(NSString *)placementID extra:(NSDictionary*)extra {
    NSLog(@"广告源--bid--完成--didFinishBiddingADSourceWithPlacementID:%@--extra:%@", placementID,extra);
}

- (void)didFailBiddingADSourceWithPlacementID:(NSString*)placementID extra:(NSDictionary*)extra error:(NSError*)error {
    NSLog(@"广告源--bid--失败--didFailBiddingADSourceWithPlacementID:%@--extra:%@--error:%@", placementID, extra, error);
}

#pragma mark - 广告位 级别回调 - 所有广告源加载完毕
//成功时 - 有广告源加载成功
- (void)didFinishLoadingADWithPlacementID:(NSString *)placementID {
    NSLog(@"didFinishLoadingADWithPlacementID:%@", placementID);
}

//失败时 - 没有任何一个广告源加载成功
- (void)didFailToLoadADWithPlacementID:(NSString *)placementID error:(NSError *)error {
    NSLog(@"didFailToLoadADWithPlacementID:%@ error:%@", placementID, error);
}
```

以下是一个实际打印案例，通常您排查问题需要关注以下几点：

- **Error Domain=com.anythink.PubNativeSDK** : 描述错误来源于哪个包
- **Code=1** : TopOn 或第三方 SDK 的错误码
- **NSLocalizedDescription=HyBid - No fill** : 错误的具体含义，其中No fill常表示无广告返回
- **adsource\_id = "2560962"** : 发生错误的广告在TopOn的广告源ID
- **ATAdLogger(UA\_6.4.87)** : SDK版本

objc
复制代码

```
ATAdLogger(UA_6.4.87) Message:didFailBiddingADSourceWithPlacementID:b5bacaccb61c29extra:{
	adunit_id = "b5bacaccb61c29";
	currency = "USD";
	adsource_price = 0;
	req_id = "cee21cc4b7ae08706a1a3ef3fc9060ba";
	abtest_id = 609;
	s_id = 100172;
	usd_to_rmb_rate = "1";
	rmb_to_usd_rate = "0.1393";
	network_firm_id = 58;
	adsource_id = "2560962";
	network_placement_id = "9";
	adsource_bid_type = 2;
}error:Error Domain=com.anythink.PubNativeSDK Code=1 "AnythinkSDK has failed to load native ad." UserInfo={NSLocalizedDescription=AnythinkSDK has failed to load native ad., NSLocalizedFailureReason=Error Domain=net.pubnative.PubnativeLite Code=1 "HyBid - No fill" UserInfo={NSLocalizedDescription=HyBid - No fill}}
```

### 3.2 控制台日志解析

您可以通过控制台打印的日志信息来快速的获取以下调试信息。

- 从Xcode的日志中，可以看到对各种广告动作的跟踪。
- 根据placement\_id定位到需要验证的广告位。
- 日志中的action字段，是发起广告加载后，日志对应的动作，包括lrequest(广告请求)，request\_result(广告返回的结果)，impression（广告展示），click（广告点击），close（广告关闭）。

**日志示例：**

json
复制代码

```
{
    action = "request_result"; //发起广告加载后的动作：request(广告请求)，request_result(广告返回的结果)，impression（广告展示），click（广告点击），close（广告关闭）
    "ad_type" = reward; //发起加载的广告位类型 Native/inter/RewardVideo/Banner/Splash
    "adsource_id" = 12300; //广告源id
    auto = NO; //是否为自动请求
    "daily_frequency" = 0; //前天展示的次数
    "hourly_frequency" = 0; //当前小时展示的次数
    defaultAdSourceType = 0; //是否为兜底广告源
    isheaderbidding = 0; //是否为竞价广告源
    msg = "Error Domain=Wind Code=600008 \"\U8bf7\U6c42\U8d85\U65f6\U3002\" UserInfo={NSLocalizedDescription=\U8bf7\U6c42\U8d85\U65f6\U3002}";  //如果出现加载失败，这里会输出完整的错误信息
    network = Sigmob; //表示第三方平台
    "network_firm_id" = 29; //表示第三方平台的network_firm_id
    "network_list" =     (
        Sigmob
    );//当前第三方广告请求列表的id，以&ldquo;,&rdquo;间隔
    "network_unit_info" =     {
        "app_id" = 19761;
        "app_key" = 7064a19c108082ef;
        "placement_id" = ea1f8f7b662;
    };  //对应第三方广告平台的app和placement信息
    "placement_id" = b5d771f5a3458f; //发起了加载的广告位id
    position = 0; //当前广告源的排序位置
    refresh = 0;  //是否为自动刷新
    "request_network_num" = 1; //表示同时发起多少个第三方广告平台的加载
    result = fail;  //结果参数，success(成功)，fail(失败)
    "sdk_version" = "4.2.1"; //第三方平台SDK版本号
    "segment_id" = 0; //流量分组id
}
```

### 3.3 日志分析示例

TopOn的广告分为瀑布流广告(Waterfall)和竞价类广告，两类广告的加载流程略有不同，竞价广告会先获取竞价的token，此时还没有发起加载，瀑布流广告是直接向广告平台发起了广告请求。

**发起广告源广告请求**，在控制台中可搜索AD Request offer with network info:，结果如下图：


图中注解：

① 广告位中的广告源层发起请求

② 广告位中的广告源层是哪一家广告平台，定位到是哪一家广告平台

③ 广告位中的广告源平台的相关信息，在TopOn配置的广告平台信息。

**广告源广告请求成功**，在控制台中可搜索handler success Request offer with network info:，结果如下图：


图中注解：

① 广告位中的广告源层发起请求成功

② 广告位中的广告源层是哪一家广告平台

③ 广告位中的广告源平台的SDK的版本，能知道引入的三方平台SDK的版本

④ 广告位加载的流量分组id，能知道加载是哪一组流量分组，0表示为默认分组

**广告源广告请求失败**，在控制台中可搜索handler fail Request offer with network info:，结果如下图：


图中注解：

① 广告位中的广告源层发起请求失败。

② 广告位中的广告源层加载失败信息，根据是哪个平台的广告，用错误信息到相应的平台的错误码进行排查。

③ 广告位中的广告源层是哪一家广告平台 。

### 3.4 常用搜索关键词

- **Impression with ad info:** 展示广告的信息，如果展示异常，可通过搜索这个打印查看是哪个广告源的广告。
- **Close with ad info:** 关闭广告的信息。
- **ATADLogger(UA\_6.4.87)** 括号表示集成的TopOn SDK版本，ATADLogger为SDK日志关键词。
