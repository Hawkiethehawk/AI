// @ts-check
// AppMagic 周报采集（API 直连，带 Bearer token）——单品类样品：超休闲
// 产出：6 周免费榜轨迹 + 本周/上周排名 + 变化量 + Top50 稳定性 + 重点集(国家分布+评分) + 标记
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const PROJECT_DIR = path.resolve(process.env.APPMAGIC_PROJECT_DIR || process.cwd());
const USER_DATA_DIR = path.resolve(PROJECT_DIR, process.env.APPMAGIC_USERDATA_DIR || '.appmagic-userdata');
// 输出目录在 WEEKS(周锚点)确定后按起始日期归档，见下方 OUT_BASE
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function rand(min, max) { return Math.random() * (max - min) + min; }
function sleepRandom(minMs, maxMs) { return sleep(rand(minMs, maxMs)); }
function backoffMs(attempt) {
  return 120000; // 固定 120s 退避（不再指数递增）
}

// ---- 配置 ----
// 6 个品类（顺序即输出顺序）。用 CAT 环境变量选择，默认超休闲
// tag 格式：逗号分隔的多层 tag（domain/父级/子级），API 支持 tag=a,b,c
function u(...codes) { return String.fromCodePoint(...codes); }
const CAT_HYPERCASUAL = u(0x8D85, 0x4F11, 0x95F2);
const CAT_CASUAL = u(0x4F11, 0x95F2);
const CAT_ANTIVIRUS_CLEANER = u(0x6740, 0x6BD2, 0x8F6F, 0x4EF6, 0x3001, 0x6E05, 0x7406);
const CAT_FILE_RECOVERY = u(0x6587, 0x4EF6, 0x6062, 0x590D);
const CAT_PDF_READER = 'PDF' + u(0x9605, 0x8BFB, 0x5668);
const CATS = {
  [CAT_HYPERCASUAL]:      '3,126',        // Games -> Hypercasual
  [CAT_CASUAL]:        '3,243572',     // Games -> Casual
  'Launcher':    '9,76,243528',  // Apps → Personalization → Launcher（三层）
  [CAT_ANTIVIRUS_CLEANER]: '9,115,119',   // Apps -> Tools -> Antivirus & Cleaner
  [CAT_FILE_RECOVERY]:      '9,115,243477', // Apps -> Tools -> Recovery
  [CAT_PDF_READER]:    '9,243756,244699', // Apps -> Productivity -> PDF Reader
};
const CAT_LABEL = process.env.CAT || CAT_HYPERCASUAL;
const CATEGORY = { label: CAT_LABEL, tag: CATS[CAT_LABEL] };
if (!CATEGORY.tag) { console.error('未知品类:', CAT_LABEL); process.exit(1); }
function isoDate(d) { return d.toISOString().slice(0, 10); }
function addDays(yyyyMmDd, days) {
  const d = new Date(`${yyyyMmDd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}
function currentMondayAnchor() {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return isoDate(d);
}
function buildWeekAnchors(anchor, count = 6) {
  return Array.from({ length: count }, (_, i) => addDays(anchor, -7 * i));
}
const WEEKS = process.env.WEEKS
  ? process.env.WEEKS.split(',').map(s => s.trim()).filter(Boolean)
  : buildWeekAnchors(process.env.WEEK_ANCHOR || currentMondayAnchor());
// 每次采集按起始日期建独立文件夹：output/folder/AppMagic-<YYYYMMDD>/，不同周互不覆盖
const WEEK_MON = (WEEKS[0] || '').replace(/-/g, '');
const OUT_BASE = path.resolve(PROJECT_DIR, 'output', 'folder', `AppMagic-${WEEK_MON}`);
const OUTPUT_DATA_DIR = OUT_BASE;
fs.mkdirSync(OUTPUT_DATA_DIR, { recursive: true });
const TOP_DEPTH = 1000;
const TOP_DEPTH_DETAIL = parseInt(process.env.TOP_DEPTH_DETAIL || '1000', 10);
// 输出/缓存路径按品类（node 一次跑全部品类，路径 A）
const OUT_JSON_OF = cat => path.resolve(OUTPUT_DATA_DIR, `appmagic-${cat}-weekly.json`);
const WEEKLY_CACHE_FILE_OF = cat => path.resolve(OUTPUT_DATA_DIR, `appmagic-weekly-cache-${cat}.json`);
const TODAY = new Date().toISOString().split('T')[0];
const FORCE_REFRESH = process.env.FORCE_REFRESH === '1';
const CACHE_FILE = path.resolve(OUTPUT_DATA_DIR, `appmagic-enrich-cache.json`);
const RUN_STATE_FILE = path.resolve(OUTPUT_DATA_DIR, `appmagic-run-state.json`);
function loadCache() { if (FORCE_REFRESH) return {}; try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')); } catch { return {}; } }
function saveCache(c) { try { fs.writeFileSync(CACHE_FILE, JSON.stringify(c), 'utf-8'); } catch {} } // 并发写偶发 Windows EBUSY，吞掉；内存 cache 全量，下次写补上
function loadWeeklyCache(cat) {
  if (FORCE_REFRESH) return null;
  try {
    const c = JSON.parse(fs.readFileSync(WEEKLY_CACHE_FILE_OF(cat), 'utf-8'));
    const cur = WEEKS[0];
    if (!c || !c[cur] || !(c[cur].rows && c[cur].rows.length)) return null; // 坏缓存(本周空)→重拉
    return c;
  } catch { return null; }
}
function saveWeeklyCache(cat, c) { fs.writeFileSync(WEEKLY_CACHE_FILE_OF(cat), JSON.stringify(c), 'utf-8'); }
function loadRunState() { try { return JSON.parse(fs.readFileSync(RUN_STATE_FILE, 'utf-8')); } catch { return {}; } }
function saveRunState(s) { try { fs.writeFileSync(RUN_STATE_FILE, JSON.stringify(s, null, 2), 'utf-8'); } catch {} } // 并发写偶发 EBUSY，吞掉
function updateRunState(cat, patch) {
  const s = loadRunState();
  s[cat] = { ...(s[cat] || {}), ...patch, updatedAt: new Date().toISOString() };
  saveRunState(s);
}

// ---- 实时进度看板：自刷新 HTML（双击 output/appmagic-progress.html 即可实时查看，无需服务/无 CORS）----
const RUN_T0 = Date.now();
const CAT_ORDER = Object.keys(CATS);
const PROGRESS_HTML = path.resolve(OUT_BASE, 'appmagic-progress.html');
const PROGRESS_JSON = path.resolve(OUT_BASE, 'appmagic-progress.json');
function fmtDur(ms) {
  if (ms == null) return '—';
  const s = Math.round(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h ? `${h}h ${m}m` : (m ? `${m}m ${ss}s` : `${ss}s`);
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function writeProgress() {
  const st = loadRunState();
  const now = Date.now();
  let doneCats = 0, totalFocus = 0, totalFail = 0, totalDur = 0, curDur = 0;
  const LAB = { wait: '待采集', weekly: '榜单采集中', enrich: '国别采集中', running: '采集中', done: '完成', error: '出错' };
  const rows = CAT_ORDER.map(label => {
    const s = st[label] || {};
    const status = s.status || 'wait';
    if (status === 'done') doneCats++;
    totalFocus += s.focus_count || 0;
    totalFail += (s.enrich_pending ? s.enrich_pending.length : 0);
    let dur = s.durationMs;
    if (dur == null && s.startedMs) dur = now - s.startedMs;
    if (s.durationMs != null) totalDur += s.durationMs;
    else if (status !== 'wait' && dur != null) curDur = dur;
    const pct = status === 'done' ? 100 : (s.enrich_n ? Math.round((s.enrich_i || 0) * 100 / s.enrich_n) : (status === 'wait' ? 0 : 5));
    const prog = s.enrich_n ? `${s.enrich_i || 0}/${s.enrich_n}` : (status === 'done' ? '完成' : '—');
    const cls = status === 'done' ? 'done' : (status === 'error' ? 'err' : (status === 'wait' ? 'wait' : 'run'));
    return { label, status, lab: LAB[status] || status, cls, curRows: s.curRows, focus: s.focus_count, pct, prog, dur, cur: s.cur_app };
  });
  const overall = Math.round(doneCats * 100 / CAT_ORDER.length);
  const finished = doneCats === CAT_ORDER.length;
  const curRow = rows.find(r => r.status !== 'done' && r.status !== 'wait');
  const data = { anchor: WEEKS[0], updatedAt: new Date().toISOString(), overall, doneCats, total: CAT_ORDER.length, totalFocus, totalFail, cats: rows };
  try { fs.writeFileSync(PROGRESS_JSON, JSON.stringify(data, null, 2), 'utf-8'); } catch {}
  const trs = rows.map(r => `<tr><td><span class="dot ${r.cls}"></span>${esc(r.label)}</td><td class="${r.cls}">${r.lab}</td><td class="n">${r.curRows != null ? r.curRows : '—'}</td><td class="n">${r.focus != null ? r.focus : '—'}</td><td><span class="mini"><i style="width:${r.pct}%"></i></span><span class="pg">${r.prog}</span></td><td class="n">${fmtDur(r.dur)}</td></tr>`).join('');
  const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8">${finished ? '' : '<meta http-equiv="refresh" content="2">'}<title>AppMagic 采集进度 · ${esc(WEEKS[0])}</title>
<style>body{font-family:system-ui,"Segoe UI",sans-serif;background:#16181c;color:#e6e6e6;margin:0;padding:22px}
.h{display:flex;justify-content:space-between;align-items:baseline}.t{font-size:16px;font-weight:700}.s{font-size:12px;color:#9aa0a6}
.bar{height:14px;border-radius:7px;background:#2a2d31;overflow:hidden;margin:10px 0}.bar>i{display:block;height:100%;background:${finished ? '#3fb950' : '#4f8cff'};width:${overall}%}
table{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px}th,td{text-align:left;padding:7px 9px;border-bottom:1px solid #33363b}
th{color:#9aa0a6;font-weight:600}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
.done{color:#3fb950}.run{color:#4f8cff}.wait{color:#9aa0a6}.err{color:#f85149}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px}.dot.done{background:#3fb950}.dot.run{background:#4f8cff}.dot.wait{background:#555}.dot.err{background:#f85149}
.mini{display:inline-block;width:90px;height:8px;border-radius:4px;background:#2a2d31;overflow:hidden;vertical-align:middle}.mini>i{display:block;height:100%;background:#4f8cff}.pg{font-size:11px;color:#9aa0a6;margin-left:8px;font-variant-numeric:tabular-nums}
.foot{display:flex;gap:20px;margin-top:14px;font-size:12px;color:#9aa0a6}.foot b{color:#e6e6e6;font-variant-numeric:tabular-nums}</style></head>
<body><div class="h"><div class="t">AppMagic 周报采集 · ${esc(WEEKS[0])}</div><div class="s">${finished ? '✅ 全部完成' : '每 2 秒自动刷新'} · 更新 ${new Date().toLocaleTimeString('zh-CN')}</div></div>
<div class="bar"><i></i></div><div class="s">总体 ${doneCats}/${CAT_ORDER.length} 品类完成 · ${overall}%</div>
<table><thead><tr><th>品类</th><th>状态</th><th class="n">榜单</th><th class="n">重点</th><th>国别采集</th><th class="n">用时</th></tr></thead><tbody>${trs}</tbody></table>
${curRow && curRow.cur ? `<div class="s" style="margin-top:10px">▶ 当前：<b style="color:#e6e6e6">${esc(curRow.cur)}</b></div>` : ''}
<div class="foot"><span>累计用时 <b>${fmtDur(totalDur + curDur)}</b></span><span>重点合计 <b>${totalFocus}</b></span><span>待补/失败 <b>${totalFail}</b></span></div>
</body></html>`;
  try { fs.writeFileSync(PROGRESS_HTML, html, 'utf-8'); } catch {}
}
// 全量 tag 字典（用于回退补全空 tags 产品的 Tag 路径）
const TAGS_FULL_PATH = path.resolve(OUTPUT_DATA_DIR, 'appmagic-tags-full.json');
let _tagsById = null;
function loadTagsDict() {
  if (_tagsById) return _tagsById;
  try { const all = JSON.parse(fs.readFileSync(TAGS_FULL_PATH, 'utf-8')); _tagsById = new Map(all.map(t => [t.id, t])); }
  catch { _tagsById = new Map(); }
  return _tagsById;
}
// 按品类 tag ID 串（如 '9,115,119'）构建回退 tags 数组
function fallbackTags(tagStr) {
  const dict = loadTagsDict();
  const ids = tagStr.split(',').map(Number);
  return ids.map(id => {
    const t = dict.get(id);
    return t ? { id: t.id, name: t.name, type: t.type, parent_ids: t.parent_ids || [] } : null;
  }).filter(Boolean);
}

// 高 ARPU / 成熟市场 与 新兴市场 国家集（明确定义，随产出落入 Excel 图例）
const MATURE_LIST = ['US','JP','GB','DE','FR','KR','CA','AU','NL','SE','CH','NO','DK','FI','IE','AT','BE','SG','HK','TW','NZ','IL'];
const EMERGING_LIST = ['IN','BR','ID','PK','NG','MX','PH','VN','EG','BD','TR','TH','RU','UA','IR','ZA','CO','AR','MY','PE','KE','IQ','MA','DZ','UZ','MM'];
const MATURE = new Set(MATURE_LIST);
const EMERGING = new Set(EMERGING_LIST);

function buildAppUrl(name, storeIds = []) {
  // 真实商店链接：优先 Google Play(store 1)，无则 App Store(store 2/3)
  const gp = storeIds.find(s => s.startsWith('1_'));
  if (gp) return `https://play.google.com/store/apps/details?id=${gp.slice(2)}`;
  const ios = storeIds.find(s => s.startsWith('2_'));
  if (ios) return `https://apps.apple.com/app/id${ios.slice(2)}`;
  const ipad = storeIds.find(s => s.startsWith('3_'));
  if (ipad) return `https://apps.apple.com/app/id${ipad.slice(2)}`;
  return '';
}

function tagPath(tags = []) {
  const games = tags.filter(t => t.type === 'games');
  const domain = tags.find(t => t.type === 'domain')?.name || (games.length ? 'Games' : (tags.find(t=>t.type==='apps')? 'Apps':''));
  const meta = tags.find(t => t.type === 'meta')?.name || '';
  // 最具体的 games 子类：其 id 不是其他 present games 的 parent
  const ids = new Set(games.map(t => t.id));
  const parentIds = new Set(games.flatMap(t => t.parent_ids || []));
  let leaf = games.filter(t => !games.some(o => (o.parent_ids||[]).includes(t.id)))
                  .sort((a,b)=> (b.parent_ids?.length||0)-(a.parent_ids?.length||0))[0]?.name || '';
  const seq = [];
  for (const x of [domain, meta, leaf]) if (x && !seq.includes(x)) seq.push(x);
  return seq.join(' → ');
}

async function fetchWeek(page, date, tag, token) {
  return await page.evaluate(async ({ date, tag, depth, token }) => {
    const u = `/api/v2/top/united-apps?aggregation=week&topDepth=${depth}&store=5&country=WW&date=${date}&tag=${tag}`;
    const r = await fetch(u, { headers: { Authorization: 'Bearer ' + token } });
    if (!r.ok) { let body = ''; try { body = (await r.text()).slice(0, 160); } catch {} return { err: r.status, body }; }
    const j = await r.json();
    const arr = j.data || [];
    // 只取免费榜
    const rows = [];
    for (const e of arr) {
      const f = e.top_free; if (!f || !f.application) continue;
      const a = f.application;
      rows.push({
        rank: f.top_free, diff: f.diff,
        uid: a.united_application_id, name: a.name,
        publisher: a.publisher?.name || '', hq: a.publisher?.headquarter || '',
        headcount: a.publisher?.linkedin_headcount,
        release: a.releaseDate || a.last_release_date || '',
        storeIds: a.store_ids || [], stores: a.stores || [],
        tags: (a.tags || []).map(t => ({ id: t.id, name: t.name, type: t.type, parent_ids: t.parent_ids })),
      });
    }
    return { date: j.date, rows };
  }, { date, tag, depth: TOP_DEPTH, token });
}

async function enrichApp(page, uid, storeIds, skipAppInfo, token) {
  // storeIds: ["1_pkg","2_id","3_id"]; 评分优先 GP(1) 再 iOS(2)；token 由 Node 侧账号池传入
  const parse = storeIds.map(s => { const i = s.indexOf('_'); return { store: +s.slice(0, i), appId: s.slice(i + 1) }; });
  const pref = parse.find(x => x.store === 1) || parse.find(x => x.store === 2) || parse[0];
  return await page.evaluate(async ({ uid, store, appId, skipAppInfo, token }) => {
    const H = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
    const sl = ms => new Promise(r => setTimeout(r, ms));
    const jsafe = async r => { const t = await r.text(); try { return JSON.parse(t); } catch { return null; } };
    const getJSON = async (url, opt, valid, tries = 1) => {
      for (let i = 0; i < tries; i++) {
        try { const r = await fetch(url, opt); const j = await jsafe(r); if (j != null && valid(j)) return j; } catch {}
        if (i < tries - 1) await sl(1000 + i * 800);
      }
      return null;
    };
    let rating = null, reviews = null, contentRating = '', released = '';
    if (store && appId && !skipAppInfo) {
      const ai = await getJSON('/api/v2/applications/app-info', { method: 'POST', headers: H, body: JSON.stringify({ store, storeApplicationID: appId, country: 'US' }) },
        j => (j.data || j)?.rating !== undefined || (j.data || j)?.name, 2);
      const d = ai?.data || ai;
      if (d && !d.message) { rating = d.rating; reviews = d.reviews; contentRating = d.content_rating; released = d.released; }
      await sl(400 + Math.random() * 800);
    }
    // data-countries：单独 fetch 以捕获 429（限流 → 交给 Node 侧切下一个账号）
    let countries = null, rateLimited = false;
    try {
      const r = await fetch(`/api/v2/united-applications/data-countries?united_application_id=${uid}`, { headers: H });
      if (r.status === 429) rateLimited = true;
      else {
        let dc = await jsafe(r);
        if (dc && !Array.isArray(dc) && Array.isArray(dc.data)) dc = dc.data;
        if (Array.isArray(dc)) {
          countries = dc.map(c => ({ c: c.Country, dlp: c.Last30DaysDownloadsPercent, dl: c.Last30DaysDownloads, revp: c.Last30DaysRevenuePercent, rev: c.Last30DaysRevenue }))
            .filter(c => c.dlp > 0 || c.revp > 0);
        }
      }
    } catch {}
    return { rating, reviews, contentRating, released, countries, rateLimited };
  }, { uid, store: pref?.store, appId: pref?.appId, skipAppInfo, token });
}

function summarizeCountries(countries) {
  if (!countries || !countries.length) return null;
  // 排除汇总行（WW/Other 等非两位国家码）
  countries = countries.filter(c => c.c && c.c !== 'WW' && /^[A-Z]{2}$/.test(c.c));
  if (!countries.length) return null;
  const byDl = [...countries].filter(c => c.dlp > 0).sort((a, b) => b.dlp - a.dlp);
  const byRev = [...countries].filter(c => c.revp > 0).sort((a, b) => b.revp - a.revp);
  const pct = n => (n ? n.toFixed(1) : '0') + '%';
  let usjp = 0, mature = 0, emerging = 0;
  for (const c of countries) {
    if (c.c === 'US' || c.c === 'JP') usjp += c.dlp;
    if (MATURE.has(c.c)) mature += c.dlp; else if (EMERGING.has(c.c)) emerging += c.dlp;
  }
  // 完整列出（除汇总），不截断
  const dlList = byDl.map(c => `${c.c} ${pct(c.dlp)}`).join(' / ');
  const revList = byRev.map(c => `${c.c} ${pct(c.revp)}`).join(' / ');
  const market = mature >= emerging ? `偏成熟(成熟${pct(mature)}/新兴${pct(emerging)})` : `偏新兴(新兴${pct(emerging)}/成熟${pct(mature)})`;
  return { dlList, revList, dlCount: byDl.length, revCount: byRev.length, usjpPct: usjp, mature, emerging, market };
}

// 多账号 token 池：扫描 .appmagic-userdata / -b / -c … 逐个读出 token（data-countries 撞 429 切账号，扩配额，规避单账号 ~100 次/窗口限流）
async function collectTokens() {
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  let dirs = [];
  try { dirs = fs.readdirSync(PROJECT_DIR).filter(d => /^\.appmagic-userdata(-.+)?$/.test(d)); } catch {}
  dirs.sort((a, b) => (a === '.appmagic-userdata' ? -1 : b === '.appmagic-userdata' ? 1 : a.localeCompare(b)));
  const pool = [];
  for (const d of dirs) {
    const full = path.resolve(PROJECT_DIR, d);
    try { if (!fs.statSync(full).isDirectory()) continue; } catch { continue; }
    let c;
    try {
      c = await chromium.launchPersistentContext(full, { headless: true, args: ['--disable-blink-features=AutomationControlled'], userAgent: UA, viewport: { width: 1920, height: 1080 } });
      const pg = c.pages()[0] || await c.newPage();
      await pg.goto('https://appmagic.rocks/top-charts/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(2500);
      const tok = await pg.evaluate(() => (localStorage.getItem('datamagic.token') || '').replace(/^"|"$/g, ''));
      await c.close();
      if (tok) { pool.push({ dir: d, token: tok, cooldownUntil: 0 }); console.log(`  ✅ 账号 ${d} token 就绪`); }
      else console.log(`  ⚠️ 账号 ${d} 无 token（未登录）`);
    } catch (e) { console.log(`  ⚠️ 账号 ${d} 读取失败: ${e.message}`); try { if (c) await c.close(); } catch {} }
  }
  return pool;
}

// ===== 路径 A：一个进程跑全部品类。榜单用 A 账号；国别 3 账号并行领品类（一品类一账号，不重复）=====
async function main() {
  const cats = Object.keys(CATS);
  for (const cat of cats) updateRunState(cat, { status: 'wait' });
  writeProgress();
  const tokenPool = await collectTokens();
  if (!tokenPool.length) { console.error('无可用账号 token，请先登录（node scripts/appmagic-login.js）'); for (const cat of cats) updateRunState(cat, { status: 'error', error: 'no token' }); process.exit(2); }
  console.log(`账号 token 池：${tokenPool.length} 个 [${tokenPool.map(t => t.dir).join(', ')}]`);
  const DC_COOLDOWN = parseInt(process.env.DC_COOLDOWN_MS || '120000', 10);
  const DC_GAP = parseInt(process.env.DC_GAP_MS || '1000', 10); // 国别采集每个 app 间隔（任务1：默认 1s）
  const leaderTok = (tokenPool.find(t => t.dir === '.appmagic-userdata') || tokenPool[0]).token; // 榜单固定用 A

  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true, args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const cache = loadCache();
  const perCat = {};

  // ===== 阶段1：榜单(A) + 组装 records/focus（串行，量小）=====
  const leadPage = ctx.pages()[0] || await ctx.newPage();
  await leadPage.goto('https://appmagic.rocks/top-charts/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleepRandom(3000, 6000);
  for (const cat of cats) {
    updateRunState(cat, { status: 'weekly', startedMs: Date.now() }); writeProgress();
    const built = await buildCategory(leadPage, cat, CATS[cat], leaderTok);
    perCat[cat] = built;
    let hits = 0;
    for (const r of built.focus) {
      const c = cache[r.uid];
      if (c) {
        if (c.rating != null) r.rating = c.rating;
        if (c.reviews != null) r.reviews = c.reviews;
        if (c.contentRating) r.contentRating = c.contentRating;
        if (c.release) r.release = c.release;
        if (c.country) { r.country = c.country; hits++; }
      }
    }
    updateRunState(cat, { curRows: built.curRows.length, focus_count: built.focus.length }); writeProgress();
    console.log(`  [${cat}] 榜单完成 记录${built.records.length} 重点${built.focus.length} 缓存命中国别${hits}`);
  }

  // ===== 阶段2：国别采集，3 账号并行领品类（一品类只由一个账号采）=====
  const LIST_ONLY = process.env.LIST_ONLY === '1';
  if (!LIST_ONLY) {
    const queue = cats.filter(cat => perCat[cat].focus.some(r => !r.country));
    const workerAccs = tokenPool.slice(0, 3);
    console.log(`\n国别采集：${queue.length} 个品类待采，${workerAccs.length} 账号并行（间隔 ${DC_GAP}ms）`);
    await Promise.all(workerAccs.map(acc => enrichWorker(ctx, acc, queue, perCat, cache, DC_COOLDOWN, DC_GAP)));
  }

  // ===== 阶段3：潜力新品标记 + 写各品类 JSON =====
  for (const cat of cats) {
    const { records, focus } = perCat[cat];
    for (const r of focus) { if (r._pendingNotable && r.country && r.country.mature >= 25) { r._focus = true; r._focusReasons.push('潜力新品'); } delete r._pendingNotable; }
    fs.writeFileSync(OUT_JSON_OF(cat), JSON.stringify({ category: { label: cat, tag: CATS[cat] }, weeks: WEEKS, generatedAt: new Date().toISOString(), marketDef: { mature: MATURE_LIST, emerging: EMERGING_LIST }, records, focus }, null, 2), 'utf-8');
    const pending = focus.filter(r => !r.country);
    const started = loadRunState()[cat]?.startedMs || RUN_T0;
    updateRunState(cat, { status: 'done', enrich_done: true, enrich_pending: pending.map(r => `#${r.rank}`), durationMs: Date.now() - started });
    console.log(`📁 ${OUT_JSON_OF(cat)} | 记录${records.length} 重点${focus.length} 缺国别${pending.length}`);
  }
  writeProgress();
  await ctx.close();
}

// 采一个品类的榜单 6 周 + 组装 records/focus（榜单用 leaderTok=A）
async function buildCategory(page, cat, tag, leaderTok) {
  const fb = fallbackTags(tag);
  let weekData = loadWeeklyCache(cat);
  if (weekData && Object.keys(weekData).length) {
    console.log(`  ♻️ [${cat}] 复用榜单缓存`);
  } else {
    weekData = {}; let anyErr = false;
    for (const d of WEEKS) {
      let w = await fetchWeek(page, d, tag, leaderTok);
      for (let att = 0; att < 2 && w.err; att++) { await sleep(2000); w = await fetchWeek(page, d, tag, leaderTok); } // 榜单偶发失败重试
      if (w.err) { const hint = w.err === 429 ? ' (限流)' : (w.err === 400 && /max limit/i.test(w.body || '') ? ' (未认证/topDepth 超限)' : (w.err === 401 ? ' (登录失效)' : '')); console.log(`  ⚠️ [${cat}] ${d} 失败 ${w.err}${hint} ${w.body || ''}`); weekData[d] = { rows: [] }; anyErr = true; }
      else { console.log(`  ✅ [${cat}] ${d} -> ${w.rows.length} 行`); weekData[d] = w; }
      await sleepRandom(1000, 2500);
    }
    const curEmpty = !(weekData[WEEKS[0]].rows && weekData[WEEKS[0]].rows.length);
    if (anyErr || curEmpty) console.log(`  ⚠️ [${cat}] 有失败/空周，不写缓存`);
    else saveWeeklyCache(cat, weekData);
  }
  for (const d of WEEKS) for (const row of (weekData[d]?.rows || [])) if (!row.tags || row.tags.length === 0) row.tags = fb;

  const cur = WEEKS[0], prev = WEEKS[1];
  const curRows = weekData[cur].rows;
  const rankMaps = {};
  for (const d of WEEKS) rankMaps[d] = new Map(weekData[d].rows.map(r => [r.uid, r.rank]));
  const records = curRows.map(r => {
    const prevRank = rankMaps[prev].get(r.uid) ?? null;
    const lastWeek = prevRank != null ? prevRank : (r.diff != null ? r.rank + r.diff : null);
    const isNew = prevRank == null && (r.diff == null);
    const change = lastWeek != null ? (lastWeek - r.rank) : null;
    const relPct = (lastWeek && lastWeek > 0 && change != null) ? Math.abs(change) / lastWeek : null;
    const history = WEEKS.map(d => rankMaps[d].get(r.uid) ?? null);
    const inTop50 = history.map(h => h != null && h <= 50);
    let streak50 = 0; for (const b of inTop50) { if (b) streak50++; else break; }
    const weeksOnBoard = history.filter(h => h != null).length;
    return { ...r, url: buildAppUrl(r.name, r.storeIds), lastWeek, isNew, change, relPct, history, streak50, weeksOnBoard };
  });
  const BIG_PUBS = ['voodoo','saygames','supercent','azur','miniclip','rollic','kwalee','homa','habby','lion studios','crazylabs','good job games','bytedance','tencent','outfit7','zynga','playgendary','ketchapp','sybo','gameloft','tap2play','unico','poki','yso','abi global','mattel','popcore','geisha','bestplay','freeplay','aiby'];
  const isBig = p => BIG_PUBS.some(b => (p || '').toLowerCase().includes(b));
  const riseThreshold = (rank) => { if (rank <= 5) return 3; if (rank <= 10) return 5; if (rank <= 50) return 10; if (rank <= 100) return 20; if (rank <= 200) return 30; return Infinity; };
  const focus = records.filter(r => {
    const thr = riseThreshold(r.rank);
    const riser = r.change != null && r.change >= thr;
    const priorTop100 = r.history.slice(1).some(h => h != null && h <= 100);
    const firstInTop100 = r.rank <= 100 && !priorTop100;
    r._flags = [];
    if (firstInTop100) r._flags.push('🆕首进Top100');
    if (riser) r._flags.push(`↑${r.change}（档≥${thr}）`);
    if (firstInTop100 && !isBig(r.publisher)) r._flags.push('发行商陌生');
    r._firstInTop100 = firstInTop100;
    const reasons = [];
    if (r.change != null && r.change > 0 && r.rank > 0) { const notePct = (r.change / r.rank) * 100; reasons.push(`排名上升${r.change}名（+${notePct.toFixed(0)}%）`); }
    if (r.rank <= 10 && r.change != null && r.change >= 5) { r._focus = true; }
    else if (r.rank > 10 && r.rank <= 200 && r.change != null && r.rank > 0) { const focusPct = r.change / r.rank; if (focusPct > 0.5) r._focus = true; }
    if (r.rank > 50 && r.rank <= 100 && firstInTop100 && !isBig(r.publisher)) { r._pendingNotable = true; }
    r._focusReasons = reasons;
    return riser || firstInTop100;
  });
  return { weekData, records, focus, curRows };
}

// 国别采集 worker：从品类队列动态领取品类，用本账号(acc)采该品类所有重点 app 的国别
async function enrichWorker(ctx, acc, queue, perCat, cache, cooldown, gap) {
  const page = await ctx.newPage();
  try {
    await page.goto('https://appmagic.rocks/top-charts/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2000);
    while (queue.length) {
      const cat = queue.shift();
      if (cat == null) break;
      const todo = perCat[cat].focus.filter(r => !r.country);
      console.log(`  [${acc.dir}] 领取品类 ${cat}：待采 ${todo.length}`);
      updateRunState(cat, { status: 'enrich', enrich_i: 0, enrich_n: todo.length, cur_app: `[${acc.dir}]` }); writeProgress();
      let i = 0;
      for (const r of todo) {
        i++;
        await enrichOneCat(page, r, acc, cache, cooldown);
        updateRunState(cat, { enrich_i: i, enrich_n: todo.length, cur_app: `#${r.rank} ${r.name} [${acc.dir}]` }); writeProgress();
        await sleep(gap);
      }
      const started = loadRunState()[cat]?.startedMs || RUN_T0;
      updateRunState(cat, { status: 'done', enrich_pending: perCat[cat].focus.filter(x => !x.country).map(x => `#${x.rank}`), durationMs: Date.now() - started });
      writeProgress();
      console.log(`  [${acc.dir}] 品类 ${cat} 采集完成`);
    }
  } finally { await page.close().catch(() => {}); }
}

// 采单个 app 国别：固定账号 acc；撞 429 等待冷却后重试（品类归属固定，不切账号）
async function enrichOneCat(page, r, acc, cache, cooldown) {
  const MAXA = 6;
  for (let a = 0; a < MAXA; a++) {
    let e = null;
    try { e = await enrichApp(page, r.uid, r.storeIds, r.rating != null, acc.token); } catch { }
    if (e) {
      if (e.rating != null) r.rating = e.rating;
      if (e.reviews != null) r.reviews = e.reviews;
      if (e.contentRating) r.contentRating = e.contentRating;
      if (e.released) r.release = e.released;
      if (e.rateLimited) {
        console.log(`  [${acc.dir}] #${r.rank} ${r.name} 429 → 等 ${Math.round(cooldown / 1000)}s`);
        const until = Date.now() + cooldown;
        while (Date.now() < until) { writeProgress(); await sleep(Math.min(5000, until - Date.now())); } // 冷却期每5s刷看板，避免假死
        continue;
      }
      const cs = summarizeCountries(e.countries);
      if (cs) r.country = cs;
      cache[r.uid] = { rating: r.rating, reviews: r.reviews, contentRating: r.contentRating, release: r.release, country: r.country };
      saveCache(cache);
    }
    if (r.country) { console.log(`  [${acc.dir}] #${r.rank} ${r.name} | ★${r.rating?.toFixed?.(2) || '-'} | ${r.country.dlCount}国`); return; }
    if (e && !e.rateLimited) return; // 无国别数据
  }
}
// 登录态自检：headless 探测 topDepth=1000 是否 200（能识别未登录/已过期），供 ps1 编排调用
// 检查单个 profile(由 APPMAGIC_USERDATA_DIR 指定)的登录态；供 ps1 逐账号自检+补登
async function checkAuth() {
  const label = process.env.APPMAGIC_USERDATA_DIR || '.appmagic-userdata';
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true, args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  try {
    const page = ctx.pages()[0] || await ctx.newPage();
    await page.goto('https://appmagic.rocks/top-charts/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);
    const ok = await page.evaluate(async ({ date, tag }) => {
      const tok = (localStorage.getItem('datamagic.token') || '').replace(/^"|"$/g, '');
      if (!tok) return false;
      try { const r = await fetch(`/api/v2/top/united-apps?aggregation=week&topDepth=1000&store=5&country=WW&date=${date}&tag=${tag}`, { headers: { Authorization: 'Bearer ' + tok } }); return r.ok; } catch { return false; }
    }, { date: WEEKS[0], tag: Object.values(CATS)[0] });
    console.log(ok ? `✅ ${label} 登录态有效` : `❌ ${label} 未登录/已过期`);
    await ctx.close();
    process.exit(ok ? 0 : 1);
  } catch (e) { console.error('checkAuth 失败:', e.message); try { await ctx.close(); } catch {} process.exit(1); }
}

if (process.env.CHECK_AUTH === '1') {
  checkAuth();
} else if (process.env.PROGRESS_ONLY === '1') {
  // 只按当前 run-state 刷新进度看板并退出（不采集），可用于随时重绘 output/appmagic-progress.html
  writeProgress();
  console.log('progress.html refreshed:', PROGRESS_HTML);
} else {
  main().catch(e => { try { for (const c of Object.keys(CATS)) updateRunState(c, { status: 'error', error: String(e) }); } catch {} writeProgress(); console.error('Fatal:', e); process.exit(1); });
}
