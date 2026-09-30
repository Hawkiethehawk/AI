"""建三个视图：文本 901-903 / 图片 906 / 重复项，并设定筛选与可见列（含列顺序）。

用法: 先跑 build_material_table.py 生成 union_tbl.json，再 python build_views.py
注意: 新增字段只能追加到表尾，列顺序必须用 +view-set-visible-fields 显式设定。
"""
import json, subprocess, time
EXE=r"C:\Users\cy\AppData\Roaming\npm\node_modules\@larksuite\cli\bin\lark-cli.exe"
BASE="<BASE_TOKEN>"; T=json.load(open('union_tbl.json'))['tid']
def run(a):
    p=subprocess.run([EXE]+a,capture_output=True,text=True,encoding="utf-8")
    out=p.stdout+p.stderr; i=out.find("{")
    try: return json.loads(out[i:]) if i>=0 else {"raw":out[:400]}
    except Exception: return {"raw":out[:400]}
V_TXT=["contentId","品类","包名","语言","模板id","场景","JSON","wgt","content","btnText","autoCancel","ongoing","cx","subType","cxRate","lt","overlayCx","overlayCxRate","查重","状态","备注"]
V_IMG=["contentId","品类","包名","语言","模板id","场景","JSON","wgt","autoCancel","ongoing","cx","subType","cxRate","lt","图-小通知","图-普通通知","图-大通知","图-悬浮窗","overlayCx","overlayCxRate","查重","状态","备注"]
ALL=V_TXT+["图-小通知","图-普通通知","图-大通知","图-悬浮窗"]
d=run(["base","+view-list","--base-token",BASE,"--table-id",T,"--as","user","--format","json"])
v0=d["data"]["views"][0]["id"]; print("default view:",v0,d["data"]["views"][0]["name"])
print("rename:",run(["base","+view-rename","--base-token",BASE,"--table-id",T,"--view-id",v0,"--name","文本 901-903","--as","user","--format","json"]).get("ok"))
for nm in ("图片 906","重复项"):
    d=run(["base","+view-create","--base-token",BASE,"--table-id",T,"--as","user","--format","json","--json",json.dumps({"name":nm,"type":"grid"},ensure_ascii=False)])
    print("create view",nm,"ok=",d.get("ok"),(d.get("error") or {}).get("message","")[:150]); time.sleep(1)
d=run(["base","+view-list","--base-token",BASE,"--table-id",T,"--as","user","--format","json"])
views={v["name"]:v["id"] for v in d["data"]["views"]}; print("views:",views)
cfg=[("文本 901-903",{"logic":"or","conditions":[["模板id","==","901"],["模板id","==","902"],["模板id","==","903"]]},V_TXT),
     ("图片 906",{"logic":"and","conditions":[["模板id","==","906"]]},V_IMG),
     ("重复项",{"logic":"and","conditions":[["查重","==","重复"]]},ALL)]
for nm,flt,vis in cfg:
    vid=views[nm]
    r1=run(["base","+view-set-filter","--base-token",BASE,"--table-id",T,"--view-id",vid,"--as","user","--format","json","--json",json.dumps(flt,ensure_ascii=False)])
    time.sleep(1)
    r2=run(["base","+view-set-visible-fields","--base-token",BASE,"--table-id",T,"--view-id",vid,"--as","user","--format","json","--json",json.dumps({"visible_fields":vis},ensure_ascii=False)])
    print(nm,"filter ok=",r1.get("ok"),(r1.get("error") or {}).get("message","")[:120],"| fields ok=",r2.get("ok"),(r2.get("error") or {}).get("message","")[:120])
    time.sleep(1)
json.dump(views,open('views.json','w',encoding='utf-8'),ensure_ascii=False)
