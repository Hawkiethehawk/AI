// AppMagic 本地实时看板 — localhost only, SSE 推送, 全屏自适应
// 主题：霓虹驾驶舱（theme-factory 自定义：Tech Innovation 电光蓝 #0066ff/霓虹青 #00ffff + Midnight Galaxy 紫 #2b1e3e/#4a4e8f 渐变底）
// 字体：中文 微软雅黑，英文/数字 Times New Roman
const http = require('http');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const PROJECT_DIR = path.resolve(process.env.APPMAGIC_PROJECT_DIR || process.cwd());
const PORT = parseInt(process.env.APPMAGIC_PORT || '8787', 10);
const AUTO_OPEN = process.env.APPMAGIC_NO_OPEN !== '1';
const POLL_MS = 1000;

// ---------- 数据层 ----------

function listRunDirs() {
  const base = path.resolve(PROJECT_DIR, 'output', 'folder');
  try {
    return fs.readdirSync(base)
      .filter(d => /^AppMagic-\d+$/.test(d))
      .map(d => path.join(base, d));
  } catch {
    return [];
  }
}

function latestRunDir() {
  let best = null;
  let bestTime = -1;
  for (const dir of listRunDirs()) {
    let t = -1;
    try { t = fs.statSync(path.join(dir, 'appmagic-progress.json')).mtimeMs; } catch {}
    if (t < 0) {
      try { t = fs.statSync(dir).mtimeMs; } catch { continue; }
    }
    if (t > bestTime) { bestTime = t; best = dir; }
  }
  return best;
}

function readJsonSafe(file) {
  try {
    const raw = fs.readFileSync(file, 'utf-8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readProgress(runDir) {
  if (!runDir) return null;
  return readJsonSafe(path.join(runDir, 'appmagic-progress.json'));
}

function storeUrl(storeIds) {
  for (const s of (storeIds || [])) {
    const i = s.indexOf('_');
    const store = +s.slice(0, i);
    const id = s.slice(i + 1);
    if (store === 1) return 'https://play.google.com/store/apps/details?id=' + id;
    if (store === 2) return 'https://apps.apple.com/app/id' + id;
  }
  return '';
}

function dlTop(country, n) {
  if (!country || !country.dlList) return '';
  return country.dlList.split(' / ').slice(0, n).join(' / ');
}

// 结果摘要缓存：按文件 mtime 失效
const resultCache = new Map(); // key -> { mtime, digest }
function isFirstInTop100Trajectory(rank, history) {
  return rank <= 100
    && Array.isArray(history)
    && history.length >= 4
    && history.slice(-3).every(h => h == null)
    && history.slice(1).every(h => h == null || h > 100);
}

function focusEntry(r, country, extra) {
  return {
    rank: r.rank,
    name: r.name,
    publisher: r.publisher,
    hq: r.hq || '',
    change: r.change,
    lastWeek: r.lastWeek,
    history: r.history || [],
    streak50: r.streak50 || 0,
    rating: r.rating,
    reviews: r.reviews,
    release: r.release || '',
    market: country ? country.market : '',
    dlTop: dlTop(country, 3),
    url: r.url || storeUrl(r.storeIds),
    ...extra,
  };
}

// 最终产物摘要（跑完后的权威数据）
function digestCategory(file, runDirName) {
  let mtime = 0;
  try { mtime = fs.statSync(file).mtimeMs; } catch { return null; }
  const hit = resultCache.get(file);
  if (hit && hit.mtime === mtime) return hit.digest;

  const data = readJsonSafe(file);
  if (!data || !data.category) return null;
  const records = data.records || [];
  const focus = (data.focus || []).map(r => {
    const history = r.history || [];
    return focusEntry(r, r.country, {
      reasons: r._focusReasons || [],
      firstInTop100: isFirstInTop100Trajectory(r.rank, history),
    });
  });
  const digest = {
    category: data.category.label,
    weeks: data.weeks || [],
    generatedAt: data.generatedAt || '',
    runDir: runDirName,
    live: false,
    records: records.length,
    focusCount: focus.length,
    newTop100: focus.filter(f => f.firstInTop100).length,
    enriched: focus.filter(f => f.market).length,
    focus,
  };
  resultCache.set(file, { mtime, digest });
  return digest;
}

// 实时摘要：最终 JSON 未落盘时，用榜单缓存 + 采集缓存现算焦点集（与 scraper 同判定逻辑）
function liveDigest(runDir, cat, runDirName) {
  const wcFile = path.join(runDir, 'appmagic-weekly-cache-' + cat + '.json');
  const enFile = path.join(runDir, 'appmagic-enrich-cache-' + cat + '.json');
  let wcM = 0;
  let enM = 0;
  try { wcM = fs.statSync(wcFile).mtimeMs; } catch { return null; }
  try { enM = fs.statSync(enFile).mtimeMs; } catch {}
  const key = wcFile + '|live';
  const hit = resultCache.get(key);
  if (hit && hit.mtime === wcM + enM) return hit.digest;

  const wc = readJsonSafe(wcFile);
  if (!wc) return null;
  const weeks = Object.keys(wc).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort().reverse();
  if (!weeks.length) return null;
  const rankMaps = {};
  for (const d of weeks) rankMaps[d] = new Map(((wc[d] || {}).rows || []).map(r => [r.uid, r.rank]));
  const curRows = (wc[weeks[0]] || {}).rows || [];
  const enrichApps = (readJsonSafe(enFile) || {}).apps || {};
  const riseThreshold = rank => (rank <= 5 ? 3 : rank <= 10 ? 5 : rank <= 50 ? 10 : rank <= 100 ? 20 : rank <= 200 ? 30 : Infinity);

  const focus = [];
  for (const r of curRows) {
    const prevMap = rankMaps[weeks[1]];
    const prevRank = prevMap ? (prevMap.get(r.uid) ?? null) : null;
    const lastWeek = prevRank != null ? prevRank : (r.diff != null ? r.rank + r.diff : null);
    const change = lastWeek != null ? lastWeek - r.rank : null;
    const history = weeks.map(d => rankMaps[d].get(r.uid) ?? null);
    const firstInTop100 = isFirstInTop100Trajectory(r.rank, history);
    const riser = change != null && change >= riseThreshold(r.rank);
    if (!riser && !firstInTop100) continue;
    let streak50 = 0;
    for (const h of history) {
      if (!(h != null && h <= 50)) break;
      streak50++;
    }
    const e = enrichApps[r.uid] || {};
    const reasons = [];
    if (change != null && change > 0 && r.rank > 0) {
      reasons.push('排名上升' + change + '名（+' + ((change / r.rank) * 100).toFixed(0) + '%）');
    }
    focus.push(focusEntry(
      { ...r, change, lastWeek, history, streak50, rating: e.rating, reviews: e.reviews, release: e.release || r.release },
      e.country,
      { reasons, firstInTop100 },
    ));
  }
  const digest = {
    category: cat,
    weeks,
    generatedAt: '',
    runDir: runDirName,
    live: true,
    records: curRows.length,
    focusCount: focus.length,
    newTop100: focus.filter(f => f.firstInTop100).length,
    enriched: focus.filter(f => f.market).length,
    focus,
  };
  resultCache.set(key, { mtime: wcM + enM, digest });
  return digest;
}

function readResults(runDir) {
  if (!runDir) return { categories: [], risers: [], marketSplit: null };
  const runDirName = path.basename(runDir);
  let names = [];
  try { names = fs.readdirSync(runDir); } catch {}

  const finalOf = {};
  for (const f of names) {
    const m = /^appmagic-(.+)-weekly\.json$/.exec(f);
    if (m && !f.includes('cache')) finalOf[m[1]] = path.join(runDir, f);
  }
  const cacheCats = [];
  for (const f of names) {
    const m = /^appmagic-weekly-cache-(.+)\.json$/.exec(f);
    if (m) cacheCats.push(m[1]);
  }
  const cats = [...new Set([...Object.keys(finalOf), ...cacheCats])];

  const categories = cats
    .map(cat => (finalOf[cat] ? digestCategory(finalOf[cat], runDirName) : liveDigest(runDir, cat, runDirName)))
    .filter(Boolean);

  const risers = [];
  let matureN = 0;
  let emergingN = 0;
  let unknownN = 0;
  for (const cat of categories) {
    for (const f of cat.focus) {
      if (f.change != null && f.change > 0) risers.push({ ...f, category: cat.category });
      if (!f.market) unknownN++;
      else if (f.market.startsWith('偏成熟')) matureN++;
      else emergingN++;
    }
  }
  risers.sort((a, b) => (b.change || 0) - (a.change || 0));
  return {
    categories,
    risers: risers.slice(0, 15),
    marketSplit: { mature: matureN, emerging: emergingN, unknown: unknownN },
  };
}

function snapshot() {
  const runDir = latestRunDir();
  return {
    at: new Date().toISOString(),
    runDir: runDir ? path.basename(runDir) : null,
    progress: readProgress(runDir),
    results: readResults(runDir),
  };
}

// ---------- SSE ----------

const clients = new Set();
let lastSig = '';

function signature() {
  const runDir = latestRunDir();
  if (!runDir) return 'none';
  const parts = [runDir];
  try {
    for (const f of fs.readdirSync(runDir)) {
      if (/^appmagic-.*\.json$/.test(f)) {
        try { parts.push(f, fs.statSync(path.join(runDir, f)).mtimeMs); } catch {}
      }
    }
  } catch {}
  return parts.join('|');
}

function broadcast() {
  if (!clients.size) return;
  const payload = 'data: ' + JSON.stringify(snapshot()) + '\n\n';
  for (const res of clients) {
    try { res.write(payload); } catch {}
  }
}

setInterval(() => {
  const sig = signature();
  if (sig !== lastSig) {
    lastSig = sig;
    broadcast();
  }
}, POLL_MS);

// SSE 心跳，防代理/浏览器断流
setInterval(() => {
  for (const res of clients) {
    try { res.write(': ping\n\n'); } catch {}
  }
}, 15000);

// ---------- HTTP ----------

function json(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

// ---------- Account pool management ----------

const DEFAULT_ACCOUNT_PROFILES = ['.appmagic-userdata', '.appmagic-userdata-b', '.appmagic-userdata-c'];
const TOKEN_CACHE_NAME = 'appmagic-token.json';
const accountStatus = new Map(); // profile -> { state, checkedAt, detail, output }
const loginJobs = new Map(); // profile -> { state, pid, startedAt, finishedAt, exitCode }
let authCheckAll = null;
let runJob = null;

function isSafeProfile(profile) {
  return /^\.appmagic-userdata(?:-[A-Za-z0-9_-]+)?$/.test(profile || '');
}

function profilePath(profile) {
  if (!isSafeProfile(profile)) throw new Error('invalid profile');
  return path.resolve(PROJECT_DIR, profile);
}

function profileExists(profile) {
  try { return fs.statSync(profilePath(profile)).isDirectory(); } catch { return false; }
}

function profileSortValue(profile) {
  if (profile === '.appmagic-userdata') return 0;
  const m = /^\.appmagic-userdata-([A-Za-z0-9_-]+)$/.exec(profile);
  if (!m) return 999;
  const first = m[1].slice(0, 1).toLowerCase();
  if (first >= 'b' && first <= 'z') return first.charCodeAt(0) - 'a';
  return 100 + first.charCodeAt(0);
}

function accountLabel(profile) {
  if (profile === '.appmagic-userdata') return 'A';
  const m = /^\.appmagic-userdata-([A-Za-z0-9_-]+)$/.exec(profile);
  return m ? m[1].slice(0, 1).toUpperCase() : '?';
}

function listAccountProfiles() {
  return DEFAULT_ACCOUNT_PROFILES.slice();
}

function normalizeEmail(email) {
  const m = String(email || '').toLowerCase();
  for (const suffix of ['.com', '.cn', '.net', '.org']) {
    const idx = m.indexOf(suffix);
    if (idx >= 0) return m.slice(0, idx + suffix.length);
  }
  return m;
}

function findProfileEmail(profile) {
  if (!profileExists(profile)) return { email: '', emailStatus: 'MISSING' };
  const root = profilePath(profile);
  const counts = new Map();
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let items = [];
    try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const item of items) {
      const file = path.join(dir, item.name);
      if (item.isDirectory()) {
        stack.push(file);
        continue;
      }
      if (!item.isFile()) continue;
      let st;
      try { st = fs.statSync(file); } catch { continue; }
      if (st.size > 20 * 1024 * 1024) continue;
      try {
        const buf = fs.readFileSync(file);
        const texts = [buf.toString('utf8'), buf.toString('utf16le')];
        for (const text of texts) {
          const matches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,24}/gi) || [];
          for (const raw of matches) {
            const email = normalizeEmail(raw);
            if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|cn|net|org)$/.test(email)) continue;
            if (/example|google|gstatic|sentry|schema|appmagic/.test(email)) continue;
            counts.set(email, (counts.get(email) || 0) + 1);
          }
        }
      } catch {}
    }
  }
  if (!counts.size) return { email: '', emailStatus: 'UNKNOWN' };
  const best = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
  return { email: best[0], emailStatus: 'OK' };
}

