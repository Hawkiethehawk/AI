// @ts-check
// AppMagic 每周榜单抓取器
// 约束记录（2026-06-26 实测）：
//   1. tag URL 参数(?tag=<id>)完全生效，但 AppMagic 有 Cloudflare Turnstile 限流：
//      连续快速请求会返回"降级全榜"（#1 变 ChatGPT）或空榜。必须每个 tag 间隔 ≥18s。
//   2. 未登录状态下「下载量/收入数值」被锁（col-1 内只有 .g-icon-lock 锁图标）。
//      榜单页可免费拿到：排名、周环比变化(NEW/↑/↓)、应用名、发行商、商店、商店链接。
//      国家分布/评分/上线日期需进 App Detail 页（另见 enrich 流程）。
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');

const CONFIG = {
  HEADLESS: true,
  OUTPUT_DIR: './output/data/',
  SCREENSHOT_DIR: './output/image/',
  WEEK_TAG: getWeekTag(),
  TOP_N: 100,
  PER_TAG_DELAY: 18000,   // 每个 tag 之间的间隔（限流保护）
  BATCH_SIZE: 6,          // 每抓 N 个 tag 后长休息
  BATCH_REST: 60000,      // 长休息时长
  NAV_WAIT: 9000,         // goto 后等待渲染
};

// ✅ tag id 已通过实测验证生效
const GAME_TAGS = {
  hypercasual:   { id: '126',     label: 'Hypercasual',         grade: 'Games → Hypercasual' },
  hybridPuzzle:  { id: '244055',  label: 'Hybridcasual',        grade: 'Games → Hybridcasual' },
  match3:        { id: '84',      label: 'Match-3',             grade: 'Games → Puzzle → Match-3' },
  merge2:        { id: '243373',  label: 'Merge',               grade: 'Games → Puzzle → Merge' },
  match3d:       { id: '243716',  label: 'Match 3D',            grade: 'Games → Puzzle → Match 3D' },
  sortPuzzle:    { id: '243715',  label: 'Sort Puzzle',         grade: 'Games → Puzzle → Sort Puzzle' },
  blockPuzzle:   { id: '243367',  label: 'Block Puzzle',        grade: 'Games → Puzzle → Block Puzzle' },
  farmingSim:    { id: '243792',  label: 'Farming Sim',         grade: 'Games → Simulation → Farming Life Sim' },
  casualCasino:  { id: '29',      label: 'Casino',              grade: 'Games → Casino' },
  io:            { id: '5',       label: '.io Games',           grade: 'Games → Arcade → .io' },
};

const TOOL_TAGS = {
  launcher:        { id: '243528', label: 'Launcher',          grade: 'Apps → Personalization → Launcher' },
  antivirusCleaner:{ id: '119',    label: 'Antivirus & Cleaner',grade: 'Apps → Utilities → Antivirus & Cleaner' },
  antivirus:       { id: '243485', label: 'Antivirus',         grade: 'Apps → Utilities → Antivirus' },
  recovery:        { id: '243477', label: 'File Recovery',     grade: 'Apps → Utilities → Recovery' },
  pdfReader:       { id: '244699', label: 'PDF Reader',        grade: 'Apps → Productivity → PDF Reader' },
};

const TARGET_TAGS = [...Object.values(GAME_TAGS), ...Object.values(TOOL_TAGS)];

function getWeekTag() {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `W${String(weekNum).padStart(2, '0')}`;
}
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// 榜单页提取（精准 selector，2026-06-26 校准）
// ============================================================
async function extractRankings(page) {
  return await page.evaluate(() => {
    const items = document.querySelectorAll('TOP-APPS-ITEM');
    const out = [];
    for (const item of items) {
      const e = {};
      const numEl = item.querySelector('app-list-item-number');
      e.rank = numEl?.querySelector('.top-position-number')?.textContent?.trim() || '';

      // 周环比变化：靠 hidden 状态判断
      let change = '0';
      const newEl = numEl?.querySelector('.diff-new');
      const upEl  = numEl?.querySelector('.diff-up');
      const downEl= numEl?.querySelector('.diff-down');
      const visible = el => el && !el.hasAttribute('hidden');
      if (visible(newEl)) {
        change = 'NEW';
      } else if (visible(upEl)) {
        const n = (upEl.textContent || '').replace(/\D/g, '');
        change = '+' + (n || '?');
      } else if (visible(downEl)) {
        const n = (downEl.textContent || '').replace(/\D/g, '');
        change = '-' + (n || '?');
      }
      e.rankChange = change;

      // 应用名 + 链接
      const nameLink = item.querySelector('a.g-app-name');
      e.appName = nameLink?.getAttribute('title') || nameLink?.textContent?.trim() || '';
      e.appUrl  = nameLink?.getAttribute('href') || '';

      // 发行商（真正的 selector）
      const pubLink = item.querySelector('a.g-app-publisher-name');
      e.publisher = (pubLink?.textContent || '').replace(/\s+/g, ' ').trim();
      e.publisherUrl = pubLink?.getAttribute('href') || '';

      // 商店
      e.stores = [...item.querySelectorAll('stores-info img.store-icon')]
        .map(i => i.getAttribute('title')).filter(Boolean);

      // 下载量是否被锁
      e.metricLocked = !!item.querySelector('.col-1 .g-icon-lock');

      e.iconUrl = item.querySelector('img.application-image')?.getAttribute('src') || '';
      out.push(e);
    }
    return out;
  });
}

