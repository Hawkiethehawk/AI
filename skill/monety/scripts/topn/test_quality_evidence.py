from __future__ import annotations

import csv
import json
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path

from audit_topn_data import audit
from evaluate_evidence import evaluate
from report_io import parse_date_range_from_filename


class QualityAndEvidenceTests(unittest.TestCase):
    def make_dataset(self, root: Path, trust_status: str = "observed") -> tuple[Path, Path]:
        csv_path = root / "normalized.csv"
        rows = []
        start = date(2026, 1, 1)
        for offset in range(28):
            value = 100 if offset < 14 else 200
            rows.append({
                "date": (start + timedelta(days=offset)).isoformat(),
                "estimated_revenue": value,
                "impressions": value * 100,
                "estimated_ecpm": 10,
            })
        with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows(rows)
        definitions = {
            "date": {"kind": "dimension", "data_type": "date"},
            "estimated_revenue": {"kind": "metric", "data_type": "currency", "aggregation": "sum_same_currency_mutually_exclusive_grain"},
            "impressions": {"kind": "metric", "data_type": "number", "aggregation": "sum_mutually_exclusive_grain", "unit": "impressions"},
            "estimated_ecpm": {"kind": "metric", "data_type": "currency_per_thousand_impressions", "aggregation": "recompute_from_estimated_revenue_and_impressions", "formula": "estimated_revenue / impressions * 1000"},
        }
        metadata = {
            "normalized_data_path": str(csv_path),
            "normalized_fields": list(rows[0]),
            "normalized_row_count": len(rows),
            "metric_definitions": definitions,
            "trust_status": trust_status,
            "report_type": {"id": "comprehensive_report", "name": "综合报表"},
            "date_range": {"start": rows[0]["date"], "end": rows[-1]["date"], "distinct_days": 28},
            "formula_reconciliation": {"checked_values": 28, "mismatched_values": 0},
            "issues": [],
        }
        metadata_path = root / "metadata.json"
        metadata_path.write_text(json.dumps(metadata, ensure_ascii=False), encoding="utf-8")
        return csv_path, metadata_path

    def test_filename_date_range_is_generic(self) -> None:
        self.assertEqual(
            parse_date_range_from_filename("TopOn_聚合管理_20250102-20250304 (2).xlsx"),
            {"start": "2025-01-02", "end": "2025-03-04"},
        )

    def test_quality_profile_is_usable(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            _, metadata = self.make_dataset(Path(tmp))
            result = audit(metadata)
            self.assertEqual(result["quality_status"], "usable")
            self.assertEqual(result["dataset_profile"]["candidate_grain"], ["date"])

    def test_adaptive_engine_detects_stable_change(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            _, metadata = self.make_dataset(root)
            quality_path = root / "quality.json"
            quality_path.write_text(json.dumps(audit(metadata), ensure_ascii=False), encoding="utf-8")
            result = evaluate(metadata, quality_path, [7, 14], 300, 0.05)
            revenue = next(item for item in result["metric_results"] if item["metric"] == "estimated_revenue")
            self.assertEqual(revenue["selected"]["grade"], "A")
            self.assertTrue(result["method"]["no_fixed_dau_threshold"])

    def test_fixture_is_never_actionable(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            _, metadata = self.make_dataset(root, "fixture")
            quality_path = root / "quality.json"
            quality_path.write_text(json.dumps(audit(metadata), ensure_ascii=False), encoding="utf-8")
            result = evaluate(metadata, quality_path, [7], 100, 0)
            self.assertEqual(result["overall_grade"], "D")
            self.assertEqual(result["status"], "not_actionable")


if __name__ == "__main__":
    unittest.main()
