#!/usr/bin/env python3
"""Mirror the public TopOn Chinese help center and build local indexes."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import sqlite3
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup
    from markdownify import markdownify
except ImportError as exc:  # pragma: no cover - dependency error is user-facing
    raise SystemExit(
        "Missing dependency. Install requests, beautifulsoup4 and markdownify. "
        f"Original error: {exc}"
    ) from exc


BASE_URL = "https://help.toponad.net"
HOME_URL = f"{BASE_URL}/cn"
DEFAULT_SEED = f"{BASE_URL}/cn/docs/bPMOE6"
USER_AGENT = "topn/1.0 (local documentation mirror)"
DOC_PATH_RE = re.compile(r"^/cn/docs/[^#?]+$")


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def safe_slug(url: str) -> str:
    raw = unquote(urlparse(url).path.rsplit("/", 1)[-1]).strip()
    safe = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", raw).strip(" .")
    return safe or hashlib.sha256(url.encode("utf-8")).hexdigest()[:16]


def unique_doc_filename(page: dict, collision_counts: dict[str, int]) -> str:
    slug = page["slug"]
    if collision_counts.get(slug.lower(), 0) > 1:
        suffix = hashlib.sha256(page["url"].encode("utf-8")).hexdigest()[:8]
        return f"{slug}-{suffix}.md"
    return f"{slug}.md"


def canonical_doc_url(href: str) -> str | None:
    absolute = urljoin(BASE_URL, href)
    parsed = urlparse(absolute)
    if parsed.netloc != urlparse(BASE_URL).netloc or not DOC_PATH_RE.match(parsed.path):
        return None
    return f"{BASE_URL}{parsed.path.rstrip('/')}"


def fetch(session: requests.Session, url: str, timeout: int, retries: int) -> requests.Response:
    last_error: Exception | None = None
    for attempt in range(retries + 1):
        try:
            response = session.get(url, timeout=timeout)
            response.raise_for_status()
            return response
        except requests.RequestException as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(0.6 * (attempt + 1))
    assert last_error is not None
    raise last_error


def direct_node_anchor(li):
    for anchor in li.find_all("a", href=True):
        if anchor.find_parent("li") is li and canonical_doc_url(anchor["href"]):
            return anchor
    return None


def parse_navigation(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    menu = soup.select_one(".hl-content ul.el-menu--vertical")
    if menu is None:
        raise ValueError("TopOn navigation menu was not found; the site layout may have changed")

    pages: list[dict] = []
    order = 0

    def walk(ul, ancestors: list[dict]) -> None:
        nonlocal order
        for li in ul.find_all("li", recursive=False):
            anchor = direct_node_anchor(li)
            current_ancestors = ancestors
            if anchor is not None:
                url = canonical_doc_url(anchor["href"])
                title = anchor.get_text(" ", strip=True)
                if url and title:
                    order += 1
                    node = {
                        "slug": safe_slug(url),
                        "url": url,
                        "title": title,
                        "category_path": [item["title"] for item in ancestors] + [title],
                        "parent_slug": ancestors[-1]["slug"] if ancestors else None,
                        "order": order,
                    }
                    pages.append(node)
                    current_ancestors = ancestors + [node]
            for child_ul in li.find_all("ul", recursive=False):
                walk(child_ul, current_ancestors)

    walk(menu, [])
    deduped: dict[str, dict] = {}
    for page in pages:
        deduped.setdefault(page["url"], page)
    return list(deduped.values())


def clean_article_markdown(article) -> str:
    for tag in article.select("script, style, button, .copy-code-button"):
        tag.decompose()
    text = markdownify(str(article), heading_style="ATX", bullets="-")
    text = text.replace("\u00a0", " ")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def parse_page(html: str, url: str, nav_meta: dict, captured_at: str) -> tuple[dict, str]:
    soup = BeautifulSoup(html, "html.parser")
    heading = soup.find("h1")
    article = soup.select_one(
        ".Article_CSS_Doc, .hl-edior3.mce-content-body, #hl-doc .hl-edior3, "
        "#hl-doc .md-editor-preview-wrapper"
    )
    title = heading.get_text(" ", strip=True) if heading else nav_meta["title"]
    body = clean_article_markdown(article) if article is not None else ""
    has_article_body = bool(body)
    if not body:
        body = "> 此页面是栏目或导航节点，抓取时没有独立正文。请查看其子页面。"
    all_text = soup.get_text(" ", strip=True)
    modified_match = re.search(r"最近修改\s*[:：]?\s*(\d{4}-\d{2}-\d{2})", all_text)
    digest = hashlib.sha256(body.encode("utf-8")).hexdigest()
    frontmatter = {
        "title": title,
        "source": url,
        "captured_at": captured_at,
        "site_modified": modified_match.group(1) if modified_match else None,
        "category_path": nav_meta["category_path"],
        "content_sha256": digest,
        "knowledge_role": "reference_only",
        "has_article_body": has_article_body,
    }
    header = "---\n" + "\n".join(
        f"{key}: {json.dumps(value, ensure_ascii=False)}" for key, value in frontmatter.items()
    ) + "\n---\n\n"
    markdown = f"{header}# {title}\n\n{body}\n"
    meta = {
        **nav_meta,
        "title": title,
        "captured_at": captured_at,
        "site_modified": frontmatter["site_modified"],
        "content_sha256": digest,
        "has_article_body": has_article_body,
        "status": 200,
    }
    return meta, markdown


def search_terms(text: str) -> str:
    lowered = text.lower()
    ascii_words = re.findall(r"[a-z0-9][a-z0-9_.+-]*", lowered)
    cjk_runs = re.findall(r"[\u3400-\u9fff]+", lowered)
    terms = set(ascii_words)
    for run in cjk_runs:
        if len(run) == 1:
            terms.add(run)
        else:
            terms.update(run[i : i + 2] for i in range(len(run) - 1))
    return " ".join(sorted(terms))


def build_sqlite(index_path: Path, pages: list[dict], docs_dir: Path) -> None:
    index_path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(prefix="topon-index-", suffix=".sqlite3", dir=index_path.parent)
    os.close(fd)
    temp_path = Path(temp_name)
    try:
        connection = sqlite3.connect(temp_path)
        connection.executescript(
            """
            CREATE TABLE pages (
                slug TEXT PRIMARY KEY,
                url TEXT NOT NULL,
                title TEXT NOT NULL,
                category_path TEXT NOT NULL,
                parent_slug TEXT,
                file TEXT NOT NULL,
                captured_at TEXT NOT NULL,
                site_modified TEXT,
                content_sha256 TEXT NOT NULL
            );
            CREATE VIRTUAL TABLE pages_fts USING fts5(
                slug UNINDEXED,
                title,
                category_path,
                body,
                terms,
                tokenize='unicode61'
            );
            """
        )
        for page in pages:
            doc_path = docs_dir / Path(page["file"]).name
            body = doc_path.read_text(encoding="utf-8")
            body = re.sub(r"\A---\n.*?\n---\n+", "", body, flags=re.DOTALL)
            body = body.replace("\u00a0", " ")
            category = " > ".join(page["category_path"])
            connection.execute(
                "INSERT INTO pages VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    page["slug"], page["url"], page["title"], category,
                    page["parent_slug"], page["file"], page["captured_at"],
                    page["site_modified"], page["content_sha256"],
                ),
            )
            connection.execute(
                "INSERT INTO pages_fts VALUES (?, ?, ?, ?, ?)",
                (page["slug"], page["title"], category, body, search_terms(f"{page['title']} {category} {body}")),
            )
        connection.commit()
        connection.close()
        os.replace(temp_path, index_path)
    finally:
        if temp_path.exists():
            temp_path.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    default_output = Path(__file__).resolve().parents[2] / "references" / "topn" / "topon-help"
    parser.add_argument("--output", type=Path, default=default_output)
    parser.add_argument("--seed", default=DEFAULT_SEED)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--retries", type=int, default=2)
    parser.add_argument("--limit", type=int, help="Limit pages for a smoke test")
    parser.add_argument("--reindex-only", action="store_true", help="Rebuild SQLite from the existing mirror")
    args = parser.parse_args()

    live_output = args.output.resolve()
    if args.reindex_only:
        docs_dir = live_output / "docs"
        manifest_path = live_output / "index.json"
        if not manifest_path.exists():
            raise SystemExit(f"Manifest not found: {manifest_path}")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        pages = manifest.get("pages", [])
        build_sqlite(live_output / "index.sqlite3", pages, docs_dir)
        print(json.dumps({"output": str(live_output), "reindexed": len(pages)}, ensure_ascii=False, indent=2))
        return 0
    live_output.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix="topon-help-refresh-", dir=live_output.parent))
    output = staging
    docs_dir = output / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)
    captured_at = utc_now()

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT, "Accept-Language": "zh-CN,zh;q=0.9"})
    seed_response = fetch(session, args.seed, args.timeout, args.retries)
    navigation = parse_navigation(seed_response.text)
    if args.limit:
        navigation = navigation[: args.limit]
    collision_counts: dict[str, int] = {}
    for page in navigation:
        key = page["slug"].lower()
        collision_counts[key] = collision_counts.get(key, 0) + 1
    for page in navigation:
        page["doc_filename"] = unique_doc_filename(page, collision_counts)

    results: list[dict] = []
    failures: list[dict] = []

    def process(page: dict) -> tuple[dict, str]:
        local_session = requests.Session()
        local_session.headers.update(session.headers)
        response = fetch(local_session, page["url"], args.timeout, args.retries)
        return parse_page(response.text, page["url"], page, captured_at)

    with ThreadPoolExecutor(max_workers=max(1, min(args.workers, 16))) as executor:
        futures = {executor.submit(process, page): page for page in navigation}
        for future in as_completed(futures):
            page = futures[future]
            try:
                meta, markdown = future.result()
                doc_path = docs_dir / meta["doc_filename"]
                doc_path.write_text(markdown, encoding="utf-8", newline="\n")
                meta["file"] = f"docs/{meta['doc_filename']}"
                del meta["doc_filename"]
                results.append(meta)
            except Exception as exc:  # keep the rest of the mirror usable
                failures.append({"url": page["url"], "title": page["title"], "error": str(exc)})

    results.sort(key=lambda page: page["order"])
    manifest = {
        "site": HOME_URL,
        "captured_at": captured_at,
        "discovered_pages": len(navigation),
        "saved_pages": len(results),
        "failed_pages": len(failures),
        "failures": failures,
        "roots": [page["slug"] for page in results if page["parent_slug"] is None],
        "pages": results,
    }
    output.mkdir(parents=True, exist_ok=True)
    (output / "index.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n"
    )
    if results and not failures:
        build_sqlite(output / "index.sqlite3", results, docs_dir)

    if failures:
        live_output.mkdir(parents=True, exist_ok=True)
        failed_path = live_output / "last-failed-refresh.json"
        fd, failed_temp_name = tempfile.mkstemp(prefix="failed-refresh-", suffix=".json", dir=live_output)
        os.close(fd)
        failed_temp = Path(failed_temp_name)
        failed_temp.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
        os.replace(failed_temp, failed_path)
        shutil.rmtree(staging)
    else:
        live_docs = live_output / "docs"
        live_docs.mkdir(parents=True, exist_ok=True)
        for staged_doc in docs_dir.glob("*.md"):
            os.replace(staged_doc, live_docs / staged_doc.name)
        for name in ("index.json", "index.sqlite3"):
            os.replace(output / name, live_output / name)
        failed_path = live_output / "last-failed-refresh.json"
        if failed_path.exists():
            failed_path.unlink()
        shutil.rmtree(staging)

    print(json.dumps({
        "output": str(live_output),
        "discovered": len(navigation),
        "saved": len(results),
        "failed": len(failures),
        "captured_at": captured_at,
    }, ensure_ascii=False, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
