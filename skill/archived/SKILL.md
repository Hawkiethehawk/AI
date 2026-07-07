# 归档 (Archive)

## 描述
将 `output/` 和 `scripts/` 中超过 7 天未修改的文件自动归档到 `archived/` 目录，按文件类型分到对应子目录（data/、xlsx/、markdown/、image/、scripts/ 等）。保持仓库整洁，减少无效文件。

## 触发
- "归档"
- "清理旧文件"
- "archive old files"
- "移到 archived"

## 用法

### 预览模式（只查看，不移动）
```bash
DRY_RUN=1 bash scripts/archive.sh
```

### 正式执行
```bash
bash scripts/archive.sh
```

### 自定义天数
```bash
DAYS=14 bash scripts/archive.sh    # 归档超过 14 天未修改的文件
```

## 规则

### 文件类型 → 归档子目录映射
| 扩展名 | 归档目录 |
|---|---|
| .json .txt .csv .opml .pdf .pptx .yaml .yml | data/ |
| .xlsx | xlsx/ |
| .md | markdown/ |
| .png .jpg .svg | image/ |
| .py .js .sh | scripts/ |
| .docx | docx/ |
| .html .css | code/ |

### 排除
- `.gitkeep` 文件不归档
- `archived/` 目录自身不处理
- 目标文件已存在则跳过（不覆盖）

### 安全
- 使用 `DRY_RUN=1` 先预览
- 对 git 追踪的文件优先用 `git mv`
- 目标已存在时跳过不覆盖
