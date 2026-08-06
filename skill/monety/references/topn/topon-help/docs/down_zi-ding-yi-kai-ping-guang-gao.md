---
title: "自定义开屏广告"
source: "https://help.toponad.net/cn/docs/down_zi-ding-yi-kai-ping-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-24"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "广告样式", "开屏广告", "自定义开屏广告"]
content_sha256: "160a9e89c097ca621efc6cacd517fae822af14fd5380cc40b4d9c7676a1478e3"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义开屏广告

## 1. 说明

使用开屏广告位配置原生广告源。

请前往[这里](/cn/docs/QXxkrR#6._%E5%B9%BF%E5%91%8A%E6%A0%B7%E5%BC%8F%E6%B7%B7%E7%94%A8%EF%BC%88%E5%B9%BF%E5%91%8A%E6%B7%B7%E5%87%BA%EF%BC%89)查看本功能的支持范围

## 2. 开发者后台配置

- 管理后台创建**开屏**广告位，并添加或编辑支持广告样式混用的广告源



- 决定渲染方式，如果选择SDK渲染，不用额外添加集成代码。选择开发者自渲染需要添加额外的集成代码
  

## 3. SDK配置

- **SDK渲染**：由SDK内置的布局样式进行渲染，不用额外设置代码。
- **开发者自渲染： 不使用SDK内置的布局样式，自定义样式渲染广告。需要额外添加代码，具体步骤如下:**

**步骤 1，展示开屏广告时，调用以下 API**

> **SDK 版本 >= v6.4.94版本**
>
> objc
> 复制代码
>
> ```
> __weak __typeof(self)weakSelf = self;
> [[ATAdManager sharedManager] showSplashWithPlacementID:xxx config:xxx window:xxx inViewController:xxx extra:xxx delegate:self nativeMixViewBlock:^(ATNativeMixSplashView * _Nonnull selfRenderingMixSplashView) {
>     [weakSelf renderSelfWith:selfRenderingMixSplashView];
> }];
> ```

> **SDK 版本 <= v6.4.93版本**
>
> objc
> 复制代码
>
> ```
> __weak __typeof(self)weakSelf = self;
> [[ATAdManager sharedManager] showSplashWithPlacementID:xxxx config:xxx window:xxx inViewController:xxx extra:xxx delegate:xxx nativeMixViewBlock:^(ATSelfRenderingMixSplashView * _Nonnull selfRenderingMixSplashView) {
>      [weakSelf renderSelfWith:selfRenderingMixSplashView];
> }];
> ```

**步骤 2，在`nativeMixViewBlock:^(ATSelfRenderingMixSplashView * _Nonnull selfRenderingMixSplashView)`回调中，通过获取`ATSelfRenderingMixSplashView`对象进行布局，例如:**

> **SDK 版本 >= v6.4.94版本**
>
> objc
> 复制代码
>
> ```
> //v6.4.94以及以上版本：
> ```objc
> - (void)renderSelfWith:(ATNativeMixSplashView *)selfRenderingMixSplashView {
>     self.selfRenderingMixSplashView = selfRenderingMixSplashView;
>
>     CGFloat imageHW = 20;
>
>     [selfRenderingMixSplashView.ctaLabel mas_remakeConstraints:^(MASConstraintMaker *make) {
>         make.center.equalTo(selfRenderingMixSplashView);
>         make.size.mas_equalTo(CGSizeMake(100, 48));
>     }];
>
>     // 图标
>     [selfRenderingMixSplashView.iconImageView mas_makeConstraints:^(MASConstraintMaker *make) {
>         make.size.mas_equalTo(CGSizeMake(imageHW, imageHW));
>         make.left.equalTo(selfRenderingMixSplashView.ctaLabel.mas_left);
>         make.bottom.equalTo(selfRenderingMixSplashView.ctaLabel.mas_top).offset(-20);
>     }];
>
>
>     // 标题
>     [selfRenderingMixSplashView.titleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
>         make.height.equalTo(@25);
>         make.left.equalTo(selfRenderingMixSplashView.iconImageView.mas_right).offset(18);
>         make.top.equalTo(selfRenderingMixSplashView.iconImageView.mas_top);
>         make.width.equalTo(selfRenderingMixSplashView.ctaLabel.mas_width).offset(-imageHW - 20);
>     }];
>
>     // 文本
>     [selfRenderingMixSplashView.textLabel mas_makeConstraints:^(MASConstraintMaker *make) {
>         make.left.equalTo(selfRenderingMixSplashView.titleLabel.mas_left);
>         make.width.equalTo(selfRenderingMixSplashView.titleLabel.mas_width);
>         make.height.equalTo(@38);
>         make.bottom.equalTo(selfRenderingMixSplashView.iconImageView.mas_bottom);
>     }];
>
>     NSMutableArray *clickArray = [NSMutableArray array];
>     [clickArray addObject:selfRenderingMixSplashView.titleLabel];
>     [clickArray addObject:selfRenderingMixSplashView.textLabel];
>     [clickArray addObject:selfRenderingMixSplashView.iconImageView];
>     [clickArray addObject:selfRenderingMixSplashView.mainImageView];
>     if(selfRenderingMixSplashView.netWorkMediaView)
>     {
>         [clickArray addObject:selfRenderingMixSplashView.netWorkMediaView];
>     }
>     [selfRenderingMixSplashView registerClickableViewArray:clickArray];
> }
> ```

> **SDK 版本 <= v6.4.93版本**
>
> objc
> 复制代码
>
> ```
> //v6.4.93以及以下版本：
> - (void)renderSelfWith:(ATSelfRenderingMixSplashView *)selfRenderingMixSplashView {
>
>     self.selfRenderingMixSplashView = selfRenderingMixSplashView;
>
>     CGRect rect = selfRenderingMixSplashView.frame;
>
>     UIImageView *bigImage = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, rect.size.width, rect.size.height)];
>     [bigImage setContentMode:UIViewContentModeScaleAspectFit];
>     [bigImage sd_setImageWithURL:[NSURL URLWithString:selfRenderingMixSplashView.mainImageURLString]];
>     [selfRenderingMixSplashView addSubview:bigImage];
>
>     //媒体视图，必须获取
>     UIView *mediaView = [selfRenderingMixSplashView networkMediaView];
>     if (mediaView) {
>         mediaView.frame = CGRectMake(0, 0, rect.size.width, rect.size.height);
>         [selfRenderingMixSplashView addSubview:mediaView];
>     }
>
>     UIView *optionView = [selfRenderingMixSplashView networkOptionsView];
>     if (optionView) {
>         optionView.frame = CGRectMake(0, rect.size.height - 30, 25, 25);
>         [selfRenderingMixSplashView addSubview:optionView];
>     }
>
>     UIImageView *iconImage = [[UIImageView alloc] initWithFrame:CGRectMake(20, rect.size.height - 200, 80, 80)];
>     [iconImage setContentMode:UIViewContentModeScaleAspectFit];
>     [iconImage sd_setImageWithURL:[NSURL URLWithString:selfRenderingMixSplashView.iconImageURLString]];
>     [selfRenderingMixSplashView addSubview:iconImage];
>     iconImage.layer.masksToBounds = YES;
>     iconImage.layer.cornerRadius = 8;
>
>     UILabel *label = [[UILabel alloc] init];
>     label.text = selfRenderingMixSplashView.titleString;
>     label.textColor = [UIColor whiteColor];
>     label.frame = CGRectMake(120, rect.size.height - 190, 200, 30);
>     [selfRenderingMixSplashView addSubview:label];
>
>     UILabel *label2 = [[UILabel alloc] init];
>     label2.text = selfRenderingMixSplashView.textString;
>     label2.textColor = [UIColor whiteColor];
>     label2.frame = CGRectMake(120, rect.size.height - 160, 200, 30);
>     [selfRenderingMixSplashView addSubview:label2];
>
>     UILabel *domainLabel = [[UILabel alloc] init];
>     domainLabel.text = selfRenderingMixSplashView.domainString;
>     domainLabel.textColor = [UIColor whiteColor];
>     domainLabel.frame = CGRectMake(0, rect.size.height - 50, 200, 10);
>     [selfRenderingMixSplashView addSubview:domainLabel];
>
>     UILabel *sponsoredLabel = [[UILabel alloc] init];
>     sponsoredLabel.text = selfRenderingMixSplashView.sponsorString;
>     sponsoredLabel.textColor = [UIColor whiteColor];
>     sponsoredLabel.frame = CGRectMake(120, rect.size.height - 30, 200, 30);
>     [selfRenderingMixSplashView addSubview:sponsoredLabel];
>
>     UILabel *label3 = [[UILabel alloc] init];
>     label3.text = selfRenderingMixSplashView.ctaString;
>     label3.textColor = [UIColor whiteColor];
>     label3.frame = CGRectMake(120, rect.size.height - 90, 200, 40);
>     [selfRenderingMixSplashView addSubview:label3];
>     label3.layer.masksToBounds = YES;
>     label3.layer.cornerRadius = 20;
>     label3.backgroundColor = [UIColor blueColor];
>     label3.textAlignment = NSTextAlignmentCenter;
>
>     //自渲染摇一摇视图添加，仅部分广告平台支持，且需要在第三方广告平台那边开通权限
>     UIView *shakeView = [selfRenderingMixSplashView getNetworkShakeViewWithFrame:CGRectMake(rect.size.width * 0.5, rect.size.height * 0.5, 100, 100)];
>     [selfRenderingMixSplashView addSubview:shakeView];
>     self.shakeView = shakeView;
>
>     if (是否自定义跳过按钮) {
>         CGFloat w = 80;
>         UIButton *slef_skipBtn = [[UIButton alloc] init];
>         self.skipButton = slef_skipBtn;
>         slef_skipBtn.frame = CGRectMake(rect.size.width-w, 60, w, 30);
>         [slef_skipBtn addTarget:self action:@selector(skipAction) forControlEvents:UIControlEventTouchUpInside];
>         [slef_skipBtn setTitle:@"关闭" forState:UIControlStateNormal];
>         [selfRenderingMixSplashView addSubview:slef_skipBtn];
>     }
>
>     NSLog(@"开发者自渲染:domainString:%@---sponsorString:%@",selfRenderingMixSplashView.domainString,selfRenderingMixSplashView.sponsorString);
>
>     ATSelfRenderingMixSplashModel *mixInterstitialModel = [ATSelfRenderingMixSplashModel loadMixSplashModel:^(ATSelfRenderingMixSplashModel * _Nonnull mixSplashModel) {
>         mixSplashModel.titleLabel = label;
>         mixSplashModel.textLabel = label2;
>         mixSplashModel.ctaLabel = label3;
>         if (是否自定义跳过按钮) {
>             mixSplashModel.skipButton = self.skipButton;
>         }
>         mixSplashModel.iconImageView = iconImage;
>         mixSplashModel.domainLabel = domainLabel;
>         mixSplashModel.advertiserLabel = sponsoredLabel;
>     }];
>
>     //绑定关联，必须调用
>     [selfRenderingMixSplashView bindViewRelation:mixInterstitialModel];
>
>     // 注册事件按钮，必须调用
>     if (mediaView) {
>         [selfRenderingMixSplashView registerClickableViewArray:@[label,bigImage,mediaView,label2,label3,iconImage]];
>     } else {
>         [selfRenderingMixSplashView registerClickableViewArray:@[label,bigImage,label2,label3,iconImage]];
>     }
> }
> ```

> **注意点：**
>
> ① 当在开发者后台设置开发者自渲染方式时，如果没在代码实现自渲染返回广告View，则会默认用SDK内置的布局样式进行渲染。
>
> ② 当在开发者后台设置开发者自渲染方式并且有在代码设置自渲染返回广告View时，则广告背景默认是全透明。
