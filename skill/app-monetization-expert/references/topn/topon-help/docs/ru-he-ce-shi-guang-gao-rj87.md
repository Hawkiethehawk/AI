---
title: "如何测试广告"
source: "https://help.toponad.net/cn/docs/ru-he-ce-shi-guang-gao-rj87"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Cocos Creator接入指南", "如何测试广告"]
content_sha256: "62ecf65d64d2bfa20c43ef5813baa1f1e7d07caf147956e68aad9e9e06d7caa7"
knowledge_role: "reference_only"
has_article_body: true
---

# 如何测试广告

## **1**. SDK日志开关

> **注意：** 应用上线前需要关闭日志功能

复制代码

```
import {ATSDK} from "db://assets/script/AnyThinkAds/ATSDK";

ATSDK.setLogDebug(true);
```

## **2**. 测试工具

### **● 如何导入**

- [Android 平台接入指南](/cn/docs/5xiiue#2.2_%E6%B5%8B%E8%AF%95%E5%B7%A5%E5%85%B7%E6%8E%A5%E5%85%A5)
- [iOS 平台接入指南](/cn/docs/ce-shi-gong-ju-Beta-DLyz)

**● 如何使用**

复制代码

```
import {ATSDK} from "db://assets/script/AnyThinkAds/ATSDK";

ATSDK.showDebuggerUI("your debug key");
```

- [Android 平台使用指南](/cn/docs/5xiiue#2._%E9%80%9A%E8%BF%87%E6%B5%8B%E8%AF%95%E5%B7%A5%E5%85%B7%E6%B5%8B%E8%AF%95%E5%B9%BF%E5%91%8A)
- [iOS 平台使用指南](/cn/docs/ce-shi-gong-ju-Beta-DLyz)
