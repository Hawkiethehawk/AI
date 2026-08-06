$ErrorActionPreference = 'Stop'

$docUrl = 'https://vimedia.feishu.cn/wiki/A0UzwqZ0iitvXtkyy1NcfAMFnqW?from=from_copylink'
$revision = 98

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

# 合并开篇说明，保留资料引用边界，同时移除重复的独立说明块。
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcn0eed5fmwCq1B8N6k5CYuie' -Content @'
<callout emoji="📌" background-color="light-blue" border-color="blue">
  <p>本文说明 IAA 商业化从埋点设计、需求跟进、广告配置与验收到投放和复盘的协作方式。投放包含广告投放和广告变现：前者通过买量获取用户，后者承接用户进入产品后的广告流量。两条链路按应用、版本、国家和时间对齐，复盘结果再回到埋点、需求和配置，形成下一轮调整。</p>
  <p><b>资料范围：</b>本文的事实和经验来自附录所列的工作记录与案例。<cite type="doc" doc-id="Mkgnwj4IOi6IWzkWbpKcUupPn9g"></cite>第一部分及其中列出的<cite type="doc" doc-id="KthHwd1jgiUP0wkx1Uyc60Konkh"></cite>、<cite type="doc" doc-id="PdWswYVEqiRU1UkzQnpcsB66npc"></cite>只作为学习背景；<cite type="doc" doc-id="MWQVdsM2cozhP5xf39xcDOoCnEf"></cite>只用于章节组织。上述材料及 Week 1 下的文档不参与本文事实、经验和结论的形成。</p>
</callout>
'@
Invoke-LarkUpdate -Command block_delete -BlockId 'doxcnlYRzszoueZwczGqLWrJ4ge'

# 埋点章节以可交付结果收束，并自然承接需求跟进。
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnn3EnAfEeC1pHhOUOjFHEQW' -Content @'
<callout emoji="✅" background-color="light-green" border-color="green">
  <p><b>埋点原则：</b>先确认用户能够完成产品核心任务，再判断广告是否正常。遮挡关键选项、打断设置结果、造成重复解锁或让用户找不到订阅入口的问题，应先于收入优化处理。不同产品可以共用事件结构，但节点必须来自真实用户路径。完成后的埋点方案要随需求进入开发、配置和验收环节。</p>
</callout>
'@

# 需求跟进章节去除“骨架”等协作过程语言。
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnLTumcATiMmKrQIth5EXprg' -Content @'
<p>埋点方案确定后，需求跟进负责把目标、范围、依赖和完成标准传递到开发、配置、验收与投放环节。每次变更都要同步到相关记录，并明确由谁确认、何时放行、出现问题如何回退。这样，后续的数据波动或线上异常才能追溯到对应的需求和配置版本。</p>
'@
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcn0JOsM5LrBqEHCOEe69Vf0f' -Content @'
<callout emoji="✅" background-color="light-green" border-color="green">
  <p><b>跟进结果：</b>一项需求进入配置和验收前，应当具备明确的输入、负责人、完成标准和回滚方式。影响放行的跨团队问题直接记为阻塞项，不把未确认的信息带入正式环境。</p>
</callout>
'@

# 配置章节增加承接段，并把“当前、本版”等内部表述改成业务语言。
Invoke-LarkUpdate -Command block_insert_after -BlockId 'doxcnhObPBMOL5SRTEibWCew6og' -Content @'
<p>需求达到放行条件后，配置人员将广告位、ADN 参数、国家分组和价格策略写入聚合平台，测试人员再沿用户路径核对展示、功能与数据回传。后台配置完成只是验收起点，正式放行还取决于核心任务是否可用，以及广告行为是否符合体验和合规要求。</p>
'@
Invoke-LarkUpdate -Command str_replace -Pattern '3.1 当前已有的 MAX 配置流程' -Content '3.1 现行 MAX 配置流程'
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnRWi6g9IpTdeSBfIocx8Voe' -Content @'
<p>现行流程从配置需求中取得应用、平台、广告形式和命名信息，在 MAX 创建应用与广告单元。部分 ADN 参数通过 TopOn 生成，其余参数仍需到对应平台后台获取。配置人员将完整参数写入 MAX，设置 Bid Floor 和国家分组，随后回填 Unit ID 与配置结果，更新需求状态并交付测试包。<cite type="doc" doc-id="GM3mwRivziFocUktedIcunornKf"></cite></p>
'@
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnM4IVjVjlDvEk5Bd60pTsqh' -Content @'
<callout emoji="💡" background-color="light-yellow" border-color="yellow">
  <p><cite type="doc" doc-id="ST2fwyRSxiAnxekdOuxcljahnAd"></cite>记录了自动创建 Unit、生成部分 ADN 参数、批量写入配置和 Bid Floor 的设想。目前 API、字段映射和完整链路尚未经过真实账号验证，因此该方案只用于后续探索，不作为生产配置流程或交付成果。</p>
