// @ts-check
// 从 localStorage 提取 Bearer token，带 Authorization 头重发 API，验证登录态 + topDepth=1000
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const USER_DATA_DIR = path.resolve(__dirname, '../.appmagic-userdata');
const OUT = path.resolve(__dirname, '../output/data/appmagic-auth.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true, args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://appmagic.rocks/top-charts/apps', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(5000);

  // A. dump localStorage / sessionStorage 找 token
  const store = await page.evaluate(() => {
    const dump = (s) => { const o = {}; for (let i=0;i<s.length;i++){ const k=s.key(i); const v=s.getItem(k)||''; o[k]= v.length>120 ? v.slice(0,120)+`…(${v.length})` : v; } return o; };
    return { local: dump(localStorage), session: dump(sessionStorage) };
  });
  console.log('=== localStorage keys ===');
  for (const [k,v] of Object.entries(store.local)) console.log(`  ${k} = ${v}`);
  console.log('=== sessionStorage keys ===');
  for (const [k,v] of Object.entries(store.session)) console.log(`  ${k} = ${v}`);

  // B. 找出疑似 token（JWT eyJ 开头 或 key 含 token/auth/access）
  const tokenInfo = await page.evaluate(() => {
    const cands = [];
    for (let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i); const v = localStorage.getItem(k)||'';
      if (/token|auth|access|bearer|jwt/i.test(k) || /^eyJ[\w-]+\.[\w-]+\./.test(v)) cands.push({ k, v });
      // 有时 token 包在 JSON 里
      if (/^\{/.test(v) && /token/i.test(v)) cands.push({ k, v, json:true });
    }
    return cands;
  });
  console.log('\n=== token 候选 ===');
  for (const c of tokenInfo) console.log(`  [${c.k}]${c.json?'(json)':''} ${String(c.v).slice(0,80)}…`);

  // C. 提取一个最可能的 token 字符串
  const token = await page.evaluate(() => {
    const tryKeys = [];
    for (let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); tryKeys.push(k); }
    // 直接 JWT
    for (const k of tryKeys){ const v=localStorage.getItem(k)||''; if (/^eyJ[\w-]+\.[\w-]+\..+/.test(v)) return v; }
    // JSON 里的 token / access_token
    for (const k of tryKeys){ const v=localStorage.getItem(k)||''; if (/^\{/.test(v)){ try{ const o=JSON.parse(v); const t=o.token||o.access_token||o.accessToken||o.jwt||o.id_token; if (t) return t; }catch{} } }
    return null;
  });
  console.log('\n提取到 token:', token ? token.slice(0,40)+'…' : '(无)');

  // D. 带不同方式重发，对比
  const headersList = token ? [
    ['Bearer', { Authorization: 'Bearer ' + token }],
    ['raw',    { Authorization: token }],
    ['x-auth', { 'x-auth-token': token }],
  ] : [];
  const results = [];
  for (const [label, headers] of headersList) {
    const r = await page.evaluate(async ({headers}) => {
      const u = '/api/v2/top/united-apps?aggregation=week&topDepth=1000&store=5&country=WW&date=2026-06-22&tag=126';
      const resp = await fetch(u, { headers });
      if (resp.status>=400){ let b; try{b=await resp.json();}catch{b='';} return {status:resp.status, err:JSON.stringify(b)}; }
      const j = await resp.json(); const arr=j.data||j; return {status:resp.status, len:arr.length, lastRank:arr[arr.length-1]?.top_free?.top_free};
    }, {headers});
    console.log(`  [${label}] topDepth=1000 -> ${JSON.stringify(r)}`);
    results.push({label, ...r});
  }
  // 同时测一下 users/user 带 token
  if (token) {
    const who = await page.evaluate(async ({token}) => {
      const resp = await fetch('/api/v2/users/user?lang=cn', { headers:{ Authorization:'Bearer '+token } });
      const t = await resp.text(); return t.slice(0,300);
    }, {token});
    console.log('\n  users/user(带Bearer):', who);
  }

  fs.writeFileSync(OUT, JSON.stringify({ store, tokenInfo, hasToken: !!token, results }, null, 2), 'utf-8');
  await ctx.close();
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
