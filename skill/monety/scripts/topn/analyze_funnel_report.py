#!/usr/bin/env python3
"""Normalize and validate a TopOn funnel report without mixing statistic types."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from collections import Counter
from datetime import date, timedelta
from pathlib import Path
from typing import Any

from report_io import (
    canonical_rows,
    detect_mapping,
    detect_report_type,
    is_summary_row,
    load_mapping,
    load_metric_catalog,
    read_report,
    validate_mapping,
)


STATISTIC_TYPES = {
    "次数": "event_count",
    "设备": "device_count",
    "设备数": "device_count",
    "人均次数": "per_device",
}

EVENT_FIELDS = (
    "app_starts", "config_fetches", "traffic_requests", "traffic_fills",
    "ad_scene_arrivals", "is_ready_queries", "display_triggers",
    "display_trigger_successes", "impressions", "impressions_api", "clicks",
)

RATE_FORMULAS: dict[str, tuple[str, str, str | None]] = {
    "traffic_fill_rate": ("traffic_fills", "traffic_requests", None),
    "ad_scene_arrival_rate": ("ad_scene_arrivals", "app_starts", "device_count"),
    "ad_trigger_rate": ("display_triggers", "ad_scene_arrivals", "event_count"),
    "display_trigger_success_rate": ("display_trigger_successes", "display_triggers", None),
    "impression_success_rate": ("impressions", "display_trigger_successes", None),
    "ctr": ("clicks", "impressions", "event_count"),
}


def safe_div(numerator: Any, denominator: Any) -> float | None:
    if numerator is None or denominator in (None, 0):
        return None
    return float(numerator) / float(denominator)


def normalize_statistic_type(value: Any) -> str:
    text = str(value or "").strip()
    return STATISTIC_TYPES.get(text, f"unknown:{text}")


def check_rates(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    checks = []
    for row in rows:
        statistic_type = row.get("statistic_type")
        for field, (numerator, denominator, required_type) in RATE_FORMULAS.items():
            if required_type and statistic_type != required_type:
                continue
            observed = row.get(field)
            expected = safe_div(row.get(numerator), row.get(denominator))
            if observed is None or expected is None:
                continue
            difference = float(observed) - expected
            tolerance = max(0.0005, abs(expected) * 0.005)
            checks.append({
                "date": row.get("date"), "statistic_type": statistic_type,
                "metric": field, "observed": observed, "recomputed": expected,
                "difference": difference,
                "status": "matched" if abs(difference) <= tolerance else "mismatch",
            })
        if statistic_type == "event_count":
            observed = row.get("impression_gap_rate")
            api_value = row.get("impressions_api")
            expected = None if api_value in (None, 0) or row.get("impressions") is None else (
                float(row["impressions"]) - float(api_value)
            ) / float(api_value)
            if observed is not None and expected is not None:
                difference = float(observed) - expected
                checks.append({
                    "date": row.get("date"), "statistic_type": statistic_type,
                    "metric": "impression_gap_rate", "observed": observed,
                    "recomputed": expected, "difference": difference,
                    "status": "matched" if abs(difference) <= max(0.0005, abs(expected) * 0.005) else "mismatch",
                })
    return checks


def check_per_device(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_key = {(row.get("date"), row.get("statistic_type")): row for row in rows}
    checks = []
    for date_value in sorted({row.get("date") for row in rows if row.get("date")}):
        events = by_key.get((date_value, "event_count"), {})
        devices = by_key.get((date_value, "device_count"), {})
        per_device = by_key.get((date_value, "per_device"), {})
        for field in EVENT_FIELDS:
            observed = per_device.get(field)
            expected = safe_div(events.get(field), devices.get(field))
            if observed is None or expected is None:
                continue
            difference = float(observed) - expected
            tolerance = max(0.02, abs(expected) * 0.01)
            checks.append({
                "date": date_value, "metric": field,
                "observed_per_device": observed, "recomputed": expected,
                "difference": difference,
                "status": "matched" if abs(difference) <= tolerance else "mismatch",
            })
    return checks


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows({field: row.get(field) for field in fields} for row in rows)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path)
    parser.add_argument("--sheet")
    parser.add_argument("--mapping", help="JSON string or path: canonical_field -> source column")
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--trust-status", choices=("observed", "fixture"), default="observed")
    parser.add_argument("--currency", help="Project currency code; defaults to USD")
    parser.add_argument("--timezone", help="Report timezone; defaults to UTC+0")
    args = parser.parse_args()

    headers, raw_rows, source_meta = read_report(args.report, args.sheet)
    report_type = detect_report_type(headers, args.report.name)
    if not report_type or report_type["id"] != "funnel_report":
        raise ValueError("Input is not a registered TopOn funnel report")

    mapping, conflicts = detect_mapping(headers)
    mapping.update(load_mapping(args.mapping))
    mapping_errors = validate_mapping(mapping, headers)
    if mapping_errors:
        raise ValueError(json.dumps(mapping_errors, ensure_ascii=False))
    unmapped_headers = [header for header in headers if header not in set(mapping.values())]
    if unmapped_headers:
        raise ValueError(
            "Source columns have no canonical mapping; update aliases and metric-catalog.json: "
            + ", ".join(unmapped_headers)
        )

    summary_rows = [row for row in raw_rows if is_summary_row(row)]
    detail_rows = [row for row in raw_rows if not is_summary_row(row)]
    normalized = canonical_rows(detail_rows, mapping)
    for row in normalized:
        row["statistic_type"] = normalize_statistic_type(row.get("statistic_type"))
    normalized = [row for row in normalized if row.get("date")]

    unknown_types = sorted({row["statistic_type"] for row in normalized if row["statistic_type"].startswith("unknown:")})
    fields = [field for field in mapping if any(row.get(field) is not None for row in normalized)]
    if "date" in fields:
        fields = ["date", "statistic_type"] + [field for field in fields if field not in {"date", "statistic_type"}]

    catalog = load_metric_catalog()
    definitions = {field: catalog["metrics"].get(field) for field in fields}
    unresolved = [field for field, item in definitions.items() if not item]
    if unresolved:
        raise ValueError(f"Canonical fields missing from metric catalog: {', '.join(unresolved)}")

    rate_checks = check_rates(normalized)
    per_device_checks = check_per_device(normalized)
    issues = []
    if conflicts:
        issues.append({"severity": "warning", "code": "mapping_conflict", "details": conflicts})
    if unknown_types:
        issues.append({"severity": "error", "code": "unknown_statistic_type", "details": unknown_types})
    report_timezone = args.timezone or "UTC+0"
    timezone_source = "argument" if args.timezone else "default_project_timezone"
    currency = args.currency or "USD"
    currency_source = "argument" if args.currency else "default_topon_dollar_symbol"
    if not args.timezone:
        issues.append({"severity": "info", "code": "timezone_defaulted_utc0", "message": "按用户确认，TopOn 报表统计时区默认解释为 UTC+0。"})
    dates = sorted({row["date"] for row in normalized if row.get("date")})
    if "impressions_api" in fields and dates and date.fromisoformat(dates[-1]) >= date.today() - timedelta(days=1):
        issues.append({"severity": "warning", "code": "report_api_recent_partition_may_be_incomplete", "message": "展示 API 来自第三方平台 Report API；帮助中心说明 UTC+8/UTC+0 通常延迟 1 天，UTC-8 通常延迟 2 天。近期展示 Gap 暂不作为异常结论。"})
    if not any(item.get("kind") == "dimension" and field not in {"date", "statistic_type"} for field, item in definitions.items()):
        issues.append({"severity": "warning", "code": "no_actionable_breakdown_dimensions", "message": "报表只有日期和统计方式粒度，无法定位地区、广告位、广告场景、广告源或版本贡献。"})
    if args.trust_status == "fixture":
        issues.append({"severity": "info", "code": "fixture_only", "message": "仅用于结构和流程测试，不用于业务结论。"})

    args.output_dir.mkdir(parents=True, exist_ok=True)
    normalized_path = args.output_dir / "normalized_funnel.csv"
    analysis_path = args.output_dir / "funnel-analysis.json"
    write_csv(normalized_path, normalized, fields)

    payload = {
        "contract_version": 1,
        "evidence_type": "normalized_funnel_report",
        "trust_status": args.trust_status,
        "report_type": {"id": report_type["id"], "name": report_type["name"]},
        "source": {
            **source_meta,
            "file_name": args.report.name,
            "file_sha256": hashlib.sha256(args.report.read_bytes()).hexdigest(),
        },
        "currency": currency,
        "currency_source": currency_source,
        "timezone": report_timezone,
        "timezone_source": timezone_source,
        "input_row_count": len(raw_rows),
        "summary_rows_removed": len(summary_rows),
        "normalized_row_count": len(normalized),
        "date_range": {"start": dates[0], "end": dates[-1], "distinct_days": len(dates)} if dates else None,
        "rows_by_statistic_type": dict(Counter(row["statistic_type"] for row in normalized)),
        "mapping": mapping,
        "schema_audit": {
            "source_header_count": len(headers),
            "mapped_header_count": len(mapping),
            "unmapped_headers": unmapped_headers,
            "catalog_definition_count": len(definitions),
            "unresolved_definition_fields": [
                field for field, item in definitions.items()
                if item.get("documentation_status") == "unresolved_export_column"
            ],
            "definition_known_but_not_recomputable_fields": [
                field for field, item in definitions.items()
                if item.get("validation_status") in {
                    "definition_known_export_inputs_missing",
                    "requires_grain_specific_denominator",
                }
            ],
        },
        "normalized_fields": fields,
        "normalized_data_path": str(normalized_path.resolve()),
        "metric_definitions": definitions,
        "rate_reconciliation": {
            "checked_values": len(rate_checks),
            "matched_values": sum(item["status"] == "matched" for item in rate_checks),
            "mismatched_values": sum(item["status"] == "mismatch" for item in rate_checks),
            "details": rate_checks,
        },
        "per_device_reconciliation": {
            "checked_values": len(per_device_checks),
            "matched_values": sum(item["status"] == "matched" for item in per_device_checks),
            "mismatched_values": sum(item["status"] == "mismatch" for item in per_device_checks),
            "details": per_device_checks,
        },
        "documentation_conflicts": [],
        "issues": issues,
        "analysis_boundary": "不同统计方式已分层。该产物只提供可复算漏斗结构与质量检查，不自动形成因果结论或配置建议。",
    }
    analysis_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "ok": not unknown_types,
        "normalized_data": str(normalized_path),
        "analysis": str(analysis_path),
        "rows": len(normalized),
        "summary_rows_removed": len(summary_rows),
        "rows_by_statistic_type": payload["rows_by_statistic_type"],
    }, ensure_ascii=False))
    return 2 if unknown_types else 0


if __name__ == "__main__":
    raise SystemExit(main())
