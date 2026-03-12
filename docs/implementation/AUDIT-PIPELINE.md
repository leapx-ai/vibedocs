# Audit Pipeline

Last Updated: 2026-03-13
Status: Active

## 1. 目标

这份文档解释当前 `vibedocs audit` 的执行流水线，以及后续如何把 `Heuristic Semantic Audit` 接入同一条链路。

这不是用户手册，而是给仓库维护者看的实现解读。

## 2. 当前执行链路

当前 `audit` 的执行顺序可以压缩成 6 步：

1. CLI 解析参数
2. 解析项目根与配置
3. 构建仓库上下文
4. 执行 core rules
5. 生成 report envelope
6. 输出文本或写盘

对应代码入口：

- `src/commands/audit.js`
- `src/api/run-audit.js`
- `src/rule-engine/context.js`
- `src/rule-engine/run-rules.js`
- `src/rule-engine/core-rules.js`
- `src/reporting/create-report.js`
- `src/reporting/format-results.js`
- `src/reporting/write-report.js`

## 3. 模块分工

### 3.1 Command Layer

文件：[audit.js](/Users/berlin/workspace/vibecoding-template/src/commands/audit.js)

职责：

- 解析命令行参数
- 收集 `--format`、`--output`、`--changed`、`--rule-pack`
- 调用 `runAudit`
- 选择输出格式
- 根据结果决定退出码

这一层不负责规则判断，只负责 I/O 和命令行适配。

### 3.2 API Layer

文件：[run-audit.js](/Users/berlin/workspace/vibecoding-template/src/api/run-audit.js)

职责：

- 解析 `projectRoot`
- 读取配置文件
- 合并 rule packs
- 决定执行上下文：
  - `repository`
  - `diff`
- 构建 repository context
- 调用规则执行器
- 返回统一 report

这一层是“编排层”，决定整个 pipeline 怎么串起来。

### 3.3 Context Layer

文件：[context.js](/Users/berlin/workspace/vibecoding-template/src/rule-engine/context.js)

职责：

- 解析 `docsDir`
- 递归扫描 `docs/**/*.md`
- 读取 markdown 文件内容
- 提取轻量 metadata
- 归一化 `changedPaths`
- 输出 `files`、`docsExists`、`mode` 等执行输入

当前上下文模型偏轻，特点是：

- 不解析完整 markdown AST
- 不拆 section block
- 主要服务确定性规则

## 4. 当前数据流

### 4.1 输入

输入来自三类来源：

- CLI 参数
- 项目配置
- 文件系统文档内容

关键输入字段：

- `targetPath`
- `cwd`
- `changedPaths`
- `rulePackPaths`

### 4.2 中间态

当前最核心的中间态是 repository context。

主要字段：

- `projectRoot`
- `docsDir`
- `docsExists`
- `files`
- `changedPaths`
- `selectedPaths`
- `mode`

其中 `files` 是一份按相对路径索引的文档表。

### 4.3 输出

输出是统一 report envelope，结构定义在：

- [create-report.js](/Users/berlin/workspace/vibecoding-template/src/reporting/create-report.js)

核心字段：

- `schemaVersion`
- `tool`
- `run`
- `summary`
- `results`

这层设计的价值是：后面无论接 CLI、PR 检查还是自动巡检，消费的数据结构都不必改。

## 5. 当前规则阶段

当前只有一个规则阶段：

- `coreRules`

执行器在：

- [run-rules.js](/Users/berlin/workspace/vibecoding-template/src/rule-engine/run-rules.js)

特点：

- 顺序执行
- 根据 `context.mode` 过滤规则
- 支持本地 rule pack 覆盖
- 只处理确定性规则

当前 `coreRules` 主要覆盖：

- 结构基线
- metadata 完整性
- SSOT 基础收口
- feature package 完整性
- 术语表与术语漂移
- snapshot 入口引用
- diff docs touchpoint

## 6. 当前实现的优点与边界

### 6.1 优点

- 结构清楚，模块边界简单
- 本地运行稳定
- 结果结构统一
- 已支持 `repository` / `diff` 两种关键上下文
- 适合后续接 PR 检查与定时巡检

### 6.2 边界

当前 pipeline 的弱点主要不在 command 层，而在 context 和 rule granularity：

- context 只有文档级，没有 section 级
- 规则只能看显式结构，难以发现语义错位
- 无法对“内容放错位置”给出高质量判断
- 无法稳定发现 feature package 对全局规则的重复定义

