---
title: "测试要点清单"
source: "https://help.toponad.net/cn/docs/ce-shi-yao-dian-qing-dan-o9Mr"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-08-06"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "测试要点清单"]
content_sha256: "b2400ae6e116154e5022d3dd2f89fb58b06ffb4a5275dd28311d65ef1cc863c8"
knowledge_role: "reference_only"
has_article_body: true
---

# 测试要点清单

请您在测试时参考以下测试要点，确保各环节功能和体验符合预期

## 一、应用启动时初始化TopOn SDK

- 若要在欧盟地区上线发布，则需执行 GDPR 合规弹窗流程后再初始化TopOn SDK
- 明确集成了哪些广告平台（如 Admob、Meta 等），并关注各广告平台 SDK 是否正确集成

---

## 二、SDK 初始化完成后，预加载广告

- 错峰执行加载广告的逻辑，避免同时高并发请求加载广告
- 激励、插屏、开屏、原生广告样式全局复用同一个 Ad 实例对象

---

## 三、激励视频 & 插屏广告

- TopOn SDK初始化完成后或进入应用首页场景时，提前进行首次加载请求
- 展示广告前调用`isReady`检查是否有可运展示，`YES` 则展示，`NO` 则请求加载广告
- 激励视频的奖励需在 `rewardedVideoDidRewardSuccessForPlacemenID:extra:` 回调中下发，需要测试奖励是否能成功下发
- 广告关闭后，在关闭回调中调用 `load` 进行广告的预加载
- 防多次点击：展示激励或插屏广告时，需防止多次点击，避免重复弹出广告

---

## 四、开屏广告

- 若有自定义超时逻辑，需将相同的超时时间传递给 TopOn SDK
- 加载超时需跳转应用首页；未超时则在 `didFinishLoadingSplashADWithPlacementID:isTimeout:` 回调中进行展示广告
- 在`splashDidCloseForPlacementID:extra:`中为热启开屏进行预加载
- 保证开屏广告展示方法在应用位于前台且活跃状态时才调用(didBecomeActive)
- 应用切换到后台或页面切换时，调用`isReady`检查是否有可用缓存，`NO`时进行预加载
- 点击跳过时`splashDidCloseForPlacementID:extra:`回调是否正常，跳浏览器/AppStore是否正常

---

## 五、横幅广告

- `自动刷新`需统一使用[TopOn 后台 > 选择应用 > 编辑横幅广告聚合单元 > 高级设置](https://portal.toponad.net/m/app)，需要在各广告平台后台关闭自动刷新功能
- TopOn后台开启自动刷新功能后，检查自动刷新是否正常

---

## 六、原生广告

- `didFinishLoadingADWithPlacementID:`加载成功后，如果需要自行持有广告对象，需要判空检查，即获取`ATNativeAdOffer *offer`或者`ATNativeADView *nativeADView`时需要判断其是否为空，非空才能正常持有并使用。
- 自渲染：`SelfRenderView`中各素材需绑定渲染，关注 `didShowNativeAdInAdView` 是否正常触发
- 资源释放：全局使用 NativeAd 实例时在应用退出时释放资源；与 控制器 绑定时在 dealloc 中调用`ATNativeADView实例对象的destroyNative`，自渲染还需要正确释放`ATNativeAdOffer`对象
- 不同平台渲染要求不同，需确保所有广告平台均能正常填充、展示并触发`didShowNativeAdInAdView`回调

---

## 七、TopOn SDK Debug Log

> **建议**：针对每个广告位的瀑布流配置，要把每家三方广告平台的广告源都测试正常填充展示后再将应用上线

- 日志 TAG 过滤：`ATAdLog`
- 通过log检查确认配置在各聚合平台的各个广告源都有能填充到，其加载、填充、展示、点击回调都能正常触发

---
