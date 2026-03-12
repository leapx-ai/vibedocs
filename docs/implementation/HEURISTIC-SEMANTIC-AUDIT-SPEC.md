# Heuristic Semantic Audit Spec

Last Updated: 2026-03-13
Status: Active

## 1. 目标

这份文档定义一套不依赖 `LLM` 的 `Semantic Audit` 实现思路。

这里的 `Semantic` 不是“真正理解全文语义”，而是：

- 把文档拆成结构化内容块
- 给不同文档角色建立内容特征
- 用启发式信号、相似度和事实槽位，逼近“内容是否放对位置”的判断

这份文档主要服务仓库内部实现，不属于 VibeDocs 面向用户的公开方法论内容。

## 2. 为什么需要这一层

当前 `Rule Engine` 已经能处理确定性问题：

- 最小文档集是否存在
- `DOCUMENT-MAP` 是否存在
- 是否出现多个状态来源
- feature package 是否缺关键文件
- glossary 是否存在
- snapshot 是否误挂在活跃入口

这些规则适合做结构治理，但它们有一个明显边界：

- 能发现“结构上明显错误”
- 很难发现“结构看起来合法，但内容语义放错地方”

典型例子：

- 在 `TECH-SPEC` 里写大量需求范围和用户场景
- 在 feature package 里重复定义全局产品原则
- 在普通说明文档里偷偷维护当前迭代状态
- 在多个文档里用不同措辞重复定义同一业务规则

这一层的目标，就是在不引入 `LLM` 的前提下，把这些问题尽量提前暴露出来。

## 3. 在整体架构中的位置

推荐的审查链路是三层：

1. `Rule Engine`
2. `Heuristic Semantic Audit`
3. `LLM Semantic Audit`（可选增强层）

职责边界：

- `Rule Engine`：检查确定性、结构性、可复现的问题
- `Heuristic Semantic Audit`：检查内容模式、重复定义、错位信号
- `LLM Semantic Audit`：处理高歧义、跨段推理、边界裁决

一句话：

`Rule Engine` 是守门员，`Heuristic Semantic Audit` 是内容巡检器，`LLM Semantic Audit` 是高级审稿人。

## 4. 设计原则

### 4.1 Local First

这一层必须纯本地运行，不依赖外部模型或远程 API。

### 4.2 Explainable

任何判断都必须能说明：

- 触发了哪些内容信号
- 哪些 section 或段落有问题
- 为什么认为它更像另一类文档

### 4.3 Weak Semantics, Strong Signals

不假装自己“理解了语义”。

实现上依赖的是：

- heading
- section 名
- 关键词模式
- 内容块结构
- 表格字段
- 多文档相似度
- 事实槽位冲突

### 4.4 Section First

检查粒度不应是整篇文档，而应是：

- frontmatter / metadata
- heading section
- table
- checklist
- fenced code block

整篇文档分类过粗，section 粒度更适合定位错位内容。

### 4.5 Works with Role Contracts

这一层依赖“文档角色契约”，而不是脱离规则引擎独立工作。

也就是说，它必须消费：

- 文档角色定义
- 允许内容模式
- 禁止内容模式
- SSOT 归属声明

## 5. 核心问题模型

第一版建议只检查 5 类问题：

1. `Role Misplacement`
2. `SSOT Duplication`
3. `Global Rule Leakage`
4. `Status Leakage`
5. `High Similarity Conflict`

### 5.1 Role Misplacement

某个 section 的内容模式更像另一类文档角色。

例如：

- `TECH-SPEC` 中出现大段“目标用户 / 用户问题 / 范围 / 非目标”
- `PRD` 中出现大量接口字段表、状态迁移、错误码

### 5.2 SSOT Duplication

多个文档在重复定义同一类关键事实。

例如：

- 多个文档并行描述当前阶段状态
- 多个文档并行定义同一个核心术语
- 多个文档并行维护同一业务规则摘要

### 5.3 Global Rule Leakage

局部文档重复定义本应由全局文档维护的规则。

例如：

- feature package 重写全局 glossary
- feature package 重写全局产品原则
- feature package 重写全局状态策略

### 5.4 Status Leakage

状态信息没有用显式状态 heading，但内容模式已经表现出“在维护进度”。

例如：

- “已完成 / 进行中 / 下一步 / 阻塞项”
- “本周完成 / 下周计划”
- “当前进展 / 下一阶段”

### 5.5 High Similarity Conflict

两份文档或两个 section 的内容高度相似，但文件角色不同，且都像在定义同一问题。

例如：

