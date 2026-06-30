// @ts-check
// 探测：AppMagic 周段(date/period)选择器 —— 当前显示哪一周？如何切到"含今天"的周？
// 顺便：100 档下渲染多少行 + Hypercasual 第 150/175/200/225 名应用名（验证覆盖）
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');
const OUT = path.resolve(__dirname, '../output/data/appmagic-probe-week.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  const report = {};

  const url = 'https://appmagic.rocks/top-charts/apps?aggregation=week&tag=126&sort=downloads&measure=downloads&store=united';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(9000);
  await page.waitForSelector('TOP-APPS-ITEM', { timeout: 15000 }).catch(() => {});

  report.urlAfterLoad = page.url();

  // A. 找"周段/日期范围"选择器：扫描含日期样式文本的元素
  console.log('\n=== A. 周段/日期范围 选择器候选 ===');
  const dateEls = await page.evaluate(() => {
    const out = [];
    const re = /(\d{1,2}[.\/-]\d{1,2})|([A-Z][a-z]{2}\s*\d{1,2})|(\d{1,2}\s*[–—-]\s*\d{1,2})|(week|неделя)/i;
    const all = document.querySelectorAll('button, a, span, div, [class*="date" i], [class*="period" i], [class*="calendar" i], [class*="picker" i]');
    const seen = new Set();
    for (const el of all) {
      const t = (el.textContent || '').trim();
      if (!t || t.length > 60) continue;
      if (re.test(t)) {
        const key = el.tagName + '|' + t;
        if (seen.has(key)) continue; seen.add(key);
        // 仅保留"叶子或近叶子"元素，避免父容器整段
        if (el.children.length <= 3) {
          out.push({ tag: el.tagName, text: t.replace(/\s+/g, ' '), cls: (el.className?.toString() || '').slice(0, 90) });
        }
      }
    }
    return out.slice(0, 40);
  });
  report.dateSelectorCandidates = dateEls;
  for (const d of dateEls) console.log(`  <${d.tag}> "${d.text}"  .${d.cls}`);

  // B. 渲染行数 + 第 150/175/200/225 名
  console.log('\n=== B. 渲染行数 & 抽样排名 ===');
  const sample = await page.evaluate(() => {
    const items = [...document.querySelectorAll('TOP-APPS-ITEM')];
    const total = items.length;
    const pick = {};
    const wanted = [149, 150, 151, 174, 175, 176, 199, 200, 201, 224, 225, 226];
    for (const item of items) {
      const rank = item.querySelector('app-list-item-number .top-position-number')?.textContent?.trim() || '';
      const rk = parseInt(rank, 10);
      if (wanted.includes(rk)) {
        const name = item.querySelector('a.g-app-name')?.getAttribute('title')
          || item.querySelector('a.g-app-name')?.textContent?.trim() || '';
        const pub = (item.querySelector('a.g-app-publisher-name')?.textContent || '').replace(/\s+/g, ' ').trim();
        pick[rk] = { name, pub };
      }
    }
    const ranksPresent = items.map(i => parseInt(i.querySelector('app-list-item-number .top-position-number')?.textContent?.trim() || '0', 10)).filter(Boolean);
    return { total, maxRank: Math.max(...ranksPresent), minRank: Math.min(...ranksPresent), pick };
  });
  report.totalRendered = sample.total;
  report.maxRank = sample.maxRank;
  report.minRank = sample.minRank;
  report.sampledRanks = sample.pick;
  console.log(`  渲染行数: ${sample.total} | rank 范围: ${sample.minRank} ~ ${sample.maxRank}`);
  for (const k of [150, 175, 200, 225]) {
    const v = sample.pick[k];
    console.log(`  #${k}: ${v ? v.name + ' — ' + v.pub : '（未渲染到）'}`);
  }

  // C. "显示结果数量" 当前激活档
  const countActive = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.am-button')];
    return btns.filter(b => /^1?[,，]?0{2,3}$/.test((b.textContent || '').trim()))
      .map(b => ({ text: (b.textContent || '').trim(), active: b.className.includes('active') }));
  });
  report.countToggle = countActive;
  console.log('\n  显示数量档位:', JSON.stringify(countActive));

  await page.screenshot({ path: path.resolve(__dirname, '../output/image/appmagic-probe-week.png'), fullPage: false });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf-8');
  console.log('\n📁', OUT);
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
