---
title: "自定义广告实现竞价"
source: "https://help.toponad.net/cn/docs/zi-ding-yi-gao-ji-pei-zhi"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "自定义广告平台", "自定义广告平台 SDK 版本 < 6.4.94", "自定义广告实现竞价"]
content_sha256: "ca2a84db5ed42f73d174bb329be8fd82712f5489b21943865832add6df9151cd"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义广告实现竞价

## **1**. 自定义广告平台实现头部竞价

本章节主要介绍如何自定义Adapter实现Client Bidding

Client Bidding加载流程如图：



- 开发者调用 **\[\[ATAdManager sharedManager] loadADWithPlacementID:self.placementID extra:dict delegate:self]；API时，会调用到自定义Adapter的**bidRequestWithPlacementModel方法
- 开发者需重写 **+(void)bidRequestWithPlacementModel:(ATPlacementModel \*)placementModel unitGroupModel:(ATUnitGroupModel \*)unitGroupModel info:(NSDictionary \*)info completion:(void(^)(ATBidInfo \*bidInfo, NSError \*error))completion**，在此方法中，调用自定义广告平台的API发起初始化(如果已经初始化可忽略)和广告竞价

### 1.1 实现以下方法

| 抽象方法 | 参数说明 | 返回值 | 作用 | 必须实现 |
| --- | --- | --- | --- | --- |
| + (void)bidRequestWithPlacementModel:(ATPlacementModel \*)placementModel unitGroupModel:(ATUnitGroupModel \*)unitGroupModel info:(NSDictionary \*)info completion:(void(^)(ATBidInfo \*bidInfo, NSError \*error))completion | completion: 当 header bidding 完成后，需要执行此回调，将 bidding 得到的数据或者错误回传给 Topon SDK | void | 要实现自定义header bidding，则必须实现**类方法** | 是 |
| + (void)sendWinnerNotifyWithCustomObject:(id)customObject secondPrice:(NSString\*)price userInfo:(NSDictionary \*)userInfo; | customObject为当广告对象 price: 竞胜的第二价格 | void | 要实现自定义header bidding，则必须实现**类方法** | 否 |
| + (void)sendLossNotifyWithCustomObject:(nonnull id)customObject lossType:(ATBiddingLossType)lossType winPrice:(nonnull NSString \*)price userInfo:(NSDictionary \*)userInfo; | customObject为当广告对象，lossType 为 bid失败原因 price: 竞胜价格 | void | 要实现自定义header bidding，则必须实现**类方法** | 否 |

### 1.2 代码实现

实现上面的方法，以Baidu为例子。

复制代码

```
//引入头文件
#import
```

添加以下的方法，该方法为协议必须实现方法，并在该方法里实现以下逻辑步骤:

1. 发起广告源C2S header bidding请求。
2. 获取广告源C2S header bidding返回的价格，并构造出ATBidInfo对象。
3. 调用completion block，并将ATBidInfo对象传入。

   复制代码

   ```
   - (void)bidRequestWithPlacementModel:(ATPlacementModel\*)placementModel unitGroupModel:(ATUnitGroupModel\*)unitGroupModel info:(NSDictionary\*)info completion:(void(^)(ATBidInfo \*bidInfo, NSError \*error))completion {
     // 1. 是否初始化广告平台SDK

     // 2. 发起广告源C2S header bidding请求。
     ...
     // 如果 bidding 失败，则执行回调，传入error
     NSError \*error = ...;
     if (error) {
     completion(nil, error);
     return;
     }

     // 3. 获取广告源C2S header bidding返回的价格，并构造出ATBidInfo对象。
     NSString \*price = ...;
     // 需要确认一下传入的货币单位 currencyType
     ATBidInfo \*info = \[ATBidInfo bidInfoC2SWithPlacementID:placementModel.placementID
     unitGroupUnitID:unitGroupModel.unitID
     adapterClassString:request.unitGroup.adapterClassString
     price:price
     currencyType:ATBiddingCurrencyTypeCNY
     expirationInterval:unitGroupModel.networkTimeout
     customObject:nil];
     // 然后回传给 TopOn SDK
     **注意：5.9.90版本以实现以下方法可忽略重写loadADWithInfo方法**
     // bidInfo.isC2SNotNeedLoad = YES;
     // bidInfo.c2SCustomEvent = customEvent;
     // bidInfo.c2sCustomObject = customObject;

     // 4. 调用completion block，并将ATBidInfo对象传入
     completion(info, nil);
     }
   ```
