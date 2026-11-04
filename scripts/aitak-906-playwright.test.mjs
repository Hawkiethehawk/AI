import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { ROOT, IMAGE_URL, SPECS, selectPlan, referenceFiles, loadPlaywright, preparePage, reserveSubmission, submitOnce, collectTask, startSession, main, cropOutputs } from './aitak-906-playwright.mjs';

const digest = x => createHash('sha256').update(x).digest('hex');
const tmp = await fs.mkdtemp(path.join(await fs.mkdir(path.join(ROOT, 'artifacts', 'aitak-906-test'), { recursive: true }).then(() => path.join(ROOT, 'artifacts', 'aitak-906-test')), 'run-'));
const plan = { version: 1, provider: 'aitak', workflow: 'native_complete_image', style: 'dual_focus', modelFlavor: 'flare', mode: 'text_to_image', imageSize: '1K', sourceCount: 4, brandPack: null, sources: Object.entries(SPECS).map(([key, [width, height, ratio]]) => ({ key, target: { width, height }, aspectRatio: ratio, imageSize: '1K', n: 1, prompt: `测试 ${key}\n第二行：完整保留，不提交真实生成。` })) };

test('906 契约保留四张独立源图并拒绝错误比例/重复尺寸/歧义样式', () => {
  assert.equal(selectPlan(plan).sources.length, 4);
  const bad = structuredClone(plan); bad.sources[1].aspectRatio = '3:2';
  assert.throws(() => selectPlan(bad), /906 契约/);
  const duplicate = structuredClone(plan); duplicate.sources[1].key = 'small';
  assert.throws(() => selectPlan(duplicate), /四张独立/);
  assert.throws(() => selectPlan({ plans: [plan, { ...plan, style: 'scene_fusion' }] }), /多个样式/);
  assert.equal(selectPlan({ plans: [plan, { ...plan, style: 'scene_fusion' }] }, 'dual_focus').style, 'dual_focus');
});

test('提交前原子记录：并发请求只允许一个胜出，unknown 也拒绝重提', async () => {
  const receipt = path.join(tmp, 'dedupe.json');
  const results = await Promise.allSettled([reserveSubmission(receipt, { key: 'small' }), reserveSubmission(receipt, { key: 'small' })]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.code, 'DUPLICATE');
  assert.equal(JSON.parse(await fs.readFile(receipt, 'utf8')).status, 'uncertain');
});

test('六图包核验：接受仅抓取时间变化，拒绝缺图、内容篡改和错配来源', async () => {
  const dir = path.join(tmp, 'refs'); await fs.mkdir(dir);
  const metadata = { title: 'Fixture', description: 'Full fixture description', fetchedAt: 'old', provenance: { source: 'Google Play', descriptionScope: 'full', fetchedAt: 'old', cacheHit: false } };
  const roles = ['official_logo', ...Array.from({ length: 5 }, (_, i) => `store_screenshot_${i + 1}`)];
  const files = ['01-logo.png', ...Array.from({ length: 5 }, (_, i) => `0${i + 2}-store-${i + 1}.png`)];
  // 测试 PNG 的尾部标记不同，验证顺序/哈希；这里只测试文件完整性。
  const images = [];
  for (let i = 0; i < 6; i++) {
    const raw = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jM1UAAAAASUVORK5CYII=', 'base64');
    const tagged = Buffer.concat([raw, Buffer.from([i])]);
    await fs.writeFile(path.join(dir, files[i]), tagged);
    images.push({ file: files[i], role: roles[i], source: `https://play-lh.googleusercontent.com/fixture-${i}`, size: [1, 1], sha256: digest(tagged) });
  }
  const pack = { version: 1, count: 6, metadata, images };
  await fs.writeFile(path.join(dir, 'reference-pack.json'), JSON.stringify(pack));
  const p = { ...plan, mode: 'image_to_image', brandPack: { count: 6, imageRoles: roles, imageUrls: images.map(i => i.source), metadata: { ...metadata, fetchedAt: 'new', provenance: { ...metadata.provenance, fetchedAt: 'new', cacheHit: true } } } };
  assert.equal((await referenceFiles(p, dir)).length, 6);
  p.brandPack.metadata.description = 'Different application';
  await assert.rejects(referenceFiles(p, dir), /元数据/);
  p.brandPack.metadata.description = metadata.description;
  pack.images[0].source = 'https://play-lh.googleusercontent.com/wrong';
  await fs.writeFile(path.join(dir, 'reference-pack.json'), JSON.stringify(pack));
  await assert.rejects(referenceFiles(p, dir), /来源/);
  pack.images[0].source = p.brandPack.imageUrls[0];
  await fs.writeFile(path.join(dir, 'reference-pack.json'), JSON.stringify(pack));
  await fs.writeFile(path.join(dir, files[0]), Buffer.from('broken'));
  await assert.rejects(referenceFiles(p, dir), /哈希/);
  await fs.unlink(path.join(dir, files[0]));
  await assert.rejects(referenceFiles(p, dir));
});

