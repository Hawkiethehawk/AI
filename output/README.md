# output —— Claude 输出内容目录

Claude 产出的文件按**类型**分类存放。规则:每种文件类型一个文件夹,以此类推。

| 文件夹 | 存放内容 |
|--------|----------|
| `folder/` | 多文件的输出(整个项目/技能文件夹),如 skill 目录 |
| `markdown/` | `.md` Markdown 文件 |
| `docx/` | `.docx` Word 文档 |
| `pdf/` | `.pdf` 文档 |
| `xlsx/` | `.xlsx` / `.csv` / `.tsv` 表格 |
| `pptx/` | `.pptx` 演示文稿 |
| `image/` | `.png` / `.jpg` / `.svg` / `.gif` 图片 |
| `code/` | 代码与脚本(`.py` / `.js` / `.sh` 等) |
| `json/` | `.json` / 结构化数据 |
| `text/` | `.txt` 纯文本 |
| `html/` | `.html` 网页 |
| `opml/` | `.opml` 思维导图大纲 |
| `repos/` | 克隆的外部仓库 / 第三方代码 |

> 需要新类型时直接新建对应文件夹。空文件夹用 `.gitkeep` 占位以便 git 跟踪。
