# Scaffold 使用说明

这个目录提供一套可直接复制进项目的 `docs/` 初始骨架。

目标不是一次写满所有文档，而是先建立稳定入口、SSOT 分工和扩展路径。

## 1. 初始化方式

把这套骨架复制进你的项目根目录：

```bash
cp -R scaffold/docs /path/to/your-project/
```

复制后按下面顺序执行：

1. 填 `docs/governance/PROJECT-CONSTITUTION.md`
2. 填 `docs/governance/DOCUMENT-MAP.md`
3. 填 `docs/governance/GLOSSARY.md`
4. 填 `docs/strategy/PRODUCT-PRINCIPLES.md`
5. 填 `docs/strategy/ROADMAP-STATUS.md`
6. 填 `docs/product/FEATURE-PRD.md`
7. 填 `docs/engineering/TECH-SPEC.md`
8. 填 `docs/delivery/ACCEPTANCE-CHECKLIST.md`

## 2. 三档使用法

### Minimal

先激活这 8 份：

- `governance/PROJECT-CONSTITUTION.md`
- `governance/DOCUMENT-MAP.md`
- `governance/GLOSSARY.md`
- `strategy/PRODUCT-PRINCIPLES.md`
- `strategy/ROADMAP-STATUS.md`
- `product/FEATURE-PRD.md`
- `engineering/TECH-SPEC.md`
- `delivery/ACCEPTANCE-CHECKLIST.md`

其它文件可以先保持 `Draft`，也可以删除。

### Standard

在 Minimal 基础上再激活：

- `strategy/VISION.md`
- `design/UI-STYLE-GUIDE.md`
- `design/WIREFLOW.md`
- `delivery/TASK-LIBRARY.md`
- `delivery/REGRESSION-CHECKLIST.md`
- `delivery/TESTING-REPORT.md`
- `operations/ANALYTICS-EVENTS.md`

### Full

上线或进入稳定运营后，再激活：

- `operations/RUNBOOK.md`
- `operations/RELEASE-NOTES.md`
- `operations/POSTMORTEM.md`
- `operations/DASHBOARD-DEFINITIONS.md`

## 3. 什么时候建 Feature Package

当某个功能满足任意条件时，建议在 `docs/features/<feature>/` 建立功能包：

- 跨多个页面或模块
- 需要单独的用户流程说明
- 需要单独维护 Spec、验收和 Analytics

推荐结构：

```text
docs/features/<feature>/
  PRD.md
  WIREFLOW.md
  TECH-SPEC.md
  ACCEPTANCE.md
  ANALYTICS.md
```

注意：

- 全局术语仍放在 `governance/GLOSSARY.md`
- 全局产品原则仍放在 `strategy/PRODUCT-PRINCIPLES.md`
- 不要在功能包里重复维护全局状态

## 4. 使用约束

- 一个问题只允许一个 SSOT
- 当前状态只在一个地方维护
- 历史结论不要伪装成当前文档
- 暂时不用的文档保持 `Draft`，不要填无意义内容
- 每次新增或激活文档，都要回写 `DOCUMENT-MAP`
