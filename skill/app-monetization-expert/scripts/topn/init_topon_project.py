#!/usr/bin/env python3
"""Initialize a persistent local project for iterative TopOn analysis."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path


def safe_project_name(value: str) -> str:
    cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "-", value.strip())
    cleaned = re.sub(r"\s+", "-", cleaned).strip(" .-")
    if not cleaned:
        raise ValueError("Project name is empty after sanitization")
    return cleaned[:80]


def initialize_project(root: Path, project: str) -> tuple[Path, bool]:
    project_dir = root.resolve() / safe_project_name(project)
    for child in ("raw", "derived", "reports", "decisions"):
        (project_dir / child).mkdir(parents=True, exist_ok=True)
    context_path = project_dir / "context.json"
    created = False
    if not context_path.exists():
        now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
        context = {
            "project": project,
            "created_at": now,
            "updated_at": now,
            "apps": [],
            "timezone": "UTC+0",
            "currency": "USD",
            "source_policy": {
                "primary": ["open_api_reporting", "open_api_configuration_reads"],
                "supplemental": ["manual_exports", "user_context"],
                "manual_export_role": "API 缺失维度、抽样对账和异常取证",
            },
            "data_sources": [],
            "business_goals": [],
            "metric_definitions": {},
            "confirmed_events": [],
            "notes": [],
        }
        context_path.write_text(json.dumps(context, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
        created = True
    return project_dir, created


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    default_root = Path.cwd() / "output" / "folder" / "topon-analysis"
    parser.add_argument("project")
    parser.add_argument("--root", type=Path, default=default_root)
    args = parser.parse_args()
    project_dir, context_created = initialize_project(args.root, args.project)
    print(json.dumps({
        "project_dir": str(project_dir),
        "context_created": context_created,
        "existing_context_preserved": not context_created,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
