---
title: "ATAdManager (Native)"
source: "https://help.toponad.net/cn/docs/ATAdManager-Native"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Category", "ATAdManager (Native)"]
content_sha256: "ed0c158b237d30d9f9301fc81d6a0dea6b3cabd802f3b5d13feb81ced843e716"
knowledge_role: "reference_only"
has_article_body: true
---

# ATAdManager (Native)

> 针对原生广告的操作拓展，提供广告展示、检查缓存、检查广告是否就绪、场景统计等功能，其中有Extra键的定义。

复制代码

```
// 原生广告资源键值定义
extern NSString *const kATNativeADAssetsAdvertiserKey;  // 广告主
extern NSString *const kATNativeADAssetsMainTextKey;    // 广告描述
extern NSString *const kATNativeADAssetsMainTitleKey;   // 广告标题
extern NSString *const kATNativeADAssetsMainImageKey;   // 主图
extern NSString *const kATNativeADAssetsIconImageKey;   // 图标
extern NSString *const kATNativeADAssetsLogoImageKey;   // Logo图片
extern NSString *const kATNativeADAssetsCTATextKey;     // 行动号召文案
extern NSString *const kATNativeADAssetsRatingKey;      // 评分
extern NSString *const kATNativeADAssetsContainsVideoFlag;  // 是否包含视频
extern NSString *const kATNativeADAssetsUnitIDKey;      // 广告单元ID
extern NSString *const kATNativeADAssetsIconURLKey;     // 图标URL
extern NSString *const kATNativeADAssetsImageURLKey;    // 图片URL
extern NSString *const kATNativeADAssetsLogoURLKey;     // Logo URL
extern NSString *const kATNativeADAssetsVideoUrlKey;    // 视频URL
extern NSString *const kATAdAssetsCustomObjectKey;      // 自定义对象
extern NSString *const kATNativeADAssetsMediaViewKey;   // 媒体视图
extern NSString *const kATNativeADAssetsImageListKey;   // 图片列表
extern NSString *const kATNativeADAssetsVideoDurationKey;  // 视频时长
extern NSString *const kATNativeADAssetsVideoAspectRatioKey;  // 视频宽高比
extern NSString *const kATNativeADAssetsNativeExpressAdViewWidthKey;   // 模板广告视图宽度
extern NSString *const kATNativeADAssetsNativeExpressAdViewHeightKey;  // 模板广告视图高度
extern NSString *const kATNativeADAssetsInteractionTypeKey;   // 交互类型
extern NSString *const kATNativeADAssetsVideoMutedTypeKey;    // 视频静音类型
extern NSString *const kATNativeADAssetsMainImageWidthKey;    // 主图宽度
extern NSString *const kATNativeADAssetsMainImageHeightKey;   // 主图高度
extern NSString *const kATNativeADAssetsMediaExtKey;          // 媒体扩展
extern NSString *const kATNativeADAssetsSourceKey;            // 广告来源
extern NSString *const kATNativeADAssetsCommentNumKey;        // 评论数
extern NSString *const kATNativeADAssetsAppSizeKey;           // 应用大小
extern NSString *const kATNativeADAssetsAppPriceKey;          // 应用价格
extern NSString *const kATNativeADAssetsDomainKey;            // 域名
extern NSString *const kATNativeADAssetsWarningKey;           // 警告信息
extern NSString *const kATNativeADAssetsIsExpressAdKey;       // 是否为模板广告

// 目前仅广点通支持以下两个键
extern NSString *const kATExtraInfoNativeAdSizeKey;  // 值必须是 NSValue 包装的 CGSize 对象
extern NSString *const kATExtraInfoNativeAdTypeKey;   // 广点通原生广告必需的值，必须是 NSNumber 包装的 ATGDTNativeAdType(NSInteger)；模板广告传 @(ATGDTNativeAdTypeTemplate)(@1)，自渲染广告传 @(ATGDTNativeAdTypeSelfRendering)(@2)

// 以下键值仅被 nend 支持  TODO_待优化至Nend Adapter
extern NSString *const kATExtraInfoNativeAdUserIDKey;
extern NSString *const kATExtraInfoNativeAdMediationNameKey;
extern NSString *const kATExtraInfoNaitveAdUserFeatureKey;
extern NSString *const kATExtraInfoNativeAdLocationEnabledFlagKey;

extern NSString *const kATNativeAdSizeToFitKey;

// 广点通原生广告类型枚举
typedef NS_ENUM(NSInteger, ATGDTNativeAdType) {
    ATGDTNativeAdTypeTemplate = 1,        // 模板广告
    ATGDTNativeAdTypeSelfRendering = 2    // 自渲染广告
};

@class ATNativeADView;
@class ATNativeADConfiguration;
@class ATNativeAdOffer;

// 百度模板渲染属性代理协议
@protocol ATBaiduTemplateRenderingAttributeDelegate <NSObject>

@optional
// Logo配置属性
@property (nonatomic, strong) NSString *iconWidth;      // 图标宽度
@property (nonatomic, strong) NSString *iconHeight;     // 图标高度
@property (nonatomic, strong) NSString *iconLeft;       // 图标左边距
@property (nonatomic, strong) NSString *iconTop;        // 图标顶部边距
@property (nonatomic, strong) NSString *iconRight;      // 图标右边距
@property (nonatomic, strong) NSString *iconBottom;     // 图标底部边距

// 标题配置属性
[... 其余属性配置项保持原样，因为它们都是自描述的 ...]

@end

@interface ATAdManager (Native)

/// 获取原生广告素材
- (nullable ATNativeAdOffer *)getNativeAdOfferWithPlacementID:(NSString *)placementID;

/// 获取原生广告素材
/// @param placementID - TopOn 广告位ID
/// @param scene - 场景ID
- (nullable ATNativeAdOffer *)getNativeAdOfferWithPlacementID:(NSString *)placementID
                                               scene:(NSString *)scene;

- (nullable ATNativeAdOffer *)getNativeAdOfferWithPlacementID:(NSString *)placementID
                                          showConfig:(ATShowConfig *)showConfig;

/// 检查原生广告是否准备就绪
- (BOOL)nativeAdReadyForPlacementID:(NSString *)placementID;

/// 获取当前广告位的状态对象 ATCheckLoadModel
/// v5.7.06+
- (ATCheckLoadModel *)checkNativeLoadStatusForPlacementID:(NSString *)placementID;

/// 查询广告位的所有缓存信息
/// v5.7.53+
- (nullable NSArray<NSDictionary *> *)getNativeValidAdsForPlacementID:(NSString *)placementID;

/// 设置百度模板渲染属性
- (void)setBaiduTemplateRenderingAttribute:(id<ATBaiduTemplateRenderingAttributeDelegate>)baiduTemplateRenderingAttribute;

/// 在业务场景中录入当前广告位缓存状态统计
/// @param scene - 广告场景
/// v5.7.91+
- (void)entryNativeScenarioWithPlacementID:(NSString *)placementID
                                     scene:(NSString *)scene;

@end
```
