// @ts-check
// 拦截 AppMagic 榜单页的网络请求，找到"榜单数据 API"及其 week/date/limit 参数
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');
const OUT = path.resolve(__dirname, '../output/data/appmagic-probe-net.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  const calls = [];

  page.on('request', req => {
    const u = req.url();
    if (/\/api\//i.test(u) && !/\/tags/.test(u)) {
      const rec = { method: req.method(), url: u };
      const pd = req.postData();
      if (pd) rec.postData = pd.slice(0, 2000);
      calls.push(rec);
    }
  });
  page.on('response', async resp => {
    const u = resp.url();
    // 找返回里疑似榜单数组的 json
    if (/\/api\//i.test(u) && /top|chart|rank|app/i.test(u) && !/\/tags/.test(u)) {
      try {
        const ct = resp.headers()['content-type'] || '';
        if (ct.includes('json')) {
          const j = await resp.json();
          const keys = j && typeof j === 'object' ? Object.keys(j).slice(0, 12) : [];
          let arrLen = null, sample = null;
          const arr = Array.isArray(j) ? j : (j.data || j.list || j.items || j.result);
          if (Array.isArray(arr)) { arrLen = arr.length; sample = arr.slice(0, 2); }
          const c = calls.find(x => x.url === u);
          if (c) { c.respKeys = keys; c.arrLen = arrLen; c.sample = sample; }
        }
      } catch (e) { /* ignore */ }
    }
  });

  const url = 'https://appmagic.rocks/top-charts/apps?aggregation=week&tag=126&sort=downloads&measure=downloads&store=united';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(10000);

  fs.writeFileSync(OUT, JSON.stringify(calls, null, 2), 'utf-8');
  console.log(`\n捕获 ${calls.length} 个 /api/ 请求（已排除 /tags）：\n`);
  for (const c of calls) {
    console.log(`[${c.method}] ${c.url}`);
    if (c.postData) console.log(`   postData: ${c.postData}`);
    if (c.arrLen != null) console.log(`   -> 返回数组长度: ${c.arrLen}, keys=${JSON.stringify(c.respKeys)}`);
    console.log('');
  }
  console.log('📁', OUT);
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
