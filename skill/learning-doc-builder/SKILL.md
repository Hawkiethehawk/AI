---
name: learning-doc-builder
description: Use when turning dense reference material — a skill/SKILL.md, a spec, an API doc, a research report, or any lookup-oriented technical document — into a readable, progressively-structured LEARNING document that someone can read top-to-bottom and actually learn from. Covers picking a single spine mental model, ordering by cognitive dependency, adding the "why" and worked examples the source compresses out, strict source-annotation discipline (every datum cited or relativized, no unsourced "industry-experience" numbers), inline clickable citations, and editor-safe formatting (e.g. Feishu/Lark/Notion import quirks). Trigger on requests like "把这个 skill/文档做成学习文档", "写一份可读性强的学习材料", "turn this reference into a tutorial", "讲透/讲明白这份资料".
version: 1.0.0
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

## When to Use

- "把这个 skill / 文档做成一份可读性强的学习文档 / 教程 / 学习材料"
- Onboarding material from a dense internal reference
- Turning a spec, API doc, or research report into something a newcomer reads linearly
- Any time the deliverable must be *learned from*, not *looked up in*
- When the output will be imported into Feishu/Lark, Notion, Confluence, or similar (formatting quirks matter — §6)

## The Process (7 phases)

### Phase 1 — Read the whole source, twice

Read the entire reference before writing a line. First pass: comprehension. Second pass: hunt for **the spine** (Phase 2) and **inventory every data point** (you'll need this for Phase 5). For long files, page through all of it — do not skim or answer from the first page. Note: which claims carry a source, which are bare numbers, what's a formula vs a benchmark.

### Phase 2 — Find the spine (one mental model)

The single most important decision. Find **one model that the entire topic decomposes into**, and make it the backbone every later chapter refers back to.

- Examples: a **decomposition tree** (revenue = A × B × C, each factor a branch), a **pipeline/funnel**, a **state machine**, a **layered stack**.
- The spine appears in Chapter 1 and is explicitly referenced by the metrics chapter, the diagnostics chapter, and the cheat sheet. Diagnostics especially should be "walk the spine top-down to find the leaf that moved."
- If you can't name the spine in one sentence, you don't understand the topic well enough to teach it yet.

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

## Spine Patterns (pick one in Phase 2)

| Pattern | Shape | Diagnostics become… | Example domains |
|---------|-------|---------------------|-----------------|
| **Decomposition tree** | metric = A × B × C, recurse | "walk the tree, find the leaf that moved" | revenue/LTV, unit economics, performance budgets |
| **Pipeline / funnel** | ordered stages with conversion between | "which stage's conversion dropped" | onboarding, build pipelines, request lifecycles |
| **State machine** | states + transitions + events | "which transition is firing wrong" | subscriptions, order status, auth flows |
| **Layered stack** | layers with contracts between | "which layer's contract broke" | networking, rendering, infra |

The spine determines the whole doc's shape — choose deliberately.

## Output Skeleton (adapt, don't fill blindly)

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

## Verification (run before declaring done)

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

## Quick Reference: Priority Order

1. Read fully (twice); inventory every datum
2. Pick the spine (one model)
3. Build the cognitive-dependency ladder
4. Promote the #1 gotcha
5. Add why + worked examples + callouts + visuals
6. Source-discipline pass (classify, relativize, never fabricate)
7. Inline clickable citations + editor-target formatting
8. Cheat sheet + checklist
9. Verify (grep residual numbers; check table-cell links; confirm spine threads through)
