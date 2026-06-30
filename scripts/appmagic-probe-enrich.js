// @ts-check
// 带 token 调 app-info / data-countries，dump 全字段找评分 + 国家分布结构（Snake Clash）
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
    const tok = (localStorage.getItem('datamagic.token')||'').replace(/^"|"$/g,'');
    const H = { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' };
    const uid = 13998447;
    const jsafe = async (resp) => { const t = await resp.text(); try { return JSON.parse(t); } catch { return { _nonjson: t.slice(0,120) }; } };
    // app-info: POST body
    let appInfo = null, method = 'POST';
    let p = await fetch('/api/v2/applications/app-info', { method:'POST', headers:H, body: JSON.stringify({ store:1, store_application_id:'io.supercent.linkedcubic', country:'US' }) });
    appInfo = await jsafe(p);
    if (appInfo._nonjson) {
      // 退回 GET 各种参数组合
      let g = await fetch(`/api/v2/applications/app-info?store=1&application_id=io.supercent.linkedcubic`, { headers:H });
      appInfo = await jsafe(g); method = 'GET?';
    }
    // data-countries
    const dc = await fetch(`/api/v2/united-applications/data-countries?united_application_id=${uid}`, { headers: H });
    const countries = dc.ok ? await dc.json() : { err: dc.status };
    return { method, appInfoKeys: appInfo?.data ? Object.keys(appInfo.data) : Object.keys(appInfo||{}), appInfo, countriesLen: Array.isArray(countries)?countries.length:null, countriesTop: Array.isArray(countries)? countries.slice(0,5):countries };
  });

  console.log('app-info method:', out.method);
  console.log('app-info data keys:', JSON.stringify(out.appInfoKeys));
  console.log('\napp-info data(找评分字段):');
  const d = out.appInfo?.data || out.appInfo;
  console.log(JSON.stringify(d, null, 1)?.slice(0, 1800));
  console.log('\ndata-countries 长度:', out.countriesLen);
  console.log('前5国:', JSON.stringify(out.countriesTop, null, 1));
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
