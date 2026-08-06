> 本文面向已经安装 AnySearch Skill、具备基本命令行和 AI Agent 使用经验的 Codex 用户。预计 10 分钟读完，共 8 章。
> 本文是一条可从头读到尾的学习路径：先建立检索流水线，再学习普通搜索、垂直搜索、批量搜索和全文提取。
> 读完你应该能：选择正确的搜索路径；写出可验证的搜索请求；组合多轮检索获得证据；诊断结果不全或不准的原因。

> **数据来源标记（全文通用）：** [[1]](https://github.com/anysearch-ai/anysearch-skill#readme) = AnySearch Skill README；[[2]](https://raw.githubusercontent.com/anysearch-ai/anysearch-skill/main/SKILL.md) = Skill 行为与命令规范；[[3]](https://anysearch.com/console/api-keys) = AnySearch API Key 控制台；[[4]](https://github.com/anysearch-ai/anysearch-mcp-server#readme) = AnySearch MCP Server README。
> 未标记的内容为通用检索方法或本文的使用建议；带“示意”的命令和问题属于教学示例。

## 0. 一句话理解

AnySearch Skill 不是“只会搜一次网页”的工具，而是一条可组合的实时检索流水线：

```text
问题 -> 判断领域 -> 发现参数 -> 搜索/批搜 -> 提取原文 -> 交叉验证 -> 输出结论
```

它支持普通网页搜索、垂直领域搜索、并行批量搜索和 URL 全文提取；Skill 还提供了 Agent 应该何时调用、如何选参数、如何处理失败的行为规则。[[1]](https://github.com/anysearch-ai/anysearch-skill#readme) [[2]](https://raw.githubusercontent.com/anysearch-ai/anysearch-skill/main/SKILL.md)

> 🧭 **贯穿全文的一句话**：先选对检索路径，再让多个工具围绕同一个问题逐步补证据。

## 1. 先掌握主线：四种操作，不是一种搜索

| 操作 | 解决的问题 | 典型输入 |
|---|---|---|
| `search` | 找到相关网页和结果摘要 | “某产品最新功能是什么” |
| `get_sub_domains` | 找到某个垂直领域允许使用的子域和参数 | “金融搜索有哪些股票报价接口” |
| `batch_search` | 并行处理多个独立问题 | “同时比较三家公司的产品” |
| `extract` | 从指定 URL 获取完整页面 Markdown | “阅读这篇官方文档全文” |

如果只是开放式事实查询，使用 `search`。只要问题涉及金融、学术、旅行、健康、代码、法律、安全、社交媒体等支持的领域，就先使用 `get_sub_domains`，再使用垂直搜索。这样做的原因是垂直搜索需要合法的 `sub_domain` 和参数，不能凭空编造。[[2]](https://raw.githubusercontent.com/anysearch-ai/anysearch-skill/main/SKILL.md)

## 2. 第一大陷阱：垂直搜索不能直接猜参数

这是最容易导致请求失败或结果质量下降的地方。

错误思路：

```text
直接搜索 AAPL，并自己猜 finance.quote 或参数格式
```

正确思路：

```text
get_sub_domains --domain finance
    -> 读取返回的 sub_domain 和 required params
    -> 再执行 search
```

`get_sub_domains` 返回可用的子域和参数结构；如果参数被标记为 required，就必须全部传入，即使某个参数的值为空。[[2]](https://raw.githubusercontent.com/anysearch-ai/anysearch-skill/main/SKILL.md)

> ⚠️ 不要把 `sub_domain`、股票类型、地区、时间范围等值写成“看起来合理”的字符串。先发现 schema，再调用搜索。

## 3. 在当前 Windows/Codex 环境中的基础调用

你已经配置了 Python 运行时，常用命令是：

```powershell
python "$HOME\.codex\skills\anysearch\scripts\anysearch_cli.py" <command> ...
```

实际使用时通常不必手动敲命令，直接对 Codex 说“用 AnySearch 搜索……”，让 Skill 按规则执行即可。需要排查时，再使用命令行确认参数和原始结果。

### 3.1 普通网页搜索

```powershell
python "$HOME\.codex\skills\anysearch\scripts\anysearch_cli.py" search "AnySearch Skill 如何配置 API Key" --max_results 5
```

搜索请求最好只包含一个意图。例如，把“比较价格、查发布日期、找官方文档”拆成三个查询；如果它们彼此独立，则放入 `batch_search` 并行执行。

### 3.2 获取垂直领域目录

```powershell
python "$HOME\.codex\skills\anysearch\scripts\anysearch_cli.py" get_sub_domains --domain finance
```

也可以一次发现多个领域：

```powershell
python "$HOME\.codex\skills\anysearch\scripts\anysearch_cli.py" get_sub_domains --domains finance,academic,security
```

### 3.3 读取指定页面全文

```powershell
python "$HOME\.codex\skills\anysearch\scripts\anysearch_cli.py" extract "https://example.com/documentation"
```

`extract` 输出已经是 Markdown，不要额外添加 `--format markdown`、`--format json` 或 `--markdown`。[[1]](https://github.com/anysearch-ai/anysearch-skill#readme) [[2]](https://raw.githubusercontent.com/anysearch-ai/anysearch-skill/main/SKILL.md)

## 4. 垂直搜索：把问题变成结构化查询

垂直搜索的标准流程是：发现目录、选择子域、补齐参数、执行查询。

以股票报价为例，命令形状如下；具体子域和参数必须以当前 `get_sub_domains` 输出为准：

```powershell
python "$HOME\.codex\skills\anysearch\scripts\anysearch_cli.py" get_sub_domains --domain finance
python "$HOME\.codex\skills\anysearch\scripts\anysearch_cli.py" search "AAPL" `
  --domain finance `
  --sub_domain finance.quote `
  --sdp "type=stock,symbol=AAPL,cn_code="
```

上面的 `finance.quote` 和参数仅用于说明命令形状，属于示意；如果目录返回不同值，应以目录返回值替换。

适合优先使用垂直搜索的场景包括：

- 财经：股票、市场、能源等结构化数据。
- 学术：论文、DOI、研究主题。
- 安全：CVE、IP、漏洞信息。
- 代码：库、API、GitHub 项目。
- 旅行：航班、地点、行程信息。
- 社交媒体：公开的 X、Reddit 等内容发现。

## 5. 批量搜索：用并行换取覆盖面

当一个问题包含多个互相独立的子问题时，用 `batch_search`：

```powershell
python "$HOME\.codex\skills\anysearch\scripts\anysearch_cli.py" batch_search `
  --queries '[{"query":"产品 A 官方定价"},{"query":"产品 B 官方定价"},{"query":"产品 C 官方定价"}]'
```

如果多个查询属于同一领域，可以共享领域参数；如果查询混合了普通网页和垂直领域，则为每个查询单独指定字段。Skill 支持并行执行多个独立查询，单个查询失败不会阻塞其他查询。[[2]](https://raw.githubusercontent.com/anysearch-ai/anysearch-skill/main/SKILL.md) [[4]](https://github.com/anysearch-ai/anysearch-mcp-server#readme)

### 推荐的混合检索

对于重要问题，可以把一个普通查询和若干垂直查询放进同一批次：

```text
普通查询：问题的自然语言版本
垂直查询：官方数据、论文、代码或安全数据库版本
```

普通搜索负责广度，垂直搜索负责结构化精度。两者结果有冲突时，再对关键 URL 使用 `extract`。

## 6. 全文提取与证据链

搜索摘要适合定位页面，`extract` 适合确认页面原文。建议采用下面的证据链：

```text
搜索定位 -> 打开官方/原始页面 -> extract 全文 -> 找到支持结论的段落 -> 再回答
```

对新闻、政策、软件版本、价格、API 参数等容易变化的事实，不要只依赖一条摘要。先搜索，再提取原文；如果结论重要，再用不同来源复核。这是本文的工作流建议，不是 AnySearch 后端的硬性限制。

可以这样向 Codex 提问：

```text
请用 AnySearch 调查“某 API 是否支持 Streamable HTTP”。
先找官方文档，再提取原文；最后给出结论、适用版本、原文链接和不确定点。
```

## 7. 社交媒体与特殊场景

公开社交媒体内容应先把 `social_media` 当作垂直领域处理：

```powershell
python "$HOME\.codex\skills\anysearch\scripts\anysearch_cli.py" get_sub_domains --domain social_media
python "$HOME\.codex\skills\anysearch\scripts\anysearch_cli.py" search "某产品发布后的 X 和 Reddit 反馈" `
  --domain social_media `
  --sub_domain <以上命令返回的子域> `
  --max_results 5
```

AnySearch 适合做公开发现、跨来源检索和页面提取；如果要读取账号范围内的推文、回复、关注者、监控或执行发帖，应使用具有相应认证和权限的专用工具。[[1]](https://github.com/anysearch-ai/anysearch-skill#readme) [[2]](https://raw.githubusercontent.com/anysearch-ai/anysearch-skill/main/SKILL.md)

## 8. 如何让 Codex 最大程度发挥它

### 8.1 在请求中明确“搜索目标”和“证据标准”

不要只说“帮我查一下”。更好的请求包含四个部分：

```text
目标：我要确定什么
范围：时间、地区、产品版本或数据领域
证据：优先官方文档/原始数据/论文/代码仓库
输出：摘要、对比表、链接、冲突点和结论置信度
```

示例：

```text
用 AnySearch 查 2026 年仍有效的 AnySearch MCP 配置方式。
优先官方仓库 README；提取关键页面原文；区分 Streamable HTTP、SSE 和 stdio；
最后给出 Windows 配置示例，并标注可能随版本变化的部分。
```

### 8.2 一个复杂任务拆成“发现、验证、综合”三轮

```text
第一轮：广泛发现候选来源
第二轮：对关键来源 extract，核对原文和版本
第三轮：综合结果，列出一致结论、冲突结论和仍缺失的信息
```

这样比一次性要求“搜索并总结”更容易发现错误，也更适合研究、竞品分析、技术选型和事实核查。

### 8.3 把“一个意图一次调用”当成默认规则

例如不要把下面三件事塞进一个模糊查询：

```text
查产品价格、用户评价、技术架构和融资情况
```

应拆成多个明确查询，再用 `batch_search` 并行。每个查询结果更容易判断是否真正回答了目标问题。

### 8.4 API Key 和隐私

你已经配置了 API Key，Skill 会优先从 `.env` 读取；没有 Key 时也可匿名访问，但限额较低。官方控制台可管理 Key。[[2]](https://raw.githubusercontent.com/anysearch-ai/anysearch-skill/main/SKILL.md) [[3]](https://anysearch.com/console/api-keys)

不要把密码、个人隐私、未公开商业资料、内部 Token 或完整客户数据放进搜索查询。搜索词、URL 和 API Key 会发送到 AnySearch API；是否使用该服务，应以你对服务方的信任和组织安全规则为准。[[2]](https://raw.githubusercontent.com/anysearch-ai/anysearch-skill/main/SKILL.md)

## 附：一页速查表

```text
普通查询：
python "$HOME\.codex\skills\anysearch\scripts\anysearch_cli.py" search "问题" --max_results 5

垂直查询：
1. get_sub_domains --domain <domain>
2. search "问题" --domain <domain> --sub_domain <返回值> --sdp <返回的参数>

批量查询：
batch_search --queries '[{"query":"q1"},{"query":"q2"}]'

全文提取：
extract "https://example.com/page"

推荐判断：
开放式事实 -> search
金融/学术/安全/代码等领域 -> get_sub_domains -> search
多个独立问题 -> batch_search
已有明确 URL -> extract
重要结论 -> 搜索 -> 提取原文 -> 复核 -> 回答
```

## 数据来源 / 参考资源

- [1] AnySearch Skill README：<https://github.com/anysearch-ai/anysearch-skill#readme>
- [2] AnySearch Skill 行为规范 `SKILL.md`：<https://raw.githubusercontent.com/anysearch-ai/anysearch-skill/main/SKILL.md>
- [3] AnySearch API Key 控制台：<https://anysearch.com/console/api-keys>
- [4] AnySearch MCP Server README：<https://github.com/anysearch-ai/anysearch-mcp-server#readme>

> 说明：文中命令参数和流程规则来自 AnySearch 官方仓库及控制台；带“示意”的查询值只用于教学，不是服务能力或效果承诺。

## 全文总结

AnySearch Skill 的核心不是单次搜索，而是“选择路径、获取参数、执行检索、提取原文、复核证据”的流水线。普通问题使用 `search`，领域问题先 `get_sub_domains`，多个独立问题使用 `batch_search`，已有页面则使用 `extract`。最重要的质量提升来自明确查询意图、优先原始来源和对关键结论进行二次核验。你当前已经配置 API Key、Python 依赖和 Python 运行时，可以直接让 Codex 按这条流水线工作。

## 自测

1. 查一个股票报价时，为什么不能直接猜 `sub_domain`？
2. 已经有官方文档 URL 时，应该用 `search` 还是 `extract`？
3. “比较三款产品的官方定价”适合用哪种命令？
4. 对一个重要且容易变化的结论，为什么要从搜索摘要继续走到全文提取？
