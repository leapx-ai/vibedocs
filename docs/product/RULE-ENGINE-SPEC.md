# 共享规则引擎规格

Last Updated: 2026-03-12
Status: Active

## 1. 目标

定义一套可被 `CLI`、`PR 检查`、`自动巡检`、`健康度面板` 共用的规则引擎规格。

这份文档解决的问题不是“有哪些文档规则”，而是：

- 规则如何被统一表达
- 规则如何在不同执行场景复用
- 本地检查与付费工作流如何共享同一判断逻辑
- 哪些规则属于开源基础规则，哪些属于团队增强规则

如果没有共享规则层，产品会很快出现四套不同实现：

- CLI 自己一套判断
- PR 检查自己一套判断
- 自动巡检自己一套判断
- 面板统计自己一套字段

这会直接导致结果不一致和维护成本失控。

## 2. 定位

共享规则引擎不是独立产品，而是整条产品线的基础设施层。

它位于：

- 上层：`CLI`、`PR 检查`、`自动巡检`
- 下层：文件系统、Markdown 文档、仓库变更、配置文件

一句话：

`Rule Engine is the single execution core behind every document check.`

## 3. 设计原则

### 3.1 Single Judgment Logic

同一个问题只允许一套判断逻辑。

例如：

- “缺少最小起步文档”不能在 CLI 和 PR 检查里分别写两套判断
- “Active 文档缺少元信息”不能在自动巡检里换一套字段名

### 3.2 Multiple Execution Contexts

同一条规则必须能在不同上下文运行：

- 全仓扫描
- PR diff 扫描
- 定时扫描
- 指定目录扫描

### 3.3 Local First, Cloud Extendable

规则引擎基础能力必须可以纯本地运行。

付费层增加的是：

- 托管执行
- 团队规则包
- 历史聚合
- 通知与面板

不是另一套私有规则语义。

### 3.4 Explainable Output

每条规则输出必须能回答：

- 为什么触发
- 影响了什么
- 建议改什么
- 严重程度是多少

不能只返回一个神秘分数。

### 3.5 Stable Result Shape

无论在哪个执行环境里，规则结果结构都必须稳定。

这样 CLI、PR 评论器、面板、周报才能共享同一份结果数据。

## 4. 执行上下文

规则引擎第一版至少支持 4 种上下文：

### 4.1 Repository Context

全仓扫描。

适用：

- `vibedocs audit`
- 自动巡检
- 健康度快照

### 4.2 Diff Context

只针对变更文件和受影响文档扫描。

适用：

- PR 检查
- pre-merge gate

### 4.3 Path Context

只扫描指定目录或指定文档族。

适用：

- `glossary check`
- feature package 局部扫描

### 4.4 Snapshot Context

读取历史规则结果做趋势聚合。

适用：

- 健康度面板
- 周报

注意：

- `Snapshot Context` 依赖历史存储，属于付费工作流消费层
- 规则计算本身仍应来自同一个引擎

## 5. 规则对象模型

每条规则至少包含下面字段：

| 字段 | 含义 |
|---|---|
| `id` | 稳定规则 ID |
| `title` | 简短规则名 |
| `summary` | 一句话解释 |
| `scope` | 作用范围，如 governance / strategy / repo / feature |
| `contexts` | 支持的执行上下文 |
| `severity` | 默认严重级别 |
| `category` | 规则类别 |
| `inputs` | 规则需要哪些输入 |
| `check` | 触发条件 |
| `message` | 结果描述模板 |
| `suggestion` | 建议动作模板 |
| `source` | `core` 或 `team-pack` |

## 6. 结果对象模型

每次规则命中后，至少输出：

| 字段 | 含义 |
|---|---|
| `rule_id` | 对应规则 ID |
| `status` | `pass / warn / fail / skip` |
| `severity` | `info / low / medium / high / critical` |
| `category` | 规则类别 |
| `target` | 命中的文件、目录、feature 或 repo |
| `context` | 本次运行上下文 |
| `reason` | 为什么命中 |
| `evidence` | 相关文件或字段证据 |
| `suggestion` | 修复建议 |
| `owner_hint` | 建议负责人角色 |
| `snapshot_key` | 用于历史聚合的稳定标识 |

## 7. 规则分类

第一版建议分 5 类：

### 7.1 Structure Rules

检查文档结构是否成立。

例如：

- 最小起步文档是否存在
- 目录是否放错角色
- feature package 是否缺关键文件

