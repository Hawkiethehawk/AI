$ErrorActionPreference = 'Stop'

$docUrl = 'https://vimedia.feishu.cn/wiki/A0UzwqZ0iitvXtkyy1NcfAMFnqW?from=from_copylink'
$revision = 161

function Replace-Text {
    param(
        [Parameter(Mandatory = $true)][string]$Pattern,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
    )

    $raw = & lark-cli docs +update `
        --doc $docUrl `
        --command str_replace `
        --revision-id $revision `
        --doc-format xml `
        --pattern $Pattern `
        --content $Content | Out-String
    $result = $raw | ConvertFrom-Json
    if (-not $result.ok) {
        throw "Replacement failed: $Pattern"
    }
    $script:revision = [int]$result.data.document.revision_id
    Write-Output "str_replace -> revision $revision"
}

Replace-Text `
    -Pattern '埋点方案确定后，需求跟进负责把目标、范围、依赖和完成标准传递到开发、配置、验收与投放环节。每次变更都要同步到相关记录，并明确由谁确认、何时放行、出现问题如何回退。这样，后续的数据波动或线上异常才能追溯到对应的需求和配置版本。' `
    -Content '需求跟进从目标提出时开始，贯穿埋点、开发、配置、验收和真实流量运行。第一章根据目标与范围确定了埋点方案；进入执行后，需求跟进负责维护依赖、负责人、完成标准和变更记录，确保每个阶段使用同一版信息。出现数据波动或线上异常时，团队也能据此追溯到对应的需求、应用版本和配置版本。'

Replace-Text -Pattern '定向验收后放行：' -Content '配置变更可定向验收：'
Replace-Text -Pattern '跟进结果：' -Content '进入配置验收的条件：'
Replace-Text `
    -Pattern '一项需求进入配置和验收前，应当具备明确的输入、负责人、完成标准和回滚方式。影响放行的跨团队问题直接记为阻塞项，不把未确认的信息带入正式环境。' `
    -Content '需求已经明确输入、负责人、完成标准和回滚方式，测试包能够对应需求版本与配置记录。影响验收的跨团队问题直接记为阻塞项，不把未确认的信息带入下一阶段。'
Replace-Text `
    -Pattern '涉及核心功能或用户体验的问题，不能由单一商业化指标替代联合放行。' `
    -Content '涉及核心功能或用户体验的问题，必须由商业化、产品和研发或测试共同确认后，才能进入下一阶段。'
Replace-Text `
    -Pattern '标注为 20260713 的三篇案例尚未完成，只列入样本索引，不参与策略判断。' `
    -Content ''

Write-Output "Final revision: $revision"
