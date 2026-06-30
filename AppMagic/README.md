# AppMagic 周报采集项目

> **适用读者：LLM / AI Agent**  
> 本文档描述项目的完整代码结构、数据流、关键函数和约定，供其他大模型接手时快速理解。

## 一、项目目标

从 AppMagic Top Charts 中系统化筛选值得跟踪的应用，输出为 Excel 周报。

核心流程：抓取 6 周榜单 → 计算排名变化 → 筛选"重点池" → 标记"重点关注" → 补全详情 → 导出 Excel。

## 二、文件结构

```
AppMagic/
├── README.md                          # 本文档
├── scripts/
│   ├── appmagic-weekly.js             # [核心] 数据采集 + 筛选 + 富化 + 写出 JSON
│   ├── appmagic_xlsx.py               # 单品类 Excel 导出
│   ├── appmagic_xlsx_merged.py        # 全品类合并 Excel 导出
│   └── appmagic-login.js              # 浏览器登录助手（建立持久登录态）
├── output/
│   ├── data/
│   │   ├── appmagic-{品类}-weekly.json        # 单品类最终产出
│   │   ├── appmagic-tags-full.json            # AppMagic 全量 tag 字典（1495 条）
│   │   ├── appmagic-enrich-cache-{日期}.json   # 富化数据缓存（评分/国家分布），当天复用
│   │   ├── appmagic-weekly-cache-{品类}-{日期}.json  # 首页榜单缓存，当天复用
│   │   └── appmagic-run-state-{日期}.json      # 运行状态（断点续跑）
│   └── xlsx/
│       ├── AppMagic-{YYYYMMDD}.xlsx           # 全品类合并 Excel
│       └── AppMagic-{品类}-{YYYYMMDD}.xlsx    # 单品类样品 Excel
└── .appmagic-userdata/                # Playwright 持久化浏览器 profile（含登录态）
```

## 三、核心技术栈

- **Node.js + Playwright**：浏览器自动化，复用持久化登录态
- **AppMagic 内部 API**：不走 DOM 解析，直接调用 `/api/v2/top/united-apps` 等接口
- **Python + openpyxl**：Excel 生成与格式化

## 四、核心脚本详解

### 4.1 `appmagic-weekly.js` — 数据采集与筛选

**运行方式：**
```bash
CAT=超休闲 node AppMagic/scripts/appmagic-weekly.js
```

**环境变量：**
| 变量 | 说明 | 默认值 |
|---|---|---|
| `CAT` | 品类名（对应 CATS 对象的 key） | `超休闲` |
| `MAXA` | 缺国别时最大重试次数 | `8` |
| `LIST_ONLY` | 设为 `1` 跳过国别富化，仅出清单 | 无 |

**执行流程（`main()` 函数）：**

1. **启动浏览器** → `chromium.launchPersistentContext(USER_DATA_DIR)` 复用登录态
2. **拉 6 周榜单** → 循环调用 `fetchWeek(page, date)`，优先读当天缓存
3. **空 tags 回退** → 调用 `fallbackTags(CATEGORY.tag)` 用品类 tag 链补全
4. **组装 records** → 计算 `change`（排名变化，正=上升）、`relPct`（相对变化率）、`history`（6 周轨迹）
5. **筛选 focus** → 按 `riseThreshold()` 分档阈值 + 首次进 Top100 两条规则
6. **标记 _focus** → 按"排名变化突出"和"潜力新品候选"两条规则
7. **富化 enrich** → 对 focus 产品调用 `enrichApp()`，补评分/评论/国家分布，缓存当天复用
8. **最终判定潜力新品** → 需 enrich 后拿到成熟市场占比才能最终判定
9. **写出 JSON** → `appmagic-{品类}-weekly.json`

**关键函数签名：**

```js
// 抓取单周榜单（在浏览器上下文内直接 fetch API）
async function fetchWeek(page, date)
// 返回: { date: string, rows: [{ rank, diff, uid, name, publisher, hq, headcount, release, storeIds, stores, tags }] }

// 富化单个 app（评分 + 国家分布）
async function enrichApp(page, uid, storeIds, skipAppInfo)
// 调用 /api/v2/applications/app-info (POST) 和 /api/v2/united-applications/data-countries
// 返回: { rating, reviews, contentRating, released, countries }

// 排名变化分档阈值（决定是否进入 focus 池）
function riseThreshold(rank)
// 返回: 3|5|10|20|30|Infinity

// 国家分布汇总（成熟/新兴市场划分）
function summarizeCountries(countries)
// 返回: { dlList, revList, dlCount, revCount, usjpPct, mature, emerging, market }

// 指数退避重试间隔
function backoffMs(attempt)
// 返回: 60000 → 180000 → 300000 → ...（ms）

// 空 tags 回退：用品类 tag ID 串从全量字典构建 tags 数组
function fallbackTags(tagStr)  // tagStr 如 '9,115,119'
```

