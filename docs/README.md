# Docs Index

这个目录收纳仓库中适合公开保留的理念文档与版本说明。

目标是把：

- 对外可讲的方法论和使用认知
- 仓库内部的思考、判断、实施计划与实现解读

分开管理。

后者已迁到本地私有的 `thinking/` 目录，不再继续纳入源码版本控制。

## Foundations

位置：`docs/foundations/`

这一层回答文档系统本身如何成立：

- `WHY-AGENT-OPERABLE-PRODUCTS.md`
- `DOC-STRUCTURE-RESEARCH.md`
- `DOC-CREATION-ENGINE.md`
- `DOC-CREATION-WORKFLOW.md`
- `LIFECYCLE-DOC-SYSTEM.md`
- `AI-DOC-BOOTSTRAP-PROMPTS.md`

## Repository Structure

位置：`docs/`

这一层回答仓库目录各自承担什么职责：

- `DIRECTORY-RESPONSIBILITIES.md`

## Releases

位置：`docs/releases/`

这一层回答每个公开版本到底交付了什么：

- `README.md`
- `0.1.3.md`
- `0.1.2.md`
- `0.1.1.md`
- `0.1.0.md`

## 与仓库其它目录的分工

- `templates/`：单文档模板
- `scaffold/`：可直接复制的 `docs/` 初始骨架
- `src/`：CLI 与规则引擎实现
- `tests/`：实现验证
- `website/`：公开使用文档站源码
- `scripts/`：发布与验收辅助脚本
- `thinking/`：本地私有沉淀，不纳入源码版本控制

## 推荐阅读顺序

1. `DIRECTORY-RESPONSIBILITIES.md`
2. `foundations/WHY-AGENT-OPERABLE-PRODUCTS.md`
3. `foundations/DOC-STRUCTURE-RESEARCH.md`
4. `foundations/DOC-CREATION-ENGINE.md`
5. `foundations/LIFECYCLE-DOC-SYSTEM.md`
6. `foundations/DOC-CREATION-WORKFLOW.md`
7. `foundations/AI-DOC-BOOTSTRAP-PROMPTS.md`
8. `releases/0.1.3.md`
9. `releases/0.1.2.md`
10. `releases/0.1.1.md`
11. `releases/0.1.0.md`