4. 调整 Adapter 类里的 loadAdWithInfo 方法逻辑，参考如下:

   复制代码

   ```
   - (void)loadWithServerInfo:(NSDictionary \*)serverInfo localInfo:(NSDictionary \*)localInfo {
     NSString \*bidId = serverInfo\[kATAdapterCustomInfoBuyeruIdKey];
     //如果有bidId,代表是header bidding广告源
     if (bidId) {
     //判断广告源是否已经loaded过
     if (\_rewardedVideo.isReady) {
     \[\_customEvent trackRewardedVideoAdLoaded:\_rewardedVideo adExtra:nil];
     }
     }
     .....
     }
   ```

至此根据你的业务逻辑，已经可以开发C2S的请求了，以下为您展示了较为完整的例子，以供您参考。

## **2**. 完整代码实现

---

### 2.1 以激励视频为例子，继承ATRewardedVideoCustomEvent对象

引入头文件

复制代码

```
#import
```

实质大多数广告平台请求数据后是通过 delegate 回调的。所以需要创建一个类来接收回调，以下是 ATBaiduRewardedVideoCustomEvent中简单的示例。

复制代码

```
#import "ATRewardedVideoCustomEvent.h"
#import "ATBaiduRewardedVideoAdapter.h"

#import

@interface ATBaiduRewardedVideoCustomEvent : ATRewardedVideoCustomEvent

@property (nonatomic, assign) BOOL isC2SBiding;

@end

@interface ATBaiduRewardedVideoCustomEvent()
@end

@implementation ATBaiduRewardedVideoCustomEvent
- (void)rewardedVideoAdLoaded:(BaiduMobAdRewardVideo *)video {
    if (self.isC2SBiding) {
        NSString *price = @"替换成你的广告平台获取到的价格"
        //用于排序的价格
        NSString *sortPrice = @"替换成你需要";
        //构造ATBidInfo对象用于返回给SDK
        ATBidInfo *bidInfo = [ATBidInfo bidInfoC2SWithPlacementID:request.placementID unitGroupUnitID:request.unitGroup.unitID adapterClassString:request.unitGroup.adapterClassString price:priceStr sortPrice:sortPrice currencyType:ATBiddingCurrencyTypeUS expirationInterval:request.unitGroup.bidTokenTime customObject:customObject];
        bidInfo.networkFirmID = request.unitGroup.networkFirmID;

        //调用bidCompletion返回bidInfo给SDK
        if (request.bidCompletion) {
            request.bidCompletion(bidInfo, nil);
        }
        self.isC2SBiding = NO;
    }
    ......
}

- (void)rewardedVideoAdLoadFailed:(BaiduMobAdRewardVideo *)video withError:(BaiduMobFailReason)reason {
   if (self.isC2SBiding) {
        [self trackRewardedVideoAdLoadFailed:[NSError errorWithDomain:@"com.anythink.BaiduRewardedVideo" code:reason userInfo:@{NSLocalizedDescriptionKey:kATSDKFailedToLoadRewardedVideoADMsg, NSLocalizedFailureReasonErrorKey:@"BaiduSDK has failed to load rewarded video."}]];
   }
   .....
}

@end
```

使用一个BiddingRequest来保存C2S请求数据。

复制代码

