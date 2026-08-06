$ErrorActionPreference = 'Stop'

$docUrl = 'https://vimedia.feishu.cn/wiki/A0UzwqZ0iitvXtkyy1NcfAMFnqW?from=from_copylink'
$revision = 167

function Invoke-LarkUpdate {
    param(
        [Parameter(Mandatory = $true)][string]$Command,
        [string]$BlockId,
        [string]$Pattern,
        [string]$Content
    )

    $args = @(
        'docs', '+update',
        '--doc', $docUrl,
        '--command', $Command,
        '--revision-id', [string]$revision,
        '--doc-format', 'xml'
    )
    if ($BlockId) {
        $args += @('--block-id', $BlockId)
    }
    if ($Pattern) {
        $args += @('--pattern', $Pattern)
    }
    if ($PSBoundParameters.ContainsKey('Content')) {
        $args += @('--content', $Content)
    }

    $raw = & lark-cli @args | Out-String
    $result = $raw | ConvertFrom-Json
    if (-not $result.ok) {
        throw "Update failed: $Command $BlockId $Pattern"
    }
    $script:revision = [int]$result.data.document.revision_id
    Write-Output "$Command -> revision $revision"
}

# 开篇直接说明两条运行链路，并把正文依据与排除项分开表达。
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnbM5hZd9MBrfYlI07lBTzge' -Content @'
<callout emoji="📌" background-color="light-blue" border-color="blue">
  <p>本文说明 IAA 商业化从埋点设计、需求跟进、广告配置与验收，到广告投放、广告变现和数据复盘的协作方式。配置验收通过后，广告投放通过买量获取用户，广告变现承接这些用户进入产品后的广告流量。两条链路按应用、版本、国家和时间对齐，复盘结果再回到埋点、需求和配置，形成下一轮调整。</p>
  <p><b>正文依据：</b>附录所列的工作记录与案例。</p>
  <p><b>不作为正文依据的材料：</b><cite type="doc" doc-id="Mkgnwj4IOi6IWzkWbpKcUupPn9g"></cite>的第一部分，以及其中列出的<cite type="doc" doc-id="KthHwd1jgiUP0wkx1Uyc60Konkh"></cite>、<cite type="doc" doc-id="PdWswYVEqiRU1UkzQnpcsB66npc"></cite>和 Week 1 下的子文档只作为学习背景；<cite type="doc" doc-id="MWQVdsM2cozhP5xf39xcDOoCnEf"></cite>只提供章节组织方式。</p>
</callout>
'@

# 流程图从配置验收直接分流，不再使用“投放”作为父节点。
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnMBK7HCcUk9OjePzbLHu0Yg' -Content @'
<whiteboard type="mermaid">flowchart LR
  A[埋点设计] --> B[需求跟进]
  B --> C[广告配置与验收]
  C --> D1[广告投放]
  C --> D2[广告变现]
  D1 --> E[数据复盘与反馈]
  D2 --> E
  E -.问题与新判断.-> A
  E -.调整项.-> B
  E -.配置实验.-> C</whiteboard>
'@

# 明确平台配置、客户端接入、测试包产出与验收的先后关系。
Invoke-LarkUpdate -Command str_replace `
    -Pattern '输入确认后，产品与研发完成广告节点、SDK 和埋点接入，配置人员同步准备平台参数。研发产出包含目标功能与埋点的测试包，测试人员据此开始验收。测试包必须能对应到应用版本、需求版本和配置记录；缺少任一对应关系时，不进入配置验收。' `
    -Content '输入确认后，产品与研发完成广告节点、SDK 和埋点接入，配置人员同步完成平台参数配置。两项工作都完成后，研发产出包含目标功能、广告配置与埋点的测试包，并交由测试人员验收。测试包必须能对应到应用版本、需求版本和配置记录；缺少任一对应关系时，不进入配置验收。'
Invoke-LarkUpdate -Command str_replace `
    -Pattern '配置人员将完整参数写入 MAX，设置 Bid Floor 和国家分组，随后回填 Unit ID 与配置结果，更新需求状态并交付测试包。' `
    -Content '配置人员将完整参数写入 MAX，设置 Bid Floor 和国家分组，随后回填 Unit ID 与配置结果并更新需求状态。客户端接入与平台配置都完成后，由研发产出对应版本的测试包并交由测试人员验收。'
Invoke-LarkUpdate -Command str_replace `
    -Pattern '回填参数和状态，进入测试包验收。' `
    -Content '回填参数和状态，通知研发产出对应版本的测试包。'

Write-Output "Final revision: $revision"