</callout>
'@
Invoke-LarkUpdate -Command str_replace -Pattern '3.3 自有产品与外部案例提供的验收提醒' -Content '3.3 从案例补充固定回归项'
Invoke-LarkUpdate -Command str_replace -Pattern '3.4 当前配置笔记中的经验项' -Content '3.4 配置调整的现行做法'
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnU1hX0GDSfJR9llosEtX9Ng' -Content @'
<p>以下做法来自<cite type="doc" doc-id="Jz3lwRjY0i1wsckwXLQc2sMEnye"></cite>中的项目记录，适用范围以现有实践为准，不作为行业统一标准：</p>
'@
Invoke-LarkUpdate -Command str_replace -Pattern '出现异常时先检查后台配置、平台状态和地区网络；统一检查超时和并行请求；' -Content '出现异常时，先检查后台配置、平台状态和地区网络，再核对超时与并行请求设置。'
Invoke-LarkUpdate -Command str_replace -Pattern '每个流量分组保留兜底；' -Content '每个流量分组都保留可用的兜底配置。'
Invoke-LarkUpdate -Command str_replace -Pattern '耗时和收益先观察一段周期，笔记中暂定最小单位为 3 天；预估 eCPM 与 API 数据差异明显时回到平台检查配置和口径。' -Content '耗时和收益按阶段观察，当前笔记以 3 天作为最小观察单位。预估 eCPM 与 API 数据差异明显时，回到平台检查配置和统计口径。'
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnWXrd2yWFRxOnb9cySzCaNd' -Content @'
<callout emoji="✅" background-color="light-green" border-color="green">
  <p><b>验收结论：</b>配置通过验收，意味着用户路径、广告配置和数据回传已经在同一版本中得到验证。Bid Floor、并行请求、超时和广告源属于可调整参数，每次修改都要保留基线、观察窗口和回滚条件。正式环境先做小流量核验，再进入投放阶段。</p>
</callout>
'@

# 投放章节明确两条链路的关系，删除写作过程口吻。
Invoke-LarkUpdate -Command block_insert_after -BlockId 'doxcngOtDIFWpe3MF1XzzWINeub' -Content @'
<p>配置通过验收后，产品进入真实流量验证。广告投放负责获取用户，广告变现负责承接这些用户进入产品后的广告流量。两条链路在执行时分别管理，在复盘时按同一口径汇合。</p>
'@
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnwNGG4W0nd0H7jZ8T2mDg4d' -Content @'
<callout emoji="💡" background-color="light-blue" border-color="blue">
  <p>目前尚未形成可复用的真实买量账户实验，缺少完整的预算、素材、出价和优化结果。广告投放现阶段先用小规模测试验证数据链路和用户质量，渠道选择与预算分配以实际测试结果为准。</p>
</callout>
'@
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcn8BFcPsxKgPwnE2Y2YSIBEc' -Content @'
<callout emoji="📍" background-color="light-gray" border-color="gray">
  <p><cite type="doc" doc-id="NI9zwJEgBilM7PkkH4tczSXMnSg"></cite>覆盖 2026-06-08 至 2026-07-13 的 7 个品类。文档中的收入只包含 IAP 收入。本文据此确定地区测试的事实基线；涉及 IAA 的判断仍是待验证假设，不能把 IAP 地区占比直接当作 IAA 收入表现。</p>
