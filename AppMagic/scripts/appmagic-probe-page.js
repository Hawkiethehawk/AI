// @ts-check
// 试探分页：能否绕过 topDepth<=100 拿到 101-200 名
const { chromium } = require('@playwright/test');
const path = require('path');
const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = 'aggregation=week&topDepth=100&store=5&country=WW&date=2026-06-22&tag=126';

async function main() {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true, args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://appmagic.rocks/top-charts/apps?aggregation=week', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(4000);

  // 先取 baseline 第100名 free 名称做对照
  const variants = [
    ['baseline',        BASE],
    ['from=100',        BASE + '&from=100'],
    ['offset=100',      BASE + '&offset=100'],
    ['page=2',          BASE + '&page=2'],
    ['skip=100',        BASE + '&skip=100'],
    ['topStart=100',    BASE + '&topStart=100'],
    ['start=100',       BASE + '&start=100'],
    ['topDepthFrom=100',BASE + '&topDepthFrom=100'],
  ];
  for (const [label, qs] of variants) {
    const r = await page.evaluate(async (qs) => {
      try {
        const resp = await fetch('/api/v2/top/united-apps?' + qs);
        if (resp.status >= 400) { let b; try { b = await resp.json(); } catch { b = ''; } return { status: resp.status, err: JSON.stringify(b).slice(0,120) }; }
        const j = await resp.json(); const arr = j.data || j;
        const first = arr[0]?.top_free?.application?.name;
        const last = arr[arr.length-1]?.top_free?.application?.name;
        const firstRank = arr[0]?.top_free?.top_free;
        const lastRank = arr[arr.length-1]?.top_free?.top_free;
        return { status: resp.status, len: arr.length, firstRank, lastRank, first, last };
      } catch (e) { return { status: 'EXC', err: String(e) }; }
    }, qs);
    console.log(`[${r.status}] ${label.padEnd(16)} len=${r.len ?? '-'} 首名次=${r.firstRank ?? '-'}(${r.first ?? '-'}) 末名次=${r.lastRank ?? '-'}(${r.last ?? '-'}) ${r.err||''}`);
    await sleep(1200);
  }
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
