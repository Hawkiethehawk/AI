"""把某个字段插到每个视图可见列的锚点字段之后。

用法: python insert_field_in_views.py <新字段名> <锚点字段名>
例:   python insert_field_in_views.py 应用项目编号 品类

背景: 新增字段只能追加到表尾，且会自动出现在所有视图可见列的末尾；
     列顺序与显示由 +view-set-visible-fields 的 visible_fields 同时控制（必须列全要保留的列）。
幂等: 新字段已在锚点之后则跳过；否则先摘掉再插到锚点后。
"""
import json, subprocess, sys

EXE = r"C:\Users\cy\AppData\Roaming\npm\node_modules\@larksuite\cli\bin\lark-cli.exe"
BASE = "<BASE_TOKEN>"
TABLE = "<TABLE_ID>"   # 表「推送物料」


def run(args):
    p = subprocess.run([EXE] + args, capture_output=True, text=True, encoding="utf-8", errors="replace")
    out = (p.stdout or "") + (p.stderr or "")
    i = out.find("{")
    try:
        return json.loads(out[i:]) if i >= 0 else {"ok": False, "raw": out[:400]}
    except Exception:
        return {"ok": False, "raw": out[:400]}


def main():
    new, anchor = sys.argv[1], sys.argv[2]
    vl = run(["base", "+view-list", "--base-token", BASE, "--table-id", TABLE, "--format", "json"])
    if not vl.get("ok"):
        print("view-list failed:", json.dumps(vl, ensure_ascii=False)[:400]); return 1
    for v in vl["data"]["views"]:
        vid, vname = v["id"], v["name"]          # 注意键名是 id / name
        g = run(["base", "+view-get-visible-fields", "--base-token", BASE, "--table-id", TABLE,
                 "--view-id", vid, "--format", "json"])
        if not g.get("ok"):
            print("get failed:", vname, json.dumps(g, ensure_ascii=False)[:300]); continue
        data = g["data"]
        items = data.get("visible_fields") or data.get("fields") or []
        names = [x if isinstance(x, str) else (x.get("field_name") or x.get("name")) for x in items]
        if anchor not in names:
            print("anchor missing in", vname, "->", names); continue
        if new in names and names.index(new) == names.index(anchor) + 1:
            print("skip (already correct):", vname); continue
        names = [n for n in names if n != new]
        i = names.index(anchor)
        new_names = names[:i+1] + [new] + names[i+1:]
        r = run(["base", "+view-set-visible-fields", "--base-token", BASE, "--table-id", TABLE,
                 "--view-id", vid, "--json", json.dumps({"visible_fields": new_names}, ensure_ascii=False)])
        print(("set ok: " if r.get("ok") else "set FAILED: ") + vname)
        if r.get("ok"):
            print("   ", " → ".join(new_names))
    return 0


if __name__ == "__main__":
    sys.exit(main())
