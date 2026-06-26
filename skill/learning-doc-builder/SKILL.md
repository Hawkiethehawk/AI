---
name: learning-doc-builder
description: Use when turning dense reference material — a skill/SKILL.md, a spec, an API doc, a research report, or any lookup-oriented technical document — into a readable, progressively-structured LEARNING document that someone can read top-to-bottom and actually learn from. Covers picking a single spine mental model, ordering by cognitive dependency, adding the "why" and worked examples the source compresses out, strict source-annotation discipline (every datum cited or relativized, no unsourced "industry-experience" numbers), inline clickable citations, and editor-safe formatting (e.g. Feishu/Lark/Notion import quirks). Trigger on requests like "把这个 skill/文档做成学习文档", "写一份可读性强的学习材料", "turn this reference into a tutorial", "讲透/讲明白这份资料".
version: 1.2.9
author: Distilled from real learning-doc production
license: MIT
metadata:
  hermes:
    tags: [documentation, learning, pedagogy, technical-writing, source-citation, knowledge-distillation]
    related_skills: [notion-doc-builder]
---

# Learning-Doc Builder — Reference → Readable Learning Document

## Overview

Reference docs (skills, specs, API docs, dense internal wikis) are optimized for **lookup**: flat, exhaustive, terse, non-linear. A **learning document** is optimized for **acquisition**: it has a spine, a reading order, intuition, worked examples, and it earns trust by sourcing every claim. This skill is the repeatable process for converting the former into the latter.

Core premise: **a good learning doc is a re-derivation.** You pick one mental model that threads the whole topic, hang everything off it, add back the "why" the reference compressed out, and make every number traceable. Reordering the reference's tables does not achieve this — the work is in the spine and the "why."

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
- **The ceiling.** Set a target up front — a rough read-time or chapter count (e.g. "~15-min read, one concept per chapter"). An open-ended doc expands to fill the reference; a budget forces ranking. When the draft overruns, the budget forces a cut.

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

If **two fit**, pick the one your *diagnostics* chapter will lean on — the spine's whole job is to make "find what went wrong" mechanical, so choose the model that makes diagnosis a walk. 如果**都不贴合**，题目大概率是一组松散相关工具、没有单一骨架：明确说出来，用最松的"何时用哪个"标注清单，不强套虚假的树——假树读起来比诚实清单更糟。

### Phase 3 — Order by cognitive dependency, not source order

Reference order is arbitrary (alphabetical, feature-grouped). Learning order follows what you must understand first. A reliable ladder:

1. **One-line "what is this really"** — the whole thing in a sentence. If the topic has a core formula/model, include it here; but any concise form works — a defining operation, a core tradeoff, a one-sentence frame. The test is: can you make the reader nod and say "oh, so it's that."
2. **The spine** — the decomposition, with intuition for each branch.
3. **How to read the data** — definitions, and crucially the #1 gotcha (Phase 4).
4. **Topic-by-topic** — the meat, each section self-contained.
5. **Diagnostics** — applying the spine to find root causes.
6. **Pitfalls / cheat sheet / summary** — fast reference plus a closing recap at the end (the one place lookup-style is welcome).

### Phase 4 — Promote the #1 gotcha to an early standalone chapter

Every domain has one error that beginners always make (a conflated pair of concepts, a units trap, an "estimate vs settled" distinction). The reference buries it in a sub-bullet. **Pull it out into its own early chapter** with a "this is the first big trap" framing. It pays off repeatedly downstream.

### Phase 5 — Add the "why" and worked examples the reference compressed out

This is what makes it a *learning* doc:

- **Intuition for every rule**: "do X *because* Y" — always carry the reason.
- **Worked numeric examples** (clearly labelled illustrative/示意 if the numbers are made up — never let an example double as a benchmark claim).
- **Analogies and callouts**: use a small, consistent set — e.g. 💡 insight, ⚠️ warning, 🧭 the through-line. Don't overuse.
- **Visual aids**: pure-ASCII trees/funnels for the spine inside `text` code blocks, tables for comparisons, LaTeX (`$$…$$`) for formulas. **Never use Unicode box-drawing characters** (`┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ │ ─ ╔ ╗ ╚ ╝ ║ ═`) — they misalign in proportional-font editors (Notion, Feishu, etc.). Pure-ASCII trees (`├`, `└`, `│`, `─` inside a fenced code block) are compact enough to stay aligned everywhere. For layered/stacked structures, use horizontal rules (`---` or `─────────────────`) and indentation instead of box frames.
- **Counter-intuitive points** get their own "this looks like a bug but isn't" treatment.

