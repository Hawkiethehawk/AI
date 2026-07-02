// AppMagic 进度看板本地服务（零依赖，只用 node 内置 http）
// 用法：node scripts/progress-server.js  → 自动打开 http://localhost:8787
// 前端每 2s fetch /api/progress（读最近修改的 output/folder/AppMagic-*/appmagic-progress.json），
// 局部渲染、无 file:// 刷新/缓存问题；打开即“最近一次采集”。APPMAGIC_NO_OPEN=1 关闭自动开浏览器。
const http = require('http');
const fs = require('fs');
const path = require('path');
const PROJECT_DIR = path.resolve(process.env.APPMAGIC_PROJECT_DIR || process.cwd());
const PORT = parseInt(process.env.APPMAGIC_PORT || '8787', 10);

function latestProgressFile() {
  const base = path.resolve(PROJECT_DIR, 'output', 'folder');
  let dirs = [];
  try { dirs = fs.readdirSync(base).filter(d => /^AppMagic-\d+$/.test(d)); } catch { return null; }
  let best = null, bestT = -1; // 取最近修改的 = 当前/最近一次采集的那一周
  for (const d of dirs) {
    const p = path.join(base, d, 'appmagic-progress.json');
    try { const t = fs.statSync(p).mtimeMs; if (t > bestT) { bestT = t; best = p; } } catch {}
  }
  return best;
}

