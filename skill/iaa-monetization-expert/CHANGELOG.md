# Changelog — iaa-monetization-expert

## 1.4.0

**结构性重构：progressive disclosure（拆分参考文档）**

- SKILL.md 从 972 行 / ~69KB 精简到约 110 行：只保留 Overview、When to Use、导航索引、优化优先级 Quick Reference、Verification Checklist。每次 skill 触发时载入上下文的体量大幅下降。
- 深度参考内容**零改写**外移到 `reference/`，按主题分 4 个文件，按需 Read：
  - `reference/metrics-and-diagnostics.md` — Core Metrics（ARPU/eCPM 分解等）、漏斗分析、eCPM 三率节点深挖、常见收益问题诊断、误点分析。
  - `reference/formats-networks-mediation.md` — 广告形式、广告网络（全球+国内）、瀑布流 vs Bidding、自建聚合预加载、并行/兜底/分组/频控、各聚合平台配置（AdMob/MAX/ironSource/穿山甲/TopOn）。
  - `reference/placement-geo-abtest.md` — 广告位设计、地区优化、A/B 测试。
  - `reference/operations-compliance.md` — 运营流程 SOP、广告频率、隐私合规、新人路径、常见陷阱、**Data Sources（全 skill 引用出处）**。
- SKILL.md 新增「How to navigate this skill」主题→文件映射表，并在每个 reference 文件顶部保留引用标记 `[1][2][3][*]` 的指向说明（出处统一在 operations-compliance.md）。
- 内容本身（指标、网络、诊断、出处链接）未删改，仅迁移与新增导航。

> 1.4.0 之前的版本历史未在仓库中单列；本 CHANGELOG 自结构化重构起开始独立记录。
