---
title: "ATAdLoadingDelegate"
source: "https://help.toponad.net/cn/docs/ATAdLoadingDelegate"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Protocol", "ATAdLoadingDelegate"]
content_sha256: "6a0ed83e5ab2c36118039aef05e0c6a9632f982e94a7936ce22e55d04c999a92"
knowledge_role: "reference_only"
has_article_body: true
---

# ATAdLoadingDelegate

> 广告的基础代理回调声明，包括广告位与广告源级别的加载成功或失败回调，以及竞价广告源的竞价结束与竞价失败回调。其中@optional下方的方法为可选项。
>
> 关于部分代理方法中的extra参数，您可以[点击这里](https://help.toponad.com/cn/docs/uECwtr)查看详情。

复制代码

```
@protocol ATAdLoadingDelegate<NSObject>

/// 成功加载广告时的回调
/// - Parameter placementID: 广告位ID
- (void)didFinishLoadingADWithPlacementID:(NSString *)placementID;

/// 加载广告失败时的回调
/// - Parameter placementID: 广告位ID
/// - Parameter error: 含错误信息的对象
- (void)didFailToLoadADWithPlacementID:(NSString*)placementID
                                 error:(NSError*)error;

@optional

/// 获取展示收益
/// - Parameters:
///   - placementID: 广告位ID
///   - extra: 额外参数，用于开发者接收获取信息
- (void)didRevenueForPlacementID:(NSString *)placementID
                              extra:(NSDictionary *)extra;

/// 对应广告位中某一个广告源开始加载广告的回调
/// - Parameter placementID: 广告位ID
/// - Parameter extra: 广告源的具体信息
- (void)didStartLoadingADSourceWithPlacementID:(NSString *)placementID
                                         extra:(NSDictionary*)extra;
/// 对应广告位中某一个广告源加载广告成功的回调
/// - Parameter placementID: 广告位ID
/// - Parameter extra: 广告源的具体信息
- (void)didFinishLoadingADSourceWithPlacementID:(NSString *)placementID
                                          extra:(NSDictionary*)extra;

/// 对应广告位中某一个广告源加载广告失败的回调
/// - Parameter placementID: 广告位ID
/// - Parameter extra: 广告源的具体信息
/// - Parameter error: 含错误信息的对象
- (void)didFailToLoadADSourceWithPlacementID:(NSString*)placementID
                                       extra:(NSDictionary*)extra
                                       error:(NSError*)error;

/// 对应广告位中某一个竞价广告源开始竞价的回调
/// - Parameter placementID: 广告位ID
/// - Parameter extra: 广告源的具体信息
- (void)didStartBiddingADSourceWithPlacementID:(NSString *)placementID
                                         extra:(NSDictionary*)extra;

/// 对应广告位中某一个竞价广告源竞价成功的回调
/// - Parameter placementID: 广告位ID
/// - Parameter extra: 广告源的具体信息
- (void)didFinishBiddingADSourceWithPlacementID:(NSString *)placementID
                                          extra:(NSDictionary*)extra;

/// 对应广告位中某一个竞价广告源竞价失败的回调
/// - Parameter placementID: 广告位ID
/// - Parameter extra: 广告源的具体信息
/// - Parameter error: 含错误信息的对象
- (void)didFailBiddingADSourceWithPlacementID:(NSString*)placementID
                                        extra:(NSDictionary*)extra
                                        error:(NSError*)error;

@end
```
