#!/usr/bin/env python3
"""Search the local TopOn help-center mirror and return source URLs."""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
from pathlib import Path
from typing import Any


def query_terms(query: str) -> list[str]:
    lowered = query.lower().strip()
    terms = set(re.findall(r"[a-z0-9][a-z0-9_.+-]*", lowered))
    for run in re.findall(r"[\u3400-\u9fff]+", lowered):
        if len(run) == 1:
            terms.add(run)
        else:
            terms.update(run[i : i + 2] for i in range(len(run) - 1))
    return sorted(terms, key=lambda item: (-len(item), item))[:24]


def strip_frontmatter(text: str) -> str:
    return re.sub(r"\A---\n.*?\n---\n+", "", text, flags=re.DOTALL).strip()


def snippet(text: str, terms: list[str]) -> str:
    clean = re.sub(r"\s+", " ", strip_frontmatter(text)).strip()
    lowered = clean.lower()
    positions = [lowered.find(term.lower()) for term in terms if lowered.find(term.lower()) >= 0]
    if not positions:
        return clean[:220]
    start = max(0, min(positions) - 80)
    return clean[start : start + 240]


def search_json(index_path: Path, terms: list[str], limit: int) -> list[dict[str, Any]]:
    manifest = json.loads(index_path.read_text(encoding="utf-8"))
    results: list[dict[str, Any]] = []
    for page in manifest.get("pages", []):
        title = str(page.get("title") or "")
        category = page.get("category_path") or []
        category_text = " > ".join(category) if isinstance(category, list) else str(category)
        doc_path = index_path.parent / str(page.get("file") or "")
        try:
            body = doc_path.read_text(encoding="utf-8") if doc_path.exists() else ""
        except OSError:
            body = ""
        haystack = f"{title} {category_text} {body}".lower()
        hits = sum(haystack.count(term.lower()) for term in terms)
        if not hits:
            continue
        title_hits = sum(title.lower().count(term.lower()) for term in terms)
        category_hits = sum(category_text.lower().count(term.lower()) for term in terms)
        score = -(title_hits * 8.0 + category_hits * 3.0 + hits)
        results.append({
            "title": title,
            "url": page.get("url"),
            "category_path": category_text,
            "file": page.get("file"),
            "snippet": snippet(body or title, terms),
            "score": score,
        })
    results.sort(key=lambda item: (item["score"], item["title"]))
    return results[: max(1, min(limit, 30))]


def search_sqlite(index_path: Path, terms: list[str], limit: int) -> list[dict[str, Any]]:
    match = " OR ".join(f'"{term.replace(chr(34), chr(34) * 2)}"' for term in terms)
    connection = sqlite3.connect(index_path)
    connection.row_factory = sqlite3.Row
    rows = connection.execute(
        """
        SELECT p.title, p.url, p.category_path, p.file,
               snippet(pages_fts, 3, '', '', ' … ', 24) AS snippet,
               bm25(pages_fts, 8.0, 3.0, 1.0, 0.25) AS score
        FROM pages_fts JOIN pages p ON p.slug = pages_fts.slug
        WHERE pages_fts MATCH ?
        ORDER BY score
        LIMIT ?
        """,
        (match, max(1, min(limit, 30))),
    ).fetchall()
    connection.close()
    return [dict(row) for row in rows]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    default_root = Path(__file__).resolve().parents[2] / "references" / "topn" / "topon-help"
    parser.add_argument("query")
    parser.add_argument("--index", type=Path, help="SQLite 索引或 index.json；默认优先使用 SQLite，不存在时回退到 JSON + Markdown")
    parser.add_argument("--limit", type=int, default=8)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    terms = query_terms(args.query)
    if not terms:
        raise SystemExit("The query contains no searchable terms")
    index = args.index.resolve() if args.index else (
        default_root / "index.sqlite3" if (default_root / "index.sqlite3").exists() else default_root / "index.json"
    )
    if not index.exists():
        raise SystemExit(f"Index not found: {index}. Run crawl_topon_docs.py first.")
    if index.suffix.lower() in {".sqlite", ".sqlite3", ".db"}:
        results = search_sqlite(index, terms, args.limit)
    else:
        results = search_json(index, terms, args.limit)
    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        for index, row in enumerate(results, 1):
            printable = f"{index}. {row['title']}\n   {row['category_path']}\n   {row['url']}\n   {row['snippet']}"
            print(printable.replace("\u00a0", " "))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
