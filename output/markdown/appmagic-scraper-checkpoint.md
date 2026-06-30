# AppMagic Playwright 抓取脚本 · 进度与卡点记录

> 保存时间：2026-06-26 | 下次恢复时请先读取此文件

---

## 一、项目目标

用 Playwright 模拟浏览器访问 AppMagic Top Charts，按品类 Tag 筛选后提取排行榜数据，自动生成 Markdown 周报。

---

## 二、已完成的工作

### 2.1 环境搭建 ✅
- `@playwright/test` v1.61.1 已安装（`package.json` devDependencies）
- Chromium 浏览器已安装（`npx playwright install chromium`）
- Node.js v24.17.0 / npm 11.13.0

### 2.2 脚本文件
| 文件 | 状态 | 说明 |
|------|------|------|
| `scripts/appmagic-scraper.js` | ✅ 已生成，待最终修正 | 主抓取脚本 |
| `output/markdown/appmagic-weekly-tracker-template.md` | ✅ 完成 | 每周手动填充模板 |
| `output/markdown/appmagic-market-insights-2025h1.md` | ✅ 完成 | 市场偏好洞察（基于公开报告） |

### 2.3 技术验证 ✅
- 确认 Playwright 可以打开 AppMagic 页面
- 确认 DOM 结构：使用 `<TOP-APPS-ITEM>` / `<APP-LIST-ITEM>` / `<APP-LIST-ITEM-NUMBER>` 等 Web Components
- 排名提取逻辑已验证可用（`.top-position-number` + 变化 `.diff`）
- 应用名和链接提取已验证可用（`a[href*="/iphone/"]` / `a[href*="/google-play/"]`）
- 发现 AppMagic 有 `/api/v2/tags` 端点可获取全部 tag 层级

---

## 三、Tag ID 验证状态

通过 API `/api/v2/tags` 获取了完整 tag 列表（1495 个 tag）。通过 URL 参数 `?tag=<id>` 实测验证结果如下：

### 3.1 ✅ 最终可用 Tag ID 汇总（经两轮扫描交叉验证，含 id=1-50 扫描）

| Tag ID | 品类名称 | 对应你的需求 | 稳定性 |
|--------|---------|-------------|--------|
| `126` | Hypercasual | ✅ 超休闲 | 稳定 |
| `84` | Match-3 | ✅ 休闲-Match-3 | 有波动(限流假阴性) |
| `243373` | Merge（父级） | ✅ 休闲-Merge-2 | 稳定 |
| `243716` | Match 3D | ✅ 休闲-Match 3D | 有波动 |
| `243715` | Sort Puzzle | ✅ 休闲-Sort Puzzle | 有波动 |
| `243367` | Block Puzzle | ✅ 休闲-Block Puzzle | 稳定 |
| `29` | Casino（父级） | ✅ 休闲-Casino | 稳定(新发现) |
| `30` | Slots | ✅ 休闲-Slots | 有波动(新发现) |
| `244015` | Plinko | ✅ 休闲-Plinko | 稳定 |
| `5` | .io Games | ✅ 超休闲-.io | 有波动(新发现) |
| `4` | Idle Clicker/Tycoon | ✅ 休闲-放置类 | 稳定(新发现) |
| `244699` | PDF Reader | ✅ 工具-PDF | 有波动 |
| `119` | Antivirus & Cleaner | ✅ 工具-杀毒清理 | 有波动 |
| `243477` | Recovery | ✅ 工具-文件恢复 | 有波动 |
| `243528` | Launcher | ✅ 工具-Launcher | 稳定 |
| `243485` | Antivirus | ✅ 工具-杀毒(纯) | 有波动 |
| `243792` | Farming Life Sim | ✅ 休闲-Farming | 有波动 |

### 3.2 ❌ 确认不可用的品类（需要走 UI 交互方案 B）

| Tag ID | 品类 | 状态 |
|--------|------|------|
| `244055` | Hybridcasual | URL 参数不生效 |
| `244624` | Screw Puzzle | URL 参数不生效 |
| `15` | Runner | 超时 |
| `76` | Personalization（父级） | 超时 |
| `243386` | Bingo | 超时 |
| `243784` | Merge-2: Complex Metagame | URL 参数不生效 |
| `243725` | Story-Based: Merge-2 | URL 参数不生效 |