</callout>
'@
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcngEwombXfOqBrFSyOdVa0Cd' -Content @'
<p>地区分组同时影响广告投放和广告变现的观察方式。壁纸和 Launcher 在新兴市场的下载占比较高，可以先验证大规模免费用户能否进入广告场景并形成稳定展示。休闲和超休闲的下载更多来自印度、巴西和印尼，而 IAP 收入更集中于美国等成熟市场，因此规模市场和价值市场需要分开观察。</p>
<p>PDF 阅读器、文件恢复和杀毒清理在成熟市场与新兴市场都有贡献，可以并行观察 IAA 与 IAP。品类数据用于提出测试方向，最终仍以自有产品同版本、同口径的真实结果为准。<cite type="doc" doc-id="NI9zwJEgBilM7PkkH4tczSXMnSg"></cite></p>
'@
Invoke-LarkUpdate -Command str_replace -Pattern '放量前' -Content '承接真实流量前'
Invoke-LarkUpdate -Command str_replace -Pattern '开始放量后' -Content '开始承接流量后'
Invoke-LarkUpdate -Command str_replace -Pattern '4.3 广告投放与广告变现如何接到同一次复盘' -Content '4.3 两条链路在复盘中汇合'
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnqdUcRxvjEzemwJ0t6h9QEd' -Content @'
<callout emoji="✅" background-color="light-green" border-color="green">
  <p><b>投放判断：</b>广告投放回答“买来了哪些用户”，广告变现回答“这些用户进入产品后产生了多少广告价值”。扩大预算或提高广告强度前，需要同时检查获客成本、核心任务完成、变现场景到达、收入和体验护栏。两条链路口径无法对齐时，分别描述变化，不直接计算回收。</p>
</callout>
'@

# 复盘章节补足前后衔接，明确人工判断和反馈去向。
Invoke-LarkUpdate -Command block_insert_after -BlockId 'doxcnlAIS7minFJL2s2O9bDg9nf' -Content @'
<p>投放和变现开始产生数据后，复盘先核对口径与数据质量，再判断变化发生在获客、产品路径还是广告变现。复盘的输出要落到下一轮埋点、需求、配置或投放动作，并保留验证条件和回滚方式。</p>
'@
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnStx1Jee1qHP9ZufDeNUJJg' -Content @'
<callout emoji="💡" background-color="light-yellow" border-color="yellow">
  <p><cite type="doc" doc-id="BjMCwgbZpiBgmtkL8l5cuy6Xnbm"></cite>仍处于构建初期，当前只用于字段整理、数据检查和流程试验。Topn 不生成业务观点，不承担原因归因、策略选择或配置决策；分析结论和调整动作均由人工复核后确定。</p>
</callout>
'@
Invoke-LarkUpdate -Command str_replace -Pattern '5.5 反馈回到哪里' -Content '5.5 反馈如何进入下一轮'
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnw6Zjd5qTSPveJShzxxGXgh' -Content @'
<callout emoji="✅" background-color="light-green" border-color="green">
  <p><b>复盘要求：</b>复盘输出必须指向下一步动作。先检查数据质量，再定位变化发生的链路，列出其他可能解释，并设计可回滚的验证方案。成功和失败的实验都要记录；只有经过重复验证且适用边界清楚的结果，才能作为后续项目的经验。</p>
</callout>
'@

# 附录保留事实来源，但改成读者能理解的资料说明。
Invoke-LarkUpdate -Command str_replace -Pattern '附录：本版使用的经验与案例来源' -Content '附录：资料来源与使用边界'
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcn6gKQLwX7UPAhoh3rV5hxQh' -Content @'
<p>以下拆解提供具体的产品和广告行为样本。Zipper Wallpaper 是自有产品链路分析，其余案例用于比较不同产品的广告触发方式和商业化组合。案例中的图片、录屏、流程图和广告类型表应结合原文理解，不单独推广为通用结论。标注为 20260713 的三篇案例尚未完成，只列入样本索引，不参与策略判断。</p>
'@
Invoke-LarkUpdate -Command str_replace -Pattern '参考 SOP 只提供章节组织方式，不提供内容。' -Content '《海外广告聚合配置新人指引》只用于章节组织，不提供本文的事实、经验或结论。'

Write-Output "Final revision: $revision"
