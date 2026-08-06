$ErrorActionPreference = 'Stop'

$docUrl = 'https://vimedia.feishu.cn/wiki/A0UzwqZ0iitvXtkyy1NcfAMFnqW?from=from_copylink'
$revision = 172

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

# 参考“全链路骨架”的写法建立第一章，不设置第 0 点。
Invoke-LarkUpdate -Command block_insert_after -BlockId 'doxcnBE1kpWJqiw5lXGngVy112f' -Content @'
<h1>一、全链路骨架</h1>
<h2>1.1 主流程</h2>
<p>IAA 商业化按照固定顺序推进。每个阶段都要留下可检查的输出，下一阶段只使用已经确认的版本；复盘发现的问题再回到对应环节修正。</p>
'@
Invoke-LarkUpdate -Command block_insert_after -BlockId 'doxcnEjD5bhXrKJSVVqi7lZjgKI' -Content @'
<h2>1.2 各阶段的输入与输出</h2>
<p>流程是否闭合，不看单个动作是否完成，而看上一阶段的输出能否直接成为下一阶段的输入。</p>
<table>
  <colgroup><col width="120"/><col width="210"/><col width="260"/><col width="230"/></colgroup>
  <thead><tr>
    <th background-color="light-gray" vertical-align="middle"><p align="center">阶段</p></th>
    <th background-color="light-gray" vertical-align="middle"><p align="center">输入</p></th>
    <th background-color="light-gray" vertical-align="middle"><p align="center">核心动作</p></th>
    <th background-color="light-gray" vertical-align="middle"><p align="center">输出</p></th>
  </tr></thead>
  <tbody>
    <tr><td background-color="light-gray" vertical-align="middle"><p align="center"><b>埋点设计</b></p></td><td vertical-align="middle"><p align="left">商业化目标、产品范围、成功标准和真实用户路径</p></td><td vertical-align="middle"><p align="left">把产品节点、广告节点、结果和异常放到同一条链路</p></td><td vertical-align="middle"><p align="left">埋点方案、字段口径和完成标准</p></td></tr>
    <tr><td background-color="light-gray" vertical-align="middle"><p align="center"><b>需求跟进</b></p></td><td vertical-align="middle"><p align="left">埋点方案、应用范围和配置需求</p></td><td vertical-align="middle"><p align="left">确认负责人、依赖、版本、变更和回滚方式</p></td><td vertical-align="middle"><p align="left">可进入配置验收的需求版本</p></td></tr>
    <tr><td background-color="light-gray" vertical-align="middle"><p align="center"><b>广告配置与验收</b></p></td><td vertical-align="middle"><p align="left">已确认需求、客户端接入和平台参数</p></td><td vertical-align="middle"><p align="left">完成 MAX 配置、研发出包，并沿用户路径验收</p></td><td vertical-align="middle"><p align="left">通过验收的应用版本、配置记录和上线基线</p></td></tr>
    <tr><td background-color="light-gray" vertical-align="middle"><p align="center"><b>广告投放与广告变现</b></p></td><td vertical-align="middle"><p align="left">通过验收的版本、地区假设和回滚条件</p></td><td vertical-align="middle"><p align="left">广告投放获取用户，广告变现承接用户进入产品后的广告流量</p></td><td vertical-align="middle"><p align="left">能够按应用、版本、国家和时间对齐的成本、行为与收入数据</p></td></tr>
    <tr><td background-color="light-gray" vertical-align="middle"><p align="center"><b>数据复盘与反馈</b></p></td><td vertical-align="middle"><p align="left">两条链路的原始数据、变更记录和体验结果</p></td><td vertical-align="middle"><p align="left">先核对数据质量，再定位差异并设计可回滚验证</p></td><td vertical-align="middle"><p align="left">下一轮埋点、需求、配置或投放动作</p></td></tr>
  </tbody>
</table>
'@

