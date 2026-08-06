param(
    [Parameter(Mandatory = $true)]
    [string]$Content
)

$ErrorActionPreference = 'Stop'
$errors = [System.Collections.Generic.List[string]]::new()

$tableContracts = @(
    [pscustomobject]@{
        Name = '全球主分组结构表'
        Headers = @('主分层', '下载侧全历史', '下载侧最近4周', '收入侧全历史', '收入侧最近4周', '分组角色')
        Widths = @(100, 115, 125, 115, 125, 240)
        CenterColumnCount = 5
    },
    [pscustomobject]@{
        Name = '全部周期趋势表'
        Headers = @('指标', '全历史', '前4周', '最近4周', '近期变化', '解读动作')
        Widths = @(150, 95, 95, 95, 110, 275)
        CenterColumnCount = 5
        PercentageChangeColumn = 5
    },
    [pscustomobject]@{
        Name = '分品类决策表'
        Headers = @('品类', 'IAA规模层', 'IAP观察层', '收入数据覆盖率', '近期信号', '当前动作')
        Widths = @(150, 100, 100, 130, 150, 190)
        CenterColumnCount = 4
    },
    [pscustomobject]@{
        Name = '分品类IAA重点国家表'
        Headers = @('品类', 'IAA核心分组', '下载侧重点国家', '全历史/最近4周', 'IAA执行重点')
        Widths = @(110, 103, 230, 123, 254)
        CenterColumnCount = 3
    },
    [pscustomobject]@{
        Name = '组内国家诊断表'
        Headers = @('分组/观察组', '重点国家', '下载侧全历史', '下载侧最近4周', '收入全/近4周', '观察结论')
        Widths = @(120, 180, 105, 113, 120, 182)
        CenterColumnCount = 4
    },
    [pscustomobject]@{
        Name = '执行结论表'
        Headers = @('品类', 'IAA规模层', 'IAP观察层', '收入信号可信度', '执行结论')
        Widths = @(150, 110, 110, 130, 320)
        CenterColumnCount = 4
    }
)

function Add-CheckError {
    param([string]$Message)

    [void]$script:errors.Add($Message)
}

function Get-EstimatedNoWrapWidth {
    param([string]$Text)

    $width = 20
    foreach ($character in $Text.ToCharArray()) {
        if ($character -match '[一-龥]') {
            $width += 13
        }
        elseif ($character -match '[A-Za-z0-9]') {
            $width += 7
        }
        elseif ($character -match '[+/\-]') {
            $width += 6
        }
        else {
            $width += 5
        }
    }

    return $width
}

function Get-DirectParagraph {
    param(
        [System.Xml.XmlElement]$Cell,
        [string]$Label
    )

    $paragraphs = @($Cell.SelectNodes('./p'))
    if ($paragraphs.Count -ne 1) {
        Add-CheckError "$Label must contain exactly one paragraph"
        return $null
    }

    $paragraph = $paragraphs[0]
    if ($null -ne $paragraph.SelectSingleNode('.//br')) {
        Add-CheckError "$Label contains a forced line break"
    }

    return $paragraph
}

function Get-CellParagraphs {
    param(
        [System.Xml.XmlElement]$Cell,
        [string]$Label
    )

    $paragraphs = @($Cell.SelectNodes('./p'))
    if ($paragraphs.Count -eq 0) {
        Add-CheckError "$Label must contain at least one paragraph"
        return @()
    }

    return $paragraphs
}

function Test-CellHasLineBreak {
    param([System.Xml.XmlElement]$Cell)

    if ($null -ne $Cell.SelectSingleNode('.//br')) {
        return $true
    }

    if (@($Cell.SelectNodes('./p')).Count -gt 1) {
        return $true
    }

    return $Cell.InnerXml -match '\r|\n'
}

function Get-CellPlainText {
    param([System.Xml.XmlElement]$Cell)

    return (($Cell.InnerText -replace '\r|\n', ' ') -replace '\s+', ' ').Trim()
}

