# 项目文档入口

Last Updated: <YYYY-MM-DD>
Status: Draft
Owner: <project-owner>
Purpose: 给开发者和 AI 一个稳定的文档入口，并指向当前 SSOT。
Scope: 当前项目的全部文档目录。
Non-Goals:

- 不维护当前迭代任务细节
- 不替代各角色文档本身

Update Triggers:

- 新增或归档文档
- SSOT 入口变化
- 文档目录调整

Linked SSOT:

- `docs/governance/DOCUMENT-MAP.md`

## 1. 当前项目阶段

- 项目名称：
- 当前阶段：`Minimal / Standard / Full`
- 核心主流程：
- 当前最重要目标：

## 2. 推荐阅读顺序

1. `docs/governance/PROJECT-CONSTITUTION.md`
2. `docs/governance/DOCUMENT-MAP.md`
3. `docs/governance/GLOSSARY.md`
4. `docs/strategy/PRODUCT-PRINCIPLES.md`
5. `docs/strategy/ROADMAP-STATUS.md`
6. `docs/product/FEATURE-PRD.md`
7. `docs/engineering/TECH-SPEC.md`
8. `docs/delivery/ACCEPTANCE-CHECKLIST.md`

## 3. 目录角色说明

| 目录 | 角色 | 主要回答的问题 |
|---|---|---|
| `governance/` | 治理 | 谁说了算，术语和边界是什么 |
| `strategy/` | 策略 | 为什么做，先做什么 |
| `product/` | 产品 | 功能范围和业务规则是什么 |
| `design/` | 设计 | 用户如何感知和操作 |
| `engineering/` | 工程 | 系统如何实现 |
| `delivery/` | 交付 | 如何推进、验收、回归 |
| `operations/` | 运营 | 如何发布、观测、排障、复盘 |
| `features/` | 功能包 | 某个复杂功能的局部文档集 |

## 4. 使用规则

- 任何 Active 文档都要有清晰边界和更新触发器
- 不要在多个文档重复维护 `Done / Next / Blocked`
- 功能跨多个页面或模块时，再到 `features/` 建功能包
