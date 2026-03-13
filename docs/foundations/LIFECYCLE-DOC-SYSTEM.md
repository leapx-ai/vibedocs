# VibeCoding 全生命周期文档系统

Last Updated: 2026-03-11
Status: Active

## 1. 目标

这套系统解决三个问题：

1. VibeCoding 往往只有 prompt，没有稳定上下文，导致改着改着口径漂移
2. 普通开发者不知道“什么时候该写什么文档”，结果不是文档过多，就是完全没有
3. 文档常常只服务研发阶段，无法覆盖设计、验收、发布、运营和复盘

所以这套系统的目标不是“多写文档”，而是：

- 在不同阶段给 AI 和开发者提供刚好够用的上下文
- 明确每一类问题的单一事实源（SSOT）
- 让文档创建、更新、归档都可持续，而不是一次性整理

## 2. 核心模型

完整系统由两个维度组成：

### 2.1 维度一：文档类型

1. `governance`
2. `strategy`
3. `product`
4. `design`
5. `engineering`
6. `delivery`
7. `operations`

### 2.2 维度二：生命周期阶段

1. `discover`：理解问题与机会
2. `decide`：做产品与技术取舍
3. `define`：把需求、交互、契约定义清楚
4. `build`：把工作拆成可执行任务并推进
5. `verify`：验收、回归、对账
6. `operate`：发布、监控、迭代、复盘

`system / module / feature / task` 只是工程拆解粒度，不是完整文档系统本身。

## 3. 文档族定义

### 3.1 Governance

回答：

- 哪个文档说了算
- 名词是什么意思
- 协作边界是什么

最小文档：

- `PROJECT-CONSTITUTION.md`
- `DOCUMENT-MAP.md`
- `GLOSSARY.md`

### 3.2 Strategy

回答：

- 为什么做
- 先做什么，不做什么
- 当前阶段赌什么

最小文档：

- `VISION.md`
- `PRODUCT-PRINCIPLES.md`
- `ROADMAP-STATUS.md`

### 3.3 Product

回答：

- 用户问题是什么
- 功能边界是什么
- 验收口径是什么

最小文档：

- `FEATURE-PRD.md`
- `BUSINESS-RULES.md`

### 3.4 Design

回答：

- 用户如何感知
- 页面和组件如何表达
- 文案如何避免歧义

最小文档：

- `UI-STYLE-GUIDE.md`
- `WIREFLOW.md`

### 3.5 Engineering

回答：

- 系统怎么实现
- 接口和状态机怎么定义
- 哪些约束必须稳定

最小文档：

- `TECH-SPEC.md`
- `ANALYTICS-EVENTS.md`

### 3.6 Delivery

回答：

- 这一轮怎么推进
- 怎么拆任务
- 做完如何对账

最小文档：

- `TASK-LIBRARY.md`
- `ACCEPTANCE-CHECKLIST.md`

### 3.7 Operations

回答：

- 怎么发布
- 怎么配置
- 怎么观测
- 怎么复盘

最小文档：

- `RUNBOOK.md`
- `RELEASE-NOTES.md`
- `POSTMORTEM.md`

## 4. 生命周期与文档映射

| 阶段 | 核心问题 | 必要文档 |
|---|---|---|
| `discover` | 这是个真问题吗 | `VISION` / `PRODUCT-PRINCIPLES` / 机会分析 |
| `decide` | 我们选什么、不选什么 | `PROJECT-CONSTITUTION` / `TECH-DECISION` / `PRODUCT-PRINCIPLES` |
| `define` | 具体做成什么 | `FEATURE-PRD` / `WIREFLOW` / `TECH-SPEC` |
| `build` | 这一轮如何推进 | `ROADMAP-STATUS` / `TASK-LIBRARY` |
| `verify` | 做出来是否正确 | `ACCEPTANCE-CHECKLIST` / `REGRESSION-CHECKLIST` / `TESTING-REPORT` |
| `operate` | 上线后如何维护 | `RUNBOOK` / `ANALYTICS-EVENTS` / `POSTMORTEM` |

## 5. 最小可运行文档集

对普通开发者，第一次不要上来就写完整体系。

先落这 8 份：

1. `PROJECT-CONSTITUTION.md`
2. `DOCUMENT-MAP.md`
3. `GLOSSARY.md`
4. `PRODUCT-PRINCIPLES.md`
5. `ROADMAP-STATUS.md`
6. `FEATURE-PRD.md`
7. `TECH-SPEC.md`
8. `ACCEPTANCE-CHECKLIST.md`

