// @ts-check
// 拦截 Angular 真实发出的榜单请求，dump 其请求头 → 找到携带 token 的 header 名
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

  page.on('request', req => {
    if (/\/api\/v2\/top\/united-apps/.test(req.url())) {
      console.log('\n>>> 真实榜单请求:', req.url());
      console.log('>>> 请求头:');
      const h = req.headers();
      for (const [k,v] of Object.entries(h)) {
        if (/auth|token|key|x-/i.test(k)) console.log(`    ${k}: ${v}`);
      }
      console.log('    (全部头键名):', Object.keys(h).join(', '));
    }
  });

  await page.goto('https://appmagic.rocks/top-charts/apps?aggregation=week&tag=126', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(10000);
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
