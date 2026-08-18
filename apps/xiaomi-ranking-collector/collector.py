from __future__ import annotations

import argparse
import csv
import html
import json
import re
import shutil
import sqlite3
import subprocess
import sys
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from urllib.request import Request, urlopen
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parent
DEFAULT_DATA = ROOT / "data"
BOUNDS_RE = re.compile(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]")
RANK_RE = re.compile(r"^(?:#\s*)?(\d{1,3})[.)、、]?$|^#(\d{1,3})$")
DESC_RANK_RE = re.compile(r"^(\d{1,3}),\s*(.+?)(?:\.\s*评分|,\s*评分|\s+评分)")
DETAIL_URI_RE = re.compile(r"mimarket://details\?appId=([^&\s]+)&packageName=([^&\s}]+)")
UPDATE_DATE_RE = re.compile(r'aria-label="Update on\s*:\s*([^\"]+)"', re.IGNORECASE)
WEB_RATING_RE = re.compile(r'aria-label="Ratings\s*:\s*([^\"]+)"', re.IGNORECASE)
WEB_DEVELOPER_RE = re.compile(r'<p class="app-info__developer[^\"]*"[^>]*>\s*<span>(.*?)</span>', re.DOTALL)
WEB_DOWNLOADS_RE = re.compile(r'aria-label="Downloads\s*:\s*([^\"]+)"', re.IGNORECASE)
GP_DEVELOPER_RE = re.compile(r'<div class="Vbfug[^\"]*"[^>]*>.*?<span>(.*?)</span>', re.DOTALL)
GP_RATING_RE = re.compile(r'aria-label="Rated\s+([0-9.]+)\s+stars out of five stars"', re.IGNORECASE)
GP_DOWNLOADS_RE = re.compile(r'<div class="ClM7O">\s*([^<]+?)\s*</div>\s*<div class="g1rdde">Downloads</div>', re.DOTALL)
GP_UPDATED_AT_RE = re.compile(r'<div class="lXlx5">Updated on</div><div class="xg1aie">(.*?)</div>', re.DOTALL)