function readTokenMeta(profile) {
  try {
    const file = path.join(profilePath(profile), TOKEN_CACHE_NAME);
    const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return { cached: !!raw.token, savedAt: raw.savedAt || '' };
  } catch {
    return { cached: false, savedAt: '' };
  }
}

function accountRows() {
  const rows = listAccountProfiles().map(profile => {
    const exists = profileExists(profile);
    const email = findProfileEmail(profile);
    const token = readTokenMeta(profile);
    const cached = accountStatus.get(profile) || {};
    const job = loginJobs.get(profile) || {};
    let state = cached.state || (exists ? (token.cached ? 'cached' : 'unknown') : 'missing');
    let detail = cached.detail || '';
    if (job.state === 'login' || job.state === 'checking') {
      state = job.state;
      detail = job.state === 'login' ? 'login window open' : 'capturing token';
    }
    return {
      label: accountLabel(profile),
      profile,
      exists,
      email: email.email,
      emailStatus: email.emailStatus,
      tokenCached: token.cached,
      tokenSavedAt: token.savedAt,
      state,
      detail,
      checkedAt: cached.checkedAt || '',
      loginJob: job.pid ? job : null,
    };
  });
  const emailCounts = new Map();
  for (const row of rows) {
    if (row.email) emailCounts.set(row.email, (emailCounts.get(row.email) || 0) + 1);
  }
  for (const row of rows) row.duplicate = !!row.email && emailCounts.get(row.email) > 1;
  return rows;
}

function parseAuthCheckOutput(output, profiles) {
  const seen = new Set();
  const re = /^(OK|FAIL)\s+(.+)$/gm;
  let m;
  while ((m = re.exec(output))) {
    const state = m[1] === 'OK' ? 'ok' : 'fail';
    const profile = m[2].trim();
    if (!isSafeProfile(profile)) continue;
    seen.add(profile);
    accountStatus.set(profile, {
      state,
      checkedAt: new Date().toISOString(),
      detail: state === 'ok' ? 'auth probe passed' : 'auth probe failed',
      output: output.slice(-4000),
    });
  }
  for (const profile of profiles) {
    if (!seen.has(profile) && profileExists(profile)) {
      accountStatus.set(profile, {
        state: 'fail',
        checkedAt: new Date().toISOString(),
        detail: 'no auth result',
        output: output.slice(-4000),
      });
    }
  }
}

function runAuthCheck(profile) {
  const profiles = profile ? [profile] : listAccountProfiles().filter(profileExists);
  if (!profile && authCheckAll) return authCheckAll;
  for (const p of profiles) {
    if (!profileExists(p)) continue;
    accountStatus.set(p, { state: 'checking', checkedAt: new Date().toISOString(), detail: 'auth check running' });
  }
  const env = { ...process.env, APPMAGIC_PROJECT_DIR: PROJECT_DIR, CHECK_AUTH: '1' };
  if (profile) env.APPMAGIC_USERDATA_DIR = profile;
  const script = path.join(__dirname, 'appmagic-weekly.js');
  const promise = new Promise(resolve => {
    cp.execFile(process.execPath, [script], {
      cwd: PROJECT_DIR,
      env,
      timeout: 180000,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    }, (error, stdout, stderr) => {
      const output = `${stdout || ''}${stderr || ''}`;
      parseAuthCheckOutput(output, profiles);
      if (error && !output.match(/^(OK|FAIL)\s+(.+)$/m)) {
        for (const p of profiles) {
          if (!profileExists(p)) continue;
          accountStatus.set(p, {
            state: 'fail',
            checkedAt: new Date().toISOString(),
            detail: error.message || 'auth check failed',
            output: output.slice(-4000),
          });
        }
      }
      resolve({ ok: !error, output, accounts: accountRows() });
    });
  }).finally(() => {
    if (!profile) authCheckAll = null;
  });
  if (!profile) authCheckAll = promise;
  return promise;
}

function startLoginCapture(profile) {
  if (!isSafeProfile(profile)) return { ok: false, error: 'invalid profile' };
  const current = loginJobs.get(profile);
  if (current && (current.state === 'login' || current.state === 'checking')) {
    return { ok: true, profile, pid: current.pid, state: current.state, alreadyRunning: true };
  }
  const env = { ...process.env, APPMAGIC_PROJECT_DIR: PROJECT_DIR, APPMAGIC_USERDATA_DIR: profile };
  const child = cp.spawn(process.execPath, [path.join(__dirname, 'appmagic-login.js')], {
    cwd: PROJECT_DIR,
    env,
    stdio: 'ignore',
    windowsHide: false,
  });
  const job = { state: 'login', pid: child.pid, startedAt: new Date().toISOString(), finishedAt: '', exitCode: null };
  loginJobs.set(profile, job);
  child.on('exit', code => {
    const next = { ...job, state: 'checking', finishedAt: new Date().toISOString(), exitCode: code };
    loginJobs.set(profile, next);
    runAuthCheck(profile).then(() => {
      const checked = accountStatus.get(profile);
      loginJobs.set(profile, {
        ...next,
        state: checked && checked.state === 'ok' ? 'done' : 'failed',
        checkedAt: new Date().toISOString(),
      });
    });
  });
  child.on('error', error => {
    loginJobs.set(profile, { ...job, state: 'failed', finishedAt: new Date().toISOString(), detail: error.message });
  });
  return { ok: true, profile, pid: child.pid, state: 'login' };
}

function activeRunJob() {
  if (!runJob) return null;
  if (runJob.state === 'starting' || runJob.state === 'running') return runJob;
  return null;
}

function isFreshProgressActive() {
  const runDir = latestRunDir();
  const progress = readProgress(runDir);
  if (!progress || !progress.updatedAt) return false;
  const updatedAt = new Date(progress.updatedAt).getTime();
  if (!Number.isFinite(updatedAt)) return false;
  const fresh = (Date.now() - updatedAt) < 90 * 1000;
  return fresh && ((progress.activeCats || 0) > 0 || (progress.currentStage && progress.currentStage !== 'done'));
}

function runSummary() {
  return {
    job: runJob,
    active: !!activeRunJob() || isFreshProgressActive(),
    progressActive: isFreshProgressActive(),
  };
}

function startCollectionRun(options = {}) {
  const current = activeRunJob();
  if (current) {
    return { ok: false, error: 'collection already running', run: runSummary() };
  }
  if (isFreshProgressActive()) {
    return { ok: false, error: 'progress indicates an active run', run: runSummary() };
  }

  const opts = {
    fresh: !!options.fresh,
    weekAnchor: String(options.weekAnchor || '').trim(),
    accounts: Array.isArray(options.accounts) ? options.accounts.filter(isSafeProfile) : [],
    listOnly: !!options.listOnly,
    skipExcel: !!options.skipExcel,
  };
  const psScript = path.join(__dirname, 'run_appmagic_weekly.ps1');
  const psArgs = [
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', psScript,
    '-ProjectDir', PROJECT_DIR,
  ];
  if (opts.weekAnchor) psArgs.push('-WeekAnchor', opts.weekAnchor);
  if (opts.fresh) psArgs.push('-Fresh');
  if (opts.listOnly) psArgs.push('-ListOnly');
  if (opts.skipExcel) psArgs.push('-SkipExcel');
  const env = {
    ...process.env,
    APPMAGIC_PROJECT_DIR: PROJECT_DIR,
    APPMAGIC_PORT: String(PORT),
    APPMAGIC_NO_OPEN: '1',
  };
  if (opts.accounts.length) env.APPMAGIC_ACCOUNTS = opts.accounts.join(',');
  const child = cp.spawn('powershell', psArgs, {
    cwd: PROJECT_DIR,
    env,
    windowsHide: true,
    stdio: 'ignore',
  });

  runJob = {
    state: 'starting',
    pid: child.pid,
    startedAt: new Date().toISOString(),
    finishedAt: '',
    exitCode: null,
    detail: 'launching collection',
    options: opts,
  };

  setTimeout(() => {
    if (runJob && runJob.pid === child.pid && runJob.state === 'starting') {
      runJob = { ...runJob, state: 'running', detail: 'collection in progress' };
    }
  }, 3000);

  child.on('exit', code => {
    if (!runJob || runJob.pid !== child.pid) return;
    runJob = {
      ...runJob,
      state: code === 0 ? 'done' : 'failed',
      finishedAt: new Date().toISOString(),
      exitCode: code,
      detail: code === 0 ? 'collection finished' : 'collection failed',
    };
  });

  child.on('error', error => {
    if (!runJob || runJob.pid !== child.pid) return;
    runJob = {
      ...runJob,
      state: 'failed',
      finishedAt: new Date().toISOString(),
      exitCode: -1,
      detail: error.message || 'failed to launch collection',
    };
  });

  return { ok: true, run: runSummary() };
}

