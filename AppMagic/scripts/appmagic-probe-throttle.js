// @ts-check
// Detail 页限流阈值探测 — 简化版
// 原则：固定间隔，每页足够久，不重试，不设批次，一次跑通找安全下限
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');
const OUT = path.resolve(__dirname, '../output/data/appmagic-probe-throttle.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- 配置 ----
const INTERVAL_MS = parseInt(process.env.IV || '60000', 10);

// 超休闲 Top 10（来自 API /api/v2/top/united-apps, 2026-06-22 周免费榜）
const URLS = [
  { rank: 1,  name: 'Amaze GO!',                         url: 'https://appmagic.rocks/google-play/amaze-go/com.oakever.arrows' },
  { rank: 2,  name: 'Arrow Puzzle: Tap Puzzle Games',     url: 'https://appmagic.rocks/google-play/arrow-puzzle-tap-puzzle-games/com.easybrain.arrow.puzzle.game' },
  { rank: 3,  name: 'Arrows – Puzzle Escape',             url: 'https://appmagic.rocks/google-play/arrows-puzzle-escape/com.ecffri.arrows' },
  { rank: 4,  name: 'Level Devil - NOT A Troll Game',     url: 'https://appmagic.rocks/google-play/level-devil-not-a-troll-game/com.unept.leveldevil' },
  { rank: 5,  name: 'Pizza Ready!',                       url: 'https://appmagic.rocks/google-play/pizza-ready/io.supercent.pizzaidle' },
  { rank: 6,  name: 'Paper.io 2',                         url: 'https://appmagic.rocks/google-play/paper-io-2/io.voodoo.paper2' },
  { rank: 7,  name: 'Bus Traffic Fever!',                 url: 'https://appmagic.rocks/google-play/bus-traffic-fever/jp.co.goodroid.hyper.busflow' },
  { rank: 8,  name: 'Mob Control',                        url: 'https://appmagic.rocks/google-play/mob-control/com.vincentb.MobControl' },
  { rank: 9,  name: 'Magic Tiles 3™ - Piano Game',        url: 'https://appmagic.rocks/google-play/magic-tiles-3-piano-game/com.youmusic.magictiles' },
  { rank: 10, name: 'Perfect Makeover Cleaning ASMR',     url: 'https://appmagic.rocks/google-play/perfect-makeover-cleaning-asmr/com.hmbl.perfect.makeover.cleaning.asmr' },
];

console.log(`🔧 配置: 间隔=${INTERVAL_MS/1000}s, URL数=${URLS.length} (超休闲 Top 10)`);
URLS.forEach(r => console.log(`  #${r.rank} ${r.name}`));

function checkPageHealth() {
  const hasAppPage = !!document.querySelector('APP-PAGE');
  const hasMetric = !!document.querySelector('metric-widget');
  const title = document.title || '';
  const body = document.body?.innerText || '';

  if (body.includes('Just a moment') || body.includes('cf-challenge')) return { ok: false, reason: 'Cloudflare' };
  if (body.includes('Page not found')) return { ok: false, reason: '404' };
  if (!hasAppPage && !hasMetric) return { ok: false, reason: 'no APP-PAGE/metric-widget' };
  return { ok: true, appName: title.replace(' — AppMagic', ''), hasMetric, hasAppPage };
}

async function main() {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  const results = [];
  for (let i = 0; i < URLS.length; i++) {
    const { rank, name, url } = URLS[i];
    const start = Date.now();

    console.log(`\n[${i+1}/${URLS.length}] #${rank} ${name}`);
    console.log(`  ${url}`);

    let httpStatus = '?', health = null, error = null;
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      httpStatus = resp?.status() || '?';
      await sleep(5000);
      await page.mouse.wheel(0, 500);
      await sleep(1000);
      health = await page.evaluate(checkPageHealth);
    } catch (e) {
      error = e.message;
      health = { ok: false, reason: `异常: ${e.message}` };
    }

    const elapsed = (Date.now() - start) / 1000;
    const icon = health?.ok ? '✅' : '❌';
    const extra = health?.ok ? `"${health.appName}"` : `原因: ${health?.reason}`;
    console.log(`  ${icon} HTTP ${httpStatus} | ${elapsed.toFixed(1)}s | ${extra}`);

    results.push({ i, rank, name, url, httpStatus, health, error, elapsedS: elapsed });

    if (i < URLS.length - 1) {
      console.log(`  ⏳ 等待 ${INTERVAL_MS/1000}s...`);
      await sleep(INTERVAL_MS);
    }
  }

  await ctx.close();

  const ok = results.filter(r => r.health?.ok);
  const fail = results.filter(r => !r.health?.ok);
  const failReasons = [...new Set(fail.map(r => r.health?.reason || r.error))];

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 结果 (间隔 ${INTERVAL_MS/1000}s): ${ok.length}✅ / ${fail.length}❌`);
  if (fail.length) {
    console.log(`   失败原因: ${failReasons.join('; ')}`);
    console.log(`   失败序号: ${fail.map(r => r.i+1).join(', ')}`);
    console.log(`   首次失败在第 ${fail[0].i+1} 个请求`);
  }
  console.log(`${'='.repeat(60)}`);

  fs.writeFileSync(OUT, JSON.stringify({ intervalMs: INTERVAL_MS, okCount: ok.length, failCount: fail.length, failReasons, results }, null, 2), 'utf-8');
  console.log(`📁 ${OUT}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
