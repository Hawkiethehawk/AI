// @ts-check
// AppMagic 配置探测脚本（只探测，不做全量爬取）
// 目标：
//   1. 通过 /api/v2/tags 找到 6 个目标品类的 tag id（尤其"游戏-休闲 Casual"父级）
//   2. 验证"显示结果数量 100/1000"是 URL 参数还是必须点击；默认渲染多少行
//   3. 抽 Hypercasual 前 25 名，核对名次变化方向（绿=升+ / 红=降-）
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');
const OUT = path.resolve(__dirname, '../output/data/appmagic-probe.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 想找的品类关键词（用于在 1495 个 tag 里筛选候选）
const WANT = ['casual', 'hypercasual', 'launcher', 'antivirus', 'cleaner',
  'recovery', 'restore', 'pdf', 'personalization', 'utilit', 'productivit'];

async function main() {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  const report = {};

  // ---------- A. tag 字典 ----------
  console.log('\n=== A. 拉取 /api/v2/tags 并筛选候选 ===');
  await page.goto('https://appmagic.rocks/top-charts/apps?aggregation=week', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(4000);
  const tags = await page.evaluate(async () => {
    try { const r = await fetch('/api/v2/tags'); const d = await r.json(); return d.data || d; }
    catch (e) { return { error: String(e) }; }
  });
  if (Array.isArray(tags)) {
    console.log(`  共 ${tags.length} 个 tag`);
    const cand = tags.filter(t => WANT.some(w => (t.name || '').toLowerCase().includes(w)));
    report.tagCandidates = cand.map(t => ({ id: t.id, name: t.name, parent_ids: t.parent_ids, type: t.type, status: t.status }));
    console.log('  候选品类 tag：');
    for (const t of report.tagCandidates) {
      console.log(`    [${t.id}] ${t.name}  parent=${JSON.stringify(t.parent_ids)} type=${t.type} status=${t.status}`);
    }
  } else {
    console.log('  ⚠️ tags 拉取失败:', JSON.stringify(tags).slice(0, 200));
    report.tagError = tags;
  }

  // ---------- B. 显示结果数量 / 默认渲染行数 ----------
  console.log('\n=== B. Hypercasual 默认渲染 + 显示数量开关探测 ===');
  const url = 'https://appmagic.rocks/top-charts/apps?aggregation=week&tag=126&sort=downloads&measure=downloads&store=united';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(9000);
  await page.waitForSelector('TOP-APPS-ITEM', { timeout: 15000 }).catch(() => {});

  const beforeCount = await page.evaluate(() => document.querySelectorAll('TOP-APPS-ITEM').length);
  console.log(`  默认渲染 TOP-APPS-ITEM 数量: ${beforeCount}`);
  report.defaultRendered = beforeCount;
  report.urlBefore = page.url();

  // 找"显示结果数量"开关（100 / 1,000）相关元素文本
  const toggleInfo = await page.evaluate(() => {
    const hits = [];
    const all = document.querySelectorAll('button, a, span, div, label');
    for (const el of all) {
      const t = (el.textContent || '').trim();
      if (/^1[,，]?000$/.test(t) || /^100$/.test(t)) {
        hits.push({ tag: el.tagName, text: t, cls: el.className?.toString().slice(0, 80) || '', clickable: el.tagName === 'BUTTON' || el.tagName === 'A' });
      }
    }
    return hits.slice(0, 20);
  });
  report.countToggleElements = toggleInfo;
  console.log('  "100/1000" 候选开关元素:', JSON.stringify(toggleInfo, null, 2));

  // ---------- C. Hypercasual 前 25 名 + 名次方向 ----------
  console.log('\n=== C. Hypercasual 前 25 名（核对方向）===');
  const rows = await page.evaluate(() => {
    const items = document.querySelectorAll('TOP-APPS-ITEM');
    const out = [];
    let i = 0;
    for (const item of items) {
      if (i++ >= 25) break;
      const numEl = item.querySelector('app-list-item-number');
      const rank = numEl?.querySelector('.top-position-number')?.textContent?.trim() || '';
      // 把整个 number 容器的类名/可见 diff 都抓出来，便于判断方向逻辑是否正确
      const newEl = numEl?.querySelector('.diff-new');
      const upEl = numEl?.querySelector('.diff-up');
      const downEl = numEl?.querySelector('.diff-down');
      const vis = el => el && !el.hasAttribute('hidden');
      let change = '0', via = 'none';
      if (vis(newEl)) { change = 'NEW'; via = 'diff-new'; }
      else if (vis(upEl)) { change = '+' + (upEl.textContent || '').replace(/\D/g, ''); via = 'diff-up'; }
      else if (vis(downEl)) { change = '-' + (downEl.textContent || '').replace(/\D/g, ''); via = 'diff-down'; }
      const nameLink = item.querySelector('a.g-app-name');
      const name = nameLink?.getAttribute('title') || nameLink?.textContent?.trim() || '';
      const pub = (item.querySelector('a.g-app-publisher-name')?.textContent || '').replace(/\s+/g, ' ').trim();
      // 同时抓 number 容器原始 HTML 片段，方便核对配色 class
      const rawNum = (numEl?.innerHTML || '').replace(/\s+/g, ' ').slice(0, 240);
      out.push({ rank, change, via, name, pub, rawNum });
    }
    return out;
  });
  report.hypercasualTop25 = rows;
  for (const r of rows) console.log(`  #${r.rank} ${r.change}(${r.via})  ${r.name} — ${r.pub}`);

  await page.screenshot({ path: path.resolve(__dirname, '../output/image/appmagic-probe-hypercasual.png'), fullPage: false });

  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf-8');
  console.log('\n📁 探测结果:', OUT);
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