const PAGE = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AppMagic 采集进度</title>
<style>
:root{--bg:#0d1117;--card:#161b22;--bd:#30363d;--tx:#e6edf3;--mut:#8b949e;--blue:#4f8cff;--green:#3fb950;--red:#f85149;--amber:#e3b341}
*{box-sizing:border-box}body{font-family:system-ui,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--tx);margin:0;padding:22px 26px;max-width:1100px}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px}
.title{font-size:19px;font-weight:700;display:flex;align-items:center;gap:10px}
.pill{font-size:12px;font-weight:600;background:#1b2330;color:var(--blue);padding:3px 11px;border-radius:999px;border:1px solid var(--bd)}
.meta{font-size:12px;color:var(--mut);text-align:right;line-height:1.7}
.mainbar{height:14px;border-radius:8px;background:#21262d;overflow:hidden;margin:4px 0 6px}.mainbar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,#4f8cff,#6ee7ff);transition:width .4s}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(115px,1fr));gap:12px;margin:14px 0 18px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:12px 14px}
.card .k{font-size:11px;color:var(--mut);margin-bottom:5px;letter-spacing:.02em}.card .v{font-size:23px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1}
.card .v small{font-size:13px;color:var(--mut);font-weight:500}
table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;background:var(--card);border:1px solid var(--bd);border-radius:12px;overflow:hidden}
th,td{text-align:left;padding:10px 13px;border-bottom:1px solid var(--bd)}tr:last-child td{border-bottom:none}
th{color:var(--mut);font-weight:600;font-size:12px;background:#12161c}
tbody tr:hover td{background:#1c2230}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
.badge{display:inline-block;font-size:11px;font-weight:600;padding:2px 10px;border-radius:999px;white-space:nowrap}
.b-done{background:rgba(63,185,80,.16);color:var(--green)}.b-run{background:rgba(79,140,255,.16);color:var(--blue)}.b-wait{background:#21262d;color:var(--mut)}.b-err{background:rgba(248,81,73,.16);color:var(--red)}
.mini{display:inline-block;width:120px;height:7px;border-radius:4px;background:#21262d;overflow:hidden;vertical-align:middle}.mini>i{display:block;height:100%;background:linear-gradient(90deg,#4f8cff,#6ee7ff)}
.pg{font-size:11px;color:var(--mut);margin-left:8px;font-variant-numeric:tabular-nums}
.cur{font-size:11.5px;color:var(--mut);max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:7px;vertical-align:middle}
.d-done{background:var(--green)}.d-run{background:var(--blue);box-shadow:0 0 0 3px rgba(79,140,255,.22)}.d-wait{background:#484f58}.d-err{background:var(--red)}
.foot{margin-top:14px;font-size:12px;color:var(--mut);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}
</style></head>
<body>
<div class="top">
  <div class="title">📊 AppMagic 周报采集 <span class="pill" id="anchor">—</span></div>
  <div class="meta"><div id="status">连接中…</div><div id="times"></div></div>
</div>
<div class="mainbar"><i id="mainbar"></i></div>
<div id="ovtext" class="meta" style="text-align:left"></div>
<div class="cards" id="cards"></div>
<table><thead><tr><th>品类</th><th>状态</th><th class="n">榜单</th><th class="n">重点</th><th>国别采集</th><th>当前 app / 账号</th><th class="n">用时</th></tr></thead><tbody id="tb"></tbody></table>
<div class="foot"><span id="foot"></span><span>每 2 秒实时刷新 · 本地服务</span></div>
<script>
function fmtDur(ms){if(ms==null)return'—';var s=Math.round(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),ss=s%60;return h?h+'h'+m+'m':(m?m+'m'+ss+'s':ss+'s')}
function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function card(k,v){return '<div class="card"><div class="k">'+k+'</div><div class="v">'+v+'</div></div>'}
async function tick(){
 try{
  var r=await fetch('/api/progress',{cache:'no-store'});var d=await r.json();
  if(!d||!d.cats){document.getElementById('status').textContent='暂无数据（尚未开始采集）';return}
  var done=d.doneCats===d.total;
  document.getElementById('anchor').textContent=d.anchor||'—';
  document.getElementById('status').innerHTML=done?'<span class="badge b-done">✅ 全部完成</span>':'<span class="badge b-run">● 采集中</span>';
  document.getElementById('times').textContent='数据 '+new Date(d.updatedAt).toLocaleTimeString('zh-CN')+' · 刷新 '+new Date().toLocaleTimeString('zh-CN')+(d.runElapsed!=null?' · 已运行 '+fmtDur(d.runElapsed):'');
  var mb=document.getElementById('mainbar');mb.style.width=(d.overall||0)+'%';mb.style.background=done?'linear-gradient(90deg,#3fb950,#56d364)':'linear-gradient(90deg,#4f8cff,#6ee7ff)';
  document.getElementById('ovtext').textContent='总体 '+d.doneCats+'/'+d.total+' 品类完成 · '+d.overall+'%';
  var cov=d.totalFocus?d.totalFocus-d.totalFail:0;var covp=d.totalFocus?Math.round(cov*100/d.totalFocus):0;
  document.getElementById('cards').innerHTML=[
   card('总进度',(d.overall||0)+'<small>%</small>'),
   card('完成品类',d.doneCats+'<small>/'+d.total+'</small>'),
   card('重点合计',d.totalFocus!=null?d.totalFocus:'—'),
   card('国别覆盖',cov+'<small>/'+d.totalFocus+' · '+covp+'%</small>'),
   card('待补/失败',d.totalFail!=null?d.totalFail:'—'),
   card('榜单行数',d.totalRows!=null?d.totalRows:'—'),
   card('限流 429',d.rateLimited!=null?d.rateLimited:'—'),
   card('账号',d.poolSize!=null?d.poolSize:'—')
  ].join('');
  document.getElementById('tb').innerHTML=d.cats.map(function(c){
   var dcls=c.cls==='done'?'d-done':c.cls==='err'?'d-err':c.cls==='wait'?'d-wait':'d-run';
   var bcls=c.cls==='done'?'b-done':c.cls==='err'?'b-err':c.cls==='wait'?'b-wait':'b-run';
   var cur=(c.cur&&c.status!=='done'&&c.status!=='wait')?esc(c.cur):'—';
   return '<tr><td><span class="dot '+dcls+'"></span>'+esc(c.label)+'</td>'+
    '<td><span class="badge '+bcls+'">'+esc(c.lab)+'</span></td>'+
    '<td class="n">'+(c.curRows!=null?c.curRows:'—')+'</td>'+
    '<td class="n">'+(c.focus!=null?c.focus:'—')+'</td>'+
    '<td><span class="mini"><i style="width:'+(c.pct||0)+'%"></i></span><span class="pg">'+esc(c.prog)+'</span></td>'+
    '<td class="cur" title="'+cur+'">'+cur+'</td>'+
    '<td class="n">'+fmtDur(c.dur)+'</td></tr>';
  }).join('');
  document.getElementById('foot').textContent='周锚点 '+(d.anchor||'')+' · 共 '+d.total+' 品类';
 }catch(e){document.getElementById('status').textContent='服务未响应'}
}
tick();setInterval(tick,2000);
</script></body></html>`;

http.createServer((req, res) => {
  if (req.url && req.url.startsWith('/api/progress')) {
    const p = latestProgressFile();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(p ? fs.readFileSync(p, 'utf-8') : '{}');
  } else {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(PAGE);
  }
}).listen(PORT, () => {
  console.log(`AppMagic 进度看板: http://localhost:${PORT}  (Ctrl+C 停止)`);
  if (process.env.APPMAGIC_NO_OPEN !== '1') {
    const url = `http://localhost:${PORT}`;
    const cp = require('child_process');
    try {
      if (process.platform === 'win32') cp.exec(`start "" "${url}"`);
      else if (process.platform === 'darwin') cp.exec(`open "${url}"`);
      else cp.exec(`xdg-open "${url}"`);
    } catch {}
  }
});
