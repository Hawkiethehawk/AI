// @ts-check
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(process.env.APPMAGIC_PROJECT_DIR || process.cwd());
const USER_DATA_DIR = path.resolve(PROJECT_DIR, process.env.APPMAGIC_USERDATA_DIR || '.appmagic-userdata');
const SKILL_ROOT = path.resolve(__dirname, '..');

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function rand(min, max) { return Math.random() * (max - min) + min; }
function sleepRandom(minMs, maxMs) { return sleep(rand(minMs, maxMs)); }
function backoffMs(attempt) { return Math.min(10000, 1500 + attempt * 1500); }
function u(...codes) { return String.fromCodePoint(...codes); }
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

const CAT_HYPERCASUAL = u(0x8D85, 0x4F11, 0x95F2);
const CAT_CASUAL = u(0x4F11, 0x95F2);
const CAT_ANTIVIRUS_CLEANER = u(0x6740, 0x6BD2, 0x8F6F, 0x4EF6, 0x3001, 0x6E05, 0x7406);
const CAT_FILE_RECOVERY = u(0x6587, 0x4EF6, 0x6062, 0x590D);
const CAT_PDF_READER = 'PDF' + u(0x9605, 0x8BFB, 0x5668);

const CATS = {
  [CAT_HYPERCASUAL]: '3,126',
  [CAT_CASUAL]: '3,243572',
  Launcher: '9,76,243528',
  [CAT_ANTIVIRUS_CLEANER]: '9,115,119',
  [CAT_FILE_RECOVERY]: '9,115,243477',
  [CAT_PDF_READER]: '9,243756,244699',
};

const WEEKS = process.env.WEEKS
  ? process.env.WEEKS.split(',').map(s => s.trim()).filter(Boolean)
  : buildWeekAnchors(process.env.WEEK_ANCHOR || currentMondayAnchor());

const WEEK_MON = (WEEKS[0] || '').replace(/-/g, '');
const OUT_BASE = path.resolve(PROJECT_DIR, 'output', 'folder', `AppMagic-${WEEK_MON}`);
const OUTPUT_DATA_DIR = OUT_BASE;
fs.mkdirSync(OUTPUT_DATA_DIR, { recursive: true });

const TOP_DEPTH = 1000;
const FORCE_REFRESH = process.env.FORCE_REFRESH === '1';
const RUN_STATE_WRITE_INTERVAL_MS = parseInt(process.env.RUN_STATE_WRITE_INTERVAL_MS || '750', 10);
const PROGRESS_WRITE_INTERVAL_MS = parseInt(process.env.PROGRESS_WRITE_INTERVAL_MS || '750', 10);
const LIST_ONLY = process.env.LIST_ONLY === '1';

const OUT_JSON_OF = cat => path.resolve(OUTPUT_DATA_DIR, `appmagic-${cat}-weekly.json`);
const WEEKLY_CACHE_FILE_OF = cat => path.resolve(OUTPUT_DATA_DIR, `appmagic-weekly-cache-${cat}.json`);
const ENRICH_CACHE_OF = cat => path.resolve(OUTPUT_DATA_DIR, `appmagic-enrich-cache-${cat}.json`);
const RUN_STATE_FILE = path.resolve(OUTPUT_DATA_DIR, 'appmagic-run-state.json');
const PROGRESS_JSON = path.resolve(OUT_BASE, 'appmagic-progress.json');
const TAGS_FULL_PATHS = [
  process.env.APPMAGIC_TAGS_DICT ? path.resolve(PROJECT_DIR, process.env.APPMAGIC_TAGS_DICT) : '',
  path.resolve(PROJECT_DIR, 'output', 'folder', 'appmagic-tags-full.json'),
  path.resolve(SKILL_ROOT, 'references', 'appmagic-tags-full.json'),
].filter(Boolean);

const MATURE_LIST = ['US','JP','GB','DE','FR','KR','CA','AU','NL','SE','CH','NO','DK','FI','IE','AT','BE','SG','HK','TW','NZ','IL'];
const EMERGING_LIST = ['IN','BR','ID','PK','NG','MX','PH','VN','EG','BD','TR','TH','RU','UA','IR','ZA','CO','AR','MY','PE','KE','IQ','MA','DZ','UZ','MM'];
const MATURE = new Set(MATURE_LIST);
const EMERGING = new Set(EMERGING_LIST);

const CAT_ORDER = Object.keys(CATS);
const RUN_T0 = Date.now();
let POOL_SIZE = 0;
let RL_COUNT = 0;
let RUN_STATE_CACHE = null;
let RUN_STATE_DIRTY = false;
let LAST_RUN_STATE_SAVE_AT = 0;
let LAST_PROGRESS_WRITE_AT = 0;
let TAGS_DICT_CACHE = null;
let TAGS_DICT_PATH = '';
let TAGS_DICT_LOGGED = false;

