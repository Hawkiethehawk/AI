---
title: "GDPR"
source: "https://help.toponad.net/cn/docs/GDPR"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Cocos Creator接入指南", "政策合规", "GDPR"]
content_sha256: "e520fe75b8a2245eae40bbac47b863a6bccafc0679576ad5a639200c7b8e1ef2"
knowledge_role: "reference_only"
has_article_body: true
---

# GDPR

## **1**. 通用数据保护条例GDPR

> 自2018年5月25日起，欧盟《一般数据保护条例》将正式生效。为了保护开发人员和用户的利益和隐私，我们更新了["](https://www.toponad.com/privacy-policy)[TopOn隐私政策](https://help.toponad.com/cn/docs/1Mn1B7)"。同时，我们也在SDK中增加了隐私权限设置。请根据以下内容检查SDK的配置。

## **2**. 欧盟地区的GDPR配置

复制代码

```
ATSDK.getUserLocation(function (userLocation: string | number) {
    if (userLocation === ATSDK.kATUserLocationInEU) {
        if (ATSDK.getGDPRLevel() === ATSDK.UNKNOWN) {
            ATSDK.showGDPRConsent(function () {
                ATSDK.initSDK("your app id", "your app key");
            });
        }
    }
});
```
