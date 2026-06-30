// @ts-check
// 用 datamagic.token 作 Bearer，验证 topDepth=1000 是否解锁
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
  await page.goto('https://appmagic.rocks/top-charts/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(4000);

  const out = await page.evaluate(async () => {
    const token = localStorage.getItem('datamagic.token');
    const tok = token ? token.replace(/^"|"$/g, '') : null;
    const H = { Authorization: 'Bearer ' + tok };
    const test = async (depth) => {
      const u = `/api/v2/top/united-apps?aggregation=week&topDepth=${depth}&store=5&country=WW&date=2026-06-22&tag=126`;
      const resp = await fetch(u, { headers: H });
      if (resp.status >= 400) { let b; try { b = await resp.json(); } catch { b=''; } return { depth, status: resp.status, err: JSON.stringify(b) }; }
      const j = await resp.json(); const arr = j.data || j;
      const pick = {};
      for (const rk of [1,50,100,150,175,200,225,500,1000]) {
        const e = arr[rk-1];
        if (e) pick[rk] = { name: e.top_free?.application?.name, diff: e.top_free?.diff, rank: e.top_free?.top_free };
      }
      return { depth, status: resp.status, len: arr.length, pick };
    };
    const who = await (await fetch('/api/v2/users/user?lang=cn', { headers: H })).json().catch(()=>null);
    return { tok: tok ? tok.slice(0,10)+'…' : null,
             who: who ? { email: who.email, id: who.id, keys: Object.keys(who).slice(0,30) } : null,
             d100: await test(100), d1000: await test(1000) };
  });

  console.log('token:', out.tok);
  console.log('账号:', JSON.stringify(out.who));
  console.log('\ntopDepth=100  ->', out.d100.status, 'len=', out.d100.len);
  console.log('topDepth=1000 ->', out.d1000.status, 'len=', out.d1000.len, out.d1000.err||'');
  if (out.d1000.pick) {
    console.log('\n=== 1000 档抽样(免费榜 名次/名称/diff) ===');
    for (const rk of [1,50,100,150,175,200,225,500,1000]) {
      const v = out.d1000.pick[rk];
      console.log(`  #${rk}: ${v ? v.name + '  diff=' + v.diff : '(无)'}`);
    }
  }
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
