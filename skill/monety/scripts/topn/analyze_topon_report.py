#!/usr/bin/env python3
"""Compute evidence-backed TopOn aggregates and period comparisons."""

from __future__ import annotations

import argparse
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path
from typing import Any

from report_io import (
    ADDITIVE_METRICS,
    DIMENSIONS,
    canonical_rows,
    detect_mapping,
    detect_report_type,
    is_summary_row,
    load_mapping,
    read_report,
    validate_mapping,
    write_json,
)


def safe_div(numerator: float | None, denominator: float | None, multiplier: float = 1.0) -> float | None:
    if numerator is None or denominator in (None, 0):
        return None
    return numerator / denominator * multiplier


def aggregate(rows: list[dict[str, Any]], funnel_metrics: bool = True) -> dict[str, float | None]:
    totals = {metric: 0.0 for metric in ADDITIVE_METRICS}
    presence = {metric: False for metric in ADDITIVE_METRICS}
    for row in rows:
        for metric in ADDITIVE_METRICS:
            value = row.get(metric)
            if value is not None:
                totals[metric] += value
                presence[metric] = True
    output: dict[str, float | None] = {metric: totals[metric] if presence[metric] else None for metric in ADDITIVE_METRICS}
    output.update({
        "fill_rate": safe_div(output["responses"], output["requests"]) if funnel_metrics else None,
        "show_rate": safe_div(output["impressions"], output["responses"]) if funnel_metrics else None,
        "ctr": safe_div(output["clicks"], output["impressions"]),
        "ecpm": safe_div(output["revenue"], output["impressions"], 1000),
    })
    return output


def delta(current: float | None, previous: float | None) -> dict[str, float | None]:
    absolute = None if current is None or previous is None else current - previous
    relative = safe_div(absolute, abs(previous)) if previous not in (None, 0) else None
    return {"current": current, "previous": previous, "absolute": absolute, "relative": relative}


def compare(current_rows: list[dict[str, Any]], previous_rows: list[dict[str, Any]], funnel_metrics: bool = True) -> dict[str, dict]:
    current = aggregate(current_rows, funnel_metrics)
    previous = aggregate(previous_rows, funnel_metrics)
    return {metric: delta(current.get(metric), previous.get(metric)) for metric in current}


