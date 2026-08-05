---
title: "SDK导入与初始化"
source: "https://help.toponad.net/cn/docs/ygB8ZAV3"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "SDK导入与初始化"]
content_sha256: "4d7a384afa971fc27ea1b00fcd030578318c7eb805904f6c1e4b6b1ab77ccde3"
knowledge_role: "reference_only"
has_article_body: true
---

# SDK导入与初始化

# SDK 导入与初始化

> **💡Tips**
>
> - TopOn React Native SDK 同时支持 **Android** 与 **iOS** 平台，基于 RN **新架构（TurboModule + Fabric）**，要求 `react-native >= 0.85`。
> - 全局配置方法（日志、渠道、个性化广告、隐私合规等）建议在 `ATSDK.init()` **之前**调用。
> - SDK 通过 RN **autolinking** 自动接入原生模块，绝大多数场景无需手动改原生工程；iOS 仍需执行 `pod install`。
> - 接入前建议先跑通工程内置的 `Demo`。

---

## 1. 源码集成

将源码拷入工程，在宿主 `package.json` 用 `link:` / `file:` 引用，并配置 `react-native.config.js` autolink，可以从这里下载

[Demo](https://info.appsmartsite.com/ReactNative/Release/secmtp/v1.0.0/topon_rn_project_secmtp.zip)

[Demo](https://info.appsmartsite.com/ReactNative/Release/thinkup/v1.0.0/topon_rn_project_thinkup.zip)

## 2. 配置 iOS 工程

### 2.1 前提准备

- 最新版本的 Xcode
- 已安装最新版本的 CocoaPods
- iOS 最低部署目标为 **13.0**

### 2.2 安装原生依赖

SDK 通过 podspec 声明 iOS 端原生依赖（AnyThink iOS SDK 及各广告网络适配器），autolinking 会自动引用，**无需手动修改 Podfile 中的 SDK 依赖项**。在工程的 `ios/` 目录执行：

bash
复制代码

```
cd ios
pod install --repo-update
```

> 如非首次操作，遇到依赖解析问题可先删除 `Podfile.lock` 后重试。

### 2.3 更新 Info.plist

参考 [SDK 下载中心](https://www.toponad.com/) 生成的配置，向 `Info.plist` 添加以下键：

（1）`SKAdNetworkItems`——按所选广告网络添加对应 SKAdNetwork ID。

（2）`NSUserTrackingUsageDescription`——iOS 14.5 起，访问 IDFA 需用户授权：

xml
复制代码

```
<key>NSUserTrackingUsageDescription</key>
<string>此处修改为您希望用户看到的权限请求描述，可本地化</string>
```

（3）`NSAppTransportSecurity`：

xml
复制代码

```
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

（4）若勾选了 **AdMob** 平台，添加 `GADApplicationIdentifier`：

xml
复制代码

```
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy</string>
```

> ⚠️ 从 iOS 14.5 起，只有在获得用户明确授权（App Tracking Transparency）后，应用才可访问 IDFA。建议在合适时机调用 `ATTrackingManager.requestTrackingAuthorization` 发起授权请求。如需适配 GDPR，请参考[海外隐私配置](https://help.toponad.net/cn/docs/hMm9bZsP)。

---

## 3. 配置 Android 工程

### 3.1 SDK 要求

| 项 | 要求 |
| --- | --- |
| `minSdkVersion` | `21` |
| `compileSdkVersion` | `36` |
| `targetSdkVersion` | `36` |

autolinking 会自动接入原生模块与各广告网络适配器依赖，通常无需手动修改 `build.gradle`。

### 3.2 AndroidManifest 配置

若使用了 **AdMob**，必须在 `AndroidManifest.xml` 中添加：

xml
复制代码

```
<manifest>
    <application>
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy" />
    </application>
</manifest>
```

### 3.3 混淆配置

如开启代码混淆，在 `proguard-rules.pro` 中保留 SDK 桥接与原生类（按所接入广告网络补充各自的 keep 规则）。

---

## 4. SDK 初始化

在加载任何广告之前，需要先完成初始化。SDK 提供两个核心方法：

| 方法 | 说明 |
| --- | --- |
| `ATSDK.init(appId, appKey)` | 初始化 SDK；内部会建立事件分发通道（`ATAdEvents`），使各广告回调能分发到 JS |
| `ATSDK.start()` | 启动 SDK（拉取策略等）；须在 `init` 之后调用 |

推荐在用户同意隐私协议后、加载广告前尽早初始化。完整顺序（不可打乱）：**日志 → 全局监听 → 集成检测 → 个性化开关 → init → start**：

ts
复制代码

```
import { ATSDK, ATAdEvents } from '@anythink/react-native-sdk';

export function initSdk(personalized: boolean): void {
  // 1. 日志（早于 init；开发阶段开启，上线前关闭）
  ATSDK.setNetworkLogDebug(true);

  // 2. 全局事件监听（订阅各广告回调通道）
  ATAdEvents.init();

  // 3. 集成检测（验证原生依赖是否正确接入）
  ATSDK.integrationChecking();

  // 4. 个性化广告开关（PERSONALIZED=允许，NONPERSONALIZED=限制）
  ATSDK.setPersonalizedAdStatus(
    personalized ? ATSDK.PERSONALIZED : ATSDK.NONPERSONALIZED
  );

  // 5. init + start
  ATSDK.init('your app id', 'your app key');
  ATSDK.start();

  console.log('SDK 初始化完成，版本：', ATSDK.getSDKVersionName());
}
```

> 💡 `ATSDK.init` 内部已自动调用 `ATAdEvents.init()`，但在更早的启动阶段显式调用一次可确保全局监听（如统一日志面板）不漏接早期事件。重复调用是幂等的。

---

## 5. 全局 API 参考

### 5.1 全局配置方法（建议在 `init` 之前调用）

| 方法 | 说明 |
| --- | --- |
| `ATSDK.setNetworkLogDebug(boolean)` | 开启 / 关闭网络调试日志（同时控制 RN 层与原生层） |
| `ATSDK.setChannel(string)` | 设置渠道名，用于数据分析 |
| `ATSDK.setChannelSource(number)` | 设置渠道来源 |
| `ATSDK.initCustomMap(Record<string, unknown>)` | 设置全局自定义参数（用于流量分组） |
| `ATSDK.initPlacementCustomMap(placementId, map)` | 设置某广告位的自定义参数 |
| `ATSDK.setPersonalizedAdStatus(number)` | 设置个性化广告开关（`PERSONALIZED` / `NONPERSONALIZED`） |
| `ATSDK.integrationChecking()` | 触发集成自检 |

### 5.2 初始化后可用方法

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `ATSDK.start()` | `void` | 启动 SDK（须在 `init` 之后） |
| `ATSDK.getSDKVersionName()` | `string` | 获取 SDK 版本号 |
| `ATSDK.getArea()` | `Promise<string>` | 获取当前地区 |
| `ATSDK.isCnSDK()` | `Promise<boolean>` | 是否为国内版 SDK |
| `ATSDK.isNetworkLogDebug()` | `Promise<boolean>` | 当前是否开启网络调试日志 |
| `ATSDK.showDebuggerUI(debugKey)` | `void` | 打开 TopOn 调试面板，详见[测试广告](https://help.toponad.net/cn/docs/mUQCiQXG) |

### 5.3 个性化广告状态常量

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `ATSDK.PERSONALIZED` | `0` | 允许个性化广告 |
| `ATSDK.NONPERSONALIZED` | `1` | 限制为非个性化广告 |
| `ATSDK.UNKNOWN` | `2` | 未知 / 未设置 |

---

## 6. 下一步

- 配置广告位并加载第一个广告：从[开屏广告](https://help.toponad.net/cn/docs/Nsz8jVBC)或[激励视频广告](https://help.toponad.net/cn/docs/Ryxtwat1)开始
- 出海应用请先完成[海外隐私配置](https://help.toponad.net/cn/docs/hMm9bZsP)
- 上线前对照[集成检查清单](https://help.toponad.net/cn/docs/xIqAdUVF)逐项自查
