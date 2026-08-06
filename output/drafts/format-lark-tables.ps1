$ErrorActionPreference = 'Stop'

$docUrl = 'https://vimedia.feishu.cn/wiki/A0UzwqZ0iitvXtkyy1NcfAMFnqW?from=from_copylink'
$raw = lark-cli docs +fetch --doc $docUrl --scope full --detail with-ids | Out-String
$response = $raw | ConvertFrom-Json
$content = $response.data.document.content
$tables = [regex]::Matches($content, '<table id="([^"]+)"[\s\S]*?</table>')
$payloadPath = Join-Path $PSScriptRoot 'table-format-payload.xml'

foreach ($match in $tables) {
    $blockId = $match.Groups[1].Value
    [xml]$tableXml = $match.Value

    foreach ($cell in @($tableXml.SelectNodes('//th|//td'))) {
        $cell.SetAttribute('vertical-align', 'middle')
    }

    foreach ($headerCell in @($tableXml.SelectNodes('//thead//th|//thead//td'))) {
        $headerCell.SetAttribute('background-color', 'light-gray')
    }

    foreach ($paragraph in @($tableXml.SelectNodes('//thead//p'))) {
        $paragraph.SetAttribute('align', 'center')
    }

    $bodyRows = @($tableXml.SelectNodes('//tbody/tr'))
    $leftAlignedColumns = @{}

    $maxColumnCount = 0
    foreach ($row in $bodyRows) {
        $rowCells = @($row.ChildNodes | Where-Object { $_.Name -in @('td', 'th') })
        if ($rowCells.Count -gt $maxColumnCount) {
            $maxColumnCount = $rowCells.Count
        }
    }

    for ($columnIndex = 1; $columnIndex -lt $maxColumnCount; $columnIndex++) {
        $leftAlignedColumns[$columnIndex] = $false
        foreach ($row in $bodyRows) {
            $rowCells = @($row.ChildNodes | Where-Object { $_.Name -in @('td', 'th') })
            if ($columnIndex -lt $rowCells.Count -and $rowCells[$columnIndex].InnerText.Trim().Length -gt 18) {
                $leftAlignedColumns[$columnIndex] = $true
                break
            }
        }
    }

    foreach ($row in $bodyRows) {
        $cells = @($row.ChildNodes | Where-Object { $_.Name -in @('td', 'th') })
        if ($cells.Count -eq 0) {
            continue
        }

        $firstCell = $cells[0]
        $firstCell.SetAttribute('background-color', 'light-gray')

        foreach ($paragraph in @($firstCell.SelectNodes('.//p'))) {
            $paragraph.SetAttribute('align', 'center')
            if ($paragraph.SelectSingleNode('./b') -eq $null) {
                $bold = $tableXml.CreateElement('b')
                while ($paragraph.HasChildNodes) {
                    $null = $bold.AppendChild($paragraph.FirstChild)
                }
                $null = $paragraph.AppendChild($bold)
            }
        }

        for ($index = 1; $index -lt $cells.Count; $index++) {
            foreach ($paragraph in @($cells[$index].SelectNodes('.//p'))) {
                if ($leftAlignedColumns[$index]) {
                    $paragraph.SetAttribute('align', 'left')
                }
                else {
                    $paragraph.SetAttribute('align', 'center')
                }
            }
        }
    }

    foreach ($node in @($tableXml.SelectNodes('//*[@id]'))) {
        $node.RemoveAttribute('id')
    }

    [System.IO.File]::WriteAllText(
        $payloadPath,
        $tableXml.OuterXml,
        [System.Text.UTF8Encoding]::new($false)
    )

    $resultRaw = Get-Content -Raw $payloadPath |
        lark-cli docs +update --doc $docUrl --command block_replace --block-id $blockId --content - --doc-format xml |
        Out-String
    $result = $resultRaw | ConvertFrom-Json
    if (-not $result.ok) {
        throw "Table update failed: $blockId"
    }
    Write-Output "$blockId -> revision $($result.data.document.revision_id)"
}
