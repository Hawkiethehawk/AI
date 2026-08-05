param(
    [string]$SkillRoot = "",
    [string]$ViewerRoot = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($SkillRoot)) {
    $SkillRoot = Join-Path $repoRoot "skill/app-monetization-expert"
}
if ([string]::IsNullOrWhiteSpace($ViewerRoot)) {
    $ViewerRoot = Join-Path $repoRoot "output/sites/app-monetization-viewer"
}

$templatePath = Join-Path $ViewerRoot "template.html"
if (-not (Test-Path -LiteralPath $templatePath)) {
    throw "Viewer template not found: $templatePath"
}

New-Item -ItemType Directory -Force -Path $ViewerRoot | Out-Null

$docSpecs = @(
    @{ id = "skill"; path = "SKILL.md"; title = "入口与规则"; group = "入口"; tag = "Core"; description = "触发条件、运行边界、知识路由、判断规则和输出结构"; kind = "entry" },
    @{ id = "iaa-foundations"; path = "references/iaa-foundations.md"; title = "IAA 基础与广告设计"; group = "IAA 核心"; tag = "Design"; description = "收益模型、广告形式、广告位、流量分组和体验护栏"; kind = "iaa" },
    @{ id = "iaa-launch-and-platform-configuration"; path = "references/iaa-launch-and-platform-configuration.md"; title = "IAA 配置、上线与平台操作"; group = "IAA 核心"; tag = "Workflow"; description = "六阶段上线、聚合对象、参数映射、Bidding、Waterfall、兜底和验收"; kind = "iaa" },
    @{ id = "iaa-measurement-and-iteration"; path = "references/iaa-measurement-and-iteration.md"; title = "IAA 数据分析与迭代"; group = "IAA 核心"; tag = "Metrics"; description = "数据口径、三条漏斗、收益树、诊断、实验和回退"; kind = "iaa" },
    @{ id = "topn-analysis"; path = "references/topn-analysis.md"; title = "TopOn 报表分析模块"; group = "TopOn 分析"; tag = "TopOn"; description = "报表识别、字段约束、证据等级、质量审计、实验和 Data Analytics 交接"; kind = "topn" },
    @{ id = "topn-data-contract"; path = "references/topn/data-contract.md"; title = "TopOn 数据约定"; group = "TopOn 分析"; tag = "TopOn"; description = "报表类型、指标语义、可加性、粒度和数据质量规则"; kind = "topn" },
    @{ id = "topn-metrics-and-diagnostics"; path = "references/topn/metrics-and-diagnostics.md"; title = "TopOn 指标拆解与诊断"; group = "TopOn 分析"; tag = "TopOn"; description = "收入、展示、eCPM、请求到展示漏斗和维度贡献拆解"; kind = "topn" },
    @{ id = "topn-adaptive-evidence-thresholds"; path = "references/topn/adaptive-evidence-thresholds.md"; title = "TopOn 自适应证据门槛"; group = "TopOn 分析"; tag = "TopOn"; description = "窗口选择、样本量、历史噪声和证据等级评估"; kind = "topn" },
    @{ id = "topn-evidence-and-guardrails"; path = "references/topn/evidence-and-guardrails.md"; title = "TopOn 证据模型与护栏"; group = "TopOn 分析"; tag = "TopOn"; description = "文档、观测、计算、推断、建议的边界与禁止推断"; kind = "topn" },
    @{ id = "topn-recommendation-workflow"; path = "references/topn/recommendation-workflow.md"; title = "TopOn 配置建议与实验"; group = "TopOn 分析"; tag = "TopOn"; description = "动作选择、单变量实验、指标护栏和回滚条件"; kind = "topn" },
    @{ id = "topn-report-output"; path = "references/topn/report-output.md"; title = "TopOn 分析报告输出"; group = "TopOn 分析"; tag = "TopOn"; description = "分析对象、口径、发现、限制和官方引用的交付结构"; kind = "topn" },
    @{ id = "topn-report-types"; path = "references/topn/report-types.json"; title = "TopOn 报表类型登记"; group = "TopOn 分析"; tag = "TopOn"; description = "综合、漏斗和聚合管理报表的字段指纹与分析规则"; kind = "topn" },
    @{ id = "topn-metric-catalog"; path = "references/topn/metric-catalog.json"; title = "TopOn 指标目录"; group = "TopOn 分析"; tag = "TopOn"; description = "规范字段、定义、公式、来源和聚合规则"; kind = "topn" },
    @{ id = "user-acquisition-and-payback"; path = "references/user-acquisition-and-payback.md"; title = "买量回收与商业化协同"; group = "增长支持"; tag = "Growth"; description = "CAC、LTV、ROAS、事件回传、归因和放量门禁"; kind = "support" },
    @{ id = "product-research-and-cases"; path = "references/product-research-and-cases.md"; title = "产品研究与匿名案例"; group = "增长支持"; tag = "Research"; description = "AppMagic 筛选、产品拆解、场景审查和案例迁移"; kind = "support" },
    @{ id = "iap-metrics-funnel-diagnostics"; path = "references/iap-metrics-funnel-diagnostics.md"; title = "IAP 指标、漏斗与诊断"; group = "IAP 按需"; tag = "IAP"; description = "订阅指标、LTV、付费漏斗、续订、流失和退款"; kind = "iap" },
    @{ id = "iap-paywall-pricing-ops"; path = "references/iap-paywall-pricing-ops.md"; title = "IAP 付费墙、定价与运营"; group = "IAP 按需"; tag = "IAP"; description = "付费墙、定价、试用、商店机制、实验和合规"; kind = "iap" },
    @{ id = "public-sources"; path = "references/public-sources.md"; title = "公开来源与引用注册表"; group = "来源"; tag = "Sources"; description = "公开 URL、来源层级、引用编号和原始页面"; kind = "source" }
)

