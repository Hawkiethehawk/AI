# AMTools

应用市场研究工具集，统一承载数据采集、数据分析和定时编排。

## 模块

- `apps/AMDC`：App Market Data Collection。负责账号认证、榜单采集、国别富化、缓存、历史记录、Excel、飞书同步和本地实时看板。
- `skills/AMDA`：App Market Data Analytics。负责固定工作簿分析、国家分组、IAA/IAP 洞察、五张标准图表和飞书报告 Demo。
- `packages/contracts`：跨模块契约，当前包含 `CollectionManifest`。
- `orchestrator`：总流程入口。当前先提供 manifest 校验和隔离 dry-run；真实采集与正式写入仍需显式授权。

## 目录原则

AMDC 和 AMDA 保持独立运行边界，只共享版本化契约。账号登录态、缓存、日志、运行产物和本地配置均不进入版本库。

## 常用检查

```powershell
npm run contracts:test
npm run amdc:syntax
npm run amdc:test:contract
npm run amdc:test:feishu-order
pwsh -NoProfile -File .\orchestrator\run-pipeline.ps1 -ManifestPath .\tests\fixtures\collection-manifest.example.json -DryRun
```

总仓库入口会显式把 `AMDC_PROJECT_DIR` 绑定到 `apps\\AMDC`，避免宿主机已有的旧项目环境变量污染测试和命令；直接进入 `apps\\AMDC` 运行原 CLI 时，仍可使用原有环境变量覆盖规则。

## 当前迁移状态

AMDC 和 AMDA 已迁入总仓库目录，保留原有模块内容；后续通过 `CollectionManifest` 替换跨项目隐式路径和自然语言触发依赖。
