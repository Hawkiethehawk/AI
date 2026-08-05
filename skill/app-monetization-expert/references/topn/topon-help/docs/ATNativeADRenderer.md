---
title: "ATNativeADRenderer"
source: "https://help.toponad.net/cn/docs/ATNativeADRenderer"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Protocol", "ATNativeADRenderer"]
content_sha256: "57a26620b8c5e3201dbd458de08b8369f76632dc9236d80f14164d2afc60c325"
knowledge_role: "reference_only"
has_article_body: true
---

# ATNativeADRenderer

复制代码

```
@protocol ATNativeADRenderer<NSObject>
/**
 可能返回 nil。
 */
-(__kindof UIView*)createMediaView;

/**
 将资源渲染到相关的广告视图上。采用者以特定于网络的方式实现此方法。
 */
-(void)renderOffer:(ATNativeADCache*)offer;

/**
 * 渲染的广告是否为视频广告。
 */
-(BOOL)isVideoContents;

/**
 * 视频广告播放的时长，单位毫秒
 */
- (CGFloat)videoPlayTime;

/**
 * 视频广告总时长，单位毫秒
 */
- (CGFloat)videoDuration;

/**
 * 播放静音开关
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

/// 销毁网络原生广告
- (void)destroyNative;

- (ATNativeAdType)getNativeAdType;

- (ATNativeAdRenderType)getCurrentNativeAdRenderType;

/**
 * 清除广告缓存
 */
-(void)clearAdCache;

/// 用于绑定 customEvent
- (void)bindCustomEvent;

/**
 * 设置自渲染广告的 AdChoicesView 背景颜色。
 * @param color 视图颜色
 */
- (void)setAdChoicesViewColor:(UIColor *)color;

/**
 * 此引用应作为弱引用保留，因为广告视图会强引用其渲染器。
 * 添加此属性是为了 renderAssets: 方法可以直接访问它。
 */
@property(nonatomic, weak) ATNativeADView *ADView;

@end
```
