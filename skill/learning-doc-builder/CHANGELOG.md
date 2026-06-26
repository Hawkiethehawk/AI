# Changelog — learning-doc-builder

## 1.3.0

**内容生成能力增强（6 个方向，全部折进现有 Phase，增密度不增章节——尊重本 skill 自身的"长度是成本"原则）。**

- **Phase 5 · "why" 挖到机制**：把"X because Y"从底线升级为"往下挖 1–2 层到不能再换句话说的因果"，点明"换句话说的 why = 没教"。
- **Phase 5 · Worked example 生成法**：从"加例子"升级为可执行步骤——真实感输入(示意标注)→逐步演算→落地结果→加一个**反事实**("X 翻倍则结果变…")；反事实是让例子"可操作"的关键。
- **Phase 5 · 每章理解自测题**：生成"读完应能回答的 1–2 题"作为这章是否教会的真正判据；明确是**面向读者的学习装置**，区别于交付前 QA 清单。
- **Phase 5 · 渐进深度**：产出文档也分快路径(80%)+ 可选深度附录，把本 skill 对自己做的 progressive disclosure 用到产出物上。
- **Phase 2 / Spine Patterns · 源类型脊柱先验表**：变现/ API / 订阅 / 协议 / 松散工具 → 各自默认脊柱与例子重心，加速选脊柱(仍需 ladder 确认)。
- **Phase 6 · volatility 标签**：会漂移的 claim(佣金/政策/价格/限额/份额)打 `截至 <YYYY-MM>` 标记，必要时先核查现行来源再写。
- 同步更新 End matter(可选自测元素)、Verification(why 到机制 + 例子带反事实)、Quick Reference 第 5 步。

## 1.2.9
- **Changelog 从 SKILL.md 抽离到独立 `CHANGELOG.md`**：减少 skill 触发时载入上下文的体量；SKILL.md 末尾仅留指针。
- 补记此前缺失的 **1.2.8** 条目（frontmatter 曾从 1.2.7 跳到 1.2.8 但无变更说明）。
- **frontmatter `related_skills` 补反向链接 `[notion-doc-builder]`**：与 notion-doc-builder（已指向本 skill）形成双向关联。

## 1.2.8
- **全链路速查表的框线改纯 ASCII 分隔线**：把 Unicode box-drawing 字符（`┌ ┐ └ ┘ ├ ┤ │ ─` 等）换成纯 ASCII 分隔线，避免飞书/Notion 等比例字体下表格/图错位（与本 skill「ASCII diagrams」原则一致）。

## 1.2.7
本次主题：**学习文档的收尾从「验收清单」改为「全文总结」**。此前文末用勾选式「验收清单（学完自检）」收尾——它本质是 QA 性质，和 skill 自身的「Verification (run before declaring done)」内部门重复，对读者价值低；改成对全文的回顾压缩，更贴合"读完能记住什么"的学习目标。
- **End matter 模板替换**：`## 验收清单（学完自检）` → `## 全文总结`，给出固定结构（①一句话重述脊柱+核心判据 → ②每章/分支一句关键结论 → ③一句收束），并注明它是回顾压缩、不是勾选表、也不重复速查表公式。
- **Document skeleton 同步**：末项 `验收清单. Verification checklist` → `全文总结. Closing recap`。
- **Phase 3 认知阶梯**第 6 步 `Pitfalls / cheat sheet / checklist` → `Pitfalls / cheat sheet / summary`（结尾加一段收束回顾）。
- **Phase 7 收尾约定**：从"cheat sheet + verification/learning checklist"改为"cheat sheet + 全文总结"，并明确 checklist 只属于 skill 的交付前 QA、不出现在读者文档里。
- **Quick Reference** 第 8 步 `Cheat sheet + checklist` → `Cheat sheet + 全文总结`。
- **边界澄清**：skill 内部的 `## Verification (run before declaring done)` 仍是 checklist（交付前自检门），保留不变；本次只改**面向读者的产出物**收尾。对应 Verification 项措辞同步改为"全文总结 present（非读者自检表）"。

