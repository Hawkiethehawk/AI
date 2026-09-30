"""批量设置字段备注（description）。

用法: python set_field_descriptions.py descs.json
descs.json 形状: {"字段名": "备注文本", ...}

行为:
  - 逐字段用 +field-get 读全量定义，原样带回 style / options / expression，只改 description；
  - 这三项必须回带，否则字段会降级（URL 列变纯文本、单选丢选项、公式列丢表达式）；
  - formula / lookup 更新要加 --i-have-read-guide；
  - 备注已一致的字段跳过；未在 descs.json 里出现的字段不动。
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


def build_payload(f, desc):
    """按 +field-get 的定义构造 PUT 全量 payload，只替换 description。"""
    p = {"name": f["name"], "type": f["type"], "description": desc}
    t = f["type"]
    if t in ("text", "number"):
        p["style"] = f.get("style", {"type": "plain"})
    elif t == "select":
        p["multiple"] = f.get("multiple", False)
        opts = []
        for o in f.get("options", []):
            d = {"name": o["name"]}
            if o.get("hue"):
                d["hue"] = o["hue"]
            if o.get("lightness"):
                d["lightness"] = o["lightness"]
            opts.append(d)
        p["options"] = opts
    elif t == "formula":
        p["expression"] = f["expression"]
    return p


def main():
    descs = json.load(open(sys.argv[1], encoding="utf-8"))
    fl = run(["base", "+field-list", "--base-token", BASE, "--table-id", TABLE, "--format", "json"])
    if not fl.get("ok"):
        print("field-list failed:", json.dumps(fl, ensure_ascii=False)[:400]); return 1
    ok_n = skip_n = err_n = 0
    for f in fl["data"]["fields"]:
        target = descs.get(f["name"])
        if target is None:
            continue
        if (f.get("description") or "") == target:
            skip_n += 1; continue
        args = ["base", "+field-update", "--base-token", BASE, "--table-id", TABLE,
                "--field-id", f["id"], "--json", json.dumps(build_payload(f, target), ensure_ascii=False), "--yes"]
        if f["type"] in ("formula", "lookup"):
            args.append("--i-have-read-guide")
        r = run(args)
        if r.get("ok"):
            ok_n += 1; print("UPDATED:", f["name"])
        else:
            err_n += 1; print("FAILED:", f["name"], json.dumps(r, ensure_ascii=False)[:260])
    print(f"summary: updated={ok_n} skipped={skip_n} failed={err_n}")
    return 1 if err_n else 0


if __name__ == "__main__":
    sys.exit(main())