**…then run the subtraction pass — this is the half that keeps it short.** Adding is only one side; now go back through and, for every block, ask *"does the reader's goal (Phase 0) actually need this?"* Cut by default:

- **Exhaustive option lists, edge cases, version-specific footnotes** → this is lookup material. A learning doc teaches the 80% path and **links to the reference** for the long tail; it does not reproduce it.
- **Re-explained basics** the Phase-0 reader already has.
- **Repetition smuggled in by "self-contained" sections.** *Self-contained = each section stands on its own feet, it doesn't mean restating the shared context.* Cross-link the spine ("见第 1 章") so each chapter can use it without rebuilding it.
- **Hedging and meta-talk** — "值得注意的是…", "如前所述…", long preambles, throat-clearing. State the point and move on.
- **A second example when one already teaches it.** Keep the clearest; delete the rest.
- **同一规则的多条举例，留最清晰的一条，其余压缩为一句。** 三条并列举例通常有一条就能把规则说清楚，另外两条不会给读者新增信息，只会新增阅读负担。

Rule of thumb: *if you can delete a sentence and the reader loses nothing they need, it was bloat.* Run this pass until deletions stop being free — that's your real length, and it's almost always shorter than the first draft.

### Phase 6 — Source discipline (the part everyone underestimates)

If the user cares about correctness, **every data point must either carry a precise source or be removed/relativized.** Hard-won rules:

- **Classify every number** into: (a) traceable to a cited source → tag it; (b) a *structural/relative* fact (ordering, "A > B") → state it qualitatively, no source needed; (c) an **unsourced absolute benchmark** ("industry-experience value") → **this is the trap**.
- **Never fabricate a source or a number.** Inventing a URL, or attributing a figure to a source that doesn't state it, is worse than an honest label. This is a hard line.
- For category (c): either (i) replace with a relative ordering / method description and note "calibrate from your own data," or (ii) source it to a real published benchmark report *and update the number to match that report* (which ties it to a date). Don't keep a precise-looking number with no backing.
- **Distinguish settlement-grade vs estimate** wherever the domain has both (e.g. billed/API numbers vs SDK/real-time estimates). Conflating them is a classic error worth calling out.
- **Worked-example numbers** are fine if explicitly labelled as illustrative.
- **Internal SOP / training targets** (KPIs that are goals, not facts about the world) should be labelled "example target, not benchmark."
- **精确比例也是坑：** "70% 的有效能力"、"效率提升 3 倍"这类解释性叙述中的精确百分数、倍数，本质是修辞性估计，不是数据。它们穿着数字的外衣但没有来源可查——要么改成定性词（"很大一部分"、"显著提升"），要么找到真正有出处的研究数据替换。最容易漏的就是这种"看起来只是解释、不是 benchmark"的比例。
- **来源广度下限（每篇 ≥3 个一手权威源）：** 每篇学习文档至少引用 **3 个权威、独立的一手来源**——领域官方文档 / 平台帮助中心 / 官方 benchmark 报告，而非二手博客或自媒体。例：**投放**类参考 Meta、Google Ads、TikTok、AppLovin 官方文档；**变现**类参考 AdMob、AppLovin MAX、App Store、Google Play、RevenueCat。三个要点：①一手、相互独立、各链到具体页面；②**绝不为凑数编造，也不把同一来源拆成多个充数**（与上面"绝不编造"同条红线）；③多来源同时用于**交叉印证**，避免单一平台口径偏差。即便是 Variant B（不引用具体数值），文末「参考资源」也须列 ≥3 个权威官方文档。

### Phase 7 — Citations and editor-target formatting

How sources appear matters as much as that they exist.

