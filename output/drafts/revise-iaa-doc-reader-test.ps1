$ErrorActionPreference = 'Stop'

$docUrl = 'https://vimedia.feishu.cn/wiki/A0UzwqZ0iitvXtkyy1NcfAMFnqW?from=from_copylink'
$revision = 133

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

# 目标、范围和成功标准是埋点的前置输入，需求跟进贯穿后续执行。
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnX5YFmfUtKexIz9t1MDuYeI' -Content @'
<p>埋点设计先取得本轮商业化目标、产品范围和成功标准，再把广告节点放回用户路径。除了请求、展示和点击，还要记录用户是否到达广告场景、是否完成核心任务，以及广告前后是否出现中断、遮挡或返回异常。这样，广告展示下降时才能判断是用户没有到达、广告没有加载，还是产品功能本身没有完成。</p>
'@
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnLTumcATiMmKrQIth5EXprg' -Content @'
<p>需求跟进从目标提出时开始，贯穿埋点、开发、配置、验收和真实流量运行。第一章根据目标与范围确定了埋点方案；进入执行后，需求跟进负责维护依赖、负责人、完成标准和变更记录，确保每个阶段使用同一版信息。出现数据波动或线上异常时，团队也能据此追溯到对应的需求、应用版本和配置版本。</p>
'@
Invoke-LarkUpdate -Command str_replace -Pattern '2.1 需求进入时' -Content '2.1 需求建立时'
Invoke-LarkUpdate -Command block_insert_after -BlockId 'doxcnJyQOFDap8nMRmPKfXrNltb' -Content @'
<p>输入确认后，产品与研发完成广告节点、SDK 和埋点接入，配置人员同步准备平台参数。研发产出包含目标功能与埋点的测试包，测试人员据此开始验收。测试包必须能对应到应用版本、需求版本和配置记录；缺少任一对应关系时，不进入配置验收。</p>
'@

# 区分进入配置验收与正式上线两个关口。
Invoke-LarkUpdate -Command str_replace -Pattern '2.3 变更分级与放行' -Content '2.3 变更分级与配置验收条件'
Invoke-LarkUpdate -Command str_replace -Pattern '不允许直接上线：' -Content '不得进入配置验收：'
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcn0JOsM5LrBqEHCOEe69Vf0f' -Content @'
<callout emoji="✅" background-color="light-green" border-color="green">
  <p><b>进入配置验收的条件：</b>需求已经明确输入、负责人、完成标准和回滚方式，测试包能够对应需求版本与配置记录。影响验收的跨团队问题直接记为阻塞项，不把未确认的信息带入下一阶段。</p>
</callout>
'@
Invoke-LarkUpdate -Command str_replace -Pattern '需求达到放行条件后，配置人员将广告位、ADN 参数、国家分组和价格策略写入聚合平台，测试人员再沿用户路径核对展示、功能与数据回传。后台配置完成只是验收起点，正式放行还取决于核心任务是否可用，以及广告行为是否符合体验和合规要求。' -Content '需求和测试包满足配置验收条件后，配置人员将广告位、ADN 参数、国家分组和价格策略写入聚合平台，测试人员再沿用户路径核对展示、功能与数据回传。后台配置完成只是验收起点，正式上线还取决于核心任务是否可用，以及广告行为是否符合体验和合规要求。'
Invoke-LarkUpdate -Command str_replace -Pattern '3.2 验收不只检查“广告能不能出”' -Content '3.2 验收范围：配置、体验、功能与数据'
Invoke-LarkUpdate -Command str_replace -Pattern '3.5 放行原则' -Content '3.5 正式上线条件'
Invoke-LarkUpdate -Command str_replace -Pattern '验收结论：' -Content '上线结论：'
Invoke-LarkUpdate -Command str_replace -Pattern '正式环境先做小流量核验，再进入投放阶段。' -Content '正式环境先做小流量核验，再进入真实流量运行。'

# 明确 TopOn 与 Topn 是不同对象。
Invoke-LarkUpdate -Command str_replace -Pattern '部分 ADN 参数通过 TopOn 生成，其余参数仍需到对应平台后台获取。' -Content '部分 ADN 参数通过广告聚合平台 TopOn 生成，其余参数仍需到对应平台后台获取。此处的 TopOn 与第五章所述的 Topn 数据工具不是同一对象。'

