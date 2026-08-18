# GADC 工作流参考

## 设备与地区

```text
adb shell settings put system com.xiaomi.market.lastRegion BR
adb shell am force-stop com.xiaomi.mipicks
adb shell monkey -p com.xiaomi.mipicks 1
```

按国家顺序逐个执行并等待内容刷新：`BR`、`ID`、`RU`、`ES`。若设备不响应该键，再通过系统地区设置切换，并重启 GetApps。切换后先验证页面国家/货币或分类内容已经改变，再开始抓取。

## 分类定位

入口必须是“游戏”一级页面；“排行”和分类是同级入口。优先点官方标签栏中的“休闲游戏”“益智”“纸牌游戏”。若标签栏不存在，滚动游戏主页寻找同名分类专区，记录实际展示文本；不要把“排行-游戏”当作分类来源。

## 提取与去重

使用小步滚动并保留一项重叠，直到拿到 `Top N` 个不同包名。将排名、显示名和包名同时保存；遇到重复包名，以首次出现的较高排名为准。缺少包名的条目进入异常清单，不要用应用名猜包名。

## 详情与链接

GetApps 网页详情链接按站点实际返回的 URL 保存。GP 回退使用：

```text
https://play.google.com/store/apps/details?id=<package_name>
```

对每个 URL 发起一次实际请求并跟随重定向；最终 HTTP 非错误且页面属于目标应用才视为可达。GetApps 不可达而 GP 可达时，在应用名末尾添加 `-gp`；两者都不可达时不放超链接。

## 字段映射

| 输出列 | 来源与规则 |
|---|---|
| 地区 | 当前 GetApps 地区 |
| 分类 | 当前游戏一级分类 |
| 排名 | 列表中的 1-based rank |
| 应用名 | GetApps 名称；GP 回退追加 `-gp` |
| 包名 | 列表或详情页明确给出的 package name |
| 评分 | GetApps/GP 公开评分；都没有则空 |
| 下载量 | GetApps 优先，GP 补齐 |
| 开发者 | GetApps 优先，GP 补齐 |
| 更新日期 | GetApps 优先，GP 补齐；统一为 `yyyy/mm/dd` |

不要写入 `runid`、`rankingtype`、`packagename`、`rawtext`、`capturedat` 等旧字段名或审计字段。

## 交付命名

每次结果单独命名为 `rank-yyyymmdd-01`（同日依次 `-02`、`-03`）。导出文件、日志和同步说明使用同一 run ID。完成一个国家后可以先写入并回读，再继续下一个国家，但不能把未完成国家标记为完成。
