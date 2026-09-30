"""写物料行：写前查重 → 批量写入 → 读回校验。

用法: python write_materials.py rows.json
rows.json 形状: {"fields": ["contentId","品类",...], "rows": [[10001,"清理",...], ...]}
  - fields 里不要包含 JSON / 查重 两个公式列；903 的 btnText 传 "" 或 null。
  - 未填的列显式传 null（CellValue 规范要求）。

校验顺序（对应 SKILL.md 的第 5 层）:
  1. 行内 contentId 自去重；2. 与 Base 现有 contentId 比对；3. 写入后回读数量与 JSON 合法性。
任一环失败即退出码 1，不写入或明确报告已写入但校验失败。
"""
import json, subprocess, sys, os

EXE = r"C:\Users\cy\AppData\Roaming\npm\node_modules\@larksuite\cli\bin\lark-cli.exe"
BASE = "<BASE_TOKEN>"
TABLE = "<TABLE_ID>"   # 表「推送物料」


def run(args):
    p = subprocess.run([EXE] + args, capture_output=True, text=True, encoding="utf-8")
    out = p.stdout + p.stderr
    i = out.find("{")
    try:
        return json.loads(out[i:]) if i >= 0 else {"raw": out[:400]}
    except Exception:
        return {"raw": out[:400]}


def existing_ids():
    d = run(["base", "+record-list", "--base-token", BASE, "--table-id", TABLE,
             "--as", "user", "--page-size", "200", "--format", "json"])
    dd = d.get("data") or {}
    idx = {n: k for k, n in enumerate(dd.get("fields") or [])}
    rows = dd.get("data") or []
    if dd.get("has_more"):
        sys.exit("现有记录超过一页，先分页读全再写入，避免漏查")
    return {r[idx["contentId"]] for r in rows if idx.get("contentId") is not None and r[idx["contentId"]] is not None}


def main(path):
    payload = json.load(open(path, encoding="utf-8"))
    fields, rows = payload["fields"], payload["rows"]
    if "contentId" not in fields:
        sys.exit("fields 必须包含 contentId")
    ci = fields.index("contentId")
    for bad in ("JSON", "查重"):
        if bad in fields:
            sys.exit(f"{bad} 是公式列，不能写入")
    new_ids = [r[ci] for r in rows]
    if len(new_ids) != len(set(new_ids)):
        dup = sorted({x for x in new_ids if new_ids.count(x) > 1})
        sys.exit(f"待写入内容里有重复 contentId: {dup}")
    old = existing_ids()
    clash = sorted(set(new_ids) & old)
    if clash:
        sys.exit(f"与 Base 现有 contentId 冲突: {clash}")
    print(f"查重通过：{len(rows)} 行，均为新号")

    d = run(["base", "+record-batch-create", "--base-token", BASE, "--table-id", TABLE,
             "--json", "@./" + os.path.basename(path), "--as", "user", "--format", "json"])
    created = len((d.get("data") or {}).get("record_id_list") or [])
    if not d.get("ok") or created != len(rows):
        sys.exit(f"写入失败或数量不符：created={created}, err={json.dumps(d.get('error'), ensure_ascii=False)[:300]}")

    d = run(["base", "+record-list", "--base-token", BASE, "--table-id", TABLE,
             "--as", "user", "--page-size", "200", "--format", "json"])
    dd = d.get("data") or {}
    idx = {n: k for k, n in enumerate(dd.get("fields") or [])}
    got = {r[idx["contentId"]] for r in dd.get("data") or []}
    missing = [x for x in new_ids if x not in got]
    invalid = 0
    for r in dd.get("data") or []:
        if r[idx["contentId"]] in new_ids:
            try:
                json.loads(r[idx["JSON"]])
            except Exception:
                invalid += 1
    print(f"回读校验：写入 {created} 行，缺失 {missing}，JSON 非法 {invalid} 行，表内合计 {len(got)} 行")
    if missing or invalid:
        sys.exit(1)
    print("OK")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("用法: python write_materials.py rows.json")
    main(sys.argv[1])