const html = `<!doctype html><meta charset="utf-8"><main>
<button aria-label="选择模型" onclick="document.querySelector('#models').hidden=false">GPT Image 2</button>
<div id="models" role="listbox" aria-label="选择模型" hidden>${['GPT Image 2.5 Flare', 'GPT Image 2.5 Sunburst'].map(x => `<div role="option" onclick="pick('选择模型',this)">${x}</div>`).join('')}</div>
<button aria-label="选择模式" onclick="document.querySelector('#modes').hidden=false">文生图</button>
<div id="modes" role="listbox" aria-label="选择模式" hidden><div role="option" onclick="pick('选择模式',this)">文生图</div><div role="option" onclick="pick('选择模式',this)">图生图</div></div>
<button aria-label="图像设置" onclick="document.querySelector('#settings').hidden=false">自动 1K</button>
<div id="settings" role="dialog" aria-label="图像设置" hidden>
<button aria-pressed="true" onclick="this.setAttribute('aria-pressed','true')">1K</button>
<div role="listbox" aria-label="宽高比">${['21:9', '3:2', '2:1'].map(x => `<div role="option" aria-selected="false" onclick="ratio(this)">${x}</div>`).join('')}</div>
<button onclick="document.querySelector('#settings').hidden=true">完成</button></div>
<button aria-label="选择张数" onclick="document.querySelector('#counts').hidden=false">2张</button>
<div id="counts" role="listbox" aria-label="选择张数" hidden><div role="option" onclick="pick('选择张数',this)">1张</div></div>
<div id="referenceGroup" hidden><button aria-label="上传参考图">参考图 0/10</button><input type="file" accept="image/*" multiple onchange="upload(this)"><div id="cards"></div></div>
<div role="textbox" contenteditable="true"></div><button aria-label="生成图片" onclick="generate()">生成图片</button>
<script>
window.submissions=0;
function pick(label,el){document.querySelector('button[aria-label="'+label+'"]').textContent=el.textContent;el.parentElement.hidden=true;if(label==='选择模式')document.querySelector('#referenceGroup').hidden=el.textContent==='文生图'}
function ratio(el){el.parentElement.querySelectorAll('[role=option]').forEach(x=>x.setAttribute('aria-selected','false'));el.setAttribute('aria-selected','true');document.querySelector('button[aria-label="图像设置"]').textContent=el.textContent+' 1K'}
function upload(el){document.querySelector('button[aria-label="上传参考图"]').textContent='参考图 '+el.files.length+'/10';document.querySelector('#cards').innerHTML=Array.from(el.files,()=>'<span class="reference-stack-card"></span>').join('')}
function generate(){window.submissions++;document.querySelector('main').insertAdjacentHTML('beforeend','<div class="msg-row assistant" data-task-id="fixture-task"><div class="msg-meta-row"><span class="msg-meta-label">状态：</span><span class="msg-meta-value">成功-succeeded</span></div><button>再次编辑</button><button onclick="download()">下载</button></div>')}
function download(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([new Uint8Array([137,80,78,71,13,10,26,10])],{type:'image/png'}));a.download='fixture.png';a.click()}
</script></main>`;