这也是后面要引入 `Heuristic Semantic Audit` 的原因。

## 7. 推荐的未来执行链路

未来建议把 pipeline 扩成 8 步：

1. CLI 解析参数
2. 解析项目根与配置
3. 构建 repository context
4. 执行 `coreRules`
5. 构建 semantic index
6. 执行 `heuristic semantic checks`
7. 合并结果
8. 生成并输出 report

一句话：

从“文档级结构检查”升级到“文档级结构检查 + section 级内容巡检”。

## 8. 新增层建议放在哪里

推荐新增一个独立目录，而不是把语义检查硬塞进 `core-rules.js`：

```text
src/
  semantic-audit/
    index.js
    section-parser.js
    role-profiles.js
    semantic-checks.js
    similarity.js
    status-leakage.js
```

原因：

- `coreRules` 负责确定性治理
- `semantic-audit` 负责启发式内容巡检
- 两者语义不同，不应该混在同一文件里膨胀

## 9. 推荐的数据扩展点

### 9.1 Context 不直接膨胀成全功能 AST

建议保持 `buildRepositoryContext` 继续负责“轻量仓库上下文”，不要在这里直接引入大量 markdown 解析逻辑。

原因：

- 不是所有命令都需要 section 级结构
- glossary check 与基础 audit 仍然适合走轻量路径
- 避免 context builder 变成巨型入口

### 9.2 新增 Semantic Index

推荐新增一个单独的中间层：

- `semanticIndex`

它由 `repository context` 派生，而不是替代它。

建议字段：

- `documents`
- `sections`
- `tables`
- `tokenIndex`
- `roleAssignments`
- `featurePackageMap`

这种设计能保持：

- 基础 audit 继续轻
- semantic audit 按需启用

## 10. 推荐的 API 形状

建议把 `runAudit` 扩成：

```js
runAudit(targetPath, cwd, {
  changedPaths,
  rulePackPaths,
  semantic: "off" | "heuristic"
})
```

默认值建议：

- `semantic: "off"`

原因：

- 当前免费层先保证稳定
- 启发式语义检查误报不可避免
- 后续可以先在本地显式开启，再逐步变成默认项

## 11. 推荐的执行顺序与退出码

### 11.1 执行顺序

建议固定为：

1. `coreRules`
2. `heuristic semantic checks`

不要反过来。

原因：

- 先让结构基线成立
- 再做内容级判断
- 避免在明显缺文档的仓库里跑一堆低价值语义检查

### 11.2 退出码

建议第一版保持：

- `core fail` 影响退出码
- `semantic warn` 不影响退出码

这样能避免：

- 启发式误报直接阻断开发
- 免费层过早变成难以使用的强门禁工具

## 12. 推荐的第一批 semantic checks

第一批建议只做高价值、低歧义的 6 条：

1. `engineering` 文档中出现明显 `product` 内容块
2. `product` 文档中出现明显 `engineering` 内容块
3. 非状态 SSOT 文档出现明显状态泄漏段
4. feature package 重定义全局产品原则
5. feature package 出现 glossary-like table
6. 两个不同角色文档存在高相似定义段

原因：

- 这 6 条最贴近当前系统边界
- 可解释性较强
- 误报可控

### 当前实现状态

截至 `2026-03-13`，已经接入 `audit --semantic heuristic` 的检查有：

1. `semantic.role.product_content_in_engineering_doc`
2. `semantic.role.engineering_content_in_product_doc`
3. `semantic.ssot.status_leakage`
4. `semantic.ssot.feature_redefines_global_principles`
5. `semantic.terminology.local_glossary_like_table`
6. `semantic.similarity.duplicate_definition_sections`

这些检查当前都只产出 `warn`，不会改变 CLI 的退出码策略。

## 13. 实现建议：不要一次重写现有 audit

推荐采用增量式改造。

### Phase 1

- 保持现有 `runAudit` 主结构不变
- 新增 `semantic` 参数
- 新增 `semantic-audit/` 目录
- 先实现 `section-parser`

### Phase 2

- 新增 `buildSemanticIndex`
- 新增 2 到 3 条最稳的 semantic checks
- 把结果并入现有 report

### Phase 3

- 扩充 role profiles
- 新增 similarity checks
- 补测试 fixture 和误报样本

## 14. 一句话结论

当前 `audit` 已经是一条合格的确定性治理流水线。

下一步不该推翻它，而是围绕它补一层可选的 `semantic index + heuristic checks`，把文档治理从“结构成立”推进到“内容大概率放对位置”。
