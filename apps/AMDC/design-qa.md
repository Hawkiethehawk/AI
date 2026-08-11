# AMDC 视觉改版 Design QA

## 对照信息

- Source visual truth: `F:\AMDC\.design-qa\source-preview.png`
- Implementation screenshot: `F:\AMDC\.design-qa\implementation-dark-misans-table-fix-1280x720.png`
- Light theme screenshot: `F:\AMDC\.design-qa\implementation-light-misans-1280x720.png`
- Table collision source: `F:\AMDC\.design-qa\source-riser-category-rank-collision.png`
- Table collision fix: `F:\AMDC\.design-qa\riser-table-fix-expanded-1280.png`
- Viewport: `1280 × 720`, DPR 1
- State: 已完成、暗色主题；浅色主题作为补充状态验证
- Full-view comparison: `F:\AMDC\.design-qa\comparison-source-top-implementation-bottom.png`
- Focused header comparison: `F:\AMDC\.design-qa\comparison-header.png`
- Focused data-panel comparison: `F:\AMDC\.design-qa\comparison-data-panels.png`
- Focused riser-table comparison: `F:\AMDC\.design-qa\comparison-riser-before-after.png`
- Column resize source, left extreme: `F:\AMDC\.design-qa\source-panel-left-extreme.png`
- Column resize source, right extreme: `F:\AMDC\.design-qa\source-panel-right-extreme.png`
- Column resize comparison, left extreme: `F:\AMDC\.design-qa\comparison-panel-left-extreme-before-after.png`
- Column resize comparison, right extreme: `F:\AMDC\.design-qa\comparison-panel-right-extreme-before-after.png`
- Column resize viewport: `2560 × 1280`, DPR 1
- Table typography implementation: `F:\AMDC\.design-qa\table-typography-regular-body-large-header-2560x1280.png`
- Table typography comparison: `F:\AMDC\.design-qa\comparison-table-typography-before-after.png`
- Table column dividers: `F:\AMDC\.design-qa\table-column-dividers-2560x1280.png`
- Unified table column dividers: `F:\AMDC\.design-qa\table-column-dividers-unified-2560x1280.png`

## Findings

- 当前无可执行的 P0、P1 或 P2 差异。
- 字体与排版：MiSans Regular、Medium、Demibold、Bold 已内置并由本地服务加载，系统字体作为回退。数字启用 tabular numerals。浏览器检测 `document.fonts.check('16px MiSans')` 返回 true。
- 间距与布局：网格、面板顺序、面板尺寸、间距、圆角和响应式规则未修改。1280 × 720 首屏与原产品结构一致。
- 色彩与视觉变量：实现了预览中的深蓝黑背景、低对比面板、蓝色交互、青色实时状态、绿色成功状态，以及更克制的边框、阴影和发光。
- 图片与品牌：沿用原 AMDC Wordmark 资源，没有用代码图形替代。浅色主题使用主题滤镜获得深色字标，品牌在白色背景上清晰可见。
- 文案与内容：应用文案、表格字段、日期、数字和动态数据均未修改。
- 控件与状态：主题切换在暗色和浅色间工作正常；禁用按钮保持弱化，与预览中展示的启用态存在合理状态差异。
- 控制台：浏览器控制台无 warning 或 error。
- 表格列边界：在 1280 × 720、左栏 844px、右栏 398px 的状态下，品类进度、焦点应用和本周飙升榜均无内容跨列，也没有横向溢出。
- 分栏拖拽：最小宽度随根字号计算。2560px 视口下，左栏最低 922px，右栏最低 576px。继续向边缘拖动不会缩小；历史保存的 1% 或 99% 比例会在加载时修正并重新保存。
- 极限状态：左右两种极限比例下，页面均无横向溢出，三张数据表没有子元素跨越单元格边界。焦点应用表在左栏最小宽度时保留面板内横向滚动，用于容纳九列数据。
- 表格字重：所有 `tbody` 内容及其后代元素统一为 Regular（400），应用名、排名、数值、涨幅、标签和状态不再使用粗体。
- 表头层级：标题行调整为 `0.76rem / 600`；在 2560px 视口下计算字号为 14.592px，比正文更清晰，但没有改变行高、列宽或表格布局。
- 列分界：表头和正文统一使用 1px、16% 透明度的竖线。暗色和浅色主题使用各自的中性色，最后一列不绘制右边框。

