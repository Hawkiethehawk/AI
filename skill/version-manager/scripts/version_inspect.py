#!/usr/bin/env python3
"""Read-only Git and version-source inspection for version-manager."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


VERSION_RE = re.compile(r"^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$")
SKIP_PARTS = {".git", ".agents", ".claude", "archived", "node_modules", "output", "cache", "__pycache__"}


def git(repo: Path, *args: str, check: bool = True) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), *args],
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if check and result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "git command failed")
    return result.stdout.strip()


def package_versions(project: Path) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    for name in ("package.json", "package-lock.json"):
        path = project / name
        if not path.is_file():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8-sig"))
        except (OSError, json.JSONDecodeError) as exc:
            results.append({"file": str(path), "error": str(exc)})
            continue
        version = data.get("version")
        if isinstance(version, str):
            results.append({"file": str(path), "version": version})
        root_package = data.get("packages", {}).get("") if isinstance(data.get("packages"), dict) else None
        root_version = root_package.get("version") if isinstance(root_package, dict) else None
        if isinstance(root_version, str) and root_version != version:
            results.append({"file": f"{path}#packages['']", "version": root_version})
    return results


def text_versions(project: Path) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    for name in ("VERSION", "VERSION.txt"):
        path = project / name
        if not path.is_file():
            continue
        value = path.read_text(encoding="utf-8-sig").strip()
        if VERSION_RE.fullmatch(value):
            results.append({"file": str(path), "version": value})
    return results


def skill_versions(project: Path) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    for path in project.rglob("SKILL.md"):
        parts = path.relative_to(project).parts
        relative_parts = {part.lower() for part in parts}
        if relative_parts & SKIP_PARTS or any(part.startswith(".") for part in parts):
            continue
        try:
            lines = path.read_text(encoding="utf-8-sig").splitlines()
        except OSError as exc:
            results.append({"file": str(path), "kind": "skill", "error": str(exc)})
            continue
        if not lines or lines[0].strip() != "---":
            continue
        for line in lines[1:]:
            stripped = line.strip()
            if stripped == "---":
                break
            if stripped.startswith("version:"):
                value = stripped.split(":", 1)[1].strip().strip("'\"")
                if VERSION_RE.fullmatch(value):
                    results.append({"file": str(path), "kind": "skill", "version": value})
                break
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect a Git repository without modifying it.")
    parser.add_argument("--repo", required=True, help="Git repository or a path inside it")
    parser.add_argument("--project", default=".", help="Project path relative to the repository root")
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    args = parser.parse_args()

    requested = Path(args.repo).expanduser().resolve()
    try:
        root = Path(git(requested, "rev-parse", "--show-toplevel")).resolve()
    except RuntimeError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2

    project = (root / args.project).resolve()
    try:
        project.relative_to(root)
    except ValueError:
        print("error: project must stay inside repository root", file=sys.stderr)
        return 2
    if not project.is_dir():
        print(f"error: project directory not found: {project}", file=sys.stderr)
        return 2

    project_versions = package_versions(project) + text_versions(project)
    component_versions = skill_versions(project)
    versions = project_versions + component_versions
    project_values = sorted({item["version"] for item in project_versions if "version" in item})
    data = {
        "repo": str(root),
        "project": str(project),
        "branch": git(root, "branch", "--show-current"),
        "origin": git(root, "config", "--get", "remote.origin.url", check=False),
        "head": git(root, "rev-parse", "HEAD"),
        "latest_tag": git(root, "describe", "--tags", "--abbrev=0", check=False),
        "status": git(root, "status", "--short").splitlines(),
        "project_versions": project_versions,
        "component_versions": component_versions,
        "versions": versions,
        "project_version_detected": bool(project_values),
        "project_version_consistent": len(project_values) <= 1,
    }

    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        print(f"repo: {data['repo']}")
        print(f"project: {data['project']}")
        print(f"branch: {data['branch']}")
        print(f"origin: {data['origin'] or '(none)'}")
        print(f"head: {data['head']}")
        print(f"latest tag: {data['latest_tag'] or '(none)'}")
        print("project versions:")
        if project_versions:
            for item in project_versions:
                print(f"  {item.get('file')}: {item.get('version', 'ERROR: ' + item.get('error', 'unknown'))}")
        else:
            print("  (none detected)")
        print("component versions:")
        if component_versions:
            for item in component_versions:
                print(f"  {item.get('file')}: {item.get('version', 'ERROR: ' + item.get('error', 'unknown'))}")
        else:
            print("  (none detected)")
        print(f"project version detected: {data['project_version_detected']}")
        print(f"project version consistent: {data['project_version_consistent']}")
        print("status:")
        for line in data["status"] or ["  (clean)"]:
            print(f"  {line}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
