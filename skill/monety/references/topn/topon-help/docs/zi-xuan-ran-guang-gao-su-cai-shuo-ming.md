---
title: "自渲染广告注意事项"
source: "https://help.toponad.net/cn/docs/zi-xuan-ran-guang-gao-su-cai-shuo-ming"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-10-10"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "广告样式", "原生广告", "自渲染广告注意事项"]
content_sha256: "3e7cd0075f1119f8e6f88fa95b005e1a480b3f1898475a004820aa78e04a390b"
knowledge_role: "reference_only"
has_article_body: true
---

# 自渲染广告注意事项

## 1. 关注展示成功的代理回调

此因部分广告平台不一定存在所有的素材信息，导致您获取值时可能会出现值为空的情况。此时，您需要**关注展示成功的代理回调**，如果**没有触发到展示成功的回调**，可能被广告平台判断为无效的展示，需要您检查UI素材是否添加，或重新设计样式布局以满足成功展示的要求。

objc
复制代码

```
// Native ads displayed successfully
// 展示成功的代理回调
- (void)didShowNativeAdInAdView:(ATNativeADView *)adView
                    placementID:(NSString *)placementID
                          extra:(NSDictionary *)extra;
```

## 2. 获取并处理mediaView

objc
复制代码

```
    // 获取mediaView
    UIView *mediaView = [nativeADView getMediaView];

    if (mediaView) {
        // 通常有视频内容时无需绑定mediaView到点击事件
        //[clickableViewArray addObject:mediaView];

        mediaView.frame = CGRectMake(0, kNavigationBarHeight + 150.0f, kScreenW, kScreenH - kNavigationBarHeight - 150);
        // 添加mediaView
        [selfRenderView addSubview:mediaView];
    }

    ......

    [nativeADView registerClickableViewArray:clickableViewArray];
```

请执行上述获取mediaView操作，是否有返回值由广告平台确定。

当您没有获取mediaView，控制台中会出现以下警告，触发以下警告我们会进行自动兜底渲染，如您发现和自己布局的代码有出入时，请检查控制台的日志信息。

> The current integration is wrong, Please follow the document to integrate.

> 出现上述集成错误的可能原因有：没有调用loadPrepareInfo、没有调用getMediaView、广告offer为模版广告

若不希望添加mediaView，此时，您要关注广告展示后，根据是否有展示成功的回调，来判断是否为有效展示，如未收到回调，则需要您进行添加，然后再次观察是否展示成功。

## 3. 设置广告平台logo

SDK 6.2.95 版本之后内部会在自渲染原生广告视图内添加广告平台logo视图。

### 3.1 设置布局

代码示例如下：

objc
复制代码

```
1.初始化SDK后调用设置偏好位置：
    [ATAPI sharedInstance].preferredAdLogoPosition = ATAdLogoPositionBottomRightCorner;

2.调整第三方广告平台 SDK 内置自带的logo位置

    ATNativeADConfiguration *config = [[ATNativeADConfiguration alloc] init];
    // 设置frame方式，可以与下方Masonry设置方式选择一种即可
    config.logoViewFrame = CGRectMake(<#CGFloat x#>, <#CGFloat y#>, <#CGFloat width#>, <#CGFloat height#>);

    // 获取原生广告展示容器视图
    ATNativeADView *nativeADView = [[ATNativeADView alloc] initWithConfiguration:config currentOffer:offer placementID:self.placementID];

   // Masonry方式，与上方设置frame方式选择一种即可
    //渲染广告
    [offer rendererWithConfiguration:config selfRenderView:selfRenderView nativeADView:nativeADView];

    //精确设置logo大小以及位置(Masonry方式)，与上方手动布局方式选择一种即可，请在渲染广告之后调用
    [nativeADView.logoImageView mas_remakeConstraints:^(MASConstraintMaker *make) {
        make.right.bottom.mas_equalTo(nativeADView).mas_offset(-10);
        make.width.height.mas_equalTo(20);
    }];
    //Masonry精确设置logo后调用
    [nativeADView setNeedsLayout];
    //Masonry精确设置logo后调用
    [nativeADView layoutIfNeeded];
```

