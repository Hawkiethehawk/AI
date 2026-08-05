---
title: "ATAdAdapter"
source: "https://help.toponad.net/cn/docs/ATAdAdapter"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Protocol", "ATAdAdapter"]
content_sha256: "cfdf467e850b3319643cd4dda904d620dac720337bcb625dd007045580ae24f5"
knowledge_role: "reference_only"
has_article_body: true
---

# ATAdAdapter

复制代码

```
@protocol ATAdAdapter <NSObject>

#pragma mark - 初始化网络SDK并开始使用网络SDK加载广告

/// Adapter初始化方法
/// - Parameters:
///   - serverInfo: 来自服务器的数据
///   - localInfo: 本地数据
- (nonnull instancetype)initWithNetworkCustomInfo:(nonnull NSDictionary *)serverInfo
                                         localInfo:(nonnull NSDictionary *)localInfo;

#pragma mark - 通常
/// Adapter发送加载请求，表示广告源发送广告加载请求
/// - Parameters:
///   - serverInfo: 来自服务器的数据
///   - localInfo: 本地数据
///   - completion: 完成回调
- (void)loadADWithInfo:(nonnull NSDictionary *)serverInfo
             localInfo:(nonnull NSDictionary *)localInfo
            completion:(nonnull void (^)(NSArray<NSDictionary *> * _Nonnull array, NSError * _Nonnull error))completion;

/// 检查广告源是否准备就绪
/// - Parameters:
///   - customObject: 广告源对象
///   - info: 信息
+ (BOOL)adReadyWithCustomObject:(nonnull id)customObject info:(nonnull NSDictionary *)info;

@optional

@property (nonatomic, copy) void (^metaDataDidLoadedBlock)(void);

/*
 * 创建一个用于下载事件的奖励实例，仅用于下载事件。
 */
+ (id<ATAd>)readyFilledAdWithPlacementModel:(ATPlacementModel *)placementModel
                                  requestID:(NSString *)requestID
                                   priority:(NSInteger)priority
                                  unitGroup:(ATUnitGroupModel *)unitGroup
                             finalWaterfall:(ATWaterfallModel *)finalWaterfall
                                  localInfo:(NSDictionary *)localInfo;
+ (BOOL)adReadyForInfo:(NSDictionary *)info;

@end
```
