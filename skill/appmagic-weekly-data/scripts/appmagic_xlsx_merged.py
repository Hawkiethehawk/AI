# -*- coding: utf-8 -*-
"""把 6 个品类合并到同一个 Sheet：按指定品类顺序分组、组内按本周排名升序，品类列标注类别。"""
import json, os, re
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

PROJECT_DIR = Path(os.environ.get('APPMAGIC_PROJECT_DIR', Path.cwd())).resolve()
def _current_monday():
    import datetime
    d = datetime.datetime.utcnow().date()
    return (d - datetime.timedelta(days=d.weekday())).isoformat()
# 按起始日期(周锚点)归档：output/AppMagic-<YYYYMMDD>/
ANCHOR = os.environ.get('WEEK_ANCHOR') or _current_monday()
MON = ANCHOR.replace('-', '')
OUT_BASE = PROJECT_DIR / 'output' / 'folder'
DATA_DIR = OUT_BASE
XLSX_DIR = OUT_BASE
def u(*codes):
    return ''.join(chr(x) for x in codes)
ORDER = [
    u(0x8D85, 0x4F11, 0x95F2),
    u(0x4F11, 0x95F2),
    'Launcher',
    u(0x6740, 0x6BD2, 0x8F6F, 0x4EF6, 0x3001, 0x6E05, 0x7406),
    u(0x6587, 0x4EF6, 0x6062, 0x590D),
    'PDF' + u(0x9605, 0x8BFB, 0x5668),
]

def load(cat):
    p = DATA_DIR / f'appmagic-{cat}-{MON}-weekly.json'
    if not os.path.exists(p):
        print('  [skip] no data:', cat); return None
    d = json.load(open(p, encoding='utf-8'))
    d['_mon'] = (d.get('weeks') or [''])[0].replace('-', '')
    return d

def _chain(tax):
    byid = {t['id']: t for t in tax}
    parents = set(p for t in tax for p in (t.get('parent_ids') or []))
    leaves = [t for t in tax if t['id'] not in parents] or tax
    best = []
    for lf in leaves:
        chain, cur, seen = [], lf, set()
        while cur and cur['id'] not in seen:
            seen.add(cur['id']); chain.append(cur['name'])
            pid = (cur.get('parent_ids') or [None])[0]
            cur = byid.get(pid)
        chain = list(reversed(chain))
        if len(chain) > len(best): best = chain
    return best

def tag_path(tags):
    tags = tags or []
    domain = next((t['name'] for t in tags if t.get('type') == 'domain'), '')
    games = [t for t in tags if t.get('type') == 'games']
    seq = [domain] if domain else []
    if games:
        meta = next((t['name'] for t in tags if t.get('type') == 'meta'), '')
        if meta: seq.append(meta)
        seq += _chain(games)
    else:
        seq += _chain([t for t in tags if t.get('type') == 'apps'])
    out = []
    for x in seq:
        if x and x not in out: out.append(x)
    return ' / '.join(out)

def norm_date(s):
    if not s: return ''
    m = re.match(r'(\d{4})-(\d{2})-(\d{2})', s)
    return f'{m.group(1)}-{m.group(2)}-{m.group(3)}' if m else s

def hist_str(history):
    return ' → '.join(str(x) if x is not None else '·' for x in reversed(history))

def stability(r):
    history = r['history']
    count50 = sum(1 for h in history if h is not None and h <= 50)
    onboard = sum(1 for h in history if h is not None)
    streak = r.get('streak50', 0)
    if streak >= 4: return f'稳定·连续{streak}周Top50'
    if count50 >= 4: return f'较稳·{len(history)}周内{count50}周Top50'
    if streak >= 1: return f'连{streak}周Top50/在榜{onboard}周'
    return f'波动·在榜{onboard}周(Top50 {count50}周)'

def change_str(r):
    if r['lastWeek'] is None: return 'NEW'
    c = r['change']
    return f'+{c}' if c > 0 else (str(c) if c < 0 else '0')

