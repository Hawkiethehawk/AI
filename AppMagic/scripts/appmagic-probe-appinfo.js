// @ts-check
// 抓详情页 app-info 的真实请求 body + 完整响应（找字段名 & 评分）
const { chromium } = require('@playwright/test');
const fs = require('fs');
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
    if (/applications\/app-info(\?|$)/.test(req.url())) {
      console.log('>>> app-info', req.method(), req.url());
      console.log('    body:', req.postData());
    }
  });
  page.on('response', async resp => {
    if (/applications\/app-info(\?|$)/.test(resp.url())) {
      try { const j = await resp.json();
        fs.writeFileSync(path.resolve(__dirname,'../output/data/appmagic-appinfo-full.json'), JSON.stringify(j,null,2));
        const d = j.data || j;
        console.log('<<< app-info response keys:', Object.keys(d));
        // 找评分相关
        const ratingKeys = Object.keys(d).filter(k=>/rat|star|review|score/i.test(k));
        console.log('    评分相关字段:', ratingKeys.map(k=>`${k}=${JSON.stringify(d[k])}`).join(' | ') || '(无直接字段，见 full json)');
      } catch {}
    }
  });

  await page.goto('https://appmagic.rocks/google-play/snake-clash/io.supercent.linkedcubic', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(8000);
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
