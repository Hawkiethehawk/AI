---
title: "自定义Client Bidding广告"
source: "https://help.toponad.net/cn/docs/zi-ding-yi-Client-Bidding-guang-gao"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-07-23"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "高级设置说明", "自定义广告平台", "自定义Client Bidding广告"]
content_sha256: "0c566a52523d4d368fbbc3033b4450af250092e59d1d69b467234a823de23c71"
knowledge_role: "reference_only"
has_article_body: true
---

# 自定义Client Bidding广告

本章节以插屏广告为例，主要介绍如何自定义Adapter集成Client Bidding，更多自定义Adapter实现请参考 [自定义广告平台](https://help.toponad.net/cn/docs/ji-ben-liu-cheng)

Client Bidding加载流程如图：



## 1. 继承自定义Adapter类

Adapter需继承`CustomInterstitialAdapter`以实现Client Bidding功能。

java
复制代码

```
public class CustomSDKInterstitialAdapter extends CustomInterstitialAdapter {
    ...
}
```

---

## 2. 发起竞价

> - 在调用`ATInterstitialAd#load()`时，会调用到自定义Adapter的`startBiddingRequest()`方法
> - 您需重写startBiddingRequest()，在此方法中，调用自定义广告平台的API发起广告竞价

> - 在调用`TUInterstitialAd#load()`时，会调用到自定义Adapter的`startBiddingRequest()`方法
> - 您需重写startBiddingRequest()，在此方法中，调用自定义广告平台的API发起广告竞价

### 2.1 API说明

| 方法 | 说明 |
| --- | --- |
| boolean startBiddingRequest(Context context, Map<String, Object> serverExtra, Map<String, Object> localExtra, ATBiddingListener biddingListener) | 发起Client Bidding竞价请求，并通过biddingListener返回竞价结果，在此方法中发起头部竞价的请求，并将竞价结果通过`biddingListener#onC2SBiddingResultWithCache(ATBiddingResult bidResult,BaseAd baseAd)`通知TopOn SDK   **注意**: 此方法必需返回ture; **context**：上下文 **serverExtra**：服务端配置的自定义参数 **localExtra**：本次加载传入自定义参数 **biddingListener**：竞价结果回调 |

| 方法 | 说明 |
| --- | --- |
| boolean startBiddingRequest(Context context, Map<String, Object> serverExtra, Map<String, Object> localExtra, TUBiddingListener biddingListener) | 发起Client Bidding竞价请求，并通过biddingListener返回竞价结果，在此方法中发起头部竞价的请求，并将竞价结果通过`biddingListener#onC2SBiddingResultWithCache(TUBiddingResult bidResult,BaseAd baseAd)`通知TopOn SDK   **注意**: 此方法必需返回ture; **context**：上下文 **serverExtra**：服务端配置的自定义参数 **localExtra**：本次加载传入自定义参数 **biddingListener**：竞价结果回调 |

### 2.2 示例代码

java
复制代码

```
//自定义广告平台的广告位ID
String placementId;

@Override
public boolean startBiddingRequest(final Context context, Map<String, Object> serverExtra, Map<String, Object> localExtra, final ATBiddingListener biddingListener) {

    //从serverExtra中获取后台配置的自定义平台的广告位ID
    placementId = (String) serverExtra.get("unit_id");

    CustomSDKInitManager.getInstance().initSDK(context, serverExtra, new MediationInitCallback() {
        @Override
        public void onSuccess() {
            //广告平台初始化成功后发起竞价请求
            //...
        }

        @Override
        public void onFail(String errorMsg) {
            //通过ATBiddingListener，回调竞价失败
            if (biddingListener != null) {
                biddingListener.onC2SBiddingResultWithCache(ATBiddingResult.fail(errorMsg), null);
            }
        }
    });
    //必须return true
    return true;
}
```

java
复制代码

```
//自定义广告平台的广告位ID
String placementId;

@Override
public boolean startBiddingRequest(final Context context, Map<String, Object> serverExtra, Map<String, Object> localExtra, final TUBiddingListener biddingListener) {

    //从serverExtra中获取后台配置的自定义平台的广告位ID
    placementId = (String) serverExtra.get("unit_id");

    CustomSDKInitManager.getInstance().initSDK(context, serverExtra, new MediationInitCallback() {
        @Override
        public void onSuccess() {
            //广告平台初始化成功后发起竞价请求
            //...
        }

        @Override
        public void onFail(String errorMsg) {
            //通过TUBiddingListener，回调竞价失败
            if (biddingListener != null) {
                biddingListener.onC2SBiddingResultWithCache(TUBiddingResult.fail(errorMsg), null);
            }
        }
    });
    //必须return true
    return true;
}
```

---

## 3. 通知TopOn SDK竞价结果

> - 广告加载成功：调用广告平台的API获取返回的价格、货币单位等，并调用`ATBiddingListener#onC2SBiddingResultWithCache()`方法，通知TopOn SDK竞价成功
> - 广告加载失败：需调用`ATBiddingListener#onC2SBiddingResultWithCache()`方法，通知TopOn SDK竞价失败的错误信息

> - 广告加载成功：调用广告平台的API获取返回的价格、货币单位等，并调用`TUBiddingListener#onC2SBiddingResultWithCache()`方法，通知TopOn SDK竞价成功
> - 广告加载失败：需调用`TUBiddingListener#onC2SBiddingResultWithCache()`方法，通知TopOn SDK竞价失败的错误信息

### 3.1 API说明

● ATBiddingListener 竞价结果回调说明

| 方法 | 说明 |
| --- | --- |
| void onC2SBiddingResultWithCache(ATBiddingResult biddingResult, BaseAd baseAd) | 广告竞价结束后返回竞价结果给TopOn **biddingResult**：竞价成功或者失败，参考下方ATBiddingResult说明 **baseAd**：竞价成功时，原生广告需返回CustomNativeAd提供素材信息（请参考原生广告说明，返回此对象）；其他广告形式返回null即可；竞价失败时，返回null即可 |

● ATBiddingResult 竞价结果方法说明

| 方法 | 说明 |
| --- | --- |
| ATBiddingResult success(double price, String token, ATBiddingNotice biddingNotice, ATAdConst.CURRENCY currency) | 返回竞价成功结果，并把竞价相关信息传递给TopOn**price**：本次出价价格**token**：本次竞价广告缓存ID **biddingNotice**：广告竞价相关事件管理类，可传null，具体可参考此文档附录部分**currency**：价格货币单位，支持RMB（人民币元），RMB\_CENT（人民币分），USD（美元） |
| ATBiddingResult success(double sortPrice, double price, String token, ATBiddingNotice biddingNotice, ATAdConst.CURRENCY currency) | 返回竞价成功结果，并把竞价相关信息传递给TopOn**注意**：sortPrice会影响该广告在TopOn内部Waterfall中的排序，sortPrice越大，该广告越可能被优先使用。如无特殊需要，请使用上面的方法 **sortPrice**：本次广告的排序价格 **其他参数意义同上** |
| ATBiddingResult fail(String errorMsg) | 返回竞价失败结果，通知TopOn此广告源竞价失败 **errorMsg**：竞价失败描述 |

● TUBiddingListener 竞价结果回调说明

| 方法 | 说明 |
| --- | --- |
| void onC2SBiddingResultWithCache(TUBiddingResult biddingResult, BaseAd baseAd) | 广告竞价结束后返回竞价结果给TopOn **biddingResult**：竞价成功或者失败，参考下方TUBiddingResult说明 **baseAd**：竞价成功时，原生广告需返回CustomNativeAd提供素材信息（请参考原生广告说明，返回此对象）；其他广告形式返回null即可；竞价失败时，返回null即可 |

● TUBiddingResult 竞价结果方法说明

| 方法 | 说明 |
| --- | --- |
| TUBiddingResult success(double price, String token, TUBiddingNotice biddingNotice, TUAdConst.CURRENCY currency) | 返回竞价成功结果，并把竞价相关信息传递给TopOn**price**：本次出价价格**token**：本次竞价广告缓存ID **biddingNotice**：广告竞价相关事件管理类，可传null，具体可参考此文档附录部分**currency**：价格货币单位，支持RMB（人民币元），RMB\_CENT（人民币分），USD（美元） |
| TUBiddingResult success(double sortPrice, double price, String token, TUBiddingNotice biddingNotice, TUAdConst.CURRENCY currency) | 返回竞价成功结果，并把竞价相关信息传递给TopOn**注意**：sortPrice会影响该广告在TopOn内部Waterfall中的排序，sortPrice越大，该广告越可能被优先使用。如无特殊需要，请使用上面的方法 **sortPrice**：本次广告的排序价格 **其他参数意义同上** |
| TUBiddingResult fail(String errorMsg) | 返回竞价失败结果，通知TopOn此广告源竞价失败 **errorMsg**：竞价失败描述 |

### 3.2 示例代码

java
复制代码

```
CustomInterstitialAd customInterstitialAd;

private void startBid(Context context, final ATBiddingListener biddingListener) {

    customInterstitialAd = new CustomInterstitialAd(placementId);

    customInterstitialAd.load(placementId, new CustomAdLoadListener() {

        @Override
        public void onLoadSuccess() {
            //获取价格
            double bidPrice = customInterstitialAd.getBidPrice();
            //获取货币单位
            ATAdConst.CURRENCY currency = ATAdConst.CURRENCY.USD;
            if (customInterstitialAd.getCurrency() == "RMB") {
                currency = ATAdConst.CURRENCY.RMB;
            }
            //用于标识此次竞价的唯一ID，可使用UUID或者时间戳
            String token = UUID.randomUUID().toString();
            //广告竞价相关事件管理类，可传null
            ATBiddingNotice biddingNotice = new CustomSDKBiddingNotice(customInterstitialAd);

            //通知TopOn SDK竞价结果
            if (biddingListener != null) {
                //注意：onC2SBiddingResultWithCache(ATBiddingResult biddingResult, BaseAd baseAd)原生广告需要返回BaseAd，其他广告形式可传null
                biddingListener.onC2SBiddingResultWithCache(ATBiddingResult.success(bidPrice, token, biddingNotice, currency), null);
            }
        }

        @Override
        public void onLoadFailed(String errorMsg) {
            //通知TopOn SDK竞价结果
            if (biddingListener != null) {
                biddingListener.onC2SBiddingResultWithCache(ATBiddingResult.fail(errorMsg), null);
            }
        }
    });
}
```

java
复制代码

```
CustomInterstitialAd customInterstitialAd;

private void startBid(Context context, final TUBiddingListener biddingListener) {

    customInterstitialAd = new CustomInterstitialAd(placementId);

    customInterstitialAd.load(placementId, new CustomAdLoadListener() {

        @Override
        public void onLoadSuccess() {
            //获取价格
            double bidPrice = customInterstitialAd.getBidPrice();
            //获取货币单位
            TUAdConst.CURRENCY currency = TUBiddingResult.CURRENCY.USD;
            if (customInterstitialAd.getCurrency() == "RMB") {
                currency = TUBiddingResult.CURRENCY.RMB;
            }
            //用于标识此次竞价的唯一ID，可使用UUID或者时间戳
            String token = UUID.randomUUID().toString();
            //广告竞价相关事件管理类，可传null
            TUBiddingNotice biddingNotice = new CustomSDKBiddingNotice(customInterstitialAd);

            //通知TopOn SDK竞价结果
            if (biddingListener != null) {
                //注意：onC2SBiddingResultWithCache(TUBiddingResult biddingResult, BaseAd baseAd)原生广告需要返回BaseAd，其他广告形式可传null
                biddingListener.onC2SBiddingResultWithCache(TUBiddingResult.success(bidPrice, token, biddingNotice, currency), null);
            }
        }

        @Override
        public void onLoadFailed(String errorMsg) {
            //通知TopOn SDK竞价结果
            if (biddingListener != null) {
                biddingListener.onC2SBiddingResultWithCache(TUBiddingResult.fail(errorMsg), null);
            }
        }
    });
}
```

---

## 4. 判断广告是否准备好

> - 在调用`ATInterstitialAd#isAdReady()`时，会调用到自定义Adapter的isAdReady()方法
> - 您需重写`isAdReady()`方法，在此方法中，调用自定义广告平台的API，返回广告的状态

> - 在调用`TUInterstitialAd#isAdReady()`时，会调用到自定义Adapter的isAdReady()方法
> - 您需重写`isAdReady()`方法，在此方法中，调用自定义广告平台的API，返回广告的状态

### 4.1 API说明

| 方法 | 说明 |
| --- | --- |
| boolean isAdReady() | 用于判断广告是否已经是准备完成的状态 |

### 4.2 示例代码

java
复制代码

```
CustomInterstitialAd customInterstitialAd;

@Override
public boolean isAdReady() {
    if (customInterstitialAd != null) {
        return customInterstitialAd.isReady();
    }
    return false;
}
```

---

## 5. 展示广告

> - 在调用`ATInterstitialAd#show()`时，会依次调用到自定义Adapter的`isAdReady()`和`show()`
> - 您需重写show()方法，在此方法中，调用自定义广告平台的API，展示自定义广告，通过`CustomInterstitialEventListener`将广告曝光、点击、关闭等事件通知TopOn SDK

> - 在调用`TUInterstitialAd#show()`时，会依次调用到自定义Adapter的`isAdReady()`和`show()`
> - 您需重写show()方法，在此方法中，调用自定义广告平台的API，展示自定义广告，通过`CustomInterstitialEventListener`将广告曝光、点击、关闭等事件通知TopOn SDK

### 5.1 API说明

| 方法 | 说明 |
| --- | --- |
| void show(......) | 实现展示广告逻辑 **参数根据广告形式而定** |

### 5.2 示例代码

java
复制代码

```
CustomInterstitialAd customInterstitialAd;

@Override
public void show(Activity activity) {
    if (customInterstitialAd != null) {
        customInterstitialAd.setEventListener(new CustomAdEventListener() {
            @Override
            public void onAdImpression() {
                //通知TopOn SDK，广告曝光成功
                if (mImpressListener != null) {
                    mImpressListener.onInterstitialAdShow();
                }
            }

            @Override
            public void onADClicked() {
                //通知TopOn SDK，广告点击了
                if (mImpressListener != null) {
                    mImpressListener.onInterstitialAdClicked();
                }
            }

            @Override
            public void onADClicked() {
                //通知TopOn SDK，广告关闭了
                if (mImpressListener != null) {
                    mImpressListener.onInterstitialAdClose();
                }
            }
        });
        //触发广告展示
        customInterstitialAd.show(activity);
    }
}
```

---

## 6. 实现BiddingNotice通知自定义平台竞价结果

通过实现ATBiddingNotice接口，重写相关方法，以实现向自定义广告平台通知竞胜或者竞败的事件

通过实现TUBiddingNotice接口，重写相关方法，以实现向自定义广告平台通知竞胜或者竞败的事件

### 6.1 实现BiddingNotice

实现ATBiddingNotice接口向自定义广告平台通知竞价结果事件（具体发送时机由TopOn SDK决定）

java
复制代码

```
public class CustomSDKBiddingNotice implements ATBiddingNotice {
    //自定义广告平台的广告对象
    CustomInterstitialAd customInterstitialAd;
    protected GDTATBiddingNotice(CustomInterstitialAd customInterstitialAd) {
        this.customInterstitialAd = customInterstitialAd;
    }
}
```

通过实现TUBiddingNotice接口，重写相关方法，以实现向自定义广告平台通知竞价结果事件（具体发送时机由TopOn SDK决定）

java
复制代码

```
public class CustomSDKBiddingNotice implements TUBiddingNotice {
    //自定义广告平台的广告对象
    CustomInterstitialAd customInterstitialAd;
    protected GDTTUBiddingNotice(CustomInterstitialAd customInterstitialAd) {
        this.customInterstitialAd = customInterstitialAd;
    }
}
```

### 6.2 通知竞胜

> - 当此平台广告为此次加载中最高价时，触发notifyBidWin()方法
> - 您需重写`notifyBidWin()`方法，在此方法中，调用自定义广告平台的API，通知广告平台竞胜了

#### 6.2.1 API说明

| 方法 | 说明 |
| --- | --- |
| void notifyBidWin(double costPrice, double secondPrice, Map<String, Object> extra) | 实现通知自定义广告平台的广告竞胜，本广告竞价成功时，会触发此方法 **costPrice**：竞胜方价格 **secondPrice**：竞胜方后一位的价格（二价）  **extra**: 额外参数 **注意**：价格的货币单位为调用`ATBiddingResult#success()`时传入的**ATAdConst.CURRENCY** |

| 方法 | 说明 |
| --- | --- |
| void notifyBidWin(double costPrice, double secondPrice, Map<String, Object> extra) | 实现通知自定义广告平台的广告竞胜，本广告竞价成功时，会触发此方法 **costPrice**：竞胜方价格 **secondPrice**：竞胜方后一位的价格（二价）  **extra**: 额外参数 **注意**：价格的货币单位为调用`TUBiddingResult#success()`时传入的**TUAdConst.CURRENCY** |

#### 6.2.2 示例代码

java
复制代码

```
@Override
public void notifyBidWin(double costPrice, double secondPrice, Map<String, Object> extra) {
    Map<String, Object> map = new HashMap<>();
    map.put(CustomSDK.COST_PRICE, costPrice);
    map.put(CustomSDK.HIGHEST_LOSS_PRICE, secondPrice);
    //通知竞胜
    customInterstitialAd.sendWinNotification(map);
    customInterstitialAd = null;
}
```

### 6.3 通知竞败

> - 当此平台广告因缓存过期等原因，TopOn认为竞败时，触发`notifyBidLoss()`方法
> - 需重写`notifyBidLoss()`方法，在此方法中，调用自定义广告平台的API，通知广告平台竞败了

#### 6.3.1 API说明

| 方法 | 说明 |
| --- | --- |
| void notifyBidLoss(String lossCode, double winPrice, Map<String, Object> extra) | 实现通知自定义广告平台的广告竞败，本广告竞价失败时，会触发此方法 **lossCode**：失败原因，参考`ATAdConst.BIDDING_TYPE`类，见下方说明 **extra**：可通过Key: `ATBiddingNotice.ADN_ID`，从extra中获取竞胜方渠道，竞胜方渠道的枚举值，参考`ATAdConst.BIDDING_ADN_ID`类，见下方说明 **注意：**价格的货币单位为调用`ATBiddingResult#success()`方法传入的**ATAdConst.CURRENCY** |

● ATAdConst.BIDDING\_TYPE：竞败原因

| 枚举 | 说明 |
| --- | --- |
| BIDDING\_LOSS\_WITH\_LOW\_PRICE\_IN\_NORMAL | 比普通常规广告的价格低 |
| BIDDING\_LOSS\_WITH\_LOW\_PRICE\_IN\_HB | 比竞价广告的价格低 |
| BIDDING\_LOSS\_WITH\_BIDDING\_TIMEOUT | 竞价超时，如因长时间无竞价结果通知TopOn SDK |
| BIDDING\_LOSS\_WITH\_EXPIRE | 广告缓存过期 |

● ATAdConst.BIDDING\_ADN\_ID：竞胜方渠道

| 枚举 | 说明 |
| --- | --- |
| LOSE\_TO\_NORMAL\_IN\_SAME\_ADN | 输给了同个广告平台的普通常规广告 |
| LOSE\_TO\_HB\_IN\_SAME\_ADN | 输给了同个广告平台的竞价广告 |
| LOSE\_TO\_OWN\_ADN | 输给了自有广告（直投广告、交叉推广） |
| LOSE\_TO\_OTHER\_ADN | 输给了其他广告平台 |

| 方法 | 说明 |
| --- | --- |
| void notifyBidLoss(String lossCode, double winPrice, Map<String, Object> extra) | 实现通知自定义广告平台的广告竞败，本广告竞价失败时，会触发此方法 **lossCode**：失败原因，参考`TUAdConst.BIDDING_TYPE`类，见下方说明 **extra**：可通过Key: `TUBiddingNotice.ADN_ID`，从extra中获取竞胜方渠道，竞胜方渠道的枚举值，参考`TUAdConst.BIDDING_ADN_ID`类，见下方说明 **注意：**价格的货币单位为调用`TUBiddingResult#success()`方法传入的**TUAdConst.CURRENCY** |

● TUAdConst.BIDDING\_TYPE：竞败原因

| 枚举 | 说明 |
| --- | --- |
| BIDDING\_LOSS\_WITH\_LOW\_PRICE\_IN\_NORMAL | 比普通常规广告的价格低 |
| BIDDING\_LOSS\_WITH\_LOW\_PRICE\_IN\_HB | 比竞价广告的价格低 |
| BIDDING\_LOSS\_WITH\_BIDDING\_TIMEOUT | 竞价超时，如因长时间无竞价结果通知TopOn SDK |
| BIDDING\_LOSS\_WITH\_EXPIRE | 广告缓存过期 |

● TUAdConst.BIDDING\_ADN\_ID：竞胜方渠道

| 枚举 | 说明 |
| --- | --- |
| LOSE\_TO\_NORMAL\_IN\_SAME\_ADN | 输给了同个广告平台的普通常规广告 |
| LOSE\_TO\_HB\_IN\_SAME\_ADN | 输给了同个广告平台的竞价广告 |
| LOSE\_TO\_OWN\_ADN | 输给了自有广告（直投广告、交叉推广） |
| LOSE\_TO\_OTHER\_ADN | 输给了其他广告平台 |

#### 6.3.2 示例代码

java
复制代码

```
@Override
public void notifyBidLoss(String lossCode, double winPrice, Map<String, Object> extra) {
    //判断竞败原因
    int lossReason = CustomSDKLossReason.OTHER;
    switch (lossCode) {
        case ATAdConst.BIDDING_TYPE.BIDDING_LOSS_WITH_BIDDING_TIMEOUT:
            lossReason = CustomSDKLossReason.NO_AD;
            break;
        case ATAdConst.BIDDING_TYPE.BIDDING_LOSS_WITH_LOW_PRICE_IN_HB:
        case ATAdConst.BIDDING_TYPE.BIDDING_LOSS_WITH_LOW_PRICE_IN_NORMAL:
            lossReason = CustomSDKLossReason.LOW_PRICE;
            break;
    }
    //判断竞胜方渠道
    int adnId = ATInitMediation.getIntFromMap(extra, ATBiddingNotice.ADN_ID, -1);
    switch (adnId) {
        case ATAdConst.BIDDING_ADN_ID.LOSE_TO_NORMAL_IN_SAME_ADN:
            adnId = CustomSDKADNID.NORMAL;
            break;
        case ATAdConst.BIDDING_ADN_ID.LOSE_TO_HB_IN_SAME_ADN:
            adnId = CustomSDKADNID.HB;
            break;
        case ATAdConst.BIDDING_ADN_ID.LOSE_TO_OWN_ADN:
            adnId = CustomSDKADNID.OWN_AD;
            break;
        case ATAdConst.BIDDING_ADN_ID.LOSE_TO_OTHER_ADN:
            adnId = CustomSDKADNID.OTHER;
            break;
    }
    Map<String, Object> map = new HashMap<>();
    map.put(CustomSDK.WIN_PRICE, winPrice);
    map.put(CustomSDK.LOSS_REASON, lossReason);
    map.put(CustomSDK.ADN_ID, adnId);
    //通知竞败
    customInterstitialAd.sendLossNotification(map);
    customInterstitialAd = null;
}
```

java
复制代码

```
@Override
public void notifyBidLoss(String lossCode, double winPrice, Map<String, Object> extra) {
    //判断竞败原因
    int lossReason = CustomSDKLossReason.OTHER;
    switch (lossCode) {
        case TUAdConst.BIDDING_TYPE.BIDDING_LOSS_WITH_BIDDING_TIMEOUT:
            lossReason = CustomSDKLossReason.NO_AD;
            break;
        case TUAdConst.BIDDING_TYPE.BIDDING_LOSS_WITH_LOW_PRICE_IN_HB:
        case TUAdConst.BIDDING_TYPE.BIDDING_LOSS_WITH_LOW_PRICE_IN_NORMAL:
            lossReason = CustomSDKLossReason.LOW_PRICE;
            break;
    }
    //判断竞胜方渠道
    int adnId = TUInitMediation.getIntFromMap(extra, TUBiddingNotice.ADN_ID, -1);
    switch (adnId) {
        case TUAdConst.BIDDING_ADN_ID.LOSE_TO_NORMAL_IN_SAME_ADN:
            adnId = CustomSDKADNID.NORMAL;
            break;
        case TUAdConst.BIDDING_ADN_ID.LOSE_TO_HB_IN_SAME_ADN:
            adnId = CustomSDKADNID.HB;
            break;
        case TUAdConst.BIDDING_ADN_ID.LOSE_TO_OWN_ADN:
            adnId = CustomSDKADNID.OWN_AD;
            break;
        case TUAdConst.BIDDING_ADN_ID.LOSE_TO_OTHER_ADN:
            adnId = CustomSDKADNID.OTHER;
            break;
    }
    Map<String, Object> map = new HashMap<>();
    map.put(CustomSDK.WIN_PRICE, winPrice);
    map.put(CustomSDK.LOSS_REASON, lossReason);
    map.put(CustomSDK.ADN_ID, adnId);
    //通知竞败
    customInterstitialAd.sendLossNotification(map);
    customInterstitialAd = null;
}
```

### 6.4 其他API说明

| 方法 | 说明 |
| --- | --- |
| void notifyBidDisplay(boolean isWinner, double displayPrice) | 实现通知自定义广告平台的广告，当前有广告曝光时，会触发**isWinner**：当前曝光的广告是否为竞胜方**displayPrice**：当前曝光的广告的价格  **注意：**价格的货币单位为调用`ATBiddingResult#success()`方法传入的**ATAdConst.CURRENCY** |

| 方法 | 说明 |
| --- | --- |
| void notifyBidDisplay(boolean isWinner, double displayPrice) | 实现通知自定义广告平台的广告，当前有广告曝光时，会触发**isWinner**：当前曝光的广告是否为竞胜方**displayPrice**：当前曝光的广告的价格  **注意：**价格的货币单位为调用`TUBiddingResult#success()`方法传入的**TUAdConst.CURRENCY** |