const PAGE = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AppMagic 实时看板</title>
<style>
  :root {
    --bg: #0b0d18;
    --panel: rgba(19, 23, 40, 0.55);
    --panel-2: rgba(24, 29, 50, 0.92);
    --line: rgba(148, 165, 210, 0.1);
    --line-2: rgba(148, 165, 210, 0.2);
    --text: #eef2fc;
    --muted: #8d9ab8;
    --blue: #0066ff;
    --blue-t: #4d94ff;
    --cyan: #00e5ff;
    --violet: #4a4e8f;
    --green: #38d980;
    --yellow: #f5c542;
    --red: #ff6b6b;
    --glow-cyan: 0 0 14px rgba(0, 229, 255, 0.45);
    --shadow: 0 10px 34px rgba(4, 6, 16, 0.5);
    --font: "Times New Roman", Times, "Microsoft YaHei", "微软雅黑", serif;
  }
  * { box-sizing: border-box; }
  /* 全局缩放锚点：rem 随视口宽度缩放，2K/4K 自动放大 */
  html { font-size: clamp(13px, 0.75vw, 26px); }
  html, body { margin: 0; height: 100%; }
  body {
    font-family: var(--font);
    color: var(--text);
    background:
      radial-gradient(70rem 32rem at 8% -12%, rgba(0, 102, 255, 0.2), transparent 62%),
      radial-gradient(56rem 28rem at 94% -8%, rgba(74, 78, 143, 0.33), transparent 58%),
      radial-gradient(44rem 26rem at 55% 115%, rgba(0, 229, 255, 0.07), transparent 55%),
      linear-gradient(158deg, #10142a 0%, #171231 42%, #0b0d18 78%, #07080f 100%);
    overflow: hidden;
  }
  .app { display: flex; flex-direction: column; height: 100dvh; padding: 0.9rem 1.1rem 0.7rem; gap: 0.7rem; }

  /* ── 顶部标题区 ─────────────────────────── */
  .topbar { display: flex; align-items: center; gap: 0.9rem; flex-wrap: wrap; }
  .brand { display: flex; align-items: center; gap: 0.65rem; }
  .logo {
    width: 0.72rem; height: 0.72rem; border-radius: 999px; flex: 0 0 auto;
    background: radial-gradient(circle at 35% 35%, #9fe9ff, var(--cyan) 55%, rgba(0,102,255,0.9));
    box-shadow: 0 0 10px rgba(0,229,255,0.85), 0 0 26px rgba(0,140,255,0.5);
    animation: breath 2.6s ease-in-out infinite;
  }
  @keyframes breath { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.82); opacity: 0.75; } }
  .brand h1 { margin: 0; font-size: 1.42rem; letter-spacing: 0.02em; font-weight: 700; }
  .brand h1 b { background: linear-gradient(90deg, var(--blue-t), var(--cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .topbar .grow { flex: 1; }

  /* 胶囊状态栏 */
  .chips { display: inline-flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
  .chip {
    display: inline-flex; align-items: center; gap: 0.45rem; border-radius: 999px;
    padding: 0.3rem 0.78rem; font-size: 0.8rem; font-weight: 700;
    background: rgba(0,102,255,0.12); border: 1px solid rgba(77,148,255,0.3); color: #cfe2ff;
    backdrop-filter: blur(8px);
  }
  .chip.ok { background: rgba(56,217,128,0.1); border-color: rgba(56,217,128,0.28); color: #d8ffea; }
  .chip.warn { background: rgba(245,197,66,0.1); border-color: rgba(245,197,66,0.26); color: #ffefc4; }
  .chip.ghost { background: rgba(148,165,210,0.07); border-color: var(--line-2); color: var(--muted); font-weight: 400; }
  .chip.ghost b { color: var(--text); font-weight: 700; }
  .chip.ghost b.cyan { color: var(--cyan); text-shadow: 0 0 10px rgba(0,229,255,0.35); }
  .dot { width: 0.46rem; height: 0.46rem; border-radius: 999px; background: currentColor; box-shadow: 0 0 8px currentColor; }
  .dot.pulse { animation: pulse 1.6s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

  /* ── 总进度条 ─────────────────────────── */
  .overall { display: flex; align-items: center; gap: 0.8rem; }
  .overall .bar { flex: 1; height: 0.5rem; border-radius: 999px; background: rgba(148,165,210,0.1); overflow: hidden; }
  .overall .bar > span { display: block; height: 100%; width: 0%; border-radius: inherit;
    background: linear-gradient(90deg, var(--blue), var(--cyan)); transition: width .4s ease;
    box-shadow: var(--glow-cyan); }
  .overall .bar.ok > span { background: linear-gradient(90deg, var(--cyan), var(--green)); box-shadow: 0 0 12px rgba(56,217,128,0.45); }
  .overall .pct { font-size: 0.95rem; min-width: 3rem; text-align: right; font-weight: 700; }

  /* ── KPI 指标条：单面板 8 卡横排，细线分隔 + 微弱发光 ── */
  .kpis {
    display: grid; grid-template-columns: repeat(8, 1fr);
    background: var(--panel); border: 1px solid var(--line); border-radius: 0.85rem;
    box-shadow: var(--shadow); backdrop-filter: blur(14px) saturate(1.25);
    overflow: hidden;
  }
  .kpi { padding: 0.6rem 0.9rem; border-left: 1px solid var(--line); }
  .kpi:first-child { border-left: none; }
  .kpi .k { color: var(--muted); font-size: 0.73rem; letter-spacing: 0.06em; }
  .kpi .v { font-size: 1.55rem; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.3;
    text-shadow: 0 0 16px rgba(120, 170, 255, 0.22); }
  .kpi .s { color: var(--muted); font-size: 0.7rem; }
  .kpi .v.green { color: var(--green); text-shadow: 0 0 14px rgba(56,217,128,0.3); }
  .kpi .v.cyan { color: var(--cyan); text-shadow: 0 0 14px rgba(0,229,255,0.35); }
  .kpi .v.yellow { color: var(--yellow); text-shadow: 0 0 14px rgba(245,197,66,0.3); }
  .kpi .v.red { color: var(--red); text-shadow: 0 0 14px rgba(255,107,107,0.3); }

  /* ── 主区 ─────────────────────────── */
  .main { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 7fr) minmax(19rem, 3fr); gap: 0.7rem; position: relative; }
  .col { display: flex; flex-direction: column; gap: 0.7rem; min-height: 0; min-width: 0; position: relative; }
  .panel {
    background: var(--panel); border: 1px solid var(--line); border-radius: 0.85rem;
    box-shadow: var(--shadow); backdrop-filter: blur(14px) saturate(1.25);
    display: flex; flex-direction: column; min-height: 0; overflow: hidden;
  }
  .panel > .head { display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 0.95rem 0.5rem; flex-wrap: wrap; }
  .panel > .head h2 { margin: 0; font-size: 0.98rem; letter-spacing: 0.02em; display: flex; align-items: center; gap: 0.5rem; }
  .panel > .head h2::before { content: ""; width: 0.26rem; height: 0.92rem; border-radius: 2px;
    background: linear-gradient(180deg, var(--blue-t), var(--cyan)); box-shadow: 0 0 8px rgba(0,229,255,0.4); }
  .panel > .head .hint { color: var(--muted); font-size: 0.75rem; }
  .panel > .head .grow { flex: 1; }
  .panel > .body { flex: 1; min-height: 0; overflow: auto; padding: 0 0.5rem 0.5rem; scrollbar-width: thin; scrollbar-color: rgba(148,165,210,0.3) transparent; }
  .panel > .body::-webkit-scrollbar { width: 8px; height: 8px; }
  .panel > .body::-webkit-scrollbar-thumb { background: rgba(148,165,210,0.22); border-radius: 8px; }

  /* ── 数据表格：表头弱化，行 hover 高亮 ── */
  table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
  th, td { padding: 0.42rem 0.6rem; border-bottom: 1px solid rgba(148,165,210,0.07); text-align: center; white-space: nowrap; }
  thead th { position: sticky; top: 0; z-index: 1; background: var(--panel-2);
    color: rgba(141,154,184,0.75); font-size: 0.68rem; font-weight: 400; letter-spacing: 0.09em; }
  tbody tr { transition: background 0.15s ease; }
  tbody tr:hover td { background: rgba(0,140,255,0.07); }
  td.num, th.num { text-align: center; font-variant-numeric: tabular-nums; }
  .muted { color: var(--muted); }
  .sub { color: var(--muted); font-size: 0.75rem; }
  .ellip { max-width: 15rem; overflow: hidden; text-overflow: ellipsis; }
  /* 长文本列自动换行：内容完整显示，杜绝横向滚动 */
  td.wrap { white-space: normal; word-break: break-word; min-width: 6rem; }

  .badge { display: inline-flex; align-items: center; gap: 0.35rem; border-radius: 999px; padding: 0.1rem 0.58rem;
    font-size: 0.74rem; font-weight: 700; border: 1px solid transparent; }
  .badge.done { color: #d7ffe7; background: rgba(56,217,128,0.12); border-color: rgba(56,217,128,0.25); }
  .badge.run  { color: #cfe2ff; background: rgba(0,102,255,0.16); border-color: rgba(77,148,255,0.35); }
  .badge.wait { color: var(--muted); background: rgba(148,165,210,0.08); border-color: var(--line-2); }
  .badge.err  { color: #ffdcdc; background: rgba(255,107,107,0.12); border-color: rgba(255,107,107,0.3); }
  .badge.warn { color: #fff1c4; background: rgba(245,197,66,0.12); border-color: rgba(245,197,66,0.28); }

  button.tool {
    border: 1px solid var(--line-2); border-radius: 0.5rem; color: var(--text);
    background: rgba(148,165,210,0.08); padding: 0.25rem 0.62rem; font-family: var(--font);
    font-size: 0.78rem; cursor: pointer; transition: all 0.15s ease;
  }
  button.tool:hover:not(:disabled) { border-color: rgba(0,229,255,0.45); color: var(--cyan); }
  button.tool.primary { background: rgba(0,102,255,0.18); border-color: rgba(77,148,255,0.38); }
  button.tool:disabled { opacity: 0.48; cursor: not-allowed; }
.account-table td { vertical-align: middle; }
.account-name { font-size: 1rem; font-weight: 700; color: var(--cyan); }
.account-actions { display: inline-flex; gap: 0.35rem; }
.settings-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.7rem; padding: 0.3rem 0.3rem 0.8rem; }
.field { display: grid; gap: 0.3rem; min-width: 0; }
.field label { color: var(--muted); font-size: 0.74rem; }
input[type="date"], input[type="number"] {
  background: rgba(148,165,210,0.07); border: 1px solid var(--line-2); color: var(--text);
  border-radius: 0.5rem; padding: 0.32rem 0.6rem; font-size: 0.82rem; outline: none; font-family: var(--font);
}
.checks { display: flex; gap: 0.7rem; flex-wrap: wrap; align-items: center; }
.checks label { display: inline-flex; gap: 0.35rem; align-items: center; color: var(--text); font-size: 0.8rem; }
.overlay {
  position: fixed; inset: 0; background: rgba(5, 7, 15, 0.62); backdrop-filter: blur(8px);
  display: none; align-items: center; justify-content: center; z-index: 30; padding: 1.2rem;
}
.overlay.open { display: flex; }
#settingsPanel.modal-panel {
  width: min(78rem, calc(100vw - 2.4rem)); max-height: calc(100vh - 2.4rem); display: flex;
  flex-direction: column; background: rgba(16, 20, 34, 0.96);
}
.resizer {
  position: absolute; opacity: 0.36; transition: opacity 0.15s ease; touch-action: none; z-index: 8;
}
.resizer:hover, .resizer.dragging { opacity: 1; }
.resizer.row-split { left: 0; right: 0; cursor: ns-resize; }
.resizer.col-split { top: 0; bottom: 0; cursor: ew-resize; }
.resizer.row-split::before {
  content: ""; position: absolute; left: 0.65rem; right: 0.65rem; top: 50%; height: 2px;
  transform: translateY(-50%); background: rgba(0,229,255,0.42); border-radius: 999px;
  box-shadow: 0 0 8px rgba(0,229,255,0.2);
}
.resizer.col-split::before {
  content: ""; position: absolute; top: 0.9rem; bottom: 0.9rem; left: 50%; width: 2px;
  transform: translateX(-50%); background: rgba(0,229,255,0.42); border-radius: 999px;
  box-shadow: 0 0 8px rgba(0,229,255,0.2);
}
.panel.resizable { position: relative; min-height: 4rem; min-width: 18rem; }

  /* 品类进度条：青绿渐变 */
  .mini { height: 0.38rem; width: 6.5rem; border-radius: 999px; background: rgba(148,165,210,0.12); overflow: hidden; display: inline-block; vertical-align: middle; }
  .mini > span { display: block; height: 100%; background: linear-gradient(90deg, var(--cyan), var(--green));
    box-shadow: 0 0 8px rgba(0,229,255,0.35); }

  .chg-up { color: var(--green); font-weight: 700; }
  .chg-dn { color: var(--red); font-weight: 700; }
  .chg-0 { color: var(--muted); }
  .new-tag { color: var(--cyan); font-size: 0.68rem; font-weight: 700; border: 1px solid rgba(0,229,255,0.4);
    border-radius: 0.35rem; padding: 0 0.3rem; margin-left: 0.4rem; }
  .cat-chip { display: inline-block; border-radius: 0.35rem; padding: 0.05rem 0.45rem; font-size: 0.74rem;
    background: rgba(74,78,143,0.28); border: 1px solid rgba(120,126,200,0.32); color: #d6dcff; }
  a.cat-link { color: var(--text); font-weight: 700; border-bottom: 1px dashed rgba(0,229,255,0.45); }
  a.cat-link:hover { color: var(--cyan); text-decoration: none; }

  .tabs { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .tab { border-radius: 999px; padding: 0.26rem 0.85rem; font-size: 0.82rem; cursor: pointer; user-select: none;
    background: rgba(148,165,210,0.07); border: 1px solid var(--line-2); color: var(--muted);
    display: inline-flex; align-items: center; gap: 0.35rem; transition: all 0.15s ease; }
  .tab:hover { border-color: rgba(0,229,255,0.4); color: var(--text); }
  .tab.on { background: linear-gradient(90deg, rgba(0,102,255,0.32), rgba(0,229,255,0.16));
    border-color: rgba(0,180,255,0.55); color: #eaf4ff; font-weight: 700; box-shadow: 0 0 12px rgba(0,140,255,0.25); }
  .tab .n { font-size: 0.72rem; opacity: 0.85; }
  .tab .live-dot { width: 0.4rem; height: 0.4rem; border-radius: 999px; background: var(--cyan);
    box-shadow: 0 0 6px var(--cyan); animation: pulse 1.4s infinite; }
  select, input[type="search"] {
    background: rgba(148,165,210,0.07); border: 1px solid var(--line-2); color: var(--text);
    border-radius: 0.5rem; padding: 0.26rem 0.6rem; font-size: 0.82rem; outline: none; font-family: var(--font);
  }
  select:focus, input[type="search"]:focus { border-color: rgba(0,229,255,0.5); }
  select option { background: #171d33; }
  input[type="search"] { width: 10rem; }
  a { color: #bfe0ff; text-decoration: none; }
  a:hover { color: var(--cyan); text-decoration: underline; }

  .spark { width: 6rem; height: 1.4rem; vertical-align: middle; }
  .spark polyline { fill: none; stroke: var(--cyan); stroke-width: 1.6; }
  .spark circle { fill: var(--cyan); }

  /* ── 右侧信息面板 ─────────────────────── */
  .kv-list { display: grid; gap: 0.4rem; padding: 0.25rem 0.45rem 0.45rem; }
  .kv { display: flex; justify-content: space-between; gap: 0.7rem; font-size: 0.8rem;
    padding: 0.4rem 0.6rem; border: 1px solid var(--line); border-radius: 0.55rem; background: rgba(24,29,50,0.4); }
  .kv .k { color: var(--muted); flex: 0 0 auto; }
  .kv .v { font-size: 0.78rem; text-align: right; word-break: break-all; }
  /* 事件流时间线：左侧圆点 + 竖线，最新事件突出 */
  .timeline { padding: 0.3rem 0.6rem 0.4rem 0.65rem; }
  .event { position: relative; padding: 0.1rem 0.3rem 0.55rem 1.15rem; font-size: 0.8rem; }
  .event::before { content: ""; position: absolute; left: 0; top: 0.32rem;
    width: 0.44rem; height: 0.44rem; border-radius: 999px;
    background: var(--blue-t); box-shadow: 0 0 6px rgba(77,148,255,0.6); }
  .event::after { content: ""; position: absolute; left: 0.19rem; top: 1rem; bottom: -0.15rem;
    width: 1px; background: rgba(148,165,210,0.16); }
  .event:last-child::after { display: none; }
  .event[data-l="warn"]::before { background: var(--yellow); box-shadow: 0 0 6px rgba(245,197,66,0.6); }
  .event[data-l="error"]::before { background: var(--red); box-shadow: 0 0 8px rgba(255,107,107,0.7); }
  .event .t { color: var(--muted); font-size: 0.7rem; }
  .event .m { line-height: 1.45; color: var(--muted); }
  .event.newest .m { color: var(--text); font-weight: 700; }
  .event.newest::before { background: var(--cyan); box-shadow: 0 0 10px rgba(0,229,255,0.8); animation: pulse 1.6s infinite; }

  .split { display: flex; height: 0.55rem; border-radius: 999px; overflow: hidden; margin: 0.4rem 0.7rem 0.15rem; }
  .split .m { background: linear-gradient(90deg, var(--blue), var(--cyan)); }
  .split .e { background: linear-gradient(90deg, #e8963f, var(--yellow)); }
  .split .u { background: rgba(148,165,210,0.22); }
  .split-legend { display: flex; gap: 0.8rem; color: var(--muted); font-size: 0.75rem; padding: 0.25rem 0.7rem 0.55rem; flex-wrap: wrap; }
  .lg { display: inline-flex; align-items: center; gap: 0.3rem; }
  .sw { width: 0.6rem; height: 0.6rem; border-radius: 0.2rem; display: inline-block; }

  /* 空态占位 */
  .empty { padding: 1.4rem; text-align: center; color: var(--muted); font-size: 0.82rem; }
  .empty-hero { padding: 2.2rem 1.4rem; text-align: center; color: var(--muted); }
  .empty-hero svg { width: 3.4rem; height: 3.4rem; opacity: 0.4; margin-bottom: 0.6rem; }
  .empty-hero .t1 { font-size: 0.92rem; color: rgba(238,242,252,0.75); margin-bottom: 0.25rem; }
  .empty-hero .t2 { font-size: 0.78rem; }

  /* ── 自适应 ─────────────────────────── */
  @media (max-width: 1500px) { .kpis { grid-template-columns: repeat(4, 1fr); } .kpi:nth-child(5) { border-left: none; } .kpi:nth-child(n+5) { border-top: 1px solid var(--line); } }
  @media (max-width: 1180px) {
    body { overflow: auto; }
    .app { height: auto; min-height: 100dvh; }
    .main { grid-template-columns: 1fr; }
    .panel > .body { max-height: 46vh; }
    .settings-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 640px) {
    .app { padding: 0.7rem; }
    .kpis { grid-template-columns: repeat(2, 1fr); }
    .kpi:nth-child(3) { border-left: none; }
    .kpi:nth-child(n+3) { border-top: 1px solid var(--line); }
    input[type="search"] { width: 7rem; }
    .ellip { max-width: 9rem; }
    .settings-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<div class="app">
  <div class="topbar">
    <div class="brand">
      <span class="logo"></span>
      <h1>AppMagic <b>实时看板</b></h1>
    </div>
    <div class="chips">
      <span class="chip ghost">周锚点 <b class="cyan" id="anchor">--</b></span>
      <span class="chip ghost">阶段 <b id="stage">--</b></span>
    </div>
    <div class="grow"></div>
    <div class="chips">
      <span class="chip warn" id="runChip"><span class="dot"></span><span id="runText">连接中</span></span>
      <span class="chip" id="connChip"><span class="dot pulse"></span><span id="connText">实时通道</span></span>
      <span class="chip ghost">已运行 <b id="elapsed">--</b></span>
      <span class="chip ghost">更新于 <b id="updated">--</b></span>
    </div>
    <div class="chips">
      <button class="tool" id="settingsOpen" type="button">设置</button>
      <button class="tool" id="runStart" type="button">开始采集</button>
      <button class="tool primary" id="runStartFresh" type="button">全新采集</button>
    </div>
  </div>

  <div class="overall">
    <div class="bar" id="overallBar"><span></span></div>
    <span class="pct" id="overallPct">--%</span>
  </div>

  <div class="kpis" id="kpis"></div>

  <div class="main">
    <div class="col">
      <section class="panel resizable" data-panel="category-progress" style="flex:0 0 auto">
        <div class="head">
          <h2>品类进度</h2>
          <span class="hint" id="catsHint"></span>
          <div class="grow"></div>
          <span class="hint" id="queueHint"></span>
        </div>
        <div class="body">
          <table>
            <thead><tr>
              <th>品类</th><th>状态</th><th class="num">榜单行</th><th class="num">焦点</th>
              <th>国别进度</th><th>账号</th><th>当前应用</th><th class="num">耗时</th>
            </tr></thead>
            <tbody id="catRows"></tbody>
          </table>
        </div>
      </section>

      <section class="panel resizable" data-panel="focus-apps" style="flex:1" id="focusPanel">
        <div class="head">
          <h2>焦点应用</h2>
          <div class="tabs" id="tabs"></div>
          <div class="grow"></div>
          <input type="search" id="search" placeholder="搜索名称 / 发行商">
          <select id="sortBy">
            <option value="rank">按本周排名</option>
            <option value="change">按上升幅度</option>
          </select>
        </div>
        <div class="body">
          <table>
            <thead><tr>
              <th class="num">排名</th><th>应用</th><th>品类</th><th class="num">变化</th><th>6周轨迹</th>
              <th>市场属性</th><th>下载前三国家</th><th>总部</th><th>上榜理由</th>
            </tr></thead>
            <tbody id="focusRows"></tbody>
          </table>
        </div>
      </section>
    </div>

    <div class="col">
      <section class="panel resizable" data-panel="risers" style="flex:0 0 auto">
        <div class="head"><h2>本周飙升榜</h2><span class="hint">全品类涨幅前列</span></div>
        <div class="body">
          <table>
            <thead><tr><th class="num">#</th><th>应用</th><th>品类</th><th class="num">本周排名</th><th class="num">升幅</th></tr></thead>
            <tbody id="riserRows"></tbody>
          </table>
        </div>
      </section>

      <section class="panel resizable" data-panel="market-split" style="flex:0 0 auto">
        <div class="head"><h2>焦点市场分布</h2></div>
        <div class="split" id="splitBar"></div>
        <div class="split-legend" id="splitLegend"></div>
      </section>

      <section class="panel resizable" data-panel="events" style="flex:1">
        <div class="head"><h2>事件流</h2><div class="grow"></div>
          <span class="hint"><a href="/api/progress" target="_blank">进度</a> · <a href="/api/results" target="_blank">结果</a> · <a href="/api/health" target="_blank">健康</a></span>
        </div>
        <div class="body timeline" id="events"></div>
      </section>

      <section class="panel resizable" data-panel="context" style="flex:0 0 auto">
        <div class="head"><h2>运行上下文</h2></div>
        <div class="kv-list" id="ctx"></div>
      </section>
    </div>
  </div>
</div>
<div class="overlay" id="settingsOverlay">
  <section class="panel modal-panel" id="settingsPanel">
    <div class="head">
      <h2>设置</h2>
      <span class="hint" id="accountsHint">本机 profile</span>
      <div class="grow"></div>
      <button class="tool" id="accountRefresh" type="button">检测登录态</button>
      <button class="tool" id="settingsClose" type="button">关闭</button>
    </div>
    <div class="body">
      <div class="settings-grid">
        <div class="field">
          <label for="weekAnchorInput">采集周一</label>
          <input id="weekAnchorInput" type="date">
        </div>
        <div class="field">
          <label>账号池</label>
          <div class="checks" id="accountChecks">
            <label><input type="checkbox" value=".appmagic-userdata" checked> A</label>
            <label><input type="checkbox" value=".appmagic-userdata-b" checked> B</label>
            <label><input type="checkbox" value=".appmagic-userdata-c" checked> C</label>
          </div>
        </div>
        <div class="field">
          <label>运行选项</label>
          <div class="checks">
            <label><input id="listOnlyInput" type="checkbox"> 仅榜单</label>
            <label><input id="skipExcelInput" type="checkbox"> 跳过Excel</label>
          </div>
        </div>
        <div class="field">
          <label>说明</label>
          <div class="sub">留空日期表示当前周；“开始采集”使用当前设置，“全新采集”会追加 Fresh。</div>
        </div>
      </div>
      <table class="account-table">
        <thead><tr><th>账号</th><th>Profile</th><th>邮箱</th><th>登录态</th><th>操作</th></tr></thead>
        <tbody id="accountRows"></tbody>
      </table>
    </div>
  </section>
</div>

<script>
(function () {
  var ALL = '__all__';
  var S = { data: null, tab: ALL, sortBy: 'rank', search: '', es: null, pollTimer: null, accounts: { accounts: [], loading: false, error: '' }, run: { active: false, loading: false, job: null } };
  var SETTINGS_KEY = 'appmagic_dashboard_settings_v1';
  var PANEL_KEY = 'appmagic_dashboard_panel_sizes_v1';
  // AppMagic 品类页链接（tag id 与 scraper CATS 对应；已实测 ?tag= 参数生效）
  var CAT_TAG = { '超休闲': 126, '休闲': 243572, 'Launcher': 243528, '杀毒软件、清理': 119, '文件恢复': 243477, 'PDF阅读器': 244699 };
  function catUrl(label) {
    var id = CAT_TAG[label];
    return id ? 'https://appmagic.rocks/top-charts/apps?tag=' + id : '';
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? Object.assign({}, fallback, JSON.parse(raw)) : Object.assign({}, fallback);
    } catch (e) {
      return Object.assign({}, fallback);
    }
  }
  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function readSettings() {
    return loadJson(SETTINGS_KEY, {
      weekAnchor: '',
      accounts: ['.appmagic-userdata', '.appmagic-userdata-b', '.appmagic-userdata-c'],
      listOnly: false,
      skipExcel: false
    });
  }
  function writeSettings() {
    var settings = {
      weekAnchor: document.getElementById('weekAnchorInput') ? document.getElementById('weekAnchorInput').value : '',
      accounts: Array.prototype.slice.call(document.querySelectorAll('#accountChecks input:checked')).map(function (el) { return el.value; }),
      listOnly: !!(document.getElementById('listOnlyInput') && document.getElementById('listOnlyInput').checked),
      skipExcel: !!(document.getElementById('skipExcelInput') && document.getElementById('skipExcelInput').checked)
    };
    saveJson(SETTINGS_KEY, settings);
    return settings;
  }
  function applySettings() {
    var settings = readSettings();
    var date = document.getElementById('weekAnchorInput');
    if (date) date.value = settings.weekAnchor || '';
    Array.prototype.forEach.call(document.querySelectorAll('#accountChecks input'), function (el) {
      el.checked = settings.accounts.indexOf(el.value) >= 0;
    });
    if (document.getElementById('listOnlyInput')) document.getElementById('listOnlyInput').checked = !!settings.listOnly;
    if (document.getElementById('skipExcelInput')) document.getElementById('skipExcelInput').checked = !!settings.skipExcel;
  }
  function openSettings() {
    var overlay = document.getElementById('settingsOverlay');
    if (overlay) overlay.classList.add('open');
  }
  function closeSettings() {
    var overlay = document.getElementById('settingsOverlay');
    if (overlay) overlay.classList.remove('open');
    writeSettings();
  }
  function num(v) { return (v == null || v === '') ? '--' : Number(v).toLocaleString('en-US'); }
  function dur(ms) {
    if (ms == null || isNaN(ms)) return '--';
    var s = Math.max(0, Math.round(ms / 1000));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    if (h) return h + ' 时 ' + m + ' 分';
    if (m) return m + ' 分 ' + (s % 60) + ' 秒';
    return s + ' 秒';
  }
  function ftime(v) {
    if (!v) return '--';
    var d = new Date(v);
    return isNaN(d.getTime()) ? String(v) : d.toLocaleTimeString('zh-CN', { hour12: false });
  }
  function chg(v) {
    if (v == null) return '<span class="chg-0">--</span>';
    if (v > 0) return '<span class="chg-up">▲' + v + '</span>';
    if (v < 0) return '<span class="chg-dn">▼' + (-v) + '</span>';
    return '<span class="chg-0">0</span>';
  }
  function spark(history) {
    var pts = (history || []).slice().reverse(); // 旧 -> 新
    var vals = pts.filter(function (x) { return x != null; });
    if (!vals.length) return '<span class="muted">--</span>';
    var w = 84, h = 20, pad = 2;
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var span = (max - min) || 1;
    var coords = [];
    for (var i = 0; i < pts.length; i++) {
      if (pts[i] == null) continue;
      var x = pad + (w - 2 * pad) * (pts.length === 1 ? 0.5 : i / (pts.length - 1));
      var y = pad + (h - 2 * pad) * ((pts[i] - min) / span); // 排名小=靠上
      coords.push([x.toFixed(1), y.toFixed(1)]);
    }
    var line = coords.map(function (c) { return c.join(','); }).join(' ');
    var last = coords[coords.length - 1];
    return '<svg class="spark" viewBox="0 0 84 20" preserveAspectRatio="none">' +
      '<polyline points="' + line + '"/>' +
      '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="2"/></svg>';
  }
  function kpi(k, v, s, cls) {
    return '<div class="kpi"><div class="k">' + esc(k) + '</div><div class="v ' + (cls || '') + '">' + v + '</div><div class="s">' + esc(s || '') + '</div></div>';
  }
  function accShort(a) {
    return String(a || '').replace('.appmagic-userdata-b', 'B').replace('.appmagic-userdata-c', 'C').replace('.appmagic-userdata', 'A');
  }

  // ---- 全中文化：翻译 scraper 产出的英文状态/事件/详情（兼容历史归档数据） ----
  var LAB_ZH = { queued: '排队', wait: '排队', leaderboard: '榜单', 'country enrich': '国别采集', running: '运行中', done: '完成', error: '错误', weekly: '榜单', enrich: '国别采集' };
  var ZH_RULES = [
    [/^Initializing$/, '初始化'],
    [/^Collecting weekly leaderboards$/, '采集周榜'],
    [/^Collecting leaderboard: (.+)$/, '采集榜单：$1'],
    [/^Enriching country data$/, '国别采集'],
    [/^Writing output files$/, '写出产物'],
    [/^Completed$/, '已完成'],
    [/^Run initialized$/, '运行初始化'],
    [/^Run completed$/, '运行完成'],
    [/^Account token pool ready$/, '账号池就绪'],
    [/^Account token rejected by API probe$/, '账号凭证探针失败'],
    [/^No usable account token found$/, '未找到可用账号凭证'],
    [/^No valid account token found$/, '未找到有效账号凭证'],
    [/^No valid account token survived API probe$/, '所有账号凭证探针失败'],
    [/^Tags dictionary not found$/, '未找到标签字典'],
    [/^Tags dictionary loaded$/, '标签字典已加载'],
    [/^Tags dictionary unreadable$/, '标签字典读取失败'],
    [/^Country enrichment queue ready$/, '国别采集队列就绪'],
    [/^Worker (\S+) picked (.+)$/, '账号 $1 领取品类：$2'],
    [/^Worker (\S+) finished (.+)$/, '账号 $1 完成品类：$2'],
    [/^429 cooldown on (\S+)$/, '账号 $1 触发限流冷却'],
    [/^Network retries exhausted on (\S+)$/, '账号 $1 网络重试耗尽'],
    [/^Leaderboard ready for (.+)$/, '榜单就绪：$1'],
    [/^Pulling weekly leaderboard snapshots$/, '拉取周榜快照'],
    [/^Rows (\d+), focus (\d+), cached enrich hits (\d+)$/, '榜单 $1 行 · 焦点 $2 · 缓存命中 $3'],
    [/^Country enrichment started \((\d+) focus apps\)$/, '国别采集开始（$1 个焦点应用）'],
    [/^Country enrichment (\d+)\/(\d+)$/, '国别采集 $1/$2'],
    [/^Country enrichment finished \((\d+) focus apps\)$/, '国别采集完成（$1 个焦点应用）'],
    [/^Output written \((\d+) rows, (\d+) focus, (\d+) missing country\)$/, '产物已写入（$1 行 · 焦点 $2 · 缺国别 $3）'],
    [/^Reused completed enrich cache$/, '复用已完成的采集缓存'],
    [/^Focus set already fully enriched$/, '焦点集已全部采集'],
  ];
  function zh(s) {
    if (!s) return s;
    s = String(s).replace(/\.appmagic-userdata(-[bc])?/g, function (m) { return accShort(m); });
    for (var i = 0; i < ZH_RULES.length; i++) {
      if (ZH_RULES[i][0].test(s)) return s.replace(ZH_RULES[i][0], ZH_RULES[i][1]);
    }
    return s;
  }
  function zhLab(c) { return LAB_ZH[c.lab] || LAB_ZH[c.status] || c.lab || c.status || '--'; }

  function render() {
    var d = S.data || {};
    var p = d.progress || null;
    var r = d.results || { categories: [], risers: [], marketSplit: null };

    document.getElementById('anchor').textContent = p ? (p.anchor || '--') : (d.runDir || '--');
    document.getElementById('stage').textContent = p ? zh(p.stageLabel || p.currentStage || '--') : '尚无进度';
    document.getElementById('updated').textContent = p ? ftime(p.updatedAt) : '--';
    document.getElementById('elapsed').textContent = p ? dur(p.runElapsed) : '--';

    var runChip = document.getElementById('runChip');
    var runText = document.getElementById('runText');
    if (!p) { runChip.className = 'chip warn'; runText.textContent = '等待运行'; }
    else if (p.doneCats === p.total && p.total > 0) { runChip.className = 'chip ok'; runText.textContent = '已完成'; }
    else if ((p.activeCats || 0) > 0 || (p.currentStage && p.currentStage !== 'done')) { runChip.className = 'chip'; runText.textContent = '运行中'; }
    else { runChip.className = 'chip warn'; runText.textContent = '排队中'; }

    var overall = p ? (p.overall || 0) : 0;
    var bar = document.getElementById('overallBar');
    bar.className = 'bar' + (p && p.doneCats === p.total && p.total > 0 ? ' ok' : '');
    bar.firstElementChild.style.width = overall + '%';
    document.getElementById('overallPct').textContent = overall + '%';

    var doneApps = 0, todoApps = 0;
    (p && p.cats || []).forEach(function (c) { doneApps += c.done || 0; todoApps += c.todo || 0; });
    var covered = p ? ((p.totalFocus || 0) - (p.totalFail || 0)) : 0;
    var covPct = p && p.totalFocus ? Math.round(covered * 100 / p.totalFocus) : 0;
    var eta = '--';
    if (p && todoApps > doneApps && doneApps > 0 && p.runElapsed) {
      eta = dur(p.runElapsed / doneApps * (todoApps - doneApps));
    }
    document.getElementById('kpis').innerHTML = [
      kpi('品类完成', p ? num(p.doneCats) + '<span class="muted" style="font-size:0.85rem">/' + num(p.total) + '</span>' : '--', p && p.activeCats ? '进行中 ' + p.activeCats : '', 'green'),
      kpi('榜单总行数', p ? num(p.totalRows) : '--', '当前周全品类合计', 'cyan'),
      kpi('焦点应用', p ? num(p.totalFocus) : '--', '国别覆盖 ' + covPct + '%'),
      kpi('覆盖缺口', p ? num(p.totalFail) : '--', '缺国别数据', p && p.totalFail ? 'yellow' : ''),
      kpi('限流次数', p ? num(p.rateLimited) : '--', '429 冷却事件', p && p.rateLimited ? 'red' : ''),
      kpi('账号池', p ? num(p.poolSize) : '--', p ? ('工作账号 ' + ((p.workerAccounts || []).length || '--')) : ''),
      kpi('预计剩余', eta, todoApps ? ('国别 ' + doneApps + '/' + todoApps) : ''),
      kpi('模式', p ? (p.forceRefresh ? '全新' : '缓存') : '--', p && p.listOnly ? '仅榜单' : '完整流程')
    ].join('');

    var resultByCat = {};
    r.categories.forEach(function (c) { resultByCat[c.category] = c; });
    var rows = (p && p.cats || []).map(function (c) {
      var cls = c.cls === 'done' ? 'done' : c.cls === 'err' ? 'err' : c.cls === 'wait' ? 'wait' : 'run';
      var rc = resultByCat[c.label];
      var sub = rc ? ('已采集 ' + rc.enriched + '/' + rc.focusCount) : zh(c.detail || '');
      var u = catUrl(c.label);
      var catName = u
        ? '<a href="' + u + '" class="cat-link" target="_blank" rel="noreferrer">' + esc(c.label) + '</a>'
        : '<b>' + esc(c.label) + '</b>';
      return '<tr>' +
        '<td>' + catName + '<div class="sub">' + esc(sub) + '</div></td>' +
        '<td><span class="badge ' + cls + '">' + esc(zhLab(c)) + '</span></td>' +
        '<td class="num">' + num(c.curRows) + '</td>' +
        '<td class="num">' + num(c.focus) + '</td>' +
        '<td><span class="mini"><span style="width:' + (c.pct || 0) + '%"></span></span> <span class="muted">' + esc(c.prog === 'done' ? '完成' : (c.prog || '--')) + '</span></td>' +
        '<td>' + esc(accShort(c.account) || '--') + '</td>' +
        '<td class="ellip muted">' + esc(c.cur ? zh(c.cur) : '--') + '</td>' +
        '<td class="num">' + dur(c.dur) + '</td></tr>';
    }).join('');
    if (!rows && r.categories.length) {
      rows = r.categories.map(function (c) {
        var u = catUrl(c.category);
        var catName = u
          ? '<a href="' + u + '" class="cat-link" target="_blank" rel="noreferrer">' + esc(c.category) + '</a>'
          : '<b>' + esc(c.category) + '</b>';
        return '<tr><td>' + catName + '</td><td><span class="badge done">已归档</span></td>' +
          '<td class="num">' + num(c.records) + '</td><td class="num">' + num(c.focusCount) + '</td>' +
          '<td><span class="mini"><span style="width:100%"></span></span></td><td>--</td><td class="muted">' + esc(ftime(c.generatedAt)) + '</td><td>--</td></tr>';
      }).join('');
    }
    document.getElementById('catRows').innerHTML = rows || '<tr><td colspan="8"><div class="empty">暂无品类数据</div></td></tr>';
    document.getElementById('catsHint').textContent = d.runDir ? ('数据目录 ' + d.runDir) : '';
    document.getElementById('queueHint').textContent = p && p.queueTotal ? ('队列 ' + (p.queueTotal - p.queueRemaining) + '/' + p.queueTotal) : '';

    renderTabs(r, p);
    renderFocus(r);
    renderRisers(r);
    renderSplit(r);
    renderAccounts();
    renderRight(p);
  }

  function catOrder(r, p) {
    var order = (p && p.cats || []).map(function (c) { return c.label; });
    var seen = {};
    var cats = [];
    order.forEach(function (c) { if (r.categories.some(function (x) { return x.category === c; })) { cats.push(c); seen[c] = 1; } });
    r.categories.forEach(function (c) { if (!seen[c.category]) cats.push(c.category); });
    return cats;
  }

  function renderTabs(r, p) {
    var cats = catOrder(r, p);
    if (S.tab !== ALL && cats.indexOf(S.tab) < 0) S.tab = ALL;
    var total = r.categories.reduce(function (sum, c) { return sum + c.focusCount; }, 0);
    var anyLive = r.categories.some(function (c) { return c.live; });
    var html = '<span class="tab' + (S.tab === ALL ? ' on' : '') + '" data-c="' + ALL + '">全部 <span class="n">' + total + '</span>' + (anyLive ? '<span class="live-dot"></span>' : '') + '</span>';
    html += cats.map(function (c) {
      var cat = r.categories.filter(function (x) { return x.category === c; })[0];
      return '<span class="tab' + (c === S.tab ? ' on' : '') + '" data-c="' + esc(c) + '">' + esc(c) +
        ' <span class="n">' + cat.focusCount + '</span>' + (cat.live ? '<span class="live-dot"></span>' : '') + '</span>';
    }).join('');
    document.getElementById('tabs').innerHTML = html;
  }

  function renderFocus(r) {
    var list = [];
    if (S.tab === ALL) {
      r.categories.forEach(function (c) {
        c.focus.forEach(function (f) { list.push(Object.assign({ category: c.category }, f)); });
      });
    } else {
      var cat = r.categories.filter(function (c) { return c.category === S.tab; })[0];
      if (cat) list = cat.focus.map(function (f) { return Object.assign({ category: cat.category }, f); });
    }
    if (S.search) {
      var q = S.search.toLowerCase();
      list = list.filter(function (f) {
        return (f.name || '').toLowerCase().indexOf(q) >= 0 || (f.publisher || '').toLowerCase().indexOf(q) >= 0;
      });
    }
    var key = S.sortBy;
    list.sort(function (a, b) {
      if (key === 'rank') return (a.rank || 9e9) - (b.rank || 9e9);
      return (b[key] || 0) - (a[key] || 0);
    });
    var html = list.map(function (f) {
      var name = f.url ? '<a href="' + esc(f.url) + '" target="_blank" rel="noreferrer">' + esc(f.name) + '</a>' : esc(f.name);
      if (f.firstInTop100) name += '<span class="new-tag">新入前百</span>';
      return '<tr>' +
        '<td class="num">#' + f.rank + '</td>' +
        '<td class="wrap">' + name + '</td>' +
        '<td><span class="cat-chip">' + esc(f.category) + '</span></td>' +
        '<td class="num">' + chg(f.change) + '</td>' +
        '<td>' + spark(f.history) + '</td>' +
        '<td class="wrap">' + esc(f.market || '采集中…') + '</td>' +
        '<td class="wrap muted">' + esc(f.dlTop || '--') + '</td>' +
        '<td title="' + esc(f.publisher || '') + '">' + (f.hq ? esc(f.hq) : '--') + '</td>' +
        '<td class="sub wrap">' + esc((f.reasons || []).join('；')) + '</td></tr>';
    }).join('');
    document.getElementById('focusRows').innerHTML = html ||
      '<tr><td colspan="9"><div class="empty-hero">' +
      '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
      '<circle cx="21" cy="21" r="12"/><line x1="30" y1="30" x2="40" y2="40"/>' +
      '<line x1="16" y1="24" x2="16" y2="19"/><line x1="21" y1="24" x2="21" y2="15"/><line x1="26" y1="24" x2="26" y2="21"/></svg>' +
      '<div class="t1">焦点应用扫描中</div>' +
      '<div class="t2">榜单采集完成后自动出现，无需等待国别采集</div>' +
      '</div></td></tr>';
  }

  function renderRisers(r) {
    var html = (r.risers || []).map(function (f, i) {
      var name = f.url ? '<a href="' + esc(f.url) + '" target="_blank" rel="noreferrer">' + esc(f.name) + '</a>' : esc(f.name);
      return '<tr><td class="num muted">' + (i + 1) + '</td>' +
        '<td class="ellip">' + name + '</td>' +
        '<td><span class="cat-chip">' + esc(f.category) + '</span></td>' +
        '<td class="num">#' + f.rank + '</td>' +
        '<td class="num chg-up">▲' + f.change + '</td></tr>';
    }).join('');
    document.getElementById('riserRows').innerHTML = html || '<tr><td colspan="5"><div class="empty">暂无上升数据</div></td></tr>';
  }

  function renderSplit(r) {
    var s = r.marketSplit || { mature: 0, emerging: 0, unknown: 0 };
    var total = s.mature + s.emerging + s.unknown;
    var bar = document.getElementById('splitBar');
    if (!total) { bar.innerHTML = '<div class="u" style="flex:1"></div>'; }
    else {
      bar.innerHTML =
        '<div class="m" style="flex:' + s.mature + '"></div>' +
        '<div class="e" style="flex:' + s.emerging + '"></div>' +
        '<div class="u" style="flex:' + s.unknown + '"></div>';
    }
    document.getElementById('splitLegend').innerHTML =
      '<span class="lg"><span class="sw" style="background:#0066ff"></span>偏成熟 ' + s.mature + '</span>' +
      '<span class="lg"><span class="sw" style="background:#f5c542"></span>偏新兴 ' + s.emerging + '</span>' +
      '<span class="lg"><span class="sw" style="background:rgba(148,165,210,0.4)"></span>待采集 ' + s.unknown + '</span>';
  }

  function accountState(row) {
    if (row.duplicate) return { cls: 'warn', text: '邮箱重复' };
    if (row.state === 'ok') return { cls: 'done', text: '有效' };
    if (row.state === 'fail') return { cls: 'err', text: '失效' };
    if (row.state === 'login') return { cls: 'run', text: '登录中' };
    if (row.state === 'checking') return { cls: 'run', text: '检测中' };
    if (row.state === 'cached') return { cls: 'warn', text: '有缓存' };
    if (row.state === 'missing') return { cls: 'wait', text: '未创建' };
    return { cls: 'wait', text: '未检测' };
  }

  function renderAccounts() {
    var box = S.accounts || { accounts: [], loading: false, error: '' };
    var rows = box.accounts || [];
    var hint = document.getElementById('accountsHint');
    if (hint) {
      var ok = rows.filter(function (r) { return r.state === 'ok'; }).length;
      hint.textContent = box.error ? box.error : (rows.length ? ('有效 ' + ok + '/' + rows.length) : '本机 profile');
    }
    var btn = document.getElementById('accountRefresh');
    if (btn) {
      btn.disabled = !!box.loading;
      btn.textContent = box.loading ? '检测中...' : '检测登录态';
    }
    var runBtn = document.getElementById('runStart');
    var freshBtn = document.getElementById('runStartFresh');
    if (runBtn) {
      var run = S.run || {};
      var running = !!run.active;
      runBtn.disabled = !!box.loading || !!run.loading || running;
      runBtn.textContent = run.loading ? '启动中...' : (running ? '采集中' : '开始采集');
    }
    if (freshBtn) {
      var run2 = S.run || {};
      var running2 = !!run2.active;
      freshBtn.disabled = !!box.loading || !!run2.loading || running2;
      freshBtn.textContent = run2.loading ? '启动中...' : (running2 ? '采集中' : '全新采集');
    }
    var html = rows.map(function (row) {
      var st = accountState(row);
      var busy = row.state === 'login' || row.state === 'checking' || box.loading;
      var email = row.email ? esc(row.email) : '<span class="muted">' + esc(row.emailStatus || '--') + '</span>';
      var token = row.tokenSavedAt ? '<div class="sub">token ' + esc(ftime(row.tokenSavedAt)) + '</div>' : '';
      var detail = row.detail ? '<div class="sub">' + esc(row.detail) + '</div>' : token;
      return '<tr>' +
        '<td><span class="account-name">' + esc(row.label) + '</span></td>' +
        '<td><span class="ellip">' + esc(row.profile) + '</span>' + (row.exists ? '' : '<div class="sub">点击登录可创建</div>') + '</td>' +
        '<td class="wrap">' + email + '</td>' +
        '<td><span class="badge ' + st.cls + '">' + st.text + '</span>' + detail + '</td>' +
        '<td><span class="account-actions">' +
          '<button class="tool primary" type="button" data-login="' + esc(row.profile) + '"' + (busy ? ' disabled' : '') + '>捕捉</button>' +
        '</span></td>' +
      '</tr>';
    }).join('');
    document.getElementById('accountRows').innerHTML = html || '<tr><td colspan="5"><div class="empty">未发现账号 profile</div></td></tr>';
  }

  function loadRun() {
    return fetch('/api/run', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) { S.run = Object.assign({ active: false, loading: false, job: null }, j); renderAccounts(); return j; })
      .catch(function () {});
  }

  function loadAccounts() {
    return fetch('/api/accounts', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) { S.accounts = Object.assign({ loading: false, error: '' }, j); renderAccounts(); return j; })
      .catch(function () { S.accounts.error = '账号池读取失败'; S.accounts.loading = false; renderAccounts(); });
  }

  function checkAccounts() {
    S.accounts.loading = true;
    S.accounts.error = '';
    renderAccounts();
    fetch('/api/accounts/check', { method: 'POST', cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) { S.accounts = Object.assign({ loading: false, error: '' }, j); renderAccounts(); })
      .catch(function () { S.accounts.loading = false; S.accounts.error = '登录态检测失败'; renderAccounts(); });
  }

  function loginAccount(profile) {
    S.accounts.loading = true;
    renderAccounts();
    fetch('/api/accounts/login?profile=' + encodeURIComponent(profile), { method: 'POST', cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) S.accounts.error = j.error || '无法启动登录捕捉';
        S.accounts.loading = false;
        renderAccounts();
        loadAccounts();
        pollAccountsWhileBusy();
      })
      .catch(function () { S.accounts.loading = false; S.accounts.error = '无法启动登录捕捉'; renderAccounts(); });
  }

  function pollAccountsWhileBusy() {
    setTimeout(function () {
      loadAccounts().then(function (j) {
        var busy = (j.accounts || []).some(function (row) { return row.state === 'login' || row.state === 'checking'; });
        if (busy) pollAccountsWhileBusy();
      });
    }, 3000);
  }

  function buildRunQuery(fresh) {
    var settings = writeSettings();
    var params = new URLSearchParams();
    if (fresh) params.set('fresh', '1');
    if (settings.weekAnchor) params.set('weekAnchor', settings.weekAnchor);
    if (settings.listOnly) params.set('listOnly', '1');
    if (settings.skipExcel) params.set('skipExcel', '1');
    (settings.accounts || []).forEach(function (acc) { params.append('account', acc); });
    return params.toString();
  }

  function startRun(fresh) {
    S.run.loading = true;
    renderAccounts();
    fetch('/api/run/start?' + buildRunQuery(!!fresh), { method: 'POST', cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        S.run = Object.assign({ loading: false }, j.run || {}, { loading: false });
        renderAccounts();
        fetchOnce();
        loadRun();
        pollRunWhileBusy();
      })
      .catch(function () {
        S.run.loading = false;
        renderAccounts();
      });
  }

  function pollRunWhileBusy() {
    setTimeout(function () {
      loadRun().then(function (j) {
        fetchOnce();
        if (j && j.active) pollRunWhileBusy();
      });
    }, 3000);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function initResizablePanels() {
    var DEFAULT_LAYOUT = {
      colSplit: 0.68,
      leftRows: [0.34, 0.66],
      rightRows: [0.18, 0.12, 0.52, 0.18],
      rightVariableSplit: 0.18 / (0.18 + 0.52)
    };
    var RIGHT_SPLIT_MIN = 0.2;
    var RIGHT_SPLIT_MAX = 0.82;
    var main = document.querySelector('.main');
    var cols = document.querySelectorAll('.main > .col');
    var leftCol = cols[0];
    var rightCol = cols[1];
    var leftPanels = [
      document.querySelector('[data-panel="category-progress"]'),
      document.querySelector('[data-panel="focus-apps"]')
    ];
    var rightPanels = [
      document.querySelector('[data-panel="risers"]'),
      document.querySelector('[data-panel="market-split"]'),
      document.querySelector('[data-panel="events"]'),
      document.querySelector('[data-panel="context"]')
    ];
    var state = sanitizeState(loadJson(PANEL_KEY, DEFAULT_LAYOUT));
    var handles = {};

    function finiteNumber(v) {
      return typeof v === 'number' && isFinite(v);
    }

    function cssPx(el, prop, fallback) {
      if (!el) return fallback;
      var n = parseFloat(window.getComputedStyle(el)[prop]);
      return isFinite(n) ? n : fallback;
    }

    function normalizeRatios(arr, count, fallback) {
      var source = Array.isArray(arr) && arr.length === count ? arr : fallback;
      var clean = source.map(function (v, i) {
        v = Number(v);
        return isFinite(v) && v > 0 ? v : fallback[i];
      });
      var sum = clean.reduce(function (a, b) { return a + b; }, 0) || 1;
      return clean.map(function (v) { return v / sum; });
    }

    function sanitizeState(raw) {
      var rightRows = normalizeRatios(raw && raw.rightRows, rightPanels.length, DEFAULT_LAYOUT.rightRows);
      var variableBase = rightRows[0] + rightRows[2];
      var variableSplit = finiteNumber(raw && raw.rightVariableSplit)
        ? raw.rightVariableSplit
        : (variableBase ? rightRows[0] / variableBase : DEFAULT_LAYOUT.rightVariableSplit);
      return {
        colSplit: finiteNumber(raw && raw.colSplit) ? clamp(raw.colSplit, 0.2, 0.8) : DEFAULT_LAYOUT.colSplit,
        leftRows: normalizeRatios(raw && raw.leftRows, leftPanels.length, DEFAULT_LAYOUT.leftRows),
        rightRows: rightRows,
        rightVariableSplit: clamp(variableSplit, RIGHT_SPLIT_MIN, RIGHT_SPLIT_MAX)
      };
    }

    function mainGap() {
      return cssPx(main, 'columnGap', 11.2);
    }

    function rowGap(col) {
      return cssPx(col, 'rowGap', 11.2);
    }

    function isStackedLayout() {
      return window.matchMedia('(max-width: 1180px)').matches;
    }

    function minColumnWidth(total) {
      return Math.min(320, Math.max(220, Math.floor(total / 2) - 1));
    }

    function minPanelSize(total, count) {
      var cap = Math.max(24, Math.floor(total / Math.max(1, count)) - 2);
      return Math.min(64, cap);
    }

    function minVariablePanelSize(total) {
      return Math.min(120, Math.max(72, Math.floor(total / 4)));
    }

    function preferredLockedHeight(panel, fallback, min, max) {
      var head = panel ? panel.querySelector('.head') : null;
      var body = panel ? (panel.querySelector('.body') || panel.querySelector('.kv-list') || panel.querySelector('.split-legend')) : null;
      var content = (head ? head.offsetHeight : 0) + (body ? body.scrollHeight : 0) + 2;
      var needed = content > 20 ? Math.max(fallback, content) : fallback;
      return clamp(Math.round(needed), min, max);
    }

    function categoryProgressMaxHeight(total) {
      var panel = leftPanels[0];
      var head = panel ? panel.querySelector('.head') : null;
      var body = panel ? panel.querySelector('.body') : null;
      var thead = body ? body.querySelector('thead') : null;
      var rows = body ? Array.prototype.slice.call(body.querySelectorAll('tbody tr')) : [];
      var measuredRows = rows
        .map(function (row) { return row.offsetHeight; })
        .filter(function (h) { return h > 0; })
        .slice(0, 6);
      var rowHeight = measuredRows.length
        ? measuredRows.reduce(function (a, b) { return a + b; }, 0) / measuredRows.length
        : 36;
      var rowCount = rows.length ? Math.min(6, rows.length) : 6;
      var bodyPad = body ? cssPx(body, 'paddingTop', 0) + cssPx(body, 'paddingBottom', 8) : 8;
      var content = (head ? head.offsetHeight : 48) + bodyPad + (thead ? thead.offsetHeight : 34) + rowHeight * rowCount + 8;
      var minFocus = Math.max(220, minPanelSize(total, 2));
      return clamp(Math.round(content), 180, Math.max(180, total - minFocus));
    }

    function clearLayoutStyles() {
      main.style.gridTemplateColumns = '';
      [leftCol, rightCol].forEach(function (col) {
        if (!col) return;
        col.style.flex = '';
        col.style.width = '';
      });
      leftPanels.concat(rightPanels).forEach(function (panel) {
        if (!panel) return;
        panel.style.flex = '';
        panel.style.height = '';
        panel.style.width = '';
      });
      positionHandles(true);
    }

    function applyColumnRows(col, panels, ratios) {
      if (!col) return;
      var gap = rowGap(col);
      var total = Math.max(0, col.clientHeight - gap * (panels.length - 1));
      var normalized = normalizeRatios(ratios, panels.length, panels === leftPanels ? DEFAULT_LAYOUT.leftRows : DEFAULT_LAYOUT.rightRows);
      if (panels === leftPanels && panels.length === 2) {
        var minTop = minPanelSize(total, 2);
        var maxTop = Math.max(minTop, Math.min(categoryProgressMaxHeight(total), total - minTop));
        var top = clamp(Math.round(total * normalized[0]), minTop, maxTop);
        var bottom = Math.max(0, total - top);
        state.leftRows = total ? [top / total, bottom / total] : DEFAULT_LAYOUT.leftRows.slice();
        panels[0].style.flex = '0 0 auto';
        panels[0].style.height = top + 'px';
        panels[0].style.width = '';
        panels[1].style.flex = '0 0 auto';
        panels[1].style.height = bottom + 'px';
        panels[1].style.width = '';
        return;
      }
      panels.forEach(function (panel, i) {
        if (!panel) return;
        panel.style.flex = '0 0 auto';
        panel.style.height = Math.max(0, Math.round(total * normalized[i])) + 'px';
        panel.style.width = '';
      });
    }

    function fixedRightHeights(total) {
      var marketBase = clamp(Math.round(total * DEFAULT_LAYOUT.rightRows[1]), 96, 124);
      var contextBase = clamp(Math.round(total * 0.14), 132, 180);
      var market = preferredLockedHeight(rightPanels[1], marketBase, 96, 132);
      var context = preferredLockedHeight(rightPanels[3], contextBase, 120, 210);
      var minVariable = minVariablePanelSize(total);
      var maxFixed = Math.max(0, total - minVariable * 2);
      if (market + context > maxFixed) {
        var scale = maxFixed / Math.max(1, market + context);
        market = Math.max(64, Math.floor(market * scale));
        context = Math.max(120, Math.floor(context * scale));
      }
      return { market: market, context: context };
    }

    function rightMetrics() {
      var gap = rowGap(rightCol);
      var total = Math.max(0, rightCol.clientHeight - gap * (rightPanels.length - 1));
      var fixed = fixedRightHeights(total);
      var variable = Math.max(0, total - fixed.market - fixed.context);
      var minVariable = Math.min(minVariablePanelSize(variable), Math.max(0, Math.floor(variable / 2) - 1));
      var split = clamp(state.rightVariableSplit, RIGHT_SPLIT_MIN, RIGHT_SPLIT_MAX);
      var risers = variable ? clamp(Math.round(variable * split), minVariable, variable - minVariable) : 0;
      var events = Math.max(0, variable - risers);
      return {
        total: total,
        gap: gap,
        fixed: fixed,
        variable: variable,
        minVariable: minVariable,
        sizes: [risers, fixed.market, events, fixed.context]
      };
    }

    function applyRightRows() {
      if (!rightCol) return;
      var metrics = rightMetrics();
      rightPanels.forEach(function (panel, i) {
        if (!panel) return;
        panel.style.flex = '0 0 auto';
        panel.style.height = Math.max(0, Math.round(metrics.sizes[i])) + 'px';
        panel.style.width = '';
      });
      if (metrics.variable) state.rightVariableSplit = clamp(metrics.sizes[0] / metrics.variable, RIGHT_SPLIT_MIN, RIGHT_SPLIT_MAX);
      state.rightRows = metrics.total
        ? metrics.sizes.map(function (v) { return v / metrics.total; })
        : DEFAULT_LAYOUT.rightRows.slice();
    }

    function setHandleBox(handle, box, hidden) {
      if (!handle) return;
      handle.style.display = hidden ? 'none' : 'block';
      if (hidden) return;
      handle.style.left = Math.round(box.left) + 'px';
      handle.style.top = Math.round(box.top) + 'px';
      handle.style.width = Math.max(4, Math.round(box.width)) + 'px';
      handle.style.height = Math.max(4, Math.round(box.height)) + 'px';
    }

    function positionHandles(hidden) {
      var hide = hidden || isStackedLayout();
      if (hide) {
        Object.keys(handles).forEach(function (key) { setHandleBox(handles[key], {}, true); });
        return;
      }
      var gap = mainGap();
      setHandleBox(handles.column, {
        left: leftCol.offsetLeft + leftCol.offsetWidth,
        top: 0,
        width: gap,
        height: main.clientHeight
      }, false);
      var leftGap = rowGap(leftCol);
      setHandleBox(handles.leftRows, {
        left: 0,
        top: leftPanels[0].offsetTop + leftPanels[0].offsetHeight,
        width: leftCol.clientWidth,
        height: leftGap
      }, false);
      var rightGap = rowGap(rightCol);
      setHandleBox(handles.rightTop, {
        left: 0,
        top: rightPanels[0].offsetTop + rightPanels[0].offsetHeight,
        width: rightCol.clientWidth,
        height: rightGap
      }, false);
      setHandleBox(handles.rightMiddle, {
        left: 0,
        top: rightPanels[1].offsetTop + rightPanels[1].offsetHeight,
        width: rightCol.clientWidth,
        height: rightGap
      }, false);
    }

    function applyLayout() {
      if (!main || !leftCol || !rightCol) return;
      if (isStackedLayout()) {
        clearLayoutStyles();
        return;
      }
      var gap = mainGap();
      var totalW = Math.max(0, main.clientWidth - gap);
      var minW = minColumnWidth(totalW);
      var leftW = clamp(Math.round(totalW * state.colSplit), minW, totalW - minW);
      var rightW = Math.max(320, totalW - leftW);
      rightW = totalW - leftW;
      state.colSplit = totalW ? leftW / totalW : state.colSplit;
      main.style.gridTemplateColumns = leftW + 'px ' + rightW + 'px';
      leftCol.style.flex = '0 0 auto';
      rightCol.style.flex = '0 0 auto';
      leftCol.style.width = '';
      rightCol.style.width = '';
      applyColumnRows(leftCol, leftPanels, state.leftRows);
      applyRightRows();
      positionHandles(false);
    }

    function saveState() {
      saveJson(PANEL_KEY, state);
    }

    function columnDragStart() {
      var total = leftCol.getBoundingClientRect().width + rightCol.getBoundingClientRect().width;
      return {
        left: leftCol.getBoundingClientRect().width,
        total: total,
        min: minColumnWidth(total)
      };
    }

    function resizeColumns(start, dx) {
      if (!start || !start.total) return;
      var nextLeft = clamp(start.left + dx, start.min, start.total - start.min);
      state.colSplit = nextLeft / start.total;
      applyLayout();
    }

    function rowDragStart(which) {
      var col = which === 'leftRows' ? leftCol : rightCol;
      var panels = which === 'leftRows' ? leftPanels : rightPanels;
      var fallback = which === 'leftRows' ? DEFAULT_LAYOUT.leftRows : DEFAULT_LAYOUT.rightRows;
      var ratios = normalizeRatios(state[which], panels.length, fallback);
      var gap = rowGap(col);
      var total = Math.max(0, col.clientHeight - gap * (panels.length - 1));
      return {
        sizes: ratios.map(function (r) { return r * total; }),
        total: total,
        min: minPanelSize(total, panels.length)
      };
    }

    function resizeRows(which, index, start, dy) {
      if (!start || !start.total) return;
      var sizes = start.sizes.slice();
      var sumPair = start.sizes[index] + start.sizes[index + 1];
      var min = Math.min(start.min, Math.max(0, Math.floor(sumPair / 2) - 1));
      var maxA = sumPair - min;
      if (which === 'leftRows' && index === 0) {
        maxA = Math.min(maxA, categoryProgressMaxHeight(start.total));
      }
      var a = clamp(start.sizes[index] + dy, min, maxA);
      var b = sumPair - a;
      sizes[index] = a;
      sizes[index + 1] = b;
      var next = sizes.map(function (v) { return v / start.total; });
      if (which === 'leftRows') state.leftRows = next;
      else state.rightRows = next;
      applyLayout();
    }

    function rightVariableDragStart() {
      var metrics = rightMetrics();
      return {
        risers: metrics.sizes[0],
        variable: metrics.variable,
        min: metrics.minVariable
      };
    }

    function resizeRightVariable(start, dy, mode) {
      if (!start || !start.variable) return;
      var delta = mode === 'bottom' ? -dy : dy;
      var nextRisers = clamp(start.risers + delta, start.min, start.variable - start.min);
      state.rightVariableSplit = clamp(nextRisers / start.variable, RIGHT_SPLIT_MIN, RIGHT_SPLIT_MAX);
      applyLayout();
    }

    var layoutPending = false;
    function scheduleLayout() {
      if (layoutPending) return;
      layoutPending = true;
      window.requestAnimationFrame(function () {
        layoutPending = false;
        applyLayout();
      });
    }

    function addHandle(parent, className, onStart, onMove) {
      if (!parent) return null;
      var handle = document.createElement('div');
      handle.className = className;
      parent.appendChild(handle);
      handle.addEventListener('pointerdown', function (ev) {
        ev.preventDefault();
        if (isStackedLayout()) return;
        var startX = ev.clientX;
        var startY = ev.clientY;
        var start = onStart();
        handle.classList.add('dragging');
        handle.setPointerCapture(ev.pointerId);
        function move(e2) {
          onMove(start, e2.clientX - startX, e2.clientY - startY);
        }
        function up(e3) {
          try { handle.releasePointerCapture(e3.pointerId); } catch (e) {}
          handle.classList.remove('dragging');
          handle.removeEventListener('pointermove', move);
          handle.removeEventListener('pointerup', up);
          handle.removeEventListener('pointercancel', up);
          saveState();
        }
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', up);
        handle.addEventListener('pointercancel', up);
      });
      return handle;
    }

    handles.column = addHandle(main, 'resizer col-split', columnDragStart, function (start, dx) {
      resizeColumns(start, dx);
    });
    handles.leftRows = addHandle(leftCol, 'resizer row-split', function () {
      return rowDragStart('leftRows');
    }, function (start, dx, dy) {
      resizeRows('leftRows', 0, start, dy);
    });
    handles.rightTop = addHandle(rightCol, 'resizer row-split', rightVariableDragStart, function (start, dx, dy) {
      resizeRightVariable(start, dy, 'top');
    });
    handles.rightMiddle = addHandle(rightCol, 'resizer row-split', rightVariableDragStart, function (start, dx, dy) {
      resizeRightVariable(start, dy, 'middle');
    });
    applyLayout();
    window.addEventListener('resize', scheduleLayout);
    window.appmagicRelayoutPanels = scheduleLayout;
    if (window.ResizeObserver) {
      var layoutObserver = new ResizeObserver(function () {
        scheduleLayout();
      });
      layoutObserver.observe(main);
    }
  }

  function renderRight(p) {
    var events = (p && p.events || []).slice().reverse().map(function (e, i) {
      var extra = [];
      if (e.account) extra.push(accShort(e.account));
      if (e.category) extra.push(e.category);
      return '<div class="event' + (i === 0 ? ' newest' : '') + '" data-l="' + esc(e.level || 'info') + '">' +
        '<div class="t">' + esc(ftime(e.at)) + (extra.length ? ' · ' + esc(extra.join(' · ')) : '') + '</div>' +
        '<div class="m">' + esc(zh(e.message)) + '</div></div>';
    }).join('');
    document.getElementById('events').innerHTML = events || '<div class="empty">暂无事件（运行开始后展示）</div>';

    var out = p ? (p.outputDir || '') : '';
    var ctx = [
      ['阶段', esc(p ? zh(p.stageLabel || p.currentStage || '--') : '--')],
      ['周序列', esc(p && p.weeks ? p.weeks.join('，') : '--')],
      ['输出目录', out
        ? '<a href="#" id="openDir" title="点击打开本地文件夹">' + esc(out) + '</a>'
        : '--'],
    ];
    document.getElementById('ctx').innerHTML = ctx.map(function (kv) {
      return '<div class="kv"><span class="k">' + kv[0] + '</span><span class="v">' + kv[1] + '</span></div>';
    }).join('');
    var openDir = document.getElementById('openDir');
    if (openDir) {
      openDir.addEventListener('click', function (e) {
        e.preventDefault();
        fetch('/api/open-output', { method: 'POST' }).catch(function () {});
      });
    }
    if (window.appmagicRelayoutPanels) window.appmagicRelayoutPanels();
  }

  document.getElementById('tabs').addEventListener('click', function (e) {
    var t = e.target.closest('.tab');
    if (!t) return;
    S.tab = t.getAttribute('data-c');
    render();
  });
  document.getElementById('sortBy').addEventListener('change', function (e) { S.sortBy = e.target.value; render(); });
  document.getElementById('search').addEventListener('input', function (e) { S.search = e.target.value.trim(); render(); });
  document.getElementById('settingsOpen').addEventListener('click', function () { openSettings(); });
  document.getElementById('settingsClose').addEventListener('click', function () { closeSettings(); });
  document.getElementById('settingsOverlay').addEventListener('click', function (e) {
    if (e.target === document.getElementById('settingsOverlay')) closeSettings();
  });
  document.getElementById('runStart').addEventListener('click', function () { startRun(false); });
  document.getElementById('runStartFresh').addEventListener('click', function () { startRun(true); });
  document.getElementById('accountRefresh').addEventListener('click', function () { checkAccounts(); });
  document.getElementById('accountRows').addEventListener('click', function (e) {
    var t = e.target.closest('[data-login]');
    if (!t) return;
    loginAccount(t.getAttribute('data-login'));
  });
  Array.prototype.forEach.call(document.querySelectorAll('#accountChecks input, #weekAnchorInput, #listOnlyInput, #skipExcelInput'), function (el) {
    el.addEventListener('change', function () { writeSettings(); });
  });

  function setConn(ok, text) {
    var chip = document.getElementById('connChip');
    chip.className = 'chip ' + (ok ? 'ok' : 'warn');
    document.getElementById('connText').textContent = text;
  }
  function startSSE() {
    if (S.es) try { S.es.close(); } catch (e) {}
    var es = new EventSource('/api/stream');
    S.es = es;
    es.onopen = function () { setConn(true, '实时'); stopPoll(); };
    es.onmessage = function (ev) {
      try { S.data = JSON.parse(ev.data); render(); } catch (e) {}
    };
    es.onerror = function () {
      setConn(false, '重连中');
      startPoll();
    };
  }
  function startPoll() {
    if (S.pollTimer) return;
    S.pollTimer = setInterval(fetchOnce, 3000);
  }
  function stopPoll() {
    if (S.pollTimer) { clearInterval(S.pollTimer); S.pollTimer = null; }
  }
  function fetchOnce() {
    fetch('/api/snapshot', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) { S.data = j; render(); })
      .catch(function () {});
  }

  applySettings();
  initResizablePanels();
  loadAccounts();
  loadRun();
  fetchOnce();
  startSSE();
})();
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const url = parsedUrl.pathname;

  if (url.startsWith('/api/stream')) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
    });
    res.write('retry: 3000\n\n');
    res.write('data: ' + JSON.stringify(snapshot()) + '\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (url.startsWith('/api/snapshot')) return json(res, 200, snapshot());

  if (url.startsWith('/api/progress')) {
    const p = readProgress(latestRunDir());
    return json(res, 200, p || {});
  }

  if (url.startsWith('/api/results')) return json(res, 200, readResults(latestRunDir()));

  if (url === '/api/accounts') {
    return json(res, 200, {
      ok: true,
      projectDir: PROJECT_DIR,
      accounts: accountRows(),
      checking: !!authCheckAll,
    });
  }

  if (url === '/api/accounts/check') {
    if ((req.method || 'GET').toUpperCase() !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' });
    runAuthCheck().then(result => json(res, 200, {
      ok: true,
      accounts: accountRows(),
      output: result.output ? result.output.slice(-4000) : '',
    })).catch(error => json(res, 500, { ok: false, error: error.message || String(error), accounts: accountRows() }));
    return;
  }

  if (url === '/api/accounts/login') {
    if ((req.method || 'GET').toUpperCase() !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' });
    const profile = parsedUrl.searchParams.get('profile') || '';
    const result = startLoginCapture(profile);
    return json(res, result.ok ? 200 : 400, { ...result, accounts: accountRows() });
  }

  if (url === '/api/run') {
    return json(res, 200, runSummary());
  }

  if (url === '/api/run/start') {
    if ((req.method || 'GET').toUpperCase() !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' });
    const result = startCollectionRun({
      fresh: parsedUrl.searchParams.get('fresh') === '1',
      weekAnchor: parsedUrl.searchParams.get('weekAnchor') || '',
      listOnly: parsedUrl.searchParams.get('listOnly') === '1',
      skipExcel: parsedUrl.searchParams.get('skipExcel') === '1',
      accounts: parsedUrl.searchParams.getAll('account'),
    });
    return json(res, result.ok ? 200 : 409, result);
  }

  // 在本机文件管理器中打开当前运行的输出目录（目录由服务端自行解析，不接受任何外部路径）
  if (url.startsWith('/api/open-output')) {
    const runDir = latestRunDir();
    if (!runDir) return json(res, 404, { ok: false, error: 'no run dir' });
    const cp = require('child_process');
    try {
      if (process.platform === 'win32') cp.exec('explorer "' + runDir + '"');
      else if (process.platform === 'darwin') cp.exec('open "' + runDir + '"');
      else cp.exec('xdg-open "' + runDir + '"');
      return json(res, 200, { ok: true, dir: runDir });
    } catch {
      return json(res, 500, { ok: false });
    }
  }

  if (url.startsWith('/api/health')) {
    const runDir = latestRunDir();
    return json(res, 200, {
      ok: true,
      projectDir: PROJECT_DIR,
      port: PORT,
      runDir,
      hasProgress: !!readProgress(runDir),
      sseClients: clients.size,
    });
  }

  if (url.startsWith('/favicon')) { res.statusCode = 204; return res.end(); }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(PAGE);
});

server.listen(PORT, () => {
  console.log(`AppMagic dashboard: http://localhost:${PORT}`);
  if (!AUTO_OPEN) return;
  const url = `http://localhost:${PORT}`;
  const cp = require('child_process');
  try {
    if (process.platform === 'win32') cp.exec(`start "" "${url}"`);
    else if (process.platform === 'darwin') cp.exec(`open "${url}"`);
    else cp.exec(`xdg-open "${url}"`);
  } catch {}
});
