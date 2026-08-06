param(
    [Parameter(Mandatory = $true)]
    [string]$InputDirectory,
    [Parameter(Mandatory = $true)]
    [string]$OutputPath
)

$chapters = Get-ChildItem -LiteralPath $InputDirectory -File -Filter '*.txt' |
    Where-Object { $_.Name -match '^(\d{4}) ' } |
    ForEach-Object {
        $prefix = [int]$Matches[1]
        [pscustomobject]@{
            File = $_
            Order = if ($prefix -eq 0) { 1689 } else { $prefix }
        }
    } |
    Sort-Object Order, @{ Expression = { $_.File.Name } }

if (-not $chapters) {
    throw '未找到章节 TXT 文件。'
}

$promotionPattern = '(?:本文\s*)?(?:搜|搜索)\s*[:：]\s*.*?(?:本文\s*)?免费阅读'
$pageTitlePattern = '(?m)^第.+?（\d+\s*/\s*\d+）$'
$writer = [System.IO.StreamWriter]::new($OutputPath, $false, [System.Text.UTF8Encoding]::new($false))
try {
    foreach ($chapter in $chapters) {
        $content = [System.IO.File]::ReadAllText($chapter.File.FullName, [System.Text.Encoding]::UTF8)
        $trimmedContent = $content.TrimEnd("`r", "`n")
        if ($trimmedContent -match 'https?://' -or
            $content -match $promotionPattern -or
            $content -match $pageTitlePattern -or
            $trimmedContent -match '(?m)^\s*$') {
            throw "净化检查未通过：$($chapter.File.Name)"
        }
        $writer.WriteLine($trimmedContent)
    }
}
finally {
    $writer.Dispose()
}

[pscustomobject]@{
    ChaptersMerged = $chapters.Count
    Output = $OutputPath
    Bytes = (Get-Item -LiteralPath $OutputPath).Length
} | Format-List