## 1.2.6
从一篇"AI 使用"学习文档的生产 → 自测 → 修正完整循环中提炼的反哺：
- **Header block 模板新增预算行**：`预计 <N> 分钟读完（共 <M> 章）`，把 Phase 0 的 ceiling 要求钉进模板，不写预算即不合格。
- **新增能力点措辞规则**：`读完你应该能` 后面的能力点用肯定句式直述，不用"而不是/而非"堆叠否定对比。一次做参照有效，三次变成修辞噪音。同时新增 Pitfall #17。
- **Phase 6 新增「精确比例也是坑」**：解释性叙述中出现的 "70%"、"3 倍" 等精确数字，本质是修辞性估计而非数据——它们穿着数字外衣但没有来源可查。grep 对百分比和倍数的常规搜索容易漏掉这类（因为它们读起来像解释不像数据）。规则：改成定性词或找真正有出处的研究数据。同步更新 Verification 的 grep 规则和新增 Pitfall #18。
- **Phase 5 减法 pass 新增压缩规则**：同一规则的多个并列举例（如 §3.2 的给文件路径 / 给代码片段 / 给约束三条），留最清晰的一个例，其余压成一句话。三条并列通常只有一条在传递新信息，另外两条是重复。

## 1.2.5
- **修正 `.md` 输出目录：学习文档必须写入 `output/markdown/<主题>.md`**，不要写入 `output/learning-doc/`。这是当前仓库对 Markdown 文档的统一输出目录。
- **同步更新 Output 与 Verification**：默认路径改为 `output/markdown/`，验证项明确禁止输出到 `output/learning-doc/`。

## 1.2.4
- **新增文件命名规则：文件名只写主题本身**。默认仍输出到 `output/learning-doc/<主题>.md`，但 `<主题>` 必须是裸主题，不追加“学习文档”“商业化运营”“入门到精通”等交付物类型、岗位视角或宣传定位。
- **补充示例**：推荐 `IAA变现.md`、`广告投放.md`、`IAP商业化.md`、`混变工具产品功能设计拆解.md`；禁止 `IAA变现学习文档.md`、`IAP商业化运营学习文档.md` 等冗余命名。
- **同步更新验证项与常见陷阱**：Verification 增加文件名检查；Common Pitfalls 增加“文件名夹带非主题说明”。

## 1.2.3
- **移除学习文档正文开头的 H1 标题要求**：标准格式不再以 `# <主题> · <一句话定位> · 学习文档` 开头，而是直接从目标读者/范围 blockquote 开始；文件名已经承载主题，正文无需重复标题。
- **同步更新 Document skeleton 与 Header block**：示例骨架删除首行 `# <Topic> — 学习文档`；Header block 明确“不要输出第一个标题行”，并说明这是为了避免飞书/Notion 导入后出现冗余标题。
- **新增验证项与常见陷阱**：Verification 增加“文档开头不包含 H1 标题行”；Common Pitfalls 增加“输出冗余 H1 标题”，防止后续生成文档继续带第一个小标题。

## 1.2.2
- **新增「来源广度下限」规则（Phase 6）：每篇学习文档至少引用 3 个权威、独立的一手来源**——领域官方文档/平台帮助中心/官方 benchmark 报告，而非二手博客。给出领域示例：投放类 Meta / Google Ads / TikTok / AppLovin；变现类 AdMob / AppLovin MAX / App Store / Google Play / RevenueCat。强调三点：①一手、相互独立、链到具体页面；②绝不为凑数编造或把同一来源拆分充数（与「绝不编造」同红线）；③多来源用于交叉印证、避免单一平台口径偏差。Variant B（不引具体数值）文末参考资源同样须 ≥3 个。
- **配套同步**：Source legend A/B 两变体均注明「至少 3 个独立一手权威源」；Verification 新增一条（≥3 个、真实存在、具体页面、非凑数）；Common Pitfalls 新增 #14「来源太少 / 单一来源」。

## 1.2.1
- **新增「Output — always a single `.md` file」小节**：固化交付格式——学习文档永远输出为单个 `.md` 文件，不是聊天长回复、不是 `.txt`/`.docx`/PDF；默认路径 `output/learning-doc/<主题>.md`。理由：脊柱图、callout、`[[1]](url)` 引用、表格、LaTeX 全依赖 Markdown 渲染，换格式即失效。明确三条：①即使用户只贴源文本未说"存文件"也产出 `.md` 而非对话铺长文；②指定 Notion/Confluence 时仍以 `.md` 为源再说明导入方式。
- **Verification 新增一条**：交付物须为一个 `.md` 文件、默认位于 `output/learning-doc/`。

