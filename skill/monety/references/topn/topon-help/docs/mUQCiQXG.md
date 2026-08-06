---
title: "测试广告"
source: "https://help.toponad.net/cn/docs/mUQCiQXG"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "测试广告"]
content_sha256: "8ec5464359893a4e9a3d095114afd69bbe0062a704b4e5e941ef48198c96342f"
knowledge_role: "reference_only"
has_article_body: true
---

# 测试广告

> **💡Tips**
>
> - 调试阶段建议开启日志开关，并使用 Topon 调试面板验证广告位与适配器配置。
> - **正式发布前请务必关闭日志开关。**

---

## 1. 开启 SDK 调试日志

ts
复制代码

```
import { ATSDK } from '@anythink/react-native-sdk';

// 建议在 ATSDK.init() 之前调用
ATSDK.setNetworkLogDebug(true);
```

> 💡 **Tips**
>
> - 该方法同时控制 RN 层（`ATLog`）与原生层（SDK / MsgTools）的网络日志。
> - Android 可在 Logcat 中通过 SDK 日志 TAG 过滤；iOS 可在 Xcode 控制台查看。
> - 运行时可随时查询当前开关状态：
>
> ts
> 复制代码
>
> ```
> const enabled = await ATSDK.isNetworkLogDebug();
> ```

---

## 2. 集成自检

初始化阶段调用集成检测，验证原生依赖与适配器是否正确接入：

ts
复制代码

```
ATSDK.integrationChecking();
```

> 检测结果会输出到日志中，请配合第 1 节的日志开关一起使用。

---

## 3. Topon 调试面板

初始化 SDK 之后，可打开 Topon 可视化调试工具，查看各广告网络的接入状态、填充与展示链路：

ts
复制代码

```
// debugKey 从 Topon 控制台获取
ATSDK.showDebuggerUI('your Topon sdk debug key');
```

> 💡 **Tips**
>
> - `debugKey` 请从 [Topon 控制台 - 账号 - Key 管理](https://www.Toponad.com/) 获取。
> - 调试面板需在 `ATSDK.init()` 与 `ATSDK.start()` 之后调用。

---

## 4. 获取版本号

排查问题时附上 SDK 版本有助于定位：

ts
复制代码

```
console.log('SDK 版本：', ATSDK.getSDKVersionName());
```

---

## 5. 运行内置 Demo

工程内置的 `example/` 应用覆盖了全部广告样式（开屏 / 横幅 / 插屏 / 激励 / 原生 / 原生列表）与 SDK API 验证页，接入遇到问题时可对照 Demo 排查：

bash
复制代码

```
cd example
yarn        # 安装依赖
yarn ios    # 或 yarn android
```
