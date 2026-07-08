---
name: output-file-router
description: When Claude writes output files, route them to the correct subfolder under output/ by file extension. Trigger on any Write/Edit tool call producing a file under output/ — ensures .md goes to markdown/, .txt to text/, .opml to opml/, etc. No user-facing interaction; purely a routing rule.
version: 1.0.1
author: configured targetthehawk
license: MIT
metadata:
  hermes:
    tags: [output, file-routing, convention, automation]
    related_skills: []
---

# output-file-router — 输出文件自动路由

核心原则：**所有 Claude 产出的文件，根据扩展名自动放入 `output/` 下对应子文件夹。**

## 路由规则表

| 扩展名 | 目标子文件夹 | 示例 |
|--------|-------------|------|
| `.md` | `output/markdown/` | `output/markdown/混变工具商业化全链路.md` |
| `.txt` | `output/text/` | `output/text/飞书粘贴板.txt` |
| `.opml` | `output/opml/` | `output/opml/思维导图.opml` |
| `.docx` | `output/docx/` | `output/docx/报告.docx` |
| `.pdf` | `output/pdf/` | `output/pdf/方案.pdf` |
| `.xlsx` / `.csv` / `.tsv` | `output/xlsx/` | `output/xlsx/数据.csv` |
| `.pptx` | `output/pptx/` | `output/pptx/演示.pptx` |
| `.png` / `.jpg` / `.svg` / `.gif` | `output/image/` | `output/image/截图.png` |
| `.py` / `.js` / `.sh` / `.ps1` 等 | `output/code/` | `output/code/script.py` |
| `.json` | `output/json/` | `output/json/config.json` |
| `.html` | `output/html/` | `output/html/index.html` |
| 多文件项目/目录 | `output/folder/` | `output/folder/skill-name/` |
| 克隆的外部仓库 | `output/repos/` | `output/repos/CC-Web-MCP/` |

## 执行规则

1. **写入文件前，先根据扩展名确认目标子文件夹。**
2. **如果对应子文件夹不存在，先建目录（加 `.gitkeep` 占位）。**
3. **不额外通知用户路径选择**——这是默认行为，不是异常。
4. **对于 `output/folder/`**：当输出是一个多文件的目录结构时使用（不是单个文件）。
5. **新增扩展名**：如果遇到上表没覆盖的扩展名，参照上表逻辑类比，并在 `output/README.md` 里补一行。

## 常见易错场景

- `.txt` 文件很容易被随手丢进 `output/markdown/`，注意区分——纯文本走 `output/text/`。
- `.opml` 飞书思维导图导入用的格式，不是 markdown 族，走 `output/opml/`。
- 同名不同后缀的文件（如 `方案.md` + `方案.opml`）各自去各自的子文件夹，互不干扰。

## 检查清单

写入任何 `output/` 下的文件前：
- [ ] 扩展名匹配上表规则？
- [ ] 目标子文件夹已存在？
- [ ] 不是 `.md` 的内容没有误放入 `output/markdown/`？

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
