---
title: "查询广告状态与收益回传"
source: "https://help.toponad.net/cn/docs/5aqFtWH6"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-07"
category_path: ["TopOn SDK接入指南", "React Native接入指南", "高级功能", "查询广告状态与收益回传"]
content_sha256: "1eee5a44bacde8f8fb18d77b3c2226a1cbf792a119ff9dc566731ebecd718aab"
knowledge_role: "reference_only"
has_article_body: true
---

# 查询广告状态与收益回传

> **💡Tips**
>
> - 各广告类型（手动模式）都提供统一的状态查询接口：`isAdReady` / `checkAdStatus` / `checkValidAdCaches`。
> - 广告收益走**独立回调通道**，通过 `setAdRevenueListener` 注册，与展示 / 点击回调分流。

---

## 1. 查询广告是否就绪

`isAdReady()` 返回 `Promise<boolean>`，展示前用它判断是否有缓存广告：

tsx
复制代码

```
const ready = await ad.isAdReady();
if (ready) {
  ad.show();
}
```

> ⚠️ 横幅（`ATBannerView`）与原生（`ATNative`）没有 `isAdReady`，改用下方的 `checkAdStatus()` 读取 `isReady`。
> 自动加载模式的 `isAdReady(pid)` 为**同步**方法，详见[自动加载模式](https://help.toponad.net/cn/docs/4hgahcLt)。

---

## 2. 查询加载状态详情

`checkAdStatus()` 返回 `Promise<ATAdStatusInfo>`，提供更细的状态：

tsx
复制代码

```
const status = await ad.checkAdStatus();
console.log('isReady =', status.isReady, 'isLoading =', status.isLoading);
```

`ATAdStatusInfo` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `isLoading` | `boolean` | 是否正在加载 |
| `isReady` | `boolean` | 是否有缓存广告可展示 |
| `atTopAdInfo` | `ATAdInfo?` | 当前置顶（最优）缓存广告信息 |

横幅 / 原生用它判断就绪：

tsx
复制代码

```
const status = await bannerView.checkAdStatus();
if (status.isReady) {
  // 挂载视图组件展示
}
```

---

## 3. 查询有效缓存列表

`checkValidAdCaches()` 返回当前所有有效缓存广告的信息列表 `Promise<ATAdInfo[]>`，常用于查看缓存深度 / 比价：

tsx
复制代码

```
const caches = await ad.checkValidAdCaches();
console.log('有效缓存数：', caches.length);
```

> 各广告样式（含开屏）的**手动模式**均支持 `checkValidAdCaches`；**自动加载模式**（`ATXxxAutoAd`）无此方法。

---

## 4. 三方收益回传

为广告实例注册收益监听，广告展示产生收益时回调。`info` 为 `ATAdInfo`（snake\_case 开放字典），含 `publisher_revenue` / `currency` / `adsource_price` 等字段：

tsx
复制代码

```
ad.setAdRevenueListener((info) => {
  const revenue = Number(info['publisher_revenue'] ?? 0);
  const currency = String(info['currency'] ?? '');
  const adsourcePrice = Number(info['adsource_price'] ?? 0);
  // 上报到你自己的数据系统（如 AppsFlyer / 自建 BI）
  reportAdRevenue({ revenue, currency, adsourcePrice });
});
```

> 💡 收益字段集与原生 `ATAdInfo` 一致，具体键名以原生实际回调为准；取值时建议做空值与类型保护。字段含义详见[回调信息说明](https://help.toponad.net/cn/docs/OKZCoAuh)。

---

## 5. 各广告样式的状态接口支持情况

| 广告样式 | `isAdReady` | `checkAdStatus` | `checkValidAdCaches` |
| --- | --- | --- | --- |
| 激励视频 | ✓ | ✓ | ✓ |
| 插屏 | ✓ | ✓ | ✓ |
| 开屏 | ✓ | ✓ | ✓ |
| 横幅 | ✗（用 `checkAdStatus`） | ✓ | ✓ |
| 原生 | ✗（用 `checkAdStatus`） | ✓ | ✓ |