function Add-TablePunctuationErrors {
    param(
        [System.Xml.XmlElement]$Cell,
        [string]$Label
    )

    $text = Get-CellPlainText $Cell
    if ($text -match '。') {
        Add-CheckError "$Label contains a Chinese full stop"
    }
    if ($text -match '[；;]') {
        Add-CheckError "$Label contains a semicolon; replace it with a line break"
    }
    if ($text -match '(?<!\d)\.(?!\d)') {
        Add-CheckError "$Label contains a sentence period"
    }
}

if ($Content.TrimStart().StartsWith('{')) {
    $payload = $Content | ConvertFrom-Json
    if (-not $payload.ok -or $null -eq $payload.data.document.content) {
        throw 'The supplied document payload does not contain readable document content'
    }
    $Content = [string]$payload.data.document.content
}

try {
    [xml]$document = '<root>' + $Content + '</root>'
}
catch {
    throw "Document content is not valid XML: $($_.Exception.Message)"
}

$root = $document.DocumentElement
$tables = @($root.SelectNodes('./table'))
$expectedStructure = @{
    h1 = 7
    table = 6
    callout = 8
    whiteboard = 4
}
foreach ($entry in $expectedStructure.GetEnumerator()) {
    $actual = @($root.SelectNodes("./$($entry.Key)")).Count
    if ($actual -ne $entry.Value) {
        Add-CheckError "Document $($entry.Key) count must be $($entry.Value), got $actual"
    }
}

if ($tables.Count -ne $tableContracts.Count) {
    Add-CheckError "Document table count must be $($tableContracts.Count), got $($tables.Count)"
}

