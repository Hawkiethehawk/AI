#!/usr/bin/env python3
"""Normalize a TopOn mediation-management (Waterfall) export."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
from typing import Any

from report_io import (
    canonical_rows,
    detect_mapping,
    detect_report_type,
    is_summary_row,
    load_mapping,
    load_metric_catalog,
    parse_date_range_from_filename,
    read_report,
    validate_mapping,
)


FORMULAS: dict[str, tuple[str, str, float, bool]] = {
    "estimated_ecpm": ("estimated_revenue", "impressions", 1000.0, False),
    "ecpm_api": ("revenue_api", "impressions_api", 1000.0, False),
    "ctr": ("clicks", "impressions", 1.0, False),
    "impression_gap_rate": ("impressions", "impressions_api", 1.0, True),
}

SHARES: dict[str, tuple[str, str]] = {
    "estimated_revenue_share": ("estimated_revenue", "estimated_revenue"),
    "impression_share": ("impressions", "impressions"),
    "click_share": ("clicks", "clicks"),
    "revenue_api_share": ("revenue_api", "revenue_api"),
    "impressions_api_share": ("impressions_api", "impressions_api"),
}


def safe_div(numerator: Any, denominator: Any, multiplier: float = 1.0) -> float | None:
    if numerator is None or denominator in (None, 0):
        return None
    return float(numerator) / float(denominator) * multiplier


def reconcile(rows: list[dict[str, Any]], totals: dict[str, Any]) -> dict[str, Any]:
    checks: list[dict[str, Any]] = []
    for row in rows:
        identity = row.get("ad_source_id") or row.get("ad_source")
        for field, (numerator, denominator, multiplier, relative_gap) in FORMULAS.items():
            observed = row.get(field)
            expected = safe_div(row.get(numerator), row.get(denominator), multiplier)
            if relative_gap and expected is not None:
                expected -= 1.0
            if observed is None or expected is None:
                continue
            difference = float(observed) - expected
            tolerance = max(0.0005, abs(expected) * 0.005)
            checks.append({
                "ad_source": identity,
                "metric": field,
                "observed": observed,
                "recomputed": expected,
                "difference": difference,
                "status": "matched" if abs(difference) <= tolerance else "mismatch",
            })
        for field, (numerator, total_field) in SHARES.items():
            observed = row.get(field)
            expected = safe_div(row.get(numerator), totals.get(total_field))
            if observed is None or expected is None:
                continue
            difference = float(observed) - expected
            tolerance = max(0.0001, abs(expected) * 0.005)
            checks.append({
                "ad_source": identity,
                "metric": field,
                "observed": observed,
                "recomputed": expected,
                "difference": difference,
                "status": "matched" if abs(difference) <= tolerance else "mismatch",
            })
    return {
        "checked_values": len(checks),
        "matched_values": sum(item["status"] == "matched" for item in checks),
        "mismatched_values": sum(item["status"] == "mismatch" for item in checks),
        "details": checks,
    }


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
    parser.add_argument("--currency", help="Currency code; defaults to USD")
    parser.add_argument("--timezone", help="Report timezone; defaults to UTC+0")
    args = parser.parse_args()

    headers, raw_rows, source_meta = read_report(args.report, args.sheet)
    report_type = detect_report_type(headers, args.report.name)
    if not report_type or report_type["id"] != "mediation_management_report":
        raise ValueError("Input is not a registered TopOn mediation-management report")

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
    normalized_summary = canonical_rows(summary_rows, mapping)
    normalized = canonical_rows(detail_rows, mapping)
    fields = [field for field in mapping if any(row.get(field) is not None for row in normalized)]

    catalog = load_metric_catalog()
    definitions = {field: catalog["metrics"].get(field) for field in fields}
    missing_definitions = [field for field, item in definitions.items() if not item]
    if missing_definitions:
        raise ValueError(f"Canonical fields missing from metric catalog: {', '.join(missing_definitions)}")

    total_fields = ("estimated_revenue", "impressions", "clicks", "revenue_api", "impressions_api", "requests")
    totals: dict[str, Any] = {}
    total_sources: dict[str, str] = {}
    for field in total_fields:
        summary_value = next((row.get(field) for row in normalized_summary if row.get(field) is not None), None)
        if summary_value is not None:
            totals[field] = summary_value
            total_sources[field] = "export_total_row"
        else:
            values = [row[field] for row in normalized if isinstance(row.get(field), (int, float))]
            totals[field] = sum(values) if values else None
            total_sources[field] = "sum_detail_rows"

    duplicate_ids = sorted({
        str(row.get("third_party_ad_unit_id"))
        for row in normalized
        if row.get("third_party_ad_unit_id")
        and sum(other.get("third_party_ad_unit_id") == row.get("third_party_ad_unit_id") for other in normalized) > 1
    })
    formula_reconciliation = reconcile(normalized, totals)
    issues: list[dict[str, Any]] = []
    if conflicts:
        issues.append({"severity": "warning", "code": "mapping_conflict", "details": conflicts})
    if duplicate_ids:
        issues.append({
            "severity": "warning",
            "code": "third_party_ad_unit_id_reused",
            "count": len(duplicate_ids),
            "message": "同一第三方广告位 ID 出现在多个明细行；API 收益、展示等指标可能重复，禁止按行直接求和。",
        })
    if formula_reconciliation["mismatched_values"]:
        issues.append({
            "severity": "warning",
            "code": "formula_rounding_or_source_mismatch",
            "mismatched_values": formula_reconciliation["mismatched_values"],
            "metrics": sorted({item["metric"] for item in formula_reconciliation["details"] if item["status"] == "mismatch"}),
        })
    report_period = parse_date_range_from_filename(args.report.name)
    issues.extend([
        {"severity": "warning", "code": "mixed_request_grain", "message": "汇总行请求是流量请求，明细行请求是广告源请求；已隔离汇总行。"},
        {"severity": "warning", "code": "missing_report_date_column", "message": (
            f"导出文件没有日期列；仅从文件名取得 {report_period['start']} 至 {report_period['end']}，无法做逐日趋势。"
            if report_period else "导出文件没有日期列，文件名也未提供可解析的日期范围，无法做逐日趋势。"
        )},
    ])

    args.output_dir.mkdir(parents=True, exist_ok=True)
    normalized_path = args.output_dir / "normalized_mediation_management.csv"
    metadata_path = args.output_dir / "mediation-management-metadata.json"
    write_csv(normalized_path, normalized, fields)
    payload = {
        "contract_version": 1,
        "evidence_type": "normalized_uploaded_report",
        "trust_status": args.trust_status,
        "report_type": {"id": report_type["id"], "name": report_type["name"]},
        "source": {
            **source_meta,
            "file_name": args.report.name,
            "file_sha256": hashlib.sha256(args.report.read_bytes()).hexdigest(),
        },
        "currency": args.currency or "USD",
        "currency_source": "argument" if args.currency else "default_project_currency",
        "timezone": args.timezone or "UTC+0",
        "timezone_source": "argument" if args.timezone else "default_project_timezone",
        "report_period_from_filename": report_period,
        "input_row_count": len(raw_rows),
        "summary_rows_removed": len(summary_rows),
        "normalized_row_count": len(normalized),
        "report_totals": totals,
        "report_total_sources": total_sources,
        "mapping": mapping,
        "schema_audit": {
            "source_header_count": len(headers),
            "mapped_header_count": len(mapping),
            "unmapped_headers": unmapped_headers,
            "unresolved_definition_fields": [
                field for field, item in definitions.items()
                if item.get("documentation_status") == "unresolved_export_column"
            ],
            "definition_known_but_not_recomputable_fields": [
                field for field, item in definitions.items()
                if item.get("validation_status") in {
                    "definition_known_export_inputs_missing",
                    "requires_grain_specific_denominator",
                    "requires_source_type_context",
                }
            ],
        },
        "normalized_fields": fields,
        "normalized_data_path": str(normalized_path.resolve()),
        "metric_definitions": definitions,
        "formula_reconciliation": formula_reconciliation,
        "issues": issues,
        "analysis_boundary": "本文件只完成聚合管理报表的结构标准化、汇总隔离与公式复核。",
    }
    metadata_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "ok": True,
        "normalized_data": str(normalized_path),
        "metadata": str(metadata_path),
        "rows": len(normalized),
        "summary_rows_removed": len(summary_rows),
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