function loadCatCache(cat) {
  if (FORCE_REFRESH) return { complete: false, apps: {} };
  try {
    const c = JSON.parse(fs.readFileSync(ENRICH_CACHE_OF(cat), 'utf-8'));
    return { complete: !!c.complete, apps: c.apps || {} };
  } catch {
    return { complete: false, apps: {} };
  }
}

function saveCatCache(cat, c) {
  try { fs.writeFileSync(ENRICH_CACHE_OF(cat), JSON.stringify(c), 'utf-8'); } catch {}
}

function loadWeeklyCache(cat) {
  if (FORCE_REFRESH) return null;
  try {
    const c = JSON.parse(fs.readFileSync(WEEKLY_CACHE_FILE_OF(cat), 'utf-8'));
    const cur = WEEKS[0];
    if (!c || !c[cur] || !(c[cur].rows && c[cur].rows.length)) return null;
    return c;
  } catch {
    return null;
  }
}

function saveWeeklyCache(cat, c) {
  fs.writeFileSync(WEEKLY_CACHE_FILE_OF(cat), JSON.stringify(c), 'utf-8');
}

function loadRunState() {
  if (RUN_STATE_CACHE) return RUN_STATE_CACHE;
  try {
    RUN_STATE_CACHE = JSON.parse(fs.readFileSync(RUN_STATE_FILE, 'utf-8'));
  } catch {
    RUN_STATE_CACHE = {};
  }
  return RUN_STATE_CACHE;
}

function persistRunState(force = false) {
  if (!RUN_STATE_DIRTY && !force) return true;
  const now = Date.now();
  if (!force && now - LAST_RUN_STATE_SAVE_AT < RUN_STATE_WRITE_INTERVAL_MS) return false;
  try {
    fs.writeFileSync(RUN_STATE_FILE, JSON.stringify(loadRunState(), null, 2), 'utf-8');
    RUN_STATE_DIRTY = false;
    LAST_RUN_STATE_SAVE_AT = now;
    return true;
  } catch {
    return false;
  }
}

function saveRunState(state, force = false) {
  RUN_STATE_CACHE = state;
  RUN_STATE_DIRTY = true;
  persistRunState(force);
}

function readRunMeta(state) {
  return state && typeof state._meta === 'object' && state._meta ? state._meta : {};
}

function updateRunState(cat, patch, force = false) {
  const state = loadRunState();
  state[cat] = { ...(state[cat] || {}), ...patch, updatedAt: new Date().toISOString() };
  saveRunState(state, force);
}

function updateRunMeta(patch, force = false) {
  const state = loadRunState();
  state._meta = { ...readRunMeta(state), ...patch, updatedAt: new Date().toISOString() };
  saveRunState(state, force);
}

function appendRunEvent(level, message, extra = {}, force = false) {
  const state = loadRunState();
  const meta = readRunMeta(state);
  const events = Array.isArray(meta.events) ? meta.events.slice(-24) : [];
  events.push({ at: new Date().toISOString(), level, message, ...extra });
  state._meta = { ...meta, events: events.slice(-25), updatedAt: new Date().toISOString() };
  saveRunState(state, force);
}

function writeProgress(force = false) {
  const state = loadRunState();
  persistRunState(force);
  const now = Date.now();
  if (!force && now - LAST_PROGRESS_WRITE_AT < PROGRESS_WRITE_INTERVAL_MS) return;
  const meta = readRunMeta(state);
  let doneCats = 0;
  let totalFocus = 0;
  let totalFail = 0;
  let activeCats = 0;
  const labels = { wait: 'queued', weekly: 'leaderboard', enrich: 'country enrich', running: 'running', done: 'done', error: 'error' };
  const cats = CAT_ORDER.map(label => {
    const s = state[label] || {};
    const status = s.status || 'wait';
    if (status === 'done') doneCats++;
    if (status !== 'done' && status !== 'wait') activeCats++;
    totalFocus += s.focus_count || 0;
    totalFail += (s.enrich_pending ? s.enrich_pending.length : 0);
    let dur = s.durationMs;
    if (dur == null && s.startedMs) dur = now - s.startedMs;
    const pct = status === 'done'
      ? 100
      : (s.enrich_n ? Math.round((s.enrich_i || 0) * 100 / s.enrich_n) : (status === 'wait' ? 0 : 5));
    return {
      label,
      status,
      lab: labels[status] || status,
      cls: status === 'done' ? 'done' : (status === 'error' ? 'err' : (status === 'wait' ? 'wait' : 'run')),
      curRows: s.curRows,
      focus: s.focus_count,
      pct,
      prog: s.enrich_n ? `${s.enrich_i || 0}/${s.enrich_n}` : (status === 'done' ? 'done' : '--'),
      dur,
      cur: s.cur_app,
      account: s.account || '',
      cache: s.cache || '',
      pending: (s.enrich_pending || []).length,
      done: s.enrich_i || 0,
      todo: s.enrich_n || 0,
      currentWeek: s.currentWeek || '',
      detail: s.detail || '',
      lastError: s.error || '',
      lastUpdate: s.updatedAt || '',
    };
  });
  const data = {
    anchor: WEEKS[0],
    weeks: WEEKS,
    updatedAt: new Date().toISOString(),
    overall: Math.round(doneCats * 100 / CAT_ORDER.length),
    doneCats,
    activeCats,
    total: CAT_ORDER.length,
    totalFocus,
    totalFail,
    totalRows: cats.reduce((sum, r) => sum + (r.curRows || 0), 0),
    poolSize: POOL_SIZE,
    rateLimited: RL_COUNT,
    runElapsed: Date.now() - RUN_T0,
    currentStage: meta.currentStage || 'init',
    stageLabel: meta.stageLabel || '',
    outputDir: OUT_BASE,
    projectDir: PROJECT_DIR,
    forceRefresh: FORCE_REFRESH,
    listOnly: LIST_ONLY,
    queueRemaining: meta.queueRemaining || 0,
    queueTotal: meta.queueTotal || 0,
    leaderboardAccount: meta.leaderboardAccount || '',
    workerAccounts: meta.workerAccounts || [],
    tokenDirs: meta.tokenDirs || [],
    workers: meta.workers || [],
    events: meta.events || [],
    cats,
  };
  try {
    fs.writeFileSync(PROGRESS_JSON, JSON.stringify(data, null, 2), 'utf-8');
    LAST_PROGRESS_WRITE_AT = now;
  } catch {}
}