# 原有五个阶段顺延为第二至第六章。
$headingReplacements = @(
    @('一、埋点设计', '二、埋点设计'),
    @('1.1 先记录产品链路，再记录广告链路', '2.1 先记录产品链路，再记录广告链路'),
    @('1.2 用自有产品链路确定埋点范围', '2.2 用自有产品链路确定埋点范围'),
    @('1.3 最小记录单元', '2.3 最小记录单元'),
    @('1.4 事件和口径设计', '2.4 事件和口径设计'),
    @('1.5 交付物与完成标准', '2.5 交付物与完成标准'),
    @('二、需求跟进', '三、需求跟进'),
    @('2.1 需求建立时', '3.1 建立需求并确认输入'),
    @('2.2 变更发生时', '3.2 同步变更'),
    @('2.3 变更分级与配置验收条件', '3.3 进入配置验收'),
    @('三、广告配置与验收', '四、广告配置与验收'),
    @('3.1 现行 MAX 配置流程', '4.1 从配置输入到测试包的七个步骤'),
    @('3.2 验收范围：配置、体验、功能与数据', '4.2 按配置、体验、功能与数据验收'),
    @('3.3 从案例补充固定回归项', '4.3 将已发现问题纳入固定回归'),
    @('3.4 配置调整的现行做法', '4.4 配置调整与异常排查'),
    @('3.5 正式上线条件', '4.5 正式上线条件'),
    @('四、广告投放与广告变现', '五、广告投放与广告变现'),
    @('4.1 广告投放：通过买量获取用户', '5.1 广告投放：通过买量获取用户'),
    @('4.1.1 地区事实基线', '5.1.1 地区事实基线'),
    @('4.1.2 投放前', '5.1.2 投放前'),
    @('4.1.3 首轮测试', '5.1.3 首轮测试'),
    @('4.1.4 放大、调整或停止', '5.1.4 放大、调整或停止'),
    @('4.2 广告变现：开始承接广告流量', '5.2 广告变现：开始承接广告流量'),
    @('4.2.1 按品类和地区建立变现分层', '5.2.1 按品类和地区建立变现分层'),
    @('4.2.2 首轮观察顺序', '5.2.2 首轮观察顺序'),
    @('4.2.3 调整方式', '5.2.3 调整方式'),
    @('4.3 两条链路在复盘中汇合', '5.3 两条链路在复盘中汇合'),
    @('五、数据复盘与反馈', '六、数据复盘与反馈'),
    @('5.1 先确认数据能不能回答问题', '6.1 先确认数据能不能回答问题'),
    @('5.2 分开看两条链路', '6.2 分开看两条链路'),
    @('5.3 复盘节奏与输出', '6.3 复盘节奏与输出'),
    @('5.4 复盘结论的写法', '6.4 复盘结论的写法'),
    @('5.5 反馈如何进入下一轮', '6.5 反馈如何进入下一轮')
)
foreach ($pair in $headingReplacements) {
    Invoke-LarkUpdate -Command str_replace -Pattern $pair[0] -Content $pair[1]
}

# 用现有 MAX 记录填充七步配置骨架；参考文档只提供步骤组织方式。
Invoke-LarkUpdate -Command block_insert_after -BlockId 'doxcn9SNPZPW5qa4TZGhLzAAJZc' -Content @'
<p>以下步骤根据<cite type="doc" doc-id="GM3mwRivziFocUktedIcunornKf"></cite>中的现行 MAX 配置记录整理。广告聚合平台 TopOn 可生成部分 ADN 参数，其余参数仍需到对应平台后台获取；TopOn 与第六章所述的 Topn 数据工具不是同一对象。</p>
<h3>4.1.1 核对配置输入</h3>
<p>核对应用、平台、广告形式、命名、所需 ADN、需求版本和客户端接入范围。信息缺失或版本无法对应时，不开始后台配置。</p>
<h3>4.1.2 创建 MAX 应用与广告单元</h3>
<p>在 MAX 创建 App 和 Ad Unit，记录返回的 Unit ID，并确保广告单元能够对应具体广告形式和产品节点。</p>
<h3>4.1.3 取得各 ADN 参数</h3>
<p>使用 TopOn 生成可自动取得的 ADN 参数；其余 ADN 到对应后台手动获取。每组参数都要保留来源平台和对应广告单元。</p>
<h3>4.1.4 核对并写入 MAX</h3>
<p>按广告单元检查参数对应关系，再将完整参数写入 MAX。包名、平台、广告形式或 ID 对应错误时，退回上一阶段修正。</p>
<h3>4.1.5 设置分层与兜底</h3>
<p>设置 Bid Floor、国家分组和全局兜底，明确每个流量分组最终落到哪个可用广告源。</p>
<h3>4.1.6 回填配置结果</h3>
<p>回填 Unit ID、平台参数和完成状态，记录配置版本与完成时间，为测试和后续复盘保留基线。</p>
<h3>4.1.7 研发产出测试包</h3>
<p>客户端接入与平台配置都完成后，由研发产出对应版本的测试包并交由测试人员验收。测试包必须能够对应需求版本、配置记录和埋点方案。</p>
'@
Invoke-LarkUpdate -Command block_delete -BlockId 'doxcnbjbZhN3ciyUYOvyXmIBYVh,doxcnJ8n4BI31uMQWfi3PYw8ZWX,doxcnLJwf2XjN9eaBl2M7Dlv7Vc,doxcnIdKpQdp0YROiUyU4wpog55,doxcneqwKDwUAecWX2vYPpkVuXg,doxcnkZd6TFQqQieZqRo6B6Q9jd,doxcnpImeW8pi7aIVWEMTBKDSsc'
Invoke-LarkUpdate -Command str_replace `
    -Pattern '需求和测试包满足配置验收条件后，配置人员将广告位、ADN 参数、国家分组和价格策略写入聚合平台，测试人员再沿用户路径核对展示、功能与数据回传。后台配置完成只是验收起点，正式上线还取决于核心任务是否可用，以及广告行为是否符合体验和合规要求。' `
    -Content '这一阶段把已确认的需求落为可测试版本。配置人员完成广告位、ADN 参数、国家分组和价格策略，产品与研发完成客户端、SDK 和埋点接入；两边完成后由研发产出测试包，测试人员再沿用户路径核对配置、展示、功能与数据回传。'

