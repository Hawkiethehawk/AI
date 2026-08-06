---
title: "SDK预置策略"
source: "https://help.toponad.net/cn/docs/wERYJv"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "高级功能", "SDK预置策略"]
content_sha256: "b1ea0371e4d8188ad7b5fa5e34907a7912a656cdf221963ff707d4b341aa239e"
knowledge_role: "reference_only"
has_article_body: true
---

# SDK预置策略

为了减少应用安装后首次启动时TopOn SDK获取TopOn广告位策略的耗时，以及规避TopOn SDK获取TopOn广告位策略失败的情况出现，TopOn支持应用在本地预置TopOn广告位策略。

TopOn SDK 支持开屏、激励视频、插屏、原生、横幅全部广告类型使用**SDK预置策略**。

## **1**. 介绍

TopOn支持开发者导出**广告位维度的SDK预置策略**，在应用发版前预置到您的App中。当应用安装首次启动时，TopOn会使用SDK预置策略请求广告，以提高应用安装首次启动的广告展示率。

**注意事项**：

1. 应用在本地预置SDK策略需要更新TopOn SDK v6.1.78及以上版本
2. **SDK预置策略**仅在应用安装首次启动时使用。TopOn SDK获取线上广告位策略成功后，后续将会使用TopOn线上配置的广告位策略

## **2**. 创建SDK预置策略的流量分组

使用SDK预置策略需要创建特定的流量分组，具体流程如下：

1. 在聚合管理页面添加流量分组，流量分组规则选择**SDK内置策略**



1. 流量分组里**SDK预置策略**规则不能跟其他规则同时使用
2. **SDK预置策略**的流量分组下的广告位策略只提供导出并预置到您的App。
3. 如果您修改了**SDK预置策略**的策略，您需要重新导出并预置到您的应用。
4. 您可以在TopOn广告位下创建多个**SDK预置策略**。为了更好得分析不同的TopOn SDK版本使用**SDK预置策略**的效果，建议您为不同的TopOn SDK版本创建不同的**SDK预置策略**。

## **3**. 配置SDK预置策略

创建完成**SDK预置策略**的流量分组后，您可以跟其他流量分组一样，针对此**SDK预置策略**进行配置，如添加/编辑/复制广告源，修改高级设置等

## **4**. 导出SDK预置策略

1. 当您修改SDK预置策略的广告位策略后，TopOn服务端需要15钟完成新策略同步。建议您完成SDK预置策略配置后，等待15分钟之后再导出SDK预置策略。



1. 在**导出SDK预置策略**时，您需要选择您在应用中使用的TopOn SDK版本。请确保您导出TopOn SDK版本跟您应用中集成的TopOn SDK版本是一致的。



1. 如果您在导出SDK预置策略时出现以下提示，说明TopOn服务端尚未完成SDK预置策略的广告位策略同步时，建议您等待15分钟之后再导出SDK预置策略。



1. 在**导出SDK预置策略**成功后TopOn会生成一个以广告位ID命名的json文件

## **5**. 导入SDK预置策略到应用

1. 将导出的json文件放到您应用项目中，同时参考SDK接入文档在应用项目中完成**SDK预置策略**的代码集成
2. 参考以下TopOn SDK集成说明

### Android接入说明

1. 在项目的 src/main/assets 目录下新建一个目录 localStrategy,目录命名规则可以自定义，用于以下的步骤。
2. 将从后台导出的json文件放到刚新建的目录下 src/main/assets/localStrategy 。
3. 只需要在发起加载广告之前调用 ATSDK#setLocalStrategyAssetPath(Context context, String path) API进行设置即可，参数Path是第一步新建的目录名称localStrategy。示例代码如下：

java
复制代码

```
//在Application#onCreate()调用
public class DemoApplication extends Application {
      @Override
    public void onCreate() {
        super.onCreate();
             //...
          ATSDK.setLocalStrategyAssetPath(this, "localStrategy");
          //...
    }
}
```

### iOS接入说明

1. 将从后台导出的json文件引入到工程项目中
2. 在发起加载广告之前调用 setPresetPlacementConfigPathBundle: API进行设置即可，参数Bundle是第一步json文件引入工程所在的Bundle。示例代码如下：

java
复制代码

```
// 根据json文件引入到工程对应Bundle来传入，示例中使用为mainBundle
[[ATAPI sharedInstance] setPresetPlacementConfigPathBundle:[NSBundle mainBundle]];
```

## **6**. 查看SDK预置策略的数据

1. 您可以在**聚合管理**页面查看**SDK预置策略**的流量分组，您也可以在**综合报表**筛选**A/B测试**、**流量分组**来查看**SDK预置策略**的流量分组数据。
2. 如果广告位在开启动AB实验前已创建了**SDK预置策略**的流量分组，在开启AB实验后，**SDK预置策略**的流量分组也会被复制到AB实验中ID最小的实验分组
3. 开启动AB实验后，原来的**SDK预置策略**的流量分组可以在**未分组**里查看数据

## **7**. 常见问题

#### **1. 完成SDK预置策略后多久可以导出？**

答：当您修改SDK预置策略的广告位策略后，TopOn服务端需要15钟完成新策略同步。建议您完成SDK预置策略配置后，等待15分钟之后再导出SDK预置策略。

#### **2. 每次应用发版更新时是否均需要重新导入TopOn的SDK预置策略文件 ？**

答：建议您在以下情况下重新导入TopOn的**SDK预置策略**文件：

- 本次应用发版有更新TopOn SDK，建议您针对本次更新的TopOn SDK版本重新导出**SDK预置策略**并预置到应用中(请确保您导出TopOn SDK版本跟您应用中集成的TopOn SDK版本是一致的)
- 当您修改了**SDK预置策略**的广告位策略时，建议您在下次应用发版时重新导入TopOn的**SDK预置策略**

#### **3. 新版本应用中更新了TopOn SDK但没有更新旧的SDK预置策略文件会有什么影响？**

答：新版本的TopOn SDK会兼容旧版本的**SDK预置策略**文件。如果新版本有增加了新的广告位策略，但您的应用没有重新导入相应版本的**SDK预置策略**文件，这样新版本TopOn SDK的新功能可能无法生效。为了保证更好的变现效果，如果您更新了TopOn SDK版本建议您针对本次更新的TopOn SDK版本重新导出**SDK预置策略**并预置到应用中。

注：**旧版本的TopOn SDK无法使用新版本的SDK预置策略文件。**

#### 4. 首次安装开屏加载效率如何提升？

- v6.1.78及以上版本，可以参考以下优化建议：

1. 针对开屏广告位的**SDK预置策略**添加一个**兜底广告源**。请参考 [兜底广告](https://docs.toponad.com/#/zh-cn/android/DeveloperAccess/Mediation/mediation_cn?id=%e5%85%9c%e5%ba%95%e5%b9%bf%e5%91%8a) 配置广告源(不需要导出兜底广告源的配置)
2. 在应用集成时针对开屏广告位使用**SDK预置策略**
