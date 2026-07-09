#!/usr/bin/env node
// @ts-check
// AppMagic 通知与报告模块：生成 SUMMARY.md + 可选 webhook 通知
// 用法: node scripts/notify.js <runDir> [--event success|failure|auth_expired] [--config <configFile>]

const fs = require('fs');
const path = require('path');

const RUN_DIR = process.argv[2] || '';
const EVENT = (() => {
  const i = process.argv.indexOf('--event');
  return i >= 0 ? (process.argv[i + 1] || 'success') : 'success';
})();
const CONFIG_FILE = (() => {
  const i = process.argv.indexOf('--config');
  return i >= 0 ? process.argv[i + 1] : '';
})();

// ── 错误消息映射 ──
const ERROR_MAP = [
  { pattern: /FAIL\s+(\S+)/, cn: (m) => `账号 ${m[1]} 登录已过期，请运行 appmagic login 重新登录` },
  { pattern: /榜单深度\s*(\d+)\s*不可用/, cn: (m) => `当前账号没有 Top${m[1]} 权限，请在配置中将 topDepth 改为 100，或更换有权限的账号` },
  { pattern: /No valid account token/, cn: () => '所有账号 token 均已失效，请至少登录一个账号' },
  { pattern: /429/, cn: () => 'API 请求被限流（429），已自动冷却等待。可增大 dcCooldownMs 或减少 maxWorkers' },
  { pattern: /榜单为空/, cn: () => '榜单返回空数据，可能是 tag 参数无效或该周无数据' },
  { pattern: /榜单请求失败/, cn: () => '榜单请求失败，请检查网络连接和 API 权限' },
  { pattern: /cannot find module|ENOENT/, cn: () => '缺少依赖，请运行 appmagic setup' },
];

function translateError(text) {
  for (const entry of ERROR_MAP) {
    if (entry.pattern.test(text)) {
      return entry.cn(text.match(entry.pattern));
    }
  }
  return text;
}

// ── 辅助函数 ──
function readJsonSafe(file) {
  try {
    const raw = fs.readFileSync(file, 'utf-8').replace(/^﻿/, '');
    return JSON.parse(raw);
  } catch {
    return null;
  }
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

function formatDuration(ms) {
  if (!ms || ms < 0) return '--';
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${m % 60}m${s % 60}s`;
  if (m > 0) return `${m}m${s % 60}s`;
  return `${s}s`;
}

// ── 收集数据 ──
function collectSummary(runDir) {
  if (!runDir || !fs.existsSync(runDir)) {
    return { error: `输出目录不存在: ${runDir}` };
  }

  const progress = readJsonSafe(path.join(runDir, 'appmagic-progress.json'));
  const runState = readJsonSafe(path.join(runDir, 'appmagic-run-state.json'));

  const categories = [];
  const outputFiles = [];
  let weekAnchor = '';
  let topDepth = 1000;
  let generatedAt = '';
  let usedCacheCount = 0;
  let totalCacheCount = 0;
  let hasErrors = false;
  const errors = [];
  const risks = [];

  for (const cat of CATS) {
    const jsonFile = path.join(runDir, `appmagic-${cat}-weekly.json`);
    const data = readJsonSafe(jsonFile);
    if (!data) {
      // 检查有没有 error 状态
      const st = runState && runState[cat];
      if (st && st.status === 'error') {
        hasErrors = true;
        errors.push({ category: cat, error: translateError(st.error || '未知错误') });
        categories.push({ category: cat, rows: 0, focus: 0, missingCountry: 0, error: st.error });
      }
      continue;
    }

    weekAnchor = weekAnchor || (data.weeks || [])[0] || '';
    topDepth = data.topDepth || topDepth;
    generatedAt = generatedAt || data.generatedAt || '';

    const records = data.records || [];
    const focus = data.focus || [];
    const missingCountry = focus.filter(r => !r.country).length;

    // 检查缓存使用
    const st = runState && runState[cat];
    if (st && st.cache && st.cache.includes('缓存')) totalCacheCount++;
    if (st && st.cache && st.cache.includes('榜单缓存')) usedCacheCount++;

    categories.push({
      category: cat,
      rows: records.length,
      focus: focus.length,
      missingCountry,
    });

    // 收集 Excel 文件
    const mon = weekAnchor.replace(/-/g, '');
    const xlsxFile = path.join(runDir, `AppMagic-${cat}-${mon}.xlsx`);
    if (fs.existsSync(xlsxFile)) {
      outputFiles.push(path.basename(xlsxFile));
    }
  }

  // 合并 Excel
  const mon = weekAnchor.replace(/-/g, '');
  const mergedXlsx = path.join(runDir, `AppMagic-${mon}.xlsx`);
  if (fs.existsSync(mergedXlsx)) {
    outputFiles.push(path.basename(mergedXlsx));
  }

  // 自检结果
  const meta = runState && runState._meta;
  const selfCheck = meta && meta.selfCheck;
  if (selfCheck) {
    for (const [cat, result] of Object.entries(selfCheck)) {
      if (result && !result.ok) {
        risks.push(`${cat}: 自检失败 — ${(result.issues || []).join('; ')}`);
      }
      if (result && result.warnings && result.warnings.length) {
        for (const w of result.warnings) {
          risks.push(`${cat}: ${w}`);
        }
      }
    }
  }

  // 缺国别风险
  for (const c of categories) {
    if (c.missingCountry > 0) {
      risks.push(`${c.category}: ${c.missingCountry} 个焦点应用缺国别数据`);
    }
  }

  // 账号信息
  const tokenDirs = (meta && meta.tokenDirs) || [];
  const poolSize = (progress && progress.poolSize) || tokenDirs.length;

  return {
    weekAnchor,
    topDepth,
    generatedAt,
    categories,
    outputFiles,
    usedCacheCount,
    totalCacheCount,
    poolSize,
    tokenDirs,
    errors,
    risks,
    hasErrors,
    runElapsed: (progress && progress.runElapsed) || 0,
    events: (meta && meta.events) || [],
  };
}

// ── 生成 SUMMARY.md ──
function generateMarkdown(summary) {
  if (summary.error) return `# AppMagic 周报 · 错误\n\n${summary.error}\n`;

  const lines = [
    `# AppMagic 周报 · ${summary.weekAnchor || '未知'}`,
    '',
    '## 概览',
    `- **API 周锚点**: ${summary.weekAnchor || '未提供'}`,
    `- **API 结束日期**: 响应未提供`,
    `- **采集深度**: Top${summary.topDepth}`,
    `- **账号数**: ${summary.poolSize}`,
    `- **账号列表**: ${summary.tokenDirs.join(', ') || '未知'}`,
    `- **缓存**: ${summary.usedCacheCount > 0 ? `榜单缓存复用 ${summary.usedCacheCount}/${summary.totalCacheCount || 6} 品类` : '全新拉取（未复用缓存）'}`,
    `- **耗时**: ${formatDuration(summary.runElapsed)}`,
    '',
    '## 品类汇总',
    '',
    '| 品类 | 榜单行数 | 焦点应用 | 缺国别 |',
    '|------|---------|---------|--------|',
  ];

  for (const c of summary.categories) {
    const status = c.error ? `⚠️ ${c.error}` : (c.missingCountry > 0 ? '⚠️' : '✅');
    lines.push(`| ${c.category} | ${c.rows} | ${c.focus} | ${c.missingCountry || 0} ${status} |`);
  }

  lines.push('');
  lines.push('## 输出文件');
  lines.push('');
  for (const f of summary.outputFiles) {
    lines.push(`- \`${f}\``);
  }
  if (!summary.outputFiles.length) {
    lines.push('- (无)');
  }

  if (summary.errors.length) {
    lines.push('');
    lines.push('## 错误');
    for (const e of summary.errors) {
      lines.push(`- **${e.category}**: ${e.error}`);
    }
  }

  if (summary.risks.length) {
    lines.push('');
    lines.push('## 风险与警告');
    for (const r of summary.risks) {
      lines.push(`- ${r}`);
    }
  }

  if (!summary.errors.length && !summary.risks.length) {
    lines.push('');
    lines.push('## 风险');
    lines.push('');
    lines.push('- 无');
  }

  return lines.join('\n') + '\n';
}

// ── Webhook 通知 ──
async function sendWebhook(url, payload) {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return r.ok;
  } catch (error) {
    console.error(`[notify] webhook failed: ${error.message}`);
    return false;
  }
}

