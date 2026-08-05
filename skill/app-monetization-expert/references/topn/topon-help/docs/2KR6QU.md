---
title: "聚合平台概况"
source: "https://help.toponad.net/cn/docs/2KR6QU"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-25"
category_path: ["三方广告平台配置指南", "聚合平台概况"]
content_sha256: "7dd19476de8a8a69da94b4408a77f66eb0a1c7ffa2a919aa4bb8414f588cbd76"
knowledge_role: "reference_only"
has_article_body: true
---

# 聚合平台概况

**聚合是 TopOn 的一项核心功能，可帮助开发者在具体应用的具体广告位集中管理投放的所有广告来源。**

**利用聚合功能，开发者可以将收到的广告请求发送给多个广告来源，从而确保找到最合适的广告来源来填充广告请求，以求最大限度提高填充率和收益。**

## TopOn 支持聚合以下广告平台

| 广告平台名称 | 平台ID(network\_firm\_id) | 是否已支持Bidding 及Bidding对接方式 | 竞价底价设置 | 常规广告源底价设置 | 报表默认时区 |
| --- | --- | --- | --- | --- | --- |
| [Meta(Facebook)](/cn/docs/ZCERpc) | 1 | ✓（S2S） | ✓ | 仅支持bidding | UTC |
| [Admob](/cn/docs/Lrvw6L) | 2 | ✓（S2S） | ✓ | ✓ | PST/PDT  夏令时：PDT UTC-7  其他时间：PST UTC-8 |
| [Inmobi](/cn/docs/6Ditdn) | 3 | ✓（S2S、C2S） | ✓ | 需联系InMobi设置 | UTC |
| [Applovin](/cn/docs/SDLzdz) | 5 | × | × | ✓ | UTC |
| [Mintegral](/cn/docs/YBoLGn) | 6 | ✓（S2S） | ✓ | ✓ | 与TopOn后台账号时区一致 |
| [Chartboost](/cn/docs/4pyJ90) | 9 | ✓（C2S，如需使用请接入Chartboost的头部竞价平台Helium） | × | 需联系Chartboost设置 | UTC |
| [ironSource](/cn/docs/wTA6QW) | 11 | ✓（S2S） | ✓ | ✓ | UTC |
| [Unity Ads](/cn/docs/7FhNeO) | 12 | ✓（S2S） | ✓（S2S） | ✓ | UTC |
| [Liftoff(Vungle)](/cn/docs/VGJvpr) | 13 | ✓（S2S） | ✓ | 需联系Vungle设置 | UTC |
| [Start.io](/cn/docs/ad6T2Z) | 25 | ✓（S2S） | × | 需联系Start.io设置 |  |
| [Sigmob](https://help.toponad.net/cn/docs/gYyQOU) | 29 | ✓（C2S） | ✓ | 需联系Sigmob设置 | UTC+8 |
| [VK(myTarget)](/cn/docs/7Dmura) | 32 | ✓（S2S） | ✓ | ✓ |  |
| [Google Ad Manager](/cn/docs/CjzilL) | 33 | × | × | 需联系Google Ad Manger设置 |  |
| [Yandex](/cn/docs/3PrkH5) | 34 | ✓（S2S） | ✓ | 需联系Yandex设置 |  |
| [Digital Turbine(Fyber)](/cn/docs/FSwnzK) | 37 | × | × | ✓ | UTC |
| [Helium](https://help.toponad.net/cn/docs/4eCEdR) | 40 | ✓（C2S） | ✓ | ✓ | UTC |
| [A4G(Admob)](/cn/docs/eyIOrk) | 48 | × | × | 需联系A4G设置 | UTC |
| [Pangle](/cn/docs/JyIwIP) | 50 | ✓（S2S） | ✓ | ✓ | 与TopOn后台账号时区一致 |
| [Verve Group](/cn/docs/Rrzh6X) | 58 | ✓（C2S） | × | 需联系Verver设置 | 与TopOn后台账号时区一致 |
| [Bigo Ads](/cn/docs/1DgiqJ) | 59 | ✓（S2S） | ✓ | ✓ | UTC+8 |
| [Bidmachine](/cn/docs/Bidmachine) | 65 | ✓（S2S） | × | ✓ | UTC |
| [TopOn ADX](https://help.toponad.net/cn/docs/0a2ZxO) | 66 | ✓（S2S） | × | × | 与TopOn后台账号时区一致 |
| [PremiumAds](https://help.toponad.net/cn/docs/PremiumAds) | 71 | × | × | 需联系PremiumAds设置 | UTC |
| [Amazon Publisher Services(APS)](/cn/docs/Amazon-Publisher-Services-APS) | 75 | ✓（C2S） | × | × | UTC |
| [Kwai Network](/cn/docs/Kwai-Network) | 77 | ✓（C2S） | × | × | 与TopOn后台账号时区一致 |
| [Xiaomi Columbus](https://help.toponad.net/cn/docs/xiao-mi-Columbus) | 81 | ✓（S2S） | × | ✓ | UTC |
| [TaurusX(Webeye)](https://help.toponad.net/cn/docs/TaurusX-Webeye) | 83 | ✓（S2S） | ✓ | ✓ | UTC |
| [Smaato](https://help.toponad.net/cn/docs/Smaato) | 84 | ✓（S2S） | × | ✓ | UTC |
| [Moloco](https://help.toponad.net/cn/docs/Moloco-bidding) | 91 | ✓（S2S） | ✓ | × | UTC |
| [Opera](https://help.toponad.net/cn/docs/Opera-Ads) | 100 | ✓（S2S） | ✓ | ✓ | UTC |

## 三方广告平台接入推荐

根据流量地区和应用品类不同，开发者可以根据实际需要选择广告平台。

以下方案仅供参考，排名不分先后，更多接入广告平台方案可以跟您的TopOn商务经理沟通。

| 地区 | 广告平台 |
| --- | --- |
| 中国大陆 | 穿山甲、优量汇、快手、百度、Mintegral、TopOn ADX，等。 |
| 欧美 | Meta、Admob、Applovin、Unity、IronSource、Fyber、Mintegral，等。 |
| 东南亚 | Admob、Meta、Pangle、Unity、Applovin、TopOn ADX、Mintegral，等。 |

不同地区的优势广告平台，可以浏览[TopOn年度报告](https://www.toponad.net/en/report/465.html)了解，或者咨询您的TopOn商务/运营经理。

注：TopOn ADX不需要SDK单独接入，开发者后台可直接开启使用，不需要另外发版。 （TopOn ADX详情：[请参考文档](/cn/docs/0a2ZxO#4._%E5%A6%82%E4%BD%95%E6%89%93%E5%BC%80TopOn_ADX)）
