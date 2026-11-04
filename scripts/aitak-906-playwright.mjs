#!/usr/bin/env node
// aiTak 网页适配：全部业务操作走页面控件，不提取或直接调用 Bearer API。
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const IMAGE_URL = 'https://edc.vigame.cn/aiTak/index.html#/image';
export const SPECS = { small: [970, 160, '21:9'], normal: [970, 265, '21:9'], large: [970, 625, '3:2'], floating: [975, 500, '2:1'] };
const MODELS = { flare: 'GPT Image 2.5 Flare', sunburst: 'GPT Image 2.5 Sunburst' };
const MODES = { text_to_image: '文生图', image_to_image: '图生图' };
const ROLES = ['official_logo', ...Array.from({ length: 5 }, (_, i) => `store_screenshot_${i + 1}`)];
const IMAGE_NAMES = ['01-logo.png', ...Array.from({ length: 5 }, (_, i) => `0${i + 2}-store-${i + 1}.png`)];
const sha = value => createHash('sha256').update(value).digest('hex');
const json = async p => JSON.parse((await fs.readFile(p, 'utf8')).replace(/^\uFEFF/, ''));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const stable = value => JSON.stringify(value, function (_key, v) {
  return v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) : v;
});
function metadataContent(metadata) {
  const value = structuredClone(metadata);
  if (value) {
    delete value.fetchedAt;
    if (value.provenance) for (const key of ['fetchedAt', 'cacheHit', 'cacheTtlSeconds']) delete value.provenance[key];
  }
  return stable(value);
}
export class SafeError extends Error { constructor(message, code = 'STOPPED') { super(message); this.code = code; } }
function need(condition, message, code) { if (!condition) throw new SafeError(message, code); }
async function atomicJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  await fs.rename(temp, file);
}
async function until(predicate, timeout = 30000, message = '等待页面状态超时') {
  const end = Date.now() + timeout;
  while (Date.now() < end) { if (await predicate()) return; await sleep(250); }
  throw new SafeError(message, 'TIMEOUT');
}
export function selectPlan(bundle, style) {
  const plans = Array.isArray(bundle.plans) ? bundle.plans : [bundle];
  const matches = plans.filter(p => !style || p.style === style);
  need(matches.length === 1, '存在多个样式或找不到样式，请用 --style 指定一个样式。');
  const plan = matches[0];
  need(['legacy_full_bleed', 'dual_focus', 'scene_fusion'].includes(plan.style), '不支持的 906 样式。');
  need(plan.version === 1 && plan.provider === 'aitak' && plan.workflow === 'native_complete_image', '不是有效的 PushLab 原生成品计划。');
  need(MODELS[plan.modelFlavor] && MODES[plan.mode] && plan.imageSize === '1K', '计划的模型、模式或分辨率不受支持。');
  need(plan.sourceCount === 4 && plan.sources?.length === 4 && new Set(plan.sources.map(s => s.key)).size === 4, '每个样式必须有四张独立源图。');
  for (const [key, [width, height, ratio]] of Object.entries(SPECS)) {
    const s = plan.sources.find(s => s.key === key);
    need(s && s.target?.width === width && s.target?.height === height && s.aspectRatio === ratio && s.imageSize === '1K' && s.n === 1 && typeof s.prompt === 'string' && s.prompt.trim(), `源图 ${key} 的尺寸、比例、提示词或张数不符合 906 契约。`);
  }
  if (plan.mode === 'image_to_image') {
    need(plan.brandPack?.count === 6 && stable(plan.brandPack.imageRoles) === stable(ROLES) && plan.brandPack.imageUrls?.length === 6 && plan.brandPack.metadata?.provenance?.descriptionScope === 'full', '图生图需要完整元数据、官方 Logo 与五张不同的商店图。');
  } else need(!plan.brandPack, '文生图不能携带品牌参考包。');
  return plan;
}
export async function referenceFiles(plan, directory) {
  if (plan.mode === 'text_to_image') { need(!directory, '文生图不使用参考包。'); return []; }
  need(directory, '图生图必须指定 --references，指向 PushLab 的完整 reference-pack.json 所在目录。');
  const base = path.resolve(directory);
  const pack = await json(path.join(base, 'reference-pack.json'));
  need(pack.version === 1 && pack.count === 6 && pack.images?.length === 6 && metadataContent(pack.metadata) === metadataContent(plan.brandPack.metadata), '参考包完整元数据与计划不一致。');
  const hashes = new Set(); const files = [];
  for (let i = 0; i < 6; i++) {
    const rec = pack.images[i];
    need(rec.file === IMAGE_NAMES[i] && rec.role === ROLES[i] && rec.source === plan.brandPack.imageUrls[i], '参考图的顺序、角色或官方来源与计划不一致。');
    const file = path.join(base, IMAGE_NAMES[i]);
    const raw = await fs.readFile(file);
    const digest = sha(raw);
    need(raw.length > 24 && raw.length <= 20 * 1024 * 1024 && raw.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && digest === rec.sha256 && !hashes.has(digest), '参考图格式、大小、哈希或去重检查失败。');
    need(raw.readUInt32BE(16) === rec.size?.[0] && raw.readUInt32BE(20) === rec.size?.[1], '参考图尺寸与清单不一致。');
    hashes.add(digest); files.push(file);
  }
  return files;
}
export async function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const override = process.env.AITAK_PLAYWRIGHT_MODULE || process.env.PUSHLAB_PLAYWRIGHT_MODULE;
  if (override) return require(override);
  for (const name of ['playwright', 'playwright-core', '@playwright/test']) { try { return require(name); } catch {} }
  const cache = process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'npm-cache', '_npx');
  if (cache && existsSync(cache)) {
    const candidates = [];
    for (const item of await fs.readdir(cache)) {
      const module = path.join(cache, item, 'node_modules', 'playwright-core');
      if (existsSync(path.join(module, 'package.json'))) candidates.push({ module, time: (await fs.stat(module)).mtimeMs });
    }
    for (const item of candidates.sort((a, b) => b.time - a.time)) { try { return require(item.module); } catch {} }
  }
  throw new SafeError('未找到现有 Playwright；请设置 AITAK_PLAYWRIGHT_MODULE，不会自动安装依赖。');
}
function browserExecutable(pw) {
  if (process.env.AITAK_BROWSER_EXECUTABLE) { need(existsSync(process.env.AITAK_BROWSER_EXECUTABLE), '指定浏览器文件不存在。'); return process.env.AITAK_BROWSER_EXECUTABLE; }
  const candidates = [
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Microsoft/Edge/Application/msedge.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Microsoft/Edge/Application/msedge.exe'),
    pw.chromium.executablePath(),
  ];
  const executable = candidates.find(p => p && existsSync(p));
  need(executable, '未找到可复用的浏览器；不会下载浏览器。'); return executable;
}
function assertStateIgnored(stateFile) {
  const result = spawnSync('git', ['check-ignore', '--quiet', '--', path.relative(ROOT, stateFile)], { cwd: ROOT, windowsHide: true });
  need(result.status === 0, '认证状态目录必须被当前仓库 Git 忽略，停止保存登录态。');
}
function atAiTak(page) { const u = new URL(page.url()); return u.origin === 'https://edc.vigame.cn' && u.pathname.startsWith('/aiTak/'); }
export async function openImagePage(page) {
  if (atAiTak(page) && await page.getByRole('button', { name: '选择模型', exact: true }).isVisible()) return;
  if (atAiTak(page) && await page.getByRole('button', { name: '图像创作', exact: true }).isVisible()) {
    await page.getByRole('button', { name: '图像创作', exact: true }).click();
    await page.getByRole('button', { name: /ChatGPT生图/ }).click();
    await page.getByRole('button', { name: '选择模型', exact: true }).waitFor(); return;
  }
  await page.goto(IMAGE_URL, { waitUntil: 'domcontentloaded' });
  await until(async () => {
    if (/accounts\.(feishu\.cn|larksuite\.com)/.test(new URL(page.url()).hostname)) throw new SafeError('登录态缺失或已过期，请先运行 login --headed 并手动登录。', 'AUTH_REQUIRED');
    if (!atAiTak(page)) return false;
    if (await page.getByRole('button', { name: '选择模型', exact: true }).isVisible()) return true;
    const entry = page.getByRole('button', { name: '图像创作', exact: true });
    if (await entry.isVisible()) {
      await entry.click(); await page.getByRole('button', { name: /ChatGPT生图/ }).click();
    }
    return false;
  });
}
async function waitForManualLogin(page, timeout) {
  let prompted = '';
  await until(async () => {
    const url = new URL(page.url());
    if (atAiTak(page) && (await page.getByRole('button', { name: '图像创作', exact: true }).isVisible() || await page.getByRole('button', { name: '选择模型', exact: true }).isVisible())) return true;
    if (url.hostname === 'accounts.feishu.cn') {
      const auth = await page.getByRole('button', { name: '授权', exact: true }).isVisible().catch(() => false);
      const login = await page.getByText('扫码登录', { exact: true }).isVisible().catch(() => false);
      const next = auth ? '请在飞书授权页手动点击“授权”；' : login ? '请在飞书页面手动完成扫码登录；' : '请在飞书页面完成登录或授权；';
      if (next !== prompted) { console.log(next + '不会读取或显示密码、验证码、Cookie 或 Token。'); prompted = next; }
      return false;
    }
    return false;
  }, timeout, '等待飞书登录/授权完成超时。');
}
async function pick(page, name, value) {
  const button = page.getByRole('button', { name, exact: true });
  await button.click();
  await page.getByRole('listbox', { name, exact: true }).getByRole('option', { name: value, exact: true }).click();
  await until(async () => (await button.innerText()).trim() === value, 10000, `${name}回读不一致。`);
}
export async function formSnapshot(page) {
  const read = async name => (await page.getByRole('button', { name, exact: true }).innerText()).replace(/\s+/g, ' ').trim();
  const upload = page.getByRole('button', { name: '上传参考图', exact: true });
  return {
    model: await read('选择模型'), mode: await read('选择模式'), settings: await read('图像设置'), count: await read('选择张数'),
    referenceCount: await upload.isVisible() ? Number((await upload.innerText()).match(/(\d+)\s*\/\s*\d+/)?.[1] || 0) : 0,
    referenceCards: await page.locator('.reference-stack-card').count(),
    uploadsBusy: await page.locator('.reference-stack-card.is-uploading').count(),
    uploadsFailed: await page.locator('.reference-stack-card.is-error').count(),
    promptCharacters: (await page.getByRole('textbox').innerText()).length,
    generateEnabled: await page.getByRole('button', { name: '生成图片', exact: true }).isEnabled(),
  };
}
export async function preparePage(page, plan, source, files) {
  need(atAiTak(page), '当前页面不是 aiTak 图像工作台。');
  const old = page.getByRole('button', { name: /^参考图，共\d+张，点击管理顺序$/ });
  if (await old.isVisible()) {
    await old.click();
    const panel = page.locator('.reference-sort-panel:visible');
    await panel.getByRole('button', { name: '清空全部', exact: true }).click();
    if (await panel.isVisible()) await panel.getByRole('button', { name: '关闭', exact: true }).click();
  }
  await pick(page, '选择模型', MODELS[plan.modelFlavor]);
  await pick(page, '选择模式', MODES[plan.mode]);
  await page.getByRole('button', { name: '图像设置', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '图像设置', exact: true });
  await dialog.getByRole('button', { name: '1K', exact: true }).click();
  await dialog.getByRole('listbox', { name: '宽高比', exact: true }).getByRole('option', { name: source.aspectRatio, exact: true }).click();
  need(await dialog.getByRole('button', { name: '1K', exact: true }).getAttribute('aria-pressed') === 'true', '分辨率未选中 1K。');
  need(await dialog.getByRole('option', { name: source.aspectRatio, exact: true }).getAttribute('aria-selected') === 'true', '比例未正确选中。');
  await dialog.getByRole('button', { name: '完成', exact: true }).click();
  await pick(page, '选择张数', '1张');
  if (files.length) {
    need(files.length === 6, '不能使用不完整参考包。');
    await page.locator('input[type="file"][accept="image/*"]').setInputFiles(files);
    await until(async () => {
      const s = await formSnapshot(page);
      need(!s.uploadsFailed, '参考图上传失败；未点击生成。');
      return s.referenceCount === 6 && s.referenceCards === 6 && s.uploadsBusy === 0;
    }, 120000, '六图上传未完成；未点击生成。');
  }
  const editor = page.getByRole('textbox');
  await editor.fill(source.prompt);
  // 不按 Enter：该网页的 Enter 快捷键会立即提交生成。
  const promptReadback = (await editor.innerText()).replace(/\r\n/g, '\n');
  need(promptReadback === source.prompt.replace(/\r\n/g, '\n'), '提示词回读不一致；未点击生成。');
  const s = await formSnapshot(page);
  need(s.model === MODELS[plan.modelFlavor] && s.mode === MODES[plan.mode] && s.settings.includes(source.aspectRatio) && s.settings.includes('1K') && s.count === '1张' && s.referenceCount === files.length && s.uploadsBusy === 0 && s.uploadsFailed === 0 && s.generateEnabled, '生成前表单回读失败。');
  return { ...s, key: source.key, target: source.target, promptSha256: sha(source.prompt), submitted: false };
}
export async function reserveSubmission(receiptPath, identity) {
  await fs.mkdir(path.dirname(receiptPath), { recursive: true });
  let handle;
  try { handle = await fs.open(receiptPath, 'wx', 0o600); }
  catch (e) { if (e.code === 'EEXIST') throw new SafeError('此源图已有提交记录，禁止再次点击。请使用 collect 核对原任务。', 'DUPLICATE'); throw e; }
  try {
    await handle.writeFile(JSON.stringify({ ...identity, status: 'uncertain', taskId: null, recordedBeforeClick: true, createdAt: new Date().toISOString() }, null, 2) + '\n');
    await handle.sync();
  } finally { await handle.close(); }
}
const taskCards = page => page.locator('.msg-row.assistant[data-task-id]');
export async function submitOnce(page, receiptPath, identity) {
  const existing = new Set(await taskCards(page).evaluateAll(es => es.map(e => e.getAttribute('data-task-id')).filter(Boolean)));
  await reserveSubmission(receiptPath, identity);
  // 从这里开始，任何异常都保持 uncertain；永不自动重试点击。
  await page.getByRole('button', { name: '生成图片', exact: true }).click();
  let taskId;
  await until(async () => {
    const ids = await taskCards(page).evaluateAll(es => es.map(e => e.getAttribute('data-task-id')).filter(Boolean));
    const fresh = [...new Set(ids.filter(id => !existing.has(id)))];
    need(fresh.length <= 1, '出现多个新任务，保留 uncertain，需人工核对。');
    if (!fresh.length) return false;
    taskId = fresh[0]; need(/^[A-Za-z0-9_-]{1,160}$/.test(taskId), '网页任务号格式不可识别。'); return true;
  }, 60000, '点击后未取得唯一任务号；保留 uncertain，不得再次提交。');
  await atomicJson(receiptPath, { ...await json(receiptPath), status: 'submitted', taskId });
  return taskId;
}
export async function collectTask(page, receiptPath, outputDir, maxWait) {
  const receipt = await json(receiptPath);
  need(receipt.taskId && /^[A-Za-z0-9_-]{1,160}$/.test(receipt.taskId), '尚无可核对的任务号；请在网页历史记录中人工核对，禁止重新提交。');
  if (receipt.status === 'downloaded') {
    const raw = await fs.readFile(receipt.sourceFile);
    need(sha(raw) === receipt.sourceSha256, '已下载源图哈希不一致。'); return receipt;
  }
  const card = page.locator(`.msg-row.assistant[data-task-id="${receipt.taskId}"]`);
  const end = Date.now() + maxWait * 1000;
  while (Date.now() < end) {
    need(atAiTak(page), '登录态已过期；保留原任务，重新登录后只查询。', 'AUTH_REQUIRED');
    if (await card.count()) {
      const statusRow = card.locator('.msg-meta-row').filter({ has: page.locator('.msg-meta-label', { hasText: /^状态[：:]$/ }) });
      const status = await statusRow.count() ? await statusRow.locator('.msg-meta-value').innerText() : '';
      if (/失败|已取消|超时|failed|error|cancelled|canceled|timeout/i.test(status)) {
        await atomicJson(receiptPath, { ...receipt, status: 'failed', pageStatus: status.slice(0,80) });
        throw new SafeError('原任务显示失败/取消/超时；不自动重提。', 'TASK_FAILED');
      }
      // “下载”也可能在占位图时出现；只有真实结果才有“再次编辑”。
      if (await card.getByRole('button', { name: '再次编辑', exact: true }).isVisible()) {
        await fs.mkdir(outputDir, { recursive: true });
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 60000 }),
          card.getByRole('button', { name: '下载', exact: true }).click(),
        ]);
        const ext = path.extname(download.suggestedFilename()).toLowerCase();
        need(['.png', '.jpg', '.jpeg', '.webp'].includes(ext), '下载结果不是支持的图片格式。');
        const sourceFile = path.resolve(outputDir, `${receipt.key}-${receipt.taskId}${ext}`);
        await download.saveAs(sourceFile);
        need(!await download.failure(), '下载未完成；保留原任务，可再次 collect。');
        const raw = await fs.readFile(sourceFile);
        need(raw.length > 0 && raw.length <= 10 * 1024 * 1024, '源图为空或超过 PushLab 导入的 10MiB 上限。');
        const saved = { ...receipt, status: 'downloaded', sourceFile, sourceSha256: sha(raw), needsVisualReview: true, finishedAt: new Date().toISOString() };
        await atomicJson(receiptPath, saved); return saved;
      }
    }
    await sleep(1500); // 网页自身轮询原任务，不重新点击生成或调用私有 API。
  }
  throw new SafeError('原任务尚未完成或不在当前历史视图；可再次 collect，禁止重新提交。', 'PENDING');
}
export function runDirectory(plan) { return path.join(ROOT, 'artifacts', 'aitak-906-browser', `${plan.style}-${sha(stable(plan)).slice(0, 20)}`); }
export async function cropOutputs(plan, outputDir, pushlabRoot, python) {
  const records = await Promise.all(Object.keys(SPECS).map(key => json(path.join(outputDir, `${key}.submission.json`))));
  for (const r of records) {
    need(r.status === 'downloaded' && r.planSha256 === sha(stable(plan)), '四张源图未完整下载或不属于同一计划。');
    need(sha(await fs.readFile(r.sourceFile)) === r.sourceSha256, '源图哈希检查失败。');
  }
  const planFile = path.join(outputDir, 'plan.json');
  await atomicJson(planFile, plan);
  const args = ['-B', '-m', 'aitak906', 'crop', '--plan', planFile, '--output', path.join(outputDir, 'cropped')];
  for (const record of records) args.push(`--${record.key}`, record.sourceFile);
  const proc = spawnSync(python, args, { cwd: pushlabRoot, encoding: 'utf8', windowsHide: true, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  need(proc.status === 0, 'PushLab 原有裁切器未通过；请检查 Python 环境与源图格式/比例，不会替换正式素材。');
  return { output: path.join(outputDir, 'cropped'), needsVisualReview: true, importedToStudio: false };
}
function sessionPaths(session) {
  need(/^[a-zA-Z0-9_-]{1,48}$/.test(session), '无效会话名。');
  const base = path.join(ROOT, '.playwright-auth');
  return { runtime: path.join(base, `${session}.control.json`), serverLock: path.join(base, `${session}.server.lock`), queue: path.join(base, `${session}.commands`) };
}
function processAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}
// 保留浏览器自身的 sessionStorage；命令队列只包含本地路径/操作参数，不保存网站凭据。
export async function startSession(page, session = 'aitak-906') {
  need(atAiTak(page), '必须先在 aiTak 页面完成登录。');
  const p = sessionPaths(session); assertStateIgnored(p.runtime);
  await fs.mkdir(p.queue, { recursive: true });
  if (existsSync(p.runtime)) {
    const previous = await json(p.runtime);
    need(!processAlive(previous.pid), '这个命名浏览器会话已在运行。', 'BUSY');
  }
  const lock = await fs.open(p.serverLock, 'wx', 0o600).catch(() => { throw new SafeError('会话锁已存在，请先核对旧进程。', 'BUSY'); });
  const epoch = randomUUID();
  await atomicJson(p.runtime, { pid: process.pid, session, epoch, readyAt: new Date().toISOString() });
  let active = false; let stopped = false; let resolveDone;
  const done = new Promise(resolve => { resolveDone = resolve; });
  const safeError = error => ({ ok: false, code: error instanceof SafeError ? error.code : 'AUTOMATION_ERROR', message: error instanceof SafeError ? error.message : '页面或本地文件操作失败；不自动重试生成。' });
  const stop = async () => {
    if (stopped) return; stopped = true; clearInterval(timer);
    await fs.unlink(p.runtime).catch(() => {}); await lock.close(); await fs.unlink(p.serverLock).catch(() => {}); resolveDone();
  };
  const tick = async () => {
    if (active || stopped) return; active = true;
    try {
      const names = (await fs.readdir(p.queue)).filter(n => /^[a-f0-9-]{36}\.request\.json$/.test(n)).sort();
      for (const name of names) {
        const requestFile = path.join(p.queue, name); const responseFile = requestFile.replace('.request.json', '.response.json');
        let response;
        try {
          const request = await json(requestFile);
          need(request.epoch === epoch && Array.isArray(request.argv) && request.argv.every(s => typeof s === 'string'), '命令来自旧会话或格式错误。');
          need(['inspect', 'prepare', 'run', 'collect'].includes(request.argv[0]), '此会话只接收网页检查、准备、生成和回收命令。');
          response = { ok: true, result: await main(request.argv, { page, session }) };
        } catch (error) { response = safeError(error); }
        await atomicJson(responseFile, response); await fs.unlink(requestFile);
      }
    } catch {} finally { active = false; }
  };
  const timer = setInterval(() => { void tick(); }, 200);
  page.context().browser().once('disconnected', () => { void stop(); });
  return { session, done, stop };
}
async function invokeSession(session, argv, maxWait) {
  const p = sessionPaths(session);
  need(existsSync(p.runtime), '没有运行中的命名浏览器。请运行 login --headed，并保持该进程与窗口开启。', 'AUTH_REQUIRED');
  const runtime = await json(p.runtime);
  need(processAlive(runtime.pid), '原浏览器进程已结束，请重新 login --headed。', 'AUTH_REQUIRED');
  const id = randomUUID(); const request = path.join(p.queue, `${id}.request.json`); const response = path.join(p.queue, `${id}.response.json`);
  await atomicJson(request, { argv, epoch: runtime.epoch });
  await until(() => fs.access(response).then(() => true, () => false), (maxWait + 240) * 1000, '命名会话尚未返回；请先核对任务记录，不要重复提交。');
  const result = await json(response); await fs.unlink(response);
  if (!result.ok) throw new SafeError(result.message, result.code);
  return result.result;
}
export async function main(argv = process.argv.slice(2), attached = null) {
  const { values: v, positionals } = parseArgs({ args: argv, allowPositionals: true, options: {
    session: { type: 'string', default: 'aitak-906' }, plan: { type: 'string' }, style: { type: 'string' }, key: { type: 'string', default: 'small' }, references: { type: 'string' },
    headed: { type: 'boolean', default: false }, submit: { type: 'boolean', default: false },
    'max-wait': { type: 'string', default: '600' }, pushlab: { type: 'string' }, python: { type: 'string', default: 'python' }, help: { type: 'boolean' },
  } });
  const command = positionals[0] || 'inspect';
  if (v.help) return { usage: 'node scripts/aitak-906-playwright.mjs login --headed | inspect | prepare --plan FILE --style STYLE --key small --references DIR | run ... --submit | collect ... | crop --plan FILE --style STYLE --pushlab DIR', defaults: 'login 后保持同一浏览器运行；其他命令复用会话；prepare 不点击生成；run 必须带 --submit；每次一个尺寸；不自动安装依赖。' };
  need(positionals.length <= 1 && ['login', 'inspect', 'prepare', 'run', 'collect', 'crop'].includes(command), '未知命令或多余参数。');
  need(/^[a-zA-Z0-9_-]{1,48}$/.test(v.session), 'session 名只允许英文字母、数字、连字符和下划线。');
  need(!v.submit || command === 'run', '--submit 只能用于 run。');
  if (command === 'run') need(v.submit, 'run 需要显式 --submit；不提交请用 prepare。');
  const maxWait = Number(v['max-wait']);
  need(Number.isInteger(maxWait) && maxWait >= 1 && maxWait <= 3600, 'max-wait 必须为 1–3600 秒。');
  let plan, source, files = [], out, receiptPath;
  if (['prepare', 'run', 'collect', 'crop'].includes(command)) {
    need(v.plan, '缺少 --plan。'); plan = selectPlan(await json(path.resolve(v.plan)), v.style);
    source = plan.sources.find(s => s.key === v.key); need(source, 'key 必须为 small、normal、large 或 floating。');
    out = runDirectory(plan); receiptPath = path.join(out, `${v.key}.submission.json`);
    if (['prepare', 'run'].includes(command)) files = await referenceFiles(plan, v.references);
    if (command === 'run') need(!existsSync(receiptPath), '已有提交记录，请使用 collect；不会再次提交。', 'DUPLICATE');
    if (command === 'collect') need(existsSync(receiptPath), '没有提交记录可供恢复。');
    if (command === 'crop') { need(v.pushlab, 'crop 需要 --pushlab 指定原 PushLab 项目目录。'); return cropOutputs(plan, out, path.resolve(v.pushlab), v.python); }
  }
  if (attached) {
    need(attached.session === v.session && command !== 'login', '会话名不匹配或命令不适用。');
    const page = attached.page;
    await openImagePage(page);
    if (command === 'inspect') return { ...await formSnapshot(page), loggedIn: true, submitted: false, session: v.session };
    if (command === 'collect') return collectTask(page, receiptPath, out, maxWait);
    const prepared = await preparePage(page, plan, source, files);
    await atomicJson(path.join(out, `${v.key}.prepared.json`), { ...prepared, verifiedAt: new Date().toISOString() });
    await atomicJson(path.join(out, 'plan.json'), plan);
    if (command === 'prepare') return { ...prepared, outputDirectory: out, session: v.session };
    await submitOnce(page, receiptPath, { style: plan.style, key: source.key, planSha256: sha(stable(plan)), promptSha256: sha(source.prompt), session: v.session });
    return collectTask(page, receiptPath, out, maxWait);
  }
  if (command !== 'login') return invokeSession(v.session, argv, maxWait);
  if (command === 'login') need(v.headed, '登录需要 login --headed，供本人在浏览器中安全完成认证。');
  const stateFile = path.join(ROOT, '.playwright-auth', `${v.session}-state.json`);
  assertStateIgnored(stateFile); await fs.mkdir(path.dirname(stateFile), { recursive: true });
  const lockPath = path.join(ROOT, '.playwright-auth', `${v.session}.lock`);
  let lock;
  try { lock = await fs.open(lockPath, 'wx', 0o600); }
  catch { throw new SafeError('会话已占用；如进程崩溃，请先确认旧进程结束再处理锁文件。', 'BUSY'); }
  let browser;
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, session: v.session }));
    const pw = await loadPlaywright();
    browser = await pw.chromium.launch({ executablePath: browserExecutable(pw), headless: !v.headed });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, ...(existsSync(stateFile) ? { storageState: stateFile } : {}) });
    context.setDefaultTimeout(15000);
    const page = await context.newPage();
    const onInterrupt = () => { void browser.close(); };
    process.once('SIGINT', onInterrupt); process.once('SIGTERM', onInterrupt);
    try {
      await page.goto(IMAGE_URL, { waitUntil: 'domcontentloaded' });
      await waitForManualLogin(page, maxWait * 1000);
      await context.storageState({ path: stateFile, indexedDB: true });
      const worker = await startSession(page, v.session);
      console.log(JSON.stringify({ loggedIn: true, session: v.session, submitted: false }, null, 2));
      console.log('命名浏览器已就绪。请保持此进程与窗口开启；在另一个终端运行 prepare/run/collect。关闭窗口结束会话。');
      await worker.done;
      return { session: v.session, closed: true };
    } finally { process.off('SIGINT', onInterrupt); process.off('SIGTERM', onInterrupt); }
  } finally {
    if (browser?.isConnected()) await browser.close();
    await lock.close(); await fs.unlink(lockPath);
  }
}
if (typeof process !== 'undefined' && process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().then(result => console.log(JSON.stringify(result, null, 2))).catch(error => {
    // Playwright/HTTP 异常可能含授权跳转 URL；不输出原始消息或堆栈。
    console.error(JSON.stringify({ ok: false, code: error instanceof SafeError ? error.code : 'AUTOMATION_ERROR', message: error instanceof SafeError ? error.message : '网页自动化或本地文件操作失败；已有提交记录保持有效，请先核对原任务。' }));
    process.exitCode = 1;
  });
}