- **Inline, clickable citations at the point of use** beat a bibliography-only approach. Make the marker itself a link: render `[1]` as a hyperlink (`[[1]](url)` form) so the reader jumps to the source from where the claim is made. Keep a consolidated source list at the end too.
- **Use `[1]` not `[¹]/[³]`** — superscript digits render inconsistently across editors and look misaligned next to `[1]`.
- **Link to the specific doc page, not a homepage.** If a source is a help center, cite the exact article per topic, not the front door.
- **Know your target editor's import quirks.** Especially **Feishu/Lark**: markdown links inside **table cells are dropped on import** — put links in **lists or paragraphs** instead. **Notion**: Unicode box-drawing characters (`┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ │ ─`) misalign in proportional fonts — use pure-ASCII trees (`├`, `└`, `│`, `─`) inside `text` code blocks only. For detailed Notion formatting rules, see the [[notion-doc-builder]] skill. (Confluence has its own quirks; verify.) If a section is reference-table-shaped but needs live links, restructure it as a list.
- **End with a one-page cheat sheet** (all core formulas/identities in one code block) and a **全文总结 (full-text summary)** — a closing recap of the spine, the core judgment, and each chapter's one key takeaway. It's a "把整条链路再走一遍" prose wrap-up, **not** a self-check checklist (the checklist belongs to the skill's own pre-delivery QA, not to the reader-facing doc).

## Output — always a single `.md` file

学习文档的交付物**永远是一个 Markdown (`.md`) 文件**。本 skill 的全部格式约定——脊柱 ASCII 图、`🧭/💡/⚠️` callout、`[[1]](url)` 内联引用、对比表、LaTeX `$$…$$`——都依赖 Markdown 渲染；导出到飞书/Notion 也是从 `.md` 导入。`.txt`、`.docx`、PDF 等格式会让这些约定失效，聊天框里直接铺长文也不行。

- **写到文件**，默认路径 `output/markdown/<主题>.md`（仓库的 `.md` 文档输出目录约定；不要写到 `output/learning-doc/`）。文件名**只写主题本身**，不要追加“学习文档”“商业化运营”“入门到精通”等主题之外的说明；例如用 `IAA变现.md`、`广告投放.md`、`IAP商业化.md`、`混变工具产品功能设计拆解.md`。
- **即使用户只贴了一段源文本、没明说"存成文件"**，也产出 `.md` 文件，给文件路径即可。
- 用户若指定了别的目标编辑器（Notion/Confluence），仍以 `.md` 为源文件，再说明导入方式——不要改用编辑器原生格式直接产出。

## A Worked Micro-Example (reference → learning)

The whole method in miniature. **Source** (lookup-style reference entry):

> **retention_d7**: percentage of installs active on day 7. Healthy range: 20–40%. Affected by onboarding quality, push opt-in, content depth.

**Learning-doc rewrite** (spine = 漏斗；加 why、把无来源的绝对值改成相对口径、不重述漏斗本身):

> **D7 留存**是新用户漏斗的最后一格：装了 → 激活 → 用满一周还回来（漏斗见第 1 章）。它低，几乎总是上游某一格在漏——所以诊断时**沿漏斗往上走**，别一上来就调留存。
> 💡 健康区间因品类差异极大，没有通用绝对基准（[来源] 给的是相对排序）；**以你自己同品类的历史曲线为基线**，看斜率，别盯绝对数。

发生了什么改动，对应各阶段：

- **挂上脊柱**（Phase 2/3）：把它定位成漏斗的一格，并把诊断指向"往上游走"。
- **补 why**（Phase 5）：低 D7 表示上游某格在漏——这是参考条目压缩掉的因果关系。
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
> <1–2 句：覆盖范围 + 目标读者（含其已有基础，决定从哪一层起讲）>。预计 <N> 分钟读完（共 <M> 章）。
> 本文是一条可从头读到尾的学习路径：先建立一个贯穿全文的心智模型，再逐段讲透。
> 读完你应该能：<3–4 个可观察的能力，分号分隔>。
> 📌 source-marker legend (if sourced)

0. 一句话理解 / one-line (formula, operation, or framing — whatever captures it best)
1. The spine (decomposition tree / funnel / …) + intuition per branch
2. The #1 gotcha (promoted, standalone)
3. Key metrics / definitions (with health ranges or relative orderings)
4..N. Topic-by-topic (each self-contained; cross-link the spine)
N+1. Diagnostics (walk the spine top-down; front-end vs back-end split)
N+2. Common pitfalls (numbered quick-scan)
N+3. Learning path / SOP (if relevant; label KPIs as example targets)
附. One-page formula cheat sheet (single code block)
数据来源. Sources as a LIST (not a table) with clickable links, specific pages
全文总结. Closing recap — spine + core judgment + one takeaway per chapter (prose, not a checklist)
```

Use `---` as a divider between top-level chapters. Number chapters from `0`.

### Header block (top of every doc)

Learning docs **must not start with an H1 title line**. Do not output a first heading like `# <主题> · <一句话定位> · 学习文档`. Start directly with the scope/reader blockquote, then the source legend. The file name already carries the topic; dropping the first title avoids a redundant heading in Feishu/Notion imports. The file name itself must be the **bare topic only**: no `学习文档`, no role/audience suffix, no extra positioning phrase.

```text
> <1–2 句：覆盖范围 + 目标读者（含其已有基础，决定从哪一层起讲）>。预计 <N> 分钟读完（共 <M> 章）。
> 本文是一条可从头读到尾的学习路径：先建立一个贯穿全文的心智模型，再逐段讲透。
> 读完你应该能：<3–4 个可观察的能力，分号分隔>。
```

**能力点措辞：** 用肯定句式直述能力（"写出精准的 prompt"），不要用"而不是/而非"堆叠否定对比。"而不是/而非"的最大作用是拉参照物，用一次足够，用三次就成了修辞噪音——读者需要的是目标画面，不是排除清单。

Keep the header **topic-only** — do not write "本文基于 X skill 重新编排" or reference any sibling doc. The doc must stand alone.

### Source legend (pick the ONE variant matching this doc)

**Variant A — converting a sourced reference (real citations exist):**

```text
> **📌 数据来源标记（全文通用）：** [[1]](url) = 来源A · [[2]](url) = 来源B …（角标就近链到对应文档；完整清单见文末「数据来源」，至少 3 个独立一手权威源）。
> **未标记**的内容为通用公式 / 概念 / 结构性事实；个别无权威来源的绝对数值已改为相对描述或注明"以自己实测为准"。
```

**Variant B — concept synthesis (no benchmark numbers to cite):**

```text
> **📌 关于数据来源：** 本文是对<领域>通用方法论的概念性梳理，主体是公式、模型、结构性事实，不依赖具体数值。
> 文中所有带数字的例子均为示意（标注「示意」），属于教学构造；请以自己实测的数据为准。
> 文末「参考资源」列出**至少 3 个**权威公开文档作为延伸阅读，编号 [1] [2] … 在正文出现处就近超链接。
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

## 全文总结
<对正文的回顾压缩，3–6 句或分点，按此顺序：
 ① 一句话重述贯穿全文的脊柱 + 核心判据（呼应 Ch.0/1 的 🧭）；
 ② 每章/每分支一句关键结论（读者最该记住的那一点）；
 ③ 一句收束，把整条链路再走一遍。
 注意：这是把全文"读完能记住什么"压成一段，不是勾选式自检表，也不重复速查表的公式罗列。>
```

## Verification (run before declaring done)

- [ ] **Reader named (Phase 0) and a length budget set**; nothing in the draft re-explains what that reader already knows
- [ ] **A subtraction pass actually ran**: no exhaustive option lists / edge cases that belong in the reference; no chapter restates the spine instead of linking it; one example per point; no hedging/throat-clearing
- [ ] Header 中「读完你应该能」的能力点使用了肯定句式直述，没有"而不是/而非"堆叠（≤1 处视为 OK，>1 处视为噪音）
- [ ] The spine is named in one sentence and referenced by the diagnostics chapter and cheat sheet
- [ ] Reading order follows cognitive dependency, not source order
- [ ] The #1 gotcha is its own early chapter
- [ ] Every rule has a "why"; every illustrative number is labelled as such
- [ ] **grep the draft for residual unsourced absolute numbers** (`%`, `$`, `×`, "倍", thresholds) — each must be sourced, relativized, or labelled illustrative. **Also grep for rhetorical precise numbers** ("70% of capability", "3× improvement") embedded in explanatory prose — these are estimates wearing a data costume; convert to qualitative phrasing or source to real data.
- [ ] No fabricated sources or numbers anywhere
- [ ] **至少 3 个权威、独立的一手来源**（官方文档/平台/报告），均真实存在、链到具体页面、非凑数（Variant B 也须 ≥3 个延伸阅读）
- [ ] Citation markers are clickable links at the point of use; markers are `[1]` not `[¹]`
- [ ] Source list is a LIST with specific-page links (not a homepage, not a table cell)
- [ ] If targeting Feishu/Lark: **no links inside table cells** (verify by importing or by grepping for `](http` inside table rows)
- [ ] 交付物是**一个 `.md` 文件**（非聊天正文、非 `.txt`/`.docx`/PDF），默认位于 `output/markdown/`，不得输出到 `output/learning-doc/`
- [ ] 文件名**只包含主题本身**，不包含“学习文档”“商业化运营”“入门到精通”等主题之外的说明
- [ ] 文档开头**不包含 H1 标题行**（不以 `# <主题>...` 开头），直接从目标读者/范围 blockquote 开始
- [ ] One-page cheat sheet present; **全文总结 present** (a closing prose recap of spine + core judgment + per-chapter takeaway — NOT a reader-facing self-check checklist)
- [ ] Version/source-doc reference is correct and current
- [ ] **Formatting came from this skill's "Standard Format" section, not from copying a sibling learning doc**; the new doc has no reference to any other doc and stands alone

## Common Pitfalls

1. **Reorganizing the reference's tables instead of building a spine and adding the "why."** That doesn't produce a learning doc.
2. **No spine, or a weak one.** Without a backbone, it reads like a glossary. Diagnostics chapter is the tell — if it can't say "walk the spine," the spine is too weak.
3. **Leaving unsourced benchmarks as if they were facts.** The single most common correction. Audit *every* number; the ones you'll miss hide in compliance/limits sections and scattered heuristics, not the obvious benchmark tables.
4. **Fabricating a citation to satisfy "everything needs a source."** Never. Relativize or remove instead.
5. **Bibliography-only citations.** Readers want the link *where the claim is*, not a scroll to the end.
6. **Superscript citation marks (`[³]`).** Render inconsistently; use `[3]`.
7. **Links in table cells for a Feishu target.** They vanish on import. Lists/paragraphs survive.
8. **Homepage links that don't go to the specific page.** Cite the exact article, not the help-center front door.
9. **Worked-example numbers mistaken for benchmarks.** Always label illustrative numbers.
10. **Skipping the final grep/verify pass.** The residual-number and table-cell-link checks catch the exact mistakes that otherwise come back as user corrections.
11. **Reverse-engineering the format from a past output.** Opening a previously-built learning doc to copy its legend/callouts/citation style couples unrelated docs and propagates drift. Use the "Standard Format" section here; each doc must stand alone.
12. **Adding without subtracting → bloat (the verbosity trap).** The skill biases hard toward addition; with no Phase-0 reader and no Phase-5 subtraction pass, the doc inherits the reference's exhaustiveness and reads long and unfinished. Density (spine + why) raises value; subtraction controls length. Coverage of the long tail is the reference's job, not the learning doc's.
13. **No reader defined → re-explaining the basics.** Without a Phase-0 audience, you default to teaching everyone everything. Naming the reader (and asking if unsure) is the cheapest large cut available.
14. **来源太少 / 单一来源。** 只引一个平台、或为回避不确定数值而把一切都相对化，会让文档权威性不足、口径偏单一。每篇 **≥3 个独立一手权威源**并交叉印证；缺来源时是去找权威官方文档，不是编造或拿同一来源充数（见 §6）。
15. **输出冗余 H1 标题。** 不要让学习文档以 `# <主题> · ... · 学习文档` 开头；文件名已经承载主题，正文直接从目标读者/范围 blockquote 开始。
16. **文件名夹带非主题说明。** 输出文件名只写主题本身，例如 `IAA变现.md`；不要写 `IAA变现学习文档.md`、`IAP商业化运营学习文档.md`、`广告投放入门.md` 这类带交付物类型、岗位视角或宣传定位的名字。
17. **能力点堆砌"而不是/而非"。** 每个能力描述都写成"能做到 X 而不是 Y"——一次做对比参照是有效的，连用三次变成修辞噪音。读者需要的是目标画面，不需要一张排除清单。能力点用肯定句式直述（"写出精准的 prompt"），不用"而不是/而非"堆叠。
18. **精确比例穿着数字外衣。** "70% 的有效能力"、"效率提升 3 倍"这类解释性叙述中的精确百分数/倍数，本质是修辞性估计，没有来源可查。它们通常藏在解释段落里，grep 也不容易揪出来——因为读过去像"解释"不像"数据"。规则：要么改成定性词（"很大一部分"、"显著提升"），要么找到真正有出处的研究数据替换。

## Quick Reference: Priority Order

0. Name the reader + set a length budget (floor & ceiling)
1. Read fully (twice); inventory every datum
2. Pick the spine (one model — use the selection ladder; honest checklist if none fit)
3. Build the cognitive-dependency ladder
4. Promote the #1 gotcha
5. Add why + worked examples + callouts + visuals, **then run the subtraction pass** (cut the tail, basics, repetition, hedging)
6. Source-discipline pass (classify, relativize, never fabricate)
7. Inline clickable citations + editor-target formatting
8. Cheat sheet + 全文总结 (closing recap, not a checklist)
9. Verify (reader/budget set; subtraction ran; grep residual numbers; check table-cell links; confirm spine threads through)

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
