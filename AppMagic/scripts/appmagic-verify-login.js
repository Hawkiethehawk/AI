// @ts-check
// 验证登录后 topDepth 是否解封（>100）
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
  await sleep(5000);

  // 账号身份
  const who = await page.evaluate(async () => {
    try { const r = await fetch('/api/v2/users/user?lang=cn'); const j = await r.json();
      return { email: j.email || j.data?.email, plan: j.plan || j.subscription || j.tariff || j.data?.plan, raw: Object.keys(j).slice(0,20) }; }
    catch (e) { return { err: String(e) }; }
  });
  console.log('账号:', JSON.stringify(who));

  for (const depth of [100, 200, 500, 1000]) {
    const r = await page.evaluate(async (depth) => {
      const resp = await fetch(`/api/v2/top/united-apps?aggregation=week&topDepth=${depth}&store=5&country=WW&date=2026-06-22&tag=126`);
      if (resp.status >= 400) { let b; try { b = await resp.json(); } catch { b=''; } return { status: resp.status, err: JSON.stringify(b) }; }
      const j = await resp.json(); const arr = j.data || j;
      const last = arr[arr.length-1];
      return { status: resp.status, len: arr.length, lastRank: last?.top_free?.top_free, lastName: last?.top_free?.application?.name };
    }, depth);
    console.log(`[${r.status}] topDepth=${depth} -> len=${r.len ?? '-'} 末名次=${r.lastRank ?? '-'}(${r.lastName ?? '-'}) ${r.err||''}`);
    await sleep(1500);
  }
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