# 第四章直接使用两条业务链路命名，避免“投放”总类与子类重名。
Invoke-LarkUpdate -Command str_replace -Pattern '四、投放' -Content '四、广告投放与广告变现'
Invoke-LarkUpdate -Command str_replace -Pattern '投放判断：' -Content '运行判断：'
Invoke-LarkUpdate -Command str_replace -Pattern '投放和变现开始产生数据后，复盘先核对口径与数据质量，再判断变化发生在获客、产品路径还是广告变现。' -Content '广告投放和广告变现开始产生数据后，复盘先核对口径与数据质量，再判断变化发生在获客、产品路径还是广告变现。'

# 地区表明确是待验证假设，不把 IAP 地区事实写成 IAA 结论。
Invoke-LarkUpdate -Command str_replace -Pattern '广告投放中的用途' -Content '待验证的投放假设'
Invoke-LarkUpdate -Command str_replace -Pattern '印度、巴西作为规模市场候选；IAP 不设单一核心国家假设' -Content '把印度、巴西列为规模市场候选，验证能否获得有效用户；IAP 暂不设置单一核心国家假设'
Invoke-LarkUpdate -Command str_replace -Pattern '同时测试新兴市场规模与成熟市场价值，不只押单一地区' -Content '分别验证新兴市场能否带来规模、成熟市场用户是否具有更高价值'
Invoke-LarkUpdate -Command str_replace -Pattern '拆分规模市场与价值市场，分别验证用户质量和回收' -Content '分别验证规模市场的用户质量，以及成熟市场能否实现回收'
Invoke-LarkUpdate -Command str_replace -Pattern '优先验证新兴市场的免费用户规模，再用实际变现数据筛选地区' -Content '验证新兴市场能否带来有效免费用户，再用实际变现数据筛选地区'
Invoke-LarkUpdate -Command str_replace -Pattern '采用混合地区测试，同时观察 IAP 和 IAA 结果' -Content '采用混合地区测试，分别验证 IAP 和 IAA 表现'
Invoke-LarkUpdate -Command str_replace -Pattern '巴西、印度测试规模，美国测试价值，分别设观察目标' -Content '验证巴西、印度能否带来规模，以及美国用户是否具有更高价值'
Invoke-LarkUpdate -Command str_replace -Pattern '印度、巴西验证用户规模，美国验证价值与回收' -Content '验证印度、巴西能否带来规模，以及美国用户能否实现回收'

# 统一观察窗口、护栏和实验变量的口径。
Invoke-LarkUpdate -Command str_replace -Pattern '耗时和收益按阶段观察，当前笔记以 3 天作为最小观察单位。预估 eCPM 与 API 数据差异明显时，回到平台检查配置和统计口径。' -Content '耗时和收益按阶段观察，现有笔记以 3 天作为阶段性参考，实际窗口根据样本量和波动确定。预估 eCPM 与 API 数据差异明显时，回到平台检查配置和统计口径。'
Invoke-LarkUpdate -Command str_replace -Pattern '只有成本、用户质量和广告变现同时没有触发护栏时，才考虑逐步放大。' -Content '成本、用户质量和广告变现的相关护栏指标均未触发停止或回滚条件时，才考虑逐步放大。'
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnggAi0s1lG94U33u8Fkwceh' -Content @'
<p>日常异常处置可以同时修复相互依赖的配置项；用于判断策略效果的正式实验，每轮只设置一个主要变量。现有配置笔记以 3 天作为阶段性观察参考，实际窗口根据样本量、波动和版本变化确定。发现严重体验或合规问题时，不等待窗口结束，直接停止相关广告位或回滚配置。</p>
'@
Invoke-LarkUpdate -Command str_replace -Pattern '按国家、版本、Campaign、素材、广告位和广告源拆分原因' -Content '按国家、版本、Campaign、素材、广告位和广告源拆分差异，形成候选解释'
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcnxmJ2jwgyCvEub5MrZacPTb' -Content @'
<p>每条建议都应由人工写明支持证据、其他可能解释、调整对象、单变量验证方案、护栏指标和回滚条件。没有实验或因果证据时，写成“建议测试”，不写成已经证明有效。</p>
'@

# 删除已经在地区事实说明中充分表达的重复边界，并去掉不具名的案例状态描述。
Invoke-LarkUpdate -Command block_delete -BlockId 'doxcnVZ7gnbciF6jKbPmscKJ6vd'
Invoke-LarkUpdate -Command block_replace -BlockId 'doxcn6gKQLwX7UPAhoh3rV5hxQh' -Content @'
<p>以下拆解提供具体的产品和广告行为样本。Zipper Wallpaper 是自有产品链路分析，其余案例用于比较不同产品的广告触发方式和商业化组合。案例中的图片、录屏、流程图和广告类型表应结合原文理解，不单独推广为通用结论。</p>
'@

Write-Output "Final revision: $revision"