> - 若您未设置自定义布局，SDK内部会根据 [ATAPI sharedInstance].preferredAdLogoPosition; 来设置一片固定大小的正方形区域来展示logo（可能导致样式拉伸，此时建议使用上面布局代码设置一下）。

### 3.2 隐藏logo

> 我们建议您不要隐藏广告平台提供的logo图片，因为可能违反广告平台原生广告规范，从而影响您的收益。

objc
复制代码

```
// 获取原生广告展示容器视图
ATNativeADView *nativeADView = [[ATNativeADView alloc] initWithConfiguration:config currentOffer:offer placementID:self.placementID];
// 渲染广告
[offer rendererWithConfiguration:config selfRenderView:selfRenderView nativeADView:nativeADView];
// 需要在render之后调用
nativeADView.logoImageView.hidden = YES;
```

## 4. UI元素列表

> 再次提醒您：集成原生自渲染由于样式需求不相同，要着重关注广告展示后，是否有展示的代理回调，以保证广告展示的有效性。

| UI 物料 | 返回类型 | 说明 | 接入建议 |
| --- | --- | --- | --- |
| title | NSString | 广告标题 | **建议渲染** |
| mainText | NSString | 广告描述 | **可选** |
| ctaText | NSString | 广告CTA按钮文字 | **可选** |
| advertiser | NSString | 广告主名称 | **条件必选（Yandex平台必选）** |
| iconUrl | NSString | 广告图标url | **建议渲染** |
| logoUrl | NSString | 广告平台logo标识url | **必选** |
| imageUrl | NSString | 大图url | **建议渲染** |
| imageList | NSArray | 图片数组 | **可选** |
| mainImageWidth | CGFloat | 大图宽度 | 无 |
| mainImageHeight | CGFloat | 大图高度 | 无 |
| icon | UIImage | 广告图标图片 | **建议渲染** |
| logo | UIImage | 广告平台logo图片 | **必选** |
| mainImage | UIImage | 大图图片 | **建议渲染(原生横幅样式需参考展示曝光是否回调)** |
| isVideoContents | BOOL | 是否为视频广告 | 无 |
| videoUrl | NSString | 视频url | **获取getMediaView添加到视图** |
| videoDuration | NSInteger | 视频时长 | 无 |
| videoAspectRatio | CGFloat | 视频尺寸比例 | 无 |
| interactionType | NSInteger | 广告支持的跳转类型 | 无 |
| mediaExt | NSDictionary | 媒体扩展数据 | 无 |
| source | NSString | 应用来源、市场 | 无 |
| rating | NSNumber | 广告的评分 | **可选** |
| commentNum | NSInteger | 评论数量 | **可选** |
| appSize | NSInteger | 广告安装包体大小 | **可选** |
| appPrice | NSString | app购买价格 | **可选** |
| domain | NSString | 域名 | **条件必选（Yandex平台必选）** |
| warning | NSString | 警告 | **条件必选（Yandex平台必选）** |

视频广告是通过mediaView播放视频，您可以通过以下API获取。一部分广告平台在mediaView中显示他们的coverImage，一部分会同时展示mediaView与imageView。

> 部分广告平台视频播放完毕后，会出现一个遮罩层位于mediaView中。此时可能会出现UI拉伸的情况，广告平台不支持设置此遮罩位置和大小，您可能需要重新设计以避免该遮罩拉伸的情况。

objc
复制代码

```
// 获取mediaView
UIView *mediaView = [nativeADView getMediaView];
```

## 5. 广告平台规范要求案例

### 5.1 穿山甲信息流广告

- **穿山甲**需要渲染**titleLabel**或**textLabel**
- **穿山甲**至少需要渲染一张图片，即需要渲染**iconImageView**或**mainImageView**或**mediaView**
- **穿山甲的AdLogo**一定要显示

**ATImageLoader**：SDK提供的，用于显示网络图片 **（可选）**

| 方法 | 参数 | 说明 |
| --- | --- | --- |
| loadImageWithURL | (NSURL URL) | 显示网络图片 URL：网络图片url |
