# VibeCoding 文档结构与内容研究

Last Updated: 2026-03-11
Status: Active

## 1. 研究目标

这份文档研究两个问题：

1. 一套能支撑 VibeCoding 全生命周期的文档系统，结构上应该长什么样
2. 每一类文档里，最小但足够的内容到底是什么

这里不讨论某个具体产品，而是抽象普通开发者最常遇到的混乱：

- 只有零散 prompt，没有稳定上下文
- 有文档，但不知道哪份才算 SSOT
- 有 PRD，没有 Spec 和验收
- 有任务拆分，没有原则、术语和发布口径
- 文档越写越多，但越来越不能指导 AI 和开发

## 2. 核心结论

完整文档系统不能只按 `system / module / task` 来组织。

这个三层模型只回答一件事：

- 工作如何拆解实现

但一个完整项目至少还要回答六件事：

- 为什么做
- 现在先做什么
- 具体做成什么
- 用户如何感知
- 做完如何验证
- 上线后如何运营

所以最稳的模型不是单轴树，而是矩阵：

- 横轴：文档角色
- 纵轴：生命周期阶段

## 3. 文档结构模型

### 3.1 七个文档角色

推荐的完整角色如下：

1. `governance`
2. `strategy`
3. `product`
4. `design`
5. `engineering`
6. `delivery`
7. `operations`

它们分别回答：

| 文档角色 | 主要回答的问题 | 典型文档 |
|---|---|---|
| `governance` | 谁说了算，术语和边界是什么 | constitution, document-map, glossary |
| `strategy` | 为什么做，阶段目标是什么 | vision, principles, roadmap-status |
| `product` | 要做什么，不做什么，业务规则是什么 | prd, business-rules |
| `design` | 用户如何感知，页面和文案如何表达 | ui-style-guide, wireflow, copy-guide |
| `engineering` | 系统如何实现，契约和状态机是什么 | tech-spec, api-spec, data-model |
| `delivery` | 这一轮如何推进和验收 | task-library, acceptance, regression |
| `operations` | 如何上线、对账、观测、复盘 | analytics, runbook, release-notes, postmortem |

### 3.2 六个生命周期阶段

推荐的项目阶段如下：

1. `discover`
2. `decide`
3. `define`
4. `build`
5. `verify`
6. `operate`

映射关系：

| 阶段 | 主要问题 | 需要重点活跃的文档 |
|---|---|---|
| `discover` | 这是个真问题吗 | strategy, product |
| `decide` | 我们选什么，不选什么 | governance, strategy, engineering |
| `define` | 具体做成什么 | product, design, engineering |
| `build` | 这一轮怎么推进 | delivery, engineering |
| `verify` | 做出来是否正确 | delivery, product, operations |
| `operate` | 上线后如何维持闭环 | operations, strategy |

## 4. 内容模型：每类文档最小应该包含什么

研究的关键不只是目录，而是内容边界。

### 4.1 所有 Active 文档都应有的元信息

任何会长期维护的文档，至少都应包含：

- `Last Updated`
- `Status`
- `Owner` 或默认负责人角色
- `Purpose`
- `Scope`
- `Non-Goals`
- `Update Triggers`
- `Linked SSOT`

如果连这些都没有，文档很容易退化成孤岛。

### 4.2 Governance 文档的最小内容

Governance 文档必须定义：

- 文档分工和 SSOT 规则
- 术语解释和禁用歧义词
- 架构边界和质量底线
- 决策留痕规则

不应承载：

- 具体功能范围
- 迭代进度
- 页面细节

### 4.3 Strategy 文档的最小内容

Strategy 文档必须定义：

- 当前阶段目标
- 优先级排序
- 暂不做什么
- 判断成败的指标或信号

不应承载：

- 工程实现细节
- 字段和接口定义
- 逐条任务清单

### 4.4 Product 文档的最小内容

Product 文档必须定义：

- 用户问题
- 目标用户与场景
- 功能范围
- 业务规则
- 验收口径
- 边界与不做什么

不应承载：

- 代码组织方式
- 当前谁在做什么

### 4.5 Design 文档的最小内容

Design 文档必须定义：

- 页面层级
- 关键状态
- 组件表现
- 文案口径
- 空态/错误态/限制态

不应承载：

- 业务规则的最终版本
- 数据结构和接口字段

