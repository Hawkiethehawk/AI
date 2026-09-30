"""建「推送物料」数据表：字段、分支 JSON 公式、查重公式。

用法: python build_material_table.py
依赖: lark-cli 已登录用户身份；BASE 为物料库 Base token，T 为新建表名。
产出: 同目录 union_tbl.json（记录新表 table_id 与各字段 field_id，供 build_views.py 使用）。
注意: 查重公式按表名引用本表，改表名后必须同步改公式；表名与 BASE 不可在脚本外改名而不同步。
"""
import json, subprocess, time
EXE=r"C:\Users\cy\AppData\Roaming\npm\node_modules\@larksuite\cli\bin\lark-cli.exe"
BASE="<BASE_TOKEN>"; T="推送物料"
def run(a):
    p=subprocess.run([EXE]+a,capture_output=True,text=True,encoding="utf-8")
    out=p.stdout+p.stderr; i=out.find("{")
    try: return json.loads(out[i:]) if i>=0 else {"raw":out[:400]}
    except Exception: return {"raw":out[:400]}
def q(n): return 'CHAR(34) & "'+n+'" & CHAR(34)'
def nv(f): return 'TEXT(['+f+'], "0")'
def qv(f): return 'CHAR(34) & SUBSTITUTE(['+f+'], CHAR(34), CHAR(92) & CHAR(34)) & CHAR(34)'
def jp(k,v): return q(k)+' & ": " & '+v+' & ", " & '
def txt_expr(): return '"{" & '+jp("tempId",'[模板id]')+jp("wgt",nv("wgt"))+jp("content",qv("content"))+jp("btnText",qv("btnText"))+jp("contentId",nv("contentId"))+jp("autoCancel",'[autoCancel]')+jp("ongoing",'[ongoing]')+jp("cx",nv("cx"))+jp("subType",nv("subType"))+jp("cxRate",nv("cxRate"))+jp("lt",nv("lt"))+jp("overlayCx",nv("overlayCx"))+q("overlayCxRate")+' & ": " & '+nv("overlayCxRate")+' & "}"'
def img_expr(): return '"{" & '+jp("tempId",'[模板id]')+jp("wgt",nv("wgt"))+jp("contentId",nv("contentId"))+jp("autoCancel",'[autoCancel]')+jp("ongoing",'[ongoing]')+jp("cx",nv("cx"))+jp("subType",nv("subType"))+jp("cxRate",nv("cxRate"))+jp("lt",nv("lt"))+q("imageList")+' & ": [" & CHAR(34) & [图-小通知] & CHAR(34) & ", " & CHAR(34) & [图-普通通知] & CHAR(34) & ", " & CHAR(34) & [图-大通知] & CHAR(34) & ", " & CHAR(34) & [图-悬浮窗] & CHAR(34) & "]" & ", " & '+jp("overlayCx",nv("overlayCx"))+q("overlayCxRate")+' & ": " & '+nv("overlayCxRate")+' & "}"'
expr_json='IF([模板id] = "906", '+img_expr()+', '+txt_expr()+')'
expr_dup='IF(ISBLANK([contentId]), "", IF(COUNTIF(['+T+'], CurrentValue.[contentId] = [contentId]) > 1, "重复", "唯一"))'

CATS=["清理","PDF","下载器","壁纸","文件恢复"]; LANGS=["EN","KO","JA","PT","ES"]
SCENES=["解锁","定时","后台切换","点击广告切后台","新手流程中断","安装","卸载","充电","电量下降","截图"]
def num(n,d=""):
    o={"type":"number","name":n,"style":{"type":"plain","precision":0}}
    if d:o["description"]=d
    return o
def tx(n,url=False,d=""):
    o={"type":"text","name":n}
    if url:o["style"]={"type":"url"}
    if d:o["description"]=d
    return o
def se(n,opts,d=""):
    o={"type":"select","name":n,"multiple":False,"options":[{"name":x} for x in opts]}
    if d:o["description"]=d
    return o
F=[num("contentId","内容 ID，主键；品类段位+序号"), se("品类",CATS), tx("包名",False,"Android 包名"), se("语言",LANGS),
   se("模板id",["901","902","903","906"],"901/902/903 纯文本；903 无按钮；906 纯图片"), se("场景",SCENES),
   num("wgt"), tx("content",False,"通知主文案，支持富文本标签（906 不使用）"), tx("btnText",False,"按钮文案；903 无按钮、906 不使用"),
   se("autoCancel",["true","false"]), se("ongoing",["true","false"]), num("cx"), num("subType"), num("cxRate"), num("lt"),
   tx("图-小通知",True,"970×160"), tx("图-普通通知",True,"970×265"), tx("图-大通知",True,"970×625"), tx("图-悬浮窗",True,"975×500"),
   num("overlayCx"), num("overlayCxRate"), se("状态",["待写","待审","已上线"]), tx("备注")]
d=run(["base","+table-create","--base-token",BASE,"--name",T,"--fields",json.dumps(F,ensure_ascii=False),"--as","user","--format","json"])
print("create table ok=",d.get("ok"),(d.get("error") or {}).get("message","")[:200])
d2=run(["base","+table-list","--base-token",BASE,"--as","user","--format","json"])
info=[(t["id"],t["name"]) for t in d2["data"]["tables"]]
tid=[i for i,n in info if n==T]
if not tid:
    print("tables:",info); raise SystemExit(1)
tid=tid[0]; print("table_id=",tid)
for nm,expr,desc in (("JSON",expr_json,"本行可直接交付的模板 JSON，按模板id自动切换结构"),("查重",expr_dup,"contentId 全表查重")):
    d=run(["base","+field-create","--base-token",BASE,"--table-id",tid,"--as","user","--format","json","--i-have-read-guide",
           "--json",json.dumps({"type":"formula","name":nm,"expression":expr,"description":desc},ensure_ascii=False)])
    print("formula",nm,"ok=",d.get("ok"),(d.get("error") or {}).get("message","")[:300]); time.sleep(1)
d3=run(["base","+field-list","--base-token",BASE,"--table-id",tid,"--as","user","--format","json"])
json.dump({"tid":tid,"fids":{f["name"]:f["id"] for f in d3["data"]["fields"]}},open('union_tbl.json','w',encoding='utf-8'),ensure_ascii=False)
print("fids ok, 查重=",json.load(open('union_tbl.json'))["fids"].get("查重"))