# 参考“全链路速查”的收束方式，增加可直接执行的阶段检查表。
Invoke-LarkUpdate -Command block_insert_after -BlockId 'doxcnc5d8qnnBmo8ObiDHEhc7nc' -Content @'
<h1>七、全链路速查</h1>
<h2>7.1 进入下一阶段前检查</h2>
<table>
  <colgroup><col width="140"/><col width="290"/><col width="290"/></colgroup>
  <thead><tr>
    <th background-color="light-gray" vertical-align="middle"><p align="center">环节</p></th>
    <th background-color="light-gray" vertical-align="middle"><p align="center">完成标志</p></th>
    <th background-color="light-gray" vertical-align="middle"><p align="center">未完成时</p></th>
  </tr></thead>
  <tbody>
    <tr><td background-color="light-gray" vertical-align="middle"><p align="center"><b>埋点设计</b></p></td><td vertical-align="middle"><p align="left">用户路径、广告节点、原始口径和异常上下文已明确</p></td><td vertical-align="middle"><p align="left">补齐节点或字段，不进入需求执行</p></td></tr>
    <tr><td background-color="light-gray" vertical-align="middle"><p align="center"><b>需求跟进</b></p></td><td vertical-align="middle"><p align="left">目标、范围、依赖、负责人、版本和回滚方式已确认</p></td><td vertical-align="middle"><p align="left">标记阻塞并退回补充，不开始配置</p></td></tr>
    <tr><td background-color="light-gray" vertical-align="middle"><p align="center"><b>配置与出包</b></p></td><td vertical-align="middle"><p align="left">MAX 与 ADN 参数已回填，测试包对应需求、配置和埋点版本</p></td><td vertical-align="middle"><p align="left">回到对应配置步骤或客户端接入步骤修正</p></td></tr>
    <tr><td background-color="light-gray" vertical-align="middle"><p align="center"><b>测试验收</b></p></td><td vertical-align="middle"><p align="left">核心任务可完成，广告展示、权益、数据和合规检查通过</p></td><td vertical-align="middle"><p align="left">不正式上线；修复后重新执行受影响的回归用例</p></td></tr>
    <tr><td background-color="light-gray" vertical-align="middle"><p align="center"><b>真实流量运行</b></p></td><td vertical-align="middle"><p align="left">广告投放与广告变现数据能够按应用、版本、国家和时间对齐</p></td><td vertical-align="middle"><p align="left">分别描述两条链路，不计算回收或扩大规模</p></td></tr>
    <tr><td background-color="light-gray" vertical-align="middle"><p align="center"><b>复盘反馈</b></p></td><td vertical-align="middle"><p align="left">结论包含证据、其他解释、验证方案、护栏和回滚条件</p></td><td vertical-align="middle"><p align="left">补数据或缩小结论，不把假设写成已验证经验</p></td></tr>
  </tbody>
</table>
'@

Write-Output "Final revision: $revision"
