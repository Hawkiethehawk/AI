#!/usr/bin/env python3
"""Inspect a TopOn CSV/XLSX report before drawing analytical conclusions."""

from __future__ import annotations

import argparse
from pathlib import Path

from report_io import (
    ADDITIVE_METRICS,
    DIMENSIONS,
    RATIO_METRICS,
    SUPPLEMENTAL_COUNT_METRICS,
    SUPPLEMENTAL_NON_ADDITIVE_METRICS,
    SUPPLEMENTAL_RATIO_METRICS,
    canonical_rows,
    detect_mapping,
    detect_report_type,
    is_summary_row,
    load_mapping,
    read_report,
    validate_mapping,
    write_json,
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path)
    parser.add_argument("--sheet")
    parser.add_argument("--mapping", help="JSON string or path: canonical_field -> source column")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    headers, rows, source_meta = read_report(args.report, args.sheet)
    detected, conflicts = detect_mapping(headers)
    detected.update(load_mapping(args.mapping))
    mapping_errors = validate_mapping(detected, headers)
    canonical = canonical_rows(rows, detected)
    report_type = detect_report_type(headers, args.report.name)
    date_values = sorted({row.get("date") for row in canonical if row.get("date")})
    null_rates = {}
    for field in detected:
        missing = sum(1 for row in canonical if row.get(field) in (None, ""))
        null_rates[field] = round(missing / len(canonical), 6) if canonical else None

    issues: list[dict] = []
    for error in mapping_errors:
        issues.append({"severity": "error", "code": error["code"], "message": error})
    if not rows:
        issues.append({"severity": "error", "code": "empty_report", "message": "报表没有数据行。"})
    if "date" not in detected:
        issues.append({"severity": "warning", "code": "missing_date", "message": "未识别日期列，无法自动做前后周期比较。"})
    if not any(field in detected for field in ADDITIVE_METRICS):
        issues.append({"severity": "error", "code": "missing_additive_metrics", "message": "未识别请求、填充、展示、点击或收入等可加指标。"})
    if "revenue" not in detected and "estimated_revenue" not in detected and "revenue_api" not in detected:
        issues.append({"severity": "warning", "code": "missing_revenue", "message": "未识别收益、预估收益或收益 API 列，不能分析收入变化。"})
    if "impressions" not in detected:
        issues.append({"severity": "warning", "code": "missing_impressions", "message": "未识别展示列，不能重算 eCPM。"})
    if any(field in detected for field in RATIO_METRICS + SUPPLEMENTAL_RATIO_METRICS) and not any(
        {numerator, denominator}.issubset(detected)
        for numerator, denominator in (("revenue", "impressions"), ("estimated_revenue", "impressions"), ("clicks", "impressions"))
    ):
        issues.append({"severity": "warning", "code": "ratio_without_denominator", "message": "报表含比率或 eCPM，但缺少部分原始分子/分母，汇总结果可能不能加权重算。"})
    for conflict in conflicts:
        issues.append({"severity": "warning", "code": "mapping_conflict", "message": conflict})
    for field, rate in null_rates.items():
        if rate == 1.0:
            issues.append({"severity": "error", "code": "unparseable_column", "message": f"字段 {field} 的值全部为空或无法解析。"})
        elif rate is not None and rate > 0:
            issues.append({"severity": "warning", "code": "partial_nulls", "message": f"字段 {field} 有 {rate:.2%} 的值为空或无法解析。"})

    for field in ("currency", "timezone", "data_source"):
        values = sorted({str(row.get(field)) for row in canonical if row.get(field) not in (None, "")})
        if len(values) > 1:
            severity = "error"
            issues.append({"severity": severity, "code": f"mixed_{field}", "message": {"field": field, "values": values}})

    row_signatures = [tuple(row.get(field) for field in sorted(detected)) for row in canonical]
    duplicate_count = len(row_signatures) - len(set(row_signatures))
    if duplicate_count:
        issues.append({"severity": "warning", "code": "duplicate_rows", "message": f"发现 {duplicate_count} 行完全重复记录。"})
    negative_counts = {
        metric: sum(1 for row in canonical if row.get(metric) is not None and row[metric] < 0)
        for metric in ADDITIVE_METRICS
    }
    negative_counts = {metric: count for metric, count in negative_counts.items() if count}
    if negative_counts:
        issues.append({"severity": "warning", "code": "negative_metrics", "message": negative_counts})
    inverted_funnel = sum(
        1 for row in canonical
        if row.get("impressions") is not None and row.get("responses") is not None
        and row["impressions"] > row["responses"]
    )
    if inverted_funnel:
        issues.append({"severity": "warning", "code": "impressions_gt_responses", "message": f"有 {inverted_funnel} 行展示数大于返回数，请核对粒度和口径。"})
    summary_rows = sum(1 for row in rows if is_summary_row(row))
    if summary_rows:
        issues.append({"severity": "error", "code": "summary_rows", "message": f"发现 {summary_rows} 行合计或小计，直接汇总会重复计算。"})
    if date_values:
        from datetime import date as date_type, timedelta
        parsed_dates = [date_type.fromisoformat(item) for item in date_values]
        expected = {(parsed_dates[0] + timedelta(days=offset)).isoformat() for offset in range((parsed_dates[-1] - parsed_dates[0]).days + 1)}
        missing_dates = sorted(expected - set(date_values))
        if missing_dates:
            issues.append({"severity": "warning", "code": "date_gaps", "message": missing_dates})
    if "network" in detected and any(metric in detected for metric in ("requests", "responses")):
        issues.append({"severity": "warning", "code": "network_funnel_non_additive", "message": "广告源级请求/返回可能是瀑布尝试，通常不能跨广告源相加为广告位漏斗。"})

    payload = {
        "evidence_type": "observed_input_inspection",
        "report": str(args.report.resolve()),
        "source": source_meta,
        "report_type": None if report_type is None else {
            "id": report_type["id"],
            "name": report_type["name"],
            "grain": report_type["grain"],
            "analysis_rule": report_type["analysis_rule"],
        },
        "row_count": len(rows),
        "columns": headers,
        "mapping": detected,
        "unmapped_columns": [header for header in headers if header not in detected.values()],
        "available_dimensions": [field for field in DIMENSIONS if field in detected],
        "available_metrics": [
            field for field in (
                ADDITIVE_METRICS + RATIO_METRICS + SUPPLEMENTAL_COUNT_METRICS
                + SUPPLEMENTAL_RATIO_METRICS + SUPPLEMENTAL_NON_ADDITIVE_METRICS
                + ("dau", "ad_users")
            ) if field in detected
        ],
        "date_range": {"start": date_values[0], "end": date_values[-1], "distinct_days": len(date_values)} if date_values else None,
        "null_rates": null_rates,
        "issues": issues,
    }
    write_json(payload, args.output)
    return 2 if any(issue["severity"] == "error" for issue in issues) else 0


if __name__ == "__main__":
    raise SystemExit(main())
