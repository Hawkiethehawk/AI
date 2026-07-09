#!/usr/bin/env node
// @ts-check
// AppMagic Weekly Data — 统一 CLI 入口
// 脱离 AI agent，可独立运行和定时调度
//
// 用法: am <command> [options]
//   am setup             安装依赖 + 生成配置
//   am status            显示登录状态 + 邮箱
//   am login [profile]   浏览器登录
//   am check             仅 auth check
//   am run [--fresh] [--list-only] [--week-anchor YYYY-MM-DD]
//                        完整采集流程
//   am export            仅 Excel 导出
//   am tags update       更新 tag 字典
//   am dashboard         启动看板
//   am schedule init     生成调度任务
//   am config show       显示配置

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');

// ── 配置加载 ──

function resolveProjectDir() {
  return path.resolve(process.env.APPMAGIC_PROJECT_DIR || process.cwd());
}

function loadConfig(projectDir) {
  const cfgPath = path.join(projectDir, 'appmagic-config.json');
  if (!fs.existsSync(cfgPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
  } catch {
    console.warn('⚠️  配置文件解析失败:', cfgPath);
    return {};
  }
}

function currentMonday() {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

function u(...codes) { return String.fromCodePoint(...codes); }

const CATS = [
  u(0x8D85, 0x4F11, 0x95F2),
  u(0x4F11, 0x95F2),
  'Launcher',
  u(0x6740, 0x6BD2, 0x8F6F, 0x4EF6, 0x3001, 0x6E05, 0x7406),
  u(0x6587, 0x4EF6, 0x6062, 0x590D),
  'PDF' + u(0x9605, 0x8BFB, 0x5668),
];

const SKILL_ROOT = __dirname;
const SCRIPTS = path.join(SKILL_ROOT, 'scripts');

// ── 工具函数 ──

const DASHBOARD_PORT = process.env.APPMAGIC_PORT || '8787';
const DASHBOARD_URL = `http://localhost:${DASHBOARD_PORT}`;

function httpGet(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${DASHBOARD_URL}${urlPath}`, { timeout: 5000 }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    }).on('error', reject);
  });
}

function httpPost(urlPath, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const req = http.request(`${DASHBOARD_URL}${urlPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 10000,
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function dashboardRunning() {
  try {
    await httpGet('/api/health');
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${m % 60}m`;
  if (m > 0) return `${m}m${s % 60}s`;
  return `${s}s`;
}

// ── 子命令 ──

async function cmdSetup() {
  console.log('🔧 AppMagic 独立化安装\n');

  // 1. 检查 Node.js
  const nodeVer = process.version;
  console.log(`  Node.js: ${nodeVer}`);

  // 2. 检查 Python
  try {
    const py = execSync('python3 --version 2>&1 || python --version 2>&1', { encoding: 'utf-8' }).trim();
    console.log(`  Python:  ${py}`);
  } catch {
    console.log('  ⚠️  Python 未检测到，Excel 导出功能需要 Python');
  }

  // 3. npm install
  console.log('\n📦 安装 Node.js 依赖...');
  try {
    execSync('npm install @playwright/test', { cwd: SKILL_ROOT, stdio: 'inherit' });
  } catch {
    console.log('  ⚠️  npm install 失败，请手动运行: npm install @playwright/test');
  }

  // 4. Playwright Chromium
  console.log('\n🌐 安装 Chromium...');
  try {
    execSync('npx playwright install chromium', { cwd: SKILL_ROOT, stdio: 'inherit' });
  } catch {
    console.log('  ⚠️  Chromium 安装失败，请手动运行: npx playwright install chromium');
  }

  // 5. openpyxl
  console.log('\n🐍 安装 openpyxl...');
  try {
    execSync('pip install openpyxl 2>&1 || pip3 install openpyxl 2>&1 || python -m pip install openpyxl 2>&1', { stdio: 'inherit' });
  } catch {
    console.log('  ⚠️  openpyxl 安装失败，请手动运行: pip install openpyxl');
  }

  // 6. 生成配置文件
  const projectDir = resolveProjectDir();
  const cfgPath = path.join(projectDir, 'appmagic-config.json');
  if (!fs.existsSync(cfgPath)) {
    const examplePath = path.join(SKILL_ROOT, 'references', 'appmagic-config.example.json');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, cfgPath);
      console.log(`\n✅ 配置文件已生成: ${cfgPath}`);
    }
  } else {
    console.log(`\n  配置文件已存在: ${cfgPath}`);
  }

  console.log('\n✅ 安装完成。下一步: am login');
}

async function cmdStatus() {
  const projectDir = resolveProjectDir();
  const cfg = loadConfig(projectDir);

  // 发现 profiles
  const dirs = cfg.accounts
    ? cfg.accounts.split(',').map(s => s.trim()).filter(Boolean)
    : (() => {
        try {
          return fs.readdirSync(projectDir)
            .filter(d => /^\.appmagic-userdata(-.+)?$/.test(d))
            .sort();
        } catch { return []; }
      })();

  if (!dirs.length) {
    console.log('未发现 .appmagic-userdata* profile。请先运行: am login');
    return;
  }

  console.log('📋 AppMagic 账号状态\n');
  console.log('Profile'.padEnd(28) + 'Token'.padEnd(10) + '状态');
  console.log('-'.repeat(50));

  for (const dir of dirs) {
    const tokenPath = path.join(projectDir, dir, 'appmagic-token.json');
    const hasToken = fs.existsSync(tokenPath);
    let cachedDate = '';
    if (hasToken) {
      try {
        const t = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
        cachedDate = t.savedAt ? new Date(t.savedAt).toLocaleString() : '未知';
      } catch {}
    }

    // 尝试读取邮箱
    let email = '';
    try {
      const ps1Path = path.join(SCRIPTS, 'appmagic_profile_emails.ps1');
      const out = execSync(`powershell -Command "& '${ps1Path}' -ProjectDir '${projectDir}' -Accounts '${dir}' -AllowUnknown"`, {
        encoding: 'utf-8', timeout: 30000,
      });
      const match = out.match(new RegExp(`${dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(\\S+@\\S+)`));
      if (match) email = match[1];
    } catch {}

    const tokenStatus = hasToken ? `缓存(${cachedDate.slice(0, 10) || '?'})` : '无';
    const statusIcon = hasToken ? '🟡' : '⚪';
    const emailStr = email ? ` (${email})` : '';

    console.log(`${dir.padEnd(28)}${tokenStatus.padEnd(10)}${statusIcon}${emailStr}`);
  }

  // 去重检测
  console.log('\n💡 运行 "am check" 验证 token 有效性');
}

async function cmdLogin(profile) {
  const projectDir = resolveProjectDir();
  const dir = profile || '.appmagic-userdata';
  const loginScript = path.join(SCRIPTS, 'appmagic-login.js');

  console.log(`🔑 打开浏览器登录 AppMagic — Profile: ${dir}`);
  console.log('   浏览器窗口将打开，请在窗口中完成登录。');
  console.log('   登录成功后脚本自动退出。\n');

  const env = {
    ...process.env,
    APPMAGIC_PROJECT_DIR: projectDir,
    APPMAGIC_USERDATA_DIR: dir,
    APPMAGIC_LOGIN_WAIT_MIN: '10',
  };

  return new Promise((resolve) => {
    const child = spawn('node', [loginScript], { env, stdio: 'inherit' });
    child.on('exit', code => {
      if (code === 0) {
        console.log(`\n✅ ${dir} 登录成功`);
      } else {
        console.log(`\n❌ ${dir} 登录失败 (退出码 ${code})`);
      }
      resolve(code);
    });
  });
}

async function cmdCheck() {
  const projectDir = resolveProjectDir();
  const weeklyScript = path.join(SCRIPTS, 'appmagic-weekly.js');

  console.log('🔍 验证 AppMagic 账号...\n');

  const env = {
    ...process.env,
    APPMAGIC_PROJECT_DIR: projectDir,
    CHECK_AUTH: '1',
  };

  return new Promise((resolve) => {
    const child = spawn('node', [weeklyScript], { env, stdio: 'pipe' });
    let out = '';
    child.stdout.on('data', c => { out += c.toString(); process.stdout.write(c); });
    child.stderr.on('data', c => { out += c.toString(); process.stderr.write(c); });

    child.on('exit', code => {
      const oks = (out.match(/OK\s+(\S+)/g) || []).length;
      const fails = (out.match(/FAIL\s+(\S+)/g) || []).length;
      console.log(`\n结果: ${oks} OK, ${fails} FAIL`);
      if (fails > 0) {
        console.log('💡 失败账号需要重新登录: am login <profile>');
      }
      resolve(code);
    });
  });
}

async function cmdRun(args) {
  const projectDir = resolveProjectDir();
  const cfg = loadConfig(projectDir);

  // 解析参数
  const fresh = args.includes('--fresh');
  const listOnly = args.includes('--list-only');
  const dryRun = args.includes('--dry-run');
  const weekIdx = args.indexOf('--week-anchor');
  const weekAnchor = weekIdx >= 0 ? args[weekIdx + 1] : (cfg.collection && cfg.collection.week_anchor) || currentMonday();

  console.log('⚡ AppMagic 周报采集');
  console.log(`   周锚点: ${weekAnchor}`);
  console.log(`   项目目录: ${projectDir}`);
  console.log(`   模式: ${fresh ? '强制刷新' : '使用缓存'}${listOnly ? ' · 仅榜单' : ''}\n`);

  if (dryRun) {
    console.log('[DRY RUN] 将使用以下参数:');
    console.log(`  TOP_DEPTH: ${cfg.topDepth || 1000}`);
    console.log(`  ACCOUNTS: ${cfg.accounts || '(自动发现)'}`);
    console.log(`  MAX_WORKERS: ${cfg.maxWorkers || 10}`);
    console.log(`  FORCE_REFRESH: ${fresh ? 1 : 0}`);
    console.log(`  LIST_ONLY: ${listOnly ? 1 : 0}`);
    return;
  }

  // 确保 dashboard 运行
  if (!(await dashboardRunning())) {
    console.log('📡 启动看板服务...');
    const serverScript = path.join(SCRIPTS, 'progress-server.js');
    spawn('node', [serverScript], {
      env: { ...process.env, APPMAGIC_PROJECT_DIR: projectDir, APPMAGIC_NO_OPEN: '1' },
      stdio: 'ignore',
      detached: true,
    }).unref();
    await sleep(1500);
    if (!(await dashboardRunning())) {
      console.error('❌ 无法启动看板服务');
      process.exit(1);
    }
  }

  // 发起采集
  console.log('🚀 发起采集...');
  try {
    const startRes = await httpPost('/api/run/start', {
      weekAnchor,
      fresh,
      listOnly,
      skipExcel: cfg.skipExcel || false,
    });

    if (startRes.error) {
      console.error(`❌ 采集启动失败: ${startRes.error}`);
      // 尝试翻译错误
      if (startRes.error.includes('auth') || startRes.error.includes('login')) {
        console.log('💡 运行 "am check" 查看具体失败账号，然后 "am login" 重新登录');
      }
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ 无法连接到看板: ${err.message}`);
    process.exit(1);
  }

  // 轮询进度
  console.log('⏳ 采集进行中...\n');
  let lastStage = '';
  while (true) {
    await sleep(3000);
    try {
      const run = await httpGet('/api/run');
      if (!run || !run.state) continue;

      const progress = await httpGet('/api/progress');
      if (!progress) continue;

      // 显示阶段变化
      if (progress.currentStage !== lastStage) {
        lastStage = progress.currentStage;
        console.log(`\n▸ ${progress.stageLabel || progress.currentStage}`);
      }

      // 显示品类进度
      if (progress.cats) {
        for (const c of progress.cats) {
          if (c.status === 'done') continue;
          const bar = c.pct ? '█'.repeat(Math.round(c.pct / 10)) + '░'.repeat(10 - Math.round(c.pct / 10)) : '';
          const pctStr = c.pct ? `${c.pct}%` : '';
          const detail = c.detail || c.cur || '';
          if (c.status !== 'wait') {
            process.stdout.write(`\r  ${c.label.padEnd(12)} ${bar.padEnd(12)} ${pctStr.padEnd(5)} ${detail.slice(0, 40).padEnd(40)}`);
          }
        }
      }

      // 完成检测
      if (run.state === 'done') {
        console.log('\n\n✅ 采集完成');
        break;
      }
      if (run.state === 'failed' || run.state === 'error') {
        console.log('\n\n❌ 采集失败');
        // 打印事件日志中的错误
        if (progress.events) {
          const errs = progress.events.filter(e => e.level === 'error');
          for (const e of errs.slice(-5)) {
            console.log(`   ${e.message}`);
          }
        }
        break;
      }
      if (run.state === 'stopped') {
        console.log('\n\n⏹️  采集已停止');
        break;
      }
    } catch {
      // dashboard may have gone down
    }
  }

  // 找输出目录
  const mon = weekAnchor.replace(/-/g, '');
  const outDir = path.join(projectDir, 'output', 'folder', `AppMagic-${mon}`);
  const progressFile = path.join(outDir, 'appmagic-progress.json');

  // 检查是否成功
  let success = false;
  try {
    const p = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
    success = p.overall === 100 || p.currentStage === 'done';
  } catch {}

  // 验证 + 通知
  console.log('\n📋 验证结果...');
  const validateScript = path.join(SCRIPTS, 'validate.js');
  try {
    execSync(`node "${validateScript}" "${outDir}"`, { stdio: 'inherit' });
  } catch {}

  console.log('\n📝 生成报告...');
  const notifyScript = path.join(SCRIPTS, 'notify.js');
  const event = success ? 'success' : 'failure';
  try {
    execSync(`node "${notifyScript}" "${outDir}" --event ${event} --config "${path.join(projectDir, 'appmagic-config.json')}"`, { stdio: 'inherit' });
  } catch {}

  if (!success) process.exit(2);
}

async function cmdExport() {
  const projectDir = resolveProjectDir();
  const weekAnchor = process.env.WEEK_ANCHOR || currentMonday();
  const mon = weekAnchor.replace(/-/g, '');
  const outDir = path.join(projectDir, 'output', 'folder', `AppMagic-${mon}`);

  console.log('📊 Excel 导出\n');

  for (const cat of CATS) {
    const jsonFile = path.join(outDir, `appmagic-${cat}-weekly.json`);
    if (!fs.existsSync(jsonFile)) {
      console.log(`  [skip] 无数据: ${cat}`);
      continue;
    }
    const xlsxScript = path.join(SCRIPTS, 'appmagic_xlsx.py');
    try {
      execSync(`python "${xlsxScript}" "${cat}"`, {
        env: { ...process.env, APPMAGIC_PROJECT_DIR: projectDir, WEEK_ANCHOR: weekAnchor },
        stdio: 'inherit',
      });
    } catch {
      console.error(`  ❌ 导出失败: ${cat}`);
    }
  }

  console.log('\n📑 合并 Excel...');
  const mergedScript = path.join(SCRIPTS, 'appmagic_xlsx_merged.py');
  try {
    execSync(`python "${mergedScript}"`, {
      env: { ...process.env, APPMAGIC_PROJECT_DIR: projectDir, WEEK_ANCHOR: weekAnchor },
      stdio: 'inherit',
    });
    console.log(`  ✅ ${path.join(outDir, `AppMagic-${mon}.xlsx`)}`);
  } catch {
    console.error('  ❌ 合并失败');
  }
}

async function cmdTagsUpdate() {
  const projectDir = resolveProjectDir();
  const tagsScript = path.join(SCRIPTS, 'appmagic_tags_dict.js');
  console.log('🏷️  更新 Tag 字典...\n');

  try {
    execSync(`node "${tagsScript}"`, {
      env: { ...process.env, APPMAGIC_PROJECT_DIR: projectDir },
      stdio: 'inherit',
    });
    console.log('✅ Tag 字典已更新');
  } catch {
    console.error('❌ Tag 字典更新失败');
    process.exit(1);
  }
}

async function cmdStart() {
  const projectDir = resolveProjectDir();
  const urls = getUrls();

  if (await dashboardRunning()) {
    console.log('📡 看板已在运行');
    for (const u of urls) console.log(`   ${u}`);
    return;
  }

  console.log('📡 启动看板...');
  const serverScript = path.join(SCRIPTS, 'progress-server.js');
  const out = fs.openSync(path.join(projectDir, 'appmagic-dashboard.log'), 'a');
  const child = spawn(process.execPath, [serverScript], {
    cwd: projectDir,
    env: { ...process.env, APPMAGIC_PROJECT_DIR: projectDir, APPMAGIC_NO_OPEN: '1' },
    detached: true,
    stdio: ['ignore', out, out],
    windowsHide: true,
  });
  child.unref();
  try { fs.closeSync(out); } catch {}

  await sleep(4000);

  if (await dashboardRunning()) {
    console.log('✅ 看板已启动');
    for (const u of urls) console.log(`   ${u}`);
  } else {
    console.error('❌ 看板启动失败：服务未响应');
    process.exit(1);
  }
}

async function cmdStop() {
  if (!(await dashboardRunning())) {
    console.log('看板未在运行');
    return;
  }

  const port = DASHBOARD_PORT;
  try {
    if (process.platform === 'win32') {
      const out = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf-8' });
      const pid = out.trim().split(/\s+/).pop();
      if (pid) execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    } else {
      execSync(`fuser -k ${port}/tcp 2>/dev/null || ss -tlnp | grep :${port} | grep -oP 'pid=\\K\\d+' | xargs -r kill`, { stdio: 'ignore' });
    }
    await sleep(800);
    if (!(await dashboardRunning())) {
      console.log('✅ 看板已关闭');
    } else {
      console.log('⚠️  关闭失败，端口仍被占用');
    }
  } catch {
    console.log('⚠️  关闭失败');
  }
}

async function cmdRestart() {
  await cmdStop();
  await sleep(1000);
  await cmdStart();
}

function getUrls() {
  const urls = [`http://localhost:${DASHBOARD_PORT}`];
  // WSL2 环境下额外返回 WSL IP
  try {
    if (!process.env.WSL_DISTRO_NAME && !fs.existsSync('/proc/sys/fs/binfmt_misc/WSL')) {
      // 检查 /proc/version 是否含 Microsoft/WSL
      const pv = fs.readFileSync('/proc/version', 'utf-8');
      if (!/(microsoft|wsl)/i.test(pv)) return urls;
    }
    const ip = execSync("hostname -I 2>/dev/null | awk '{print $1}'", { encoding: 'utf-8', timeout: 3000 }).trim();
    if (ip) urls.push(`http://${ip}:${DASHBOARD_PORT}`);
  } catch {}
  return urls;
}

async function cmdSchedule(sub) {
  const projectDir = resolveProjectDir();
  const scheduleDir = path.join(SKILL_ROOT, 'schedules');

  if (sub === 'init') {
    if (process.platform === 'win32') {
      const xmlPath = path.join(scheduleDir, 'weekly-run.xml');
      console.log('📅 Windows Task Scheduler 模板:');
      console.log(`   ${xmlPath}`);
      console.log('\n   手动导入:');
      console.log(`   schtasks /create /xml "${xmlPath}" /tn "AppMagic Weekly"`);
    } else {
      const shPath = path.join(scheduleDir, 'weekly-run.sh');
      console.log('📅 Linux cron 模板:');
      console.log(`   ${shPath}`);
      console.log('\n   示例 crontab (每周一 09:00):');
      console.log(`   0 9 * * 1 ${shPath}`);
      console.log('\n   安装:');
      console.log(`   (crontab -l; echo "0 9 * * 1 ${shPath}") | crontab -`);
    }
  } else if (sub === 'remove') {
    if (process.platform === 'win32') {
      console.log('运行: schtasks /delete /tn "AppMagic Weekly" /f');
    } else {
      console.log('运行: crontab -l | grep -v appmagic-weekly | crontab -');
    }
  }
}

async function cmdConfigShow() {
  const projectDir = resolveProjectDir();
  const cfg = loadConfig(projectDir);
  console.log('📋 当前配置合并 (env vars > config file > defaults):\n');
  console.log(JSON.stringify({
    projectDir,
    accounts: cfg.accounts || '(自动发现)',
    topDepth: process.env.TOP_DEPTH || cfg.topDepth || 1000,
    maxWorkers: process.env.APPMAGIC_MAX_WORKERS || cfg.maxWorkers || 10,
    dcGapMs: process.env.DC_GAP_MS || cfg.dcGapMs || 500,
    dcCooldownMs: process.env.DC_COOLDOWN_MS || cfg.dcCooldownMs || 120000,
    leaderboardWeekConcurrency: process.env.LEADERBOARD_WEEK_CONCURRENCY || cfg.leaderboardWeekConcurrency || 3,
    authCheckConcurrency: process.env.AUTH_CHECK_CONCURRENCY || cfg.authCheckConcurrency || 3,
    skipExcel: cfg.skipExcel || false,
    notifications: cfg.notifications || {},
    schedule: cfg.schedule || {},
  }, null, 2));
}

// ── 帮助 ──

function showHelp() {
  console.log(`
AppMagic Weekly Data — 独立 CLI

用法: am <command> [options]

命令:
  setup             安装依赖 + 生成默认配置
  status            显示所有 profile 的登录状态 + 邮箱
  login [profile]   打开浏览器登录指定 profile（默认 .appmagic-userdata）
  check             仅运行 auth check，输出每账号 OK/FAIL
  run               完整采集流程：check → scrape → export → validate → notify
    --fresh           强制刷新（跳过缓存）
    --list-only       仅榜单，跳过国别富化
    --week-anchor <d> 指定周锚点 YYYY-MM-DD（默认自动计算本周一）
    --dry-run         显示将使用的参数，不实际运行
  export            仅导出 Excel（需已有 JSON 数据）
  tags update       更新 tag 字典
  start             启动进度看板，返回访问地址
  stop              关闭进度看板
  restart           重启进度看板
  schedule init     生成调度任务模板
  schedule remove   移除调度任务
  config show       显示当前合并后的配置

配置文件: <project-dir>/appmagic-config.json
环境变量优先于配置文件。
`);
}

// ── 主入口 ──

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    showHelp();
    process.exit(0);
  }

  switch (cmd) {
    case 'setup':
      await cmdSetup();
      break;
    case 'status':
      await cmdStatus();
      break;
    case 'login':
      await cmdLogin(args[1]);
      break;
    case 'check':
      await cmdCheck().then(code => process.exit(code || 0));
      break;
    case 'run':
      await cmdRun(args.slice(1));
      break;
    case 'export':
      await cmdExport();
      break;
    case 'tags':
      if (args[1] === 'update') await cmdTagsUpdate();
      else console.log('用法: am tags update');
      break;
    case 'start':
    case 'dashboard':
      await cmdStart();
      break;
    case 'stop':
      await cmdStop();
      break;
    case 'restart':
      await cmdRestart();
      break;
    case 'schedule':
      await cmdSchedule(args[1]);
      break;
    case 'config':
      if (args[1] === 'show') await cmdConfigShow();
      else console.log('用法: am config show');
      break;
    default:
      console.error(`未知命令: ${cmd}`);
      console.error('运行 "am help" 查看可用命令');
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
