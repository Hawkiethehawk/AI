# Xiaomi Ranking Collector

单台海外小米手机的 GetApps 榜单采集器。通过 ADB 调用 Android UIAutomator，切换 HyperOS 地区、打开 GetApps，并将可见榜单保存到 SQLite 和 CSV。

## 准备

1. 在手机开启“开发者选项 → USB 调试”和“USB 调试（安全设置）”。
2. 使用 USB 连接手机并接受电脑调试授权。
3. 运行 `.\setup.ps1` 下载 Google 官方 Android Platform Tools。
4. 复制 `config.example.json` 为 `config.json`，按手机界面修改地区和品类名称。

## 命令

```powershell
python .\collector.py diagnose --config .\config.json
python .\collector.py run --config .\config.json
```

默认只采集“游戏”页面下的“休闲游戏”“益智”“纸牌游戏”三个分类榜单。示例配置将“巴西”放在第一位，并要求任务从 `BR` 启动；这是因为该机的出厂地区是巴西，切换到其他地区后可能无法再从系统列表选回。首次建议只配置两个地区、`top_n: 10`，确认界面选择与数据正确后再扩展。`regions` 使用手机“地区”列表实际显示的名称；当前这台手机的系统语言是中文，因此应填写“印度尼西亚”“俄罗斯”“西班牙”等中文名称。

输出默认位于 `data/`：

- `rankings.db`：结构化数据和每次运行记录
- `rankings.csv`：便于导入 Excel/分析工具，包含榜单范围（游戏/应用）和应用实际品类
- `runs/<run-id>/`：截图、UI XML 和错误日志

## 注意

- 采集器默认只强制停止 GetApps，不清除账号数据。
- 地区切换可能受 IP、SIM 卡和小米账号影响；配置中的 `network_wait_seconds` 用于等待商店刷新。
- GetApps 的控件文字和包名会随 ROM 版本变化，诊断命令会保存页面 XML，便于补充选择器。
- 某些 Global ROM 会把出厂地区标记为“系统”项；切换后该出厂项可能不再出现在可选列表中。无 root 的 ADB 无法写回只读系统属性，正式运行前应确认是否接受最终停留在最后一个采集地区。
