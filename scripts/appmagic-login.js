// @ts-check
// AppMagic 登录助手：弹出真实浏览器窗口，建立持久登录态到 .appmagic-userdata
// 登录态落盘后，appmagic-scraper.js 复用同一目录即可带登录态抓取（解锁下载量/收入/国家分布）
// 用法：node scripts/appmagic-login.js   （登录完成后从外部 kill 本进程即可，session 已实时落盘）
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
  await sleep(4000);

  // 尽力自动点击登录入口 + 预填邮箱；失败则保留给用户手动
  try {
    const signin = await page.$(
      'a:has-text("Sign in"), button:has-text("Sign in"), a:has-text("Log in"), button:has-text("Log in"), :text("登录"), :text("登 录")'
    );
    if (signin) { await signin.click().catch(() => {}); await sleep(2500); }
    const emailInput = await page.$('input[type="email"], input[name*="mail" i], input[placeholder*="mail" i]');
    if (emailInput) { await emailInput.fill(EMAIL); console.log('  ✅ 已自动填入邮箱:', EMAIL); }
    else console.log('  ℹ️ 未自动定位到邮箱输入框，请在窗口里手动点登录并输入邮箱:', EMAIL);
  } catch (e) { console.log('  自动填邮箱跳过:', e.message); }

  console.log('\n========================================================');
  console.log('  浏览器窗口已打开。请在窗口中完成登录：');
  console.log('  邮箱:', EMAIL, '（密码 / 邮箱验证码 / Google 任一方式均可）');
  console.log('  登录成功后，回到对话告诉我，我会保存登录态并继续抓取。');
  console.log('========================================================\n');

  // 保持运行 + 心跳（不自动导航，避免打断你的操作）
  for (let i = 0; i < 480; i++) {
    await sleep(15000);
    const cookies = await ctx.cookies();
    console.log(`[心跳 ${i}] url=${page.url()} cookies=${cookies.length}`);
  }
  await ctx.close();
})().catch(e => { console.error('Fatal:', e); process.exit(1); });