**品类配置（CATS 对象）：**
```js
{
  '超休闲':      '3,126',        // Games → Hypercasual（两层）
  '休闲':        '3,243572',     // Games → Casual（两层）
  'Launcher':    '9,76,243528',  // Apps → Personalization → Launcher（三层）
  '杀毒软件、清理': '9,115,119',   // Apps → Tools → Antivirus & Cleaner（三层）
  '文件恢复':      '9,115,243477', // Apps → Tools → Recovery（三层）
  'PDF阅读器':    '9,243756,244699', // Apps → Productivity → PDF Reader（三层）
}
```
tag 值格式：逗号分隔的 tag ID 串。API 参数 `tag=a,b,c` 表示多层分类路径，和 AppMagic 页面实际查看口径一致。

**周数组（WEEKS）：**
```js
// 新→旧，周一为锚点。需根据当前周手动更新
['2026-06-22', '2026-06-15', '2026-06-08', '2026-06-01', '2026-05-25', '2026-05-18']
```

**筛选规则详解：**

*入池（focus）条件（任一满足）：*
| 本周排名段 | 需上升 ≥ |
|---|---|
| 1-5 | 3 位 |
| 6-10 | 5 位 |
| 11-50 | 10 位 |
| 51-100 | 20 位 |
| 101-200 | 30 位 |
| 首次进 Top100 | 无排名门槛 |

*重点关注（_focus）条件（任一满足）：*
| 维度 | 规则 |
|---|---|
| 排名变化突出（前10） | 绝对上升 ≥5 位 |
| 排名变化突出（10-200） | `(上周排名 - 本周排名) / 本周排名 > 50%` |
| 潜力新品 | 首次进 50-100 + 发行商非大厂 + 成熟市场下载占比 ≥25% |

**缓存策略：**
- 富化缓存 `enrich-cache-{今天}.json`：同一天内跨品类复用，次日自动失效（空文件无历史继承）
- 首页缓存 `weekly-cache-{品类}-{今天}.json`：同一天同品类复用
- 运行状态 `run-state-{今天}.json`：记录每个品类的进度（`weekly_done`, `enrich_done`, `focus` 数量）

**限流策略：**
- 6 周榜单间：随机延迟 2-5 秒
- detail 成功后：随机延迟 2-5 秒
- 缺国别时：指数退避 60s→180s→300s，之后维持 300s，最多 8 次

### 4.2 `appmagic_xlsx.py` — 单品类 Excel

**运行方式：**
```bash
python AppMagic/scripts/appmagic_xlsx.py 超休闲
```

读取 `appmagic-{品类}-weekly.json`，输出 `AppMagic-{品类}-{YYYYMMDD}.xlsx`。

**输出列（20 列）：**
序号 | 游戏名（超链接） | 品类 | Tag路径 | 本周排名 | 上周排名 | 变化量 | 6周排名轨迹 | Top50稳定性 | 近30天下载国Top5 | 近30天收入国Top5 | 市场属性 | 上线日期 | 评分 | 评论数 | 发行商 | 总部 | 重点关注 | 备注

**格式约定：**
- 游戏名列：超链接到 Google Play 或 App Store，重点关注行加粗 + 橙色底色
- 变化量列：绿（上升）/ 红（下降）/ 黄（NEW）
- 重点色：仅在**游戏名**列着色（`FOCUS_FILL = F8CBAD`），不整行着色
- 注目列：不额外着色
- 冻结：序号 + 游戏名列

**`tag_path()` 函数：**
- 游戏：`domain / meta / games子链`（通过 `_chain()` 按 `parent_ids` 递归构造 root→leaf）
- 工具：`domain / apps子链`（同 `_chain` 逻辑）
- 分隔符：` / `

### 4.3 `appmagic_xlsx_merged.py` — 全品类合并 Excel

**运行方式：**
```bash
python AppMagic/scripts/appmagic_xlsx_merged.py
```

读取全部 6 个品类的 weekly JSON，合并到同一个 Sheet，输出 `AppMagic-{YYYYMMDD}.xlsx`。

**特殊处理：**
- Sheet 名 = 周一的日期（如 `20260622`），从 `weeks[0]` 提取
- 品类列用浅色带区分（6 种颜色）
- 同品类内按本周排名升序
- 品类首行加粗分割线
- 冻结：序号 + 游戏名 + 品类列

### 4.4 `appmagic-login.js` — 登录助手

当 `.appmagic-userdata` 登录态过期时，运行此脚本弹出可视化浏览器窗口完成登录：
```bash
node AppMagic/scripts/appmagic-login.js
```

## 五、数据流图

```
appmagic-login.js ──→ .appmagic-userdata/ (持久登录态)
                            │
                            ▼
              appmagic-weekly.js (单品类)
                   │                │
                   │  /api/v2/top/united-apps (×6周)
                   │  /api/v2/applications/app-info (×N个focus)
                   │  /api/v2/united-applications/data-countries (×N个focus)
                   │                │
                   ▼                ▼
         weekly-cache-*.json   enrich-cache-*.json
                   │                │
                   ▼                ▼
         appmagic-{品类}-weekly.json (最终产出)
                   │
                   ├──→ appmagic_xlsx.py ──→ AppMagic-{品类}-{date}.xlsx
                   │
                   └──→ appmagic_xlsx_merged.py ──→ AppMagic-{date}.xlsx
```