function resolveTagsDictPath() {
  if (TAGS_DICT_PATH) return TAGS_DICT_PATH;
  TAGS_DICT_PATH = TAGS_FULL_PATHS.find(p => {
    try { return fs.statSync(p).isFile(); } catch { return false; }
  }) || '';
  return TAGS_DICT_PATH;
}

function loadTagsDict() {
  if (TAGS_DICT_CACHE) return TAGS_DICT_CACHE;
  const dictPath = resolveTagsDictPath();
  if (!dictPath) {
    if (!TAGS_DICT_LOGGED) {
      TAGS_DICT_LOGGED = true;
      console.warn('[tags] taxonomy dictionary not found; empty-tag products will keep blank tag path');
      appendRunEvent('warn', 'Tags dictionary not found', { candidates: TAGS_FULL_PATHS.slice() });
    }
    TAGS_DICT_CACHE = new Map();
    return TAGS_DICT_CACHE;
  }
  try {
    const all = JSON.parse(fs.readFileSync(dictPath, 'utf-8'));
    TAGS_DICT_CACHE = new Map(all.map(t => [t.id, t]));
    if (!TAGS_DICT_LOGGED) {
      TAGS_DICT_LOGGED = true;
      console.log(`[tags] loaded taxonomy dictionary: ${dictPath}`);
      appendRunEvent('info', 'Tags dictionary loaded', { file: dictPath, size: TAGS_DICT_CACHE.size });
    }
  } catch (error) {
    TAGS_DICT_CACHE = new Map();
    if (!TAGS_DICT_LOGGED) {
      TAGS_DICT_LOGGED = true;
      console.warn(`[tags] failed to read taxonomy dictionary: ${dictPath}`);
      appendRunEvent('warn', 'Tags dictionary unreadable', { file: dictPath, error: String(error) });
    }
  }
  return TAGS_DICT_CACHE;
}

function fallbackTags(tagStr) {
  const dict = loadTagsDict();
  const ids = tagStr.split(',').map(Number);
  return ids.map(id => {
    const t = dict.get(id);
    return t ? { id: t.id, name: t.name, type: t.type, parent_ids: t.parent_ids || [] } : null;
  }).filter(Boolean);
}

async function fetchWeek(page, date, tag, token) {
  return await page.evaluate(async ({ date, tag, depth, token }) => {
    const url = `/api/v2/top/united-apps?aggregation=week&topDepth=${depth}&store=5&country=WW&date=${date}&tag=${tag}`;
    const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    if (!r.ok) {
      let body = '';
      try { body = (await r.text()).slice(0, 160); } catch {}
      return { err: r.status, body };
    }
    const j = await r.json();
    const rows = [];
    for (const e of (j.data || [])) {
      const f = e.top_free;
      if (!f || !f.application) continue;
      const a = f.application;
      rows.push({
        rank: f.top_free,
        diff: f.diff,
        uid: a.united_application_id,
        name: a.name,
        publisher: a.publisher?.name || '',
        hq: a.publisher?.headquarter || '',
        headcount: a.publisher?.linkedin_headcount,
        release: a.releaseDate || a.last_release_date || '',
        storeIds: a.store_ids || [],
        stores: a.stores || [],
        tags: (a.tags || []).map(t => ({ id: t.id, name: t.name, type: t.type, parent_ids: t.parent_ids })),
      });
    }
    return { date: j.date, rows };
  }, { date, tag, depth: TOP_DEPTH, token });
}