$docs = foreach ($spec in $docSpecs) {
    $fullPath = Join-Path $SkillRoot $spec.path
    if (-not (Test-Path -LiteralPath $fullPath)) {
        throw "Skill document not found: $fullPath"
    }

    $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
    $lines = @($content -split '\r?\n').Count
    $headings = @(
        [regex]::Matches($content, '(?m)^#{1,3}\s+(.+?)\s*$') |
            ForEach-Object { $_.Groups[1].Value.Trim() }
    )

    [pscustomobject]@{
        id = $spec.id
        path = $spec.path.Replace("\", "/")
        title = $spec.title
        group = $spec.group
        tag = $spec.tag
        description = $spec.description
        kind = $spec.kind
        lines = $lines
        headings = $headings
        content = $content
    }
}

$sourcePath = Join-Path $SkillRoot "references/public-sources.md"
$sourceText = [System.IO.File]::ReadAllText($sourcePath, [System.Text.Encoding]::UTF8)
$sourceEntries = @(
    [regex]::Matches(
        $sourceText,
        '(?m)^\|\s*([A-Z][A-Z0-9-]+)\s*\|\s*([^|]+?)\s*\|\s*\[([^\]]+)\]\((https?://[^)]+)\)\s*\|'
    ) | ForEach-Object {
        $id = $_.Groups[1].Value.Trim()
        [pscustomobject]@{
            id = $id
            scope = $_.Groups[2].Value.Trim()
            title = $_.Groups[3].Value.Trim()
            url = $_.Groups[4].Value.Trim()
        }
    }
)

$urlCount = @([regex]::Matches($sourceText, 'https?://')).Count
$manifest = [pscustomobject]@{
    generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm")
    skillName = "app-monetization-expert"
    docs = @($docs)
    sources = $sourceEntries
    meta = [pscustomobject]@{
        fileCount = @($docs).Count
        lineCount = (@($docs) | Measure-Object -Property lines -Sum).Sum
        iaaCount = @($docs | Where-Object { $_.kind -eq "iaa" }).Count
        iapCount = @($docs | Where-Object { $_.kind -eq "iap" }).Count
        sourceCount = @($sourceEntries).Count
        urlCount = $urlCount
    }
}

$json = $manifest | ConvertTo-Json -Depth 10 -Compress
$json = $json.Replace("</script>", "<\/script>")
$template = [System.IO.File]::ReadAllText($templatePath, [System.Text.Encoding]::UTF8)
$html = $template.Replace("__SKILL_VIEWER_DATA__", $json)
$outputPath = Join-Path $ViewerRoot "index.html"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outputPath, $html, $utf8NoBom)

Write-Output "Built $outputPath"
Write-Output "Documents: $(@($docs).Count); sources: $(@($sourceEntries).Count); URLs: $urlCount"