这 8 份已经能支撑大多数单人或小团队 VibeCoding。

## 6. 完整可扩展文档集

当项目进入多功能、多角色、多轮迭代阶段，再扩到：

- `TASK-LIBRARY.md`
- `UI-STYLE-GUIDE.md`
- `ANALYTICS-EVENTS.md`
- `RUNBOOK.md`
- `RELEASE-NOTES.md`
- `POSTMORTEM.md`
- `FEATURES/<feature>/*`

## 7. SSOT 原则

文档系统必须遵守：

1. 一个问题只允许一个 SSOT
2. 任务文档不重写需求
3. PRD 不维护当前进度
4. Spec 不承载运维操作步骤
5. 验收清单只写可执行步骤，不写愿景
6. 历史分析稿必须标记为 `Snapshot`，不能伪装成当前状态

## 8. 状态与新鲜度

每份文档都应标出状态：

- `Draft`：刚生成、仍在补齐、尚未成为可依赖入口
- `Active`：当前仍在维护，且可以作为稳定事实来源
- `Snapshot`：历史快照，仅保留背景，不再作为当前入口
- `Archive`：归档，不再引用，也不参与当前判断

推荐的默认流程：

1. 先生成 `Draft`
2. 补齐 metadata 和核心内容
3. 再切到 `Active`
4. 被新事实替代后降级为 `Snapshot`
5. 长期不再使用时转为 `Archive`

一句话：

- Generate first
- Complete second
- Activate last

### 8.1 何时从 `Draft` 切到 `Active`

至少同时满足以下条件：

- `Last Updated / Status / Owner / Purpose / Scope / Non-Goals / Update Triggers / Linked SSOT` 已补齐
- 该文档的核心章节已达到可依赖状态
- 团队和 AI 可以把它当作当前事实来源，而不是草稿参考

### 8.2 何时从 `Active` 降到 `Snapshot`

出现以下任一情况时，应考虑降级：

- 已有新的 SSOT 文档取代它
- 该文档只保留背景价值，不再维护当前事实
- 继续挂在当前入口会误导团队或 AI

### 8.3 何时从 `Snapshot` 进入 `Archive`

出现以下情况时，可进一步归档：

- 仅需保留历史留痕
- 已不需要在日常工作中引用
- 不再作为回溯上下文的高频入口

### 8.4 给 AI 的明确规则

如果 AI 参与创建或更新文档，应明确遵守：

- 新生成文档默认从 `Draft` 开始，除非上下文已经证明它可立即成为当前入口
- 不要在内容未补齐时擅自把文档改成 `Active`
- 如果文档已被新的 SSOT 取代，应建议降级为 `Snapshot`
- 如果文档只是历史保留，不再进入当前入口，应建议改成 `Archive`

每份 Active 文档还应至少有一个“更新触发条件”：

- 功能范围变化时更新
- 事件名变化时更新
- UI 主流程变化时更新
- 测试基线变化时更新

## 9. 反模式

以下做法会直接破坏 VibeCoding 质量：

- 在多个文档重复维护 `Done / Next / Blocked`
- 把运维说明塞进 Spec
- 把设计判断塞进任务清单
- 没有术语表，导致“任务/番茄/完成”长期混用
- 只写 PRD，不写验收
- 只写任务，不写范围和约束
- 用旧快照冒充当前状态

## 10. 推荐目录

```text
docs/
  README.md

  governance/
    PROJECT-CONSTITUTION.md
    DOCUMENT-MAP.md
    GLOSSARY.md
    TECH-DECISION.md

  strategy/
    VISION.md
    PRODUCT-PRINCIPLES.md
    ROADMAP-STATUS.md

  prd/
    PRODUCT-PRD.md
    TASK-LIBRARY.md

  design/
    UI-STYLE-GUIDE.md

  features/
    <feature>/
      PRD.md
      WIREFLOW.md
      TECH-SPEC.md
      ACCEPTANCE.md
      ANALYTICS.md

  spec/
    ANALYTICS-EVENTS.md
    SYSTEM-SPEC.md

  delivery/
    ACCEPTANCE-CHECKLIST.md
    REGRESSION-CHECKLIST.md
    TESTING-REPORT.md

  operations/
    RUNBOOK.md
    RELEASE-NOTES.md
    POSTMORTEM.md
```

## 11. 一句话原则

好的 VibeCoding 文档系统，不是“把所有想法写下来”，而是：

在正确阶段，用正确文档，给正确的人和 AI 提供正确上下文。