async function probeTopChartToken(page, date, tag, token) {
  return await page.evaluate(async ({ date, tag, token, depth }) => {
    try {
      const r = await fetch(`/api/v2/top/united-apps?aggregation=week&topDepth=${depth}&store=5&country=WW&date=${date}&tag=${tag}`, {
        headers: { Authorization: 'Bearer ' + token },
      });
      let body = '';
      if (!r.ok) {
        try { body = (await r.text()).slice(0, 160); } catch {}
      }
      return { ok: r.ok, status: r.status, body };
    } catch (error) {
      return { ok: false, status: 0, body: String(error) };
    }
  }, { date, tag, token, depth: TOP_DEPTH });
}

async function validateTokenPool(page, pool) {
  const valid = [];
  for (const acc of pool) {
    const probe = await probeTopChartToken(page, WEEKS[0], CATS[CAT_ORDER[0]], acc.token);
    if (probe.ok) {
      valid.push(acc);
      continue;
    }
    console.warn(`  [auth] account ${acc.dir} probe failed (${probe.status || 'network'})`);
    appendRunEvent('warn', 'Account token rejected by API probe', { account: acc.dir, status: probe.status, body: probe.body || '' });
  }
  return valid;
}

async function enrichApp(page, uid, storeIds, skipAppInfo, token) {
  const parse = storeIds.map(s => {
    const i = s.indexOf('_');
    return { store: +s.slice(0, i), appId: s.slice(i + 1) };
  });
  const pref = parse.find(x => x.store === 1) || parse.find(x => x.store === 2) || parse[0];
  return await page.evaluate(async ({ uid, store, appId, skipAppInfo, token }) => {
    const H = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
    const sl = ms => new Promise(resolve => setTimeout(resolve, ms));
    const jsafe = async r => {
      const t = await r.text();
      try { return JSON.parse(t); } catch { return null; }
    };
    const getJSON = async (url, opt, valid, tries = 1) => {
      let transportError = false;
      let rateLimited = false;
      let status = 0;
      for (let i = 0; i < tries; i++) {
        try {
          const r = await fetch(url, opt);
          status = r.status;
          if (r.status === 429) {
            rateLimited = true;
            break;
          }
          const j = await jsafe(r);
          if (j != null && valid(j)) {
            return { data: j, rateLimited: false, transportError: false, status };
          }
        } catch {
          transportError = true;
        }
        if (i < tries - 1) await sl(1000 + i * 800);
      }
      return { data: null, rateLimited, transportError, status };
    };

    let rating = null;
    let reviews = null;
    let contentRating = '';
    let released = '';
    let rateLimited = false;
    let networkError = false;

    if (store && appId && !skipAppInfo) {
      const ai = await getJSON(
        '/api/v2/applications/app-info',
        { method: 'POST', headers: H, body: JSON.stringify({ store, storeApplicationID: appId, country: 'US' }) },
        j => (j.data || j)?.rating !== undefined || (j.data || j)?.name,
        2,
      );
      const d = ai.data?.data || ai.data;
      if (ai.rateLimited) rateLimited = true;
      if (ai.transportError) networkError = true;
      if (d && !d.message) {
        rating = d.rating;
        reviews = d.reviews;
        contentRating = d.content_rating;
        released = d.released;
      }
      await sl(400 + Math.random() * 800);
    }

    let countries = null;
    try {
      const r = await fetch(`/api/v2/united-applications/data-countries?united_application_id=${uid}`, { headers: H });
      if (r.status === 429) {
        rateLimited = true;
      } else {
        let dc = await jsafe(r);
        if (dc && !Array.isArray(dc) && Array.isArray(dc.data)) dc = dc.data;
        if (Array.isArray(dc)) {
          countries = dc
            .map(c => ({
              c: c.Country,
              dlp: c.Last30DaysDownloadsPercent,
              dl: c.Last30DaysDownloads,
              revp: c.Last30DaysRevenuePercent,
              rev: c.Last30DaysRevenue,
            }))
            .filter(c => c.dlp > 0 || c.revp > 0);
        }
      }
    } catch {
      networkError = true;
    }

    return { rating, reviews, contentRating, released, countries, rateLimited, networkError };
  }, { uid, store: pref?.store, appId: pref?.appId, skipAppInfo, token });
}