test('真实 Playwright 离线浏览器：四尺寸/双模式填写、只点一次生成和下载回收', async () => {
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch({ executablePath: process.env.AITAK_BROWSER_EXECUTABLE || path.join(process.env['ProgramFiles(x86)'], 'Microsoft/Edge/Application/msedge.exe'), headless: true });
  let fulfilled = 0; let blocked = 0;
  try {
    const context = await browser.newContext({ acceptDownloads: true });
    await context.route('**/*', route => {
      if (route.request().isNavigationRequest() && route.request().url().startsWith('https://edc.vigame.cn/aiTak/index.html')) { fulfilled++; return route.fulfill({ body: html, contentType: 'text/html' }); }
      blocked++; return route.abort();
    });
    const page = await context.newPage();
    for (const source of plan.sources) {
      await page.goto(IMAGE_URL);
      const result = await preparePage(page, plan, source, []);
      assert.equal(result.submitted, false); assert.ok(result.settings.includes(source.aspectRatio));
      assert.equal(await page.evaluate(() => window.submissions), 0);
    }
    await page.goto(IMAGE_URL);
    const files = [];
    for (let i=0;i<6;i++) { const p=path.join(tmp, `upload-${i}.png`); await fs.writeFile(p, Buffer.from('fixture')); files.push(p); }
    const imagePlan = { ...plan, mode: 'image_to_image', modelFlavor: 'sunburst' };
    const prepared = await preparePage(page, imagePlan, imagePlan.sources[0], files);
    assert.equal(prepared.referenceCount, 6); assert.equal(prepared.model, 'GPT Image 2.5 Sunburst');
    assert.equal(await page.evaluate(() => window.submissions), 0);
    const receipt = path.join(tmp, 'browser.submission.json');
    assert.equal(await submitOnce(page, receipt, { key: 'small' }), 'fixture-task');
    await assert.rejects(submitOnce(page, receipt, { key: 'small' }), e => e.code === 'DUPLICATE');
    assert.equal(await page.evaluate(() => window.submissions), 1);
    const downloaded = await collectTask(page, receipt, tmp, 5);
    assert.equal(downloaded.status, 'downloaded');
    assert.equal(downloaded.sourceSha256, digest(await fs.readFile(downloaded.sourceFile)));
    assert.equal((await collectTask(page, receipt, tmp, 5)).sourceFile, downloaded.sourceFile);
    const sessionName = `aitak-test-${process.pid}`;
    const worker = await startSession(page, sessionName);
    try {
      const snapshot = await main(['inspect', '--session', sessionName, '--max-wait', '5']);
      assert.equal(snapshot.loggedIn, true); assert.equal(snapshot.session, sessionName);
      assert.equal(snapshot.referenceCount, 6);
    } finally {
      await worker.stop();
      const queue = path.join(ROOT, '.playwright-auth', `${sessionName}.commands`);
      await fs.rmdir(queue);
    }
    console.log(JSON.stringify({ fixtureNavigations: fulfilled, blockedRequests: blocked, realBusinessRequests: 0, source: 'offline-fixture' }));
  } finally { await browser.close(); }
});

test('PushLab 原有裁切器集成：合成测试源图产出四个精确尺寸', { skip: !process.env.PUSHLAB_TEST_ROOT }, async () => {
  const out = path.join(tmp, 'crop'); await fs.mkdir(out);
  const python = process.env.PUSHLAB_TEST_PYTHON || 'python';
  const source = `import json,sys
from pathlib import Path
from PIL import Image
from aitak906.planning import build_plan
root=Path(sys.argv[1])
plan=build_plan('phone personalization',style='dual_focus')
(root/'fixture-plan.json').write_text(json.dumps(plan,ensure_ascii=False),encoding='utf-8')
for i,s in enumerate(plan['sources']):
    a,b=map(int,s['aspectRatio'].split(':'))
    Image.new('RGB',(a*100,b*100),(20+i*30,40,60)).save(root/(s['key']+'.png'))
`;
  const prepared = spawnSync(python, ['-B', '-c', source, out], { cwd: process.env.PUSHLAB_TEST_ROOT, encoding: 'utf8', windowsHide: true });
  assert.equal(prepared.status, 0, prepared.stderr);
  const p = selectPlan(JSON.parse(await fs.readFile(path.join(out, 'fixture-plan.json'), 'utf8')));
  const canonical = JSON.stringify(p, (_k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a],[b]) => a<b?-1:a>b?1:0)) : v);
  for (const key of Object.keys(SPECS)) {
    const sourceFile = path.join(out, key + '.png');
    await fs.writeFile(path.join(out, key + '.submission.json'), JSON.stringify({ key, status: 'downloaded', planSha256: digest(canonical), sourceFile, sourceSha256: digest(await fs.readFile(sourceFile)) }));
  }
  const result = await cropOutputs(p, out, process.env.PUSHLAB_TEST_ROOT, python);
  assert.equal(result.needsVisualReview, true); assert.equal(result.importedToStudio, false);
  for (const [key, [width, height]] of Object.entries(SPECS)) {
    const raw = await fs.readFile(path.join(result.output, `aitak-native-${key}.png`));
    assert.equal(raw.readUInt32BE(16), width); assert.equal(raw.readUInt32BE(20), height);
  }
});

test.after(async () => {
  const resolved = path.resolve(tmp); const parent = path.join(ROOT, 'artifacts', 'aitak-906-test') + path.sep;
  if (!resolved.startsWith(parent)) throw new Error('Unsafe fixture cleanup path');
  await fs.rm(resolved, { recursive: true, force: true });
});