def dimension_changes(
    current_rows: list[dict[str, Any]], previous_rows: list[dict[str, Any]],
    dimension: str, limit: int, funnel_metrics: bool = True,
) -> dict:
    current_groups: dict[str, list] = defaultdict(list)
    previous_groups: dict[str, list] = defaultdict(list)
    for row in current_rows:
        current_groups[str(row.get(dimension) or "(空)")].append(row)
    for row in previous_rows:
        previous_groups[str(row.get(dimension) or "(空)")].append(row)
    changes = []
    for key in set(current_groups) | set(previous_groups):
        current = aggregate(current_groups.get(key, []), funnel_metrics)
        previous = aggregate(previous_groups.get(key, []), funnel_metrics)
        revenue_delta = None
        if current["revenue"] is not None or previous["revenue"] is not None:
            revenue_delta = (current["revenue"] or 0) - (previous["revenue"] or 0)
        current_impressions = current["impressions"] or 0
        previous_impressions = previous["impressions"] or 0
        current_ecpm = current["ecpm"]
        previous_ecpm = previous["ecpm"]
        if current_ecpm is not None and previous_ecpm is not None:
            volume_effect = (current_impressions - previous_impressions) * (current_ecpm + previous_ecpm) / 2 / 1000
            rate_effect = (current_ecpm - previous_ecpm) * (current_impressions + previous_impressions) / 2 / 1000
        elif previous_impressions == 0 and current["revenue"] is not None:
            volume_effect, rate_effect = current["revenue"], 0.0
        elif current_impressions == 0 and previous["revenue"] is not None:
            volume_effect, rate_effect = -previous["revenue"], 0.0
        else:
            volume_effect, rate_effect = None, None
        changes.append({
            "value": key,
            "revenue_delta": revenue_delta,
            "revenue": delta(current["revenue"], previous["revenue"]),
            "impressions": delta(current["impressions"], previous["impressions"]),
            "ecpm": delta(current["ecpm"], previous["ecpm"]),
            "fill_rate": delta(current["fill_rate"], previous["fill_rate"]),
            "show_rate": delta(current["show_rate"], previous["show_rate"]),
            "descriptive_decomposition": {
                "volume_mix_effect": volume_effect,
                "within_group_ecpm_effect": rate_effect,
                "boundary": "描述性恒等拆分，不证明因果。",
            },
        })
    negative = [item for item in changes if item["revenue_delta"] is not None and item["revenue_delta"] < 0]
    positive = [item for item in changes if item["revenue_delta"] is not None and item["revenue_delta"] > 0]
    negative.sort(key=lambda item: item["revenue_delta"])
    positive.sort(key=lambda item: item["revenue_delta"], reverse=True)
    total_group_delta = sum(item["revenue_delta"] or 0 for item in changes)
    total_current = aggregate(current_rows, funnel_metrics)["revenue"]
    total_previous = aggregate(previous_rows, funnel_metrics)["revenue"]
    expected_delta = None if total_current is None or total_previous is None else total_current - total_previous
    return {
        "largest_negative": negative[:limit],
        "largest_positive": positive[:limit],
        "reconciliation": {
            "group_delta_sum": total_group_delta,
            "overall_delta": expected_delta,
            "difference": None if expected_delta is None else total_group_delta - expected_delta,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path)
    parser.add_argument("--sheet")
    parser.add_argument("--mapping", help="JSON string or path: canonical_field -> source column")
    parser.add_argument("--days", type=int, default=7, help="Days in current and previous periods")
    parser.add_argument("--dimensions", help="Comma-separated canonical dimensions; default: all detected")
    parser.add_argument("--limit", type=int, default=8)
    parser.add_argument("--allow-partial-periods", action="store_true")
    parser.add_argument("--include-latest-date", action="store_true", help="Include a latest date that may still be incomplete")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    headers, raw_rows, source_meta = read_report(args.report, args.sheet)
    mapping, conflicts = detect_mapping(headers)
    mapping.update(load_mapping(args.mapping))
    mapping_errors = validate_mapping(mapping, headers)
    rows = canonical_rows(raw_rows, mapping)
    report_type = detect_report_type(headers, args.report.name)
    issues: list[dict] = []
    if conflicts:
        issues.append({"severity": "warning", "code": "mapping_conflict", "details": conflicts})
    if not any(metric in mapping for metric in ADDITIVE_METRICS):
        issues.append({"severity": "error", "code": "missing_additive_metrics", "message": "没有可加指标，无法分析。"})
    for error in mapping_errors:
        issues.append({"severity": "error", "code": error["code"], "details": error})

    metric_coverage = {}
    for metric in ADDITIVE_METRICS:
        if metric in mapping:
            count = sum(1 for row in rows if row.get(metric) is not None)
            metric_coverage[metric] = {"parsed_rows": count, "total_rows": len(rows)}
            if count == 0:
                issues.append({"severity": "error", "code": "unparseable_metric", "message": metric})
            elif count < len(rows):
                issues.append({"severity": "error", "code": "partial_metric_coverage", "message": metric_coverage[metric]})

    for field in ("currency", "timezone", "data_source"):
        values = sorted({str(row.get(field)) for row in rows if row.get(field) not in (None, "")})
        if len(values) > 1:
            severity = "error"
            issues.append({"severity": severity, "code": f"mixed_{field}", "message": values})
    funnel_metrics = not ("network" in mapping and any(metric in mapping for metric in ("requests", "responses")))
    if not funnel_metrics:
        issues.append({"severity": "warning", "code": "network_funnel_non_additive", "message": "广告源级请求/返回可能是瀑布尝试；不要把跨广告源汇总的漏斗当成广告位漏斗。"})
    summary_rows = sum(1 for row in raw_rows if is_summary_row(row))
    if summary_rows:
        issues.append({"severity": "error", "code": "summary_rows", "message": summary_rows})
    if report_type and report_type["id"] == "funnel_report":
        issues.append({
            "severity": "error",
            "code": "dedicated_funnel_analyzer_required",
            "message": "漏斗报表包含次数、设备和人均次数等不同统计方式，不能使用通用汇总分析器。",
        })
    signatures = [tuple(row.get(field) for field in sorted(mapping)) for row in rows]
    duplicate_count = len(signatures) - len(set(signatures))
    if duplicate_count:
        issues.append({"severity": "error", "code": "duplicate_rows", "message": duplicate_count})

    fatal = any(issue["severity"] == "error" for issue in issues)

    dated_rows = [(date.fromisoformat(row["date"]), row) for row in rows if row.get("date")]
    period = None
    comparison = None
    dimensions_output = {}
    if not dated_rows:
        issues.append({"severity": "warning", "code": "missing_dates", "message": "没有可解析日期，只输出全量汇总。"})
    elif not fatal:
        latest = max(item[0] for item in dated_rows)
        if latest >= date.today() and not args.include_latest_date:
            issues.append({"severity": "warning", "code": "latest_date_excluded", "message": latest.isoformat()})
            latest -= timedelta(days=1)
        current_start = latest - timedelta(days=max(args.days, 1) - 1)
        previous_end = current_start - timedelta(days=1)
        previous_start = previous_end - timedelta(days=max(args.days, 1) - 1)
        current_rows = [row for day, row in dated_rows if current_start <= day <= latest]
        previous_rows = [row for day, row in dated_rows if previous_start <= day <= previous_end]
        available_dates = {day for day, _ in dated_rows}
        current_expected = {current_start + timedelta(days=offset) for offset in range(max(args.days, 1))}
        previous_expected = {previous_start + timedelta(days=offset) for offset in range(max(args.days, 1))}
        missing_current = sorted(day.isoformat() for day in current_expected - available_dates)
        missing_previous = sorted(day.isoformat() for day in previous_expected - available_dates)
        period = {
            "current": {"start": current_start.isoformat(), "end": latest.isoformat(), "rows": len(current_rows)},
            "previous": {"start": previous_start.isoformat(), "end": previous_end.isoformat(), "rows": len(previous_rows)},
        }
        if (missing_current or missing_previous) and not args.allow_partial_periods:
            issues.append({
                "severity": "error", "code": "incomplete_comparison_periods",
                "message": {"current_missing": missing_current, "previous_missing": missing_previous},
            })
        elif previous_rows and current_rows:
            if missing_current or missing_previous:
                issues.append({
                    "severity": "warning", "code": "partial_periods_allowed",
                    "message": {"current_missing": missing_current, "previous_missing": missing_previous},
                })
            comparison = compare(current_rows, previous_rows, funnel_metrics)
            requested_dimensions = (
                [item.strip() for item in args.dimensions.split(",") if item.strip()]
                if args.dimensions else [item for item in DIMENSIONS if item in mapping]
            )
            for dimension in requested_dimensions:
                if dimension in mapping:
                    dimensions_output[dimension] = dimension_changes(
                        current_rows, previous_rows, dimension, max(1, args.limit), funnel_metrics
                    )
        else:
            issues.append({"severity": "warning", "code": "missing_baseline", "message": "日期范围不足，找不到完整或部分前置对比周期。"})
    if "dau" in mapping:
        issues.append({"severity": "warning", "code": "non_additive_dau", "message": "DAU 可能在多维报表中重复，脚本不自动汇总或计算 ARPDAU。"})
    fatal = any(issue["severity"] == "error" for issue in issues)
    payload = {
        "evidence_type": "derived_from_uploaded_data",
        "report": str(args.report.resolve()),
        "source": source_meta,
        "report_type": None if report_type is None else {"id": report_type["id"], "name": report_type["name"]},
        "row_count": len(rows),
        "mapping": mapping,
        "metric_coverage": metric_coverage,
        "all_rows": None if fatal else aggregate(rows, funnel_metrics),
        "period": period,
        "comparison": comparison,
        "dimension_contributions": dimensions_output,
        "issues": issues,
        "interpretation_boundary": "结果是计算事实，不包含原因定论或线上配置变更。原因与建议必须结合数据质量、业务事件和 TopOn 文档约束复核。",
    }
    write_json(payload, args.output)
    return 2 if fatal else 0


if __name__ == "__main__":
    raise SystemExit(main())