- feature `PRD` 和全局 `FEATURE-PRD`
- feature `TECH-SPEC` 和全局 `TECH-SPEC`
- 某说明文档与 `ROADMAP-STATUS` 中的状态段高度重复

## 6. 输入与中间模型

### 6.1 输入

第一版输入建议复用当前 `buildRepositoryContext` 的输出，再补结构化内容块：

- `projectRoot`
- `docsDir`
- `files`
- `selectedPaths`
- `changedPaths`
- `mode`

每个文档需要新增：

- `docRole`
- `docFamily`
- `sections`
- `tables`
- `lists`
- `tokens`

### 6.2 文档角色识别

文档角色优先通过路径识别：

- `docs/governance/*` -> `governance`
- `docs/strategy/*` -> `strategy`
- `docs/product/*` -> `product`
- `docs/design/*` -> `design`
- `docs/engineering/*` -> `engineering`
- `docs/delivery/*` -> `delivery`
- `docs/operations/*` -> `operations`
- `docs/features/<slug>/*` -> `feature-package`

### 6.3 内容块模型

建议把每个 markdown 文件拆成：

- `metadataBlock`
- `sectionBlocks`
- `tableBlocks`
- `listBlocks`

每个 `sectionBlock` 至少包含：

- `heading`
- `depth`
- `body`
- `tokens`
- `lineStart`
- `lineEnd`
- `features`

## 7. 文档角色内容契约

这一层不做完全自由判断，而是建立“角色画像”。

### 7.1 Governance

允许信号：

- `SSOT`
- `term`
- `definition`
- `glossary`
- `ownership`
- `boundary`
- `decision`

禁止信号：

- `API`
- `schema`
- `endpoint`
- `component states`
- `iteration status`

### 7.2 Strategy

允许信号：

- `goal`
- `priority`
- `roadmap`
- `stage`
- `not now`
- `success signal`

禁止信号：

- `field`
- `request/response`
- `DB schema`
- `error code`

### 7.3 Product

允许信号：

- `user`
- `scenario`
- `scope`
- `non-goals`
- `business rule`
- `acceptance`

禁止信号：

- `SQL`
- `endpoint`
- `data model`
- `deployment steps`

### 7.4 Engineering

允许信号：

- `API`
- `schema`
- `state machine`
- `data model`
- `error handling`
- `compatibility`

禁止信号：

- `target user`
- `go-to-market`
- `priority next cycle`

### 7.5 Delivery

允许信号：

- `acceptance`
- `regression`
- `checklist`
- `task`
- `verification`

禁止信号：

- `long-term vision`
- `glossary authority`

### 7.6 Operations

允许信号：

- `analytics`
- `dashboard`
- `release`
- `runbook`
- `rollback`
- `incident`

禁止信号：

- `core product scope`
- `API ownership`

### 7.7 Feature Package

允许：

- feature-specific `PRD`
- feature-specific `WIREFLOW`
- feature-specific `TECH-SPEC`
- feature-specific `ACCEPTANCE`
- feature-specific `ANALYTICS`

禁止：

- 全局 glossary 表
- 全局 roadmap/status
- 全局 product principles
- 全局 architecture constitution

## 8. 启发式检查方法

### 8.1 Section Classifier

对每个 `sectionBlock` 计算角色匹配分数：

- `roleFitScore`
- `forbiddenSignalScore`
- `crossRoleSignalScore`

规则示例：

- 如果某 section 位于 `engineering` 文档，但 `product` 信号高、`engineering` 信号低，则记为 `Role Misplacement`
- 如果某 section 位于 feature package，但出现全局 governance 信号，则记为 `Global Rule Leakage`

### 8.2 Heading Contract Check

检查 heading 是否落在合理角色中。

示例：

- `## Target Users` 更像 `product`
- `## API Contract` 更像 `engineering`
- `## Done / In Progress / Blocked / Next Up` 更像 `strategy`

这不是唯一依据，但可以作为高权重信号。

### 8.3 Table Signature Check

表格结构是很强的内容信号。

示例：

- `| Field | Type | Required |` 更像工程契约
- `| Term | Definition | Banned Synonyms |` 更像 glossary
- `| Event | Trigger | Property |` 更像 analytics

如果这类表格出现在错误文档中，应给出 `warn`。

### 8.4 Status Leakage Detector

不只检查固定 heading，也检查进度模式词。

词组示例：

- `已完成`
- `进行中`
- `阻塞`
- `下一步`
- `本周完成`
- `下周计划`
- `当前进展`
- `milestone status`

如果这些模式在非状态 SSOT 文档中高频出现，应报 `warn`。