### 7.2 Metadata Rules

检查文档元信息是否完整。

例如：

- Active 文档是否有 `Last Updated`
- 是否缺 `Purpose / Scope / Non-Goals`
- 状态字段是否合法

### 7.3 SSOT Rules

检查单一事实源是否冲突。

例如：

- 多个文档重复维护当前状态
- 文档地图中没有为关键问题指定 SSOT
- 功能包重复定义全局规则

### 7.4 Freshness Rules

检查文档是否失真。

例如：

- 长期未更新但仍标记 Active
- 历史稿仍被入口引用
- Release Notes 和实际状态断层

### 7.5 Terminology Rules

检查术语漂移和口径冲突。

例如：

- `Glossary` 未定义核心术语
- 同一概念在多个文档里混用
- 历史词汇仍被 Active 文档继续使用

## 8. 严重级别模型

建议统一用 5 档：

- `info`：提示性信息，不影响流程
- `low`：轻微偏差，建议修正
- `medium`：明确问题，应该尽快处理
- `high`：影响协作质量，PR 可提示阻断
- `critical`：破坏核心治理，默认阻断

默认示例：

- 缺 `Last Updated`：`low`
- 缺 `DOCUMENT-MAP`：`high`
- 多个文档重复维护 SSOT：`high`
- PR 改了 Spec 对应代码却没改文档：`high`
- 文档入口完全失效：`critical`

## 9. 开源与付费的规则边界

### 9.1 开源核心规则

开源层负责：

- 通用结构规则
- 通用元信息规则
- 基础 SSOT 规则
- 基础术语规则
- 本地执行器
- 标准结果格式

### 9.2 付费增强规则

付费层负责：

- 团队规则包
- 角色特定门禁
- PR 阻断策略
- 自动巡检策略
- 历史趋势聚合规则

### 9.3 Mixed 边界

规则语义和基础执行器应开源。

规则组合策略、团队包、托管执行和历史分析可以收费。

## 10. 第一版内置规则

第一版不应该追求规则数量，而应先覆盖高频痛点。

建议先做这 8 条：

1. `core.structure.minimal_docs_exist`
2. `core.metadata.active_doc_required_fields`
3. `core.ssot.document_map_exists`
4. `core.ssot.single_status_source`
5. `core.structure.feature_package_required_files`
6. `core.terminology.glossary_exists`
7. `core.terminology.glossary_term_drift`
8. `core.freshness.snapshot_not_used_as_active`

## 11. CLI 如何消费规则结果

CLI 应该：

- 输出按严重级别分组的摘要
- 输出每条问题对应的文件和建议动作
- 支持 `--format text|json|markdown`

CLI 不应：

- 自己定义另一套结果结构
- 在命令层硬编码规则判断

## 12. PR 检查如何消费规则结果

PR 检查应基于同一结果结构，增加：

- diff 相关上下文
- 受影响文件映射
- 阻断阈值

PR 层负责决定：

- 哪些级别会评论
- 哪些级别会阻断

它不负责重写规则判断逻辑。

## 13. 自动巡检与面板如何消费规则结果

自动巡检负责：

- 定时执行规则
- 保存结果快照
- 触发通知

健康度面板负责：

- 聚合历史结果
- 展示趋势和风险分布
- 追踪长期未解问题

所以顺序上应当是：

1. 规则引擎
2. PR 检查 / 自动巡检
3. 健康度面板

没有规则结果和定时快照，面板就只是空壳。

## 14. 非目标

第一版共享规则引擎不负责：

- 在线富文本编辑
- 自动改写整份文档内容
- 复杂语义推理或通用 LLM 代理编排
- 企业级审批流

## 15. 落地顺序

### Phase 1

- 定义规则模型
- 定义结果格式
- 实现 8 条核心规则
- 先接入 `CLI audit`

### Phase 2

- 接入 `PR 检查`
- 接入自动巡检
- 加入 diff context

### Phase 3

- 接入健康度面板
- 支持团队规则包
- 支持历史趋势分析

## 16. 结论

共享规则引擎是整个产品线的基础层。

它决定：

- CLI 和付费工作流是否会说同一种“规则语言”
- 用户是否会得到一致的检查结果
- 后续产品扩展是否还能保持低重复开发成本

所以它不应被当成附属细节，而应被视为 `free layer complete` 和 `paid workflows begin` 之间的必经层。
