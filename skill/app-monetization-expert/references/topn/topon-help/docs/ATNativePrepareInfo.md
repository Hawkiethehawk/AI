---
title: "ATNativePrepareInfo"
source: "https://help.toponad.net/cn/docs/ATNativePrepareInfo"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Class", "ATNativePrepareInfo"]
content_sha256: "12cf979bd791d58544d36d5e38d0d4a91a59108a592c54449aa78633f5ea35a5"
knowledge_role: "reference_only"
has_article_body: true
---

# ATNativePrepareInfo

> 原生广告准备信息类，用于配置原生广告各个UI组件的引用，包括文本标签、图片视图、媒体容器、交互按钮等，开发者通过这个类来关联自定义UI组件与广告内容。

复制代码

```
@interface ATNativePrepareInfo : NSObject

// 广告基本信息展示组件
@property(nonatomic, strong) UILabel *advertiserLabel;     // 广告主名标签
@property(nonatomic, strong) UILabel *textLabel;           // 广告描述文本标签
@property(nonatomic, strong) UILabel *titleLabel;          // 广告标题标签
@property(nonatomic, strong) UILabel *ctaLabel;            // 行动召唤标签（如"立即下载"）
@property(nonatomic, strong) UILabel *ratingLabel;         // 评分标签

// 广告图片相关组件
@property(nonatomic, strong) UIImageView *iconImageView;   // 图标图片视图
@property(nonatomic, strong) UIImageView *mainImageView;   // 主图片视图
@property(nonatomic, strong) UIImageView *logoImageView;   // Logo图片视图

// 广告交互组件
@property(nonatomic, strong) UIButton *dislikeButton;      // 不喜欢按钮
@property(nonatomic, strong) UIView *mediaView;            // 媒体视图（用于视频等）

// 广告附加信息组件
@property(nonatomic, strong) UILabel *domainLabel;         // 域名标签
@property(nonatomic, strong) UILabel *warningLabel;        // 警告标签

// 媒体容器视图
@property(nonatomic, strong) UIView *mediaContainerView;   // 媒体内容容器视图

/**
 * 加载广告准备信息
 * @param loadPrepareInfoBlock 配置广告准备信息的回调块
 * @return 配置完成的广告准备信息实例
 */
+ (instancetype)loadPrepareInfo: (void(^)(ATNativePrepareInfo *prepareInfo))loadPrepareInfoBlock;

@end
```
