// @ts-check
// 拦截 App Detail 页网络，找"国家分布(下载/收入)+评分+品类路径"的数据接口
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');
const OUT = path.resolve(__dirname, '../output/data/appmagic-probe-detail.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true, args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  const seen = [];
  page.on('response', async resp => {
    const u = resp.url();
    if (!/\/api\/v2\//.test(u)) return;
    if (/sentry|tags|init|db-translations|blog|mailing|favorites|users\/user/.test(u)) return;
    try {
      const ct = resp.headers()['content-type'] || '';
      if (!ct.includes('json')) return;
      const j = await resp.json();
      const keys = j && typeof j === 'object' ? Object.keys(j) : [];
      seen.push({ url: u.replace('https://appmagic.rocks',''), keys, sample: JSON.stringify(j).slice(0, 400) });
    } catch {}
  });

  // 用 Snake Clash (Hypercasual #1 推荐榜) 的 google-play 详情页
  const url = 'https://appmagic.rocks/google-play/snake-clash/io.supercent.linkedcubic';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(6000);
  for (let y = 0; y < 5; y++) { await page.mouse.wheel(0, 800); await sleep(1200); }
  await sleep(2000);

  fs.writeFileSync(OUT, JSON.stringify(seen, null, 2), 'utf-8');
  console.log(`捕获 ${seen.length} 个详情 API：\n`);
  for (const s of seen) {
    console.log(`${s.url}`);
    console.log(`   keys=${JSON.stringify(s.keys)}`);
    console.log(`   sample=${s.sample}\n`);
  }
  console.log('📁', OUT);
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
