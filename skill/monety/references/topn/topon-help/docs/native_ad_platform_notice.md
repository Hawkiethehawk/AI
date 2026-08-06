---
title: "自渲染原生广告注意事项"
source: "https://help.toponad.net/cn/docs/native_ad_platform_notice"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-07-22"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "广告样式", "原生广告", "自渲染原生广告注意事项"]
content_sha256: "b7c48bb196ae6cd42e4dd91bcc5ebef87a3a571c4d7ef4fdf7bec4eead17acec"
knowledge_role: "reference_only"
has_article_body: true
---

# 自渲染原生广告注意事项

## **● Meta**

> - **MediaView**：必须要把**MediaView**添加到布局上，否则会认为是无效展示（原生横幅广告（自渲染）除外）
> - **AdIconView**：必须要把**AdIconView**添加到布局上，否则会认为是无效展示
> - **图标(角标)**：Meta角标不能被遮挡，Meta角标可通过`ATNativePrepareInfo#setChoiceViewLayoutParams()`控制

> - **MediaView**：必须要把**MediaView**添加到布局上，否则会认为是无效展示（原生横幅广告（自渲染）除外）
> - **AdIconView**：必须要把**AdIconView**添加到布局上，否则会认为是无效展示
> - **图标(角标)**：Meta角标不能被遮挡，Meta角标可通过`TUNativePrepareInfo#setChoiceViewLayoutParams()`控制

---

## **● Vungle**

> - **MediaView**：必须要把**MediaView**添加到布局上，否则会认为是无效展示
> - **AdIconView**：必须要把**AdIconView**添加到布局上，否则会认为是无效展示

---

## **● Pangle**

> - 需确保创建**ATNativeAdView**实例时传入的是**Activity**

> - 需确保创建**TUNativeAdView**实例时传入的是**Activity**

---

## **● Bigo**

> - **AdIconView**：返回不为空时必须要把**AdIconView**添加到布局上，否则会认为是无效展示

---

## **● Yandex**

详情参考：[Yandex Native ad assets](https://yandex.com/dev/mobile-ads/doc/android/quick-start/components-android.html)

> - **Domain:** `ATNativeMaterial#getDomain()`不为空时需要把文案添加在布局上并调用`ATNativePrepareInfo#setDomainView()`进行绑定，否则会认为是无效展示
> - **Warning:** `ATNativeMaterial#getWarning()`不为空时需要把文案添加在布局上并调用`ATNativePrepareInfo#setWarningView()`进行绑定，否则会认为是无效展示
> - **AdFrom:** `ATNativeMaterial#getAdFrom()`不为空时需要把文案添加在布局上并调用`ATNativePrepareInfo#setAdFrom()`进行绑定，否则会认为是无效展示

> - **Domain:** `TUNativeMaterial#getDomain()`不为空时需要把文案添加在布局上并调用`TUNativePrepareInfo#setDomainView()`进行绑定，否则会认为是无效展示
> - **Warning:** `TUNativeMaterial#getWarning()`不为空时需要把文案添加在布局上并调用`TUNativePrepareInfo#setWarningView()`进行绑定，否则会认为是无效展示
> - **AdFrom:** `TUNativeMaterial#getAdFrom()`不为空时需要把文案添加在布局上并调用`TUNativePrepareInfo#setAdFrom()`进行绑定，否则会认为是无效展示