function buildWebhookPayload(event, summary, fullPath) {
  return {
    event,
    weekAnchor: summary.weekAnchor,
    totalFocus: summary.categories.reduce((s, c) => s + c.focus, 0),
    outputDir: path.basename(fullPath),
    outputPath: fullPath,
    duration: formatDuration(summary.runElapsed),
    hasErrors: summary.hasErrors,
    errors: summary.errors.map(e => `${e.category}: ${e.error}`),
    risks: summary.risks,
    timestamp: new Date().toISOString(),
  };
}

// ── 主流程 ──
async function main() {
  const runDir = path.resolve(RUN_DIR);
  const summary = collectSummary(runDir);

  // 1. 总是生成 SUMMARY.md
  const summaryPath = path.join(runDir, 'SUMMARY.md');
  const md = generateMarkdown(summary);
  fs.writeFileSync(summaryPath, md, 'utf-8');
  console.log(`[notify] SUMMARY.md 已生成: ${summaryPath}`);

  // 2. 读取配置文件中的通知设置
  let notifications = {};
  if (CONFIG_FILE && fs.existsSync(CONFIG_FILE)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      notifications = cfg.notifications || {};
    } catch {}
  }

  // 3. 查找当前事件类型的通知配置
  const eventKey = EVENT === 'auth_expired' ? 'onAuthExpired'
    : (summary.hasErrors ? 'onFailure' : 'onComplete');
  const notifyCfg = notifications[eventKey];

  // 4. 发送 webhook（如配置）
  if (notifyCfg && notifyCfg.type === 'webhook' && notifyCfg.url) {
    const payload = buildWebhookPayload(EVENT, summary, runDir);
    const ok = await sendWebhook(notifyCfg.url, payload);
    if (ok) {
      console.log(`[notify] webhook 已发送: ${notifyCfg.url}`);
    } else {
      console.warn(`[notify] webhook 发送失败: ${notifyCfg.url}`);
    }
  }

  // 5. 输出控制台摘要
  console.log('\n' + md);

  process.exit(summary.hasErrors ? 1 : 0);
}

main().catch(err => {
  console.error('[notify] fatal:', err.message);
  process.exit(1);
});
