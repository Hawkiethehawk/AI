#!/usr/bin/env python3
"""Build a canonical Data Analytics artifact from normalized TopOn outputs."""

from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DOC_SOURCES = [
    {"id": "topon_comprehensive_docs", "label": "TopOn 综合报表指标说明", "href": "https://help.toponad.net/cn/docs/DVM3Tf"},
    {"id": "topon_funnel_docs", "label": "TopOn 漏斗分析报表说明", "href": "https://help.toponad.net/cn/docs/qlHqYM"},
    {"id": "topon_mediation_docs", "label": "TopOn 聚合管理报表指标说明", "href": "https://help.toponad.net/cn/docs/bUh0Id"},
]


def parse_cell(value: str) -> Any:
    text = value.strip()
    if text == "":
        return None
    try:
        return float(text)
    except ValueError:
        return text


def read_rows(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return [{key: parse_cell(value) for key, value in row.items()} for row in csv.DictReader(handle)]


def definition_lines(definitions: dict[str, Any]) -> list[str]:
    lines = []
    for field, item in definitions.items():
        if not item:
            continue
        line = f"{field}（{item['display_name']}）: {item['definition']} 聚合规则：{item['aggregation']}。"
        if item.get("formula"):
            line += f" 公式：{item['formula']}。"
        if item.get("documentation_status") == "unresolved_export_column":
            line += " 帮助中心定义未确认，禁止自行补充分母或口径。"
        elif item.get("documentation_status") == "user_confirmed_current_definition":
            line += " 当前口径由用户确认并通过样例复算，本地帮助中心快照仅作为旧版本参考。"
        if item.get("validation_note"):
            line += f" 校验限制：{item['validation_note']}"
        lines.append(line)
    return lines


def column_spec(field: str, definitions: dict[str, Any]) -> dict[str, Any]:
    item = definitions[field]
    spec: dict[str, Any] = {"field": field, "label": item["display_name"]}
    data_type = item.get("data_type")
    if data_type == "rate":
        spec["format"] = "percent"
    elif data_type in {"number", "currency", "currency_per_device", "currency_per_thousand_impressions"}:
        spec["format"] = "number"
    return spec


def source_object(csv_name: str, report_type: str, definitions: dict[str, Any]) -> dict[str, Any]:
    if report_type == "funnel_report":
        sql = f"SELECT * FROM read_csv_auto('{csv_name}', header=true) WHERE statistic_type = 'event_count' ORDER BY date"
        description = "读取已标准化的 TopOn 漏斗报表次数口径；设备和人均次数保留为独立数据集，不参与本查询。"
        filters = ["exclude exported summary rows", "statistic_type = event_count"]
    elif report_type == "mediation_management_report":
        sql = f"SELECT * FROM read_csv_auto('{csv_name}', header=true) WHERE ad_source_id IS NOT NULL ORDER BY estimated_revenue DESC NULLS LAST"
        description = "读取已隔离 Total 汇总行的 TopOn 聚合管理广告源明细；请求与 API 指标按各自粒度解释。"
        filters = ["exclude exported Total row", "ad_source_id is not null"]
    else:
        sql = f"SELECT * FROM read_csv_auto('{csv_name}', header=true) WHERE date IS NOT NULL ORDER BY date"
        description = "读取已移除区间汇总行的 TopOn 综合报表规范数据。"
        filters = ["exclude exported summary rows", "date is not null"]
    return {
        "id": "topon_normalized_data",
        "label": "TopOn 标准化报表数据",
        "path": csv_name,
        "query": {
            "engine": "duckdb",
            "language": "sql",
            "sql": sql,
            "description": description,
            "tables_used": [csv_name],
            "filters": filters,
            "metric_definitions": definition_lines(definitions),
        },
    }


def report_blocks(title: str, data_blocks: list[dict[str, Any]], fixture: bool) -> list[dict[str, Any]]:
    summary = "## Executive Summary\n\n本产物用于验证 TopOn 数据结构、指标定义和 Data Analytics 交付契约。"
    if fixture:
        summary += " 当前数据被标记为低可信结构样例，不用于现实业务结论或配置建议。"
    return [
        {"id": "title", "type": "markdown", "body": f"# {title}"},
        {"id": "executive_summary", "type": "markdown", "body": summary},
        *data_blocks,
    ]


def build_comprehensive(payload: dict[str, Any], rows: list[dict[str, Any]], surface: str) -> tuple[dict[str, Any], dict[str, Any]]:
    definitions = payload["metric_definitions"]
    title = "TopOn 综合报表数据结构验证"
    y_field = next((field for field in ("estimated_revenue", "revenue_api", "impressions") if field in definitions), None)
    if not y_field:
        raise ValueError("No chartable comprehensive metric found")
    table_fields = [field for field in (
        "date", "dau", "deu", "estimated_revenue", "revenue_api", "revenue_gap_rate",
        "estimated_arpdau", "impressions", "impressions_api", "estimated_ecpm",
    ) if field in definitions]
    dimensions = [field for field, item in definitions.items() if item.get("kind") == "dimension" and field != "date"]
    has_multiple_rows_per_day = len({row.get("date") for row in rows}) < len(rows)
    daily_rows = rows
    chart_dataset = "comprehensive_daily"
    table_dataset = "comprehensive_daily"
    datasets: dict[str, list[dict[str, Any]]] = {}
    if has_multiple_rows_per_day:
        daily_totals: dict[str, float] = {}
        for row in rows:
            if row.get("date") and isinstance(row.get(y_field), (int, float)):
                daily_totals[row["date"]] = daily_totals.get(row["date"], 0.0) + float(row[y_field])
        daily_rows = [{"date": day, y_field: value} for day, value in sorted(daily_totals.items())]
        chart_dataset = "comprehensive_daily_rollup"
        table_dataset = "comprehensive_detail_sample"
        sample_limit = max(1, 2000 - len(daily_rows))
        sample_rows = sorted(
            rows,
            key=lambda row: (str(row.get("date") or ""), -(float(row.get(y_field) or 0))),
        )[:sample_limit]
        datasets[chart_dataset] = daily_rows
        datasets[table_dataset] = sample_rows
    else:
        datasets[chart_dataset] = rows[:2000]
    charts = [{
        "id": "daily_primary_metric",
        "title": f"按日期的{definitions[y_field]['display_name']}",
        "type": "line",
        "dataset": chart_dataset,
        "sourceId": "topon_normalized_data",
        "encodings": {
            "x": {"field": "date", "type": "temporal"},
            "y": {"field": y_field, "type": "quantitative"},
        },
    }]
    tables = [{
        "id": "comprehensive_rows",
        "title": "综合报表规范字段",
        "dataset": table_dataset,
        "sourceId": "topon_normalized_data",
        "columns": [column_spec(field, definitions) for field in ["date", *dimensions, *[item for item in table_fields if item != "date"]] if field in definitions],
        "defaultSort": {"field": "date", "direction": "asc"},
    }]
    data_blocks = [
        {"id": "daily_primary_metric_block", "type": "chart", "chartId": "daily_primary_metric"},
        {"id": "comprehensive_rows_block", "type": "table", "tableId": "comprehensive_rows"},
    ]
    blocks = report_blocks(title, data_blocks, payload["trust_status"] == "fixture") if surface == "report" else data_blocks
    return {
        "version": 1, "surface": surface, "title": title,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "charts": charts, "tables": tables, "sources": [], "blocks": blocks,
    }, datasets


def build_mediation(payload: dict[str, Any], rows: list[dict[str, Any]], surface: str) -> tuple[dict[str, Any], dict[str, Any]]:
    definitions = payload["metric_definitions"]
    title = "TopOn 聚合管理报表数据结构验证"
    dataset = "mediation_ad_sources"
    y_field = next((field for field in ("estimated_revenue", "revenue_api", "impressions") if field in definitions), None)
    if not y_field:
        raise ValueError("No chartable mediation metric found")
    chart_rows = sorted(rows, key=lambda row: float(row.get(y_field) or 0), reverse=True)[:20]
    datasets = {dataset: rows[:2000], "mediation_top_sources": chart_rows}
    table_fields = [field for field in (
        "network", "ad_source_id", "ad_source", "status", "sort_price", "estimated_revenue",
        "revenue_api", "estimated_ecpm", "ecpm_api", "requests", "fill_rate",
        "fill_latency_seconds", "impressions", "impressions_api", "impression_gap_rate",
    ) if field in definitions]
    charts = [{
        "id": "top_mediation_sources",
        "title": f"广告源{definitions[y_field]['display_name']}（前20）",
        "type": "bar",
        "dataset": "mediation_top_sources",
        "sourceId": "topon_normalized_data",
        "encodings": {
            "x": {"field": "ad_source", "type": "nominal"},
            "y": {"field": y_field, "type": "quantitative"},
        },
    }]
    tables = [{
        "id": "mediation_rows",
        "title": "聚合管理广告源规范字段",
        "dataset": dataset,
        "sourceId": "topon_normalized_data",
        "columns": [column_spec(field, definitions) for field in table_fields],
        "defaultSort": {"field": y_field, "direction": "desc"},
    }]
    data_blocks = [
        {"id": "top_mediation_sources_block", "type": "chart", "chartId": "top_mediation_sources"},
        {"id": "mediation_rows_block", "type": "table", "tableId": "mediation_rows"},
    ]
    blocks = report_blocks(title, data_blocks, payload["trust_status"] == "fixture") if surface == "report" else data_blocks
    return {
        "version": 1, "surface": surface, "title": title,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "charts": charts, "tables": tables, "sources": [], "blocks": blocks,
    }, datasets


def build_funnel(payload: dict[str, Any], rows: list[dict[str, Any]], surface: str) -> tuple[dict[str, Any], dict[str, Any]]:
    definitions = payload["metric_definitions"]
    title = "TopOn 漏斗报表数据结构验证"
    datasets = {
        "funnel_event_count": [row for row in rows if row.get("statistic_type") == "event_count"],
        "funnel_device_count": [row for row in rows if row.get("statistic_type") == "device_count"],
        "funnel_per_device": [row for row in rows if row.get("statistic_type") == "per_device"],
    }
    y_field = next((field for field in ("traffic_requests", "traffic_fills", "impressions") if field in definitions), None)
    if not y_field:
        raise ValueError("No chartable funnel metric found")
    table_fields = [field for field in (
        "date", "app_starts", "config_fetches", "traffic_requests", "traffic_fills",
        "traffic_fill_rate", "ad_scene_arrivals", "display_triggers", "impressions", "clicks",
    ) if field in definitions]
    charts = [{
        "id": "daily_funnel_metric",
        "title": f"次数口径：按日期的{definitions[y_field]['display_name']}",
        "type": "line",
        "dataset": "funnel_event_count",
        "sourceId": "topon_normalized_data",
        "encodings": {
            "x": {"field": "date", "type": "temporal"},
            "y": {"field": y_field, "type": "quantitative"},
        },
    }]
    tables = [{
        "id": "funnel_event_rows",
        "title": "漏斗次数口径规范字段",
        "dataset": "funnel_event_count",
        "sourceId": "topon_normalized_data",
        "columns": [column_spec(field, definitions) for field in table_fields],
        "defaultSort": {"field": "date", "direction": "asc"},
    }]
    data_blocks = [
        {"id": "daily_funnel_metric_block", "type": "chart", "chartId": "daily_funnel_metric"},
        {"id": "funnel_event_rows_block", "type": "table", "tableId": "funnel_event_rows"},
    ]
    blocks = report_blocks(title, data_blocks, payload["trust_status"] == "fixture") if surface == "report" else data_blocks
    return {
        "version": 1, "surface": surface, "title": title,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "charts": charts, "tables": tables, "sources": [], "blocks": blocks,
    }, datasets


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="comprehensive-metadata.json or funnel-analysis.json")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--surface", choices=("dashboard", "report"), default="dashboard")
    args = parser.parse_args()

    payload = json.loads(args.input.read_text(encoding="utf-8"))
    csv_path = Path(payload["normalized_data_path"])
    rows = read_rows(csv_path)
    report_type = payload["report_type"]["id"]
    if report_type == "comprehensive_report":
        manifest, datasets = build_comprehensive(payload, rows, args.surface)
        relevant_docs = [DOC_SOURCES[0]]
    elif report_type == "funnel_report":
        manifest, datasets = build_funnel(payload, rows, args.surface)
        relevant_docs = [DOC_SOURCES[1], DOC_SOURCES[0]]
    elif report_type == "mediation_management_report":
        manifest, datasets = build_mediation(payload, rows, args.surface)
        relevant_docs = [DOC_SOURCES[2], DOC_SOURCES[0]]
    else:
        raise ValueError(f"Unsupported report type: {report_type}")

    source = source_object(csv_path.name, report_type, payload["metric_definitions"])
    sources = [source, *relevant_docs]
    manifest["sources"] = sources
    artifact = {
        "surface": args.surface,
        "manifest": manifest,
        "snapshot": {
            "version": 1,
            "generatedAt": manifest["generatedAt"],
            "status": "fixture" if payload["trust_status"] == "fixture" else "ready",
            "datasets": datasets,
        },
        "sources": sources,
        "package_info": {
            "adapter_contract_version": 1,
            "report_type": report_type,
            "trust_status": payload["trust_status"],
            "source_file_name": payload["source"]["file_name"],
            "source_file_sha256": payload["source"]["file_sha256"],
            "schema_audit": payload.get("schema_audit"),
            "documentation_conflicts": payload.get("documentation_conflicts", []),
            "quality_issues": payload.get("issues", []),
            "currency": payload.get("currency"),
            "currency_source": payload.get("currency_source"),
            "timezone": payload.get("timezone"),
            "timezone_source": payload.get("timezone_source"),
            "report_totals": payload.get("report_totals"),
            "report_total_sources": payload.get("report_total_sources"),
        },
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "ok": True, "artifact": str(args.output), "surface": args.surface,
        "report_type": report_type, "datasets": {key: len(value) for key, value in datasets.items()},
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
