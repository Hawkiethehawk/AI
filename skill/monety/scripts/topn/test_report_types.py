#!/usr/bin/env python3
"""Regression tests for registered TopOn report type fingerprints."""

from __future__ import annotations

import json
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from init_topon_project import initialize_project
from report_io import detect_mapping, detect_report_type, is_summary_row, load_metric_catalog


class ReportTypeTests(unittest.TestCase):
    def test_comprehensive_report(self) -> None:
        headers = ["日期", "DAU", "DEU", "预估收益", "收益 API", "预估 eCPM", "展示"]
        detected = detect_report_type(headers, "TopOn_综合报表_20260707-20260721.xlsx")
        self.assertEqual(detected["id"], "comprehensive_report")
        mapping, _ = detect_mapping(headers)
        self.assertEqual(mapping["estimated_revenue"], "预估收益")
        self.assertEqual(mapping["revenue_api"], "收益 API")
        self.assertEqual(mapping["estimated_ecpm"], "预估 eCPM")
        self.assertNotIn("revenue", mapping)
        self.assertNotIn("ecpm", mapping)

    def test_funnel_report(self) -> None:
        headers = ["日期", "统计方式", "应用启动", "流量请求", "流量填充", "展示", "展示Gap"]
        detected = detect_report_type(headers, "TopOn_漏斗报表_20260707-20260720.xlsx")
        self.assertEqual(detected["id"], "funnel_report")
        mapping, _ = detect_mapping(headers)
        self.assertEqual(mapping["statistic_type"], "统计方式")
        self.assertEqual(mapping["traffic_requests"], "流量请求")

    def test_ad_source_comprehensive_report(self) -> None:
        headers = [
            "日期", "广告平台", "广告源ID", "广告源", "第三方平台广告位ID",
            "预估收益", "展示", "竞胜率", "竞价胜出数",
        ]
        detected = detect_report_type(headers, "TopOn_综合报表_20260621-20260720 (3).xlsx")
        self.assertEqual(detected["id"], "comprehensive_report")
        mapping, conflicts = detect_mapping(headers)
        self.assertFalse(conflicts)
        self.assertEqual(mapping["network"], "广告平台")
        self.assertEqual(mapping["ad_source"], "广告源")
        self.assertEqual(mapping["ad_source_id"], "广告源ID")
        self.assertEqual(mapping["bidding_win_rate"], "竞胜率")
        self.assertEqual(mapping["bidding_wins"], "竞价胜出数")

    def test_mediation_management_report(self) -> None:
        headers = ["广告平台", "广告源ID", "广告源", "请求", "展示", "eCPM API", "填充耗时（秒）"]
        detected = detect_report_type(headers, "TopOn_聚合管理_20260621-20260720.xlsx")
        self.assertEqual(detected["id"], "mediation_management_report")
        mapping, conflicts = detect_mapping(headers)
        self.assertFalse(conflicts)
        self.assertEqual(mapping["network"], "广告平台")
        self.assertEqual(mapping["ad_source"], "广告源")
        self.assertEqual(mapping["ecpm_api"], "eCPM API")
        self.assertEqual(mapping["fill_latency_seconds"], "填充耗时（秒）")

    def test_summary_rows(self) -> None:
        self.assertTrue(is_summary_row({"date": "汇总", "statistic_type": "次数"}))
        self.assertTrue(is_summary_row({"日期": "2026-07-07 ~ 2026-07-21"}))
        self.assertFalse(is_summary_row({"date": "2026-07-21"}))

    def test_metric_catalog_preserves_topon_semantics(self) -> None:
        metrics = load_metric_catalog()["metrics"]
        self.assertEqual(metrics["estimated_revenue"]["source_columns"], ["预估收益"])
        self.assertIn("不是第三方平台最终结算收益", metrics["estimated_revenue"]["definition"])
        self.assertIn("收益 API", metrics["revenue_api"]["source_columns"])
        self.assertEqual(metrics["estimated_ecpm"]["formula"], "estimated_revenue / impressions * 1000")
        self.assertEqual(metrics["impression_success_rate"]["formula"], "impressions / display_trigger_successes")
        self.assertEqual(metrics["statistic_type"]["aggregation"], "none")
        self.assertEqual(metrics["estimated_revenue_share"]["formula"], "estimated_revenue / report_total_estimated_revenue")
        self.assertEqual(metrics["impression_share"]["formula"], "impressions / report_total_impressions")
        self.assertEqual(metrics["estimated_revenue_share"]["validation_status"], "recomputable_from_export_summary")
        self.assertEqual(metrics["impression_share"]["validation_status"], "recomputable_from_export_summary")
        self.assertEqual(metrics["bidding_response_rate"]["validation_status"], "definition_known_export_inputs_missing")
        self.assertEqual(metrics["ad_source_fill_rate"]["validation_status"], "definition_known_export_inputs_missing")
        self.assertEqual(metrics["ad_ready_rate"]["validation_status"], "definition_known_export_inputs_missing")
        self.assertEqual(metrics["is_ready_success_rate"]["validation_status"], "definition_known_export_inputs_missing")
        self.assertEqual(metrics["impression_rate"]["validation_status"], "requires_grain_specific_denominator")
        self.assertEqual(metrics["impression_success_rate"]["validation_status"], "confirmed_by_user_and_export")
        self.assertEqual(metrics["bidding_win_rate"]["validation_status"], "recomputable_from_export_columns")
        self.assertEqual(metrics["bidding_win_rate"]["formula"], "bidding_wins / (bidding_requests * bidding_response_rate)")
        self.assertEqual(metrics["network"]["kind"], "dimension")
        self.assertEqual(metrics["ad_source"]["kind"], "dimension")

    def test_project_defaults(self) -> None:
        with TemporaryDirectory() as temp_dir:
            project_dir, created = initialize_project(Path(temp_dir), "fixture-project")
            self.assertTrue(created)
            context = json.loads((project_dir / "context.json").read_text(encoding="utf-8"))
            self.assertEqual(context["currency"], "USD")
            self.assertEqual(context["timezone"], "UTC+0")


if __name__ == "__main__":
    unittest.main()