async function main() {
  ensureDir(CONFIG.OUTPUT_DIR);
  ensureDir(CONFIG.SCREENSHOT_DIR);

  // 复用 .appmagic-userdata 的登录态（由 appmagic-login.js 建立）
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: CONFIG.HEADLESS,
    args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = context.pages()[0] || await context.newPage();
  const allResults = {};
  let i = 0;

  for (const tag of TARGET_TAGS) {
    i++;
    console.log(`\n[${i}/${TARGET_TAGS.length}] 📊 ${tag.label} (${tag.grade})`);
    try {
      const url = `https://appmagic.rocks/top-charts/apps?aggregation=week&tag=${tag.id}&sort=downloads&measure=downloads&store=united`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(CONFIG.NAV_WAIT);
      await page.waitForSelector('TOP-APPS-ITEM', { timeout: 15000 }).catch(() => {});

      let rankings = await extractRankings(page);

      // 限流降级检测：若 #1 是 ChatGPT 或全是巨头则视为降级，重试一次
      const looksDegraded = rankings[0] && /chatgpt|tiktok|whatsapp/i.test(rankings[0].appName);
      if ((rankings.length === 0 || looksDegraded)) {
        console.log(`  ⚠️ 疑似限流降级(#1=${rankings[0]?.appName||'空'})，等待 30s 重试...`);
        await sleep(30000);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await sleep(CONFIG.NAV_WAIT + 3000);
        await page.waitForSelector('TOP-APPS-ITEM', { timeout: 15000 }).catch(() => {});
        rankings = await extractRankings(page);
      }
      console.log(`  ✅ ${rankings.length} 行 | #1: ${rankings[0]?.appName || '-'}`);

      const shot = path.join(CONFIG.SCREENSHOT_DIR,
        `appmagic-${tag.label.replace(/\s+/g, '-').replace(/[^\w-]/g,'').toLowerCase()}-${CONFIG.WEEK_TAG}.png`);
      await page.screenshot({ path: shot, fullPage: false });

      allResults[tag.label] = {
        tag: tag.grade, tagId: tag.id, url,
        rankings: rankings.slice(0, CONFIG.TOP_N),
        screenshot: shot, fetchedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error(`  ❌ ${tag.label}: ${err.message}`);
      allResults[tag.label] = { error: err.message, tag: tag.grade, tagId: tag.id };
    }

    if (i < TARGET_TAGS.length) {
      const rest = (i % CONFIG.BATCH_SIZE === 0) ? CONFIG.BATCH_REST : CONFIG.PER_TAG_DELAY;
      console.log(`  ⏳ 休息 ${rest/1000}s`);
      await sleep(rest);
    }
  }
  await context.close();

  const rawPath = path.join(CONFIG.OUTPUT_DIR, `appmagic-raw-${CONFIG.WEEK_TAG}.json`);
  fs.writeFileSync(rawPath, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`\n📁 原始数据: ${rawPath}`);

  const md = generateMarkdown(allResults);
  const mdPath = path.join(CONFIG.OUTPUT_DIR, `appmagic-weekly-${CONFIG.WEEK_TAG}.md`);
  fs.writeFileSync(mdPath, md, 'utf-8');
  console.log(`📁 周报: ${mdPath}`);
  console.log('\n✅ 完成');
}

// ============================================================
// Markdown 生成（含自动归集：新品 / 关键位移）
// ============================================================
function changeNum(c) {
  if (c === 'NEW') return null;
  const m = /^([+-])(\d+)/.exec(c || '');
  return m ? (m[1] === '+' ? +m[2] : -m[2]) : 0;
}
function renderTable(rankings, limit) {
  const lines = ['| 排名 | 变化 | 应用名 | 发行商 | 商店 |', '|--:|:--|:--|:--|:--|'];
  for (const r of rankings.slice(0, limit)) {
    const name = r.appUrl ? `[${r.appName}](https://appmagic.rocks${r.appUrl})` : r.appName;
    const ch = r.rankChange === 'NEW' ? '🆕' : r.rankChange === '0' ? '—' :
      (r.rankChange?.startsWith('+') ? '🔺' + r.rankChange.slice(1) : '🔻' + r.rankChange.slice(1));
    const pub = (r.publisher || '').replace(/\|/g, '\\|');
    const stores = (r.stores || []).map(s => s.includes('Google') ? 'GP' : s.includes('iP') ? 'iOS' : s).join('+');
    lines.push(`| ${r.rank} | ${ch} | ${name} | ${pub} | ${stores} |`);
  }
  return lines;
}
function generateMarkdown(allResults) {
  const dateStr = new Date().toISOString().split('T')[0];
  const L = [];
  L.push(`# AppMagic 每周榜单追踪 · ${CONFIG.WEEK_TAG}（${dateStr}）`);
  L.push('');
  L.push(`> 数据口径：全球 · 周聚合 · 下载量排序 · Top ${CONFIG.TOP_N}（未登录，下载量数值被锁，仅排名/变化可见）`);
  L.push('');

  // ---- 自动归集：新品 + 关键位移 ----
  const newcomers = [], movers = [];
  for (const tag of TARGET_TAGS) {
    const res = allResults[tag.label];
    if (!res || res.error) continue;
    for (const r of (res.rankings || [])) {
      const rk = parseInt(r.rank, 10);
      if (r.rankChange === 'NEW' && rk <= 100) newcomers.push({ ...r, cat: tag.label, rk });
      const d = changeNum(r.rankChange);
      if (d !== null && Math.abs(d) >= 5) movers.push({ ...r, cat: tag.label, rk, d });
    }
  }
  newcomers.sort((a, b) => a.rk - b.rk);
  movers.sort((a, b) => Math.abs(b.d) - Math.abs(a.d));

  L.push('## 🚩 本周新品（NEW 入榜）');
  L.push('');
  if (newcomers.length) {
    L.push('| 品类 | 排名 | 应用名 | 发行商 | 商店 |');
    L.push('|:--|--:|:--|:--|:--|');
    for (const r of newcomers) {
      const name = r.appUrl ? `[${r.appName}](https://appmagic.rocks${r.appUrl})` : r.appName;
      const stores = (r.stores || []).map(s => s.includes('Google') ? 'GP' : 'iOS').join('+');
      L.push(`| ${r.cat} | ${r.rk} | ${name} | ${(r.publisher||'').replace(/\|/g,'\\|')} | ${stores} |`);
    }
  } else L.push('> 本周各品类 Top 100 无 NEW 标记产品');
  L.push('');

  L.push('## ⚡ 关键位移（周环比 ↑↓ ≥5 位）');
  L.push('');
  if (movers.length) {
    L.push('| 品类 | 当前排名 | 位移 | 应用名 | 发行商 |');
    L.push('|:--|--:|:--:|:--|:--|');
    for (const r of movers.slice(0, 40)) {
      const name = r.appUrl ? `[${r.appName}](https://appmagic.rocks${r.appUrl})` : r.appName;
      const arrow = r.d > 0 ? `🔺${r.d}` : `🔻${Math.abs(r.d)}`;
      L.push(`| ${r.cat} | ${r.rk} | ${arrow} | ${name} | ${(r.publisher||'').replace(/\|/g,'\\|')} |`);
    }
  } else L.push('> 无 ≥5 位的位移');
  L.push('');

  const section = (title, tags) => {
    L.push(`## ${title}`);
    L.push('');
    for (const tag of tags) {
      const res = allResults[tag.label];
      L.push(`### ${tag.label}`);
      L.push(`> \`${tag.grade}\``);
      L.push('');
      if (!res || res.error) { L.push(`⚠️ 采集失败：${res?.error || '无数据'}`); L.push(''); continue; }
      const rankings = res.rankings || [];
      if (!rankings.length) { L.push('> 未提取到数据'); L.push(''); continue; }
      L.push(...renderTable(rankings, 20));
      if (rankings.length > 20) {
        L.push('');
        L.push(`<details><summary>显示完整 ${rankings.length} 条</summary>`);
        L.push('');
        L.push(...renderTable(rankings.slice(20), rankings.length));
        L.push('');
        L.push('</details>');
      }
      L.push('');
    }
  };
  section('一、游戏 · 超休闲 + 休闲', Object.values(GAME_TAGS));
  section('二、工具 · 重点品类', Object.values(TOOL_TAGS));

  L.push('## 三、截图索引');
  L.push('');
  L.push('| 品类 | 截图 |');
  L.push('|:--|:--|');
  for (const tag of TARGET_TAGS) {
    const res = allResults[tag.label];
    if (res?.screenshot) L.push(`| ${tag.label} | \`${res.screenshot}\` |`);
    else if (res?.error) L.push(`| ${tag.label} | ❌ ${res.error} |`);
  }
  L.push('');
  return L.join('\n');
}

main().catch(err => { console.error('❌ Fatal:', err); process.exit(1); });
