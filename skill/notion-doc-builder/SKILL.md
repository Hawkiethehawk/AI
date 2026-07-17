---
name: notion-doc-builder
description: Use when creating, formatting, or updating Notion documents — whether via MCP (notion-create-pages / notion-update-page) or by producing .md files destined for Notion import. Covers Notion-flavored Markdown quirks, table formatting, ASCII diagram alignment, Mermaid vs plain-text tradeoffs, code block behavior, and the Notion MCP tool workflow. Trigger on requests like "写到notion", "创建notion文档", "导入notion", "notion格式化", "notion markdown", or when preparing content explicitly for Notion.
version: 1.0.0
author: Distilled from real Notion MCP integration experience
license: MIT
metadata:
  hermes:
    tags: [notion, documentation, formatting, mcp, ascii-diagrams, markdown]
    related_skills: []
---

# Notion-Doc Builder — Format documents for Notion

## Overview

Notion supports Markdown, but with quirks. Tables are XML. ASCII box-drawing characters misalign. Mermaid renders but locks to preview. This skill is the repeatable checklist for producing content that lands correctly in Notion — whether you're creating pages via MCP tools or preparing `.md` files for manual import.

> This skill was distilled from real iteration: fixing misaligned ASCII diagrams, replacing Mermaid previews, and adapting tables to Notion's XML format. The #1 rule: **Notion is not a terminal. Proportional fonts break box-drawing characters. Use pure-ASCII trees in code blocks instead.**

## When to Use

- "把这个写到 Notion"
- "创建一份 Notion 文档"
- "导入到 Notion"
- Any time the output target is explicitly Notion (not Feishu, not a local `.md`)
- Preparing `.md` content for manual drag-and-drop into Notion

## Two Paths

### Path A: MCP tools (direct creation)

When Notion MCP is connected (`claude mcp add --transport http notion https://mcp.notion.com/mcp` + authenticated), use `notion-create-pages` for new pages and `notion-update-page` (with `insert_content` or `update_content`) for edits.

- `notion-create-pages` takes a `pages` array with `properties.title` and `content` (Notion-flavored Markdown).
- For long documents, prefer multiple `insert_content` calls rather than one giant `create-pages` — the initial create gets the page URL immediately, and subsequent appends are safer against timeouts.
- Every `insert_content` call must pass `page_id` + `command: "insert_content"` + `content`.

### Path B: .md file for manual import

