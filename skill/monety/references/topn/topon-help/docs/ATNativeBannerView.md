---
title: "ATNativeBannerView"
source: "https://help.toponad.net/cn/docs/ATNativeBannerView"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATNativeBannerView"]
content_sha256: "45464126698e7899fbdddb040897b2ad62d3a1a7fc7044d97495d10bc91f35be"
knowledge_role: "reference_only"
has_article_body: true
---

# ATNativeBannerView

复制代码

```
//
//  ATNativeBannerView.h
//  AnyThinkSDK
//
//  Created by GUO PENG on 2023/6/8.
//  Copyright © 2023 AnyThink. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <AnyThinkSDK/ATScrollLabel.h>
#import <AnyThinkSDK/ATUnitGroupModel.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * 原生横幅广告尺寸类型枚举
 */
typedef NS_ENUM(NSInteger, ATNativeBannerSizeType) {
    ATNativeBannerSizeTypeSmall,   // 小尺寸：320 * 50
    ATNativeBannerSizeTypeMiddle,  // 中尺寸：320 * 90
    ATNativeBannerSizeTypeBig,     // 大尺寸：300 * 250
    ATNativeBannerSizeTypeLARGE,   // 超大尺寸：728 * 90
};

/**
 * 原生横幅广告视图类
 * 用于展示原生横幅广告的各个组件
 */
@interface ATNativeBannerView : UIView

#pragma mark - UI组件

/// 域名标签 - 显示广告来源域名 - Yandex广告平台必须使用
@property(nonatomic, strong) UILabel *domainLabel;

/// 警告标签 - 显示广告警告信息 - Yandex广告平台必须使用
@property(nonatomic, strong) UILabel *warningLabel;

/// 广告商标签 - 显示广告商名称
@property(nonatomic, strong) UILabel *advertiserLabel;

/// 广告内容标签 - 显示广告正文内容
@property(nonatomic, strong) UILabel *textLabel;

/// 广告标题标签 - 显示广告标题
@property(nonatomic, strong) UILabel *titleLabel;

/// 行动号召标签(CTA) - 显示下载等行动号召文本
@property(nonatomic, strong) UILabel *ctaLabel;

/// 评分标签 - 显示广告评分
@property(nonatomic, strong) UILabel *ratingLabel;

/// 赞助商标签 - 显示赞助商信息
@property(nonatomic, strong) UILabel *sponsorLabel;

/// 广告ad标识图片视图 - 显示广告ad标识图片
@property(nonatomic, strong) UIImageView *adImageView;

/// 图标视图 - 显示应用/广告商图标
@property(nonatomic, strong) UIImageView *iconImageView;

/// 主图视图 - 显示广告主图
@property(nonatomic, strong) UIImageView *mainImageView;

/// 广告商Logo视图 - 显示广告商Logo
@property(nonatomic, strong) UIImageView *logoImageView;

/// 不喜欢按钮/关闭按钮 - 用户可点击表示不感兴趣关闭广告
@property(nonatomic, strong) UIButton *dislikeButton;

/// 第三方SDK媒体视图 - 用于展示第三方广告SDK的媒体内容
@property (nonatomic, strong) UIView *netWorkMediaView;

/// 第三方SDK媒体背景视图 - 第三方媒体视图的背景，当没有MediaView和主图mainImageView时，会创建这个视图
@property (nonatomic, strong) UIView *netWorkMediaBackView;

/// 第三方SDK选项视图 - 第三方广告SDK提供的选项视图
@property (nonatomic, strong) UIView *netWorkOptionView;

#pragma mark - 广告属性

/// TopOn渲染展示横幅尺寸类型
@property (nonatomic, assign) ATNativeBannerSizeType nativeBannerSizeType;

/// 广告渲染类型
@property (nonatomic, assign) ATRenderingType nativeBannerRenderType;

#pragma mark - 方法

/**
 * 判断广告内容是否为视频类型
 * @return 是视频内容返回YES，否则返回NO
 */
- (BOOL)isVideoContents;

/**
 * 获取自渲染摇一摇视图
 * @param frame 视图frame
 * @return 摇一摇视图实例
 */
- (UIView *)getNetworkShakeViewWithFrame:(CGRect)frame;

/**
 * 为自渲染广告注册点击事件
 * @param registerClickViewArray 需要添加点击事件的视图数组
 */
- (void)registerClickableViewArray:(NSArray <UIView *>*)registerClickViewArray;

#pragma mark - 广告素材属性，对应于上方实例化的组件中的内容，这里是直接获取素材内容而不是组件

/// 配置字典 - 包含广告的各种配置信息
@property (nonatomic, strong) NSDictionary *configurationDic;

/// 图标图片 - 广告图标
@property (nonatomic, strong) UIImage *iconImage;

/// 广告商字符串 - 广告商名称
@property (nonatomic, strong) NSString *advertiserString;

/// 标题字符串 - 广告标题
@property (nonatomic, strong) NSString *titleString;

/// 内容字符串 - 广告正文内容
@property (nonatomic, strong) NSString *textString;

/// 行动号召字符串(CTA) - 如"立即下载"
@property (nonatomic, strong) NSString *ctaString;

/// 广告警告字符串 - 广告警示信息 - Yandex广告平台必须使用，与上方warningLabel对于选择其一
@property (nonatomic, strong) NSString *adWarnigString;

/// 域名字符串 - 广告来源域名 - Yandex广告平台必须使用，与上方domainLabel对于选择其一
@property (nonatomic, strong) NSString *domainString;

/// 图标图片URL字符串 - 图标图片地址
@property (nonatomic, strong) NSString *iconImageURLString;

/// 主图URL字符串 - 主图地址
@property (nonatomic, strong) NSString *mainImageURLString;

/// 赞助商字符串 - 赞助商信息
@property (nonatomic, strong) NSString *sponsorString;

/// 自定义扩展字符串 - 自定义扩展信息
@property (nonatomic, strong) NSString *customExtString;

/// Logo字符串 - Logo地址
@property (nonatomic, strong) NSString *logoString;

@end

NS_ASSUME_NONNULL_END
```