### 3.3 ✅ Tag ID 范围扫描结果 (id=1-50，2026-06-26 已完成)

> 注意：**此前标记为"不可用"的 tag，部分在本次扫描中又变为可用**（如 .io=5、Slots=30），说明之前的失败可能是 Cloudflare Turnstile 限流导致，而非 tag 本身不可用。见卡点 3。

| Tag ID | 名称推断 | 是否可用 | 样例产品 |
|--------|---------|---------|---------|
| `1` | Hidden Objects | ✅ | Search It - Hidden Objects |
| `4` | Idle Clicker/Tycoon | ✅ | Gym Idle Clicker: Fitness Hero |
| `5` | .io Games | ✅ | Paper.io 2, 黑洞大作战 |
| `16` | Strategy / Shooter | ✅ | Garena Free Fire MAX, Fortnite |
| `18` | Sniper | ✅ | 狙击行动：代号猎鹰 |
| `19` | Hidden Objects | ✅ | Search It - Hidden Objects |
| `20` | Escape Puzzle | ✅ | 12 Locks II |
| `25` | Match-3 RPG / Puzzle Battler | ✅ | 帝国与谜题 |
| `26` | Board Games | ✅ | Ludo King™ |
| `27` | Business / Communication | ✅ | WhatsApp Business, Zoom |
| `29` | **Casino（父级）** | ✅ | MONOPOLY GO!, 塔塔冒險隊 |
| `30` | **Slots** | ✅ | Sunday City, Casino 777 |
| `31` | Photo & Video | ✅ | 剪映, Edits, 醒图 |
| `34` | Video Editing | ✅ | 剪映, Edits, InShot |
| `35` | Education | ✅ | 多邻国, Learna AI |
| `36` | Education / Language | ✅ | 多邻国, HelloTalk |
| `37` | Entertainment / Music | ✅ | 抖音, Spotify |
| `40` | Comics | ✅ | 红果漫剧, Naver Webtoon |
| `42` | Game Platforms | ✅ | Steam Mobile, XBOX |
| `43` | Astrology | ✅ | Astrotalk |
| `50` | Collections / Cards | ✅ | FIFA Panini Collection |

**返回全榜（ChatGPT/TikTok，tag 不生效）**: 10, 11, 14, 15, 17, 21, 22, 38, 41, 44
**返回空榜**: 2, 3, 6, 7, 8, 9, 12, 13, 23, 24, 28, 32, 33, 39, 45, 46, 47, 48, 49

### 3.4 Tag 稳定性的关键发现 🔑

**同一 tag 在不同时刻可能成功也可能失败**：
- tag=5 (.io)、tag=30 (Slots) 此前超时/失败，本次扫描成功
- tag=84 (Match-3)、tag=119 (Antivirus & Cleaner)、tag=244699 (PDF Reader) 此前成功，本次扫描返回空
- **根因**：AppMagic 在短时间内大量请求后触发 Cloudflare Turnstile 限流，导致部分请求被拦截或返回降级页面。**tag 本身可能是好的，是限流导致了假阴性。**

---

## 四、核心卡点

### 卡点 1：Tag URL 参数可用性不稳定 ⚠️（部分已解决）
- 通过扫描 id 1-50 发现了 Slots(30)、Casino(29)、.io(5) 等可用 tag
- **但存在 Turnstile 限流假阴性**：同一 tag 不同时刻结果不同
- 仍无法通过 URL 参数使用的品类：Hybridcasual(244055)、Screw Puzzle(244624)、Runner(15)
- **对策**：对不可用 tag 走 UI 交互路线（方案 B）

### 卡点 2：部分页面超时（部分已解决）
- tag=5 (.io)、tag=30 (Slots) 此前超时，本次成功 → 确认是限流而非 tag 问题
- 真正的超时 tag：15(Runner) — 待 UI 交互验证