### 8.5 Similarity Detector

对 section 级内容计算相似度。

第一版可用：

- token overlap
- TF-IDF cosine similarity
- n-gram overlap

用途：

- 找出高度重复 section
- 判断局部文档是否在拷贝全局定义
- 判断多个文档是否在并行维护同一事实

### 8.6 Fact Slot Extractor

从 section 中提取关键槽位：

- `status terms`
- `owner`
- `scope`
- `non-goals`
- `acceptance bullets`
- `event names`
- `API objects`

如果相同槽位在多个文档里冲突，说明很可能没有收口。

## 9. 输出结果模型

建议在现有规则结果上新增一类来源：

- `engine: "heuristic-semantic"`

结果字段可复用现有结构：

- `rule_id`
- `status`
- `severity`
- `category`
- `target`
- `context`
- `reason`
- `evidence`
- `suggested_docs`
- `suggestion`
- `owner_hint`
- `snapshot_key`

同时补两类解释字段：

- `semantic_type`
- `trigger_signals`

示例：

```json
{
  "rule_id": "semantic.role.product_content_in_engineering_doc",
  "status": "warn",
  "severity": "medium",
  "category": "semantic",
  "target": "docs/engineering/TECH-SPEC.md#Target Users",
  "context": "repository",
  "semantic_type": "role_misplacement",
  "reason": "This section looks more like product scope than engineering implementation.",
  "trigger_signals": [
    "heading: Target Users",
    "tokens: user, scenario, scope, non-goals",
    "missing engineering signals"
  ],
  "suggestion": "Move this section into FEATURE-PRD or reduce it to implementation impact only."
}
```

## 10. 与现有 Rule Engine 的集成方式

推荐不要把这一层直接塞进 `coreRules`。

更稳的方式是：

1. 保留现有 `coreRules` 负责硬约束
2. 新增 `semanticChecks` 管道
3. 最终把两类结果合并成统一 report

推荐接口：

- `runAudit(..., { semantic: "off" | "heuristic" | "full" })`

第一版只实现：

- `off`
- `heuristic`

### 10.1 运行顺序

1. 构建 repository context
2. 跑 `coreRules`
3. 若启用 `heuristic`，构建 section index
4. 跑 semantic checks
5. 合并结果并生成 report

### 10.2 退出码策略

第一版建议：

- `core fail` 仍决定退出码
- `heuristic semantic` 默认只产出 `warn`

原因：

- 启发式误报不可避免
- 它更适合做内容巡检和人工复核提示

## 11. 第一版建议实现的规则

建议只做 6 条，避免一次做太宽：

1. `semantic.role.product_content_in_engineering_doc`
2. `semantic.role.engineering_content_in_product_doc`
3. `semantic.ssot.status_leakage`
4. `semantic.ssot.feature_redefines_global_principles`
5. `semantic.terminology.local_glossary_like_table`
6. `semantic.similarity.duplicate_definition_sections`

### 当前实现状态

截至 `2026-03-13`，下面 6 条已有第一版代码实现：

- `semantic.role.product_content_in_engineering_doc`
- `semantic.role.engineering_content_in_product_doc`
- `semantic.ssot.status_leakage`
- `semantic.ssot.feature_redefines_global_principles`
- `semantic.terminology.local_glossary_like_table`
- `semantic.similarity.duplicate_definition_sections`

第一版实现目标不是“覆盖所有内容错位”，而是先把最稳、最容易解释、最不容易误报的局部规则跑通。

## 12. 已知边界

这一层仍然不是“真正理解”。

它无法可靠处理：

- 高度抽象的边界判断
- 隐喻式表达
- 大跨度上下文依赖
- 难以从关键词或结构判断的内容归属

所以它只能回答：

- “这段内容很像放错了地方”
- “这两段内容很可能在重复定义”
- “这里很可能在泄漏全局规则”

而不是：

- “这一定是错的”

## 13. 落地顺序

### Phase 1

- markdown section parser
- role profiles
- heading contract check
- status leakage detector

### Phase 2

- table signature check
- similarity detector
- duplicate definition detection

### Phase 3

- fact slot extractor
- richer feature package leakage checks
- report UX refinement

## 14. 一句话结论

`Heuristic Semantic Audit` 不是 LLM 的替代品，而是介于结构规则和 LLM 审查之间的本地内容巡检层。

它的价值不在于“完全理解文档”，而在于：

- 用可解释、可复现、可本地运行的方式
- 把高概率的内容错位和 SSOT 漂移尽早暴露出来
- 为后续是否接入 LLM 审查打好中间层基础
