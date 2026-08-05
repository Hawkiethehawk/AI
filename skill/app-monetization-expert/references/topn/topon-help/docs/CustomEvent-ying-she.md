---
title: "CustomEvent映射"
source: "https://help.toponad.net/cn/docs/CustomEvent-ying-she"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "自定义广告平台", "自定义广告平台 SDK 版本 < 6.4.94", "自定义原生广告", "CustomEvent映射"]
content_sha256: "8bfda42edd09d7b9bba47a80b5b02f8aaa9b45f431463ea5d0f3dfcda4ed4e6a"
knowledge_role: "reference_only"
has_article_body: true
---

# CustomEvent映射

- 您需要使用下列示例API来完成映射。

复制代码

```
    NSMutableArray<nsdictionary>* assetArray = [NSMutableArray<nsdictionary> array];
    NSMutableDictionary *assetDic = [NSMutableDictionary dictionary];
    [assetDic setValue:xxx forKey:kATAdAssetsCustomEventKey];
    [assetDic setValue:xxx forKey:kATAdAssetsDelegateObjKey];
    [assetDic setValue:xxx forKey:kATAdAssetsCustomObjectKey];
    [assetDic setValue:xxx forKey:kATNativeADAssetsIsExpressAdKey];
    [assetArray addObject:assetDic];
    [self trackNativeAdLoaded:assetArray];</nsdictionary></nsdictionary>
```

字段说明如下：

| key | required | type | description |
| --- | --- | --- | --- |
| kATAdAssetsCustomEventKey | YES | NSObject | 广告展示后，接收广告代理事件的对象 |
| kATNativeADAssetsUnitIDKey | NO | NSString | 三方广告平台的代码位id |
| kATAdAssetsCustomObjectKey | YES | id | 三方平台返回的广告对象(数据) |

- **原生模板信息流**还需要映射的key：

| key | required | type | description |
| --- | --- | --- | --- |
| kATNativeADAssetsIsExpressAdKey | YES | BOOL | 原生信息流广告的类型，模板广告必须设置 |
| kATNativeADAssetsNativeExpressAdViewWidthKey | NO | NSNumber | 模板广告视图的宽度 |
| kATNativeADAssetsNativeExpressAdViewHeightKey | NO | NSNumber | 模板广告视图的高度 |

- **原生自渲染信息流**还需要映射的key，映射之后才能在获取到的广告offer拿到相应的值，如果不需要或者没有的值，可以不用传入，如下：

| key | required | type | description |
| --- | --- | --- | --- |
| kATNativeADAssetsIsExpressAdKey | NO | BOOL | 原生信息流广告的类型，默认为自渲染广告类型 |
| kATNativeADAssetsMainTitleKey | NO | NSString | 广告的标题 |
| kATNativeADAssetsMainTextKey | NO | NSString | 广告的描述 |
| kATNativeADAssetsIconURLKey | NO | NSString | 广告的icon图片的URL地址 |
| kATNativeADAssetsIconImageKey | NO | UIImage | 广告的icon图片 |
| kATNativeADAssetsImageURLKey | NO | NSString | 广告的大图片的URL地址 |
| kATNativeADAssetsMainImageKey | NO | UIImage | 广告的大图片 |
| kATNativeADAssetsCTATextKey | NO | NSString | 广告的cta文案 |
| kATNativeADAssetsRatingKey | NO | NSString | 广告的评级分 |
| kATNativeADAssetsAdvertiserKey | NO | NSString | 广告的广告主 |
| kATNativeADAssetsContainsVideoFlag | NO | BOOL | 是否为视频类广告 |
| kATNativeADAssetsLogoURLKey | NO | NSString | 广告的logo图片的URL地址 |
| kATNativeADAssetsLogoImageKey | NO | UIImage | 广告的logo图片 |