function summarizeCountries(countries) {
  if (!countries || !countries.length) return null;
  const clean = countries.filter(c => c.c && c.c !== 'WW' && /^[A-Z]{2}$/.test(c.c));
  if (!clean.length) return null;
  const byDl = [...clean].filter(c => c.dlp > 0).sort((a, b) => b.dlp - a.dlp);
  const byRev = [...clean].filter(c => c.revp > 0).sort((a, b) => b.revp - a.revp);
  const pct = n => (n ? n.toFixed(1) : '0') + '%';
  let mature = 0;
  let emerging = 0;
  for (const c of clean) {
    if (MATURE.has(c.c)) mature += c.dlp;
    else if (EMERGING.has(c.c)) emerging += c.dlp;
  }
  const dlList = byDl.map(c => `${c.c} ${pct(c.dlp)}`).join(' / ');
  const revList = byRev.map(c => `${c.c} ${pct(c.revp)}`).join(' / ');
  const market = mature >= emerging
    ? `偏成熟(成熟${pct(mature)}/新兴${pct(emerging)})`
    : `偏新兴(新兴${pct(emerging)}/成熟${pct(mature)})`;
  return { dlList, revList, dlCount: byDl.length, revCount: byRev.length, mature, emerging, market };
}

async function collectTokens() {
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  let dirs = [];
  try { dirs = fs.readdirSync(PROJECT_DIR).filter(d => /^\.appmagic-userdata(-.+)?$/.test(d)); } catch {}
  dirs.sort((a, b) => (a === '.appmagic-userdata' ? -1 : b === '.appmagic-userdata' ? 1 : a.localeCompare(b)));
  const pool = [];
  for (const d of dirs) {
    const full = path.resolve(PROJECT_DIR, d);
    try { if (!fs.statSync(full).isDirectory()) continue; } catch { continue; }
    let ctx;
    try {
      ctx = await chromium.launchPersistentContext(full, {
        headless: true,
        args: ['--disable-blink-features=AutomationControlled'],
        userAgent: UA,
        viewport: { width: 1920, height: 1080 },
      });
      const pg = ctx.pages()[0] || await ctx.newPage();
      await pg.goto('https://appmagic.rocks/top-charts/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(2500);
      const tok = await pg.evaluate(() => (localStorage.getItem('datamagic.token') || '').replace(/^"|"$/g, ''));
      await ctx.close();
      if (tok) {
        pool.push({ dir: d, token: tok });
        console.log(`  [auth] token loaded: ${d}`);
      } else {
        console.log(`  [auth] no token: ${d}`);
      }
    } catch (error) {
      console.log(`  [auth] token read failed: ${d} -> ${error.message}`);
      try { if (ctx) await ctx.close(); } catch {}
    }
  }
  return pool;
}

async function buildCategory(page, cat, tag, leaderTok) {
  const fb = fallbackTags(tag);
  let weekData = loadWeeklyCache(cat);
  const usedCache = !!(weekData && Object.keys(weekData).length);
  if (!usedCache) {
    weekData = {};
    let anyErr = false;
    for (const d of WEEKS) {
      let w = await fetchWeek(page, d, tag, leaderTok);
      for (let att = 0; att < 2 && w.err; att++) {
        await sleep(2000);
        w = await fetchWeek(page, d, tag, leaderTok);
      }
      if (w.err) {
        weekData[d] = { rows: [] };
        anyErr = true;
        console.log(`  [leaderboard] ${cat} ${d} failed: ${w.err}`);
      } else {
        weekData[d] = w;
        console.log(`  [leaderboard] ${cat} ${d}: ${w.rows.length} rows`);
      }
      await sleepRandom(1000, 2500);
    }
    const curEmpty = !(weekData[WEEKS[0]].rows && weekData[WEEKS[0]].rows.length);
    if (!anyErr && !curEmpty) saveWeeklyCache(cat, weekData);
  } else {
    console.log(`  [leaderboard] cache reused: ${cat}`);
  }

  for (const d of WEEKS) {
    for (const row of (weekData[d]?.rows || [])) {
      if (!row.tags || row.tags.length === 0) row.tags = fb;
    }
  }

  const cur = WEEKS[0];
  const prev = WEEKS[1];
  const curRows = weekData[cur].rows;
  const rankMaps = {};
  for (const d of WEEKS) rankMaps[d] = new Map(weekData[d].rows.map(r => [r.uid, r.rank]));

  const records = curRows.map(r => {
    const prevRank = rankMaps[prev].get(r.uid) ?? null;
    const lastWeek = prevRank != null ? prevRank : (r.diff != null ? r.rank + r.diff : null);
    const change = lastWeek != null ? (lastWeek - r.rank) : null;
    const history = WEEKS.map(d => rankMaps[d].get(r.uid) ?? null);
    const inTop50 = history.map(h => h != null && h <= 50);
    let streak50 = 0;
    for (const b of inTop50) {
      if (!b) break;
      streak50++;
    }
    return { ...r, lastWeek, change, history, streak50 };
  });

  const BIG_PUBS = ['voodoo','saygames','supercent','azur','miniclip','rollic','kwalee','homa','habby','lion studios','crazylabs','good job games','bytedance','tencent','outfit7','zynga','playgendary','ketchapp','sybo','gameloft','tap2play','unico','poki','yso','abi global','mattel','popcore','geisha','bestplay','freeplay','aiby'];
  const isBig = p => BIG_PUBS.some(b => (p || '').toLowerCase().includes(b));
  const riseThreshold = rank => {
    if (rank <= 5) return 3;
    if (rank <= 10) return 5;
    if (rank <= 50) return 10;
    if (rank <= 100) return 20;
    if (rank <= 200) return 30;
    return Infinity;
  };

  const focus = records.filter(r => {
    const thr = riseThreshold(r.rank);
    const riser = r.change != null && r.change >= thr;
    const priorTop100 = r.history.slice(1).some(h => h != null && h <= 100);
    const firstInTop100 = r.rank <= 100 && !priorTop100;
    const reasons = [];
    if (r.change != null && r.change > 0 && r.rank > 0) {
      const notePct = (r.change / r.rank) * 100;
      reasons.push(`排名上升${r.change}名（+${notePct.toFixed(0)}%）`);
    }
    if (r.rank <= 10 && r.change != null && r.change >= 5) {
      r._focus = true;
    } else if (r.rank > 10 && r.rank <= 200 && r.change != null && r.rank > 0) {
      const focusPct = r.change / r.rank;
      if (focusPct > 0.5) r._focus = true;
    }
    if (r.rank > 50 && r.rank <= 100 && firstInTop100 && !isBig(r.publisher)) {
      r._pendingNotable = true;
    }
    r._focusReasons = reasons;
    return riser || firstInTop100;
  });

  return { weekData, records, focus, curRows, usedCache };
}

async function enrichOneCat(page, r, acc, catCache, cooldown) {
  const MAX_ATTEMPTS = 6;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let e = null;
    try {
      e = await enrichApp(page, r.uid, r.storeIds, r.rating != null, acc.token);
    } catch {}

    if (!e || e.networkError) {
      if (attempt < MAX_ATTEMPTS - 1) {
        const retryMs = backoffMs(attempt);
        console.log(`  [${acc.dir}] network retry ${r.rank} ${r.name} -> ${Math.round(retryMs / 1000)}s`);
        await sleep(retryMs);
        continue;
      }
      appendRunEvent('warn', `Network retries exhausted on ${acc.dir}`, { account: acc.dir, app: r.name, rank: r.rank });
      return;
    }

    if (e.rating != null) r.rating = e.rating;
    if (e.reviews != null) r.reviews = e.reviews;
    if (e.contentRating) r.contentRating = e.contentRating;
    if (e.released) r.release = e.released;

    if (e.rateLimited) {
      RL_COUNT++;
      appendRunEvent('warn', `429 cooldown on ${acc.dir}`, { account: acc.dir, app: r.name, rank: r.rank, cooldownMs: cooldown });
      console.log(`  [${acc.dir}] 429 cooldown ${r.rank} ${r.name}`);
      const until = Date.now() + cooldown;
      while (Date.now() < until) {
        writeProgress();
        await sleep(Math.min(5000, until - Date.now()));
      }
      continue;
    }

    const cs = summarizeCountries(e.countries);
    if (cs) r.country = cs;
    catCache.apps[r.uid] = {
      rating: r.rating,
      reviews: r.reviews,
      contentRating: r.contentRating,
      release: r.release,
      country: r.country,
    };
    if (r.country) return;
    return;
  }
}

