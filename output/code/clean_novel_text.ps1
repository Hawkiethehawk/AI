param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath
)

$file = Get-Item -LiteralPath $InputPath -ErrorAction Stop
$backupDir = Join-Path $file.DirectoryName 'backups'
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$backupPath = Join-Path $backupDir ($file.BaseName + '.pre-clean.txt')
if (-not (Test-Path -LiteralPath $backupPath)) {
    Copy-Item -LiteralPath $file.FullName -Destination $backupPath
}

$original = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
$lines = $original -split "`r?`n"
$output = [System.Collections.Generic.List[string]]::new()
$inSourceBlock = $false
$sourceBlocks = 0
$sourceUrls = 0
$pageTitles = 0
$promotions = 0
$blankLines = 0
$promotionPattern = '(?:本文\s*)?(?:搜|搜索)\s*[:：]\s*.*?(?:本文\s*)?免费阅读'

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $trimmed = $line.Trim()

    if ($i -gt 0 -and $i -lt 10 -and $trimmed -eq '来源：') {
        $inSourceBlock = $true
        $sourceBlocks++
        continue
    }
    if ($inSourceBlock) {
        if (-not $trimmed) {
            continue
        }
        if ($trimmed -match '^https?://') {
            $sourceUrls++
            continue
        }
        $inSourceBlock = $false
    }
    if (-not $trimmed) {
        $blankLines++
        continue
    }
    if ($i -gt 0 -and $trimmed -match '^第.+?（\d+\s*/\s*\d+）$') {
        $pageTitles++
        continue
    }

    $matchCount = [regex]::Matches($trimmed, $promotionPattern).Count
    if ($matchCount) {
        $promotions += $matchCount
        $trimmed = [regex]::Replace($trimmed, $promotionPattern, '')
    }
    if ($trimmed) {
        $output.Add($trimmed)
    }
}

[System.IO.File]::WriteAllText(
    $file.FullName,
    (($output -join [Environment]::NewLine) + [Environment]::NewLine),
    [System.Text.UTF8Encoding]::new($false)
)

[pscustomobject]@{
    File = $file.Name
    SourceBlocksRemoved = $sourceBlocks
    SourceUrlsRemoved = $sourceUrls
    PageTitlesRemoved = $pageTitles
    PromotionsRemoved = $promotions
    BlankLinesRemoved = $blankLines
    RemainingLines = $output.Count
    Backup = $backupPath
} | Format-List
