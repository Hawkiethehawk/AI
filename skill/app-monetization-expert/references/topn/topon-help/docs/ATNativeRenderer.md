---
title: "ATNativeRenderer"
source: "https://help.toponad.net/cn/docs/ATNativeRenderer"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATNativeRenderer"]
content_sha256: "19bd6911d6207f15b5437718b4ae44a3e6dc47920bc76575ccb5d5f651834955"
knowledge_role: "reference_only"
has_article_body: true
---

# ATNativeRenderer

> 原生渲染器类，负责管理和渲染原生广告的视图组件，提供了媒体视图、摇晃视图和滑动视图等多种展示形式，并支持视频播放控制。

复制代码

```
@class ATNativeADCache;
NS_ASSUME_NONNULL_BEGIN
@protocol ATNativeADRenderer;

@interface ATNativeRenderer : NSObject<ATNativeADRenderer>

// 获取广告视图
-(UIView*)retriveADView;

// 记录自定义播放器状态和当前播放时间
- (void)recordCustomPlayerStatus:(ATPlayerStatus)status currentTime:(NSTimeInterval)time;

// 使用配置和广告视图初始化渲染器
-(instancetype) initWithConfiguraton:(ATNativeADConfiguration*)configuration adView:(ATNativeADView*)adView;

// 创建媒体视图
-(__kindof UIView*)createMediaView;

// 广告视图（弱引用）
@property(nonatomic, weak) ATNativeADView *ADView;

// 广告配置（只读）
@property(nonatomic, readonly) ATNativeADConfiguration *configuration;

// 获取网络媒体视图
- (UIView *)getNetWorkMediaView;

// 获取网络摇晃视图
- (UIView *)getNetWorkShakeView:(ATNativeADCache *)offer frame:(CGRect)frame;

// 获取网络滑动视图
- (UIView *)getNetworkSlideViewWithOffer:(ATNativeADCache *)offer
                                  frame:(CGRect)frame
                                repeat:(int)repeat
                        animationWidth:(CGFloat)animationWidth
                       animationHeight:(CGFloat)animationHeight;

// 以下方法用于子类重写
// 关闭操作
- (void)closeAct;

// 设置视频自动播放类型
- (void)setVideoAutoPlay:(NSInteger)autoPlayType;

// 销毁摇晃视图
- (void)shakeViewDestroy:(UIView *)shakeView;

@end
```
