// @ts-check
// 直接调用榜单数据 API 验证：6/22 周、Hypercasual、topDepth=1000，取第 150/175/200/225 名
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');
const OUT = path.resolve(__dirname, '../output/data/appmagic-probe-api.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  // 先进站点拿到登录态 cookie
  await page.goto('https://appmagic.rocks/top-charts/apps?aggregation=week', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(4000);

  const date = '2026-06-22'; // 含今天(6/26)的那一周（周一为锚点）
  const res = await page.evaluate(async (date) => {
    const url = `/api/v2/top/united-apps?aggregation=week&topDepth=1000&store=5&country=WW&date=${date}&tag=126`;
    const r = await fetch(url);
    const j = await r.json();
    const arr = j.data || j;
    return { ok: r.status, returnedDate: j.date, len: Array.isArray(arr) ? arr.length : null,
             firstElem: Array.isArray(arr) ? arr[0] : null,
             arr: Array.isArray(arr) ? arr : null };
  }, date);

  console.log('HTTP', res.ok, '| 返回 date=', res.returnedDate, '| 行数=', res.len);
  console.log('\n首元素结构(看字段名):');
  console.log(JSON.stringify(res.firstElem, null, 2));

  const report = { requestedDate: date, returnedDate: res.returnedDate, len: res.len, firstElem: res.firstElem, picks: {} };

  if (res.arr) {
    // 按数组下标推断 rank（下标0=第1名）；同时打印元素里可能的 name/publisher/rankChange 字段
    console.log('\n抽样(数组下标 = 名次-1):');
    for (const rank of [1, 50, 150, 175, 200, 225, 500, 1000]) {
      const e = res.arr[rank - 1];
      if (!e) { console.log(`  #${rank}: (无)`); continue; }
      report.picks[rank] = e;
      // 尽量找名字字段
      const name = e.name || e.title || e.app_name || (e.application && e.application.name) || JSON.stringify(e).slice(0, 80);
      console.log(`  #${rank}: ${name}`);
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf-8');
  console.log('\n📁', OUT);
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
