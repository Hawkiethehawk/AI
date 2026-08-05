---
title: "ATRewardedVideoDelegate"
source: "https://help.toponad.net/cn/docs/ATRewardedVideoDelegate"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "常用信息速查", "Protocol", "ATRewardedVideoDelegate"]
content_sha256: "074c1fa5c8702f49eaff2b216b976c6257154733b67ed1815bd4800a61161691"
knowledge_role: "reference_only"
has_article_body: true
---

# ATRewardedVideoDelegate

> 针对激励视频广告类型的代理回调，包括展示、点击和关闭等。
>
> 关于部分代理方法中的extra参数，您可以[点击这里](https://help.toponad.com/cn/docs/uECwtr)查看详情。

复制代码

```
extern NSString *const kATRewardedVideoAgainFlag;

@protocol ATRewardedVideoDelegate<ATAdLoadingDelegate>

/// 激励视频广告开始播放
- (void)rewardedVideoDidStartPlayingForPlacementID:(NSString *)placementID
                                             extra:(NSDictionary *)extra;

/// 激励视频广告播放结束
- (void)rewardedVideoDidEndPlayingForPlacementID:(NSString *)placementID
                                           extra:(NSDictionary *)extra;

/// 激励视频广告被点击
- (void)rewardedVideoDidClickForPlacementID:(NSString *)placementID
                                      extra:(NSDictionary *)extra;

/// 激励视频广告关闭
- (void)rewardedVideoDidCloseForPlacementID:(NSString *)placementID
                                   rewarded:(BOOL)rewarded
                                      extra:(NSDictionary *)extra;

/// 激励视频广告发放奖励
- (void)rewardedVideoDidRewardSuccessForPlacemenID:(NSString *)placementID
                                             extra:(NSDictionary *)extra;

@optional

/// 激励视频广告播放失败
- (void)rewardedVideoDidFailToPlayForPlacementID:(NSString *)placementID
                                           error:(NSError *)error
                                           extra:(NSDictionary *)extra;

/// 激励视频广告点击跳转是否以Deeplink形式打开
/// 注意：仅支持TopOn Adx广告
- (void)rewardedVideoDidDeepLinkOrJumpForPlacementID:(NSString *)placementID
                                               extra:(NSDictionary *)extra
                                              result:(BOOL)success;

#pragma mark - 再看一次激励视频

/// 再看一次激励视频广告开始播放
- (void)rewardedVideoAgainDidStartPlayingForPlacementID:(NSString *)placementID
                                                  extra:(NSDictionary *)extra;

/// 再看一次激励视频广告播放结束
- (void)rewardedVideoAgainDidEndPlayingForPlacementID:(NSString *)placementID
                                                extra:(NSDictionary *)extra;

/// 再看一次激励视频广告播放失败
- (void)rewardedVideoAgainDidFailToPlayForPlacementID:(NSString *)placementID
                                                error:(NSError *)error
                                                extra:(NSDictionary *)extra;

/// 再看一次激励视频广告被点击
- (void)rewardedVideoAgainDidClickForPlacementID:(NSString *)placementID
                                           extra:(NSDictionary *)extra;

/// 再看一次激励视频广告发放奖励
- (void)rewardedVideoAgainDidRewardSuccessForPlacemenID:(NSString *)placementID
                                                  extra:(NSDictionary *)extra;
@end
```