```
@interface ATBaiduBiddingRequest : NSObject

@property(nonatomic, strong) id customObject;

@property(nonatomic, strong) ATUnitGroupModel *unitGroup;

@property(nonatomic, strong) ATAdCustomEvent *customEvent;

@property(nonatomic, copy) NSString *unitID;
@property(nonatomic, copy) NSString *placementID;
@property(nonatomic, copy) NSString *publisherID;

@property(nonatomic, copy) NSDictionary *extraInfo;

@end

创建一个ATBaiduC2SBiddingRequestManager类，用于保存request在内存当中

#import
#import "ATBaiduBiddingRequest.h"
#import "ATC2SBiddingParameterManager.h"

NS_ASSUME_NONNULL_BEGIN

@interface ATBaiduC2SBiddingRequestManager : NSObject

+ (instancetype)sharedInstance;
- (void)startWithRequestItem:(ATBaiduBiddingRequest *)request;

@end

@implementation ATBaiduC2SBiddingRequestManager

+ (instancetype)sharedInstance {
    static ATBaiduC2SBiddingRequestManager *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[ATBaiduC2SBiddingRequestManager alloc] init];
    });
    return sharedInstance;
}

- (void)startWithRequestItem:(ATBaiduBiddingRequest *)request {

    NSString *adplaceidStr = request.unitGroup.content[@"ad_place_id"];
    [[ATC2SBiddingParameterManager sharedInstance] saveRequestItem:request withUnitId:adplaceidStr];
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *appidStr = request.unitGroup.content[@"app_id"];
        NSString *adplaceidStr = request.unitGroup.content[@"ad_place_id"];

        BaiduMobAdRewardVideo *rewardedVideo = [[BaiduMobAdRewardVideo alloc] init];
        rewardedVideo.delegate = request.customEvent;
        rewardedVideo.AdUnitTag = adplaceidStr;
        rewardedVideo.publisherId = appidStr;

        request.customObject = rewardedVideo;
        [rewardedVideo load];
    });
}

NS_ASSUME_NONNULL_END
```

必须要实现的方法添加以下逻辑：

复制代码

```
+ (void)bidRequestWithPlacementModel:(ATPlacementModel*)placementModel unitGroupModel:(ATUnitGroupModel*)unitGroupModel info:(NSDictionary*)info completion:(void(^)(ATBidInfo *bidInfo, NSError *error))completion {
    ATBaiduRewardedVideoCustomEvent *customEvent = [[ATBaiduRewardedVideoCustomEvent alloc] initWithInfo:info localInfo:info];
    customEvent.isC2SBiding = YES;

    //创建一个ATBaiduBiddingRequest类用于保存请求所需要的信息
    ATBaiduBiddingRequest *request = [ATBaiduBiddingRequest new];
    request.unitGroup = unitGroupModel;
    request.placementID = placementModel.placementID;
    request.bidCompletion = completion;
    request.unitID = info[@"ad_place_id"];
    request.extraInfo = info;
    request.adType = ATAdFormatRewardedVideo;
    //广告源回调到customEvent对象
    request.customEvent = customEvent;

    //创建一个ATBaiduC2SBiddingRequestManager类，用于保存request在内存当中
    [[ATBaiduC2SBiddingRequestManager sharedInstance] startWithRequestItem:request];
}
```

最后调整 **BaiduRewardedVideoAdapter** 类中的方法

复制代码

```
- (void)loadWithServerInfo:(NSDictionary *)serverInfo localInfo:(NSDictionary *)localInfo {
    NSString *bidId = serverInfo[kATAdapterCustomInfoBuyeruIdKey];

    if (bidId) {
        ATBaiduBiddingRequest *request = [[ATC2SBiddingParameterManager sharedInstance] getRequestItemWithUnitID:serverInfo[@"ad_place_id"]];
        if (request != nil) {
            if (request.customObject) {
                _rewardedVideo = request.customObject;
                _rewardedVideo.delegate = _customEvent;
                if (_rewardedVideo.isReady) {
                    [_customEvent trackRewardedVideoAdLoaded:_rewardedVideo adExtra:nil];
                } else {
                    [_rewardedVideo load];
                }
            }

            // remove requestItem
            [[ATC2SBiddingParameterManager sharedInstance] removeRequestItemWithUnitID:serverInfo[@"ad_place_id"]];
        }
    }
}
```

## **3**. 自定义广告平台支持开发者设置WaterFall请求策略

---

参数说明:

| 参数名称 | 参数说明 |
| --- | --- |
| AdapterName | 自定义广告平台类名 |
| networkCacheTime | 广告源维度的**缓存时间** (单位:毫秒) |
| bidRealTimeLoadSW | 广告源维度的**每次Load均实时竞价开关** |

复制代码

```
NSMutableArray *array = [NSMutableArray array];
ATCustomNetworkMode *splshMode = [[ATCustomNetworkMode alloc]initWithAdapterName:@"AdapterName" networkCacheTime:1800 bidRealTimeLoadSW:YES];
[array addObject:splshMode];
[ATAPI addCustomAdapterConfigArray:array];
```
