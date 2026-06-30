// @ts-check
// 坐实：date=2026-06-22 Hypercasual top100 —— 字段结构 + rank 1/50/100 样例
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');
const OUT = path.resolve(__dirname, '../output/data/appmagic-probe-api3.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true, args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://appmagic.rocks/top-charts/apps?aggregation=week', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(4000);

  const out = await page.evaluate(async () => {
    const r = await fetch('/api/v2/top/united-apps?aggregation=week&topDepth=100&store=5&country=WW&date=2026-06-22&tag=126');
    const j = await r.json();
    const arr = j.data || j;
    return { date: j.date, len: arr.length, e0: arr[0], e49: arr[49], e99: arr[99] };
  });
  console.log('date=', out.date, 'len=', out.len);
  console.log('\n=== 第1名 完整字段 ===');
  console.log(JSON.stringify(out.e0, null, 2));
  console.log('\n=== 第50名 ===', JSON.stringify(out.e49).slice(0, 300));
  console.log('\n=== 第100名 ===', JSON.stringify(out.e99).slice(0, 300));
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf-8');
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
