#!/usr/bin/env python3
"""Audit a normalized TopOn dataset and emit decision-oriented quality findings."""

from __future__ import annotations

import argparse
import csv
import json
import math
from collections import Counter
from datetime import date, timedelta
from pathlib import Path
from typing import Any


RATE_OVER_ONE_ALLOWED = {"ad_trigger_rate", "impressions_per_dau"}
SIGNED_RATE_FIELDS = {"revenue_gap_rate", "impression_gap_rate"}
NONNEGATIVE_KINDS = {"number", "currency", "currency_per_device", "currency_per_thousand_impressions"}


def read_rows(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def number(value: Any) -> float | None:
    if value in (None, ""):
        return None
    try:
        result = float(str(value).replace(",", ""))
    except ValueError:
        return None
    return result if math.isfinite(result) else None


def finding(severity: str, code: str, message: str, evidence: Any = None) -> dict[str, Any]:
    item = {"severity": severity, "code": code, "message": message}
    if evidence is not None:
        item["evidence"] = evidence
    return item


def audit(metadata_path: Path) -> dict[str, Any]:
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    data_path = Path(metadata["normalized_data_path"])
    rows = read_rows(data_path)
    definitions = metadata.get("metric_definitions", {})
    fields = metadata.get("normalized_fields") or (list(rows[0]) if rows else [])
    findings: list[dict[str, Any]] = []

    if not rows:
        findings.append(finding("critical", "empty_normalized_dataset", "标准化数据集没有数据行。"))

    signatures = [tuple((key, row.get(key, "")) for key in fields) for row in rows]
    duplicate_rows = len(signatures) - len(set(signatures))
    if duplicate_rows:
        findings.append(finding("high", "exact_duplicate_rows", "存在完全重复记录，汇总前必须去重或确认其业务含义。", {"rows": duplicate_rows, "rate": duplicate_rows / max(len(rows), 1)}))

    dimensions = [field for field in fields if (definitions.get(field) or {}).get("kind") == "dimension"]
    grain_fields = list(dict.fromkeys(field for field in ("date", *dimensions) if field in fields))
    if grain_fields:
        keys = [tuple(row.get(field, "") for field in grain_fields) for row in rows]
        duplicate_keys = len(keys) - len(set(keys))
        if duplicate_keys:
            findings.append(finding("high", "duplicate_candidate_grain", "候选粒度键不唯一，可能存在重复导出、混合粒度或缺失维度。", {"grain": grain_fields, "rows": duplicate_keys}))

    null_rates: dict[str, float] = {}
    for field in fields:
        missing = sum(row.get(field) in (None, "") for row in rows)
        null_rates[field] = missing / max(len(rows), 1)
        if null_rates[field] == 1:
            findings.append(finding("high", "fully_null_field", f"字段 {field} 全为空。"))
        elif null_rates[field] >= 0.2:
            findings.append(finding("medium", "high_null_rate", f"字段 {field} 的空值率较高。", {"field": field, "rate": null_rates[field]}))

    invalid_numeric: dict[str, int] = {}
    negative_values: dict[str, int] = {}
    non_integer_counts: dict[str, int] = {}
    invalid_rates: dict[str, int] = {}
    for field, definition in definitions.items():
        if field not in fields or definition.get("kind") != "metric":
            continue
        values = [row.get(field) for row in rows if row.get(field) not in (None, "")]
        parsed = [number(value) for value in values]
        invalid_numeric[field] = sum(value is None for value in parsed)
        dtype = definition.get("data_type")
        valid = [value for value in parsed if value is not None]
        if dtype in NONNEGATIVE_KINDS or definition.get("unit") in {"requests", "impressions", "clicks", "wins"}:
            negative_values[field] = sum(value < 0 for value in valid)
        aggregation = str(definition.get("aggregation", ""))
        if dtype == "number" and ("sum" in aggregation or "count" in aggregation or "depends_on_statistic_type" in aggregation):
            non_integer_counts[field] = sum(abs(value - round(value)) > 1e-9 for value in valid)
        if dtype == "rate":
            invalid_rates[field] = sum(
                (value < 0 and field not in SIGNED_RATE_FIELDS)
                or (value > 1 and field not in RATE_OVER_ONE_ALLOWED and field not in SIGNED_RATE_FIELDS)
                for value in valid
            )

    for field, count in invalid_numeric.items():
        if count:
            findings.append(finding("high", "numeric_parse_failures", f"字段 {field} 含无法解析的数值。", {"field": field, "rows": count}))
    for field, count in negative_values.items():
        if count:
            findings.append(finding("high", "negative_nonnegative_metric", f"字段 {field} 含负值。", {"field": field, "rows": count}))
    for field, count in non_integer_counts.items():
        if count:
            findings.append(finding("medium", "non_integer_count_metric", f"计数类字段 {field} 含非整数值。", {"field": field, "rows": count}))
    for field, count in invalid_rates.items():
        if count:
            findings.append(finding("high", "rate_out_of_range", f"比率字段 {field} 超出允许范围。", {"field": field, "rows": count}))

    dates = sorted({row.get("date") for row in rows if row.get("date")})
    missing_dates: list[str] = []
    if dates:
        parsed_dates = [date.fromisoformat(value) for value in dates]
        expected = {parsed_dates[0] + timedelta(days=i) for i in range((parsed_dates[-1] - parsed_dates[0]).days + 1)}
        missing_dates = sorted(value.isoformat() for value in expected - set(parsed_dates))
        if missing_dates:
            findings.append(finding("medium", "date_gaps", "日期序列存在缺口；窗口比较必须说明缺失日期。", {"dates": missing_dates}))

    reconciliation = metadata.get("formula_reconciliation") or metadata.get("rate_reconciliation") or {}
    checked = int(reconciliation.get("checked_values") or 0)
    mismatched = int(reconciliation.get("mismatched_values") or 0)
    if mismatched:
        findings.append(finding("medium", "formula_reconciliation_mismatch", "导出值与目录公式存在复算差异，可能来自显示精度、隐藏分母或口径变化。", {"checked": checked, "mismatched": mismatched}))
    if not checked:
        findings.append(finding("low", "no_recomputable_formula_checks", "当前字段没有形成可执行的公式复核；比率结论需保守解释。"))

    for issue in metadata.get("issues", []):
        severity = issue.get("severity", "warning")
        mapped = {"error": "high", "warning": "medium", "info": "low"}.get(severity, severity)
        if issue.get("code") not in {item["code"] for item in findings}:
            findings.append(finding(mapped, f"adapter_{issue.get('code', 'issue')}", str(issue.get("message") or issue.get("details") or issue)))

    counts = Counter(item["severity"] for item in findings)
    if counts["critical"] or counts["high"]:
        status, grade_cap = "blocked", "D"
    elif counts["medium"]:
        status, grade_cap = "limited", "C"
    else:
        status, grade_cap = "usable", "A"
    if metadata.get("trust_status") == "fixture":
        status, grade_cap = "fixture_only", "D"

    return {
        "contract_version": 1,
        "source_metadata": str(metadata_path.resolve()),
        "normalized_data": str(data_path.resolve()),
        "report_type": metadata.get("report_type"),
        "trust_status": metadata.get("trust_status"),
        "dataset_profile": {
            "rows": len(rows), "columns": len(fields), "fields": fields,
            "candidate_grain": grain_fields, "date_range": metadata.get("date_range"),
            "null_rates": null_rates,
        },
        "quality_status": status,
        "evidence_grade_cap": grade_cap,
        "severity_counts": dict(counts),
        "findings": findings,
        "recommended_use": (
            "仅用于字段、公式和流程测试，不形成业务结论。" if status == "fixture_only"
            else "修复高严重度问题后再进行趋势、归因或策略分析。" if status == "blocked"
            else "可以开展探索性分析，但关键结论不得超过 C 级。" if status == "limited"
            else "可进入自适应证据评估；最终等级仍由样本分母、波动和窗口决定。"
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("metadata", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    payload = audit(args.metadata)
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    else:
        print(text, end="")
    return 2 if payload["quality_status"] == "blocked" else 0


if __name__ == "__main__":
    raise SystemExit(main())
