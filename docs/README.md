# Docs Index

这个目录收纳仓库自己的理念、产品化策略和实施计划。

目标是把“这套系统本身如何设计、如何产品化、如何落地”与可复用资产和实现代码分开，避免根目录继续堆叠说明文档。

## Foundations

位置：`docs/foundations/`

这一层回答文档系统本身如何成立：

- `DOC-STRUCTURE-RESEARCH.md`
- `DOC-CREATION-ENGINE.md`
- `DOC-CREATION-WORKFLOW.md`
- `LIFECYCLE-DOC-SYSTEM.md`
- `AI-DOC-BOOTSTRAP-PROMPTS.md`

## Product

位置：`docs/product/`

这一层回答这套系统如何产品化：

- `OPEN-CORE-BOUNDARY.md`
- `CLI-PRD.md`
- `RULE-ENGINE-SPEC.md`
- `PAID-WORKFLOWS.md`
- `PUBLISHING.md`
- `VERSIONING.md`
- `REPO-SETUP.md`

## Implementation

位置：`docs/implementation/`

这一层回答仓库内部实现如何设计：

- `README.md`
- `AUDIT-PIPELINE.md`
- `DOCUMENT-LANGUAGE-CONVENTION.md`
- `HEURISTIC-SEMANTIC-AUDIT-SPEC.md`

## Plans

位置：`docs/plans/`

这一层回答接下来怎么执行：

- `FREE-LAYER-IMPLEMENTATION-PLAN.md`
- `PAID-LAYER-IMPLEMENTATION-PLAN.md`

## Releases

位置：`docs/releases/`

这一层回答每个公开版本到底交付了什么：

- `README.md`
- `0.1.1.md`
- `0.1.0.md`

## 与仓库其它目录的分工

- `templates/`：单文档模板
- `scaffold/`：可直接复制的 `docs/` 初始骨架
- `src/`：CLI 与规则引擎实现
- `tests/`：实现验证
- `website/`：公开使用文档站源码
- `scripts/`：发布与验收辅助脚本

## 推荐阅读顺序

1. `foundations/DOC-STRUCTURE-RESEARCH.md`
2. `foundations/DOC-CREATION-ENGINE.md`
3. `product/OPEN-CORE-BOUNDARY.md`
4. `product/CLI-PRD.md`
5. `plans/FREE-LAYER-IMPLEMENTATION-PLAN.md`
6. `product/RULE-ENGINE-SPEC.md`
7. `implementation/AUDIT-PIPELINE.md`
8. `implementation/DOCUMENT-LANGUAGE-CONVENTION.md`
9. `implementation/HEURISTIC-SEMANTIC-AUDIT-SPEC.md`
10. `product/PAID-WORKFLOWS.md`
11. `plans/PAID-LAYER-IMPLEMENTATION-PLAN.md`
12. `product/PUBLISHING.md`
13. `product/VERSIONING.md`
14. `product/REPO-SETUP.md`
15. `releases/0.1.1.md`
16. `releases/0.1.0.md`
17. `foundations/AI-DOC-BOOTSTRAP-PROMPTS.md`