### 卡点 3：Cloudflare Turnstile 限流 ⚠️（新增重大发现）
- 连续 50+ 个请求后，后续请求开始出现「返回空榜」或「返回全榜」的假阴性
- **必须控制请求间隔 ≥ 15 秒**，且每 10 个 tag 后休息 2 分钟
- 或换用不同浏览器 context + 清除 cookie 来绕过

---

## 五、解决方案思路

### 方案 A：缩小 tag 范围为已验证可用的 ID（最快）
直接使用 `✅ 已验证可用` 列表中的 tag，覆盖：
- 游戏：Hypercasual(126)、Match-3(84)、Merge(243373)、Match 3D(243716)、Sort Puzzle(243715)、Block Puzzle(243367)、Plinko(244015)
- 工具：PDF Reader(244699)、Antivirus & Cleaner(119)、Recovery(243477)、Launcher(243528)、Antivirus(243485)

**需要手动补充的品类**（通过 UI 点击 Tag 侧边栏 → 复制筛选后的 URL）：
- Hybridcasual → 手动操作 UI 后记录实际 URL
- Farming Life Sim → 手动操作 UI 后记录实际 URL
- Casual Casino / Slots / Bingo → 同上
- Personalization → 同上
- Runner → 同上

### 方案 B：放弃 tag URL 参数，改用 UI 交互
1. 进入 Top Charts 页面（无 tag）
2. 点击 Tags 侧边栏的筛选器
3. 搜索并点击目标 tag
4. 等待页面重新加载数据后提取

优点：100% 模拟用户操作，不依赖 URL 参数
缺点：UI 交互选择器需要额外分析（Tags 侧边栏是 Angular 组件）

### 方案 C：混合方案（推荐）
- 已验证可用的 tag → 直接用 URL 参数（快）
- 不可用的 tag → 通过 UI 点击 Tags 侧边栏（慢但可靠）

---

## 六、下次恢复时的操作步骤

1. 读取此文件，理解当前卡点
2. 优先完成 tag ID 范围扫描（1-200），补充可用 tag 清单
3. 对仍然不可用的关键品类（Hybridcasual、Farming、Casino 子类、Personalization），采用 UI 交互方案
4. 处理 Cleaner 和 PDF Reader 抓取返回 0 行的问题（debug DOM 结构差异）
5. 完善发行商名称清洗逻辑（去掉"应用信息"前缀）
6. 端到端跑通一次完整采集 → 生成周报 → 截图验证

---

## 七、关键文件路径

| 文件 | 路径 |
|------|------|
| 抓取脚本 | `E:\LLM-Sandbox\Claude\scripts\appmagic-scraper.js` |
| 周报模板 | `E:\LLM-Sandbox\Claude\output\markdown\appmagic-weekly-tracker-template.md` |
| 市场洞察 | `E:\LLM-Sandbox\Claude\output\markdown\appmagic-market-insights-2025h1.md` |
| 原始数据样例 | `E:\LLM-Sandbox\Claude\output\data\appmagic-raw-W26.json` |
| 截图目录 | `E:\LLM-Sandbox\Claude\output\image\` |
| package.json | `E:\LLM-Sandbox\Claude\package.json` |
| .gitignore | `E:\LLM-Sandbox\Claude\.gitignore`（已加 .appmagic-auth.json） |

---

## 八、关键代码片段

### 提取排名的核心 selector（已验证可用）
```js
// 排名行容器
document.querySelectorAll('TOP-APPS-ITEM')
// 排名数字
item.querySelector('.top-position-number')?.textContent
// 排名变化（NEW / +/-N）
// 结构：APP-LIST-ITEM-NUMBER > DIV.diff(第一个="新"或空) + DIV.top-position-number + DIV.diff(变化值)
// 应用名和链接
item.querySelector('a[href*="/iphone/"], a[href*="/google-play/"]')
// 发行商（在 app-description 内，应用名之后的文本）
```

### 提取 Tag 列表的 API
```js
fetch('/api/v2/tags').then(r => r.json()).then(d => d.data)
// 返回 1495 个 tag，每个有 { id, name, parent_ids, type, status }
```
