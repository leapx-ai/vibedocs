# 模板目录

这些模板的目标不是一次生成“完美文档”，而是让开发者和 AI 用最小成本先把骨架搭出来。

如果你要直接初始化整个项目，请优先使用 `../scaffold/`。

如果你只想按需补单个文档，再从这里复制模板。

## Minimal 起步包

1. `PROJECT-CONSTITUTION.template.md`
2. `DOCUMENT-MAP.template.md`
3. `GLOSSARY.template.md`
4. `PRODUCT-PRINCIPLES.template.md`
5. `ROADMAP-STATUS.template.md`
6. `FEATURE-PRD.template.md`
7. `TECH-SPEC.template.md`
8. `ACCEPTANCE-CHECKLIST.template.md`

## Standard 扩展包

在 Minimal 基础上继续增加：

1. `VISION.template.md`
2. `UI-STYLE-GUIDE.template.md`
3. `WIREFLOW.template.md`
4. `TASK-LIBRARY.template.md`
5. `REGRESSION-CHECKLIST.template.md`
6. `TESTING-REPORT.template.md`
7. `ANALYTICS-EVENTS.template.md`

## Full 上线运营包

在 Standard 基础上继续增加：

1. `RUNBOOK.template.md`
2. `RELEASE-NOTES.template.md`
3. `POSTMORTEM.template.md`
4. `DASHBOARD-DEFINITIONS.template.md`

## Feature Package

当某个功能跨多个页面或模块时，建议再按功能建立一组局部文档：

1. `FEATURE-PRD.template.md`
2. `WIREFLOW.template.md`
3. `TECH-SPEC.template.md`
4. `ACCEPTANCE-CHECKLIST.template.md`
5. `ANALYTICS-EVENTS.template.md`

原则：

- 先填关键字段，再补细节
- 先确认 SSOT，再批量复制模板
- 不需要的模板可以先不创建
- 任何模板落地后，都要在 `DOCUMENT-MAP` 里声明它的角色和边界
