---
title: "ATSDKGlobalSetting"
source: "https://help.toponad.net/cn/docs/ATSDKGlobalSetting"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATSDKGlobalSetting"]
content_sha256: "9e4c63df71a4a46fa05a1c89b1ea75a08db0f60741b48d5137a08e5de27ef947"
knowledge_role: "reference_only"
has_article_body: true
---

# ATSDKGlobalSetting

复制代码

```
@class ATCustomContentInfo;
extern NSString *const kATDeviceDataInfoOSVersionNameKey; //系统版本名称
extern NSString *const kATDeviceDataInfoOSVersionCodeKey; //系统版本号
extern NSString *const kATDeviceDataInfoPackageNameKey; //应用包名
extern NSString *const kATDeviceDataInfoAppVersionNameKey; //应用版本名称
extern NSString *const kATDeviceDataInfoAppVersionCodeKey; //应用版本号
extern NSString *const kATDeviceDataInfoBrandKey; //手机品牌
extern NSString *const kATDeviceDataInfoModelKey; //手机型号
extern NSString *const kATDeviceDataInfoScreenKey; //屏幕分辨率
extern NSString *const kATDeviceDataInfoNetworkTypeKey; //网络类型
extern NSString *const kATDeviceDataInfoMNCKey; //移动网络代码
extern NSString *const kATDeviceDataInfoMCCKey; //移动国家代码
extern NSString *const kATDeviceDataInfoLanguageKey; //语言
extern NSString *const kATDeviceDataInfoTimeZoneKey; //时区
extern NSString *const kATDeviceDataInfoUserAgentKey; //用户代理
extern NSString *const kATDeviceDataInfoOrientKey; //屏幕方向
extern NSString *const kATDeviceDataInfoIDFAKey; //IDFA
extern NSString *const kATDeviceDataInfoIDFVKey; //IDFV

typedef NS_ENUM(NSUInteger, ATSplashAdClickResultType) {
    ATSplashAdClickResultTypeDidCloseAd         = 1,  // 点击跳转按钮后关闭开屏广告
    ATSplashAdClickResultTypePauseCountdown     = 2,  // 点击跳转按钮后暂停倒计时，开屏广告可见时继续倒计时
};

/// 用于测试地理位置的调试值
typedef NS_ENUM(NSInteger, ATUMPDebugGeography) {
    ATUMPDebugGeographyDisabled = 0,  ///< 禁用地理位置调试
    ATUMPDebugGeographyEEA = 1,       ///< 调试设备的地理位置显示为在EEA区域内
    ATUMPDebugGeographyNotEEA = 2,    ///< 调试设备的地理位置显示为在EEA区域外
};

typedef NS_ENUM(NSInteger, ATSystemPlatformType) {
    ATSystemPlatformTypeUnknown = 0,
    ATSystemPlatformTypeIOS = 1,
    ATSystemPlatformTypeUnity = 2,
    ATSystemPlatformTypeCocos2dx = 3,
    ATSystemPlatformTypeCocosCreator = 4,
    ATSystemPlatformTypeReactNative = 5,
    ATSystemPlatformTypeFlutter = 6,
    ATSystemPlatformTypeAdobeAir = 7
};

@interface ATSDKGlobalSetting : NSObject

+ (instancetype)sharedManager;

/*
 channel和customData必须在初始化之前设置
 */
@property (nonatomic, strong) NSString *channel;
@property (nonatomic, strong) NSString *subchannel;
@property (nonatomic, strong) NSDictionary *customData;
/// 开屏广告摇动文本字符串，仅用于DirectlyAd
@property (nonatomic, strong) NSString *directlySplashAdShakeTextString;
/// 开屏广告CTA按钮背景颜色，仅用于DirectlyAd
@property (nonatomic, strong) UIColor *directlySplashAdCTAButtonBackgroundColor;
/// 开屏广告自定义摇动视图，仅用于DirectlyAd
@property (nonatomic, strong) UIView *directlySplashAdCustomShakeView;
/// 开屏广告自定义CTA视图，仅用于DirectlyAd
@property (nonatomic, strong) UIView *directlySplashAdCustomCTAView;
/// 开屏广告视频静音图标是否隐藏，默认不隐藏，仅用于DirectlyAd
@property (nonatomic, assign) BOOL directlySplashAdVideoMuteIconHidden;
/// 点击开屏广告跳转后是否暂停倒计时，默认为NO，仅用于TopOn ADX、DirectlyAd和Cross Promotion
@property (nonatomic, assign) ATSplashAdClickResultType splashAdClickResultType;

// UMP测试设备ID
@property (nonatomic, nullable,strong) NSArray<NSString *> *umpTestDeviceIdentifiers;
/// 调试地理位置
@property (nonatomic, assign) ATUMPDebugGeography umpGeography;
/// 设置Header Bidding测试模式，仅支持传入设备IDFA
/// 使用前必须开启setLogEnabled
@property (nonatomic, strong) NSString *headerBiddingTestModeDeviceID;
/// 系统平台信息
@property (nonatomic, assign) ATSystemPlatformType systemPlatformType;

@property (nonatomic, strong) ATSharePlacementConfig *sharePlacementConfig;
/// 设置是否安装微信
@property (nonatomic, assign) BOOL isInstallWX;
/// 用于setLocationLongitude:dimension:
@property (nonatomic, readonly) NSDictionary *locationDictionary;

/// 为广告位设置自定义数据
/// @param customData - 自定义数据
/// @param placementID - 广告位ID
- (void)setCustomData:(NSDictionary *)customData forPlacementID:(NSString *)placementID;

/// 获取自定义数据
- (NSDictionary *)customDataForPlacementID:(NSString *)placementID;

/// 设置微信AppID和通用链接，用于注册微信开放SDK
/// @param appID - 微信AppID
/// @param universalLink - 微信通用链接
- (void)setWeChatAppID:(NSString *)appID universalLink:(NSString *)universalLink;

- (void)addCustomAdapterConfigArray:(NSArray <ATCustomNetworkMode *>*)array;

/// 设置SDK过滤广告的AppleID列表
- (void)setExludeAppleIdArray:(NSArray *)appleIdArray;

/// 获取过滤的AppleID列表
- (NSArray *)exludeAppleIdArray;

/// 设置SDK控制上报的拒绝上传信息列表
- (void)setDeniedUploadInfoArray:(NSArray *)uploadInfoArray;

/// 获取拒绝上传信息列表
- (NSArray *)deniedUploadInfoArray;

/// 判断是否包含被拒绝的key
/// @param key - key字符串
- (BOOL)isContainsForDeniedUploadInfoArray:(NSString *)key;

- (void)setPresetPlacementConfigPathBundle:(NSBundle *)bundle;

/// 设置地理位置经纬度
- (void)setLocationLongitude:(double)longitude dimension:(double)dimension;

- (void)setDebuggerConfig:(void(^_Nullable)(ATDebuggerConfig * _Nullable debuggerConfig))debuggerConfigBlock;

- (void)setDeviceInfoConfig:(void(^_Nullable)(ATDeviceInfoConfig * _Nullable deviceInfoConfig))deviceInfoConfigBlock;

/// 删除指定广告位的所有缓存广告
- (void)removeAllCacheWithPlacementId:(NSString *)placementId;
- (void)removeAllCacheWithPlacementId:(NSString *)placementId index:(NSInteger)index;

- (ATCustomContentInfo *)customContentReviewResult:(NSArray<ATCustomContentInfo *> *)infos;
@end
```
