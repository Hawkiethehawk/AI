// @ts-check
// AppMagic 登录助手（微信扫码登录，headless 自动化）
// 自动：关 Cookie 横幅 → 勾选同意条款 → 点「用WeChat登录」→ 抓取微信扫码二维码存为图片。
// 你用【手机微信】扫该二维码并确认 → 脚本轮询 localStorage['datamagic.token']，登录成功自动落盘并退出。
//
// 为何走扫码：AppMagic 的"免扫码快捷登录"依赖浏览器访问本机微信客户端的本地端口，
// 自动化的隔离 Chromium（尤其 headless）拿不到该权限，微信会退化为扫码登录（snsapi_login）。
// token 落盘到 .appmagic-userdata 后，appmagic-weekly.js 在其有效期内长期复用，无需反复登录。
//
// 用法：node scripts/appmagic-login.js
// 可选环境变量：APPMAGIC_HEADLESS=0 显示窗口；APPMAGIC_LOGIN_WAIT_MIN=5 扫码等待分钟；
//              APPMAGIC_QR_FILE 二维码图片文件名；APPMAGIC_LOGIN_URL 覆盖登录页。
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const PROJECT_DIR = path.resolve(process.env.APPMAGIC_PROJECT_DIR || process.cwd());
const USER_DATA_DIR = path.resolve(PROJECT_DIR, '.appmagic-userdata');
const LOGIN_URL = process.env.APPMAGIC_LOGIN_URL || 'https://appmagic.rocks/login';
const QR_PATH = path.resolve(PROJECT_DIR, process.env.APPMAGIC_QR_FILE || 'appmagic-wechat-qr.png');
const HEADLESS = process.env.APPMAGIC_HEADLESS !== '0';
const WAIT_MIN = parseInt(process.env.APPMAGIC_LOGIN_WAIT_MIN || '5', 10);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getToken(page) {
  try { return await page.evaluate(() => (localStorage.getItem('datamagic.token') || '').replace(/^"|"$/g, '')); }
  catch { return ''; }
}

(async () => {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: HEADLESS,
    args: ['--disable-blink-features=AutomationControlled'],
    locale: 'zh-CN', // 中文版登录页才有「用WeChat登录」入口
    viewport: { width: 1440, height: 900 },
  });
  // 注入 window.open 拦截：作为捕获微信授权 URL 的后备（headless 下 popup 偶发不触发）
  await ctx.addInitScript(() => {
    window.__wxOpen = '';
    const o = window.open;
    window.open = function (...a) {
      try { if (a[0] && /weixin\.qq\.com|qrconnect/.test(String(a[0]))) window.__wxOpen = String(a[0]); } catch {}
      try { return o.apply(this, a); } catch { return null; }
    };
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  let wxPage = null;
  ctx.on('page', p => { wxPage = p; });

  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(3000);

  if (await getToken(page)) {
    console.log('✅ 已是登录态（datamagic.token 已存在），无需重复登录。');
    await ctx.close();
    return;
  }

  // 1) 关掉底部 Cookie 横幅（会遮挡点击）
  const ck = await page.$('button:has-text("确认")');
  if (ck) await ck.click().catch(() => {});
  await sleep(800);

  // 2) 勾选同意条款（自定义复选框 .content-checkbox，点文字触发框架事件）
  await page.locator('text=我同意服务条款').first().click({ force: true }).catch(() => {});
  await sleep(500);

  // 3) 点「用WeChat登录」（div.login-button.wechat）
  const wx = await page.$(':text("用WeChat登录")');
  if (!wx) { console.error('未找到「用WeChat登录」按钮，登录页结构可能已变化。'); await ctx.close(); process.exit(1); }
  await wx.click().catch(() => {});
  await sleep(5000);

  // 4) 取微信授权页：优先 popup，否则用拦截到的 URL 自开新页
  if (!wxPage) {
    const url = await page.evaluate(() => window.__wxOpen || '');
    if (url) { wxPage = await ctx.newPage(); await wxPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {}); }
  }
  if (!wxPage) { console.error('未能打开微信授权页。可重跑；或设 APPMAGIC_HEADLESS=0 观察。'); await ctx.close(); process.exit(1); }
  await wxPage.waitForLoadState('domcontentloaded').catch(() => {});
  await sleep(3000);

  // 5) 截二维码（优先裁剪二维码图片元素，回退整页）
  async function saveQr() {
    try {
      const img = wxPage.locator('img').first();
      if (await img.count()) { await img.screenshot({ path: QR_PATH }); return true; }
    } catch {}
    try { await wxPage.screenshot({ path: QR_PATH }); return true; } catch { return false; }
  }
  await saveQr();
  console.log('\n========================================================');
  console.log('  请用【手机微信】扫码登录：');
  console.log('  二维码已保存到：', QR_PATH);
  console.log('  打开该图片 → 手机微信「扫一扫」→ 确认登录。');
  console.log('  登录成功后脚本会自动保存登录态并退出。');
  console.log('========================================================\n');

  // 6) 轮询 token（定期重截二维码反映最新状态；偶尔 reload 主页刷新登录态读取）
  const deadline = Date.now() + WAIT_MIN * 60 * 1000;
  let tok = '', i = 0;
  while (Date.now() < deadline) {
    await sleep(3000);
    tok = await getToken(page);
    if (tok) break;
    if (++i % 10 === 0) { await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {}); }
    if (i % 20 === 0) { await saveQr(); console.log(`[等待扫码… ${i * 3}s]`); }
  }

  if (tok) {
    console.log(`\n🎉 登录成功：datamagic.token 已捕获（长度 ${tok.length}）。登录态已落盘到 ${USER_DATA_DIR}`);
    try { fs.unlinkSync(QR_PATH); } catch {}
  } else {
    console.log(`\n⚠️ ${WAIT_MIN} 分钟内未检测到登录态（二维码可能已过期）。重跑本脚本可获取新二维码。`);
  }
  await ctx.close();
})().catch(e => { console.error('Fatal:', e); process.exit(1); });
