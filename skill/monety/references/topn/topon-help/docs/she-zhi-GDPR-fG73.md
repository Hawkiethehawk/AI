---
title: "设置GDPR"
source: "https://help.toponad.net/cn/docs/she-zhi-GDPR-fG73"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-30"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "政策合规", "设置GDPR"]
content_sha256: "3fe808675c3cc1166b225df748341a0e70e90d9675769d7b507617defdd6a935"
knowledge_role: "reference_only"
has_article_body: true
---

# 设置GDPR

## Step1. 通用数据保护条例GDPR

自2018年5月25日起，欧盟《一般数据保护条例》将正式生效。为了保护我们的开发人员和您的用户的利益和隐私，我们更新了我们的["TopOn privacy Policy"](https://www.toponad.com/privacy-policy)。同时，我们在SDK添加了隐私权限设置。请检查以下配置并完成SDK集成.

## Step2. 欧盟地区的GDPR配置流程建议

建议开发者的集成流程如下

### 2.1 不使用TopOn SDK提供的欧盟判断API

1、 APP启动后，开发者判断用户是否在欧盟(开发者自行实现是否在欧盟的判断方法）

- **不在欧盟**，跳到第4步
- **在欧盟**，下一步

2、判断TopOn SDK的**Dataconsent**是否为**Unknown**

- **为Unknown**（未设置过GDPR等级），下一步
- **不为Unknown**（设置过GDPR等级），跳到第4步

3、调用TopOn SDK的**showGDPRAuth**方法(由用户设置GDPR等级）

4、初始化SDK

### 2.2 使用TopOn SDK提供的欧盟判断API

**设置GDPR流程**

使用以下代码段设置GDPR:

java
复制代码

```
//判断是否在欧盟地区
ATSDKAPI.getUserLocation(new GetLocationListener());

//发布欧盟地区的开发者需使用以下授权代码，询问用户是否同意收集隐私数据
private class GetLocationListener:ATGetUserLocationListener
{
    public void didGetUserLocation(int location)
    {
        Debug.Log("Developer callback didGetUserLocation(): " + location);
        if(location == ATSDKAPI.kATUserLocationInEU && ATSDKAPI.getGDPRLevel() == ATSDKAPI.UNKNOWN)
        {
            ATSDKAPI.showGDPRAuth();
        }
    }
}
```

展示如图：



**重要提示：**

如果你是iOS平台接入，当你的应用同时获取了**App Tracking Transparency授权弹窗**，我们强烈建议参考 [同时获取App Tracking Transparency授权弹窗与GDPR弹窗流程建议](https://help.toponad.net/cn/docs/Google-UMP-shi-pei-shi-yong-zhi-nan-fMgm) ，否则有提审被拒的风险！
