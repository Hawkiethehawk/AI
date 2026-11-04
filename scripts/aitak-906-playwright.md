# 通过 Playwright 控制 aiTak 网页

交付范围、验证结果与待验收项见 [2026-11-04 交付文档](../docs/aitak-906-playwright-delivery-20261104.md)。

## 运行方式

脚本读取 PushLab 已准备的 906 计划，通过网页按钮、选项、编辑器和文件上传完成操作。不会从浏览器存储提取 aiTak Bearer Token，不直接调用平台的生成 API，也不更改 PushLab 正式代码、草稿或素材库。

2026-11-03 已查看网页提供的 GPT Image 2.5 Flare / Sunburst、文生图 / 图生图选项，并实际核验 Flare 图生图的 1K、21:9 / 3:2 / 2:1、单张设置及六图上传。该次页面显示参考图容量为十张；906 仍严格使用官方 Logo＋五张商店图。Sunburst 与文生图的自动填写通过离线测试，真实生成均未验证。

aiTak 将应用登录信息放在浏览器会话中。仅保存普通 Playwright storageState 后重新打开浏览器，会再次到飞书授权页。因此使用一个持续运行的命名浏览器会话；关闭后重新执行登录。认证状态只由 Playwright 原样保存在 Git 忽略的 `.playwright-auth/`，不会输出内容。命令队列不包含网站凭据。

环境：使用已有 Node、Playwright Core 和 Edge，不自动安装依赖或下载浏览器。可通过 `AITAK_PLAYWRIGHT_MODULE` 和 `AITAK_BROWSER_EXECUTABLE` 指定现有模块/浏览器路径。

## 1. 登录并保持会话

在当前 AI 仓库克隆根目录中运行：

```powershell
node scripts/aitak-906-playwright.mjs login --headed
```

本人在 Edge 中扫码并完成飞书授权。出现“命名浏览器已就绪”后，保持终端和浏览器开启。后续命令在另一个终端运行，复用这一个页面，不再启动新浏览器。

命名会话默认为 `aitak-906`。如使用 `--session other-name`，后续命令必须带同名参数。只读检查：

```powershell
node scripts/aitak-906-playwright.mjs inspect
```

网页会话过期时，请在当前窗口重新登录/授权。浏览器已关闭时重新执行 login。若进程意外终止留下锁，必须核对锁中 PID 已结束后才能清理，不能删除活动会话的锁。

## 2. 读取现有 906 计划，仅填写表单

支持单个 `plan.json`，也支持 PushLab 草稿 `state.json` 中的 `plans` 数组；多样式必须明确指定 `--style`。

```powershell
$plan = 'F:/PushLab/data/aitak/jobs/<plan-id>/state.json'
$refs = 'F:/PushLab/<reference-pack-directory>'
$job = @('--plan', $plan, '--style', 'dual_focus', '--key', 'small', '--references', $refs)
node scripts/aitak-906-playwright.mjs prepare @job
```

执行前将上述根目录、`<plan-id>` 和 `<reference-pack-directory>` 替换为本机实际值；参考包目录须包含 `reference-pack.json` 和六张 PNG。示例是图生图，不包含具体账号或本机草稿标识。更换应用必须同时更换计划和完整参考包。参考包会核对完整元数据、角色、顺序、来源、PNG 尺寸及 SHA-256；抓取时间和缓存标记允许不同，应用正文和素材不能不同。文生图计划不传 `--references`。

`prepare` 只填表并回读，不点击“生成图片”，也不会按下会触发生成的 Enter。它会替换本会话的未提交表单和参考图，完成后保留页面供检查。

| key | 成品尺寸 | 源图比例 |
| :---: | :---: | :---: |
| small | 970×160 | 21:9 |
| normal | 970×265 | 21:9 |
| large | 970×625 | 3:2 |
| floating | 975×500 | 2:1 |

每张都是独立源图，`1K / n=1`。每样式四张；三种样式共十二张。脚本不自动扩大生成数量。

## 3. 明确提交一张，再回收原任务

下面的命令会消耗平台额度。本次验收没有执行。

```powershell
node scripts/aitak-906-playwright.mjs run @job --submit
```

提交前先原子写入本地记录，再且仅再点击一次“生成图片”。记录到网页任务号后，等待网页轮询完成，通过该任务卡的“下载”保存源图。输出位于 `artifacts/aitak-906-browser/<样式>-<计划哈希>/`，由 Git 忽略。

超时、断线或进程中断时不能重新运行生成。已有记录的同一源图会被拒绝重提；改用：

```powershell
node scripts/aitak-906-playwright.mjs collect @job
```

`collect` 只读取原任务和下载，不会点击生成。若刷新后原任务卡不在当前页面，先在网页“历史”中打开原话题，再执行 collect。若记录中没有任务号，保持 `uncertain`，需要人工核对平台历史；不提供自动删除记录或自动补发生成功能。

手动点击网页“生成图片”不受脚本提交记录管理。为了防重提，正式自动化生成应统一使用 `run --submit`。

## 4. 四张收齐后沿用 PushLab 裁切

把 `--key` 分别改为四个尺寸，逐张明确提交并回收。同一样式四张下载完整后：

```powershell
node scripts/aitak-906-playwright.mjs crop --plan $plan --style dual_focus --pushlab F:/PushLab
```

需要时用 `--python` 指向 PushLab 已有 Python 解释器。此命令调用原项目的 `python -B -m aitak906 crop`，保持原来的等比缩放、裁切、PNG 保存及安全区校验，不叠字、不画 CTA。产物写入当前独立运行目录的 `cropped/`，不替换正式素材。

需要进入 PushLab 工作台时，使用其已有“导入源图”入口，按同一样式的四个 key 分别导入已下载源图。当前脚本没有修改工作台，也没有自动向素材库写入。

## 验证边界

- 真实网页已核验登录、模型/模式/比例/1K/单张控件、六图上传与完整提示词回读；没有真实生成任务。
- `node --test scripts/aitak-906-playwright.test.mjs` 验证四尺寸契约、完整参考包、原子防重提、真实无头浏览器中的表单操作、模拟结果下载及命名会话通信。页面请求全部为离线 fixture，无真实业务请求。
- 2026-11-03 设置 `$env:PUSHLAB_TEST_ROOT='F:/PushLab'` 后运行上述测试，**5 组全部通过**；第五组使用独立合成测试图调用原裁切器，逐一回读四张 PNG 的精确尺寸。
- 2026-11-03 的真实网页四尺寸填表记录保留在本机仓库的 `artifacts/aitak-906-browser/live-preflight-20261103.json`，不随源码发布。四次均为完整六图、1K、单张，提示词完整回读；任务数前后均为 0。
- 独立命名会话的通信已通过离线浏览器测试；本次第二个独立登录窗口等待手动授权超时，未将该独立会话的线上验收记为通过。再次使用 CLI 前需运行 login 并完成授权。
- 模拟提交和下载通过，不等于平台真实生图、额度扣费、生成结果下载或视觉验收通过。
- 真实成品仍需检查文案、Logo、CTA、裁切和视觉质量，始终保留 `needsVisualReview=true`。

脚本及验证记录基于 2026-11-03 可见网页控件。平台改版导致控件缺失或选项变化时会停止，不自动换模型或绕过页面。
