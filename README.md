# VibeCoding Documentation OS Template

这不是一组零散的 Markdown 模板，而是一套可复用的 VibeCoding 文档操作系统起点。

仓库现在包含三层能力：

1. 方法论：解释文档系统为什么这样设计
2. 模板：提供单文档级别的可复用骨架
3. Scaffold：提供可直接复制进项目的初始化目录

## 仓库结构

### 方法论

- `DOC-STRUCTURE-RESEARCH.md`：文档角色 x 生命周期阶段 的结构研究
- `DOC-CREATION-ENGINE.md`：inventory / classify / bootstrap / operate / archive 创建引擎
- `DOC-CREATION-WORKFLOW.md`：适合普通开发者的分阶段创建与维护机制
- `LIFECYCLE-DOC-SYSTEM.md`：全生命周期文档系统总览
- `AI-DOC-BOOTSTRAP-PROMPTS.md`：可直接复用的 AI 提示词

### 可复用资产

- `templates/`：单份文档模板，适合按需复制
- `scaffold/`：一套完整的 `docs/` 初始骨架，适合直接拷进项目

## 快速开始

如果你想把这套系统用于一个新项目，建议顺序如下：

1. 复制 `scaffold/docs/` 到你的项目
2. 打开 `scaffold/README.md`，决定使用 `Minimal`、`Standard` 还是 `Full`
3. 先填写 8 份最小起步文档：
   - `governance/PROJECT-CONSTITUTION.md`
   - `governance/DOCUMENT-MAP.md`
   - `governance/GLOSSARY.md`
   - `strategy/PRODUCT-PRINCIPLES.md`
   - `strategy/ROADMAP-STATUS.md`
   - `product/FEATURE-PRD.md`
   - `engineering/TECH-SPEC.md`
   - `delivery/ACCEPTANCE-CHECKLIST.md`
4. 只在 `DOCUMENT-MAP` 里声明 SSOT，不要在多个文档重复维护状态
5. 当项目进入多轮迭代，再从 `templates/` 或 `scaffold/docs/` 激活更多文档

## 选择哪一层

- 如果你只缺一份文档：用 `templates/`
- 如果你要给现有项目补一套 docs 框架：用 `scaffold/`
- 如果你要解释为什么这么设计：读方法论文档

## 推荐阅读顺序

1. `DOC-STRUCTURE-RESEARCH.md`
2. `DOC-CREATION-ENGINE.md`
3. `AI-DOC-BOOTSTRAP-PROMPTS.md`
4. `scaffold/README.md`
5. `templates/README.md`
