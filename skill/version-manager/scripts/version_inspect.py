#!/usr/bin/env python3
"""Read-only Git and version-source inspection for version-manager."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


VERSION_RE = re.compile(r"^\d+\.\d+\.\d+$")
SKIP_PARTS = {".git", ".agents", ".claude", "archived", "node_modules", "output", "cache", "__pycache__"}
PROFILE_PATH = Path(__file__).resolve().parent.parent / "references" / "project-profiles.json"


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


def package_version(path: Path) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError) as exc:
        return [{"file": str(path), "error": str(exc)}]
    version = data.get("version")
    if isinstance(version, str) and VERSION_RE.fullmatch(version):
        results.append({"file": str(path), "version": version})
    root_package = data.get("packages", {}).get("") if isinstance(data.get("packages"), dict) else None
    root_version = root_package.get("version") if isinstance(root_package, dict) else None
    if isinstance(root_version, str) and VERSION_RE.fullmatch(root_version) and root_version != version:
        results.append({"file": f"{path}#packages['']", "version": root_version})
    return results


def text_version(path: Path) -> list[dict[str, str]]:
    try:
        value = path.read_text(encoding="utf-8-sig").strip()
    except OSError as exc:
        return [{"file": str(path), "error": str(exc)}]
    return [{"file": str(path), "version": value}] if VERSION_RE.fullmatch(value) else []


def skill_version(path: Path) -> list[dict[str, str]]:
    try:
        lines = path.read_text(encoding="utf-8-sig").splitlines()
    except OSError as exc:
        return [{"file": str(path), "kind": "skill", "error": str(exc)}]
    if not lines or lines[0].strip() != "---":
        return []
    for line in lines[1:]:
        stripped = line.strip()
        if stripped == "---":
            break
        if stripped.startswith("version:"):
            value = stripped.split(":", 1)[1].strip().strip("'\"")
            if VERSION_RE.fullmatch(value):
                return [{"file": str(path), "kind": "skill", "version": value}]
            break
    return []


def readable_path(path: Path, kind: str) -> list[dict[str, str]]:
    if not path.is_file():
        return [{"file": str(path), "error": "configured version source not found"}]
    if path.name in {"package.json", "package-lock.json"}:
        return package_version(path)
    if path.name == "SKILL.md" or kind == "skill":
        return skill_version(path)
    return text_version(path)


def allowed_path(path: Path, base: Path) -> bool:
    parts = path.relative_to(base).parts
    lowered = {part.lower() for part in parts}
    return not (lowered & SKIP_PARTS or any(part.startswith(".") for part in parts))


def configured_versions(base: Path, sources: list[str], kind: str = "project") -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    for source in sources:
        if any(char in source for char in "*?["):
            paths = sorted(base.glob(source))
        else:
            paths = [base / source]
        for path in paths:
            if path.is_file() and not allowed_path(path, base):
                continue
            results.extend(readable_path(path, kind))
    return results


def load_profile(origin: str) -> dict[str, object] | None:
    try:
        data = json.loads(PROFILE_PATH.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"cannot read project profiles: {exc}") from exc
    for profile in data.get("profiles", []):
        if origin in profile.get("origins", []):
            return profile
    return None


def tag_regex(tag_format: str | None, project_name: str) -> re.Pattern[str] | None:
    if not tag_format:
        return None
    escaped = re.escape(tag_format)
    escaped = escaped.replace(re.escape("{project_name}"), re.escape(project_name))
    escaped = escaped.replace(re.escape("{version}"), f"({VERSION_RE.pattern[1:-1]})")
    return re.compile(f"^{escaped}$")


def latest_tag(root: Path, pattern: re.Pattern[str] | None) -> str:
    if not pattern:
        return ""
    tags = git(root, "tag", "--merged", "HEAD", "--sort=-version:refname", check=False).splitlines()
    return next((tag for tag in tags if pattern.fullmatch(tag)), "")


def matches_project(root: Path, project: Path, patterns: list[str]) -> bool:
    relative = project.relative_to(root).as_posix()
    return any(project in root.glob(pattern) for pattern in patterns) and relative != "."


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

    origin = git(root, "config", "--get", "remote.origin.url", check=False)
    try:
        profile = load_profile(origin)
    except RuntimeError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2

    if profile:
        mode = str(profile.get("version_mode", "none"))
        version_sources = [str(item) for item in profile.get("version_sources", [])]
        component_sources = [str(item) for item in profile.get("component_sources", [])]
        skill_projects = [str(item) for item in profile.get("skill_projects", [])]
        is_version_object = mode == "composite" and project == root
        is_version_object = is_version_object or (
            mode == "skill-container"
            and matches_project(root, project, skill_projects)
            and (project / "SKILL.md").is_file()
        )
        object_type = "composite" if mode == "composite" and is_version_object else "skill" if is_version_object else "none"
        project_versions = configured_versions(project, version_sources) if is_version_object else []
        component_versions = configured_versions(root, component_sources, "skill") if project == root else []
        raw_tag_format = profile.get("tag_format")
        tag_format = str(raw_tag_format) if raw_tag_format and is_version_object else None
    else:
        mode = "unconfigured"
        object_type = "none"
        project_versions = []
        component_versions = []
        tag_format = None

    versions = project_versions
    project_values = sorted({item["version"] for item in project_versions if "version" in item})
    sources_valid = not any("error" in item for item in project_versions)
    matching_tag = tag_regex(tag_format, project.name)
    data = {
        "repo": str(root),
        "project": str(project),
        "profile": profile.get("id") if profile else None,
        "version_mode": mode,
        "version_object": object_type,
        "branch": git(root, "branch", "--show-current"),
        "origin": origin,
        "head": git(root, "rev-parse", "HEAD"),
        "tag_format": tag_format,
        "latest_tag": latest_tag(root, matching_tag),
        "status": git(root, "status", "--short").splitlines(),
        "project_versions": project_versions,
        "component_versions": component_versions,
        "versions": versions,
        "project_version_detected": bool(project_values),
        "project_version_sources_valid": sources_valid,
        "project_version_consistent": sources_valid and len(project_values) <= 1,
    }

    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        print(f"repo: {data['repo']}")
        print(f"project: {data['project']}")
        print(f"profile: {data['profile'] or '(unconfigured)'}")
        print(f"version mode: {data['version_mode']}")
        print(f"version object: {data['version_object']}")
        print(f"branch: {data['branch']}")
        print(f"origin: {data['origin'] or '(none)'}")
        print(f"head: {data['head']}")
        print(f"tag format: {data['tag_format'] or '(none)'}")
        print(f"latest matching tag: {data['latest_tag'] or '(none)'}")
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
        print(f"project version sources valid: {data['project_version_sources_valid']}")
        print(f"project version consistent: {data['project_version_consistent']}")
        print("status:")
        for line in data["status"] or ["  (clean)"]:
            print(f"  {line}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
