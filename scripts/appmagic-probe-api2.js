// @ts-check
const { chromium } = require('@playwright/test');
const path = require('path');
const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');
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

  const tests = [
    ['baseline 原始',        'aggregation=week&topDepth=100&store=5&country=WW&date=2026-06-01&tag=126'],
    ['depth=1000 旧周',      'aggregation=week&topDepth=1000&store=5&country=WW&date=2026-06-01&tag=126'],
    ['depth=200 旧周',       'aggregation=week&topDepth=200&store=5&country=WW&date=2026-06-01&tag=126'],
    ['depth=100 周6/22',     'aggregation=week&topDepth=100&store=5&country=WW&date=2026-06-22&tag=126'],
    ['depth=100 周6/15',     'aggregation=week&topDepth=100&store=5&country=WW&date=2026-06-15&tag=126'],
    ['depth=100 周6/08',     'aggregation=week&topDepth=100&store=5&country=WW&date=2026-06-08&tag=126'],
    ['depth=300 旧周',       'aggregation=week&topDepth=300&store=5&country=WW&date=2026-06-01&tag=126'],
    ['depth=250 旧周',       'aggregation=week&topDepth=250&store=5&country=WW&date=2026-06-01&tag=126'],
  ];
  for (const [label, qs] of tests) {
    const r = await page.evaluate(async (qs) => {
      try {
        const resp = await fetch('/api/v2/top/united-apps?' + qs);
        let body = null; try { body = await resp.clone().json(); } catch { body = (await resp.text()).slice(0, 200); }
        const arr = body && (body.data || (Array.isArray(body) ? body : null));
        return { status: resp.status, date: body && body.date, len: Array.isArray(arr) ? arr.length : null,
                 err: resp.status >= 400 ? JSON.stringify(body).slice(0, 200) : null };
      } catch (e) { return { status: 'EXC', err: String(e) }; }
    }, qs);
    console.log(`[${r.status}] ${label.padEnd(16)} len=${r.len ?? '-'} date=${r.date ?? '-'} ${r.err ? '| err=' + r.err : ''}`);
    await sleep(1500);
  }
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
