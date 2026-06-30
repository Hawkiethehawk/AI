// @ts-check
// AppMagic App Detail 页增强抓取（免费可见字段）
// 对榜单选出的"重点产品"逐个抓 detail：下载量/收入范围、下载&收入 Top 国、评分、上线日期、品类路径
// 复用 .appmagic-userdata（不强制登录，免费字段即可）
const { chromium } = require('@playwright/test');
const path = require('path');
const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** 解析单个 detail 页（在浏览器上下文里执行） */
function parseDetail() {
  const pick = (re) => {
    const m = document.body.innerText.match(re);
    return m ? m[1].trim() : '';
  };
  // 下载量 / 收入：抓 metric-widget
  const metrics = {};
  for (const w of document.querySelectorAll('metric-widget')) {
    const label = w.querySelector('.label')?.textContent || '';
    const total = w.querySelector('.total-value')?.textContent?.trim() || '';
    const stats = [...w.querySelectorAll('.stats-container')].map(c => {
      const pct = c.querySelector('.percent')?.textContent?.trim() || '';
      // 国名：.stats-label 内除 .percent 外的文本
      let name = '';
      const lbl = c.querySelector('.stats-label');
      if (lbl) name = lbl.textContent.replace(pct, '').trim();
      return { pct, name };
    }).filter(s => s.pct);
    if (/下载量/.test(label)) metrics.downloads = { total, top: stats.slice(0, 6) };
    else if (/收入/.test(label)) metrics.revenue = { total, top: stats.slice(0, 6) };
  }
  // 评分
  const rating = pick(/([0-9]\.[0-9])\s*\n?\s*[\d,]+\s*个评级/);
  const ratingCount = pick(/[0-9]\.[0-9]\s*\n?\s*([\d,]+)\s*个评级/);
  // 上线日期（取"上线日期"后的首个日期）
  const release = pick(/上线日期[\s\S]{0,40}?(\d{4}年\d{2}月\d{2}日)/);
  // 品类路径（标签区）
  const cats = [...document.querySelectorAll('app-info-tags a, .tags a, [class*="tag"] a')]
    .map(e => e.textContent.trim()).filter(Boolean).slice(0, 8);
  return { metrics, rating, ratingCount, release, cats };
}

async function enrichOne(page, appUrl) {
  const url = appUrl.startsWith('http') ? appUrl : `https://appmagic.rocks${appUrl}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(5000);
  for (let y = 0; y < 4; y++) { await page.mouse.wheel(0, 700); await sleep(900); }
  await sleep(1500);
  return await page.evaluate(parseDetail);
}

module.exports = { enrichOne, USER_DATA_DIR };

// 直接运行 = 验证模式
if (require.main === module) {
  const TEST = [
    '/google-play/arrows-puzzle-escape/com.ecffri.arrows',
    '/iphone/royal-kingdom/id6478820210',
    '/google-play/pdf-reader-pdf-viewer/com.pdfreader.pdfviewer.pdfeditor',
  ];
  (async () => {
    const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: true, args: ['--disable-blink-features=AutomationControlled'],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });
    const page = ctx.pages()[0] || await ctx.newPage();
    for (const u of TEST) {
      try {
        const d = await enrichOne(page, u);
        console.log('\n=== ' + u + ' ===');
        console.log(JSON.stringify(d, null, 1));
      } catch (e) { console.log('ERR', u, e.message); }
      await sleep(12000);
    }
    await ctx.close();
  })();
}
