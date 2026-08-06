"""Download an authorized 38ksw novel through its normal chapter navigation."""

from __future__ import annotations

import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


BOOK_URL = "https://www.38ksw.com/95139303/407932535.html"
OUTPUT_DIR = Path(r"E:\LLM-Sandbox\Codex\output\folder\高中还没毕业你怎么就成宗师了")
DELAY_SECONDS = 0.05
MAX_RETRIES = 4

STATUS_FILE = OUTPUT_DIR / "progress.json"
VISITED_FILE = OUTPUT_DIR / "visited_urls.txt"
ERROR_FILE = OUTPUT_DIR / "errors.log"

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": "AuthorizedArchiveBot/1.0 (+local authorized archival download)",
        "Accept-Language": "zh-CN,zh;q=0.9",
    }
)


def get_html(url: str) -> str:
    for attempt in range(MAX_RETRIES):
        try:
            response = SESSION.get(url, timeout=30)
            response.raise_for_status()
            response.encoding = response.apparent_encoding or response.encoding
            return response.text
        except requests.RequestException as exc:
            if attempt + 1 == MAX_RETRIES:
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError("unreachable")


def chapter_title(soup: BeautifulSoup) -> str:
    title = soup.title.get_text(" ", strip=True) if soup.title else ""
    title = title.split("_", 1)[0].strip()
    return title or "未命名章节"


def chapter_text(soup: BeautifulSoup) -> str:
    body = soup.select_one("#chaptercontent")
    if body is None:
        return ""
    parts = []
    for element in body.select("p"):
        text = element.get_text(" ", strip=True)
        if not text or "本章未完" in text or "加入书签" in text:
            continue
        parts.append(text)
    return "\n\n".join(parts)


def next_url(soup: BeautifulSoup, current_url: str) -> str | None:
    link = soup.select_one("a#pt_next[href]")
    if not link:
        return None
    href = link["href"].strip()
    if not href or href.startswith("javascript:"):
        return None
    return urljoin(current_url, href)


def safe_filename(name: str) -> str:
    return re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name).strip(". ")[:160]


def load_status() -> dict:
    if not STATUS_FILE.exists():
        return {"next_url": BOOK_URL, "saved_chapters": 0, "current_title": None, "current_parts": [], "current_urls": []}
    return json.loads(STATUS_FILE.read_text(encoding="utf-8"))


def save_status(status: dict) -> None:
    STATUS_FILE.write_text(json.dumps(status, ensure_ascii=False, indent=2), encoding="utf-8")


def chapter_number(title: str, fallback: int) -> int:
    match = re.search(r"第\s*(\d+)\s*章", title)
    return int(match.group(1)) if match else fallback


def save_chapter(status: dict) -> None:
    if not status["current_title"]:
        return
    number = chapter_number(status["current_title"], status["saved_chapters"] + 1)
    filename = f"{number:04d} {safe_filename(status['current_title'])}.txt"
    content = "\n".join(status["current_parts"]).strip()
    source_list = "\n".join(status["current_urls"])
    (OUTPUT_DIR / filename).write_text(
        f"{status['current_title']}\n\n来源：\n{source_list}\n\n{content}\n", encoding="utf-8"
    )
    status["saved_chapters"] += 1
    status["current_title"] = None
    status["current_parts"] = []
    status["current_urls"] = []


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    status = load_status()
    visited = set(VISITED_FILE.read_text(encoding="utf-8").splitlines()) if VISITED_FILE.exists() else set()

    while status["next_url"]:
        current_url = status["next_url"]
        if current_url in visited:
            ERROR_FILE.write_text(f"检测到导航循环：{current_url}\n", encoding="utf-8")
            break
        try:
            soup = BeautifulSoup(get_html(current_url), "html.parser")
        except requests.RequestException as exc:
            with ERROR_FILE.open("a", encoding="utf-8") as fh:
                fh.write(f"下载失败 {current_url}: {exc}\n")
            raise

        title = chapter_title(soup)
        text = chapter_text(soup)
        if status["current_title"] and title != status["current_title"]:
            save_chapter(status)
        if not status["current_title"]:
            status["current_title"] = title
        if text:
            status["current_parts"].append(text)
        status["current_urls"].append(current_url)

        visited.add(current_url)
        with VISITED_FILE.open("a", encoding="utf-8") as fh:
            fh.write(current_url + "\n")
        status["next_url"] = next_url(soup, current_url)
        save_status(status)
        print(f"pages={len(visited)} saved={status['saved_chapters']} current={title}", flush=True)
        time.sleep(DELAY_SECONDS)

    save_chapter(status)
    status["next_url"] = None
    save_status(status)
    print(f"完成：共保存 {status['saved_chapters']} 章。", flush=True)


if __name__ == "__main__":
    main()
