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