## Comparison History

1. 初次实现发现 P2：新字体的字宽让“搜索”与“排序”控件落在不同两行，造成局部换行与原布局不一致。
2. 修复：将 `Microsoft YaHei UI` 提升为首选字体，同时保留 Segoe UI Variable 作为英文与系统回退，未增加新的布局规则。
3. 修复后证据：`search` 与 `sortBy` 的顶部坐标均为 `581.28125px`，两个控件恢复同一行；见 `implementation-dark-font-final-1280x720.png` 和 `comparison-data-panels.png`。
4. MiSans 接入后复查：字体字面略高，但 1280 × 720 下没有页面横向溢出；暗色和浅色主题均加载成功。
5. 用户截图发现 P2：本周飙升榜的长品类标签越过单元格右边界，与“本周排名”相撞，左侧应用列也缺少明确的内容边界。
6. 修复：重新分配飙升榜列宽，缩小单元格横向内边距，表头允许换行；应用名限制在应用列内，品类标签限制在品类列内，超长文本省略并保留悬停全名。
7. 修复后证据：三张数据表的 DOM 边界检测均为 `crossings: []`，右侧面板 `bodyScrollWidth === bodyClientWidth`；见 `comparison-riser-before-after.png`。
8. 用户截图发现 P1：横向分栏可以拖到内容不可读的宽度。右栏极窄时排名和涨幅被裁切；左栏极窄时品类进度各列互相覆盖，焦点应用面板无法阅读。
9. 修复：将对称的 320px 最小宽度改为按根字号计算的非对称限制，左栏 48rem、右栏 30rem；布局加载后立即保存修正值。品类进度条会根据单元格剩余空间收缩，避免挤入“当前应用”列。
10. 修复后证据：实际拖动分栏到浏览器左右边缘，最终宽度分别为 `[922, 1583]` 和 `[1929, 576]`。旧比例 `0.01`、`0.99` 加载后修正为 `0.3681`、`0.7700`。见两张 column resize comparison。
11. 用户要求表格正文不出现粗体，并适当放大标题行。
12. 修复：全局将表格正文及其后代元素设为 400，表头设为 `0.76rem / 600`，其余布局参数保持不变。
13. 修复后证据：浏览器计算样式中，正文只出现 `font-weight: 400`，`boldBody` 为空；表头只出现 `14.592px / 600`。见 `comparison-table-typography-before-after.png`。
14. 用户要求列间分界更清楚。修复后，正文列右边框计算样式为 `1px solid rgba(129, 156, 190, 0.16)`，表头为 `1px solid rgba(159, 176, 197, 0.28)`。
15. 2560 × 1280 下三张可见表格均无新增溢出，页面无横向滚动，控制台无 warning 或 error。见 `table-column-dividers-2560x1280.png`。
16. 用户要求表头与正文使用相同的分界线颜色。暗色主题两者均为 `rgba(129, 156, 190, 0.16)`，浅色主题均为 `rgba(50, 72, 100, 0.16)`。见 `table-column-dividers-unified-2560x1280.png`。

## Follow-up Polish

- P3：预览图中的主按钮饱和度略高；实现保留了真实禁用态和现有交互语义，因此没有强行把不可用按钮绘制成启用态。
- P3：完整四字重使部署包增加约 20 MB；如后续需要压缩仓库体积，可只保留 Regular 和 Demibold，但粗体会由浏览器模拟。

## Verification

- `node --check scripts/progress-server.js`: passed
- `npm run test:contract`: passed
- `node scripts/postinstall.js`: passed，MiSans 资源完整性检查通过
- `npm pack --dry-run --json`: passed，字体和许可证包含在发布包中
- Theme interaction: passed
- MiSans local loading: passed
- Table collision and overflow audit: passed
- Column resizer pointer-drag test: passed
- Legacy extreme layout-state correction: passed
- 2560 × 1280 left/right extreme visual comparison: passed
- Table typography computed-style audit: passed
- Table column-divider computed-style and overflow audit: passed
- Browser console check: passed

final result: passed
