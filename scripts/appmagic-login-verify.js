// @ts-check
// 登录 + 自动检测登录成功 + 就地验证 topDepth=1000 是否解锁 + 优雅关闭(正常刷盘)
// 用法：node scripts/appmagic-login-verify.js  → 在弹窗里登录即可，脚本会自动接管后续
const { chromium } = require('@playwright/test');
const path = require('path');
const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');
const EMAIL = 'configured targetthehawk@163.com';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized'],
    viewport: null,
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://appmagic.rocks/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(3000);

  console.log('\n========================================================');
  console.log('  请在窗口中完成登录（邮箱:', EMAIL, '）');
  console.log('  登录成功后无需手动操作，脚本会自动检测并验证 1000 档，然后自己关闭窗口。');
  console.log('========================================================\n');

  let loggedIn = false;
  for (let i = 0; i < 240; i++) {   // 最多等 ~20 分钟
    await sleep(5000);
    let user = null;
    try {
      user = await page.evaluate(async () => {
        const r = await fetch('/api/v2/users/user?lang=cn');
        const t = await r.text();
        try { return JSON.parse(t); } catch { return null; }
      });
    } catch { /* 页面可能在跳转，忽略 */ }

    if (user && (user.email || user.id || user.uid)) {
      loggedIn = true;
      console.log(`\n  ✅ 检测到登录成功！账号: ${user.email || user.id || user.uid}`);
      console.log('  套餐相关字段:', JSON.stringify(Object.fromEntries(
        Object.entries(user).filter(([k]) => /plan|tariff|subscri|role|access|limit|tier|product/i.test(k))
      )) || '(无明显套餐字段)');

      // 就地验证 topDepth 解锁
      for (const depth of [100, 200, 1000]) {
        const r = await page.evaluate(async (depth) => {
          const resp = await fetch(`/api/v2/top/united-apps?aggregation=week&topDepth=${depth}&store=5&country=WW&date=2026-06-22&tag=126`);
          if (resp.status >= 400) { let b; try { b = await resp.json(); } catch { b=''; } return { status: resp.status, err: JSON.stringify(b) }; }
          const j = await resp.json(); const arr = j.data || j;
          return { status: resp.status, len: arr.length, lastRank: arr[arr.length-1]?.top_free?.top_free };
        }, depth);
        console.log(`     [${r.status}] topDepth=${depth} -> len=${r.len ?? '-'} 末名次=${r.lastRank ?? '-'} ${r.err||''}`);
        await sleep(1200);
      }
      console.log('\n  → 若 topDepth=1000 返回 len=1000，则已解锁；否则该账号无 1000 权限。');
      break;
    } else {
      if (i % 3 === 0) console.log(`  [等待登录… ${i*5}s] users/user=null（尚未登录）`);
    }
  }

  if (!loggedIn) console.log('\n  ⚠️ 超时未检测到登录。');
  console.log('\n  正在优雅关闭（刷盘保存 session）…');
  await sleep(2000);
  await ctx.close();   // 优雅关闭，确保 cookie/session 落盘
  console.log('  ✅ 已关闭，session 已保存。');
  process.exit(0);
})().catch(e => { console.error('Fatal:', e); process.exit(1); });
