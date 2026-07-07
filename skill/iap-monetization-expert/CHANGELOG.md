# Changelog — iap-monetization-expert

## 1.1.0

**结构性重构：progressive disclosure（拆分参考文档）**

- SKILL.md 从 452 行 / ~34KB 精简到约 130 行：保留 Overview、When to Use、Monetization Models（IAP 类型表，基础分类内联保留）、导航索引、优化优先级 Quick Reference、Verification Checklist。
- 深度内容**零改写**外移到 `reference/`，按需 Read：
  - `reference/metrics-funnel-diagnostics.md` — Core Metrics、LTV 分解树、转化漏斗、续订留存曲线、主动/被动流失、订阅生命周期与 dunning、常见收益问题诊断。
  - `reference/paywall-pricing-ops.md` — 付费墙设计、定价、免费试用/intro offer、商店机制（Apple/Google Play）、订阅基础设施、国内市场、按工具类型打包、A/B 测试、隐私合规、运营流程、新人路径、常见陷阱、**Data Sources（全 skill 引用出处）**。
- SKILL.md 新增「How to navigate this skill」主题→文件映射；引用标记 `[1][2][3][4]` 出处统一在 paywall-pricing-ops.md 的 Data Sources。
- 内容未删改，仅迁移与新增导航。

## 1.0.0

- 初版：参照 [[iaa-monetization-expert]] 的结构与方法新撰，覆盖订阅/一次性/消耗型变现、付费墙、定价、试用、转化漏斗、LTV/留存、订阅生命周期与 dunning、商店机制、订阅基础设施、A/B、合规与运营。
