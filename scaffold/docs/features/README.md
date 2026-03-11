# Feature Packages

Last Updated: <YYYY-MM-DD>
Status: Draft
Owner: <feature-owner>
Purpose: 约定什么时候创建功能包，以及功能包内部应包含哪些文档。
Scope: `docs/features/<feature>/` 目录。
Non-Goals:

- 不替代全局治理、策略和运营文档
- 不维护跨项目的术语规则

Update Triggers:

- 功能包结构变化
- 团队需要更细粒度的局部文档

Linked SSOT:

- `docs/governance/DOCUMENT-MAP.md`
- `docs/governance/GLOSSARY.md`

## 1. 什么时候需要功能包

- 功能跨多个页面或模块
- 功能有独立状态机、验收和埋点
- AI 修改该功能时，加载全局文档成本过高

## 2. 推荐结构

```text
docs/features/<feature>/
  PRD.md
  WIREFLOW.md
  TECH-SPEC.md
  ACCEPTANCE.md
  ANALYTICS.md
```

## 3. 与全局文档的边界

- 不在功能包里重写项目宪法和术语表
- 不在功能包里维护全局路线图
- 功能包只描述该功能独有的范围、流程、实现和验收
