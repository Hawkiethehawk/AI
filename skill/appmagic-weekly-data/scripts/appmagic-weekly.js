// @ts-check
// AppMagic 周报采集（API 直连，带 Bearer token）——单品类样品：超休闲
// 产出：6 周免费榜轨迹 + 本周/上周排名 + 变化量 + Top50 稳定性 + 重点集(国家分布+评分) + 标记
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const PROJECT_DIR = path.resolve(process.env.APPMAGIC_PROJECT_DIR || process.cwd());
const USER_DATA_DIR = path.resolve(PROJECT_DIR, '.appmagic-userdata');
const OUTPUT_DATA_DIR = path.resolve(PROJECT_DIR, 'output/data');
fs.mkdirSync(OUTPUT_DATA_DIR, { recursive: true });
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function rand(min, max) { return Math.random() * (max - min) + min; }
function sleepRandom(minMs, maxMs) { return sleep(rand(minMs, maxMs)); }
function backoffMs(attempt) {
  const plan = [60000, 180000, 300000, 300000, 300000, 300000, 300000, 300000];
  return plan[Math.min(attempt - 1, plan.length - 1)];
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
const TOP_DEPTH = 1000;
const TOP_DEPTH_DETAIL = parseInt(process.env.TOP_DEPTH_DETAIL || '1000', 10);
const OUT_JSON = path.resolve(OUTPUT_DATA_DIR, `appmagic-${CATEGORY.label}-weekly.json`);
// 当天缓存：榜单首页缓存 + 富化缓存 + 运行状态
const TODAY = new Date().toISOString().split('T')[0];
const FORCE_REFRESH = process.env.FORCE_REFRESH === '1';
const CACHE_FILE = path.resolve(OUTPUT_DATA_DIR, `appmagic-enrich-cache-${TODAY}.json`);
const WEEKLY_CACHE_FILE = path.resolve(OUTPUT_DATA_DIR, `appmagic-weekly-cache-${CATEGORY.label}-${TODAY}.json`);
const RUN_STATE_FILE = path.resolve(OUTPUT_DATA_DIR, `appmagic-run-state-${TODAY}.json`);
function loadCache() { if (FORCE_REFRESH) return {}; try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')); } catch { return {}; } }
function saveCache(c) { fs.writeFileSync(CACHE_FILE, JSON.stringify(c), 'utf-8'); }
function loadWeeklyCache() { if (FORCE_REFRESH) return null; try { return JSON.parse(fs.readFileSync(WEEKLY_CACHE_FILE, 'utf-8')); } catch { return null; } }
function saveWeeklyCache(c) { fs.writeFileSync(WEEKLY_CACHE_FILE, JSON.stringify(c), 'utf-8'); }
function loadRunState() { try { return JSON.parse(fs.readFileSync(RUN_STATE_FILE, 'utf-8')); } catch { return {}; } }
function saveRunState(s) { fs.writeFileSync(RUN_STATE_FILE, JSON.stringify(s, null, 2), 'utf-8'); }
function updateRunState(patch) {
  const s = loadRunState();
  s[CATEGORY.label] = { ...(s[CATEGORY.label] || {}), ...patch, updatedAt: new Date().toISOString() };
  saveRunState(s);
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

async function fetchWeek(page, date) {
  return await page.evaluate(async ({ date, tag, depth }) => {
    const tok = (localStorage.getItem('datamagic.token') || '').replace(/^"|"$/g, '');
    const u = `/api/v2/top/united-apps?aggregation=week&topDepth=${depth}&store=5&country=WW&date=${date}&tag=${tag}`;
    const r = await fetch(u, { headers: { Authorization: 'Bearer ' + tok } });
    if (!r.ok) return { err: r.status };
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
  }, { date, tag: CATEGORY.tag, depth: TOP_DEPTH });
}

async function enrichApp(page, uid, storeIds, skipAppInfo = false) {
  // storeIds: ["1_pkg","2_id","3_id"]; 评分优先 GP(1) 再 iOS(2)
  const parse = storeIds.map(s => { const i = s.indexOf('_'); return { store: +s.slice(0, i), appId: s.slice(i + 1) }; });
  const pref = parse.find(x => x.store === 1) || parse.find(x => x.store === 2) || parse[0];
  return await page.evaluate(async ({ uid, store, appId, skipAppInfo }) => {
    const tok = (localStorage.getItem('datamagic.token') || '').replace(/^"|"$/g, '');
    const H = { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' };
    const sl = ms => new Promise(r => setTimeout(r, ms));
    const jsafe = async r => { const t = await r.text(); try { return JSON.parse(t); } catch { return null; } };
    // valid(j) 判定是否"真正成功"，否则退避重试（限流会返回 JSON 错误对象）
    // tries=1 = 单次请求（不内部重试，避免浪费配额；靠轮间冷却恢复）
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
    let countries = null;
    let dc = await getJSON(`/api/v2/united-applications/data-countries?united_application_id=${uid}`, { headers: H },
      j => Array.isArray(j) || Array.isArray(j.data), 1);
    if (dc && !Array.isArray(dc) && Array.isArray(dc.data)) dc = dc.data;
    if (Array.isArray(dc)) {
      countries = dc.map(c => ({ c: c.Country, dlp: c.Last30DaysDownloadsPercent, dl: c.Last30DaysDownloads, revp: c.Last30DaysRevenuePercent, rev: c.Last30DaysRevenue }))
        .filter(c => c.dlp > 0 || c.revp > 0);
    }
    return { rating, reviews, contentRating, released, countries };
  }, { uid, store: pref?.store, appId: pref?.appId, skipAppInfo });
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

async function main() {
  updateRunState({ status: 'running', weekly_done: false, enrich_done: false, xlsx_done: false, output: OUT_JSON });
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true, args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://appmagic.rocks/top-charts/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleepRandom(3000, 6000);

  // 1) 拉 6 周（当天内优先复用首页榜单缓存）
  let weekData = loadWeeklyCache();
  // 预加载回退 tags（空 tags 产品用品类 tag 链补全）
  const fb = fallbackTags(CATEGORY.tag);

  if (weekData && Object.keys(weekData).length) {
    console.log(`♻️ 复用当天首页缓存: ${WEEKLY_CACHE_FILE}`);
    updateRunState({ weekly_done: true, weekly_rows: Object.fromEntries(Object.entries(weekData).map(([k,v]) => [k, (v.rows||[]).length])) });
  } else {
    weekData = {};
    for (const d of WEEKS) {
      const w = await fetchWeek(page, d);
      if (w.err) { console.log(`  ⚠️ ${d} 失败 ${w.err}`); weekData[d] = { rows: [] }; }
      else { console.log(`  ✅ ${d} -> ${w.rows.length} 行 (#1 ${w.rows[0]?.name})`); weekData[d] = w; }
      await sleepRandom(2000, 5000);
    }
    saveWeeklyCache(weekData);
    updateRunState({ weekly_done: true, weekly_rows: Object.fromEntries(Object.entries(weekData).map(([k,v]) => [k, (v.rows||[]).length])) });
  }

  // 对空 tags 产品回退品类 tag 路径
  for (const d of WEEKS) {
    for (const row of (weekData[d]?.rows || [])) {
      if (!row.tags || row.tags.length === 0) row.tags = fb;
    }
  }

  const cur = WEEKS[0], prev = WEEKS[1];
  const curRows = weekData[cur].rows;
  const rankMaps = {}; // date -> uid->rank
  for (const d of WEEKS) { rankMaps[d] = new Map(weekData[d].rows.map(r => [r.uid, r.rank])); }

  // 2) 组装本周记录
  const records = curRows.map(r => {
    const prevRank = rankMaps[prev].get(r.uid) ?? null;
    const lastWeek = prevRank != null ? prevRank : (r.diff != null ? r.rank + r.diff : null);
    const isNew = prevRank == null && (r.diff == null);
    const change = lastWeek != null ? (lastWeek - r.rank) : null; // 正=上升
    const relPct = (lastWeek && lastWeek > 0 && change != null) ? Math.abs(change) / lastWeek : null;
    // 排名轨迹 + Top50 稳定性（按 WEEKS 新→旧）
    const history = WEEKS.map(d => rankMaps[d].get(r.uid) ?? null);
    const inTop50 = history.map(h => h != null && h <= 50);
    let streak50 = 0; for (const b of inTop50) { if (b) streak50++; else break; }
    const weeksOnBoard = history.filter(h => h != null).length;
    return { ...r, url: buildAppUrl(r.name, r.storeIds), lastWeek, isNew, change, relPct, history, streak50, weeksOnBoard };
  });

  // 已知大厂（用于判断"发行商陌生"）
  const BIG_PUBS = ['voodoo','saygames','supercent','azur','miniclip','rollic','kwalee','homa','habby','lion studios','crazylabs','good job games','bytedance','tencent','outfit7','zynga','playgendary','ketchapp','sybo','gameloft','tap2play','unico','poki','yso','abi global','mattel','popcore','geisha','bestplay','freeplay','aiby'];
  const isBig = p => BIG_PUBS.some(b => (p||'').toLowerCase().includes(b));

  // 3) 重点集（按本周排名分档，只看排名上升幅度；外加新品）
  // 前5:↑≥3 | 6-10:↑≥5 | 11-50:↑≥10 | 51-100:↑≥20 | 101-200:↑≥30 | >200:不选
  const riseThreshold = (rank) => {
    if (rank <= 5) return 3;
    if (rank <= 10) return 5;
    if (rank <= 50) return 10;
    if (rank <= 100) return 20;
    if (rank <= 200) return 30;
    return Infinity;
  };
  const focus = records.filter(r => {
    const thr = riseThreshold(r.rank);
    const riser = r.change != null && r.change >= thr;          // 只升，达到分档阈值
    // 首次进前100：本周≤100 且此前各周（history[1..]）从未 ≤100
    const priorTop100 = r.history.slice(1).some(h => h != null && h <= 100);
    const firstInTop100 = r.rank <= 100 && !priorTop100;
    r._flags = [];
    if (firstInTop100) r._flags.push('🆕首进Top100');
    if (riser) r._flags.push(`↑${r.change}（档≥${thr}）`);
    if (firstInTop100 && !isBig(r.publisher)) r._flags.push('发行商陌生');
    r._firstInTop100 = firstInTop100;

    // 备注候选（不论是否重点关注，都按统一格式输出）
    const reasons = [];
    if (r.change != null && r.change > 0 && r.rank > 0) {
      const notePct = (r.change / r.rank) * 100;
      reasons.push(`排名上升${r.change}名（+${notePct.toFixed(0)}%）`);
    }
    // 重点关注标记
    // 维度1：排名变化突出 — 前10标记绝对值↑≥5，10-200标记((上周-本周)/本周)>50%
    if (r.rank <= 10 && r.change != null && r.change >= 5) {
      r._focus = true;
    } else if (r.rank > 10 && r.rank <= 200 && r.change != null && r.rank > 0) {
      const focusPct = r.change / r.rank;
      if (focusPct > 0.5) r._focus = true;
    }
    // 维度2：潜力新品候选 — 首次进Top50-100 + 发行商陌生（成熟市场占比等 enrich 后判定）
    if (r.rank > 50 && r.rank <= 100 && firstInTop100 && !isBig(r.publisher)) {
      r._pendingNotable = true;
    }
    r._focusReasons = reasons;

    return riser || firstInTop100;
  });
  console.log(`\n重点集 ${focus.length} 个（共 ${records.length}），开始 enrich…`);

  // 4) enrich 重点集（持久化缓存 + 自适应限速，规避 data-countries 限流）
  const cache = loadCache();
  let hits = 0;
  for (const r of focus) {
    const c = cache[r.uid];
    if (c) {
      if (c.rating != null) r.rating = c.rating;
      if (c.reviews != null) r.reviews = c.reviews;
      if (c.contentRating) r.contentRating = c.contentRating;
      if (c.release) r.release = c.release;
      if (c.country) { r.country = c.country; hits++; }
    }
  }
  console.log(`\n缓存命中国别 ${hits}/${focus.length}，待补 ${focus.length - hits} 个`);

  // 逐个处理：成功后随机停 2-5s；缺国别按指数退避 60s→180s→300s（之后维持 300s）重试
  const MAXA = parseInt(process.env.MAXA || '8', 10);
  async function enrichOneWithWait(r, i, n) {
    for (let attempt = 1; attempt <= MAXA; attempt++) {
      try {
        const e = await enrichApp(page, r.uid, r.storeIds, r.rating != null); // 已有评分则跳过 app-info，只补国别
        if (e.rating != null) r.rating = e.rating;
        if (e.reviews != null) r.reviews = e.reviews;
        if (e.contentRating) r.contentRating = e.contentRating;
        if (e.released) r.release = e.released;
        const cs = summarizeCountries(e.countries);
        if (cs) r.country = cs;
        cache[r.uid] = { rating: r.rating, reviews: r.reviews, contentRating: r.contentRating, release: r.release, country: r.country };
        saveCache(cache);
      } catch (err) { /* 视为缺国别 */ }
      if (r.country) {
        console.log(`  [${i}/${n}] #${r.rank} ${r.name} | ★${r.rating?.toFixed?.(2)||'-'} | ${r.country.dlCount}国${attempt>1?` (第${attempt}次)`:''}`);
        return true;
      }
      if (attempt < MAXA) {
        const waitMs = backoffMs(attempt);
        console.log(`  [${i}/${n}] #${r.rank} ${r.name} | ⚠️缺国别 → 停 ${Math.round(waitMs/1000)}s 重试(${attempt}/${MAXA})`);
        await sleep(waitMs);
      }
    }
    console.log(`  [${i}/${n}] #${r.rank} ${r.name} | ❌ ${MAXA}次仍缺，跳过`);
    return false;
  }

  // LIST_ONLY=1：只产出清单（榜单+筛选+排序），跳过慢速国别富化
  const LIST_ONLY = process.env.LIST_ONLY === '1';
  if (!LIST_ONLY) {
    const todo = focus.filter(r => !r.country);
    console.log(`\n开始逐个补国别：${todo.length} 个（成功后随机停 2-5s；缺则按 60s→180s→300s 退避重试）`);
    let i = 0;
    for (const r of todo) {
      i++;
      const ok = await enrichOneWithWait(r, i, todo.length);
      if (ok) await sleepRandom(2000, 5000);   // 成功后随机 2-5s 间隔再下一个
    }
    const pending = focus.filter(r => !r.country);
    console.log(`\nenrich 完成，仍缺国别: ${pending.length}（${pending.map(r=>'#'+r.rank).join(' ')}）`);
    updateRunState({ enrich_done: true, focus_count: focus.length, enrich_pending: pending.map(r => `#${r.rank}`) });
  } else {
    console.log(`\n[LIST_ONLY] 仅产出清单，跳过国别富化。重点 ${focus.length} 个`);
  }
  // 潜力新品/成熟市场标记（需国别，放在 enrich 之后统一处理）
  for (const r of focus) {
    if (r._pendingNotable && r.country && r.country.mature >= 25) {
      r._focus = true;
      r._focusReasons.push('潜力新品');
    }
    delete r._pendingNotable;
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify({ category: CATEGORY, weeks: WEEKS, generatedAt: new Date().toISOString(),
    marketDef: { mature: MATURE_LIST, emerging: EMERGING_LIST }, records, focus }, null, 2), 'utf-8');
  updateRunState({ status: 'done', weekly_done: true, enrich_done: true, xlsx_done: false, output: OUT_JSON, records: records.length, focus: focus.length });
  console.log('\n📁', OUT_JSON, '| 全量', records.length, '| 重点', focus.length);
  await ctx.close();
}
main().catch(e => { updateRunState({ status: 'error', error: String(e) }); console.error('Fatal:', e); process.exit(1); });
