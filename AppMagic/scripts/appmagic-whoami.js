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
  await page.goto('https://appmagic.rocks/top-charts/apps?aggregation=week', { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
  await sleep(6000);

  const cookies = await ctx.cookies();
  console.log('cookies 数量:', cookies.length, '| 名称:', cookies.map(c=>c.name).join(','));

  const user = await page.evaluate(async () => {
    const r = await fetch('/api/v2/users/user?lang=cn');
    const txt = await r.text();
    return { status: r.status, body: txt.slice(0, 1500) };
  });
  console.log('\n/api/v2/users/user ->', user.status);
  console.log(user.body);

  // init 接口常含订阅/权限信息
  const init = await page.evaluate(async () => {
    const r = await fetch('/api/v2/init');
    const txt = await r.text();
    return txt.slice(0, 2000);
  });
  console.log('\n/api/v2/init (前2000字):');
  console.log(init);
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
