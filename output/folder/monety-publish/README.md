# Monety

Monety 是一套以 IAA（应用内广告变现）为主线、按需覆盖 IAP（应用内购买）的应用商业化 Skill。主 Skill 整合了 TopOn 报表分析能力，仓库内另附独立的 Open API 子 Skill，覆盖商业化设计、广告聚合配置、上线验收、收益波动诊断、实验迭代、TopOn 报表分析、Open API 只读采集、买量回收和产品研究。

`Monety` 是本项目与主 Skill 的名称，`TopOn` 是广告聚合平台名称。

项目包含两个 Skill：

| Skill | 负责什么 | 不负责什么 |
| --- | --- | --- |
| `monety` | IAA/IAP 商业化设计、聚合配置、上线验收、收益诊断、TopOn 报表分析、买量回收与产品研究 | Open API 鉴权、端点调用、线上配置写入 |
| `topn-open-api` | TopOn Open API 能力查询、采集计划、dry-run 与受控只读调用 | 业务归因、收益判断、配置优化结论 |

主 Skill 不会把帮助中心或行业经验当作现实业务证据；描述当前表现和提出配置建议时，必须使用用户提供的观测数据。

## 仓库结构

```text
Monety/
├── monety/                     # 主 Skill：IAA/IAP + TopOn 报表分析
│   ├── SKILL.md                # 入口与规则
│   ├── agents/openai.yaml      # OpenAI 平台配置
│   ├── assets/topn/            # 分析报告与实验计划模板
│   ├── references/             # IAA/IAP/买量/产品研究知识库与指标目录
│   │   └── topn/topon-help/    # TopOn 帮助中心本地快照与索引
│   └── scripts/topn/           # 报表识别、标准化、质量审计、证据评估与检索脚本
├── topn-open-api/              # Open API 独立子 Skill
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   ├── references/             # API 能力目录、工作流与帮助中心索引
│   └── scripts/                # 采集计划、只读执行器、检索与测试
└── README.md
```

## 安装

将 `monety` 和 `topn-open-api` 两个目录复制到 Codex 能发现的 Skill 目录，可使用全局目录：

```text
~/.codex/skills/
├── monety/
└── topn-open-api/
```

也可以安装到工作区：

```text
<workspace>/.agents/skills/
├── monety/
└── topn-open-api/
```

主 Skill 可以单独使用；只有需要规划或调用 TopOn Open API 时，才需要安装 `topn-open-api`。运行报表脚本需要 Python 3.10 或更高版本，读取 XLSX/XLSM 还需要 `openpyxl`：

```powershell
python -m pip install openpyxl
```

## 调用方式

在对话中明确调用主 Skill：

```text
使用 $monety 分析这批 TopOn 报表。先检查数据质量和证据等级，再解释收入变化。
```

需要规划 Open API 时调用子 Skill：

```text
使用 $topn-open-api 根据 2026-07-01 到 2026-07-20 的范围生成只读采集预案，暂时不要配置 Publisher Key。
```

`topn-open-api` 已关闭隐式调用，普通报表分析不会自动加载 API 鉴权、端点和执行器内容。

## 一键处理 TopOn 报表

从仓库根目录运行：

```powershell
python monety/scripts/topn/run_topn_analysis.py <报表或目录> `
  --project <项目名> `
  --trust-status observed `
  --surface report
```

该入口依次完成：识别综合、漏斗或聚合管理报表 → 映射规范字段 → 隔离汇总行与混合粒度 → 生成 Data Analytics artifact → 审计完整性/唯一性/有效性/一致性/时间连续性 → 评估 7、14、28、56 日自适应证据窗口 → 输出 `analysis-manifest.json`。仅检查结构时：

```powershell
python monety/scripts/topn/inspect_topon_report.py <report.xlsx> --output <inspection.json>
```

### 样例数据

只想测试列名、公式和处理流程时使用 `fixture`：

```powershell
python monety/scripts/topn/run_topn_analysis.py <报表或目录> `
  --project example `
  --trust-status fixture `
  --surface report
```

Fixture 数据固定为 D 级证据，可验证导入流程，不能用于现实归因、收益判断或配置建议。

## 证据等级

Monety 不设置统一 DAU 门槛，按实际分母、历史噪声、完整窗口和业务最小变化判断证据强度。

