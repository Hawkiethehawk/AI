---
title: "ATNativeADView"
source: "https://help.toponad.net/cn/docs/ATNativeADView"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATNativeADView"]
content_sha256: "e7df49e23b90666570006f1a53099dd06b50c2d8aadcf639148cf38fd3aa8207"
knowledge_role: "reference_only"
has_article_body: true
---

# ATNativeADView

> 原生广告视图类，负责原生广告的渲染和交互控制，提供视频播放控制、广告展示管理、点击追踪、特效动画（如摇晃和滑动）等，提供自渲染相关支持。

复制代码

```
@interface ATNativeADView : UIView<ATNativeRendering>

/**
 * 初始化子视图
 * 子类必须调用[super initSubviews]以确保广告视图正常工作
 * 调用此方法时，广告视图尚未完全准备就绪
 */
-(void)initSubviews;

/**
 * 为子视图创建约束
 * 如果使用自动布局，请在此方法中设置约束
 */
-(void)makeConstraintsForSubviews;

/**
 * 判断当前展示的广告是否为视频广告
 */
-(BOOL)isVideoContents;

/**
 * 获取实际渲染的广告视图
 * 务必使用此方法获取真实的广告视图
 */
-(ATNativeADView*)embededAdView;

/**
 * 返回用于跟踪点击的视图数组
 */
-(NSArray<UIView*>*)clickableViews;

// 广告代理
@property(nonatomic, weak) id<ATNativeADDelegate> delegate;

/**
 * 当前展示的原生广告对象（只读）
 */
@property(nonatomic, readonly) ATNativeAd *nativeAd;

/**
 * 原生广告的网络平台ID（只读）
 */
@property(nonatomic, readonly) NSInteger networkFirmID;

/**
 * 获取视频广告播放时长（毫秒）
 */
- (CGFloat)videoPlayTime;

/**
 * 获取视频广告总时长（毫秒）
 */
- (CGFloat)videoDuration;

/**
 * 设置是否静音播放
 * @param flag 是否静音
 */
- (void)muteEnable:(BOOL)flag;

/**
 * 播放视频广告
 */
- (void)videoPlay;

/**
 * 暂停视频广告
 */
- (void)videoPause;

/**
 * 销毁网络原生广告
 */
- (void)destroyNative;

/**
 * 获取原生广告类型
 */
- (ATNativeAdType)getNativeAdType;

/**
 * 获取原生广告渲染类型
 */
- (ATNativeAdRenderType)getCurrentNativeAdRenderType;

/**
 * 设置自渲染广告AdChoices视图的背景色
 * 仅支持Meta（Facebook）广告
 */
- (void)setAdChoicesViewColor:(UIColor *)color;

// 自渲染视图
@property(nonatomic, strong) UIView *selfRenderView;

// 记录自定义播放器状态
- (void)recordCustomPlayerStatus:(ATPlayerStatus)status currentTime:(NSTimeInterval)time;

// 使用原生广告准备信息进行准备
- (void)prepareWithNativePrepareInfo:(ATNativePrepareInfo *)nativePrepareInfo;

// 获取媒体视图
- (nullable UIView *)getMediaView;

// 获取原生摇晃视图
- (UIView *)getNetworkShakeViewWithFrame:(CGRect)frame;

/**
 * 初始化滑动组件（仅支持百度）
 * @param frame 组件frame
 * @param repeat 动画播放次数，-1为无限循环
 * @param animationWidth 动画区域宽度（不包括文本，不得超过frame尺寸）
 * @param animationHeight 动画区域高度（不包括文本，不得超过frame尺寸）
 */
- (UIView *)getNetworkSlideViewWithFrame:(CGRect)frame
                                 repeat:(int)repeat
                         animationWidth:(CGFloat)animationWidth
                        animationHeight:(CGFloat)animationHeight;

// 使用配置、当前广告订单和广告位ID初始化
- (instancetype)initWithConfiguration:(ATNativeADConfiguration*)configuration
                       currentOffer:(ATNativeAdOffer *)currentOffer
                       placementID:(NSString*)placementID;

// 更新广告视图配置
- (void)updateAdViewConfiguration:(ATNativeADConfiguration*)configuration
                    currentOffer:(ATNativeAdOffer *)currentOffer
                    placementID:(NSString*)placementID;

// 注册可点击视图数组
- (void)registerClickableViewArray:(NSArray *)registerClickViewArray;

@end
```
