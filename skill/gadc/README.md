# GADC

GADC 用一台小米手机采集 GetApps 的游戏分类榜单。手机切换地区后，采集器读取页面上的应用列表，再补齐评分、下载量、开发者和更新时间。

## 需要的工具

- 小米 Global ROM 手机，已解锁并授权 USB 调试
- GetApps 已安装
- 电脑已安装 ADB 和 Python
- `collector.py`：采集脚本
- `config.json`：国家、分类和采集数量配置
- SQLite：保存中间结果，支持中断后继续

## 采集范围

- 国家：巴西 `BR`、印度尼西亚 `ID`、俄罗斯 `RU`、西班牙 `ES`
- 分类：休闲游戏、益智、纸牌游戏
- 数量：默认每个国家和分类采集前 20 个应用

## 怎么运行

在 `F:\ADB\gadc` 目录执行：

```powershell
python collector.py diagnose
python collector.py run
```

`diagnose` 先检查手机连接和 GetApps 是否能启动。采集被中断后，使用下面的命令继续：

```powershell
python collector.py run --resume-run-id <run_id>
```

只想先跑一个国家时：

```powershell
python collector.py run --max-regions 1
```

## 采集流程

1. 脚本读取 `config.json`，确定国家、地区码、分类和每类数量。
2. 脚本通过 ADB 写入 GetApps 地区码，停止并重启 GetApps，等待页面刷新。
3. 脚本打开“游戏”页面，查找“休闲游戏”“益智”“纸牌游戏”。分类入口和排行入口同级，不能从“排行-游戏”进入。
4. 有分类标签栏的地区，脚本直接点击标签。西班牙没有专门的分类标签栏，脚本会从游戏主页向下滚动，找到对应的分类专区后再进入。
5. 脚本用 `uiautomator dump` 读取屏幕上的 UI XML，提取排名、应用名和分类。每次短距离滚动并保留重叠内容，避免漏掉分页交界的应用。
6. 脚本打开应用详情页，从当前页面 URI 读取包名。包名是后续查询网页信息的唯一键。
7. 脚本优先查询 GetApps 网页；GetApps 不可达或字段缺失时，再按包名查询 Google Play。相同包名只请求一次网页，后续直接使用缓存。
8. 脚本按包名去重，检查排名是否连续为 1 到 20，然后写入 SQLite、导出 CSV，并按需要同步飞书。

## 链接和详情规则

- GetApps 页面可用时，使用 GetApps 链接和详情。
- GetApps 不可达、Google Play 可达时，使用 Google Play 链接，并在应用名后添加 `-gp`。
- 两个页面都不可达时，只显示应用名，不添加超链接。
- 评分、下载量、开发者和更新时间优先来自 GetApps，缺失时由 Google Play 补齐。
- 更新时间统一为 `yyyy/mm/dd`，例如 `2026/08/17`。两端都没有公开评分时，评分留空。

## 输出内容

最终 CSV 和飞书结果只保留九列：

`地区、分类、排名、应用名、包名、评分、下载量、开发者、更新时间`

每次导出单独命名为 `rank-yyyymmdd-01`。内部使用的 `runid`、`rankingtype`、`rawtext`、`capturedat` 不会出现在最终结果中。

## 代码职责

- `Device` 负责 ADB 命令、启动应用、点击、滚动和读取 UI XML。
- `switch_region()` 负责切换 GetApps 地区并重启应用。
- `open_game_channel()` 和 `tap_game_section_entry()` 负责寻找游戏分类入口。
- `collect_visible_items()` 负责读取普通分类榜单，`collect_visible_section_items()` 负责读取西班牙主页的分类专区。
- `enrich_visible_items()` 负责打开详情页取得包名。
- `get_preferred_web_metadata()` 负责 GetApps 优先、Google Play 回退。
- `export_csv()` 负责导出最终九列。

## 检查标准

- 每个国家和分类都有 20 条记录，排名连续为 1 到 20。
- 同一分类内包名不重复。
- 每个链接都实际测试可达性。
- 导出后回读 CSV，抽查第一条、中间条和最后一条。

当前不使用第三方 APK 网站，也不采集上线日期。