### 4.6 Engineering 文档的最小内容

Engineering 文档必须定义：

- 系统边界
- 模块职责
- 输入输出
- 状态机
- 数据结构
- 兼容性和错误处理

不应承载：

- 运维发布步骤
- 市场文案
- 当前进度

### 4.7 Delivery 文档的最小内容

Delivery 文档必须定义：

- 当前迭代要交付什么
- 验收和回归怎么执行
- 任务拆分模板和约束

不应承载：

- 愿景
- 长期策略
- 页面设计判断

### 4.8 Operations 文档的最小内容

Operations 文档必须定义：

- 事件与指标口径
- 发布步骤
- 回滚与排障
- 发布记录
- 复盘结论

不应承载：

- 产品范围的最终解释
- 技术契约定义

## 5. 三种可复用的文档系统层级

普通开发者不需要一开始就铺满完整体系。

### 5.1 Minimal：单人项目起步包

适用场景：

- 单人开发
- 0-1 阶段
- AI 深度参与

建议最小集：

1. `PROJECT-CONSTITUTION.md`
2. `DOCUMENT-MAP.md`
3. `GLOSSARY.md`
4. `PRODUCT-PRINCIPLES.md`
5. `ROADMAP-STATUS.md`
6. `FEATURE-PRD.md`
7. `TECH-SPEC.md`
8. `ACCEPTANCE-CHECKLIST.md`

### 5.2 Standard：多轮迭代包

适用场景：

- 已有多个功能
- 开始反复迭代
- 需要稳定回归

建议新增：

- `TASK-LIBRARY.md`
- `REGRESSION-CHECKLIST.md`
- `TESTING-REPORT.md`
- `UI-STYLE-GUIDE.md`
- `ANALYTICS-EVENTS.md`

### 5.3 Full：上线运营包

适用场景：

- 已上线
- 有埋点、付费、远程配置
- 需要版本追踪和排障

建议新增：

- `RUNBOOK.md`
- `RELEASE-NOTES.md`
- `POSTMORTEM.md`
- `STORE-LISTING.md`
- `DASHBOARD-DEFINITIONS.md`

## 6. 功能包模型

除了全局文档，还建议给复杂功能使用功能包。

推荐结构：

```text
features/
  <feature>/
    PRD.md
    WIREFLOW.md
    TECH-SPEC.md
    ACCEPTANCE.md
    ANALYTICS.md
```

功能包的价值：

- 把一个功能的产品、设计、工程、验收资料聚在一起
- 减少“同一个功能的信息散落在 8 个目录里”
- 便于 AI 在修改某功能时只加载相关上下文

但功能包不应重复全局规则：

- 术语表仍应在 `governance`
- 全局产品原则仍应在 `strategy`
- 全局 UI 标准仍应在 `design`

## 7. 文档内容的质量标准

一份能驱动 VibeCoding 的文档，不是越长越好，而是要满足四个标准：

### 7.1 可判定

读完后，AI 和开发者应能判断：

- 什么在范围内
- 什么不在范围内
- 哪个行为算正确

### 7.2 可引用

文档要能被其它文档和任务稳定引用。

这意味着：

- 名称稳定
- 结构稳定
- 不用口语化标题堆砌

### 7.3 可更新

文档要有明确更新触发器。

例如：

- 范围变化时更新 PRD
- 字段变化时更新 Spec
- 主流程变化时更新验收清单
- 文案系统变化时更新 copy guide

### 7.4 可归档

不是所有文档都应永远 Active。

要允许：

- 把历史分析标成 `Snapshot`
- 把废弃方案标成 `Archive`
- 把未确认草案标成 `Draft`

## 8. 研究结论：普通开发者真正需要的不是更多文档，而是更稳的文档机制

结构研究最后得到的结论很直接：

1. 文档系统必须覆盖完整生命周期，而不是只覆盖研发拆分
2. 文档必须按角色分工，而不是按文件名习惯堆叠
3. 每类文档都应有最小必要内容和明确非目标
4. 文档数量不是核心，SSOT 清晰才是核心
5. 对普通开发者，最关键的是先有 `最小起步包`，再逐步长成 `标准包` 和 `上线包`

如果一套文档系统不能让普通开发者更容易启动、更少返工、更容易协作，那它就还没有设计完成。