@dataclass
class Node:
    text: str
    content_desc: str
    resource_id: str
    bounds: tuple[int, int, int, int]
    selected: bool = False

    @property
    def label(self) -> str:
        return self.text or self.content_desc

    @property
    def center(self) -> tuple[int, int]:
        x1, y1, x2, y2 = self.bounds
        return ((x1 + x2) // 2, (y1 + y2) // 2)


class CollectorError(RuntimeError):
    pass


def next_run_name(data_dir: Path, now: datetime | None = None) -> str:
    now = now or datetime.now()
    prefix = f"rank-{now.strftime('%Y%m%d')}-"
    sequence = 0
    for path in data_dir.glob(f"{prefix}[0-9][0-9].csv"):
        match = re.fullmatch(re.escape(prefix) + r"(\d{2})\.csv", path.name)
        if match:
            sequence = max(sequence, int(match.group(1)))
    return f"{prefix}{sequence + 1:02d}"


def load_config(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        config = json.load(handle)
    if not config.get("regions"):
        raise CollectorError("config.regions 不能为空")
    return config


def resolve_adb(config: dict) -> str:
    candidates = []
    if config.get("adb_path"):
        candidates.append(Path(config["adb_path"]))
    candidates.append(ROOT / ".tools" / "platform-tools" / "adb.exe")
    candidates.append(ROOT / ".tools" / "platform-tools" / "adb")
    found = shutil.which("adb")
    if found:
        candidates.append(Path(found))
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    raise CollectorError("找不到 adb。请先运行 setup.ps1，或在 config.json 设置 adb_path。")


class Device:
    def __init__(self, adb: str, run_dir: Path):
        self.adb = adb
        self.run_dir = run_dir
        self.run_dir.mkdir(parents=True, exist_ok=True)
        self._screen_size: tuple[int, int] | None = None

    def command(self, *args: str, check: bool = True, timeout: int = 30) -> str:
        result = subprocess.run(
            [self.adb, *args],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
        )
        output = (result.stdout or "") + (result.stderr or "")
        if check and result.returncode != 0:
            raise CollectorError(f"ADB 命令失败: {' '.join(args)}\n{output.strip()}")
        return output.strip()

    def shell(self, *args: str, check: bool = True, timeout: int = 30) -> str:
        return self.command("shell", *args, check=check, timeout=timeout)

    def screenshot(self, name: str) -> None:
        target = self.run_dir / f"{name}.png"
        with target.open("wb") as handle:
            result = subprocess.run([self.adb, "exec-out", "screencap", "-p"], stdout=handle, stderr=subprocess.PIPE, timeout=30)
        if result.returncode != 0:
            raise CollectorError(f"截图失败: {result.stderr.decode(errors='replace')}")

    def dump_ui(self, name: str = "screen") -> list[Node]:
        remote = "/sdcard/codex-window.xml"
        self.shell("uiautomator", "dump", remote, check=False)
        xml = self.shell("cat", remote, check=False)
        (self.run_dir / f"{name}.xml").write_text(xml, encoding="utf-8")
        try:
            root = ElementTree.fromstring(xml[xml.find("<hierarchy"):])
        except (ElementTree.ParseError, ValueError) as exc:
            raise CollectorError(f"无法解析 UIAutomator XML，页面可能未稳定: {exc}") from exc

        nodes: list[Node] = []
        for element in root.iter():
            text = element.attrib.get("text", "").strip()
            desc = element.attrib.get("content-desc", "").strip()
            bounds = parse_bounds(element.attrib.get("bounds", ""))
            resource_id = element.attrib.get("resource-id", "")
            if bounds and (text or desc or resource_id == "android:id/input"):
                nodes.append(Node(text, desc, resource_id, bounds, element.attrib.get("selected") == "true"))
        return nodes

    def tap(self, x: int, y: int) -> None:
        self.shell("input", "tap", str(x), str(y))

    def swipe(self, x1: int, y1: int, x2: int, y2: int, duration_ms: int = 500) -> None:
        self.shell("input", "swipe", str(x1), str(y1), str(x2), str(y2), str(duration_ms))

    def screen_size(self) -> tuple[int, int]:
        if self._screen_size:
            return self._screen_size
        output = self.shell("wm", "size")
        match = re.search(r"(\d+)x(\d+)", output)
        if not match:
            self._screen_size = (720, 1600)
        else:
            self._screen_size = (int(match.group(1)), int(match.group(2)))
        return self._screen_size

    def swipe_up(self, start_ratio: float = 0.82, end_ratio: float = 0.28) -> None:
        width, height = self.screen_size()
        x = width // 2
        self.swipe(x, int(height * start_ratio), x, int(height * end_ratio))

    def back(self) -> None:
        self.shell("input", "keyevent", "KEYCODE_BACK")

    def current_package(self) -> str:
        output = self.shell("dumpsys", "activity", "activities", check=False)
        match = re.search(r"(?:topResumedActivity|mResumedActivity)=.*?\s([A-Za-z0-9_.]+)/(?:[^\s}]+)", output)
        return match.group(1) if match else ""

    def wait_for_package(self, package: str, timeout: float = 15, stable_seconds: float = 2) -> None:
        deadline = time.monotonic() + timeout
        stable_since: float | None = None
        while time.monotonic() < deadline:
            if self.current_package() == package:
                if stable_since is None:
                    stable_since = time.monotonic()
                if time.monotonic() - stable_since >= stable_seconds:
                    return
            else:
                stable_since = None
            time.sleep(0.5)
        raise CollectorError(f"应用未进入前台: {package}，当前前台为 {self.current_package() or '未知'}")

    def launch_and_wait(self, package: str, attempts: int = 3) -> None:
        for _ in range(attempts):
            self.shell("input", "keyevent", "KEYCODE_HOME", check=False)
            time.sleep(0.8)
            self.launch(package)
            try:
                self.wait_for_package(package, timeout=15, stable_seconds=2)
                return
            except CollectorError:
                time.sleep(1)
        raise CollectorError(f"多次尝试后仍无法稳定打开应用: {package}")

    def launch(self, package: str) -> None:
        self.force_stop(package)
        resolved = self.command("shell", "cmd", "package", "resolve-activity", "--brief", package, check=False)
        component = next((line.strip() for line in resolved.splitlines() if line.strip().startswith(f"{package}/")), "")
        if component:
            self.shell("am", "start", "-n", component)
        else:
            self.shell("monkey", "-p", package, "1")

    def force_stop(self, package: str) -> None:
        self.shell("am", "force-stop", package)


def parse_bounds(value: str) -> tuple[int, int, int, int] | None:
    match = BOUNDS_RE.fullmatch(value)
    if not match:
        return None
    return tuple(int(part) for part in match.groups())  # type: ignore[return-value]


def normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip()).casefold()


def find_node(nodes: Iterable[Node], labels: Iterable[str]) -> Node | None:
    wanted = [normalize(label) for label in labels if label]
    all_nodes = list(nodes)
    for label in wanted:
        for node in all_nodes:
            if normalize(node.label) == label:
                return node
    for label in wanted:
        for node in all_nodes:
            if label in normalize(node.label):
                return node
    return None


def find_resource_node(nodes: Iterable[Node], suffix: str) -> Node | None:
    for node in nodes:
        if node.resource_id == suffix or node.resource_id.endswith(suffix):
            return node
    return None


def tap_label(device: Device, labels: Iterable[str], page_name: str, scroll: bool = True, max_swipes: int = 12) -> Node:
    for index in range(max_swipes + 1):
        nodes = device.dump_ui(page_name if index == 0 else f"{page_name}-{index}")
        node = find_node(nodes, labels)
        if node:
            device.tap(*node.center)
            return node
        if not scroll or index == max_swipes:
            break
        device.swipe_up()
        time.sleep(0.6)
    raise CollectorError(f"页面找不到控件: {list(labels)}")


def tap_tab_label(device: Device, label: str, page_name: str, timeout: float = 20) -> Node:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        nodes = device.dump_ui(page_name)
        tab_nodes = [node for node in nodes if node.resource_id.endswith("tab_text_v")]
        node = find_node(tab_nodes, [label])
        if node:
            device.tap(*node.center)
            return node
        time.sleep(1)
    raise CollectorError(f"等待游戏分类标签超时: {label}")


def find_game_category_tabs(nodes: Iterable[Node], categories: Iterable[str]) -> list[Node]:
    """Return only the top-level game category tabs requested by the run."""
    wanted = {normalize(category) for category in categories}
    return [
        node
        for node in nodes
        if node.resource_id.endswith("tab_text_v") and normalize(node.label) in wanted
    ]


def game_section_labels(category: str) -> list[str]:
    """Map configured category names to titles used by the Games landing page."""
    labels = [category]
    if category.endswith("游戏"):
        labels.append(category.removesuffix("游戏"))
    return labels


def open_game_channel(
    device: Device,
    package: str,
    game_tab: str,
    categories: Iterable[str],
    region: str,
    attempts: int = 3,
    timeout: float = 20,
) -> bool:
    """Open Games and report whether the official category tabs rendered."""
    categories = list(categories)
    for attempt in range(1, attempts + 1):
        tap_label(device, [game_tab], f"game-tab-{safe_name(region)}-{attempt}", scroll=False)
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            nodes = device.dump_ui(f"game-channel-{safe_name(region)}-{attempt}")
            if find_game_category_tabs(nodes, categories):
                return True
            time.sleep(1)
        device.screenshot(f"game-channel-{safe_name(region)}-{attempt}-unavailable")
        if attempt < attempts:
            device.launch_and_wait(package)
            time.sleep(2)
    print(f"[{region}] 游戏页未返回官方分类栏，改用主页分类专区。")
    return False


def tap_game_section_entry(device: Device, category: str, region: str, max_swipes: int = 12) -> bool:
    """Open a category's 'more' page from the Games landing-page section."""
    width, _ = device.screen_size()
    labels = game_section_labels(category)
    previous_titles: tuple[tuple[str, tuple[int, int, int, int]], ...] | None = None
    stale_pages = 0
    for index in range(max_swipes + 1):
        nodes = device.dump_ui(f"game-section-{safe_name(region)}-{safe_name(category)}-{index}")
        section_titles = [node for node in nodes if node.resource_id.endswith("apps_title")]
        node = find_node(section_titles, labels)
        if node:
            # The text is decorative; the full-width title layout's arrow opens the list.
            device.tap(width - 49, node.center[1])
            deadline = time.monotonic() + 10
            while time.monotonic() < deadline:
                list_nodes = device.dump_ui(f"game-section-list-{safe_name(region)}-{safe_name(category)}")
                if any(item.resource_id.endswith(":id/name") for item in list_nodes):
                    return True
                time.sleep(0.8)
            raise CollectorError(f"{region}/{category} 的分类入口未能打开应用列表")
        signature = tuple((title.label, title.bounds) for title in section_titles)
        stale_pages = stale_pages + 1 if signature == previous_titles else 0
        if stale_pages >= 2 or index == max_swipes:
            return False
        previous_titles = signature
        device.swipe_up()
        time.sleep(1)
    return False


def select_region_by_search(device: Device, region: str, search_term: str) -> None:
    nodes = device.dump_ui(f"region-search-{safe_name(region)}")
    search_input = find_resource_node(nodes, "android:id/input")
    if not search_input:
        raise CollectorError("地区页找不到搜索框")
    device.tap(*search_input.center)
    device.shell("input", "keyevent", "KEYCODE_CTRL_A", check=False)
    device.shell("input", "keyevent", "KEYCODE_DEL", check=False)
    device.shell("input", "text", search_term)
    time.sleep(0.8)
    results = device.dump_ui(f"region-search-{safe_name(region)}-result")
    result = find_node([node for node in results if node.resource_id.endswith(":id/locale")], [region])
    if not result:
        locale_nodes = [node for node in results if node.resource_id.endswith(":id/locale")]
        if len(locale_nodes) == 1:
            result = locale_nodes[0]
    if not result:
        raise CollectorError(f"拼音搜索 {search_term} 找不到地区: {region}")
    device.tap(*result.center)
    time.sleep(4)


def discover_getapps_package(device: Device, configured: str) -> str:
    if configured:
        return configured
    packages = device.shell("pm", "list", "packages")
    matches = [line.split(":", 1)[1] for line in packages.splitlines() if any(key in line.lower() for key in ("mipicks", "xiaomi.market"))]
    if not matches:
        raise CollectorError("未找到 GetApps 包。请确认应用已安装，或在 config.json 设置 getapps_package。")
    return matches[0]


def switch_region(
    device: Device,
    region: str,
    labels: dict,
    search_term: str = "",
    region_code: str = "",
) -> None:
    # Global HyperOS builds may hide the Settings region picker. GetApps still
    # honors its persisted market region key, so use it when a code is known.
    if region_code:
        device.shell("settings", "put", "system", "com.xiaomi.market.lastRegion", region_code)
        device.shell("am", "force-stop", "com.xiaomi.mipicks", check=False)
        time.sleep(1)
        return
    device.launch("com.android.settings")
    time.sleep(1)
    tap_label(device, labels["additional_settings"], "settings-additional")
    time.sleep(0.8)
    tap_label(device, labels["region"], "settings-region")
    time.sleep(0.8)
    if search_term:
        select_region_by_search(device, region, search_term)
    else:
        tap_label(device, [region], f"region-{safe_name(region)}")
    time.sleep(1)


def safe_name(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", value)


def collect_visible_items(device: Device, region: str, category: str, seen: set[tuple[str, str]], run_id: str) -> list[dict]:
    nodes = device.dump_ui(f"{safe_name(region)}-{safe_name(category)}")
    items: list[dict] = []
    current_rank: int | None = None
    pending_category = ""
    current_item: dict | None = None
    for node in nodes:
        description_match = DESC_RANK_RE.match(node.content_desc)
        if description_match:
            current_rank = int(description_match.group(1))
            description = description_match.group(2)
            pending_category = description.rsplit(",", 1)[-1].strip() if "," in description else ""
        elif node.resource_id.endswith("tv_pos") and node.text.isdigit():
            current_rank = int(node.text)
            pending_category = ""
        elif node.resource_id.endswith("tv_title") and current_rank is not None:
            app_name = node.text.strip()
            key = (str(current_rank), normalize(app_name))
            if app_name and key not in seen:
                seen.add(key)
                current_item = {
                    "run_id": run_id,
                    "region": region,
                    "ranking_type": "游戏分类",
                    "category": pending_category or category,
                    "rank": current_rank,
                    "app_name": app_name,
                    "package_name": "",
                    "raw_text": node.content_desc or app_name,
                    "captured_at": datetime.now(timezone.utc).isoformat(),
                    "rating": "",
                    "downloads": "",
                    "developer": "",
                    "updated_at": "",
                    "link": "",
                    "link_source": "",
                }
                items.append(current_item)
            else:
                current_item = None
        elif node.resource_id.endswith("tv_category") and current_item is not None:
            current_item["category"] = node.text.strip()
    return items


def collect_visible_section_items(
    device: Device,
    region: str,
    category: str,
    seen: set[str],
    run_id: str,
    next_rank: int,
) -> tuple[list[dict], int]:
    """Collect an unranked section list while preserving its displayed order."""
    nodes = device.dump_ui(f"section-list-{safe_name(region)}-{safe_name(category)}")
    items: list[dict] = []
    current_item: dict | None = None
    for node in nodes:
        if node.resource_id.endswith(":id/name") and node.text:
            app_name = node.text.strip()
            key = normalize(app_name)
            if key and key not in seen:
                seen.add(key)
                current_item = {
                    "run_id": run_id,
                    "region": region,
                    "ranking_type": "游戏分类推荐（页面顺序）",
                    "category": category,
                    "rank": next_rank,
                    "app_name": app_name,
                    "package_name": "",
                    "raw_text": app_name,
                    "captured_at": datetime.now(timezone.utc).isoformat(),
                    "rating": "",
                    "downloads": "",
                    "developer": "",
                    "updated_at": "",
                    "link": "",
                    "link_source": "",
                }
                next_rank += 1
                items.append(current_item)
            else:
                current_item = None
        elif node.resource_id.endswith("tags_container") and current_item is not None and node.text:
            current_item["raw_text"] = f"{current_item['app_name']} | {node.text.strip()}"
    return items, next_rank


def parse_detail_nodes(nodes: Iterable[Node]) -> dict[str, str]:
    values = {"rating": "", "downloads": "", "developer": ""}
    latest_param = ""
    for node in nodes:
        if node.resource_id.endswith("developer"):
            values["developer"] = node.text
        elif node.resource_id.endswith("param"):
            latest_param = node.text
        elif node.resource_id.endswith("desc"):
            if node.text.endswith("评分"):
                values["rating"] = latest_param
            elif node.text == "下载":
                values["downloads"] = latest_param
    return values


def current_detail_identifiers(device: Device) -> tuple[str, str]:
    output = device.shell("dumpsys", "activity", "activities", check=False)
    match = DETAIL_URI_RE.search(output)
    if not match:
        return "", ""
    return match.group(1), match.group(2)


def clean_html_text(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", value)).strip()


def normalize_updated_date(value: str) -> str:
    """Convert public store dates to the export format yyyy/mm/dd."""
    cleaned = clean_html_text(value)
    for date_format in (
        "%Y/%m/%d",
        "%Y-%m-%d",
        "%d.%m.%Y",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%b %d, %Y",
        "%B %d, %Y",
        "%d %b %Y",
        "%d %B %Y",
    ):
        try:
            return datetime.strptime(cleaned, date_format).strftime("%Y/%m/%d")
        except ValueError:
            continue
    return cleaned


def parse_web_metadata(page: str) -> dict[str, str]:
    rating = WEB_RATING_RE.search(page)
    updated_at = UPDATE_DATE_RE.search(page)
    developer = WEB_DEVELOPER_RE.search(page)
    downloads = WEB_DOWNLOADS_RE.search(page)
    return {
        "rating": clean_html_text(rating.group(1)) if rating else "",
        "downloads": clean_html_text(downloads.group(1)) if downloads else "",
        "developer": clean_html_text(developer.group(1)) if developer else "",
        "updated_at": normalize_updated_date(updated_at.group(1)) if updated_at else "",
    }


def parse_google_play_metadata(page: str) -> dict[str, str]:
    rating = GP_RATING_RE.search(page)
    downloads = GP_DOWNLOADS_RE.search(page)
    developer = GP_DEVELOPER_RE.search(page)
    updated_at = GP_UPDATED_AT_RE.search(page)
    updated_value = normalize_updated_date(updated_at.group(1)) if updated_at else ""
    return {
        "rating": clean_html_text(rating.group(1)) if rating else "",
        "downloads": clean_html_text(downloads.group(1)) if downloads else "",
        "developer": clean_html_text(developer.group(1)) if developer else "",
        "updated_at": updated_value,
    }


def empty_web_metadata() -> dict[str, str]:
    return {
        "link": "",
        "link_source": "",
        "rating": "",
        "downloads": "",
        "developer": "",
        "updated_at": "",
    }


def get_web_metadata(package_name: str, cache: dict[str, dict[str, str]]) -> dict[str, str]:
    if not package_name:
        return empty_web_metadata()
    cache_key = f"getapps:{package_name}"
    if cache_key in cache:
        return cache[cache_key]
    url = f"https://global.app.mi.com/details?id={package_name}"
    value = empty_web_metadata()
    try:
        request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(request, timeout=20) as response:
            page = response.read().decode("utf-8", errors="replace")
        if 'app-info__title' in page:
            value = {"link": url, "link_source": "getapps", **parse_web_metadata(page)}
    except OSError:
        pass
    cache[cache_key] = value
    return value


def get_google_play_metadata(package_name: str, cache: dict[str, dict[str, str]]) -> dict[str, str]:
    if not package_name:
        return empty_web_metadata()
    cache_key = f"gp:{package_name}"
    if cache_key in cache:
        return cache[cache_key]
    url = f"https://play.google.com/store/apps/details?id={package_name}"
    value = empty_web_metadata()
    try:
        request = Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en;q=0.9"})
        with urlopen(request, timeout=20) as response:
            page = response.read().decode("utf-8", errors="replace")
        if 'itemprop="name"' in page and "Requested URL" not in page:
            value = {"link": url, "link_source": "gp", **parse_google_play_metadata(page)}
    except OSError:
        pass
    cache[cache_key] = value
    return value


def fill_missing_web_fields(primary: dict[str, str], fallback: dict[str, str]) -> dict[str, str]:
    result = primary.copy()
    for field in ("rating", "downloads", "developer", "updated_at"):
        if not result[field]:
            result[field] = fallback[field]
    return result


def get_preferred_web_metadata(package_name: str, cache: dict[str, dict[str, str]]) -> dict[str, str]:
    getapps = get_web_metadata(package_name, cache)
    if not getapps["link"]:
        return get_google_play_metadata(package_name, cache)
    if all(getapps[field] for field in ("rating", "downloads", "developer", "updated_at")):
        return getapps
    return fill_missing_web_fields(getapps, get_google_play_metadata(package_name, cache))


def enrich_visible_items(device: Device, items: list[dict], web_cache: dict[str, dict[str, str]]) -> None:
    """Open each app detail only to obtain its package name, then use web metadata."""
    pending = {normalize(item["app_name"]): item for item in items}
    while pending:
        nodes = device.dump_ui("detail-source")
        candidates = [
            node
            for node in nodes
            if node.text and normalize(node.text) in pending and (
                node.resource_id.endswith("tv_title") or node.resource_id.endswith(":id/name")
            )
        ]
        if not candidates:
            break
        node = candidates[0]
        item = pending.pop(normalize(node.text))
        device.tap(*node.center)
        time.sleep(1.5)
        app_id, package_name = current_detail_identifiers(device)
        item["package_name"] = package_name
        web = get_preferred_web_metadata(package_name, web_cache)
        for field in ("rating", "downloads", "developer", "updated_at", "link", "link_source"):
            item[field] = web[field]
        item["raw_text"] = f"app_id={app_id}" if app_id else ""
        device.back()
        time.sleep(1)


def init_db(path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(path)
    connection.execute("""
        CREATE TABLE IF NOT EXISTS rankings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id TEXT NOT NULL,
            region TEXT NOT NULL,
            ranking_type TEXT NOT NULL,
            category TEXT NOT NULL,
            rank INTEGER NOT NULL,
            app_name TEXT NOT NULL,
            package_name TEXT NOT NULL,
            raw_text TEXT NOT NULL,
            captured_at TEXT NOT NULL
            ,rating TEXT NOT NULL DEFAULT ''
            ,downloads TEXT NOT NULL DEFAULT ''
            ,developer TEXT NOT NULL DEFAULT ''
            ,updated_at TEXT NOT NULL DEFAULT ''
            ,link TEXT NOT NULL DEFAULT ''
            ,link_source TEXT NOT NULL DEFAULT ''
        )
    """)
    columns = {row[1] for row in connection.execute("PRAGMA table_info(rankings)")}
    if "ranking_type" not in columns:
        connection.execute("ALTER TABLE rankings ADD COLUMN ranking_type TEXT NOT NULL DEFAULT ''")
    for column in ("rating", "downloads", "developer", "updated_at", "link", "link_source"):
        if column not in columns:
            connection.execute(f"ALTER TABLE rankings ADD COLUMN {column} TEXT NOT NULL DEFAULT ''")
    connection.execute("CREATE INDEX IF NOT EXISTS idx_rankings_run ON rankings(run_id)")
    connection.commit()
    return connection


def write_items(connection: sqlite3.Connection, items: list[dict]) -> None:
    connection.executemany(
        "INSERT INTO rankings(run_id, region, ranking_type, category, rank, app_name, package_name, raw_text, captured_at, rating, downloads, developer, updated_at, link, link_source) VALUES (:run_id, :region, :ranking_type, :category, :rank, :app_name, :package_name, :raw_text, :captured_at, :rating, :downloads, :developer, :updated_at, :link, :link_source)",
        items,
    )
    connection.commit()


def deduplicate_items_by_package(items: list[dict]) -> list[dict]:
    """Keep the most recently observed position when a live list reorders an app."""
    seen: set[str] = set()
    deduplicated: list[dict] = []
    for item in reversed(items):
        key = item["package_name"] or normalize(item["app_name"])
        if key in seen:
            continue
        seen.add(key)
        deduplicated.append(item)
    return sorted(reversed(deduplicated), key=lambda item: item["rank"])


def missing_ranks(items: list[dict], top_n: int) -> list[int]:
    return sorted(set(range(1, top_n + 1)) - {item["rank"] for item in items})


def export_csv(
    connection: sqlite3.Connection, path: Path, run_id: str | None = None, region: str = ""
) -> None:
    if run_id:
        query = "SELECT region, category, rank, CASE WHEN link_source = 'gp' THEN app_name || '-gp' ELSE app_name END, package_name, rating, downloads, developer, updated_at, link FROM rankings WHERE run_id = ?"
        parameters: tuple[str, ...] = (run_id,)
        if region:
            query += " AND region = ?"
            parameters += (region,)
        rows = connection.execute(query + " ORDER BY id", parameters).fetchall()
    else:
        rows = connection.execute("SELECT region, category, rank, CASE WHEN link_source = 'gp' THEN app_name || '-gp' ELSE app_name END, package_name, rating, downloads, developer, updated_at, link FROM rankings ORDER BY id").fetchall()
    with path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.writer(handle)
        writer.writerow(["region", "category", "rank", "app_name", "package_name", "rating", "downloads", "developer", "updated_at", "link"])
        writer.writerows(rows)


def refresh_web_metadata(connection: sqlite3.Connection, run_id: str, region: str = "") -> int:
    query = "SELECT id, package_name FROM rankings WHERE run_id = ?"
    parameters: tuple[str, ...] = (run_id,)
    if region:
        query += " AND region = ?"
        parameters += (region,)
    rows = connection.execute(query + " ORDER BY id", parameters).fetchall()
    if not rows:
        raise CollectorError(f"未找到运行 ID：{run_id}")
    cache: dict[str, dict[str, str]] = {}
    updates = []
    for row_id, package_name in rows:
        web = get_preferred_web_metadata(package_name, cache)
        updates.append((web["rating"], web["downloads"], web["developer"], web["updated_at"], web["link"], web["link_source"], row_id))
    connection.executemany(
        "UPDATE rankings SET rating = ?, downloads = ?, developer = ?, updated_at = ?, link = ?, link_source = ? WHERE id = ?", updates
    )
    connection.commit()
    return len(updates)


def diagnose(config: dict) -> int:
    adb = resolve_adb(config)
    run_dir = DEFAULT_DATA / "runs" / f"diagnose-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    device = Device(adb, run_dir)
    print(device.command("devices", "-l"))
    state = device.command("get-state", check=False)
    if state.strip() != "device":
        raise CollectorError("ADB 设备未处于 device 状态。请解锁手机、开启 USB 调试并接受授权弹窗。")
    print("model:", device.shell("getprop", "ro.product.model"))
    print("android:", device.shell("getprop", "ro.build.version.release"))
    print("hyperos:", device.shell("getprop", "ro.miui.ui.version.name", check=False))
    package = discover_getapps_package(device, config.get("getapps_package", ""))
    print("getapps_package:", package)
    device.launch("com.android.settings")
    time.sleep(1)
    device.dump_ui("settings-initial")
    device.screenshot("settings-initial")
    print("诊断文件:", run_dir)
    return 0


def run_collection(config: dict, resume_run_id: str = "", max_regions: int = 0) -> int:
    adb = resolve_adb(config)
    run_id = resume_run_id or (next_run_name(DEFAULT_DATA) + "-" + uuid.uuid4().hex[:6])
    run_name = run_id.rsplit("-", 1)[0]
    run_dir = DEFAULT_DATA / "runs" / run_name
    device = Device(adb, run_dir)
    if device.command("get-state", check=False).strip() != "device":
        raise CollectorError("ADB 设备未处于 device 状态。请先运行 diagnose。")
    expected_initial_region = config.get("initial_region_code", "")
    if expected_initial_region and not resume_run_id:
        actual_initial_region = device.shell("getprop", "ro.miui.region", check=False).strip()
        if actual_initial_region.upper() != expected_initial_region.upper():
            raise CollectorError(
                f"当前系统地区为 {actual_initial_region or '未知'}，但本任务要求从 {expected_initial_region} 开始。"
                " 这台 Global ROM 的出厂地区可能无法在切换后重新选回，请先在手机上恢复出厂地区。"
            )
    package = discover_getapps_package(device, config.get("getapps_package", ""))
    connection = init_db(DEFAULT_DATA / "rankings.db")
    labels = config["settings_labels"]
    region_search = config.get("region_search", {})
    region_codes = config.get("region_codes", {})
    all_items: list[dict] = []
    game_tab = config.get("game_tab", "游戏")
    categories = config.get("categories", ["休闲游戏", "益智", "纸牌游戏"])
    web_cache: dict[str, dict[str, str]] = {}
    processed_regions = 0
    completed = {
        (region, category)
        for region, category in connection.execute(
            "SELECT DISTINCT region, category FROM rankings WHERE run_id = ?", (run_id,)
        )
    }
    for region in config["regions"]:
        pending_categories = [category for category in categories if (region, category) not in completed]
        if not pending_categories:
            print(f"[{region}] 已完成，跳过")
            continue
        print(f"[{region}] 切换系统地区")
        switch_region(
            device,
            region,
            labels,
            region_search.get(region, ""),
            region_codes.get(region, ""),
        )
        time.sleep(float(config.get("network_wait_seconds", 5)))
        device.launch_and_wait(package)
        time.sleep(2)
        has_official_tabs = open_game_channel(device, package, game_tab, categories, region)
        for category in categories:
            if (region, category) in completed:
                print(f"[{region}/{category}] 已完成，跳过")
                continue
            if has_official_tabs:
                print(f"[{region}/{category}] 打开游戏分类榜单")
                tap_tab_label(device, category, f"game-category-{safe_name(region)}")
                time.sleep(1)
                seen: set[tuple[str, str]] = set()
                items: list[dict] = []
                for _ in range(int(config.get("max_scrolls_per_category", 30))):
                    page_items = collect_visible_items(device, region, category, seen, run_id)
                    enrich_visible_items(device, page_items, web_cache)
                    items.extend(page_items)
                    if len({item["rank"] for item in items}) >= int(config.get("top_n", 20)):
                        break
                    # Keep adjacent ranking screens overlapping so ranks at the page seam are not skipped.
                    device.swipe_up(start_ratio=0.78, end_ratio=0.44)
                    time.sleep(float(config.get("scroll_pause_seconds", 1.2)))
                items = [item for item in items if item["rank"] <= int(config.get("top_n", 20))]
            else:
                print(f"[{region}/{category}] 打开主页分类专区")
                device.launch_and_wait(package)
                time.sleep(2)
                tap_label(device, [game_tab], f"game-tab-fallback-{safe_name(region)}", scroll=False)
                if not tap_game_section_entry(device, category, region):
                    print(f"[{region}/{category}] 该地区未提供分类专区")
                    continue
                seen = set()
                items = []
                next_rank = 1
                for _ in range(int(config.get("max_scrolls_per_category", 30))):
                    page_items, next_rank = collect_visible_section_items(device, region, category, seen, run_id, next_rank)
                    enrich_visible_items(device, page_items, web_cache)
                    items.extend(page_items)
                    if len(items) >= int(config.get("top_n", 20)) or not page_items:
                        break
                    # The landing-page list has the same dense row layout as category tabs.
                    device.swipe_up(start_ratio=0.78, end_ratio=0.44)
                    time.sleep(float(config.get("scroll_pause_seconds", 1.2)))
                items = items[: int(config.get("top_n", 20))]
            top_n = int(config.get("top_n", 20))
            items = deduplicate_items_by_package(items)
            missing = missing_ranks(items, top_n)
            if missing:
                raise CollectorError(f"{region}/{category} 采集后缺少排名：{missing}")
            write_items(connection, items)
            all_items.extend(items)
            print(f"[{region}/{category}] 采集 {len(items)} 条")
        processed_regions += 1
        if max_regions and processed_regions >= max_regions:
            break
    csv_path = DEFAULT_DATA / f"{run_name}.csv"
    export_csv(connection, csv_path, run_id)
    print(f"完成：{len(all_items)} 条，CSV：{csv_path}，运行目录：{run_dir}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="单台小米手机 GetApps 榜单采集器")
    parser.add_argument("command", choices=["diagnose", "run", "refresh-web"])
    parser.add_argument("--config", type=Path, default=ROOT / "config.json")
    parser.add_argument("--resume-run-id", default="", help="从已写入数据库的运行 ID 继续采集")
    parser.add_argument("--max-regions", type=int, default=0, help="本次最多处理多少个未完成国家，0 表示全部")
    parser.add_argument("--region", default="", help="refresh-web 时只处理并导出指定地区")
    args = parser.parse_args()
    try:
        config = load_config(args.config)
        if args.command == "diagnose":
            return diagnose(config)
        if args.command == "refresh-web":
            if not args.resume_run_id:
                raise CollectorError("refresh-web 需要 --resume-run-id")
            connection = init_db(DEFAULT_DATA / "rankings.db")
            count = refresh_web_metadata(connection, args.resume_run_id, args.region)
            run_name = args.resume_run_id.rsplit("-", 1)[0]
            csv_path = DEFAULT_DATA / f"{run_name}.csv"
            export_csv(connection, csv_path, args.resume_run_id, args.region)
            print(f"刷新网页元数据：{count} 条，CSV：{csv_path}")
            return 0
        return run_collection(config, args.resume_run_id, args.max_regions)
    except (CollectorError, FileNotFoundError, json.JSONDecodeError) as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
