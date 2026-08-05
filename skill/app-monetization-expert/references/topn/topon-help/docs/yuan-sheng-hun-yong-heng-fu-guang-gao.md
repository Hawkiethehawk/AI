---
title: "自定义横幅广告"
source: "https://help.toponad.net/cn/docs/yuan-sheng-hun-yong-heng-fu-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-12-09"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "广告样式", "横幅广告", "自定义横幅广告"]
content_sha256: "c289ca5492fcc9dfcae683031d00b9882e27fd247c5e058807dd7f1dcecd6625"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义横幅广告

## 1. 说明

使用横幅广告位配置原生广告。

请前往[这里](/cn/docs/QXxkrR#6._%E5%B9%BF%E5%91%8A%E6%A0%B7%E5%BC%8F%E6%B7%B7%E7%94%A8%EF%BC%88%E5%B9%BF%E5%91%8A%E6%B7%B7%E5%87%BA%EF%BC%89)查看本功能的支持范围

## 2. 如何使用

1. 管理后台创建**横幅**广告位，并添加或编辑支持广告样式混用的广告源



2. 如果后台选择由TopOn渲染(SDK渲染)，此时UI元素无法自行设置布局，您需要正确指定banner容器大小即可，无需修改代码，可跳过以下步骤。

3. 如果后台选择自渲染，需要额外集成代码，请先阅读本注意事项后再进行代码对接。

> 若您后台配置采用自渲染方案，请注意以下几点：
>
> - 拿到UI元素自行配置布局，调用展示若没有触发show回调，则表示您渲染的UI元素不够，或是布局存在问题，导致广告平台判定为无效展示，您需要根据实际情况调整以满足广告平台要求。
> - 没在代码实现自渲染返回广告View，则会默认用SDK内置的布局样式进行渲染。
> - 有在代码设置自渲染返回广告View时，则广告背景默认是全透明。
> - 对下图的mainImageView或mediaView的处理，它们的布局是一致的，当mediaView有值时，布局mediaView并显示在最上方。

4.建议渲染的元素与图例说明如下：

> 广告元素有些必须渲染，有些则是可选渲染，详情请参考本篇末尾
> 广告元素字段不一定有值，使用前需要判空



## 3. 示例代码

> 请注意，自渲染的布局不要超出后台选择 banner 的尺寸，否则会导致无法响应点击事件！

objc
复制代码

```
#import <Masonry/Masonry.h>

- (void)showBanner {
    // 展示前判断广告是否准备好
    if ([[ATAdManager sharedManager] bannerAdReadyForPlacementID:@"your banner placementID"]) {
         // 移除可能存在的旧BannerView
        NSInteger tag = 3333;
        [[self.view viewWithTag:tag] removeFromSuperview];
         //Retrieve banner view

        ATShowConfig *showConfig = ATShowConfig.new;
        //若没有场景配置，使用默认场景可传入空字符串
        showConfig.scene = @"your scene id";
        //展示时透传参数
        showConfig.showCustomExt = @"testShowCustomExt";
        __weak __typeof(self)weakSelf = self;

        ATBannerView *bannerView = [[ATAdManager sharedManager] retrieveBannerViewForPlacementID:@"your banner ad id"
                                                                config:showConfig
                                                                nativeMixBannerViewBlock:^(ATNativeBannerView * _Nonnull nativeBannerView) {
                                                                //TopOn后台选择自渲染时，由您进行ATNativeBannerView的约束设置 ，选择TopOn渲染则不会回调
                                                                        [weakSelf developerSlefRender:nativeBannerView];
                                                               }];

        if (bannerView != nil) {
            bannerView.delegate = self;
            bannerView.presentingViewController = self;
            bannerView.translatesAutoresizingMaskIntoConstraints = NO;
            bannerView.tag = tag;
            [self.view addSubview:bannerView];
            //Layour banner
            [self.view addConstraint:[NSLayoutConstraint constraintWithItem:self.view attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:bannerView attribute:NSLayoutAttributeCenterX multiplier:1.0f constant:.0f]];
            [self.view addConstraint:[NSLayoutConstraint constraintWithItem:bannerView attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeTop multiplier:1.0f constant:CGRectGetHeight([UIApplication sharedApplication].statusBarFrame) + CGRectGetHeight(self.navigationController.navigationBar.frame)]];
            [self.view addConstraint:[NSLayoutConstraint constraintWithItem:bannerView attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeNotAnAttribute multiplier:1.0f constant:_adSize.width]];
            [self.view addConstraint:[NSLayoutConstraint constraintWithItem:bannerView attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeNotAnAttribute multiplier:1.0f constant:_adSize.height]];
        } else {
        NSLog(@"Banner ad's not ready for placementID:%@", @"your banner placementID");
    }
}

 - (void)developerSlefRender:(ATNativeBannerView *)nativeBannerView {

    // 只渲染部分作为示例
    [nativeBannerView mas_remakeConstraints:^(MASConstraintMaker *make) {
        make.width.mas_equalTo(350);
        make.height.mas_equalTo(150);
        make.center.mas_equalTo(nativeBannerView.superview);
    }];

    [nativeBannerView.textLabel mas_remakeConstraints:^(MASConstraintMaker *make) {
        make.left.mas_equalTo(nativeBannerView);
        make.right.mas_equalTo(nativeBannerView);
        make.height.mas_equalTo(30);
        make.bottom.mas_equalTo(nativeBannerView.mas_bottom).offset(-5);
    }];

    [nativeBannerView.titleLabel mas_remakeConstraints:^(MASConstraintMaker *make) {
        make.left.mas_equalTo(nativeBannerView);
        make.right.mas_equalTo(nativeBannerView);
        make.height.mas_equalTo(30);
        make.bottom.mas_equalTo(nativeBannerView.textLabel.mas_top).offset(-5);
    }];

      //布局默认"广告"logo
    [nativeBannerView.adLabel mas_remakeConstraints:^(MASConstraintMaker *make) {
        make.top.mas_equalTo(nativeBannerView);
        make.right.mas_equalTo(nativeBannerView);
        make.height.mas_equalTo(30);
        make.width.mas_equalTo(50);
    }];

    // 获取广告平台logo原始对象，可能获取到"广告"字样的视图，这是因为部分平台的 logo 对象获取失败了。
    id networkLogoView = nativeBannerView.netWorkOptionView;
    // SDK>= 6.4.92 布局广告平台的logo,可能无法正确获取，或者其内容不符合预期，因此需要判断。请注意仍然不能保证平台的logo正常显示，因此建议至少兜底显示adLabel对象
    if (networkLogoView && ([networkLogoView isKindOfClass:UIImageView.class]) && ((UIImageView *)networkLogoView).image) {
        nativeBannerView.adLabel.hidden = YES;

        [nativeBannerView.netWorkOptionView mas_remakeConstraints:^(MASConstraintMaker *make) {
            make.top.mas_equalTo(nativeBannerView);
            make.right.mas_equalTo(nativeBannerView);
            make.height.mas_equalTo(30);
            make.width.mas_equalTo(50);
        }];

        [nativeBannerView bringSubviewToFront:nativeBannerView.netWorkOptionView];
    }

    // 添加点击注册控件
    NSMutableArray *regisArray = [NSMutableArray array];
    if (nativeBannerView.textLabel) {
        [regisArray addObject:nativeBannerView.textLabel];
    }

    if (nativeBannerView.titleLabel) {
        [regisArray addObject:nativeBannerView.titleLabel];
    }
    [nativeBannerView registerClickableViewArray:regisArray];
}
```

## 4. UI元素列表

> 对于建议渲染的组件，如果您选择不渲染，需要确认该广告平台的展示曝光回调是否正常触发。

| API元素 | 类型 | 是否渲染 | 渲染要求说明 |
| --- | --- | --- | --- |
| titleLabel (对应title) | UILabel | 建议渲染 | 广告标题，建议显示 |
| textLabel (对应mainText) | UILabel | 可选 | 广告描述文字，根据UI空间决定 |
| ctaLabel (对应ctaText) | UILabel | 可选 | 行动号召按钮文字 |
| advertiserLabel (对应advertiser) | UILabel | 条件必选 | 使用Yandex平台时必须渲染 |
| iconImageView (对应iconUrl/icon) | UIImageView | 建议渲染 | 广告图标，建议显示 |
| logoImageView | UIImageView | 条件必选 | 6.4.92版本以上改用netWorkOptionView，请参考netWorkOptionView字段说明 |
| mainImageView (对应imageUrl/mainImage) | UIImageView | 建议渲染 | 不渲染需确认展示曝光回调 |
| adImageView | UIImageView | 建议渲染 | 广告"Ad"标识图片 |
| ratingLabel (对应rating) | UILabel | 可选 | 评分信息 |
| sponsorLabel | UILabel | 可选 | 赞助商信息 |
| domainLabel (对应domain) | UILabel | 条件必选 | 仅Yandex平台必须渲染 |
| warningLabel (对应warning) | UILabel | 条件必选 | 仅Yandex平台必须渲染 |
| dislikeButton | UIButton | 建议渲染 | 通用关闭按钮，建议保留 |
| netWorkMediaView (对应videoUrl) | UIView | 建议渲染 | 视频广告时建议添加，不渲染需确认展示曝光回调 |
| netWorkMediaBackView | UIView | 可选 | 媒体视图的背景，当没有MediaView和主图mainImageView时，才会创建这个视图 |
| netWorkOptionView | UIView | 建议渲染 | 广告平台logo视图，如果不为空，建议渲染，同时不建议隐藏adLabel，因为即使本字段有值也可能没有图片 |
| adLabel | UILabel | 默认渲染 | "广告"字样标识，用于兜底无法获取广告平台 logo 图片或者 logo view 对象的情况，不建议隐藏 |