def top5(s):
    if not s: return ''
    return ' / '.join([x for x in s.split(' / ') if x][:5])

def store_url(store_ids):
    sids = store_ids or []
    gp = next((s for s in sids if s.startswith('1_')), None)
    if gp: return 'https://play.google.com/store/apps/details?id=' + gp[2:]
    ios = next((s for s in sids if s.startswith('2_')), None) or next((s for s in sids if s.startswith('3_')), None)
    if ios: return 'https://apps.apple.com/app/id' + ios[2:]
    return ''

HEAD_FILL = PatternFill('solid', fgColor='1F3864'); HEAD_FONT = Font(bold=True, color='FFFFFF', size=10)
TITLE_FONT = Font(bold=True, size=14, color='1F3864'); NOTE_FONT = Font(size=9, color='595959')
LINK_FONT = Font(color='0563C1', underline='single', size=10)
LINK_FONT_BOLD = Font(color='0563C1', underline='single', size=10, bold=True)
UP_FILL = PatternFill('solid', fgColor='E2EFDA'); DOWN_FILL = PatternFill('solid', fgColor='FCE4E4'); NEW_FILL = PatternFill('solid', fgColor='FFF2CC')
FOCUS_FILL = PatternFill('solid', fgColor='F8CBAD')
CAT_FILLS = {
    '超休闲': 'DDEBF7', '休闲': 'E2EFDA', 'Launcher': 'FCE4D6',
    '杀毒软件、清理': 'FFF2CC', '文件恢复': 'EDEDED', 'PDF阅读器': 'E1D5E7',
}
thin = Side(style='thin', color='D9D9D9'); BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)
GROUP_TOP = Border(left=thin, right=thin, bottom=thin, top=Side(style='medium', color='1F3864'))
CENTER = Alignment(horizontal='center', vertical='center', wrap_text=True)
LEFT = Alignment(horizontal='left', vertical='center', wrap_text=True)

COLS = [('序号',5,'c'),('游戏名',28,'l'),('品类',12,'c'),('Tag路径',22,'l'),
        ('本周排名',7,'c'),('上周排名',7,'c'),('变化量',7,'c'),('6周排名轨迹',30,'l'),('Top50稳定性',20,'l'),
        ('近30天下载国Top5',30,'l'),('近30天收入国Top5',26,'l'),('市场属性',20,'l'),('上线日期',12,'c'),
        ('评分',6,'c'),('评论数',11,'c'),('发行商',20,'l'),('总部',6,'c'),('重点关注',8,'c'),('备注',26,'l')]
H = {name: i+1 for i, (name, _, _) in enumerate(COLS)}

wb = Workbook(); ws = wb.active
groups = []; mdef = None; gen = ''; anchors = {}
for cat in ORDER:
    d = load(cat)
    if not d: continue
    mdef = mdef or d.get('marketDef')
    gen = gen or d.get('generatedAt', '')[:10]
    anchors[cat] = (d.get('weeks') or [''])[0]
    groups.append((cat, d['_mon'], sorted(d['focus'], key=lambda r: r['rank'])))

# 跨周校验：各品类必须同一周锚点，否则默认中止（避免把不同周的数据静默拼到一张表）
distinct = sorted(set(a for a in anchors.values() if a))
if len(distinct) > 1 and os.environ.get('ALLOW_MIXED_WEEKS') != '1':
    detail = ' / '.join(f'{c}={a}' for c, a in anchors.items())
    raise SystemExit(
        f'[abort] 合并的品类周锚点不一致: {detail}\n'
        '请用同一 WEEK_ANCHOR 重跑落后的品类，或设 ALLOW_MIXED_WEEKS=1 强制合并（标题会标注混周）。'
    )
mixed = len(distinct) > 1

total = sum(len(g) for _, _, g in groups)
mon = max((_mon for _, _mon, _ in groups), default='')
ws.title = mon if mon else 'Sheet1'