When Notion MCP is not available, produce a `.md` file under `output/markdown/` (or wherever the project's output convention dictates). The user drags it into Notion. All formatting rules below still apply.

## Formatting Rules

### 1. No H1 title

The file name or the Notion page `properties.title` already carries the topic. Do NOT start the document body with `# Title`. Start directly with a blockquote (scope/reader info) or the first heading (`##`).

```
> 面向 X 同学：本文覆盖 Y。预计 Z 分钟。
> 读完应能：A；B；C。

## 0. 第一个章节
```

The `# Title` line is redundant — Notion shows the page title at the top automatically. Including it creates a duplicate visual heading.

### 2. ASCII diagrams: pure-ASCII trees in `text` code blocks

**Never use Unicode box-drawing characters** (`┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ │ ─ ╔ ╗ ╚ ╝ ║ ═`). Notion renders text in proportional fonts by default, so these characters misalign across columns. A diagram that looks fine in a monospace terminal will be crooked in Notion.

**Correct — pure ASCII tree:**

````text
```text
Root
├── Branch A
│   ├── Leaf A1
│   └── Leaf A2
└── Branch B
    └── Leaf B1
```
````

The `├` `└` `│` `─` characters are compact enough that they stay aligned even in proportional fonts when placed inside a `text` code block (which forces monospace).

**For layered/stacked structures**, use horizontal rules and indentation instead of box frames:

````text
```text
⑥ Agent · 规模化
   「多件事一起做」 →  并发、独立、可验证
   ─────────────────────────────────
⑤ Hooks · 自动化
   「该做的事不靠记」 →  事件驱动、不遗漏
   ─────────────────────────────────
④ MCP · 连接层
   「不只是说，还能做」 →  搜索、文件、外部 API
```
````

**For node-link diagrams**, consider whether Mermaid is acceptable first — if so use it. If the reader needs to see the source text (not just the rendered diagram), use ASCII tree instead.

### 3. Mermaid: know the tradeoff

Notion **does** support Mermaid rendering via ` ```mermaid ` code blocks — it auto-renders as a diagram. But:

- The rendered diagram locks to **preview mode**. There is no split view showing source side-by-side.
- To see the source code, the user must hover the diagram and click **</> Show source**.
- If the reader needs to scan the structure quickly without interacting, Mermaid is worse than a plaintext tree.

**Decision rule:** Ask yourself: "Does the reader need to *read* the structure, or *see* the picture?" If the former → ASCII tree in `text` block. If the latter → Mermaid.

### 4. Tables: Notion-flavored Markdown is XML

When creating pages via MCP tools, tables must use Notion's XML format. When producing `.md` for manual import, standard Markdown tables work (Notion auto-converts them on import).

**Path A (MCP tools) — XML table:**

```xml
<table fit-page-width="true" header-row="true">
<colgroup>
<col>
<col>
<col>
</colgroup>
<tr>
<td>Header 1</td>
<td>Header 2</td>
<td>Header 3</td>
</tr>
<tr>
<td>Data</td>
<td>Data</td>
<td>Data</td>
</tr>
</table>
```

- `<table>` attributes: `fit-page-width` (boolean), `header-row` (boolean), `header-column` (boolean).
- `<colgroup>` + `<col>` are optional — only include if setting column colors or widths.
- Table cells can only contain **rich text** (inline formatting), not blocks (headings, lists, images).
- Cell merging is NOT supported via this format — tell the user to merge in the Notion UI if needed.

**Path B (.md import) — standard Markdown table:**

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Data | Data | Data |
```

Notion import handles this fine. Use this path when the user will drag-and-drop.

### 5. Links inside table cells

**Path A (MCP tools, XML tables):** Links work inside `<td>` cells as standard Markdown: `<td>[link text](URL)</td>`.

**Path B (.md import):** Links inside Markdown table cells are **preserved on Notion import** (unlike Feishu/Lark which drops them). Still, verify by importing a test row first if the links are critical.

### 6. Code blocks

Always specify a language tag. Use `text` for generic/plain-text content, `plain text` for structured ASCII trees (Notion treats both as monospace blocks). For the actual language (js, python, sql, etc.), use the standard tag.

````text
```text        ← monospace, no syntax highlighting
plain content
```

```javascript  ← syntax highlighted
const x = 1;
```
````

### 7. Blockquotes

Notion supports `>` blockquotes. Use them for:
- Scope/reader introduction at the top of the document
- Key callouts (`> ⚠️ warning`, `> 💡 insight`)
- **Multi-line quotes:** use `<br>` at line breaks, NOT raw newlines. Raw newlines inside a quote break it into separate quote blocks.

```
> Line 1<br>Line 2<br>Line 3
```

### 8. Dividers

Use `---` for horizontal rules. In Notion-flavored Markdown they must be on their own line with blank lines before and after (or at least one blank line before).

### 9. Bold, italic, inline code

Standard Markdown works: `**bold**`, `*italic*`, `` `code` ``. Escaping: `\*` to show a literal asterisk. These characters need escaping in regular text (not inside code blocks): `\ * ~ $ [ ] < > { } | ^`

### 10. Colors and callouts

Notion supports text colors via `<span color="Color">` syntax and callout blocks via `<callout>` XML. However, for simplicity and portability, **prefer using standard emoji markers** (`💡 ⚠️ 🧭 🔴 🟡`) which work everywhere without Notion-specific syntax.

## Workflow: MCP Page Creation (Path A)

1. Read the source `.md` content.
2. Convert tables from Markdown to Notion XML format (`<table>…</table>`).
3. Remove any `# H1` title line (the `properties.title` field in `notion-create-pages` handles this).
4. Replace any Unicode box-drawing diagrams with pure-ASCII trees in `text` code blocks.
5. For long documents (>~10KB), use this pattern:
   - First call: `notion-create-pages` with the first ~40% of content.
   - Subsequent calls: `notion-update-page` with `command: "insert_content"` and `position: {type: "end"}` for the remaining chunks.
6. Return the page URL to the user.

## Delivering stand-alone .md for Notion import (Path B)

1. Write the file under `output/markdown/<主题>.md`.
2. No H1 title; start with blockquote + `##` headings.
3. Standard Markdown tables (they auto-convert on import).
4. Pure-ASCII diagrams in `text` code blocks.
5. Tell the user: "文件在 `output/markdown/<主题>.md`，直接拖入 Notion 即可导入。"

## Output Convention

- **Path A:** No local file needed — the page lives in Notion. Return the Notion URL.
- **Path B:** Write to `output/markdown/<topic>.md` (use the bare topic name without a "学习文档" suffix).
- Do NOT write to a `output/notion/` directory or any Notion-specific subdirectory. The output folder is by content type, not by target platform.

## Summary Checklist

Before finalizing any Notion-bound content:
- [ ] No H1 title line in body
- [ ] ASCII diagrams use `text` code blocks with `├ └ │ ─`, not Unicode box-drawing
- [ ] Tables are XML for MCP Path A, standard Markdown for import Path B
- [ ] Multi-line quotes use `<br>`, not raw newlines
- [ ] Code blocks have language tags
- [ ] Escaped special characters in regular text
- [ ] Long docs split across multiple MCP calls
