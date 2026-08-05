#!/usr/bin/env python3
"""Run Topn report detection, normalization, quality audit and DA handoff preparation."""

from __future__ import annotations

import argparse
import hashlib
import json
import locale
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from report_io import detect_report_type, read_report


SCRIPT_DIR = Path(__file__).resolve().parent
SUPPORTED = {".csv", ".tsv", ".txt", ".xlsx", ".xlsm"}
GENERATED_PREFIXES = ("normalized_", "period_comparison", "quality_summary", "funnel_summary")
ADAPTERS = {
    "comprehensive_report": ("normalize_comprehensive_report.py", "comprehensive-metadata.json"),
    "funnel_report": ("analyze_funnel_report.py", "funnel-analysis.json"),
    "mediation_management_report": ("normalize_mediation_management_report.py", "mediation-management-metadata.json"),
}


def discover(path: Path) -> list[Path]:
    candidates = [path] if path.is_file() else sorted(item for item in path.rglob("*") if item.is_file())
    return [
        item for item in candidates
        if item.suffix.lower() in SUPPORTED
        and not item.name.startswith("~$")
        and not item.name.lower().startswith(GENERATED_PREFIXES)
    ]


def slug(path: Path, report_type: str) -> str:
    cleaned = re.sub(r"[^0-9A-Za-z\u4e00-\u9fff]+", "-", path.stem).strip("-")[:60]
    digest = hashlib.sha256(path.read_bytes()).hexdigest()[:8]
    return f"{report_type.replace('_report', '')}-{cleaned or 'report'}-{digest}"


def run(command: list[str], allow_codes: set[int] | None = None) -> dict[str, Any]:
    process = subprocess.run(
        command, text=True, encoding=locale.getpreferredencoding(False), errors="replace", capture_output=True
    )
    allowed = allow_codes or {0}
    if process.returncode not in allowed:
        raise RuntimeError((process.stderr or "").strip() or (process.stdout or "").strip() or f"command failed: {process.returncode}")
    return {"return_code": process.returncode, "stdout": (process.stdout or "").strip(), "stderr": (process.stderr or "").strip()}


def process_report(report: Path, derived_root: Path, trust_status: str, surface: str) -> dict[str, Any]:
    headers, _, _ = read_report(report)
    detected = detect_report_type(headers, report.name)
    if not detected:
        return {"source": str(report.resolve()), "status": "unsupported", "error": "未识别为已登记的 TopOn 报表类型。"}
    report_type = detected["id"]
    if report_type not in ADAPTERS:
        return {"source": str(report.resolve()), "status": "unsupported", "report_type": report_type}
    output_dir = derived_root / slug(report, report_type)
    output_dir.mkdir(parents=True, exist_ok=True)
    inspection = output_dir / "inspection.json"
    run([sys.executable, str(SCRIPT_DIR / "inspect_topon_report.py"), str(report), "--output", str(inspection)], {0, 2})

    adapter, metadata_name = ADAPTERS[report_type]
    adapter_result = run([
        sys.executable, str(SCRIPT_DIR / adapter), str(report),
        "--output-dir", str(output_dir), "--trust-status", trust_status,
    ])
    metadata = output_dir / metadata_name
    artifact = output_dir / "data-analytics-artifact.json"
    quality = output_dir / "data-quality.json"
    evidence = output_dir / "evidence-evaluation.json"
    artifact_result = run([
        sys.executable, str(SCRIPT_DIR / "build_data_analytics_artifact.py"), str(metadata),
        "--output", str(artifact), "--surface", surface,
    ])
    quality_result = run([
        sys.executable, str(SCRIPT_DIR / "audit_topn_data.py"), str(metadata), "--output", str(quality),
    ], {0, 2})
    evidence_result = run([
        sys.executable, str(SCRIPT_DIR / "evaluate_evidence.py"), str(metadata),
        "--quality", str(quality), "--output", str(evidence),
    ])
    quality_payload = json.loads(quality.read_text(encoding="utf-8"))
    evidence_payload = json.loads(evidence.read_text(encoding="utf-8"))
    return {
        "source": str(report.resolve()),
        "status": "prepared",
        "report_type": {"id": report_type, "name": detected["name"]},
        "trust_status": trust_status,
        "outputs": {
            "directory": str(output_dir.resolve()), "inspection": str(inspection.resolve()),
            "metadata": str(metadata.resolve()), "artifact": str(artifact.resolve()),
            "quality": str(quality.resolve()), "evidence": str(evidence.resolve()),
        },
        "quality_status": quality_payload["quality_status"],
        "evidence_grade": evidence_payload["overall_grade"],
        "commands": {
            "adapter": adapter_result, "artifact": artifact_result,
            "quality": quality_result, "evidence": evidence_result,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="单个报表或包含报表的目录")
    parser.add_argument("--project", default="default")
    parser.add_argument("--output-root", type=Path, default=Path("output/folder/topn-analysis"))
    parser.add_argument("--trust-status", choices=("observed", "fixture"), default="observed")
    parser.add_argument("--surface", choices=("dashboard", "report"), default="report")
    args = parser.parse_args()
    reports = discover(args.input)
    project = args.output_root / args.project
    derived = project / "derived"
    derived.mkdir(parents=True, exist_ok=True)
    results: list[dict[str, Any]] = []
    for report in reports:
        try:
            results.append(process_report(report, derived, args.trust_status, args.surface))
        except Exception as exc:  # keep batch progress and expose the per-file failure
            results.append({"source": str(report.resolve()), "status": "failed", "error": str(exc)})

    manifest = {
        "contract_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "project": args.project,
        "currency": "USD", "timezone": "UTC+0",
        "input": str(args.input.resolve()),
        "report_count": len(reports),
        "prepared_count": sum(item["status"] == "prepared" for item in results),
        "failed_count": sum(item["status"] == "failed" for item in results),
        "reports": results,
        "data_analytics_handoff": {
            "required": True,
            "fixture_route": ["analyze-data-quality"],
            "observed_route": ["analyze-data-quality", "metric-diagnostics", "product-business-analysis", "build-report"],
            "instruction": "先读取 quality 与 evidence，再把 artifact 交给 Data Analytics。质量阻断或 D 级证据不得进入业务归因和配置建议。",
        },
    }
    manifest_path = project / "analysis-manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "ok": manifest["failed_count"] == 0 and manifest["prepared_count"] > 0,
        "manifest": str(manifest_path.resolve()),
        "report_count": len(reports), "prepared_count": manifest["prepared_count"],
        "failed_count": manifest["failed_count"],
    }, ensure_ascii=False))
    return 0 if manifest["failed_count"] == 0 and manifest["prepared_count"] > 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
