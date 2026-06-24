---
name: learning-doc-builder
description: Use when turning dense reference material — a skill/SKILL.md, a spec, an API doc, a research report, or any lookup-oriented technical document — into a readable, progressively-structured LEARNING document that someone can read top-to-bottom and actually learn from. Covers picking a single spine mental model, ordering by cognitive dependency, adding the "why" and worked examples the source compresses out, strict source-annotation discipline (every datum cited or relativized, no unsourced "industry-experience" numbers), inline clickable citations, and editor-safe formatting (e.g. Feishu/Lark/Notion import quirks). Trigger on requests like "把这个 skill/文档做成学习文档", "写一份可读性强的学习材料", "turn this reference into a tutorial", "讲透/讲明白这份资料".
version: 1.2.0
author: Distilled from real learning-doc production
license: MIT
metadata:
  hermes:
    tags: [documentation, learning, pedagogy, technical-writing, source-citation, knowledge-distillation]
    related_skills: []
---

# Learning-Doc Builder — Reference → Readable Learning Document

## Overview

Reference docs (skills, specs, API docs, dense internal wikis) are optimized for **lookup**: flat, exhaustive, terse, non-linear. A **learning document** is optimized for **acquisition**: it has a spine, a reading order, intuition, worked examples, and it earns trust by sourcing every claim. This skill is the repeatable process for converting the former into the latter.

Core premise: **a good learning doc is not a reorganized reference — it is a re-derivation.** You pick one mental model that threads the whole topic, hang everything off it, add back the "why" the reference compressed out, and make every number traceable. Reordering tables is not enough.

> This skill was distilled from actually producing such docs (and from the corrections that came after). The two biggest, most-underestimated phases are **source discipline** (§5) and **editor-target formatting** (§6) — they consumed more iteration than the writing itself. Budget for them.

> ✂️ **Length is a cost, not a coverage score.** Every phase below tells you to *add* (why, examples, callouts, diagnostics). Addition without a matching **subtraction pass** is the #1 reason these docs come out bloated and unread. A learning doc earns its length by what the reader can *do* afterward — not by how much it covers. Coverage is the *reference's* job; the learning doc carries only what builds understanding and links out for the rest. Two levers make this concrete and they bracket the whole process: **name the reader** (Phase 0 — the floor: don't teach what they know) and **run the subtraction pass** (Phase 5 — the ceiling: cut anything they wouldn't miss).

## When to Use

- "把这个 skill / 文档做成一份可读性强的学习文档 / 教程 / 学习材料"
- Onboarding material from a dense internal reference
- Turning a spec, API doc, or research report into something a newcomer reads linearly
- Any time the deliverable must be *learned from*, not *looked up in*
- When the output will be imported into Feishu/Lark, Notion, Confluence, or similar (formatting quirks matter — §6)

## The Process (8 phases)

### Phase 0 — Name the reader, set the budget

Before reading the source, write one line: **who is this for, and what do they already know.** Everything downstream depends on it, and it is your single best defense against bloat:

- **The floor (kills the most words).** Don't teach what the reader already has. Re-explaining basics to an audience that knows them is the #1 source of length. PM reader → skip the CS primer; engineer reader → skip the business 101. If you're unsure of the audience, *ask* — guessing low forces you to pad.
- **The ceiling.** Set a target up front — a rough read-time or chapter count (e.g. "~15-min read, one concept per chapter"). An open-ended doc expands to fill the reference; a budget forces ranking. When the draft overruns, the budget tells you to cut, not to keep adding.

Put the reader line into the header's scope so the doc announces its altitude.

### Phase 1 — Read the whole source, twice

