#!/usr/bin/env python3
"""Analyze a standardized TopOn project batch and build a DA report artifact."""

from __future__ import annotations

import argparse
import csv
import json
import textwrap
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


SCENARIOS = {
    "funnel_overall": "整体",
    "funnel_interstitial": "插屏",
    "funnel_native": "信息流",
    "funnel_interstitial_shared": "插屏共享位",
}


def parse_cell(value: str) -> Any:
    text = value.strip()
    if text == "":
        return None
    try:
        return float(text)
    except ValueError:
        return text


def read_csv(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return [{key: parse_cell(value) for key, value in row.items()} for row in csv.DictReader(handle)]


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    fields = list(dict.fromkeys(key for row in rows for key in row))
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def sum_field(rows: Iterable[dict[str, Any]], field: str) -> float:
    return sum(float(row.get(field) or 0) for row in rows)


def safe_div(numerator: float, denominator: float) -> float | None:
    return numerator / denominator if denominator else None


def delta(current: float | None, previous: float | None) -> float | None:
    if current is None or previous in (None, 0):
        return None
    return current / previous - 1


def period_metrics(rows: list[dict[str, Any]]) -> dict[str, float | None]:
    values = {
        field: sum_field(rows, field)
        for field in (
            "estimated_revenue", "revenue_api", "impressions", "impressions_api",
            "dau", "deu", "ad_source_requests", "bidding_requests", "bidding_wins",
        )
    }
    values.update({
        "estimated_ecpm": safe_div(values["estimated_revenue"] * 1000, values["impressions"]),
        "estimated_arpdau": safe_div(values["estimated_revenue"], values["dau"]),
        "impressions_per_dau": safe_div(values["impressions"], values["dau"]),
        "penetration_rate": safe_div(values["deu"], values["dau"]),
        "revenue_gap_rate": safe_div(values["estimated_revenue"] - values["revenue_api"], values["revenue_api"]),
    })
    return values


def date_windows(rows: list[dict[str, Any]]) -> tuple[list[str], list[str]]:
    dates = sorted({str(row["date"]) for row in rows if row.get("date")})
    if len(dates) < 14:
        raise ValueError("At least 14 distinct dates are required for equal 7-day comparison windows")
    return dates[-14:-7], dates[-7:]


def aggregate_by(
    rows: list[dict[str, Any]],
    keys: tuple[str, ...],
    dates: set[str],
) -> dict[tuple[Any, ...], dict[str, float]]:
    fields = (
        "estimated_revenue", "revenue_api", "impressions", "impressions_api",
        "ad_source_requests", "bidding_requests", "dau", "deu",
    )
    output: dict[tuple[Any, ...], dict[str, float]] = {}
    for row in rows:
        if row.get("date") not in dates:
            continue
        key = tuple(row.get(field) for field in keys)
        item = output.setdefault(key, {field: 0.0 for field in fields})
        for field in fields:
            item[field] += float(row.get(field) or 0)
    return output


def build_period_comparison(daily: list[dict[str, Any]], previous_dates: list[str], latest_dates: list[str]) -> list[dict[str, Any]]:
    previous = period_metrics([row for row in daily if row.get("date") in set(previous_dates)])
    latest = period_metrics([row for row in daily if row.get("date") in set(latest_dates)])
    metrics = (
        ("estimated_revenue", "预估收益", "USD"),
        ("revenue_api", "收益 API", "USD"),
        ("impressions", "展示", "count"),
        ("dau", "DAU 设备日", "device_days"),
        ("estimated_ecpm", "预估 eCPM", "USD_per_1000"),
        ("estimated_arpdau", "预估 ARPDAU", "USD_per_device_day"),
        ("impressions_per_dau", "展示/DAU", "impressions_per_device_day"),
        ("penetration_rate", "渗透率", "fraction"),
    )
    return [{
        "metric": field,
        "metric_label": label,
        "unit": unit,
        "previous_value": previous.get(field),
        "latest_value": latest.get(field),
        "absolute_change": (latest.get(field) or 0) - (previous.get(field) or 0),
        "relative_change": delta(latest.get(field), previous.get(field)),
        "previous_period": f"{previous_dates[0]} 至 {previous_dates[-1]}",
        "latest_period": f"{latest_dates[0]} 至 {latest_dates[-1]}",
    } for field, label, unit in metrics]


def build_daily_rows(daily: list[dict[str, Any]]) -> list[dict[str, Any]]:
    output = []
    for row in sorted(daily, key=lambda item: str(item.get("date") or "")):
        output.append({
            "date": row.get("date"),
            "estimated_revenue": row.get("estimated_revenue"),
            "revenue_api": row.get("revenue_api"),
            "impressions": row.get("impressions"),
            "dau": row.get("dau"),
            "estimated_ecpm": row.get("estimated_ecpm"),
            "estimated_arpdau": row.get("estimated_arpdau"),
            "impressions_per_dau": row.get("impressions_per_dau"),
            "penetration_rate": row.get("penetration_rate"),
            "revenue_gap_rate": row.get("revenue_gap_rate"),
        })
    return output


def build_dimension_comparison(
    rows: list[dict[str, Any]],
    keys: tuple[str, ...],
    previous_dates: list[str],
    latest_dates: list[str],
    limit: int | None = None,
) -> list[dict[str, Any]]:
    previous = aggregate_by(rows, keys, set(previous_dates))
    latest = aggregate_by(rows, keys, set(latest_dates))
    all_keys = set(previous) | set(latest)
    result = []
    latest_total = sum(item["estimated_revenue"] for item in latest.values())
    for key in all_keys:
        prior = previous.get(key, {})
        current = latest.get(key, {})
        prior_revenue = float(prior.get("estimated_revenue", 0))
        current_revenue = float(current.get("estimated_revenue", 0))
        prior_impressions = float(prior.get("impressions", 0))
        current_impressions = float(current.get("impressions", 0))
        item = {field: value for field, value in zip(keys, key)}
        item.update({
            "previous_estimated_revenue": prior_revenue,
            "latest_estimated_revenue": current_revenue,
            "revenue_change": current_revenue - prior_revenue,
            "revenue_change_rate": delta(current_revenue, prior_revenue),
            "latest_revenue_share": safe_div(current_revenue, latest_total),
            "previous_impressions": prior_impressions,
            "latest_impressions": current_impressions,
            "impression_change_rate": delta(current_impressions, prior_impressions),
            "previous_estimated_ecpm": safe_div(prior_revenue * 1000, prior_impressions),
            "latest_estimated_ecpm": safe_div(current_revenue * 1000, current_impressions),
        })
        result.append(item)
    result.sort(key=lambda item: item["latest_estimated_revenue"], reverse=True)
    return result[:limit] if limit else result


def funnel_rates(rows: list[dict[str, Any]]) -> dict[str, float | None]:
    values = {field: sum_field(rows, field) for field in (
        "traffic_requests", "traffic_fills", "ad_scene_arrivals", "is_ready_queries",
        "display_triggers", "display_trigger_successes", "impressions", "impressions_api", "clicks",
    )}

    def weighted_rate(rate_field: str, denominator_field: str) -> float | None:
        pairs = [
            (float(row[rate_field]), float(row[denominator_field]))
            for row in rows
            if row.get(rate_field) is not None and float(row.get(denominator_field) or 0) > 0
        ]
        return safe_div(sum(rate * denominator for rate, denominator in pairs), sum(denominator for _, denominator in pairs))

    return {
        **values,
        "traffic_fill_rate": safe_div(values["traffic_fills"], values["traffic_requests"]),
        "ad_ready_rate": weighted_rate("ad_ready_rate", "ad_scene_arrivals"),
        "is_ready_success_rate": weighted_rate("is_ready_success_rate", "is_ready_queries"),
        "ad_trigger_rate": safe_div(values["display_triggers"], values["ad_scene_arrivals"]),
        "display_trigger_success_rate": safe_div(values["display_trigger_successes"], values["display_triggers"]),
        "impression_success_rate": safe_div(values["impressions"], values["display_trigger_successes"]),
        "impression_gap_rate": safe_div(values["impressions"] - values["impressions_api"], values["impressions_api"]),
        "ctr": safe_div(values["clicks"], values["impressions"]),
    }


def build_funnel_summary(derived: Path, previous_dates: list[str], latest_dates: list[str]) -> list[dict[str, Any]]:
    output = []
    for folder, label in SCENARIOS.items():
        rows = [row for row in read_csv(derived / folder / "normalized_funnel.csv") if row.get("statistic_type") == "event_count"]
        previous = funnel_rates([row for row in rows if row.get("date") in set(previous_dates)])
        latest = funnel_rates([row for row in rows if row.get("date") in set(latest_dates)])
        full = funnel_rates(rows)
        output.append({
            "scenario": label,
            "previous_period": f"{previous_dates[0]} 至 {previous_dates[-1]}",
            "latest_period": f"{latest_dates[0]} 至 {latest_dates[-1]}",
            **{f"full_{field}": full.get(field) for field in full},
            **{f"previous_{field}": previous.get(field) for field in previous},
            **{f"latest_{field}": latest.get(field) for field in latest},
        })
    return output


def build_mediation_summary(derived: Path) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    rows = read_csv(derived / "mediation_management" / "normalized_mediation_management.csv")
    meta = json.loads((derived / "mediation_management" / "mediation-management-metadata.json").read_text(encoding="utf-8"))
    fields = (
        "network", "ad_source_id", "ad_source", "status", "sort_price", "estimated_revenue",
        "revenue_api", "estimated_ecpm", "ecpm_api", "requests", "fill_rate", "fill_latency_seconds",
        "impressions", "impressions_api", "impression_rate", "impression_gap_rate",
    )
    ranked = sorted(rows, key=lambda row: float(row.get("estimated_revenue") or 0), reverse=True)
    return [{field: row.get(field) for field in fields} for row in ranked[:15]], {
        "report_totals": meta.get("report_totals"),
        "formula_reconciliation": {
            key: meta.get("formula_reconciliation", {}).get(key)
            for key in ("checked_values", "matched_values", "mismatched_values")
        },
        "issues": meta.get("issues", []),
    }


def build_quality_summary(derived: Path) -> list[dict[str, Any]]:
    datasets = {
        "日期综合报表": derived / "comprehensive_daily" / "comprehensive-metadata.json",
        "地区综合报表": derived / "comprehensive_by_country" / "comprehensive-metadata.json",
        "广告位综合报表": derived / "comprehensive_by_ad_unit" / "comprehensive-metadata.json",
        "广告源综合报表": derived / "comprehensive_by_ad_source" / "comprehensive-metadata.json",
        **{label + "漏斗": derived / folder / "funnel-analysis.json" for folder, label in SCENARIOS.items()},
        "聚合管理": derived / "mediation_management" / "mediation-management-metadata.json",
    }
    output = []
    for label, path in datasets.items():
        payload = json.loads(path.read_text(encoding="utf-8"))
        reconciliation = payload.get("formula_reconciliation") or payload.get("rate_reconciliation") or {}
        output.append({
            "dataset": label,
            "normalized_rows": payload.get("normalized_row_count"),
            "summary_rows_removed": payload.get("summary_rows_removed"),
            "formula_checks": reconciliation.get("checked_values"),
            "formula_matches": reconciliation.get("matched_values"),
            "formula_mismatches": reconciliation.get("mismatched_values"),
            "unresolved_definitions": ", ".join(payload.get("schema_audit", {}).get("unresolved_definition_fields", [])),
            "currency": payload.get("currency"),
            "timezone": payload.get("timezone"),
        })
    return output


def fmt_currency(value: float) -> str:
    return f"${value / 1000:.1f}k" if abs(value) >= 1000 else f"${value:.2f}"


def pct(value: float | None) -> str:
    return "—" if value is None else f"{value * 100:.1f}%"


def artifact_source(source_id: str, label: str, path: str, description: str, sql: str, definitions: list[str]) -> dict[str, Any]:
    return {
        "id": source_id,
        "label": label,
        "path": path,
        "query": {
            "engine": "duckdb",
            "language": "sql",
            "sql": "\n".join(textwrap.wrap(sql, width=56, break_long_words=True, break_on_hyphens=True)),
            "description": description,
            "tables_used": [path],
            "filters": ["2026-06-21 through 2026-07-20", "export summary rows excluded"],
            "metric_definitions": definitions,
        },
    }


def build_artifact(
    analysis: dict[str, Any],
    output: Path,
) -> None:
    comparison = {row["metric"]: row for row in analysis["period_comparison"]}
    rev = comparison["estimated_revenue"]
    imp = comparison["impressions"]
    ecpm = comparison["estimated_ecpm"]
    arpdau = comparison["estimated_arpdau"]
    country = analysis["country_comparison"]
    us = next((row for row in country if row.get("country") == "美国"), None)
    brazil = next((row for row in country if row.get("country") == "巴西"), None)
    shared = next(row for row in analysis["funnel_summary"] if row["scenario"] == "插屏共享位")

    sources = [
        artifact_source("daily_source", "TopOn 日期综合报表", "normalized_comprehensive.csv", "标准化日期综合报表并按等长七日窗口比较。", "SELECT date, estimated_revenue, revenue_api, impressions, dau, estimated_ecpm, estimated_arpdau, impressions_per_dau, penetration_rate, revenue_gap_rate FROM read_csv_auto('normalized_comprehensive.csv', header=true) ORDER BY date", [
            "预估收益为 TopOn 估算收益，币种 USD。",
            "预估 eCPM = 预估收益 / 展示 * 1000。",
            "预估 ARPDAU = 预估收益 / DAU。",
        ]),
        artifact_source("ad_unit_source", "TopOn 广告位综合报表", "ad_unit_comparison.csv", "按广告位汇总同一七日比较窗口。", "SELECT ad_unit, ad_unit_id, ad_format, '前七天' AS period, previous_estimated_revenue AS estimated_revenue, previous_impressions AS impressions, previous_estimated_ecpm AS estimated_ecpm FROM read_csv_auto('ad_unit_comparison.csv', header=true) UNION ALL SELECT ad_unit, ad_unit_id, ad_format, '最近七天' AS period, latest_estimated_revenue AS estimated_revenue, latest_impressions AS impressions, latest_estimated_ecpm AS estimated_ecpm FROM read_csv_auto('ad_unit_comparison.csv', header=true)", [
            "维度收益仅在互斥明细粒度内求和。",
            "DAU、DEU 不跨维度直接求和用于独立用户结论。",
        ]),
        artifact_source("country_source", "TopOn 地区综合报表", "country_comparison.csv", "按地区汇总同一七日比较窗口并保留前十收入地区。", "SELECT * FROM read_csv_auto('country_comparison.csv', header=true) ORDER BY latest_estimated_revenue DESC LIMIT 10", [
            "地区收入按日期与地区互斥明细求和。",
            "预估 eCPM = 预估收益 / 展示 * 1000。",
        ]),
        artifact_source("funnel_source", "TopOn 漏斗报表", "funnel_summary.csv", "按整体、插屏、信息流、插屏共享位分别计算次数口径漏斗。", "SELECT scenario, '流量填充率' AS stage, latest_traffic_fill_rate AS rate, latest_traffic_requests AS traffic_requests, latest_traffic_fills AS traffic_fills, latest_display_triggers AS display_triggers, latest_display_trigger_successes AS display_trigger_successes, latest_impressions AS impressions FROM read_csv_auto('funnel_summary.csv', header=true) UNION ALL SELECT scenario, '触发展示成功率' AS stage, latest_display_trigger_success_rate AS rate, latest_traffic_requests, latest_traffic_fills, latest_display_triggers, latest_display_trigger_successes, latest_impressions FROM read_csv_auto('funnel_summary.csv', header=true) UNION ALL SELECT scenario, '展示成功率' AS stage, latest_impression_success_rate AS rate, latest_traffic_requests, latest_traffic_fills, latest_display_triggers, latest_display_trigger_successes, latest_impressions FROM read_csv_auto('funnel_summary.csv', header=true)", [
            "流量填充率 = 流量填充 / 流量请求。",
            "展示成功率 = 展示 / 触发展示成功。",
            "次数、设备、人均次数分开保存。",
        ]),
        artifact_source("mediation_source", "TopOn 聚合管理报表", "normalized_mediation_management.csv", "隔离 Total 后查看广告源明细；缺少广告位与流量分组标识。", "SELECT * FROM read_csv_auto('normalized_mediation_management.csv', header=true) ORDER BY estimated_revenue DESC NULLS LAST LIMIT 15", [
            "明细请求为广告源请求，Total 请求为流量请求。",
            "API 指标不与 TopOn SDK 指标视为同一口径。",
        ]),
        artifact_source("quality_source", "TopOn 标准化与质量检查", "quality_summary.csv", "复核字段映射、汇总行、公式和跨报表总量。", "SELECT * FROM read_csv_auto('quality_summary.csv', header=true) ORDER BY dataset", [
            "默认币种 USD，默认报表时区 UTC+0。",
            "竞胜率 = 竞价胜出数 / (竞价次数 * 竞价响应率)。",
        ]),
    ]

    summary_lines = [
        "## Executive Summary",
        "",
        f"- **最近七天预估收益基本持平。** {rev['previous_period']} 为 {fmt_currency(rev['previous_value'])}，{rev['latest_period']} 为 {fmt_currency(rev['latest_value'])}，变化 {pct(rev['relative_change'])}。",
        f"- **新增展示没有转化成同比例收益。** 展示增加 {pct(imp['relative_change'])}，预估 eCPM 下降 {pct(ecpm['relative_change'])}，预估 ARPDAU 下降 {pct(arpdau['relative_change'])}。当前数据支持“量增、单价下降”，不支持直接归因为某项配置。",
    ]
    if us and brazil:
        summary_lines.append(
            f"- **地区结构发生替代。** 美国预估收益变化 {pct(us['revenue_change_rate'])}（{fmt_currency(us['revenue_change'])}），巴西变化 {pct(brazil['revenue_change_rate'])}（+{fmt_currency(brazil['revenue_change'])}）。"
        )
    summary_lines.append(
        f"- **插屏共享位是当前最需要继续观察的数据点。** 最近七天流量填充率 {pct(shared['latest_traffic_fill_rate'])}，触发展示成功率 {pct(shared['latest_display_trigger_success_rate'])}；但展示成功率仍为 {pct(shared['latest_impression_success_rate'])}，问题更靠前地出现在请求或触发阶段。"
    )

    manifest = {
        "version": 1,
        "surface": "report",
        "title": "TopOn 30 天数据观察",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": sources,
        "charts": [
            {
                "id": "daily_revenue_chart",
                "title": "每日预估收益与收益 API",
                "type": "line",
                "dataset": "daily_kpis",
                "sourceId": "daily_source",
                "encodings": {
                    "x": {"field": "date", "type": "temporal"},
                    "y": {"fields": ["estimated_revenue", "revenue_api"], "type": "quantitative"},
                },
            },
        ],
        "tables": [],
        "blocks": [
            {"id": "title", "type": "markdown", "body": "# TopOn 30 天数据观察"},
            {"id": "executive_summary", "type": "markdown", "body": "\n".join(summary_lines)},
            {"id": "trend_heading", "type": "markdown", "body": "## 收益持平，展示增长被 eCPM 下滑抵消\n\n[计算] 最近七天与前七天使用等长自然日窗口。曲线同时保留 TopOn 预估收益和第三方收益 API；最新一至两天的 API 数据仍可能继续回补。"},
            {"id": "daily_revenue_chart_block", "type": "chart", "chartId": "daily_revenue_chart"},
            {"id": "ad_unit_heading", "type": "markdown", "body": "## 三个广告位的单价都承压\n\n[计算] 插屏主位和插屏共享位收入小幅增长，信息流收入下降；三个广告位最近七天的预估 eCPM 都低于前七天。收入结构高度集中在插屏主位，因此整体表现主要受它影响。"},
            {"id": "country_heading", "type": "markdown", "body": "## 美国仍是最大收入来源，巴西承担了主要增量\n\n[计算] 美国收入下降被巴西、德国等地区的增量部分抵消。地区结构变化与整体 eCPM 下滑同时发生，但现有报表不能把两者解释为因果关系。"},
            {"id": "funnel_heading", "type": "markdown", "body": "## 场景漏斗差异很大，插屏共享位的问题位于前段\n\n[计算] 信息流最近七天流量填充率最高；插屏共享位的流量填充率和触发展示成功率最低。其展示成功率仍接近 97%，说明已经成功调用第三方展示后的回调环节相对稳定。广告触发率可以超过 100%，因为同一次到达广告场景可能触发多次展示调用。"},
            {"id": "mediation_heading", "type": "markdown", "body": "## 聚合管理数据暂时只适合做广告源内部观察\n\n[观测] 该导出没有日期列、广告位 ID 或流量分组标识，无法与三份广告位综合报表可靠对齐。广告源明细仍可用于查看收入、展示 GAP、填充率和耗时，但不能据此判断整套瀑布流配置。"},
            {"id": "quality_heading", "type": "markdown", "body": "## 数据结构可用，仍有三项边界\n\n[观测] 九份报表都已移除导出汇总行并使用 USD、UTC+0。日期、地区、广告位总量基本一致。广告源报表在 6 月 23 日有 18 条完全重复的零值行，对金额和展示总量没有影响。广告源级低响应率记录会因竞价响应率只保留有限小数而出现竞胜率复算差异。"},
            {"id": "next_steps", "type": "markdown", "body": "## 下一批只补数据\n\n1. 等到 T-2 后重新导出同一截止日，用于确认收益 API、展示 API 是否回补。\n2. 下次聚合管理导出时记录对应广告位、流量分组和筛选条件，才能与综合报表对账。\n3. 继续按相同四个综合维度和四个漏斗范围导出，至少再积累一个完整 30 天窗口后再讨论配置优化。"},
            {"id": "further_questions", "type": "markdown", "body": "## 仍需回答的问题\n\n- 最近七天 eCPM 下滑来自地区结构变化、各地区内部价格变化，还是广告源组合变化？\n- 插屏共享位的低填充和低触发展示成功率是否长期存在，还是由最近版本或调用策略变化引起？\n- 聚合管理导出具体对应哪个广告位和流量分组？"},
            {"id": "caveats", "type": "markdown", "body": "## 口径与限制\n\n币种为 USD，报表时区为 UTC+0。预估收益不是最终结算收益。DAU、DEU 按日及筛选维度统计，跨维度不能当作去重用户。报告只描述观测与计算结果，不使用配置快照，也不提出具体底价、层级或频次调整。"},
        ],
    }

    ad_unit_period_rows = []
    for row in analysis["ad_unit_comparison"]:
        for period, field in (("前七天", "previous_estimated_revenue"), ("最近七天", "latest_estimated_revenue")):
            ad_unit_period_rows.append({
                "ad_unit": row.get("ad_unit"),
                "ad_unit_id": row.get("ad_unit_id"),
                "ad_format": row.get("ad_format"),
                "period": period,
                "estimated_revenue": row.get(field),
                "latest_estimated_ecpm": row.get("latest_estimated_ecpm"),
                "previous_estimated_ecpm": row.get("previous_estimated_ecpm"),
                "latest_impressions": row.get("latest_impressions"),
                "previous_impressions": row.get("previous_impressions"),
            })
    funnel_rate_rows = []
    funnel_fields = (
        ("流量填充率", "latest_traffic_fill_rate"),
        ("触发展示成功率", "latest_display_trigger_success_rate"),
        ("展示成功率", "latest_impression_success_rate"),
    )
    for row in analysis["funnel_summary"]:
        for stage, field in funnel_fields:
            funnel_rate_rows.append({
                "scenario": row["scenario"],
                "stage": stage,
                "rate": row.get(field),
                "traffic_requests": row.get("latest_traffic_requests"),
                "traffic_fills": row.get("latest_traffic_fills"),
                "display_triggers": row.get("latest_display_triggers"),
                "display_trigger_successes": row.get("latest_display_trigger_successes"),
                "impressions": row.get("latest_impressions"),
            })

    artifact = {
        "surface": "report",
        "manifest": manifest,
        "snapshot": {
            "version": 1,
            "generatedAt": manifest["generatedAt"],
            "status": "ready",
            "datasets": {
                "daily_kpis": analysis["daily_kpis"],
                "period_comparison": analysis["period_comparison"],
                "ad_unit_period_rows": ad_unit_period_rows,
                "country_comparison": analysis["country_comparison"][:10],
                "funnel_rate_rows": funnel_rate_rows,
                "funnel_summary": analysis["funnel_summary"],
                "mediation_top_sources": analysis["mediation_top_sources"],
                "quality_summary": analysis["quality_summary"],
            },
        },
        "sources": sources,
        "package_info": {
            "analysis_contract_version": 1,
            "currency": "USD",
            "timezone": "UTC+0",
            "date_range": analysis["date_range"],
            "comparison": analysis["comparison"],
            "scope": "data_only_no_configuration_recommendations",
        },
    }
    output.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project", type=Path)
    parser.add_argument("--output-dir", type=Path)
    args = parser.parse_args()
    derived = args.project / "derived"
    output_dir = args.output_dir or args.project / "reports" / "data-only-20260621-20260720"
    output_dir.mkdir(parents=True, exist_ok=True)

    daily = read_csv(derived / "comprehensive_daily" / "normalized_comprehensive.csv")
    country = read_csv(derived / "comprehensive_by_country" / "normalized_comprehensive.csv")
    ad_unit = read_csv(derived / "comprehensive_by_ad_unit" / "normalized_comprehensive.csv")
    previous_dates, latest_dates = date_windows(daily)
    mediation_top, mediation_meta = build_mediation_summary(derived)
    analysis = {
        "contract_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "date_range": {"start": min(row["date"] for row in daily), "end": max(row["date"] for row in daily)},
        "comparison": {
            "previous": {"start": previous_dates[0], "end": previous_dates[-1]},
            "latest": {"start": latest_dates[0], "end": latest_dates[-1]},
        },
        "currency": "USD",
        "timezone": "UTC+0",
        "daily_kpis": build_daily_rows(daily),
        "period_comparison": build_period_comparison(daily, previous_dates, latest_dates),
        "ad_unit_comparison": build_dimension_comparison(ad_unit, ("ad_unit_id", "ad_unit", "ad_format"), previous_dates, latest_dates),
        "country_comparison": build_dimension_comparison(country, ("country",), previous_dates, latest_dates, limit=20),
        "funnel_summary": build_funnel_summary(derived, previous_dates, latest_dates),
        "mediation_top_sources": mediation_top,
        "mediation_metadata": mediation_meta,
        "quality_summary": build_quality_summary(derived),
        "analysis_boundary": "Only observed data and recomputable metrics are described; no configuration recommendation is made.",
    }
    write_csv(output_dir / "period_comparison.csv", analysis["period_comparison"])
    write_csv(output_dir / "ad_unit_comparison.csv", analysis["ad_unit_comparison"])
    write_csv(output_dir / "country_comparison.csv", analysis["country_comparison"])
    write_csv(output_dir / "funnel_summary.csv", analysis["funnel_summary"])
    write_csv(output_dir / "quality_summary.csv", analysis["quality_summary"])
    analysis_path = output_dir / "topon_batch_analysis.json"
    artifact_path = output_dir / "report-artifact.json"
    analysis_path.write_text(json.dumps(analysis, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    build_artifact(analysis, artifact_path)
    print(json.dumps({
        "ok": True,
        "analysis": str(analysis_path),
        "artifact": str(artifact_path),
        "comparison": analysis["comparison"],
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
