"""Restore high-confidence 四 characters from a source that substitutes them with 西."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path


NUMERALS = set("零一二三五六七八九十百千万亿两")
COUNTERS = set("个名人位只天年月日次号层重级大小处周面肢分声步道颗星地件条根头种座场份页组类界境散块蹄尊溅者倍的")
PUNCTUATION = set("，。！？；：、）】”\"')")


def has_directional_prefix(before: str) -> bool:
    return bool(re.search(r"(?:向|朝|朝着|往|从|到|在|位于|来自|走向|走到)$", before))


def should_preserve_west(text: str, index: int) -> bool:
    before = text[max(0, index - 12) : index]
    after = text[index + 1 : index + 13]

    # Fixed, genuine directional words and established lexical items.
    if before.endswith("东") or before.endswith("河"):
        return True  # 东西、河西
    if after.startswith("装"):
        return True
    if after.startswith("式") and not before.endswith("龙雀"):
        return True
    if after.startswith("天") and (before.endswith("上") or after.startswith("天取经")):
        return True
    if after.startswith("下") and before.endswith("日落"):
        return True
    if after.startswith(("北", "南", "域", "部", "线", "门", "街", "城", "山", "湖", "洋", "欧", "岸", "风", "蛮")):
        return True
    if after.startswith(("方", "面")) and has_directional_prefix(before):
        return True
    # Place references such as “交易区西方” are directional; “四方”“四面” are
    # otherwise handled as number/structure contexts below.
    if after.startswith("方") and re.search(r"(?:区|城|市|镇|山|谷|岛|海|原|洲)$", before):
        return True
    return False


def restoration_reason(text: str, index: int) -> str | None:
    before = text[max(0, index - 12) : index]
    after = text[index + 1 : index + 13]
    prev = text[index - 1] if index else ""
    nxt = text[index + 1] if index + 1 < len(text) else ""

    if prev == "第":
        return "ordinal"
    if should_preserve_west(text, index):
        return None
    if prev in NUMERALS or nxt in NUMERALS:
        return "numeric_adjacency"
    if nxt in COUNTERS:
        return "counter_or_structure"
    if after.startswith(("下", "合一", "分之")):
        return "fixed_structure"
    if before.endswith("龙雀") and nxt == "式":
        return "named_form"
    if nxt in PUNCTUATION and prev in set("是有这那上中下各其"):
        return "predicate_number"
    return None


def restore(text: str) -> tuple[str, Counter[str]]:
    output: list[str] = []
    reasons: Counter[str] = Counter()
    for index, char in enumerate(text):
        if char != "西":
            output.append(char)
            continue
        reason = restoration_reason(text, index)
        if reason:
            output.append("四")
            reasons[reason] += 1
        else:
            output.append(char)
    return "".join(output), reasons


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    original = args.input.read_text(encoding="utf-8")
    restored, reasons = restore(original)
    report = {
        "input": str(args.input),
        "changed": sum(reasons.values()),
        "remaining_west": restored.count("西"),
        "four_after_restore": restored.count("四"),
        "reasons": dict(reasons),
        "dry_run": args.dry_run,
    }
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    if not args.dry_run:
        args.input.write_text(restored, encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
