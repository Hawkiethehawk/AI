---
title: "自定义插屏广告"
source: "https://help.toponad.net/cn/docs/down_zi-ding-yi-cha-ping-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "广告样式", "插屏广告", "自定义插屏广告"]
content_sha256: "f1925eaef82967210088e380ef969f4d8c2a3c5943a1ed66bb503bad6c0670b0"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义插屏广告

## 1. 说明

使用插屏广告位配置原生广告源

请前往[这里](/cn/docs/QXxkrR#6._%E5%B9%BF%E5%91%8A%E6%A0%B7%E5%BC%8F%E6%B7%B7%E7%94%A8%EF%BC%88%E5%B9%BF%E5%91%8A%E6%B7%B7%E5%87%BA%EF%BC%89)查看本功能的支持范围

## 2. 开发者后台配置

- 管理后台创建**插屏**广告位，并添加或编辑支持广告样式混用的广告源
  
- 决定渲染方式，如果选择SDK渲染，不用额外添加集成代码。选择开发者自渲染需要添加额外的集成代码
  

## 3. SDK配置

- 若配置选择**SDK渲染**：由SDK内置的布局样式进行渲染，不用额外设置代码
- 若配置选择开发者自渲染：**不使用SDK内置的布局样式，自定义样式渲染广告**。在广告展示时使用以下方法：

**步骤 1，展示插屏广告时，使用以下 API**

> **SDK 版本 >= v6.4.94版本**
>
> objc
> 复制代码
>
> ```
> [[ATAdManager sharedManager] showInterstitialWithPlacementID:self.currentPlacementIDInfoModel.placementIDString showConfig:config inViewController:inViewController delegate:self nativeMixViewBlock:^(ATNativeMixInterstitialView * _Nonnull selfRenderingMixInterstitialView) {
>    [weakSelf renderSelfWith:selfRenderingMixInterstitialView];
> }];
> ```

> **SDK 版本 <= v6.4.93版本**
>
> objc
> 复制代码
>
> ```
> [[ATAdManager sharedManager] showInterstitialWithPlacementID:@"your placement id" scene:@"your scene id" inViewController:inViewController delegate:self nativeMixViewBlock:^(ATSelfRenderingMixInterstitialView * _Nonnull selfRenderingMixInterstitialView) {
>    [weakSelf renderSelfWith:selfRenderingMixInterstitialView];
> }];
> ```

**步骤 2，在nativeMixViewBlock:中对组件进行赋值并布局，示例如下:**
**SDK 版本 >= v6.4.94版本**

objc
复制代码

```
- (void)renderSelfWith:(ATNativeMixInterstitialView *)selfRenderingMixInterstitialView {
    // 三方自定义渲染插屏
    [selfRenderingMixInterstitialView.ctaLabel mas_remakeConstraints:^(MASConstraintMaker *make) {
        make.bottom.mas_equalTo(-100);
        make.centerX.mas_equalTo(selfRenderingMixInterstitialView);
        make.size.mas_equalTo(CGSizeMake(300, 50));
    }];

    // 图标
    [selfRenderingMixInterstitialView.iconImageView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.size.mas_equalTo(CGSizeMake(50, 50));
        make.left.equalTo(selfRenderingMixInterstitialView.ctaLabel.mas_left);  make.bottom.equalTo(selfRenderingMixInterstitialView.ctaLabel.mas_top).offset(-20);
    }];

    // 标题
    [selfRenderingMixInterstitialView.titleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.height.equalTo(@25);
        make.left.equalTo(selfRenderingMixInterstitialView.iconImageView.mas_right).offset(18);
        make.top.equalTo(selfRenderingMixInterstitialView.iconImageView.mas_top);
        make.width.equalTo(selfRenderingMixInterstitialView.ctaLabel.mas_width).offset(-50 - 20);
    }];

    // 文本
    [selfRenderingMixInterstitialView.textLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(selfRenderingMixInterstitialView.titleLabel.mas_left);
        make.width.equalTo(selfRenderingMixInterstitialView.titleLabel.mas_width);
        make.height.equalTo(@38);
        make.bottom.equalTo(selfRenderingMixInterstitialView.iconImageView.mas_bottom);
    }];

    NSMutableArray *clickArray = [NSMutableArray array];
    [clickArray addObject:selfRenderingMixInterstitialView.titleLabel];
    [clickArray addObject:selfRenderingMixInterstitialView.textLabel];
    [clickArray addObject:selfRenderingMixInterstitialView.iconImageView];
    [clickArray addObject:selfRenderingMixInterstitialView.mainImageView];
    [selfRenderingMixInterstitialView registerClickableViewArray:clickArray];
}
```

**SDK 版本 <= v6.4.93版本**

objc
复制代码

```
- (void)renderSelfWith:(ATSelfRenderingMixInterstitialView *)selfRenderingMixInterstitialView {

    CGRect rect = selfRenderingMixInterstitialView.frame;

    UIImageView *bigImage = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, rect.size.width, rect.size.height)];
    [bigImage setContentMode:UIViewContentModeScaleAspectFit];
    [bigImage sd_setImageWithURL:[NSURL URLWithString:selfRenderingMixInterstitialView.mainImageURLString]];
    [selfRenderingMixInterstitialView addSubview:bigImage];

    UIView *mediaView = [selfRenderingMixInterstitialView networkMediaView];
    if (mediaView) {
        mediaView.frame = CGRectMake(0, 0, rect.size.width, rect.size.height);
        [selfRenderingMixInterstitialView addSubview:mediaView];
    }

    UIView *optionView = [selfRenderingMixInterstitialView networkOptionsView];
    if (optionView) {
        optionView.frame = CGRectMake(0, rect.size.height - 30, 25, 25);
        [selfRenderingMixInterstitialView addSubview:optionView];
    }

    UIImageView *iconImage = [[UIImageView alloc] initWithFrame:CGRectMake(20, rect.size.height - 200, 80, 80)];
    [iconImage setContentMode:UIViewContentModeScaleAspectFit];
    [iconImage sd_setImageWithURL:[NSURL URLWithString:selfRenderingMixInterstitialView.iconImageURLString]];
    [selfRenderingMixInterstitialView addSubview:iconImage];
    iconImage.layer.masksToBounds = YES;
    iconImage.layer.cornerRadius = 8;

    UILabel *label = [[UILabel alloc] init];
    label.text = selfRenderingMixInterstitialView.titleString;
    label.textColor = [UIColor whiteColor];
    label.frame = CGRectMake(120, rect.size.height - 190, 200, 30);
    [selfRenderingMixInterstitialView addSubview:label];

    UILabel *label2 = [[UILabel alloc] init];
    label2.text = selfRenderingMixInterstitialView.textString;
    label2.textColor = [UIColor whiteColor];
    label2.frame = CGRectMake(120, rect.size.height - 160, 200, 30);
    [selfRenderingMixInterstitialView addSubview:label2];

    UILabel *domainLabel = [[UILabel alloc] init];
    domainLabel.text = selfRenderingMixInterstitialView.domainString;
    domainLabel.textColor = [UIColor whiteColor];
    domainLabel.frame = CGRectMake(0, rect.size.height - 50, 200, 10);
    [selfRenderingMixInterstitialView addSubview:domainLabel];

    UILabel *sponsoredLabel = [[UILabel alloc] init];
    sponsoredLabel.text = selfRenderingMixInterstitialView.sponsorString;
    sponsoredLabel.textColor = [UIColor whiteColor];
    sponsoredLabel.frame = CGRectMake(120, rect.size.height - 30, 200, 30);
    [selfRenderingMixInterstitialView addSubview:sponsoredLabel];

    UILabel *label3 = [[UILabel alloc] init];
    label3.text = selfRenderingMixInterstitialView.ctaString;
    label3.textColor = [UIColor whiteColor];
    label3.frame = CGRectMake(120, rect.size.height - 90, 200, 40);
    [selfRenderingMixInterstitialView addSubview:label3];
    label3.layer.masksToBounds = YES;
    label3.layer.cornerRadius = 20;
    label3.backgroundColor = [UIColor blueColor];
    label3.textAlignment = NSTextAlignmentCenter;

    ATSelfRenderingMixInterstitialModel *mixInterstitialModel = [ATSelfRenderingMixInterstitialModel loadMixInterstitialModel:^(ATSelfRenderingMixInterstitialModel * _Nonnull mixInterstitialModel) {
        mixInterstitialModel.titleLabel = label;
        mixInterstitialModel.textLabel = label2;
        mixInterstitialModel.ctaView = label3;
        mixInterstitialModel.iconImageView = iconImage;
        mixInterstitialModel.domainLabel = domainLabel;
        mixInterstitialModel.advertiserLabel = sponsoredLabel;
    }];
    [selfRenderingMixInterstitialView bindViewRelation:mixInterstitialModel];

    if (mediaView) {
        [selfRenderingMixInterstitialView registerClickableViewArray:@[label,bigImage,mediaView,label2,label3,iconImage]];
    } else {
        [selfRenderingMixInterstitialView registerClickableViewArray:@[label,bigImage,label2,label3,iconImage]];
    }
}
```

> 温馨提示：
>
> 1. 当您在后台设置开发者自渲染方式时，如果没在代码实现自渲染布局，则会默认用SDK内置的布局样式进行渲染。
> 2. 当您后台设置开发者自渲染方式并且有在代码设置自渲染布局时，广告背景默认是全透明的，您需要自行实现半屏和全屏的效果。
