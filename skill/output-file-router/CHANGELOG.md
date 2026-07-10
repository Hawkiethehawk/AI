# Changelog — output-file-router

## 1.0.1
- **frontmatter 清理**：移除非标准、无任何脚本/loader 使用的游离字段 `home: true`；补 `metadata.hermes.related_skills: []` 与其它 skill 对齐。
- 路由规则与执行逻辑未改动。

## 1.0.0
- 初始版本：按扩展名把 `output/` 下的产出文件路由到对应子文件夹（markdown/text/opml/docx/pdf/xlsx/pptx/image/code/json/html/folder/repos），含路由规则表、执行规则、易错场景与检查清单。
