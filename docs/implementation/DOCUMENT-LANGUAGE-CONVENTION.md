# Document Language Convention

Last Updated: 2026-03-13
Status: Active

## 1. Goal

这份文档定义 VibeDocs 生成文档的语言约定。

目标不是要求所有内容都写英文，而是把“机器可依赖的结构层”和“团队协作的正文层”拆开。

一句话原则：

- 给 AI、parser、CLI 和规则引擎依赖的结构，一律保持英文
- 给团队阅读、讨论和沉淀的正文，可以按团队语言编写

## 2. Structure Layer

以下内容属于结构层，应保持英文：

- file names and paths
- metadata keys
- section headings
- reserved status headings
- table headers that carry schema meaning
- prompt labels inside reusable templates

当前仓库中的典型例子：

- `Last Updated:`
- `Status:`
- `Owner:`
- `Purpose:`
- `Scope:`
- `Non-Goals:`
- `Update Triggers:`
- `Linked SSOT:`
- `Done / In Progress / Blocked / Next Up`

## 3. Narrative Layer

以下内容属于正文层，可以保持中文：

- Purpose / Scope 等字段后的解释内容
- 每个 section 里的自然语言说明
- 背景、问题、风险、决策、验收说明
- 表格单元格里的项目具体内容

示例：

```md
Status: Active
Owner: Berlin
Last Updated: 2026-03-13

## 1. Background

- User Problem: 用户需要更快进入专注状态
- Current Cost: 当前需要多个操作才能开始
```

这里：

- `Status / Owner / Last Updated / Background / User Problem / Current Cost` 是结构层
- 冒号后的自然语言内容是正文层

## 4. Why This Split

这样拆分有三个直接收益：

1. parser 和 rule engine 不需要做 locale 分支
2. AI 更容易稳定识别文档结构和角色边界
3. 团队仍然可以用中文高效沉淀业务和实现细节

## 5. Current Enforcement

当前仓库已经基于这个约定更新了两类运行时资产：

- `scaffold/docs/`
- `templates/`

同时，代码层已经继续按英文结构字段解析：

- `src/filesystem/placeholders.js`
- `src/rule-engine/context.js`
- `src/rule-engine/core-rules.js`

## 6. Non-Goals

这份约定当前不包含：

- 中文结构字段的 locale 支持
- 自动把正文从中文翻译成英文
- 面向外部用户的完整多语言模板系统

如果未来需要 `--locale zh|en`，应在不破坏英文结构 contract 的前提下做显式扩展，而不是让 parser 猜测字段语言。