Read the entire reference before writing a line. First pass: comprehension. Second pass: hunt for **the spine** (Phase 2) and **inventory every data point** (you'll need this for Phase 5). For long files, page through all of it — do not skim or answer from the first page. Note: which claims carry a source, which are bare numbers, what's a formula vs a benchmark.

### Phase 2 — Find the spine (one mental model)

The single most important decision. Find **one model that the entire topic decomposes into**, and make it the backbone every later chapter refers back to.

- Examples: a **decomposition tree** (revenue = A × B × C, each factor a branch), a **pipeline/funnel**, a **state machine**, a **layered stack**.
- The spine appears in Chapter 1 and is explicitly referenced by the metrics chapter, the diagnostics chapter, and the cheat sheet. Diagnostics especially should be "walk the spine top-down to find the leaf that moved."
- If you can't name the spine in one sentence, you don't understand the topic well enough to teach it yet.

**Choosing among the patterns** (see the table below) — ask in order, take the first yes:

1. Does the outcome **multiply / sum out of factors**? → **decomposition tree**.
2. Is it a thing moving through **ordered stages** with drop-off between them? → **funnel / pipeline**.
3. Does the entity sit in one of several **states**, with events flipping it between them? → **state machine**.
4. Is it **contracts between layers**, each hiding the one below? → **layered stack**.

If **two fit**, pick the one your *diagnostics* chapter will lean on — the spine's whole job is to make "find what went wrong" mechanical, so choose the model that makes diagnosis a walk. If **none fit**, the topic is probably a *set of loosely related tools* with no single backbone: say so explicitly and use the loosest spine — a labeled "when to use which" map — rather than forcing a false tree onto it (a fake spine reads worse than an honest checklist).

### Phase 3 — Order by cognitive dependency, not source order

Reference order is arbitrary (alphabetical, feature-grouped). Learning order follows what you must understand first. A reliable ladder:

1. **One-line "what is this really"** — the whole thing in a sentence (+ the core formula/model).
2. **The spine** — the decomposition, with intuition for each branch.
3. **How to read the data** — definitions, and crucially the #1 gotcha (Phase 4).
4. **Topic-by-topic** — the meat, each section self-contained.
5. **Diagnostics** — applying the spine to find root causes.
6. **Pitfalls / cheat sheet / checklist** — fast reference at the end (the one place lookup-style is welcome).

### Phase 4 — Promote the #1 gotcha to an early standalone chapter

Every domain has one error that beginners always make (a conflated pair of concepts, a units trap, an "estimate vs settled" distinction). The reference buries it in a sub-bullet. **Pull it out into its own early chapter** with a "this is the first big trap" framing. It pays off repeatedly downstream.

### Phase 5 — Add the "why" and worked examples the reference compressed out

This is what makes it a *learning* doc:

- **Intuition for every rule**: not "do X" but "do X *because* Y."
- **Worked numeric examples** (clearly labelled illustrative/示意 if the numbers are made up — never let an example double as a benchmark claim).
- **Analogies and callouts**: use a small, consistent set — e.g. 💡 insight, ⚠️ warning, 🧭 the through-line. Don't overuse.
- **Visual aids**: ASCII trees/funnels for the spine, tables for comparisons, LaTeX (`$$…$$`) for formulas.
- **Counter-intuitive points** get their own "this looks like a bug but isn't" treatment.

**…then run the subtraction pass — this is the half that keeps it short.** Adding is only one side; now go back through and, for every block, ask *"does the reader's goal (Phase 0) actually need this?"* Cut by default:

- **Exhaustive option lists, edge cases, version-specific footnotes** → this is lookup material. A learning doc teaches the 80% path and **links to the reference** for the long tail; it does not reproduce it.
- **Re-explained basics** the Phase-0 reader already has.
- **Repetition smuggled in by "self-contained" sections.** *Self-contained ≠ restate the context.* Cross-link the spine ("见第 1 章") instead of re-explaining it in every chapter.
- **Hedging and meta-talk** — "值得注意的是…", "如前所述…", long preambles, throat-clearing. State the point and move on.
- **A second example when one already teaches it.** Keep the clearest; delete the rest.

Rule of thumb: *if you can delete a sentence and the reader loses nothing they need, it was bloat.* Run this pass until deletions stop being free — that's your real length, and it's almost always shorter than the first draft.

### Phase 6 — Source discipline (the part everyone underestimates)

If the user cares about correctness, **every data point must either carry a precise source or be removed/relativized.** Hard-won rules:

- **Classify every number** into: (a) traceable to a cited source → tag it; (b) a *structural/relative* fact (ordering, "A > B") → state it qualitatively, no source needed; (c) an **unsourced absolute benchmark** ("industry-experience value") → **this is the trap**.
- **Never fabricate a source or a number.** Inventing a URL, or attributing a figure to a source that doesn't state it, is worse than an honest label. This is a hard line.
- For category (c): either (i) replace with a relative ordering / method description and note "calibrate from your own data," or (ii) source it to a real published benchmark report *and update the number to match that report* (which ties it to a date). Don't keep a precise-looking number with no backing.
- **Distinguish settlement-grade vs estimate** wherever the domain has both (e.g. billed/API numbers vs SDK/real-time estimates). Conflating them is a classic error worth calling out.
- **Worked-example numbers** are fine if explicitly labelled as illustrative.
- **Internal SOP / training targets** (KPIs that are goals, not facts about the world) should be labelled "example target, not benchmark."

### Phase 7 — Citations and editor-target formatting

How sources appear matters as much as that they exist.

- **Inline, clickable citations at the point of use** beat a bibliography-only approach. Make the marker itself a link: render `[1]` as a hyperlink (`[[1]](url)` form) so the reader jumps to the source from where the claim is made. Keep a consolidated source list at the end too.
- **Use `[1]` not `[¹]/[³]`** — superscript digits render inconsistently across editors and look misaligned next to `[1]`.
- **Link to the specific doc page, not a homepage.** If a source is a help center, cite the exact article per topic, not the front door.
- **Know your target editor's import quirks.** Especially **Feishu/Lark**: markdown links inside **table cells are dropped on import** — put links in **lists or paragraphs** instead. (Notion/Confluence have their own quirks; verify.) If a section is reference-table-shaped but needs live links, restructure it as a list.
- **End with a one-page cheat sheet** (all core formulas/identities in one code block) and a **verification/learning checklist**.

## A Worked Micro-Example (reference → learning)

The whole method in miniature. **Source** (lookup-style reference entry):

> **retention_d7**: percentage of installs active on day 7. Healthy range: 20–40%. Affected by onboarding quality, push opt-in, content depth.

**Learning-doc rewrite** (spine = 漏斗；加 why、把无来源的绝对值改成相对口径、不重述漏斗本身):

> **D7 留存**是新用户漏斗的最后一格：装了 → 激活 → 用满一周还回来（漏斗见第 1 章）。它低，几乎总是上游某一格在漏，而不是"留存"本身坏了——所以诊断时**沿漏斗往上走**，别一上来就调留存。
> 💡 健康区间因品类差异极大，没有通用绝对基准（[来源] 给的是相对排序）；**以你自己同品类的历史曲线为基线**，看斜率，别盯绝对数。

发生了什么改动，对应各阶段：

- **挂上脊柱**（Phase 2/3）：把它定位成漏斗的一格，并把诊断指向"往上游走"。
- **补 why**（Phase 5）：低 D7 = 上游漏，而非留存本身 —— 这是参考条目压缩掉的因果。
- **源头纪律**（Phase 6）：无来源的绝对值 "20–40%" 改成相对口径 + "以自己实测为准"。
- **减法**（Phase 5 减法 pass）：不重述"漏斗是什么"（第 1 章已讲），只留一个例子，删掉 "Affected by…" 那种穷举式清单——那是参考文档该承载的。

净效果：信息量更高，但并没有更长。这就是目标——**靠脊柱和 why 提升密度，靠减法控制长度**。

## Spine Patterns (pick one in Phase 2)

| Pattern | Shape | Diagnostics become… | Example domains |
|---------|-------|---------------------|-----------------|
| **Decomposition tree** | metric = A × B × C, recurse | "walk the tree, find the leaf that moved" | revenue/LTV, unit economics, performance budgets |
| **Pipeline / funnel** | ordered stages with conversion between | "which stage's conversion dropped" | onboarding, build pipelines, request lifecycles |
| **State machine** | states + transitions + events | "which transition is firing wrong" | subscriptions, order status, auth flows |
| **Layered stack** | layers with contracts between | "which layer's contract broke" | networking, rendering, infra |

The spine determines the whole doc's shape — choose deliberately.

## Standard Format — House Style (this skill is the only template)

> 🔒 **Single source of truth.** Build every new learning doc from the blocks below — this skill *is* the template. **Do NOT open a previously-produced learning doc (an existing 变现/埋点/其他学习文档) and copy its styling.** Those are *outputs*, not templates; they drift, carry topic-specific residue, and create hidden coupling between unrelated docs. If the house style needs to change, change it **here**, then regenerate.

### Document skeleton (adapt, don't fill blindly)

```
# <Topic> — 学习文档
> 1-2 line scope + what you'll be able to do after reading
> 📌 source-marker legend (if sourced)

0. 一句话理解 / one-line + core formula
1. The spine (decomposition tree / funnel / …) + intuition per branch
2. The #1 gotcha (promoted, standalone)
3. Key metrics / definitions (with health ranges or relative orderings)
4..N. Topic-by-topic (each self-contained; cross-link the spine)
N+1. Diagnostics (walk the spine top-down; front-end vs back-end split)
N+2. Common pitfalls (numbered quick-scan)
N+3. Learning path / SOP (if relevant; label KPIs as example targets)
附. One-page formula cheat sheet (single code block)
数据来源. Sources as a LIST (not a table) with clickable links, specific pages
验收清单. Verification checklist
```

Use `---` as a divider between top-level chapters. Number chapters from `0`.

### Header block (top of every doc)

```text
# <主题> · <一句话定位> · 学习文档

> <1–2 句：覆盖范围 + 目标读者（含其已有基础，决定从哪一层起讲）>。
> 本文不是手册，而是一条可从头读到尾的学习路径：先建立一个贯穿全文的心智模型，再逐段讲透。
> 读完你应该能：<3–4 个可观察的能力，分号分隔>。
```

Keep the header **topic-only** — do not write "本文基于 X skill 重新编排" or reference any sibling doc. The doc must stand alone.

### Source legend (pick the ONE variant matching this doc)

**Variant A — converting a sourced reference (real citations exist):**

```text
> **📌 数据来源标记（全文通用）：** [[1]](url) = 来源A · [[2]](url) = 来源B …（角标就近链到对应文档；完整清单见文末「数据来源」）。
> **未标记**的内容为通用公式 / 概念 / 结构性事实；个别无权威来源的绝对数值已改为相对描述或注明"以自己实测为准"。
```

**Variant B — concept synthesis (no benchmark numbers to cite):**

```text
> **📌 关于数据来源：** 本文是对<领域>通用方法论的概念性梳理，主体是公式、模型、结构性事实，不依赖具体数值。
> 文中所有带数字的例子均为示意（标注「示意」），不是基准值，请以自己实测的数据为准。
> 文末「参考资源」列出权威公开文档作为延伸阅读，编号 [1] [2] … 在正文出现处就近超链接。
```

### Callout set (use only these three, sparingly)

- `> 🧭 **贯穿全文的一句话**：…` — the spine's thesis. 1–2 per doc; appears in Ch.0/1 and is echoed by the diagnostics chapter.
- `> 💡 …` — intuition / the "why" behind a rule.
- `> ⚠️ …` — a trap, a 口径/units pitfall, or an irreversible-action warning.

Do not introduce other emoji callout types.

### Citation format

- The marker **is** the link: `[[1]](https://specific-page)`. Never bibliography-only; never `[¹]/[³]` (use `[1]`).
- **No links inside table cells** (Feishu drops them on import) — put any cited claim in a list or paragraph instead.

### End matter (in this order)

```text
## 附：一页速查表
（单个 code block，汇总所有核心公式 / 模型 / 口诀，便于打印或截图）

## 数据来源 / 参考资源
- [1] <来源名 · 具体页面标题>：https://specific-url
- [2] …
> 说明：<数值/示意声明，例如"本文未从中引用具体数值，文中例子均为示意">

## 验收清单（学完自检）
- [ ] <能力点；大致对应每章一条，可被客观判断>
```

## Verification (run before declaring done)

- [ ] **Reader named (Phase 0) and a length budget set**; nothing in the draft re-explains what that reader already knows
- [ ] **A subtraction pass actually ran**: no exhaustive option lists / edge cases that belong in the reference; no chapter restates the spine instead of linking it; one example per point; no hedging/throat-clearing
- [ ] The spine is named in one sentence and referenced by the diagnostics chapter and cheat sheet
- [ ] Reading order follows cognitive dependency, not source order
- [ ] The #1 gotcha is its own early chapter
- [ ] Every rule has a "why"; every illustrative number is labelled as such
- [ ] **grep the draft for residual unsourced absolute numbers** (`%`, `$`, `×`, "倍", thresholds) — each must be sourced, relativized, or labelled illustrative
- [ ] No fabricated sources or numbers anywhere
- [ ] Citation markers are clickable links at the point of use; markers are `[1]` not `[¹]`
- [ ] Source list is a LIST with specific-page links (not a homepage, not a table cell)
- [ ] If targeting Feishu/Lark: **no links inside table cells** (verify by importing or by grepping for `](http` inside table rows)
- [ ] One-page cheat sheet present; verification checklist present
- [ ] Version/source-doc reference is correct and current
- [ ] **Formatting came from this skill's "Standard Format" section, not from copying a sibling learning doc**; the new doc has no reference to any other doc and stands alone

## Common Pitfalls

1. **Reorganizing instead of re-deriving.** Shuffling the reference's tables into a new order is not a learning doc. If you didn't add intuition and a spine, you didn't do the job.
2. **No spine, or a weak one.** Without a backbone, it reads like a glossary. Diagnostics chapter is the tell — if it can't say "walk the spine," the spine is too weak.
3. **Leaving unsourced benchmarks as if they were facts.** The single most common correction. Audit *every* number; the ones you'll miss hide in compliance/limits sections and scattered heuristics, not the obvious benchmark tables.
4. **Fabricating a citation to satisfy "everything needs a source."** Never. Relativize or remove instead.
5. **Bibliography-only citations.** Readers want the link *where the claim is*, not a scroll to the end.
6. **Superscript citation marks (`[³]`).** Render inconsistently; use `[3]`.
7. **Links in table cells for a Feishu target.** They vanish on import. Lists/paragraphs survive.
8. **Homepage links instead of specific pages.** "See the help center" is not a citation; link the exact article.
9. **Worked-example numbers mistaken for benchmarks.** Always label illustrative numbers.
10. **Skipping the final grep/verify pass.** The residual-number and table-cell-link checks catch the exact mistakes that otherwise come back as user corrections.
11. **Reverse-engineering the format from a past output.** Opening a previously-built learning doc to copy its legend/callouts/citation style couples unrelated docs and propagates drift. Use the "Standard Format" section here; each doc must stand alone.
12. **Adding without subtracting → bloat (the verbosity trap).** The skill biases hard toward addition; with no Phase-0 reader and no Phase-5 subtraction pass, the doc inherits the reference's exhaustiveness and reads long and unfinished. Density (spine + why) raises value; subtraction controls length. Coverage of the long tail is the reference's job, not the learning doc's.
13. **No reader defined → re-explaining the basics.** Without a Phase-0 audience, you default to teaching everyone everything. Naming the reader (and asking if unsure) is the cheapest large cut available.

## Quick Reference: Priority Order

0. Name the reader + set a length budget (floor & ceiling)
1. Read fully (twice); inventory every datum
2. Pick the spine (one model — use the selection ladder; honest checklist if none fit)
3. Build the cognitive-dependency ladder
4. Promote the #1 gotcha
5. Add why + worked examples + callouts + visuals, **then run the subtraction pass** (cut the tail, basics, repetition, hedging)
6. Source-discipline pass (classify, relativize, never fabricate)
7. Inline clickable citations + editor-target formatting
8. Cheat sheet + checklist
9. Verify (reader/budget set; subtraction ran; grep residual numbers; check table-cell links; confirm spine threads through)

## Changelog

### 1.2.0
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

### 1.1.0
- 新增 **"Standard Format — House Style"** 章节：把过去只存在于成品文档里的排版约定固化成 skill 内的 copy-ready 模板——含①标题块、②数据来源 legend 的 A/B 两种变体（有来源引用 vs 概念性综述）、③三种 callout（🧭/💡/⚠️）的统一用法、④`[[1]](url)` 内联引用格式、⑤文末速查表/数据来源/验收清单的结构与顺序。
- 明确 **"this skill is the only template"** 原则：禁止打开既有学习文档(如变现/埋点文档)反向抄排版；成品是 output 不是 template，要改格式只改 skill。新增对应 Verification 项与 Common Pitfall #11。
- 标题块标准要求文档**自包含**：不写"本文基于 X skill 重新编排"、不引用任何兄弟文档，消除文档间隐性耦合。
- 原 "Output Skeleton" 并入新章节作为"Document skeleton"，内容不变。

### 1.0.0
- 初始版本：7 阶段流程、脊柱模式表、Output Skeleton、源头纪律、引用与编辑器格式规则、验证清单、常见陷阱。
