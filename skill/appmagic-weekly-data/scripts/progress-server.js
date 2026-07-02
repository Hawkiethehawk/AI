// AppMagic 进度看板本地服务（零依赖，只用 node 内置 http）
// 用法：node scripts/progress-server.js  → 打开 http://localhost:8787
// 前端每 2s fetch /api/progress（读最新 output/folder/AppMagic-*/appmagic-progress.json），
// 局部渲染、无 file:// 的刷新/缓存问题，更新时间实时。采集脚本照常写 progress.json。
const http = require('http');
const fs = require('fs');
const path = require('path');
const PROJECT_DIR = path.resolve(process.env.APPMAGIC_PROJECT_DIR || process.cwd());
const PORT = parseInt(process.env.APPMAGIC_PORT || '8787', 10);

function latestProgressFile() {
  const base = path.resolve(PROJECT_DIR, 'output', 'folder');
  let dirs = [];
  try { dirs = fs.readdirSync(base).filter(d => /^AppMagic-\d+$/.test(d)); } catch { return null; }
  dirs.sort().reverse(); // 最新周锚点在前
  for (const d of dirs) {
    const p = path.join(base, d, 'appmagic-progress.json');
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const PAGE = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>AppMagic 采集进度</title>
<style>body{font-family:system-ui,"Segoe UI",sans-serif;background:#16181c;color:#e6e6e6;margin:0;padding:22px}
.h{display:flex;justify-content:space-between;align-items:baseline}.t{font-size:16px;font-weight:700}.s{font-size:12px;color:#9aa0a6}
.bar{height:14px;border-radius:7px;background:#2a2d31;overflow:hidden;margin:10px 0}.bar>i{display:block;height:100%;width:0;background:#4f8cff;transition:width .3s}
table{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px}th,td{text-align:left;padding:7px 9px;border-bottom:1px solid #33363b}
th{color:#9aa0a6;font-weight:600}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
.done{color:#3fb950}.run{color:#4f8cff}.wait{color:#9aa0a6}.err{color:#f85149}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px}.dot.done{background:#3fb950}.dot.run{background:#4f8cff}.dot.wait{background:#555}.dot.err{background:#f85149}
.mini{display:inline-block;width:90px;height:8px;border-radius:4px;background:#2a2d31;overflow:hidden;vertical-align:middle}.mini>i{display:block;height:100%;background:#4f8cff}.pg{font-size:11px;color:#9aa0a6;margin-left:8px}
.foot{display:flex;gap:20px;margin-top:14px;font-size:12px;color:#9aa0a6}.foot b{color:#e6e6e6}</style></head>
<body>
<div class="h"><div class="t" id="title">AppMagic 采集进度</div><div class="s" id="upd">连接中…</div></div>
<div class="bar"><i id="barfill"></i></div><div class="s" id="ov"></div>
<table><thead><tr><th>品类</th><th>状态</th><th class="n">榜单</th><th class="n">重点</th><th>国别采集</th><th class="n">用时</th></tr></thead><tbody id="tb"></tbody></table>
<div class="foot" id="foot"></div>
<script>
function fmtDur(ms){if(ms==null)return '—';var s=Math.round(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),ss=s%60;return h?h+'h '+m+'m':(m?m+'m '+ss+'s':ss+'s');}
async function tick(){
  try{
    var r=await fetch('/api/progress',{cache:'no-store'}); var d=await r.json();
    if(!d||!d.cats){document.getElementById('upd').textContent='暂无数据（采集尚未开始或无 progress.json）';return;}
    document.getElementById('title').textContent='AppMagic 周报采集 · '+(d.anchor||'');
    var done=d.doneCats===d.total;
    document.getElementById('upd').textContent=(done?'✅ 全部完成':'实时')+' · 数据更新 '+new Date(d.updatedAt).toLocaleTimeString('zh-CN')+' · 本地刷新 '+new Date().toLocaleTimeString('zh-CN');
    var bf=document.getElementById('barfill');bf.style.width=(d.overall||0)+'%';bf.style.background=done?'#3fb950':'#4f8cff';
    document.getElementById('ov').textContent='总体 '+d.doneCats+'/'+d.total+' 品类完成 · '+d.overall+'%';
    document.getElementById('tb').innerHTML=d.cats.map(function(c){
      return '<tr><td><span class="dot '+c.cls+'"></span>'+c.label+'</td><td class="'+c.cls+'">'+c.lab+'</td><td class="n">'+(c.curRows!=null?c.curRows:'—')+'</td><td class="n">'+(c.focus!=null?c.focus:'—')+'</td><td><span class="mini"><i style="width:'+c.pct+'%"></i></span><span class="pg">'+c.prog+'</span></td><td class="n">'+fmtDur(c.dur)+'</td></tr>';
    }).join('');
    document.getElementById('foot').innerHTML='<span>重点合计 <b>'+d.totalFocus+'</b></span><span>待补/失败 <b>'+d.totalFail+'</b></span>';
  }catch(e){document.getElementById('upd').textContent='服务未响应：'+e;}
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
}).listen(PORT, () => console.log(`AppMagic 进度看板: http://localhost:${PORT}  (Ctrl+C 停止)`));
