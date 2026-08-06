---
title: "ATNativeADConfiguration"
source: "https://help.toponad.net/cn/docs/ATNativeADConfiguration"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATNativeADConfiguration"]
content_sha256: "589eddf03e818c75623d13f05259583d0daf9035137c772d9c7ac28ec351c9b1"
knowledge_role: "reference_only"
has_article_body: true
---

# ATNativeADConfiguration

> 原生广告配置类，用于设置广告的显示尺寸、播放行为、渲染方式等参数。

复制代码

```
// 视频播放类型枚举
typedef NS_ENUM(NSUInteger, ATNativeADConfigVideoPlayType) {
    ATNativeADConfigVideoPlayAlwaysAutoPlayType  = 0,    // 始终自动播放
    ATNativeADConfigVideoPlayOnlyWiFiAutoPlayType,       // 仅在WiFi环境下自动播放
    ATNativeADConfigVideoPlayClickAutoPlayType,          // 点击后自动播放
};

// Facebook支持的广告选项视图框架键(CGRect包装为NSValue)
extern NSString *const kATNativeAdConfigurationContextAdOptionsViewFrameKey;

// 广点通和百度支持的广告logo视图框架键(CGRect包装为NSValue)，默认显示在左上角
extern NSString *const kATNativeAdConfigurationContextAdLogoViewFrameKey;

// 百度支持的网络logo视图框架键(CGRect包装为NSValue)，默认显示在右下角
extern NSString *const kATNativeAdConfigurationContextNetworkLogoViewFrameKey;

@protocol ATNativeADDelegate;
@class ATNativePrepareInfo;

@interface ATNativeADConfiguration : NSObject

/**
 * 可以在此字典中存储一些特定网络的额外上下文信息
 */
@property(nonatomic) NSDictionary *context;
@property(nonatomic) Class renderingViewClass;            // 渲染视图类
@property(nonatomic) CGRect ADFrame;                      // 广告尺寸
@property(nonatomic) CGRect mediaViewFrame;               // 媒体视图尺寸
@property(nonatomic, weak) UIViewController *rootViewController;  // 根视图控制器
@property(nonatomic, weak) id<ATNativeADDelegate> delegate;      // 代理
@property(nonatomic) BOOL sizeToFit;                     // 是否自适应大小
@property(nonatomic) BOOL useCustomPlayer;               // 是否使用自定义播放器

// 视频自动播放控制，仅TopOnAdx自渲染支持
@property (nonatomic, assign) ATNativeADConfigVideoPlayType videoPlayType;

@property(nonatomic, strong) ATNativePrepareInfo *nativePrepareInfo;  // 原生广告准备信息

@property (nonatomic, assign) CGRect logoViewFrame;      // logo视图尺寸

@end
```