for ($tableIndex = 0; $tableIndex -lt [Math]::Min($tables.Count, $tableContracts.Count); $tableIndex++) {
    $table = $tables[$tableIndex]
    $contract = $tableContracts[$tableIndex]
    $columns = @($table.SelectNodes('./colgroup/col'))
    if ($columns.Count -ne $contract.Widths.Count) {
        Add-CheckError "$($contract.Name) must contain $($contract.Widths.Count) columns, got $($columns.Count)"
        continue
    }

    $totalWidth = 0
    for ($columnIndex = 0; $columnIndex -lt $columns.Count; $columnIndex++) {
        $actualWidth = [int]$columns[$columnIndex].GetAttribute('width')
        $expectedWidth = $contract.Widths[$columnIndex]
        $totalWidth += $actualWidth
        if ($actualWidth -ne $expectedWidth) {
            Add-CheckError "$($contract.Name) column $($columnIndex + 1) width must be $expectedWidth, got $actualWidth"
        }
    }
    if ($totalWidth -ne 820) {
        Add-CheckError "$($contract.Name) total width must be 820, got $totalWidth"
    }

    $headers = @($table.SelectNodes('./thead/tr/th'))
    if ($headers.Count -ne $contract.Headers.Count) {
        Add-CheckError "$($contract.Name) header count must be $($contract.Headers.Count), got $($headers.Count)"
        continue
    }
    for ($columnIndex = 0; $columnIndex -lt $headers.Count; $columnIndex++) {
        $cell = $headers[$columnIndex]
        Add-TablePunctuationErrors $cell "$($contract.Name) header $($columnIndex + 1)"
        if ($cell.GetAttribute('vertical-align') -ne 'middle') {
            Add-CheckError "$($contract.Name) header $($columnIndex + 1) is not vertically centered"
        }
        $paragraph = Get-DirectParagraph $cell "$($contract.Name) header $($columnIndex + 1)"
        if ($null -eq $paragraph) { continue }
        if ($paragraph.GetAttribute('align') -ne 'center') {
            Add-CheckError "$($contract.Name) header $($columnIndex + 1) is not horizontally centered"
        }
        if ($paragraph.InnerText.Trim() -ne $contract.Headers[$columnIndex]) {
            Add-CheckError "$($contract.Name) header $($columnIndex + 1) text does not match the contract"
        }
        if ((Get-EstimatedNoWrapWidth $paragraph.InnerText.Trim()) -gt $contract.Widths[$columnIndex]) {
            Add-CheckError "$($contract.Name) header $($columnIndex + 1) is too narrow for one line"
        }
    }

    $bodyRows = @($table.SelectNodes('./tbody/tr'))
    $columnHasLineBreak = @(
        for ($columnIndex = 0; $columnIndex -lt $contract.Widths.Count; $columnIndex++) {
            $hasLineBreak = $false
            foreach ($row in $bodyRows) {
                $rowCells = @($row.SelectNodes('./td'))
                if ($rowCells.Count -eq $contract.Widths.Count -and (Test-CellHasLineBreak $rowCells[$columnIndex])) {
                    $hasLineBreak = $true
                    break
                }
            }
            $hasLineBreak
        }
    )

    foreach ($row in $bodyRows) {
        $cells = @($row.SelectNodes('./td'))
        if ($cells.Count -ne $contract.Widths.Count) {
            Add-CheckError "$($contract.Name) body row has $($cells.Count) cells, expected $($contract.Widths.Count)"
            continue
        }
        for ($columnIndex = 0; $columnIndex -lt $cells.Count; $columnIndex++) {
            $cell = $cells[$columnIndex]
            $cellLabel = "$($contract.Name) row $($row.GetAttribute('id')) column $($columnIndex + 1)"
            Add-TablePunctuationErrors $cell $cellLabel
            if ($cell.GetAttribute('vertical-align') -ne 'middle') {
                Add-CheckError "$cellLabel is not vertically centered"
            }
            $paragraphs = Get-CellParagraphs $cell $cellLabel
            if ($paragraphs.Count -eq 0) { continue }

            $expectedAlign = if ($columnHasLineBreak[$columnIndex]) { 'left' } else { 'center' }
            foreach ($paragraph in $paragraphs) {
                # Feishu omits the explicit left alignment attribute on readback because left is the native default.
                $alignIsValid = if ($expectedAlign -eq 'left') {
                    -not $paragraph.HasAttribute('align') -or $paragraph.GetAttribute('align') -eq 'left'
                }
                else {
                    $paragraph.HasAttribute('align') -and $paragraph.GetAttribute('align') -eq 'center'
                }
                if (-not $alignIsValid) {
                    Add-CheckError "$cellLabel must be horizontally $expectedAlign because the whole column has$(
                        if ($columnHasLineBreak[$columnIndex]) { '' } else { ' no' }
                    ) line breaks"
                }
            }
            if (-not $columnHasLineBreak[$columnIndex]) {
                $cellText = Get-CellPlainText $cell
                if ((Get-EstimatedNoWrapWidth $cellText) -gt $contract.Widths[$columnIndex]) {
                    Add-CheckError "$cellLabel is too narrow for one line"
                }
            }
        }
    }

    if ($null -ne $contract.PSObject.Properties['PercentageChangeColumn']) {
        foreach ($row in @($table.SelectNodes('./tbody/tr'))) {
            $changeCell = @($row.SelectNodes('./td'))[$contract.PercentageChangeColumn - 1]
            $changeParagraph = Get-DirectParagraph $changeCell "$($contract.Name) recent-change cell"
            if ($null -eq $changeParagraph) { continue }
            $changeText = Get-CellPlainText $changeCell
            if ($changeText -notmatch '^[+-]\d+(?:\.\d+)?%$') {
                Add-CheckError "$($contract.Name) recent-change value '$changeText' must use a signed percentage"
            }
        }
    }
}

$plainText = $root.InnerText
if ($plainText -match '百分点') {
    Add-CheckError 'Use signed percentages for changes; do not use 百分点'
}
if ($plainText -match '(?<=[一-龥]) (?=[A-Za-z0-9%])|(?<=[A-Za-z0-9%]) (?=[一-龥])') {
    Add-CheckError 'Chinese and English, numbers, or percentages contain forbidden boundary spaces'
}

if ($errors.Count -gt 0) {
    Write-Output 'REPORT_TABLE_LAYOUT_CHECK: FAIL'
    $errors | ForEach-Object { Write-Output "- $_" }
    exit 1
}

Write-Output 'REPORT_TABLE_LAYOUT_CHECK: PASS'
