const http = require('http');
const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(process.env.APPMAGIC_PROJECT_DIR || process.cwd());
const PORT = parseInt(process.env.APPMAGIC_PORT || '8787', 10);
const AUTO_OPEN = process.env.APPMAGIC_NO_OPEN !== '1';

function latestProgressFile() {
  const base = path.resolve(PROJECT_DIR, 'output', 'folder');
  let dirs = [];
  try { dirs = fs.readdirSync(base).filter(d => /^AppMagic-\d+$/.test(d)); } catch { return null; }
  let best = null;
  let bestTime = -1;
  for (const d of dirs) {
    const file = path.join(base, d, 'appmagic-progress.json');
    try {
      const time = fs.statSync(file).mtimeMs;
      if (time > bestTime) { bestTime = time; best = file; }
    } catch {}
  }
  return best;
}

function readProgress() {
  const file = latestProgressFile();
  if (!file) return { ok: false, data: {}, file: null };
  try {
    const raw = fs.readFileSync(file, 'utf-8').replace(/^\uFEFF/, '');
    return { ok: true, data: JSON.parse(raw), file };
  } catch (error) {
    return { ok: false, data: { parseError: String(error) }, file };
  }
}

function json(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body, null, 2));
}

const PAGE = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AppMagic Dashboard</title>
  <style>
    :root {
      --bg: #09111f;
      --panel: rgba(11, 20, 36, 0.88);
      --panel-strong: rgba(15, 27, 48, 0.96);
      --line: rgba(148, 163, 184, 0.18);
      --text: #e8eefc;
      --muted: #9fb1cf;
      --blue: #56a3ff;
      --cyan: #63e0ff;
      --green: #5bd88a;
      --yellow: #f3c969;
      --red: #ff7d7d;
      --shadow: 0 24px 80px rgba(2, 8, 23, 0.45);
      --radius: 18px;
      --mono: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; }
    body {
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at top left, rgba(86, 163, 255, 0.22), transparent 28%),
        radial-gradient(circle at top right, rgba(99, 224, 255, 0.15), transparent 22%),
        linear-gradient(180deg, #0a1222 0%, #08101b 48%, #060b14 100%);
      padding: 28px;
    }

    .shell {
      max-width: 1380px;
      margin: 0 auto;
      display: grid;
      gap: 18px;
    }

    .hero, .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      backdrop-filter: blur(14px);
    }

    .hero {
      padding: 22px 24px 20px;
      overflow: hidden;
      position: relative;
    }

    .hero::after {
      content: "";
      position: absolute;
      inset: auto -60px -80px auto;
      width: 320px;
      height: 320px;
      border-radius: 999px;
      background: radial-gradient(circle, rgba(99, 224, 255, 0.18), transparent 68%);
      pointer-events: none;
    }

    .hero-top {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .eyebrow {
      color: var(--cyan);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 10px;
    }

    h1 {
      margin: 0 0 8px;
      font-size: clamp(28px, 4vw, 42px);
      line-height: 1.02;
      letter-spacing: 0;
    }

    .hero-copy {
      color: var(--muted);
      max-width: 700px;
      line-height: 1.6;
      font-size: 14px;
    }

    .hero-side {
      min-width: 260px;
      flex: 1 1 260px;
      display: grid;
      gap: 10px;
      justify-items: end;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      border-radius: 999px;
      padding: 8px 14px;
      background: rgba(86, 163, 255, 0.12);
      border: 1px solid rgba(86, 163, 255, 0.24);
      color: #dbeafe;
      font-size: 13px;
      font-weight: 600;
    }

    .status-chip.ok {
      background: rgba(91, 216, 138, 0.12);
      border-color: rgba(91, 216, 138, 0.24);
      color: #d8ffea;
    }

    .status-chip.warn {
      background: rgba(243, 201, 105, 0.12);
      border-color: rgba(243, 201, 105, 0.22);
      color: #fff0c8;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: currentColor;
      box-shadow: 0 0 0 8px rgba(255,255,255,0.06);
    }

    .meta-list {
      display: grid;
      gap: 6px;
      color: var(--muted);
      font-size: 13px;
      text-align: right;
    }

    .meta-list strong { color: var(--text); font-weight: 600; }

    .bar-wrap {
      margin-top: 18px;
      display: grid;
      gap: 8px;
    }

    .bar {
      height: 14px;
      border-radius: 999px;
      background: rgba(148, 163, 184, 0.12);
      overflow: hidden;
      border: 1px solid rgba(148, 163, 184, 0.1);
    }

    .bar > span {
      display: block;
      height: 100%;
      width: 0%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--blue), var(--cyan));
      transition: width 0.35s ease;
    }

    .bar.ok > span {
      background: linear-gradient(90deg, #4fd58f, #8affca);
    }

    .bar-copy {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      color: var(--muted);
      font-size: 13px;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 14px;
    }

    .metric {
      padding: 16px 18px;
      border-radius: 16px;
      background: linear-gradient(180deg, rgba(15, 27, 48, 0.98), rgba(10, 20, 36, 0.92));
      border: 1px solid var(--line);
    }

    .metric .label {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }

    .metric .value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .metric .sub {
      color: var(--muted);
      font-size: 12px;
      margin-top: 8px;
      line-height: 1.45;
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.9fr);
      gap: 18px;
    }

    .panel {
      padding: 18px;
    }

    .panel-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    .panel-title h2 {
      margin: 0;
      font-size: 18px;
      letter-spacing: 0;
    }

    .panel-title .hint {
      color: var(--muted);
      font-size: 12px;
    }

    .stack {
      display: grid;
      gap: 18px;
    }

    .kv-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
    }

    .kv {
      border: 1px solid var(--line);
      border-radius: 14px;
      background: rgba(15, 23, 38, 0.72);
      padding: 12px 14px;
    }

    .kv .k {
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 6px;
    }

    .kv .v {
      font-size: 14px;
      line-height: 1.5;
      font-variant-numeric: tabular-nums;
      word-break: break-word;
    }

    .token-list, .worker-list, .event-list {
      display: grid;
      gap: 10px;
    }

    .pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .pill {
      border-radius: 999px;
      padding: 6px 10px;
      background: rgba(148, 163, 184, 0.1);
      border: 1px solid rgba(148, 163, 184, 0.14);
      color: var(--text);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }

    .worker-card, .event {
      border-radius: 14px;
      border: 1px solid var(--line);
      background: rgba(12, 22, 39, 0.78);
      padding: 12px 14px;
    }

    .worker-head, .event-head {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 6px;
      font-size: 13px;
    }

    .worker-head strong, .event-head strong {
      font-size: 14px;
    }

    .worker-meta, .event-meta {
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
      word-break: break-word;
    }

    .event[data-level="error"] { border-color: rgba(255, 125, 125, 0.34); }
    .event[data-level="warn"] { border-color: rgba(243, 201, 105, 0.34); }
    .event[data-level="info"] { border-color: rgba(86, 163, 255, 0.26); }

    .table-wrap {
      overflow: auto;
      border-radius: 16px;
      border: 1px solid var(--line);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 920px;
      background: rgba(10, 18, 32, 0.66);
    }

    th, td {
      padding: 12px 13px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
      text-align: left;
      vertical-align: top;
      font-size: 13px;
    }

    thead th {
      background: rgba(12, 22, 39, 0.95);
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    tbody tr:hover td { background: rgba(86, 163, 255, 0.05); }
    td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
    td .muted { color: var(--muted); }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 999px;
      padding: 5px 10px;
      border: 1px solid transparent;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge.done {
      color: #d7ffe7;
      background: rgba(91, 216, 138, 0.14);
      border-color: rgba(91, 216, 138, 0.24);
    }

    .badge.run {
      color: #dbeafe;
      background: rgba(86, 163, 255, 0.16);
      border-color: rgba(86, 163, 255, 0.24);
    }

    .badge.wait {
      color: var(--muted);
      background: rgba(148, 163, 184, 0.12);
      border-color: rgba(148, 163, 184, 0.14);
    }

    .badge.err {
      color: #ffdcdc;
      background: rgba(255, 125, 125, 0.14);
      border-color: rgba(255, 125, 125, 0.26);
    }

    .mini {
      height: 8px;
      width: 110px;
      border-radius: 999px;
      overflow: hidden;
      background: rgba(148, 163, 184, 0.14);
      margin-bottom: 6px;
    }

    .mini > span {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, var(--blue), var(--cyan));
    }

    .mono {
      font-family: var(--mono);
      font-size: 12px;
      color: #cfe0ff;
    }

    .empty {
      padding: 24px;
      text-align: center;
      color: var(--muted);
      border: 1px dashed var(--line);
      border-radius: 14px;
      background: rgba(10, 18, 32, 0.5);
    }

    .footer {
      color: var(--muted);
      font-size: 12px;
      text-align: center;
      padding-bottom: 6px;
    }

    a {
      color: #cde8ff;
      text-decoration: none;
    }

    a:hover { text-decoration: underline; }

    @media (max-width: 1040px) {
      body { padding: 18px; }
      .layout { grid-template-columns: 1fr; }
      .hero-side { justify-items: start; }
      .meta-list { text-align: left; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <section class="hero">
      <div class="hero-top">
        <div>
          <div class="eyebrow">AppMagic Live Dashboard</div>
          <h1 id="title">Waiting For Progress Feed</h1>
          <div class="hero-copy" id="summary">
            The dashboard connects to the latest AppMagic progress JSON in this workspace and refreshes every 2 seconds.
          </div>
        </div>
        <div class="hero-side">
          <div class="status-chip warn" id="statusChip"><span class="status-dot"></span><span id="statusText">Connecting</span></div>
          <div class="meta-list">
            <div><strong>Port</strong> <span id="metaPort">--</span></div>
            <div><strong>Updated</strong> <span id="metaUpdated">--</span></div>
            <div><strong>Elapsed</strong> <span id="metaElapsed">--</span></div>
          </div>
        </div>
      </div>
      <div class="bar-wrap">
        <div class="bar" id="overallBar"><span></span></div>
        <div class="bar-copy">
          <span id="overallCopy">Overall progress will appear here.</span>
          <span id="anchorCopy">Week anchor: --</span>
        </div>
      </div>
    </section>

    <section class="metrics" id="metrics"></section>

    <div class="layout">
      <div class="stack">
        <section class="panel">
          <div class="panel-title">
            <h2>Category Progress</h2>
            <div class="hint">Live category status, queue progress and current app context</div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Status</th>
                  <th class="num">Rows</th>
                  <th class="num">Focus</th>
                  <th>Progress</th>
                  <th>Account</th>
                  <th>Cache</th>
                  <th>Current</th>
                  <th>Error</th>
                  <th class="num">Duration</th>
                </tr>
              </thead>
              <tbody id="categoryBody"></tbody>
            </table>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title">
            <h2>Recent Events</h2>
            <div class="hint">Latest run-level events, warnings and rate-limit cooldowns</div>
          </div>
          <div class="event-list" id="events"></div>
        </section>
      </div>

      <div class="stack">
        <section class="panel">
          <div class="panel-title">
            <h2>Run Context</h2>
            <div class="hint">What this run is doing right now</div>
          </div>
          <div class="kv-grid" id="contextGrid"></div>
        </section>

        <section class="panel">
          <div class="panel-title">
            <h2>Accounts</h2>
            <div class="hint">Leaderboard account, worker accounts and discovered token dirs</div>
          </div>
          <div class="stack">
            <div>
              <div class="hint">Leaderboard account</div>
              <div class="pill-row" id="leaderAccount"></div>
            </div>
            <div>
              <div class="hint">Country enrichment workers</div>
              <div class="pill-row" id="workerAccounts"></div>
            </div>
            <div>
              <div class="hint">Token directories</div>
              <div class="pill-row" id="tokenDirs"></div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title">
            <h2>Worker Activity</h2>
            <div class="hint">Which account is currently on which category</div>
          </div>
          <div class="worker-list" id="workers"></div>
        </section>

        <section class="panel">
          <div class="panel-title">
            <h2>Raw Data</h2>
            <div class="hint">Debug-friendly links</div>
          </div>
          <div class="kv-grid">
            <div class="kv">
              <div class="k">Progress JSON</div>
              <div class="v"><a href="/api/progress" target="_blank" rel="noreferrer">Open /api/progress</a></div>
            </div>
            <div class="kv">
              <div class="k">Health</div>
              <div class="v"><a href="/api/health" target="_blank" rel="noreferrer">Open /api/health</a></div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="footer">Auto-refresh every 2 seconds. Served from localhost and reads the newest AppMagic progress file in this workspace.</div>
  </div>

  <script>
    const state = { port: window.location.port || "8787" };

    function esc(value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function fmtNumber(value) {
      if (value == null || value === "") return "--";
      return Number(value).toLocaleString("en-US");
    }

    function fmtDuration(ms) {
      if (ms == null || Number.isNaN(ms)) return "--";
      const totalSeconds = Math.max(0, Math.round(ms / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      if (hours) return hours + "h " + minutes + "m";
      if (minutes) return minutes + "m " + seconds + "s";
      return seconds + "s";
    }

    function fmtTime(value) {
      if (!value) return "--";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return date.toLocaleString("zh-CN", { hour12: false });
    }

    function renderPills(node, values) {
      if (!values || !values.length) {
        node.innerHTML = '<span class="pill">--</span>';
        return;
      }
      node.innerHTML = values.map(value => '<span class="pill mono">' + esc(value) + '</span>').join("");
    }

    function metric(label, value, sub) {
      return '<div class="metric"><div class="label">' + esc(label) + '</div><div class="value">' + value + '</div><div class="sub">' + esc(sub || "") + '</div></div>';
    }

    function buildStatus(data) {
      if (!data || !data.cats) return { cls: "warn", text: "Waiting For Data" };
      if (data.doneCats === data.total && data.total > 0) return { cls: "ok", text: "Completed" };
      if ((data.rateLimited || 0) > 0) return { cls: "warn", text: "Running With Cooldowns" };
      if ((data.activeCats || 0) > 0) return { cls: "", text: "Running" };
      return { cls: "warn", text: "Queued" };
    }

    function renderEmpty(message) {
      document.getElementById("title").textContent = "Waiting For Progress Feed";
      document.getElementById("summary").textContent = message;
      document.getElementById("statusChip").className = "status-chip warn";
      document.getElementById("statusText").textContent = "No Progress Yet";
      document.getElementById("metaPort").textContent = state.port;
      document.getElementById("metaUpdated").textContent = "--";
      document.getElementById("metaElapsed").textContent = "--";
      document.getElementById("overallBar").className = "bar";
      document.querySelector("#overallBar > span").style.width = "0%";
      document.getElementById("overallCopy").textContent = "Start a scrape to stream live progress here.";
      document.getElementById("anchorCopy").textContent = "Week anchor: --";
      document.getElementById("metrics").innerHTML = [
        metric("Overall", "--", "No active run"),
        metric("Categories", "--", "Waiting for progress file"),
        metric("Accounts", "--", "Dashboard is online"),
        metric("Output", "--", "Latest folder unavailable")
      ].join("");
      document.getElementById("categoryBody").innerHTML = '<tr><td colspan="10"><div class="empty">No progress JSON found yet.</div></td></tr>';
      document.getElementById("events").innerHTML = '<div class="empty">Recent events will appear here once a run starts.</div>';
      document.getElementById("contextGrid").innerHTML = '<div class="empty">Run context is empty.</div>';
      document.getElementById("workers").innerHTML = '<div class="empty">Worker activity is empty.</div>';
      renderPills(document.getElementById("leaderAccount"), []);
      renderPills(document.getElementById("workerAccounts"), []);
      renderPills(document.getElementById("tokenDirs"), []);
    }

    function render(data) {
      if (!data || !data.cats) {
        renderEmpty("The server is up, but there is no AppMagic progress JSON in the current project yet.");
        return;
      }

      const status = buildStatus(data);
      document.getElementById("title").textContent = "AppMagic Weekly Run";
      document.getElementById("summary").textContent =
        "Stage: " + (data.stageLabel || data.currentStage || "--") +
        " | Queue " + fmtNumber(data.queueRemaining) + "/" + fmtNumber(data.queueTotal) +
        " | Project " + (data.projectDir || "--");
      document.getElementById("statusChip").className = "status-chip " + status.cls;
      document.getElementById("statusText").textContent = status.text;
      document.getElementById("metaPort").textContent = state.port;
      document.getElementById("metaUpdated").textContent = fmtTime(data.updatedAt);
      document.getElementById("metaElapsed").textContent = fmtDuration(data.runElapsed);

      const bar = document.querySelector("#overallBar > span");
      bar.style.width = (data.overall || 0) + "%";
      document.getElementById("overallBar").className = "bar" + (data.doneCats === data.total && data.total > 0 ? " ok" : "");
      document.getElementById("overallCopy").textContent =
        "Completed " + fmtNumber(data.doneCats) + "/" + fmtNumber(data.total) +
        " categories | Active " + fmtNumber(data.activeCats) +
        " | Focus coverage gap " + fmtNumber(data.totalFail);
      document.getElementById("anchorCopy").textContent = "Week anchor: " + (data.anchor || "--");

      const coverageDone = (data.totalFocus || 0) - (data.totalFail || 0);
      const coveragePct = data.totalFocus ? Math.round((coverageDone * 100) / data.totalFocus) : 0;
      document.getElementById("metrics").innerHTML = [
        metric("Overall", (data.overall || 0) + "%", "Done " + fmtNumber(data.doneCats) + " / " + fmtNumber(data.total)),
        metric("Focus Coverage", fmtNumber(coverageDone), "of " + fmtNumber(data.totalFocus) + " focus apps | " + coveragePct + "%"),
        metric("Leaderboard Rows", fmtNumber(data.totalRows), "Current anchor rows across categories"),
        metric("Rate Limits", fmtNumber(data.rateLimited), "Cooldown events so far"),
        metric("Accounts", fmtNumber(data.poolSize), "Worker accounts " + fmtNumber((data.workerAccounts || []).length)),
        metric("Mode", data.forceRefresh ? "Fresh" : "Reuse", data.listOnly ? "List only enabled" : "Full enrichment")
      ].join("");

      const context = [
        ["Current stage", data.stageLabel || data.currentStage || "--"],
        ["Week set", (data.weeks || []).join(" | ") || "--"],
        ["Output dir", data.outputDir || "--"],
        ["Project dir", data.projectDir || "--"],
        ["Leaderboard account", data.leaderboardAccount || "--"],
        ["Queue remaining", fmtNumber(data.queueRemaining) + " / " + fmtNumber(data.queueTotal)],
        ["Raw JSON", "/api/progress"],
        ["Updated", fmtTime(data.updatedAt)]
      ];
      document.getElementById("contextGrid").innerHTML = context.map(([k, v]) =>
        '<div class="kv"><div class="k">' + esc(k) + '</div><div class="v mono">' + esc(v) + '</div></div>'
      ).join("");

      renderPills(document.getElementById("leaderAccount"), data.leaderboardAccount ? [data.leaderboardAccount] : []);
      renderPills(document.getElementById("workerAccounts"), data.workerAccounts || []);
      renderPills(document.getElementById("tokenDirs"), data.tokenDirs || []);

      const workerCards = (data.workers || []).map(worker => {
        return '<div class="worker-card">' +
          '<div class="worker-head"><strong>' + esc(worker.account || "--") + '</strong><span class="badge ' +
          (worker.status === "running" ? "run" : "wait") + '">' + esc(worker.status || "idle") + '</span></div>' +
          '<div class="worker-meta">Category: ' + esc(worker.category || "--") + '</div>' +
          '<div class="worker-meta">Current: ' + esc(worker.current || "--") + '</div>' +
          '<div class="worker-meta">Updated: ' + esc(fmtTime(worker.updatedAt)) + '</div>' +
          '</div>';
      }).join("");
      document.getElementById("workers").innerHTML = workerCards || '<div class="empty">No worker activity yet.</div>';

      const categoryRows = (data.cats || []).map(cat => {
        const badgeClass = cat.cls === "done" ? "done" : cat.cls === "err" ? "err" : cat.cls === "wait" ? "wait" : "run";
        return '<tr>' +
          '<td><strong>' + esc(cat.label) + '</strong><div class="muted">' + esc(cat.detail || "--") + '</div></td>' +
          '<td><span class="badge ' + badgeClass + '">' + esc(cat.lab || cat.status || "--") + '</span></td>' +
          '<td class="num">' + fmtNumber(cat.curRows) + '</td>' +
          '<td class="num">' + fmtNumber(cat.focus) + '</td>' +
          '<td><div class="mini"><span style="width:' + (cat.pct || 0) + '%"></span></div><div class="muted">' + esc(cat.prog || "--") + '</div></td>' +
          '<td class="mono">' + esc(cat.account || "--") + '</td>' +
          '<td>' + esc(cat.cache || "--") + '</td>' +
          '<td><div>' + esc(cat.cur || "--") + '</div><div class="muted">Week ' + esc(cat.currentWeek || "--") + ' | Pending ' + fmtNumber(cat.pending) + '</div></td>' +
          '<td>' + (cat.lastError ? '<span class="muted">' + esc(cat.lastError) + '</span>' : '--') + '</td>' +
          '<td class="num">' + fmtDuration(cat.dur) + '</td>' +
          '</tr>';
      }).join("");
      document.getElementById("categoryBody").innerHTML = categoryRows || '<tr><td colspan="10"><div class="empty">No category rows.</div></td></tr>';

      const events = (data.events || []).slice().reverse().map(event => {
        return '<div class="event" data-level="' + esc(event.level || "info") + '">' +
          '<div class="event-head"><strong>' + esc(event.message || "--") + '</strong><span class="badge ' +
          (event.level === "error" ? "err" : event.level === "warn" ? "wait" : "run") + '">' + esc(event.level || "info") + '</span></div>' +
          '<div class="event-meta">Time: ' + esc(fmtTime(event.at)) + '</div>' +
          '<div class="event-meta">Account: ' + esc(event.account || "--") + ' | Category: ' + esc(event.category || "--") + '</div>' +
          '<div class="event-meta">Context: ' + esc(JSON.stringify(event)) + '</div>' +
          '</div>';
      }).join("");
      document.getElementById("events").innerHTML = events || '<div class="empty">No recent events.</div>';
    }

    async function tick() {
      try {
        const response = await fetch('/api/progress', { cache: 'no-store' });
        const data = await response.json();
        render(data);
      } catch (error) {
        renderEmpty('The dashboard server is reachable, but the progress feed request failed: ' + error.message);
      }
    }

    renderEmpty("Connecting to localhost progress feed...");
    tick();
    setInterval(tick, 2000);
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url && req.url.startsWith('/api/progress')) {
    const current = readProgress();
    if (!current.ok && !current.file) return json(res, 200, {});
    if (!current.ok) return json(res, 500, current.data);
    return json(res, 200, current.data);
  }

  if (req.url && req.url.startsWith('/api/health')) {
    const current = readProgress();
    return json(res, 200, {
      ok: true,
      projectDir: PROJECT_DIR,
      port: PORT,
      progressFile: current.file,
      hasProgress: current.ok,
    });
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(PAGE);
});

server.listen(PORT, () => {
  console.log(`AppMagic dashboard: http://localhost:${PORT}`);
  if (!AUTO_OPEN) return;
  const url = `http://localhost:${PORT}`;
  const cp = require('child_process');
  try {
    if (process.platform === 'win32') cp.exec(`start "" "${url}"`);
    else if (process.platform === 'darwin') cp.exec(`open "${url}"`);
    else cp.exec(`xdg-open "${url}"`);
  } catch {}
});