_mix_note = f'  ⚠️ 混周合并：{" / ".join(f"{c}={a}" for c, a in anchors.items())}' if mixed else ''
ws['A1'] = f'AppMagic 周报 · 全品类（{"/".join(c for c,_,_ in groups)}）· {mon} 当周（免费榜）{_mix_note}'; ws['A1'].font = TITLE_FONT
ws['A2'] = ('口径：全球(WW)·周聚合·免费榜·Top1000 | 变化量正=上升(绿)/负=下降(红)/NEW(黄) | '
            '重点关注=排名变化突出或潜力新品 | 数据源 AppMagic API · 生成 ' + gen)
ws['A2'].font = NOTE_FONT
if mdef:
    ws['A3'] = ('市场定义：成熟市场(高ARPU)=' + ' '.join(mdef['mature']) + '  ｜  新兴市场=' + ' '.join(mdef['emerging']))
    ws['A3'].font = NOTE_FONT
HEAD_ROW = 5
for name, w, _ in COLS:
    j = H[name]; cell = ws.cell(HEAD_ROW, j, name); cell.fill = HEAD_FILL; cell.font = HEAD_FONT; cell.alignment = CENTER
    ws.column_dimensions[get_column_letter(j)].width = w

row = HEAD_ROW + 1; seq = 0
for cat, _mon, focus in groups:
    first = True
    for r in focus:
        seq += 1
        co = r.get('country') or {}
        is_focus = r.get('_focus', False)
        reasons = '/'.join(r.get('_focusReasons', []))
        cells = {
            '序号': seq, '游戏名': r.get('name',''), '品类': cat,
            'Tag路径': tag_path(r.get('tags')), '本周排名': r['rank'],
            '上周排名': r['lastWeek'] if r['lastWeek'] is not None else 'NEW', '变化量': change_str(r),
            '6周排名轨迹': hist_str(r['history']), 'Top50稳定性': stability(r),
            '近30天下载国Top5': top5(co.get('dlList','')) or '—', '近30天收入国Top5': top5(co.get('revList','')) or '—（无内购收入/IAA变现）',
            '市场属性': co.get('market',''), '上线日期': norm_date(r.get('release','')),
            '评分': round(r['rating'],2) if r.get('rating') else '—', '评论数': f"{r['reviews']:,}" if r.get('reviews') else '—',
            '发行商': r.get('publisher',''), '总部': r.get('hq',''),
            '重点关注': '是' if is_focus else '',
            '备注': reasons if reasons else '',
        }
        for name, _, align in COLS:
            j = H[name]; cell = ws.cell(row, j, cells[name])
            cell.border = GROUP_TOP if first else BORDER
            cell.alignment = CENTER if align == 'c' else LEFT
        nc = ws.cell(row, H['游戏名'])
        su = store_url(r.get('storeIds'))
        if su:
            nc.hyperlink = su
            nc.font = LINK_FONT_BOLD if is_focus else LINK_FONT
        pc = ws.cell(row, H['品类']); pc.fill = PatternFill('solid', fgColor=CAT_FILLS.get(cat, 'FFFFFF'))
        cc = ws.cell(row, H['变化量'])
        if r['lastWeek'] is None: cc.fill = NEW_FILL
        elif r['change'] is not None and r['change'] > 0: cc.fill = UP_FILL
        elif r['change'] is not None and r['change'] < 0: cc.fill = DOWN_FILL
        if is_focus:
            ws.cell(row, H['游戏名']).fill = FOCUS_FILL
        first = False
        row += 1

ws.freeze_panes = ws.cell(HEAD_ROW+1, 4)
ws.auto_filter.ref = f'A{HEAD_ROW}:{get_column_letter(len(COLS))}{row-1}'
XLSX_DIR.mkdir(parents=True, exist_ok=True)
OUT = XLSX_DIR / f'AppMagic-{mon}.xlsx'
wb.save(OUT)
print('saved', OUT, '| 品类', len(groups), '| 总行', total)
