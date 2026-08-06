# TopOn 报表分析模块

## 目录

- [任务路由](#任务路由)
- [证据边界](#证据边界)
- [一键处理报表](#一键处理报表)
- [字段硬约束](#字段硬约束)
- [Data Analytics 联动](#data-analytics-联动)
- [帮助中心检索](#帮助中心检索)
- [策略建议与实验](#策略建议与实验)
- [项目状态](#项目状态)
- [交付格式](#交付格式)

TopOn 是本 Skill 的 IAA 数据分析模块。它负责读取用户提供的报表、解释公开帮助中心口径、检查数据质量、定位漏斗和收益变化，并形成可回滚的验证方案；不负责 Open API 鉴权、密钥管理或数据采集。

## 任务路由

| 用户任务 | 执行方式 | 按需读取 |
|---|---|---|
| 解释指标、报表列或产品功能 | 搜索本地帮助中心并引用官方 URL | `references/topn/metric-catalog.json`、`references/topn/data-contract.md` |
| 检查报表能否分析 | 识别类型、标准化字段、运行质量审计 | `references/topn/report-types.json`、`references/topn/data-contract.md` |
| 概括变化或定位异常 | 比较等长完整窗口，拆解收入、展示和 eCPM | `references/topn/metrics-and-diagnostics.md` |
| 判断结论可靠性 | 使用自适应窗口、历史噪声和实际分母 | `references/topn/adaptive-evidence-thresholds.md` |
| 提出配置优化 | 先列证据，再设计单变量、可回滚实验 | `references/topn/recommendation-workflow.md` |
| 处理 Open API | 显式调用独立的 `$topn-open-api` | 不用分析脚本替代 API 接入 |

## 证据边界

每条关键内容标注信息角色：

- `[文档]`：TopOn 官方帮助中心对产品或口径的说明。
- `[观测]`：用户上传的报表或用户确认的业务事件。
- `[计算]`：从观测数据复算的结果。
- `[推断]`：与证据一致但尚未排除其他解释的原因假设。
- `[建议]`：拟测试或执行的动作。

只有 `[观测]` 和 `[计算]` 能描述指定数据的当前业务表现。帮助文档、行业经验和历史案例只用于解释指标或提出验证方向。主要结论同时标注 A/B/C/D 级：D 级证据或质量 `blocked` 时停止归因与配置建议；质量 `limited` 时关键结论不超过 C 级。不要设置统一 DAU 门槛，按实际分母、历史噪声、完整窗口和业务最小变化判断证据强度。

## 一键处理报表

支持 CSV、TSV、XLSX 和 XLSM。默认币种为 USD、报表统计时区为 UTC+0；项目约定不同则显式覆盖。现实业务数据使用 `observed`，明确只作字段或流程样例的文件使用 `fixture`；fixture 证据固定为 D，不得形成现实归因或具体配置建议。

在 Skill 根目录运行：

```powershell
python scripts/topn/run_topn_analysis.py <报表或目录> --project <项目名> --trust-status observed --surface report
```

入口依次完成：

1. 识别综合、漏斗或聚合管理报表。
2. 映射中文列名到规范字段，并写入指标定义和公式。
3. 隔离合计行、小计行和混合粒度。
4. 生成 Data Analytics artifact。
5. 检查完整性、唯一性、有效性、一致性、时间连续性和公式复算。
6. 评估 7、14、28、56 日自适应证据窗口。
7. 输出 `analysis-manifest.json`，声明后续 Data Analytics 路由。

单独检查结构：

```powershell
python scripts/topn/inspect_topon_report.py <report.xlsx> --output <inspection.json>
```

字段无法自动识别时，用脚本的 `--mapping` 提供 `规范字段 -> 原始列名` JSON，不让分析工具猜列名或粒度。保留原始文件，清洗和字段映射写入分析目录的 `derived/`。

## 字段硬约束

- `estimated_revenue` 是 TopOn 预估收益；`revenue_api` 是第三方广告平台报表 API 收益，两者只做对账。
- `impressions` 是 TopOn SDK 展示回调；`impressions_api` 是第三方广告平台报表展示。
- `estimated_ecpm = estimated_revenue / impressions * 1000`；`estimated_arpdau = estimated_revenue / dau`。
- `estimated_revenue_share = estimated_revenue / report_total_estimated_revenue`；`impression_share = impressions / report_total_impressions`。
- `bidding_response_rate = bid_responses / bidding_requests`；`bidding_win_rate = bidding_wins / (bidding_requests * bidding_response_rate)`。
- `ad_ready_rate = ad_ready_at_arrival / ad_scene_arrivals`；`is_ready_success_rate = is_ready_true_results / is_ready_queries`。
- `impression_rate = impressions / fills_at_current_grain`；`impression_success_rate = impressions / display_trigger_successes`。

比率、eCPM、ARPDAU 和人均次数从规范分子分母重算，不平均行级比率。DAU、DEU、留存率、ARPU、ARPDAU、eCPM 和各类比率不能跨重复粒度直接求和。漏斗的 `event_count`、`device_count`、`per_device` 分开分析；聚合管理报表首行 `Total` 的请求是流量请求，广告源明细的请求是广告源请求，不能混合。

常规综合报表不足以直接推导瀑布层数或底价。配置定位至少需要地区、广告位、广告源、广告场景、流量分组或版本中的一个可行动维度；若要讨论层级或底价，还需 `source_instance`、`layer_order`、`floor_price`、`bidding_type`、`timeout_ms`、`latency_ms` 和 `config_effective_at` 等字段。缺字段时只能定位候选对象，不能给出确定参数。

## Data Analytics 联动

现实数据分析必须先读取一键入口生成的 `data-quality.json` 和 `evidence-evaluation.json`，再把 `data-analytics-artifact.json` 交给 Data Analytics：

- 质量问题走 `analyze-data-quality`。
- 指标变化走 `metric-diagnostics`。
- 策略取舍走 `product-business-analysis`。
- 需要交付报告走 `build-report`。

质量 `blocked`、fixture 数据或 D 级证据时停止归因与配置建议。质量 `limited` 时，关键结论不得超过 C 级。artifact 的规范字段、定义、公式和聚合规则必须来自 `references/topn/metric-catalog.json`；生成或发布前完成 artifact 校验。

## 帮助中心检索

构建时已将 TopOn 中文帮助中心正文保存为去除图片语法的本地 Markdown 快照。运行时优先使用本地快照，不依赖网络；需要核对时通过公开来源注册表打开官方 URL。检索命令：

```powershell
python scripts/topn/search_topon_docs.py "查询词" --limit 8
```

命中结果会返回中文标题、栏目、官方 URL 和本地正文片段。帮助文档只用于产品概况、指标定义和操作理解，不用于推断当前竞价环境、广告主预算或广告源实时表现。

## 策略建议与实验

建议按“观察、证据、假设、替代解释、动作、范围、主要指标、护栏指标、决策条件”表达。根据定位选择动作：

- 请求量问题：检查产品触发、频控、场景覆盖和版本行为。
- 填充问题：检查广告源状态、地区覆盖、竞价参与、瀑布和底价。
- 展示转化问题：检查加载时机、缓存、超时、展示条件和用户离开。
- eCPM 问题：先控制流量结构，再检查同细分单元的广告源和竞价配置。
- 单一广告源问题：查看增量收入贡献和替代广告源承接，不只看该广告源 eCPM。

默认采用完整自然日、等长窗口、单变量、小流量、可回滚实验；预先定义主要指标、体验护栏、最小可接受变化、观察窗口、样本量、SRM 检查、扩大条件和回滚条件。不要从行业经验直接给出通用最优底价、瀑布层数、并发请求数或广告频次。默认只输出建议，不修改线上配置。

## 项目状态

需要长期迭代时运行：

```powershell
python scripts/topn/init_topon_project.py <project>
```

项目数据保存在 `output/folder/topn-analysis/<project>/`。不要把用户报表、原始响应、密钥或分析产物复制进 Skill 目录或发布仓库。

## 交付格式

报告写明分析对象、数据范围、粒度、币种、时区、来源、预估/结算口径、质量状态、证据等级、主要发现、贡献拆解、原因假设、替代解释、限制、建议实验和官方文档链接；把“发生了什么”和“为什么发生”分开。百分比同时给分子和分母，或给当前值与基线值，并区分绝对变化和相对变化。
