---
title: "自定义客户端竞价（C2S）广告"
source: "https://help.toponad.net/cn/docs/zi-ding-yi-ke-hu-duan-jing-jia-C2S-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-01-19"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "高级设置说明", "自定义广告平台", "自定义广告平台 SDK 版本 >= 6.4.94", "自定义客户端竞价（C2S）广告"]
content_sha256: "d4f7ab78728ab1bcbbff2c9b658a5b7104991d7a13e77a2b011ad05703b001b5"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义客户端竞价（C2S）广告

## 概述

C2S（Client-to-Server）竞价是一种客户端竞价机制，允许广告适配器在客户端进行实时竞价，并将竞价结果回传给广告平台。本文档详细介绍了如何在自定义广告适配器中实现C2S竞价功能。

## 前置条件

> - SDK版本 >= **6.4.94**
> - 需要第三方广告SDK支持获取价格
> - 已参考[文档](https://help.toponad.net/cn/docs/Ee6uTinO)完成自定义 Adapter 的接入

## 实现步骤

### 步骤一：传递广告价格给TopOn SDK

> 在**自定义Adapter**对应的**Delegate**类中获取第三方广告SDK返回的价格，将价格通过我们指定的 **Key** 组装至字典对象，并**随着广告加载成功事件**将价格传递给**TopOn SDK**，您可以通过以下 **Key** 来组装价格字典：
>
> | Key | Value类型 | 说明 |
> | --- | --- | --- |
> | ATAdSendC2SCurrencyTypeKey | NSInteger | 币种的枚举值  美元=1  人民币元=2  人民币分=3 |
> | ATAdSendC2SBidPriceKey | NSString(字符串) | 价格 |
>
> 举例如下：
>
> objc
> 复制代码
>
> ```
>     //通过第三方广告 SDK 获取到了价格
>     NSInteger ecpm = [splashAd ecpm];
>     //用于保存C2S信息的字典
>     NSMutableDictionary *infoDic = [NSMutableDictionary dictionary];
>     //转为字符串,根据情况选择对应的精度
>     NSString *priceStr = [NSString stringWithFormat:@"%ld",ecpm];
>     NSString *logOriginalString = [NSString stringWithFormat:@"C2S Original priceStr :%@",priceStr];
>     //参数检查
>     if ([priceStr doubleValue] < 0) {
>         priceStr = @"0";
>     }
>     //传入价格字符串
>     [infoDic AT_setDictValue:priceStr key:ATAdSendC2SBidPriceKey];
>     //根据第三方广告 SDK 的价格单位，传入币种
>     [infoDic AT_setDictValue:@(ATBiddingCurrencyTypeCNYCents) key:ATAdSendC2SCurrencyTypeKey];
>     //此时infoDic就是最终所需要的字典了
> ```
>
> 您可以根据不同广告类型的自定义Adapter，通过以下方法来传入含有价格信息字典：
>
> | 方法名 | 参数说明 | 方法描述 |
> | --- | --- | --- |
> | - (void)atOnSplashAdLoadedExtra:(NSDictionary \* \_Nullable)adExtra | 额外信息字典 | 开屏广告加载成功，并可附带C2S价格信息 |
> | - (void)atOnInterstitialAdLoadedExtra:(NSDictionary \* \_Nullable)adExtra | 额外信息字典 | 插屏广告加载成功，并可附带C2S价格信息 |
> | - (void)atOnBannerAdLoadedWithView:(UIView \* \_Nullable)bannerView adExtra:(NSDictionary \* \_Nullable)adExtra | 1.第三方 SDK 的横幅广告对象  2.额外信息字典 | 横幅广告加载成功，并可附带C2S价格信息 |
> | - (void)atOnNativeAdLoadedArray:(NSArray <ATCustomNetworkNativeAd *>*)nativeObjectArray adExtra:(NSDictionary \*\_Nullable)adExtra | 1.已组装好的原生广告对象数组  2.额外信息字典 | 原生广告加载成功，并可附带C2S价格信息 |
> | - (void)atOnRewardedAdLoadedExtra:(NSDictionary \* \_Nullable)adExtra; | 额外信息字典 | 激励视频广告加载成功，并可附带C2S价格信息 |
>
> 以开屏广告为例:
>
> objc
> 复制代码
>
> ```
> #import <AnyThinkSDK/AnyThinkSDK.h>
>
> @implementation DemoCustomSplashDelegate
>
> /**
>  * 第三方 SDK 的开屏广告就绪回调
>  * 回传时机说明：本例中，第三方广告 SDK 的回调既可以拿到价格，同时也可以确认广告就绪
>  */
> - (void)msSplashAdReadySuccess:(MSSplashAd *)splashAd {
>     //通过第三方广告 SDK 获取到了价格
>     NSInteger ecpm = [splashAd ecpm];
>
>     NSMutableDictionary *infoDic = [NSMutableDictionary dictionary];
>
>     NSString *priceStr = [NSString stringWithFormat:@"%ld",ecpm];
>     NSString *logOriginalString = [NSString stringWithFormat:@"C2S Original priceStr :%@",priceStr];
>     NSLog(@"获取到广告价格:%@",logOriginalString);
>
>     if ([priceStr doubleValue] < 0) {
>         priceStr = @"0";
>     }
>
>     [infoDic AT_setDictValue:priceStr key:ATAdSendC2SBidPriceKey];
>     [infoDic AT_setDictValue:@(ATBiddingCurrencyTypeCNYCents) key:ATAdSendC2SCurrencyTypeKey];
>
>     NSString *logString = [NSString stringWithFormat:@"[Network:C2S]::%@",infoDic];
>     NSLog(@"获取到C2S信息:%@",logString);
>
>     //传递价格给聚合 SDK
>     [self.adStatusBridge atOnSplashAdLoadedExtra:extraDic];
> }
>
> ......
> ```
>
> **温馨提示**
>
> - 如果第三方广告 SDK 的广告加载成功回调在其返回价格回调之前，您可以在返回价格回调中通知我们
> - 如果第三方广告 SDK 的广告加载成功回调在其返回价格之后，您可以先使用实例变量保存价格，等待广告加载成功回调后再通知我们

### 步骤二：通知第三方广告 SDK 竞价结果

> 您需要在各广告类型的**自定义Adapter**类中实现以下方法：
>
> | 方法名 | 参数 | 说明 |
> | --- | --- | --- |
> | - (void)didReceiveBidResult:(ATBidWinLossResult \*)result | ATBidWinLossResult \*result | 聚合 SDK 发送的竞价结果回调 |
>
> #### ATBidWinLossResult 类说明
>
> `ATBidWinLossResult` 类用于表示竞价结果信息，包含竞价成功或失败的相关数据。
>
> #### ATBidWinLossResultType
>
> | 枚举值 | 数值 | 描述 |
> | --- | --- | --- |
> | `ATBidWinLossResultTypeWin` | 0 | 竞价成功 |
> | `ATBidWinLossResultTypeLoss` | 1 | 竞价失败 |
>
> #### ATBidWinLossResult属性说明
>
> | 属性名 | 类型 | 说明 | 备注 |
> | --- | --- | --- | --- |
> | `bidResultType` | `ATBidWinLossResultType` | **竞价结果类型** | 标识本次竞价是成功还是失败 |
> | `lossReasonType` | `ATBiddingLossType` | **失败原因类型** | 当竞价失败时，指明具体的失败原因 |
> | `winPrice` | `NSString *` | **获胜价格** | 竞价成功时的实际成交价格，币种与ATAdSendC2SCurrencyTypeKey中传入的一致 |
> | `secondPrice` | `NSString *` | **第二价格** | 竞价过程中的第二高出价，币种与ATAdSendC2SCurrencyTypeKey中传入的一致 |
> | `userInfoDic` | `NSDictionary *` | **用户信息字典** | 扩展信息 |
>
> #### ATBiddingLossType 枚举字段说明
>
> | 枚举值（枚举常量） | 整数值 | 说明 |
> | --- | --- | --- |
> | ATBiddingLossWithLowPriceInNormal | 103 | 普通出价过低导致的竞价失败 |
> | ATBiddingLossWithLowPriceInHB | 102 | Header Bidding 出价过低导致的竞价失败 |
> | ATBiddingLossWithBiddingTimeOut | 2 | 超时 |
> | ATBiddingLossWithExpire | 5 | 已过期 |
> | ATBiddingLossWithFloorFilter | 104 | 因未达到广告底价被过滤 |
> | ATBiddingLossWithKSClickOrShow | 8 | 向快手广告平台发送竞价失败的 Loss 通知 |
>
> ### 使用示例
>
> 以开屏广告为例:
>
> objc
> 复制代码
>
> ```
> @implementation DemoCustomSplashAdapter
>
> #pragma mark - 聚合 SDK 发送的竞价结果回调
> - (void)didReceiveBidResult:(ATBidWinLossResult *)result {
>     if (result.bidResultType == ATBidWinLossResultTypeWin) {
>         //本次竞胜了，这里调用第三方 SDK 代码告诉他们，所需的信息从result中取出
>
>
>     }else {
>         //本次竞败了，这里调用第三方 SDK 代码告诉他们，所需的信息从result中取出
>
>     }
> }
> ......
> ```
