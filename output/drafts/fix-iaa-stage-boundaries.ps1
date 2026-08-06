$ErrorActionPreference = 'Stop'

$docUrl = 'https://vimedia.feishu.cn/wiki/A0UzwqZ0iitvXtkyy1NcfAMFnqW?from=from_copylink'
$revision = 224

function Replace-Text {
    param(
        [Parameter(Mandatory = $true)][string]$Pattern,
        [Parameter(Mandatory = $true)][string]$Content
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
    -Pattern '可进入配置验收的需求版本' `
    -Content '可进入广告配置的需求版本'

Replace-Text `
    -Pattern '需求跟进从目标提出时开始，贯穿埋点、开发、配置、验收和真实流量运行。第二章根据目标与范围确定了埋点方案；进入执行后，需求跟进负责维护依赖、负责人、完成标准和变更记录，确保每个阶段使用同一版信息。出现数据波动或线上异常时，团队也能据此追溯到对应的需求、应用版本和配置版本。' `
    -Content '第二章根据已经明确的商业化目标、产品范围和成功标准完成埋点方案。随后进入需求跟进，把这些前置条件和埋点方案固化为可执行需求，并维护依赖、负责人、完成标准与变更记录。后续出现数据波动或线上异常时，团队可以追溯到对应的需求、应用版本和配置版本。'

Replace-Text `
    -Pattern '3.1 建立需求并确认输入' `
    -Content '3.1 建立执行需求并确认输入'

Replace-Text `
    -Pattern '输入确认后，产品与研发完成广告节点、SDK 和埋点接入，配置人员同步完成平台参数配置。两项工作都完成后，研发产出包含目标功能、广告配置与埋点的测试包，并交由测试人员验收。测试包必须能对应到应用版本、需求版本和配置记录；缺少任一对应关系时，不进入配置验收。' `
    -Content '输入确认后，产品与研发开始广告节点、SDK 和埋点接入，配置人员进入第四章的后台配置流程。两边可以并行推进，但必须使用同一需求版本；平台配置和客户端接入都完成后，再由研发产出测试包并进入测试验收。'

Replace-Text `
    -Pattern '3.3 进入配置验收' `
    -Content '3.3 变更分级与进入配置条件'

Replace-Text `
    -Pattern '不得进入配置验收：' `
    -Content '不得进入广告配置：'

Replace-Text `
    -Pattern '进入配置验收的条件：' `
    -Content '进入广告配置的条件：'

Replace-Text `
    -Pattern '需求已经明确输入、负责人、完成标准和回滚方式，测试包能够对应需求版本与配置记录。影响验收的跨团队问题直接记为阻塞项，不把未确认的信息带入下一阶段。' `
    -Content '需求已经明确输入、负责人、完成标准和回滚方式，应用、平台、广告形式与埋点方案能够对应同一需求版本。影响配置的跨团队问题直接记为阻塞项，不把未确认的信息带入下一阶段。'

Write-Output "Final revision: $revision"