## 1.2.0
本次主题：**对抗"文档过长"** —— 此前整套流程只讲"加"（加 why、加例子、加 callout、加诊断），没有任何"减"的机制，导致成品继承参考文档的穷举性、读起来又长又像没写完。本版把"精简"提升为一等原则，并补上长期缺失的"可操作脊柱选择"与"worked 示例"。
- **新增 Overview 顶部 ✂️ 原则**："Length is a cost, not a coverage score"：明确"加法不配减法"是 bloat 的头号成因；学习文档靠"读完能做什么"衡量价值，而非覆盖面；覆盖长尾是参考文档的职责。点名两个对称杠杆：Phase 0 定读者（下限）、Phase 5 减法 pass（上限）。
- **新增 Phase 0「Name the reader, set the budget」**（流程从 7 阶段 → 8 阶段）：动笔前先一句话写清"写给谁、他们已会什么"。①**下限**：不教读者已会的内容——重复讲基础是长度的头号来源；不确定受众时**主动问**，别靠猜测往低写而注水。②**上限**：预先设阅读时长/章节数预算，超了就触发"砍"而非继续"加"。要求把读者这一行写进标题块 scope。
- **Phase 2 新增脊柱选择决策梯**：给出 4 选 1 的顺序提问（相乘/相加 → 分解树；有序阶段+流失 → 漏斗；状态+事件翻转 → 状态机；层间契约 → 分层栈）；并处理两种过去无指导的情况：两个都贴合时"选诊断章会依赖的那个"，一个都不贴合时"老实说这是一组松散工具、用最松的'何时用哪个'清单，别硬套假树"。
- **Phase 5 新增「subtraction pass（减法）」小节**：加法之后逐块自问"读者目标是否真的需要它"，默认砍：穷举选项/边缘 case/版本脚注（属 lookup，改为链回参考文档）、读者已会的基础、被"self-contained"夹带进来的重复（self-contained ≠ 重述，改为交叉链接脊柱）、对冲与套话、多余的第二个例子。判据："删一句话读者没有损失 → 它就是水分"，反复删到删不动为止。
- **新增「A Worked Micro-Example」整节**（补上 skill 自身一直缺的 worked 示例）：用 D7 留存条目演示 reference → learning 的完整改写，并逐条标注命中了哪个阶段（挂脊柱 / 补 why / 源头纪律 / 减法），点明"靠脊柱和 why 提密度，靠减法控长度，净效果信息更多但不更长"。
- **Header block** 的"目标读者"扩充为"含其已有基础（决定从哪一层起讲）"，呼应 Phase 0。
- **Verification 清单**新增 2 条：读者/预算是否已定且未重讲已知内容；减法 pass 是否真的执行（无穷举清单、无重述脊柱、一点一例、无套话）。
- **Quick Reference 优先级**插入 Phase 0，并在第 5 步显式加入减法 pass、第 9 步加入读者/预算与减法的核查。
- **Common Pitfalls 新增 #12「只加不减 → bloat（冗长陷阱）」与 #13「未定义读者 → 重讲基础」**，把本版主旨钉进陷阱清单。

## 1.1.0
- 新增 **"Standard Format — House Style"** 章节：把过去只存在于成品文档里的排版约定固化成 skill 内的 copy-ready 模板——含①标题块、②数据来源 legend 的 A/B 两种变体（有来源引用 vs 概念性综述）、③三种 callout（🧭/💡/⚠️）的统一用法、④`[[1]](url)` 内联引用格式、⑤文末速查表/数据来源/验收清单的结构与顺序。
- 明确 **"this skill is the only template"** 原则：禁止打开既有学习文档(如变现/埋点文档)反向抄排版；成品是 output 不是 template，要改格式只改 skill。新增对应 Verification 项与 Common Pitfall #11。
- 标题块标准要求文档**自包含**：不写"本文基于 X skill 重新编排"、不引用任何兄弟文档，消除文档间隐性耦合。
- 原 "Output Skeleton" 并入新章节作为"Document skeleton"，内容不变。

## 1.0.0
- 初始版本：7 阶段流程、脊柱模式表、Output Skeleton、源头纪律、引用与编辑器格式规则、验证清单、常见陷阱。
