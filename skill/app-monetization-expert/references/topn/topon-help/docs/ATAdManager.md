---
title: "ATAdManager"
source: "https://help.toponad.net/cn/docs/ATAdManager"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATAdManager"]
content_sha256: "052e52ecc74956967f5661c897ea1ffecba2c011d45f0868b0fe521a8ec2807e"
knowledge_role: "reference_only"
has_article_body: true
---

# ATAdManager

> 广告的基础操作类，包括广告加载、过滤广告、场景统计、比价工具等功能。

复制代码

```
extern NSString *const kATAdAssetsNativeCustomEventKey;
extern NSString *const kATAdAssetsCustomEventKey;
extern NSString *const kATAdAssetsCustomObjectKey;
extern NSString *const kATExtraInfoRootViewControllerKey;
extern NSString *const kATAdAssetsDelegateObjKey;
extern NSString *const kATAdAssetsCustomNativeAdKey;
extern NSString *const kATAdAssetsCustomShowVcKey;

extern NSString *const kATAdLoadingExtraMediaExtraKey;
extern NSString *const kATAdLoadingExtraNetworkPlacementIDKey;
extern NSString *const kATAdLoadingExtraAdmobContentURLStringsKey;

/*
 * Banner广告尺寸，值为NSValue包装的CGSize类型。
 * 目前Banner广告加载仅支持(320.0f, 50.0f)尺寸，
 * 因此通过此键传入的值将被忽略。
 * 开发者使用kATAdLoadingExtraBannerAdSizeKey设置Banner尺寸，本键无用
 */
extern NSString *const kATExtraInfoAdSizeKey;
extern NSString *const kATAdLoadingExtraGDTEnableDefaultAudioSessionKey;

typedef BOOL(^AdSourceCustomizeFillterBlock)(NSDictionary *extra);

@protocol ATAdLoadingDelegate;

@interface ATAdManager : NSObject

@property (nonatomic,strong) NSDictionary *extra;
@property (nonatomic,strong) NSMutableDictionary *exludeUnitIDDic;
@property (nonatomic,strong) NSMutableDictionary *exludeNetworkFirmIDDic;
@property (nonatomic,strong) NSMutableDictionary *showingUnitIdDic;

@property(nonatomic, copy) AdSourceCustomizeFillterBlock adSourceCustomizeFillter;

/// 单例对象
+ (instancetype)sharedManager;

/// 加载广告时调用
/// @param placementID - TopOn的广告位ID
/// @param extra - 本地配置参数
/// @param delegate - 代理对象
- (void)loadADWithPlacementID:(NSString *)placementID
                        extra:(NSDictionary *)extra
                     delegate:(id<ATAdLoadingDelegate>)delegate;

- (void)loadADWithPlacementID:(NSString *)placementID
                        extra:(NSDictionary *)extra
                      tkExtra:(nullable NSDictionary *)tkExtra
                adxFloorPrice:(nullable ATADXFloorPrice *)adxFloorPrice
                     delegate:(id<ATAdLoadingDelegate>)delegate;

// 广告位下过滤目标广告源(根据UnitID)
- (void)setExludePlacementid:(NSString *)placementid
                 unitIDArray:(NSArray <NSString *> *)unitIDArray;

/// 设置加载广告位时需要排除的广告网络，将在下次加载时生效
/// @param placementid - TopOn的广告位ID
/// @param networkFirmIDArray - 需要排除的广告网络ID数组
- (void)setExludePlacementid:(NSString *)placementid
          networkFirmIDArray:(NSArray <NSNumber *> *)networkFirmIDArray;

/// 根据placementID和requestID获取广告extraInfo信息
- (NSDictionary *)extraInfoForPlacementID:(NSString*)placementID
                                requestID:(NSString*)requestID;

/// 传入广告位ID输出，过滤广告源
- (void)setAdSourceCustomizeFillterPlacementIDArray:(NSArray <NSString *> *)placementIDArray;

/// 进入场景打点(用于后台数据统计)
- (void)entryAdScenarioWithPlacementID:(NSString *)placementID scenarioID:(NSString *)scenarioID;

/// 根据广告位ID检查已缓存的广告，第一项为即将展示的广告
- (NSArray<NSDictionary *> *)getAdValidAdsForPlacementID:(NSString *)placementID;

/// 仅在自定义关闭广告后通知我们
/// @param placementID - TopOn的广告位ID
- (void)customCloseADEventWithPlacementID:(NSString *)placementID;

// 竞价工具，竞价胜负接口 TODO ZSR 待优化
+ (void)trackWinWithPlacementID:(nonnull NSString *)placementID extra:(nullable NSDictionary*)extra;
+ (void)trackLossWithPlacementID:(nonnull NSString *)placementID extra:(nullable NSDictionary*)extra;

@end
```