| 等级 | 含义 | 使用方式 |
| --- | --- | --- |
| A | 变化方向稳定，超过历史噪声与最小业务变化 | 可以作为实验决策的主要依据 |
| B | 方向较稳定，不确定性高于 A | 适合小范围验证 |
| C | 有观察信号，尚不足以支持明确动作 | 继续观察或补充分解维度 |
| D | 数据不足、质量阻断或仅为样例 | 不形成现实结论 |

质量状态为 `blocked`、数据为 fixture 或证据为 D 级时，停止归因和配置建议；`limited` 时关键结论不超过 C 级。

## 指标口径

常用公式从规范分子/分母重算，不平均行级比率：

```text
预估 eCPM       = 预估收益 / TopOn 展示 × 1000
预估 ARPDAU     = 预估收益 / DAU
填充率          = 填充 / 请求
展示率          = 展示 / 填充
竞胜率          = 竞价胜出数 /（竞价次数 × 竞价响应率）
```

`estimated_revenue` 与 `revenue_api`、`impressions` 与 `impressions_api` 只用于对账，不合并为同一字段。DAU、DEU、留存率、ARPU、ARPDAU、eCPM 和比率不能跨重复粒度直接求和。

## Data Analytics 联动

分析现实数据时，将 `data-quality.json`、`evidence-evaluation.json` 和 `data-analytics-artifact.json` 交给 Data Analytics：

1. `analyze-data-quality` 复核粒度、重复、缺失、漂移和口径冲突；
2. `metric-diagnostics` 解释指标变化并检查测量问题；
3. `product-business-analysis` 在证据允许时形成策略取舍；
4. `build-report` 生成可交付报告。

## 本地帮助中心

主 Skill 可以离线检索 TopOn 帮助中心快照：

```powershell
python monety/scripts/topn/search_topon_docs.py "预估 eCPM 展示率" --limit 8
```

Open API 子 Skill 使用自己的索引：

```powershell
python topn-open-api/scripts/search_topon_docs.py "Publisher Key 鉴权" --limit 8
```

帮助中心用于理解产品、指标与调用方法，不用于推断当前竞价环境、广告主预算或广告源实时表现。

## Open API 预案

没有 Publisher Key 也可以生成 planning-only 采集计划：

```powershell
python topn-open-api/scripts/plan_open_api_collection.py <project-dir> `
  --start-date 2026-07-01 `
  --end-date 2026-07-20 `
  --profile all `
  --include-config `
  --output <project-dir>/open-api-collection-plan.json
```

应用 ID 未登记时，依赖应用的报表调用会被阻断，计划不会猜测 ID。取得 Publisher Key 并明确授权后，先对单个计划项执行 dry-run：

```powershell
python topn-open-api/scripts/execute_open_api_call.py <plan.json> `
  --call <call-id>
```

执行器默认为 dry-run，只有显式传入 `--execute` 并指定输出文件时才会访问网络。报表接口从 `TOPON_REPORT_PUBLISHER_KEY` 读取凭据，管理只读接口从 `TOPON_MANAGEMENT_PUBLISHER_KEY` 读取，不要把 Key 放进命令行参数、Skill、报告或仓库。当前子 Skill 只允许受控只读调用，不会修改广告位、广告源、流量分组、Waterfall 或 A/B 测试配置。

## 测试

从仓库根目录运行：

```powershell
python -m unittest discover -s monety/scripts/topn -p "test_*.py" -v
python -m unittest discover -s topn-open-api/scripts -p "test_*.py" -v
```

测试覆盖报表类型识别、字段映射、数据质量审计、证据评估与 Open API 采集计划。

## 数据与安全边界

- 不要把用户报表、原始响应、密钥或分析产物复制进 Skill 目录或发布仓库；
- 用户报表与分析产物写入 Skill 目录之外的项目目录；
- 现实业务数据使用 `observed`，仅作样例时使用 `fixture`；
- Publisher Key 和访问令牌只从环境变量或安全凭据来源读取；
- 输出只包含结论、证据、定位、动作与验证，不包含人员、账户、项目、应用名、包名、真实标识或内部业务数值。

## 当前限制

- 客户端事件、聚合估算、广告源回传、结算数据和归因数据不能直接混算；
- 聚合管理报表的 Total 行请求与广告源明细请求不能混合；
- 缺少分子或分母的导出比例不能跨行安全汇总；
- 当前周期与基线周期必须覆盖相同数量的完整自然日，缺失、接口未返回与真实零值必须区分。
