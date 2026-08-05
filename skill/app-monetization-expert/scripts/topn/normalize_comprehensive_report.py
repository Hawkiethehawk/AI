#!/usr/bin/env python3
"""Normalize a TopOn comprehensive report without drawing business conclusions."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from datetime import date
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


CHECK_FORMULAS: dict[str, tuple[str, str, float]] = {
    "penetration_rate": ("deu", "dau", 1.0),
    "estimated_arpdau": ("estimated_revenue", "dau", 1.0),
    "impressions_per_dau": ("impressions", "dau", 1.0),
    "estimated_ecpm": ("estimated_revenue", "impressions", 1000.0),
    "revenue_gap_rate": ("estimated_revenue", "revenue_api", 1.0),
    "bidding_win_rate": ("bidding_wins", "bidding_requests", 1.0),
}

SHARE_FORMULAS: dict[str, tuple[str, str]] = {
    "estimated_revenue_share": ("estimated_revenue", "estimated_revenue"),
    "impression_share": ("impressions", "impressions"),
}


def safe_div(numerator: Any, denominator: Any, multiplier: float = 1.0) -> float | None:
    if numerator is None or denominator in (None, 0):
        return None
    return float(numerator) / float(denominator) * multiplier


def expected_value(field: str, row: dict[str, Any]) -> float | None:
    numerator, denominator, multiplier = CHECK_FORMULAS[field]
    if field == "revenue_gap_rate":
        if row.get(numerator) is None or row.get(denominator) in (None, 0):
            return None
        return (float(row[numerator]) - float(row[denominator])) / float(row[denominator])
    if field == "bidding_win_rate":
        bid_responses = None
        if row.get(denominator) is not None and row.get("bidding_response_rate") is not None:
            bid_responses = float(row[denominator]) * float(row["bidding_response_rate"])
        return safe_div(row.get(numerator), bid_responses, multiplier)
    return safe_div(row.get(numerator), row.get(denominator), multiplier)


def reconcile(rows: list[dict[str, Any]], report_totals: dict[str, Any]) -> dict[str, Any]:
    checks = []
    for row in rows:
        for field in CHECK_FORMULAS:
            observed = row.get(field)
            expected = expected_value(field, row)
            if observed is None or expected is None:
                continue
            difference = float(observed) - expected
            tolerance = max(0.0005, abs(expected) * 0.005)
            checks.append({
                "date": row.get("date"),
                "metric": field,
                "observed": observed,
                "recomputed": expected,
                "difference": difference,
                "status": "matched" if abs(difference) <= tolerance else "mismatch",
            })
        for field, (numerator_field, total_field) in SHARE_FORMULAS.items():
            observed = row.get(field)
            expected = safe_div(row.get(numerator_field), report_totals.get(total_field))
            if observed is None or expected is None:
                continue
            difference = float(observed) - expected
            tolerance = max(0.0001, abs(expected) * 0.005)
            checks.append({
                "date": row.get("date"),
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
    parser.add_argument("--currency", help="Currency code; defaults to USD for TopOn '$' exports")
    parser.add_argument("--timezone", help="Report timezone; defaults to UTC+0")
    args = parser.parse_args()

    headers, raw_rows, source_meta = read_report(args.report, args.sheet)
    report_type = detect_report_type(headers, args.report.name)
    if not report_type or report_type["id"] != "comprehensive_report":
        raise ValueError("Input is not a registered TopOn comprehensive report")

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
    normalized_summary_rows = canonical_rows(summary_rows, mapping)
    normalized = canonical_rows(detail_rows, mapping)
    normalized = [row for row in normalized if row.get("date")]
    fields = [field for field in mapping if any(row.get(field) is not None for row in normalized)]
    if "date" in fields:
        fields = ["date"] + [field for field in fields if field != "date"]

    catalog = load_metric_catalog()
    definitions = {field: catalog["metrics"].get(field) for field in fields}
    unresolved = [field for field, item in definitions.items() if not item]
    if unresolved:
        raise ValueError(f"Canonical fields missing from metric catalog: {', '.join(unresolved)}")

    report_totals: dict[str, Any] = {}
    report_total_sources: dict[str, str] = {}
    for total_field in ("estimated_revenue", "impressions"):
        summary_value = next(
            (row.get(total_field) for row in normalized_summary_rows if row.get(total_field) is not None),
            None,
        )
        if summary_value is not None:
            report_totals[total_field] = summary_value
            report_total_sources[total_field] = "export_summary_row"
        else:
            values = [row[total_field] for row in normalized if row.get(total_field) is not None]
            report_totals[total_field] = sum(values) if values else None
            report_total_sources[total_field] = "sum_normalized_detail_rows"

    args.output_dir.mkdir(parents=True, exist_ok=True)
    normalized_path = args.output_dir / "normalized_comprehensive.csv"
    metadata_path = args.output_dir / "comprehensive-metadata.json"
    write_csv(normalized_path, normalized, fields)

    dates = sorted(row["date"] for row in normalized if row.get("date"))
    formula_reconciliation = reconcile(normalized, report_totals)
    currency = args.currency or "USD"
    currency_source = "argument" if args.currency else "default_topon_dollar_symbol"
    report_timezone = args.timezone or "UTC+0"
    timezone_source = "argument" if args.timezone else "default_project_timezone"
    issues = []
    if conflicts:
        issues.append({"severity": "warning", "code": "mapping_conflict", "details": conflicts})
    if not args.currency:
        issues.append({"severity": "info", "code": "currency_defaulted_usd", "message": "TopOn 报表使用 '$'，按用户确认默认解释为 USD。"})
    if not args.timezone:
        issues.append({"severity": "info", "code": "timezone_defaulted_utc0", "message": "按用户确认，TopOn 报表统计时区默认解释为 UTC+0。"})
    if dates and date.fromisoformat(dates[-1]) >= date.today():
        issues.append({"severity": "warning", "code": "latest_date_may_be_incomplete", "message": f"最新日期 {dates[-1]} 尚未形成完整自然日，不用于完整日对比。"})
    if any(field in fields for field in ("revenue_api", "impressions_api")):
        issues.append({"severity": "warning", "code": "report_api_freshness_not_verified", "message": "API 指标来自第三方平台 Report API，近期日期可能存在至少 1 至 2 天更新延迟；使用前需按广告平台时区确认数据完成度。"})
    if not any(item.get("kind") == "dimension" and field != "date" for field, item in definitions.items()):
        issues.append({"severity": "warning", "code": "no_actionable_breakdown_dimensions", "message": "报表只有日期粒度，无法定位地区、广告位、广告源、流量分组或版本贡献。"})
    if formula_reconciliation["mismatched_values"]:
        issues.append({"severity": "warning", "code": "derived_metric_rounding_or_hidden_precision", "message": {"mismatched_values": formula_reconciliation["mismatched_values"], "metrics": sorted({item["metric"] for item in formula_reconciliation["details"] if item["status"] == "mismatch"}), "interpretation": "导出收入和比率已显示取整，可能与 TopOn 内部高精度值复算不同；保留差异，不视为已确认口径错误。"}})
    if args.trust_status == "fixture":
        issues.append({"severity": "info", "code": "fixture_only", "message": "仅用于结构和流程测试，不用于业务结论。"})

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
        "currency": currency,
        "currency_source": currency_source,
        "timezone": report_timezone,
        "timezone_source": timezone_source,
        "input_row_count": len(raw_rows),
        "summary_rows_removed": len(summary_rows),
        "report_totals": report_totals,
        "report_total_sources": report_total_sources,
        "normalized_row_count": len(normalized),
        "date_range": {"start": dates[0], "end": dates[-1], "distinct_days": len(set(dates))} if dates else None,
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
        "formula_reconciliation": formula_reconciliation,
        "issues": issues,
        "analysis_boundary": "本文件完成口径标准化和公式复核，不包含业务归因或配置建议。",
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
