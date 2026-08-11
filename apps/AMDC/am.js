#!/usr/bin/env node
// @ts-check
// AMDC — 统一 CLI 入口
// 脱离 AI agent，可独立运行和定时调度
//
// 用法: amdc <command> [options]
//   amdc setup             安装依赖 + 生成配置
//   amdc status            先检查登录状态，再显示 profile + 邮箱
//   amdc login [profile]   浏览器登录
//   amdc check             仅 auth check
//   amdc export            仅 Excel 导出
//   amdc tags update       更新 tag 字典
//   amdc dashboard         启动看板
//   amdc schedule init     生成调度任务
//   amdc config show       显示配置
//   amdc update            从 gitee 拉取最新版本

const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn, execSync } = require('child_process');

class UsageError extends Error {
  constructor(message) {
    super(message);
    this.code = 'USAGE';
  }
}

// ── 配置加载 ──

function resolveProjectDir() {
  if (process.env.AMDC_PROJECT_DIR) {
    return path.resolve(process.env.AMDC_PROJECT_DIR);
  }

  const currentDir = path.resolve(process.cwd());
  if (isAMDCProjectDir(currentDir)) return currentDir;

  // npm link 的 CLI 入口通常直接指向 AMDC 项目；从其他目录执行时，
  // 使用 CLI 所在的项目目录，确保 status/login/check 等命令读取同一份数据。
  const appRoot = path.resolve(APP_ROOT);
  if (isAMDCProjectDir(appRoot)) {
    console.log(`📍 自动定位 AMDC 项目: ${appRoot}`);
    return appRoot;
  }

  return currentDir;
}

function loadConfig(projectDir) {
  const cfgPath = path.join(projectDir, 'amdc-config.json');
  if (!fs.existsSync(cfgPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
  } catch {
    console.warn('⚠️  配置文件解析失败:', cfgPath);
    return {};
  }
}

function redactSecrets(value, key = '') {
  if (Array.isArray(value)) return value.map(item => redactSecrets(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [
      childKey,
      redactSecrets(childValue, childKey),
    ]));
  }
  if (/(token|password|secret|credential|authorization|api[-_]?key)/i.test(key)) return '********';
  return value;
}

function resolveLatestDataDir(projectDir, weekAnchor) {
  if (process.env.AMDC_RUN_DIR) return path.resolve(process.env.AMDC_RUN_DIR);
  const mon = String(weekAnchor || '').replace(/-/g, '');
  const legacyDir = path.join(projectDir, 'Cache', mon);
  const historyDir = path.join(projectDir, 'Cache', 'history');
  let candidates = [];
  try {
    candidates = fs.readdirSync(historyDir)
      .filter(name => /^\d{8}-\d{6}-[a-f0-9]{4}$/.test(name))
      .map(name => path.join(historyDir, name))
      .filter(dir => {
        try {
          const metadata = JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json'), 'utf-8'));
          return !metadata.weekAnchor || metadata.weekAnchor === weekAnchor;
        } catch { return false; }
      })
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  } catch {}
  return candidates[0] || legacyDir;
}

function previousMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 6) % 7 + 7;
  d.setDate(d.getDate() - diff);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function requireMondayAnchor(value) {
  const text = String(value || '').trim();
  const date = new Date(`${text}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)
    || !Number.isFinite(date.getTime())
    || date.toISOString().slice(0, 10) !== text
    || date.getUTCDay() !== 1) {
    throw new Error(`采集日期只能选择周一（YYYY-MM-DD）：${text || '(空)'}`);
  }
  return text;
}

function u(...codes) { return String.fromCodePoint(...codes); }

const CATS = [
  u(0x8D85, 0x4F11, 0x95F2),
  u(0x4F11, 0x95F2),
  u(0x58C1, 0x7EB8),
  'Launcher',
  u(0x6740, 0x6BD2, 0x8F6F, 0x4EF6, 0x3001, 0x6E05, 0x7406),
  u(0x6587, 0x4EF6, 0x6062, 0x590D),
  'PDF' + u(0x9605, 0x8BFB, 0x5668),
];

const APP_ROOT = __dirname;
const SCRIPTS = path.join(APP_ROOT, 'scripts');

// ── 工具函数 ──

// WSL → 8788, Windows → 8787（可通过 AMDC_PORT 环境变量覆盖）
function isWSL() {
  if (process.platform !== 'linux') return false;
  try { return require('fs').readFileSync('/proc/version', 'utf-8').toLowerCase().includes('microsoft'); } catch { return false; }
}
const DASHBOARD_PORT = process.env.AMDC_PORT || (isWSL() ? '8788' : '8787');
const DASHBOARD_URL = `http://127.0.0.1:${DASHBOARD_PORT}`;

function httpGet(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${DASHBOARD_URL}${urlPath}`, { timeout: 5000 }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    }).on('error', reject);
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

function sameDir(a, b) {
  return path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
}

function isAMDCProjectDir(dir) {
  if (fs.existsSync(path.join(dir, 'amdc-config.json'))) return true;
  if (fs.existsSync(path.join(dir, '.amdc-userdata'))) return true;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
    if (pkg && pkg.name === 'amdc') return true;
  } catch {}
  return fs.existsSync(path.join(dir, 'am.js'))
    && fs.existsSync(path.join(dir, 'scripts', 'progress-server.js'));
}

function resolveDashboardProjectDir(projectDirArg) {
  if (projectDirArg) return path.resolve(projectDirArg);
  return resolveProjectDir();
}

function resolveRepositoryRoot(startDir) {
  try {
    return execSync('git rev-parse --show-toplevel', {
      cwd: startDir,
      encoding: 'utf-8',
      timeout: 5000,
    }).trim();
  } catch {
    return '';
  }
}

function assertDashboardProjectDir(projectDir) {
  if (process.env.AMDC_PROJECT_DIR || isAMDCProjectDir(projectDir)) return;
  if (!sameDir(projectDir, os.homedir())) return;
  console.error('❌ 当前目录是用户主目录，不像 AMDC 项目目录：' + projectDir);
  console.error('   请先 cd 到 AMDC 项目目录后运行 amdc dashboard / amdc start');
  console.error('   或显式设置 AMDC_PROJECT_DIR 为项目目录。');
  process.exit(1);
}

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${m % 60}m`;
  if (m > 0) return `${m}m${s % 60}s`;
  return `${s}s`;
}

function terminalWidth(value) {
  let width = 0;
  for (const char of String(value)) {
    const code = char.codePointAt(0);
    if (!code || code === 0xfe0e || code === 0xfe0f || /\p{Mark}/u.test(char)) continue;
    const wide = code >= 0x1100 && (
      code <= 0x115f || code === 0x2329 || code === 0x232a
      || (code >= 0x2e80 && code <= 0xa4cf)
      || (code >= 0xac00 && code <= 0xd7a3)
      || (code >= 0xf900 && code <= 0xfaff)
      || (code >= 0xfe10 && code <= 0xfe6f)
      || (code >= 0xff00 && code <= 0xff60)
      || (code >= 0xffe0 && code <= 0xffe6)
      || (code >= 0x1f300 && code <= 0x1faff)
    );
    width += wide ? 2 : 1;
  }
  return width;
}

function padTableCell(value, width) {
  const text = String(value);
  const gap = Math.max(width - terminalWidth(text), 0);
  const left = Math.floor(gap / 2);
  return `${' '.repeat(left)}${text}${' '.repeat(gap - left)}`;
}

function maskEmail(email) {
  const value = String(email || '').trim();
  const at = value.indexOf('@');
  if (at <= 0) return value ? '***' : '';
  const local = value.slice(0, at);
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}***${value.slice(at)}`;
}

function renderTableRow(values, widths) {
  return `│${values.map((value, i) => ` ${padTableCell(value, widths[i])} `).join('│')}│`;
}

function renderTableBorder(widths, left, join, right) {
  return `${left}${widths.map(width => '─'.repeat(width + 2)).join(join)}${right}`;
}

function readProfileEmail(projectDir, dir) {
  return new Promise(resolve => {
    const ps1Path = path.join(SCRIPTS, 'amdc_profile_emails.ps1');
    const command = `& '${ps1Path}' -ProjectDir '${projectDir}' -Accounts '${dir}' -AllowUnknown`;
    const child = spawn('powershell', ['-NoProfile', '-Command', command], {
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true,
    });
    let out = '';
    let settled = false;
    const finish = email => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve([dir, email]);
    };
    const timer = setTimeout(() => {
      try { child.kill(); } catch {}
      finish('');
    }, 30000);

    child.stdout.on('data', chunk => { out += chunk.toString(); });
    child.on('error', () => finish(''));
    child.on('close', () => {
      const escaped = dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = out.match(new RegExp(`${escaped}[\\t ]+(\\S+@\\S+)`));
      finish(match ? match[1] : '');
    });
  });
}

async function readProfileEmails(projectDir, dirs) {
  const rows = await Promise.all(dirs.map(dir => readProfileEmail(projectDir, dir)));
  return new Map(rows.filter(([, email]) => email));
}

// ── 子命令 ──

async function cmdSetup() {
  console.log('🔧 AMDC 独立化安装\n');

  // 1. 运行 npm postinstall 同款环境检查：Node / Chromium / Python openpyxl
  const postinstallScript = path.join(SCRIPTS, 'postinstall.js');
  if (fs.existsSync(postinstallScript)) {
    try {
      execSync(`node "${postinstallScript}"`, { cwd: APP_ROOT, stdio: 'inherit' });
    } catch {
      console.log('  ⚠️  环境检查存在未完成项，请按上方提示处理');
    }
  } else {
    console.log(`  Node.js: ${process.version}`);
  }

  // 2. 额外提示 Python 状态，便于 setup 输出更直观
  try {
    const py = execSync('python3 --version 2>&1 || python --version 2>&1', { encoding: 'utf-8' }).trim();
    console.log(`  Python:  ${py}`);
  } catch {
    console.log('  ⚠️  Python 未检测到，Excel 导出功能需要 Python');
  }

  // 3. 生成配置文件
  const projectDir = resolveProjectDir();
  const cfgPath = path.join(projectDir, 'amdc-config.json');
  if (!fs.existsSync(cfgPath)) {
    const examplePath = path.join(APP_ROOT, 'references', 'amdc-config.example.json');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, cfgPath);
      console.log(`\n✅ 配置文件已生成: ${cfgPath}`);
    }
  } else {
    console.log(`\n  配置文件已存在: ${cfgPath}`);
  }

  console.log('\n✅ 安装完成。下一步: amdc login');
}

async function cmdStatus() {
  const projectDir = resolveProjectDir();
  // status 先做一次实时认证探针，再展示本地缓存和账号信息。
  console.log('正在查询账号状态...');
  const { statusByProfile } = await cmdCheck(projectDir, { silent: true });

  const cfg = loadConfig(projectDir);

  // 发现 profiles
  const dirs = cfg.accounts
    ? cfg.accounts.split(',').map(s => s.trim()).filter(Boolean)
    : (() => {
        try {
          return fs.readdirSync(projectDir)
            .filter(d => /^\.amdc-userdata(-.+)?$/.test(d))
            .sort();
        } catch { return []; }
      })();

  if (!dirs.length) {
    console.log('未发现 .amdc-userdata* profile。请先运行: amdc login');
    return;
  }

  console.log('');
  const emailByProfile = await readProfileEmails(projectDir, dirs);
  const rows = [];

  for (const dir of dirs) {
    const tokenPath = path.join(projectDir, dir, 'amdc-token.json');
    const hasToken = fs.existsSync(tokenPath);
    let cachedDate = '';
    if (hasToken) {
      try {
        const t = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
        const savedAt = t.savedAt ? new Date(t.savedAt) : null;
        cachedDate = savedAt && !Number.isNaN(savedAt.getTime())
          ? savedAt.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
          : '未知';
      } catch {}
    }

    const tokenStatus = hasToken ? `缓存 ${cachedDate || '?'}` : '无缓存';
    const authStatus = statusByProfile.get(dir) || 'UNKNOWN';
    const statusDisplay = {
      OK: '🟢 正常',
      UNKNOWN: '🟡 异常',
      FAIL: '🔴 失效',
    }[authStatus] || '🟡 异常';

    rows.push({
      profile: dir,
      token: tokenStatus,
      status: statusDisplay,
      email: maskEmail(emailByProfile.get(dir)) || '-',
    });
  }

  const widthFor = (title, values, minimum) => Math.max(
    minimum,
    terminalWidth(title),
    ...values.map(value => terminalWidth(value)),
  );
  const widths = [
    widthFor('Profile', rows.map(row => row.profile), 24),
    widthFor('Token', rows.map(row => row.token), 16),
    widthFor('状态', rows.map(row => row.status), 10),
    widthFor('邮箱', rows.map(row => row.email), 24),
  ];
  console.log(renderTableBorder(widths, '┌', '┬', '┐'));
  console.log(renderTableRow(['Profile', 'Token', '状态', '邮箱'], widths));
  console.log(renderTableBorder(widths, '├', '┼', '┤'));
  for (const row of rows) {
    console.log(renderTableRow([row.profile, row.token, row.status, row.email], widths));
  }
  console.log(renderTableBorder(widths, '└', '┴', '┘'));
}

async function cmdLogin(profile) {
  const projectDir = resolveProjectDir();
  const dir = profile || '.amdc-userdata';
  const loginScript = path.join(SCRIPTS, 'amdc-login.js');

  console.log(`🔑 打开浏览器登录 AMDC — Profile: ${dir}`);
  console.log('   浏览器窗口将打开，请在窗口中完成登录。');
  console.log('   登录成功后脚本自动退出。\n');

  const env = {
    ...process.env,
    AMDC_PROJECT_DIR: projectDir,
    AMDC_USERDATA_DIR: dir,
    AMDC_LOGIN_WAIT_MIN: '10',
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

async function cmdCheck(projectDirArg, options = {}) {
  const projectDir = projectDirArg ? path.resolve(projectDirArg) : resolveProjectDir();
  const weeklyScript = path.join(SCRIPTS, 'amdc-weekly.js');
  const silent = options.silent === true;

  if (!silent) console.log('🔍 验证 AMDC 账号...\n');

  const env = {
    ...process.env,
    AMDC_PROJECT_DIR: projectDir,
    CHECK_AUTH: '1',
  };

  return new Promise((resolve) => {
    const child = spawn('node', [weeklyScript], { env, stdio: 'pipe' });
    let out = '';
    child.stdout.on('data', c => {
      out += c.toString();
      if (!silent) process.stdout.write(c);
    });
    child.stderr.on('data', c => {
      out += c.toString();
      if (!silent) process.stderr.write(c);
    });

    child.on('exit', code => {
      const oks = (out.match(/OK\s+(\S+)/g) || []).length;
      const fails = (out.match(/FAIL\s+(\S+)/g) || []).length;
      const unknowns = (out.match(/UNKNOWN\s+(\S+)/g) || []).length;
      const statusByProfile = new Map(
        [...out.matchAll(/^(OK|FAIL|UNKNOWN)[ \t]+(\S+)[ \t]*$/gm)]
          .map(match => [match[2], match[1]]),
      );
      if (!silent) {
        console.log(`\n结果: ${oks} OK, ${fails} FAIL, ${unknowns} UNKNOWN`);
        if (fails > 0) {
          console.log('💡 失败账号需要重新登录: amdc login <profile>');
        }
        if (unknowns > 0) {
          console.log('💡 UNKNOWN 表示网络暂时无法确认，已保留本地登录态');
        }
      }
      resolve({ code, statusByProfile });
    });
  });
}

async function cmdExport() {
  const projectDir = resolveProjectDir();
  const weekAnchor = requireMondayAnchor(process.env.WEEK_ANCHOR || previousMonday());
  const mon = weekAnchor.replace(/-/g, '');
  const cacheDir = resolveLatestDataDir(projectDir, weekAnchor);

  console.log('📊 Excel 导出\n');

  if (!fs.existsSync(cacheDir)) {
    console.error(`  ❌ 缓存目录不存在: ${cacheDir}`);
    process.exit(1);
  }

  console.log('📑 生成唯一 Excel...');
  const mergedScript = path.join(SCRIPTS, 'amdc_xlsx_merged.py');
  try {
    execSync(`python "${mergedScript}"`, {
      env: { ...process.env, AMDC_PROJECT_DIR: projectDir, AMDC_RUN_DIR: cacheDir, WEEK_ANCHOR: weekAnchor },
      stdio: 'inherit',
    });
    console.log(`  ✅ ${path.join(projectDir, 'output', `AMDC-${mon}.xlsx`)}`);
  } catch {
    console.error('  ❌ 合并失败');
  }
}

async function cmdTagsUpdate() {
  const projectDir = resolveProjectDir();
  const tagsScript = path.join(SCRIPTS, 'amdc_tags_dict.js');
  console.log('🏷️  更新 Tag 字典...\n');

  try {
    execSync(`node "${tagsScript}"`, {
      env: { ...process.env, AMDC_PROJECT_DIR: projectDir },
      stdio: 'inherit',
    });
    console.log('✅ Tag 字典已更新');
  } catch {
    console.error('❌ Tag 字典更新失败');
    process.exit(1);
  }
}

async function cmdStart(projectDirArg) {
  const projectDir = resolveDashboardProjectDir(projectDirArg);
  assertDashboardProjectDir(projectDir);
  const cfg = loadConfig(projectDir);
  const authCheckConcurrency = cfg.authCheckConcurrency || cfg.maxAccounts || 20;
  const urls = getUrls();

  if (await dashboardRunning()) {
    console.log('📡 看板已在运行');
    for (const u of urls) console.log(`   ${u}`);
    return;
  }

  console.log('📡 启动看板...');
  console.log(`   项目目录: ${projectDir}`);
  const serverScript = path.join(SCRIPTS, 'progress-server.js');
  // 采集历史会把 Cache/YYYYMMDD 识别为旧版结果目录；看板日志不能写进这类目录，
  // 否则仅启动看板也会被误展示成一条“旧版数据”历史。
  const dashboardLogDir = path.join(projectDir, 'Cache', 'logs');
  fs.mkdirSync(dashboardLogDir, { recursive: true });
  const out = fs.openSync(path.join(dashboardLogDir, 'amdc-dashboard.log'), 'a');
  const child = spawn(process.execPath, [serverScript], {
    cwd: projectDir,
    env: {
      ...process.env,
      AMDC_PROJECT_DIR: projectDir,
      AMDC_NO_OPEN: '1',
      AMDC_PORT: DASHBOARD_PORT,
      AUTH_CHECK_CONCURRENCY: process.env.AUTH_CHECK_CONCURRENCY || String(authCheckConcurrency),
      AUTH_PROBE_TIMEOUT_MS: process.env.AUTH_PROBE_TIMEOUT_MS || cfg.authProbeTimeoutMs || '8000',
      AUTH_CHECK_COOLDOWN_HOURS: process.env.AUTH_CHECK_COOLDOWN_HOURS || cfg.authCheckCooldownHours || '6',
    },
    detached: true,
    stdio: ['ignore', out, out],
    windowsHide: true,
  });
  child.unref();
  try { fs.closeSync(out); } catch {}

  await sleep(10000);

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

async function cmdRestart(projectDirArg) {
  await cmdStop();
  await sleep(1000);
  await cmdStart(projectDirArg);
}

function getUrls() {
  const urls = [`http://127.0.0.1:${DASHBOARD_PORT}`];
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
  const scheduleDir = path.join(APP_ROOT, 'schedules');

  if (sub === 'init') {
    if (process.platform === 'win32') {
      const xmlPath = path.join(scheduleDir, 'weekly-run.xml');
      console.log('📅 Windows Task Scheduler 模板:');
      console.log(`   ${xmlPath}`);
      console.log('\n   手动导入:');
      console.log(`   schtasks /create /xml "${xmlPath}" /tn "AMDC Weekly"`);
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
      console.log('运行: schtasks /delete /tn "AMDC Weekly" /f');
    } else {
      console.log('运行: crontab -l | grep -v amdc-weekly | crontab -');
    }
  } else {
    throw new UsageError('amdc schedule requires: init or remove');
  }
}

async function cmdConfigShow() {
  const projectDir = resolveProjectDir();
  const cfg = loadConfig(projectDir);
  console.log('📋 当前配置合并 (env vars > config file > defaults):\n');
  console.log(JSON.stringify(redactSecrets({
    projectDir,
    accounts: cfg.accounts || '(自动发现)',
    topDepth: process.env.TOP_DEPTH || cfg.topDepth || 100,
    maxWorkers: process.env.AMDC_MAX_WORKERS || cfg.maxWorkers || cfg.maxAccounts || 20,
    dcGapMs: process.env.DC_GAP_MS || cfg.dcGapMs || 500,
    dcCooldownMs: process.env.DC_COOLDOWN_MS || cfg.dcCooldownMs || 120000,
    leaderboardWeekConcurrency: process.env.LEADERBOARD_WEEK_CONCURRENCY || cfg.leaderboardWeekConcurrency || 3,
    authCheckConcurrency: process.env.AUTH_CHECK_CONCURRENCY || cfg.authCheckConcurrency || cfg.maxAccounts || 20,
    authProbeTimeoutMs: process.env.AUTH_PROBE_TIMEOUT_MS || cfg.authProbeTimeoutMs || 8000,
    authCheckCooldownHours: process.env.AUTH_CHECK_COOLDOWN_HOURS || cfg.authCheckCooldownHours || 6,
    skipExcel: cfg.skipExcel || false,
    notifications: cfg.notifications || {},
    schedule: cfg.schedule || {},
  }), null, 2));
}

// ── 帮助 ──

async function cmdUpdate() {
  let projectDir = resolveProjectDir();

  // 如果当前目录没有 am.js，尝试通过 npm link 找到真正的项目目录
  if (!fs.existsSync(path.join(projectDir, 'am.js'))) {
    try {
      const amLink = fs.realpathSync('/proc/self/exe');
      // 从 npm global link 解析：~/.npm-global/lib/node_modules/amdc/am.js
      const npmGlobal = path.resolve(process.env.HOME || '~', '.npm-global/lib/node_modules/amdc');
      if (fs.existsSync(npmGlobal)) {
        projectDir = fs.realpathSync(npmGlobal);
        console.log('📍 自动定位 AMDC 项目:', projectDir, '\n');
      }
    } catch {}
    // Windows npm link fallback
    if (!fs.existsSync(path.join(projectDir, 'am.js'))) {
      try {
        const globalMod = execSync('npm root -g', { encoding: 'utf-8', timeout: 5000 }).trim();
        const candidate = path.join(globalMod, 'amdc');
        if (fs.existsSync(candidate)) {
          projectDir = fs.realpathSync(candidate);
          console.log('📍 自动定位 AMDC 项目:', projectDir, '\n');
        }
      } catch {}
    }
  }

  const repoRoot = resolveRepositoryRoot(projectDir);
  if (!repoRoot || !fs.existsSync(path.join(repoRoot, 'package.json'))) {
    console.error('❌ 无法找到 AMTools 总仓库（当前:', resolveProjectDir(), '）');
    console.error('   请进入 AMTools 总仓库后重试，或: git clone https://gitee.com/Hawkiethehawk/AI.git');
    process.exit(1);
  }

  console.log('🔄 从 AMTools 总仓库拉取最新版本...\n');

  // 0. 暂存本地修改，避免冲突
  let stashed = false;
  try {
    const status = execSync('git status --porcelain', { cwd: repoRoot, encoding: 'utf-8', timeout: 10000 });
    if (status.trim()) {
      console.log('📋 暂存本地修改...');
      // Include untracked files as well. Otherwise git reports success while
      // creating no stash when the worktree only contains new files.
      const stashOutput = execSync('git stash push -u -m "amdc update auto stash"', { cwd: repoRoot, encoding: 'utf-8', timeout: 10000 });
      stashed = !/No local changes to save/i.test(stashOutput);
    }
  } catch (e) { /* 非致命 */ }

  // 1. git pull
  let pullOutput = '';
  try {
    pullOutput = execSync('git pull --rebase', { cwd: repoRoot, encoding: 'utf-8', timeout: 30000 }).trim();
    console.log(pullOutput);
  } catch (e) {
    console.error('❌ git pull 失败:', (e.stderr || e.message).replace(/\n/g, '\n   '));
    if (stashed) {
      console.log('📋 恢复本地修改...');
      try { execSync('git stash pop', { cwd: repoRoot, encoding: 'utf-8', timeout: 10000 }); } catch {}
    }
    console.error('   请检查网络或手动: cd', projectDir, '&& git pull');
    process.exit(1);
  }

  // 2. 恢复本地修改（可能有冲突，不强制）
  if (stashed) {
    try {
      execSync('git stash pop', { cwd: repoRoot, encoding: 'utf-8', timeout: 10000 });
      console.log('📋 本地修改已恢复（如有冲突请手动处理）');
    } catch {
      console.log('⚠️  本地修改恢复失败（可能有冲突），请手动: git stash pop');
      console.log('\n⚠️  更新完成但未自动重启，请先处理冲突。项目目录:', projectDir);
      return;
    }
  }

  // 3. Install dependencies only when the pulled revision changed manifests.
  let changedFiles = '';
  try {
    changedFiles = execSync('git diff --name-only HEAD@{1} HEAD', {
      cwd: repoRoot,
      encoding: 'utf-8',
      timeout: 10000,
    });
  } catch {}
  if (/package\.json|package-lock\.json/.test(changedFiles)) {
    console.log('📦 package.json 有变更，安装依赖...');
    try {
      execSync('npm install', { cwd: repoRoot, stdio: 'inherit', timeout: 60000 });
      execSync('npm install', { cwd: projectDir, stdio: 'inherit', timeout: 60000 });
    } catch (e) {
      console.error('⚠️  npm install 失败，请手动执行');
    }
  }

  console.log('\n✅ 更新完成！项目目录:', projectDir);
  console.log('🔁 正在重启看板以应用最新版本...');
  await cmdRestart(projectDir);
}

function showHelp() {
  console.log(`
AMDC — 独立 CLI

用法: amdc <command> [options]

命令:
  setup             安装依赖 + 生成默认配置
  status            先检查登录状态，再显示所有 profile + 邮箱
  login [profile]   打开浏览器登录指定 profile（默认 .amdc-userdata）
  check             仅运行 auth check，输出每账号 OK/FAIL
  start             启动本机网页看板；采集、账号选择、Fresh/ListOnly/TopDepth/WeekAnchor 均在看板操作
  export            仅导出 Excel（需已有 JSON 数据）
  tags update       更新 tag 字典
  stop              关闭进度看板
  restart           重启进度看板
  schedule init     生成调度任务模板
  schedule remove   移除调度任务
  config show       显示当前合并后的配置
  update            从 gitee 拉取最新版本、安装依赖并重启看板

配置文件: <project-dir>/amdc-config.json
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
    case 'check': {
      const { code } = await cmdCheck();
      process.exit(code || 0);
      break;
    }
    case 'export':
      await cmdExport();
      break;
    case 'tags':
      if (args[1] === 'update' && args.length === 2) await cmdTagsUpdate();
      else throw new UsageError('amdc tags update');
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
      if (args.length > 2) throw new UsageError('amdc schedule init|remove');
      await cmdSchedule(args[1]);
      break;
    case 'config':
      if (args[1] === 'show' && (args.length === 2 || (args.length === 3 && args[2] === '--json'))) await cmdConfigShow();
      else throw new UsageError('amdc config show [--json]');
      break;
    case 'update':
      await cmdUpdate();
      break;
    default:
      console.error(`未知命令: ${cmd}`);
      console.error('运行 "amdc help" 查看可用命令');
      process.exit(1);
  }
}

main().catch(err => {
  if (err && err.code === 'USAGE') {
    console.error(`用法错误: ${err.message}`);
    process.exitCode = 2;
    return;
  }
  console.error('Fatal:', err.message);
  process.exit(1);
});