async function enrichWorker(ctx, acc, queue, perCat, cooldown, gap) {
  const page = await ctx.newPage();
  try {
    await page.goto('https://appmagic.rocks/top-charts/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2000);
    while (queue.length) {
      const cat = queue.shift();
      if (cat == null) break;
      const catCache = loadCatCache(cat);
      for (const r of perCat[cat].focus) {
        if (r.country) continue;
        const c = catCache.apps[r.uid];
        if (!c) continue;
        if (c.rating != null) r.rating = c.rating;
        if (c.reviews != null) r.reviews = c.reviews;
        if (c.contentRating) r.contentRating = c.contentRating;
        if (c.release) r.release = c.release;
        if (c.country) r.country = c.country;
      }
      const todo = perCat[cat].focus.filter(r => !r.country);
      updateRunMeta({
        queueRemaining: queue.length,
        workers: readRunMeta(loadRunState()).workers.map(w => w.account === acc.dir
          ? { ...w, status: 'running', category: cat, current: '', updatedAt: new Date().toISOString() }
          : w),
      });
      appendRunEvent('info', `Worker ${acc.dir} picked ${cat}`, { account: acc.dir, category: cat, todo: todo.length });
      updateRunState(cat, {
        status: 'enrich',
        enrich_i: 0,
        enrich_n: todo.length,
        cur_app: `[${acc.dir}]`,
        account: acc.dir,
        detail: `Country enrichment started (${todo.length} focus apps)`,
      });
      writeProgress(true);

      let i = 0;
      for (const r of todo) {
        i++;
        await enrichOneCat(page, r, acc, catCache, cooldown);
        saveCatCache(cat, catCache);
        updateRunMeta({
          workers: readRunMeta(loadRunState()).workers.map(w => w.account === acc.dir
            ? { ...w, status: 'running', category: cat, current: `#${r.rank} ${r.name}`, updatedAt: new Date().toISOString() }
            : w),
        });
        updateRunState(cat, {
          enrich_i: i,
          enrich_n: todo.length,
          cur_app: `#${r.rank} ${r.name} [${acc.dir}]`,
          account: acc.dir,
          detail: `Country enrichment ${i}/${todo.length}`,
        });
        writeProgress();
        await sleep(gap);
      }

      catCache.complete = true;
      saveCatCache(cat, catCache);
      const started = loadRunState()[cat]?.startedMs || RUN_T0;
      updateRunMeta({
        queueRemaining: queue.length,
        workers: readRunMeta(loadRunState()).workers.map(w => w.account === acc.dir
          ? { ...w, status: 'idle', category: '', current: '', updatedAt: new Date().toISOString() }
          : w),
      });
      updateRunState(cat, {
        status: 'done',
        enrich_pending: perCat[cat].focus.filter(x => !x.country).map(x => `#${x.rank}`),
        durationMs: Date.now() - started,
        account: acc.dir,
        detail: `Country enrichment finished (${todo.length} focus apps)`,
      });
      appendRunEvent('info', `Worker ${acc.dir} finished ${cat}`, { account: acc.dir, category: cat, remainingQueue: queue.length });
      writeProgress(true);
    }
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  const cats = Object.keys(CATS);
  saveRunState({
    _meta: {
      startedAt: new Date().toISOString(),
      currentStage: 'init',
      stageLabel: 'Initializing',
      outputDir: OUT_BASE,
      projectDir: PROJECT_DIR,
      forceRefresh: FORCE_REFRESH,
      listOnly: LIST_ONLY,
      queueRemaining: 0,
      queueTotal: 0,
      workerAccounts: [],
      tokenDirs: [],
      workers: [],
      events: [],
    },
  }, true);
  appendRunEvent('info', 'Run initialized', { anchor: WEEKS[0], weeks: WEEKS.length }, true);
  for (const cat of cats) updateRunState(cat, { status: 'wait' });
  writeProgress(true);

  let tokenPool = await collectTokens();
  if (!tokenPool.length) {
    appendRunEvent('error', 'No usable account token found', {}, true);
    for (const cat of cats) updateRunState(cat, { status: 'error', error: 'no token' });
    writeProgress(true);
    console.error('No usable account token found. Please login first.');
    process.exit(2);
  }

  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  const completeCats = new Set();
  const merged = {};
  for (const cat of cats) {
    const cc = loadCatCache(cat);
    if (cc.complete) completeCats.add(cat);
    Object.assign(merged, cc.apps);
  }
  const perCat = {};

  const leadPage = ctx.pages()[0] || await ctx.newPage();
  await leadPage.goto('https://appmagic.rocks/top-charts/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleepRandom(3000, 6000);

  tokenPool = await validateTokenPool(leadPage, tokenPool);
  if (!tokenPool.length) {
    appendRunEvent('error', 'No valid account token survived API probe', {}, true);
    for (const cat of cats) updateRunState(cat, { status: 'error', error: 'invalid token' });
    writeProgress(true);
    await ctx.close();
    console.error('All discovered tokens failed the API probe. Please re-login.');
    process.exit(2);
  }

  POOL_SIZE = tokenPool.length;
  const leaderAccount = tokenPool.find(t => t.dir === '.appmagic-userdata') || tokenPool[0];
  updateRunMeta({
    currentStage: 'leaderboard',
    stageLabel: 'Collecting weekly leaderboards',
    tokenDirs: tokenPool.map(t => t.dir),
    leaderboardAccount: leaderAccount.dir,
  }, true);
  appendRunEvent('info', 'Account token pool ready', { accounts: tokenPool.map(t => t.dir) }, true);
  writeProgress(true);

  const DC_COOLDOWN = parseInt(process.env.DC_COOLDOWN_MS || '120000', 10);
  const DC_GAP = parseInt(process.env.DC_GAP_MS || '1000', 10);
  const leaderTok = leaderAccount.token;

  for (const cat of cats) {
    updateRunMeta({ currentStage: 'leaderboard', stageLabel: `Collecting leaderboard: ${cat}` });
    updateRunState(cat, {
      status: 'weekly',
      startedMs: Date.now(),
      account: 'leaderboard',
      currentWeek: WEEKS[0],
      detail: 'Pulling weekly leaderboard snapshots',
    });
    writeProgress(true);

    const built = await buildCategory(leadPage, cat, CATS[cat], leaderTok);
    perCat[cat] = built;
    let hits = 0;
    for (const r of built.focus) {
      const c = merged[r.uid];
      if (!c) continue;
      if (c.rating != null) r.rating = c.rating;
      if (c.reviews != null) r.reviews = c.reviews;
      if (c.contentRating) r.contentRating = c.contentRating;
      if (c.release) r.release = c.release;
      if (c.country) {
        r.country = c.country;
        hits++;
      }
    }
    updateRunState(cat, {
      curRows: built.curRows.length,
      focus_count: built.focus.length,
      cache: built.usedCache ? 'weekly cache' : 'fresh weekly pull',
      detail: `Rows ${built.curRows.length}, focus ${built.focus.length}, cached enrich hits ${hits}`,
    });
    appendRunEvent('info', `Leaderboard ready for ${cat}`, {
      category: cat,
      rows: built.curRows.length,
      focus: built.focus.length,
      usedCache: built.usedCache,
    });
    if (completeCats.has(cat) || built.focus.every(r => r.country)) {
      updateRunState(cat, {
        status: 'done',
        enrich_pending: built.focus.filter(r => !r.country).map(r => `#${r.rank}`),
        durationMs: Date.now() - (loadRunState()[cat]?.startedMs || RUN_T0),
        detail: completeCats.has(cat) ? 'Reused completed enrich cache' : 'Focus set already fully enriched',
      });
    }
    writeProgress();
  }

  if (!LIST_ONLY) {
    const queue = cats.filter(cat => !completeCats.has(cat) && perCat[cat].focus.some(r => !r.country));
    const workerAccs = tokenPool.slice(0, 3);
    updateRunMeta({
      currentStage: 'enrich',
      stageLabel: 'Enriching country data',
      queueTotal: queue.length,
      queueRemaining: queue.length,
      workerAccounts: workerAccs.map(acc => acc.dir),
      workers: workerAccs.map(acc => ({ account: acc.dir, status: 'idle', category: '', current: '', updatedAt: new Date().toISOString() })),
    }, true);
    appendRunEvent('info', 'Country enrichment queue ready', { queue: queue.slice(), accounts: workerAccs.map(acc => acc.dir) }, true);
    writeProgress(true);
    await Promise.all(workerAccs.map(acc => enrichWorker(ctx, acc, queue, perCat, DC_COOLDOWN, DC_GAP)));
  }

  updateRunMeta({ currentStage: 'export', stageLabel: 'Writing output files', queueRemaining: 0 }, true);
  for (const cat of cats) {
    const { records, focus } = perCat[cat];
    for (const r of focus) {
      if (r._pendingNotable && r.country && r.country.mature >= 25) {
        r._focus = true;
        r._focusReasons.push('潜力新品');
      }
      delete r._pendingNotable;
    }
    fs.writeFileSync(OUT_JSON_OF(cat), JSON.stringify({
      category: { label: cat, tag: CATS[cat] },
      weeks: WEEKS,
      generatedAt: new Date().toISOString(),
      marketDef: { mature: MATURE_LIST, emerging: EMERGING_LIST },
      records,
      focus,
    }, null, 2), 'utf-8');
    const pending = focus.filter(r => !r.country);
    const started = loadRunState()[cat]?.startedMs || RUN_T0;
    updateRunState(cat, {
      status: 'done',
      enrich_done: true,
      enrich_pending: pending.map(r => `#${r.rank}`),
      durationMs: Date.now() - started,
      detail: `Output written (${records.length} rows, ${focus.length} focus, ${pending.length} missing country)`,
    });
  }
  updateRunMeta({ currentStage: 'done', stageLabel: 'Completed', workers: [] }, true);
  appendRunEvent('info', 'Run completed', { outputDir: OUT_BASE }, true);
  writeProgress(true);
  await ctx.close();
}

async function checkAuth() {
  const label = process.env.APPMAGIC_USERDATA_DIR || '.appmagic-userdata';
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  try {
    const page = ctx.pages()[0] || await ctx.newPage();
    await page.goto('https://appmagic.rocks/top-charts/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);
    const token = await page.evaluate(() => (localStorage.getItem('datamagic.token') || '').replace(/^"|"$/g, ''));
    if (!token) {
      console.log(`FAIL ${label}`);
      await ctx.close();
      process.exit(1);
    }
    const probe = await probeTopChartToken(page, WEEKS[0], CATS[CAT_ORDER[0]], token);
    console.log(probe.ok ? `OK ${label}` : `FAIL ${label}`);
    await ctx.close();
    process.exit(probe.ok ? 0 : 1);
  } catch (error) {
    console.error('checkAuth failed:', error.message);
    try { await ctx.close(); } catch {}
    process.exit(1);
  }
}

if (process.env.CHECK_AUTH === '1') {
  checkAuth();
} else if (process.env.PROGRESS_ONLY === '1') {
  writeProgress(true);
  console.log('progress json refreshed:', PROGRESS_JSON);
} else {
  main().catch(error => {
    try {
      for (const c of Object.keys(CATS)) updateRunState(c, { status: 'error', error: String(error) });
    } catch {}
    writeProgress(true);
    console.error('Fatal:', error);
    process.exit(1);
  });
}