## 六、JSON 数据结构

### weekly JSON 顶层结构
```json
{
  "category": { "label": "超休闲", "tag": "3,126" },
  "weeks": ["2026-06-22", ...],
  "generatedAt": "2026-06-30T...",
  "marketDef": { "mature": [...], "emerging": [...] },
  "records": [ /* 全量 1000 条 */ ],
  "focus": [ /* 筛选后的重点集 */ ]
}
```

### record / focus 元素结构
```json
{
  "rank": 4,
  "diff": 2,
  "uid": 123456,
  "name": "App Name",
  "publisher": "Publisher Name",
  "hq": "US",
  "headcount": 500,
  "release": "2024-01-15",
  "storeIds": ["1_com.example.app", "2_123456789"],
  "stores": ["Google Play", "iPhone"],
  "tags": [{"id": 126, "name": "Hypercasual", "type": "meta", "parent_ids": []}],
  "url": "https://play.google.com/store/apps/details?id=com.example.app",
  "lastWeek": 10,
  "isNew": false,
  "change": 6,
  "relPct": 0.6,
  "history": [4, 10, 8, 12, 15, 20],
  "streak50": 6,
  "weeksOnBoard": 6,
  "_flags": ["↑6（档≥3）"],
  "_firstInTop100": false,
  "_focus": true,
  "_focusReasons": ["排名上升6名（+150%）"],
  "_pendingNotable": false,
  "rating": 4.5,
  "reviews": 12345,
  "contentRating": "Everyone",
  "release": "2024-01-15",
  "country": {
    "dlList": "US 25.0% / IN 15.0% / BR 10.0% / ID 8.0% / MX 5.0%",
    "revList": "US 40.0% / JP 15.0% / GB 10.0% / DE 8.0% / FR 5.0%",
    "dlCount": 73,
    "revCount": 45,
    "usjpPct": 30.0,
    "mature": 55.0,
    "emerging": 45.0,
    "market": "偏成熟(成熟55.0%/新兴45.0%)"
  }
}
```

### enrich cache 结构
```json
{
  "123456": {
    "rating": 4.5,
    "reviews": 12345,
    "contentRating": "Everyone",
    "release": "2024-01-15",
    "country": { "dlList": "...", "revList": "...", ... }
  }
}
```
key = `uid`（united_application_id），跨品类全局复用。

## 七、常见问题与约定

### 1. 为什么用 Playwright 而不是直接 fetch？
AppMagic 鉴权 token 存在浏览器 `localStorage.datamagic.token` 中，且会动态刷新。Playwright 复用持久化浏览器 profile 可以维持登录态，并在 `page.evaluate()` 内直接从 `localStorage` 读取 token 附加到 API 请求。

### 2. 为什么要用品类 tag 链（如 `3,126`）而不是单个 tag？
AppMagic 页面实际的 tag 参数就是多层叠加（如 `tag=9,115,119`）。如果只用单个最细 tag（如 `119`），排名口径会和页面不一致，导致某些产品排名偏差。

### 3. 空 tags 问题
部分产品 API 返回的 tags 数组为空（因为它们是被多 tag 叠加筛选"带进来"的边缘产品）。`fallbackTags()` 函数会用品类的 tag 链从全量字典 `appmagic-tags-full.json` 中构建回退 tags，确保 Tag路径列不空白。

### 4. 缓存为什么按天分文件？
同一天内多次运行时复用缓存（例如只改 Excel 格式后重跑），避免重复请求 API。次日自动失效（空文件无历史继承），确保数据新鲜度。不需要手动清理旧缓存。

### 5. 如何更新周数组？
修改 `appmagic-weekly.js` 中 `WEEKS` 常量，保持 6 个元素、新→旧、周一为锚点。例如 6/29 这周：`['2026-06-29', '2026-06-22', '2026-06-15', '2026-06-08', '2026-06-01', '2026-05-25']`。

### 6. 如何添加新品类？
1. 在 `CATS` 对象中添加条目（品类名 → tag ID 串）
2. 在 `appmagic_xlsx_merged.py` 的 `ORDER` 列表中添加同名品类
3. 在 `CAT_FILLS` 中为新品类分配一个颜色
4. 如果需要，在 `BIG_PUBS` 中补充该品类的大厂名单

### 7. 中途停止后如何续跑？
检查 `appmagic-run-state-{今天}.json`，查看每个品类的完成状态。已完成的品类 JSON 可直接复用，只需补跑未完成的品类。

### 8. 环境依赖
- Node.js + `@playwright/test`
- Python + `openpyxl`
- AppMagic 账号（已登录的 `.appmagic-userdata` 目录）
