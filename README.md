# VibeCoding Documentation OS Template

这不是一组零散的 Markdown 模板，而是一套可复用的 VibeCoding 文档操作系统起点。

仓库现在分成两层：

1. 运行资产：`bin/`、`src/`、`tests/`、`package.json`
2. 文档资产：`docs/`、`templates/`、`scaffold/`

## 仓库结构

### 仓库文档

- `docs/README.md`：仓库文档总索引
- `docs/foundations/`：理念、结构研究、创建机制、提示词
- `docs/product/`：产品化边界、CLI、规则引擎、付费能力包
- `docs/plans/`：免费层与付费层实施计划

### 可复用资产

- `templates/`：单份文档模板，适合按需复制
- `scaffold/`：一套完整的 `docs/` 初始骨架，适合直接拷进项目

### 开发中实现

- `bin/vibedocs.js`：CLI 入口
- `src/commands/`：命令实现
- `src/rule-engine/`：共享规则引擎最小实现
- `tests/`：CLI 与规则引擎基础测试

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

## CLI 原型

仓库现在已经带一套可运行的免费层 CLI 原型，当前命令包括：

- `node bin/vibedocs.js init --mode minimal --project-name "Demo" --owner "Berlin"`
- `node bin/vibedocs.js feature create focus-mode`
- `node bin/vibedocs.js audit --format text`
- `node bin/vibedocs.js glossary check --path docs/product --format json`

本轮实现选择了零依赖 Node 方案，优先保证：

- 本地可直接运行
- 不依赖额外安装 CLI 框架
- 共享规则结果可被后续付费工作流复用

验证方式：

- `npm test`

## 选择哪一层

- 如果你只缺一份文档：用 `templates/`
- 如果你要给现有项目补一套 docs 框架：用 `scaffold/`
- 如果你要理解这套系统本身：从 `docs/README.md` 开始

## 推荐阅读顺序

1. `docs/README.md`
2. `docs/foundations/DOC-STRUCTURE-RESEARCH.md`
3. `docs/foundations/DOC-CREATION-ENGINE.md`
4. `docs/product/OPEN-CORE-BOUNDARY.md`
5. `docs/product/CLI-PRD.md`
6. `docs/plans/FREE-LAYER-IMPLEMENTATION-PLAN.md`
7. `docs/product/RULE-ENGINE-SPEC.md`
8. `docs/product/PAID-WORKFLOWS.md`
9. `docs/plans/PAID-LAYER-IMPLEMENTATION-PLAN.md`
10. `docs/foundations/AI-DOC-BOOTSTRAP-PROMPTS.md`
11. `scaffold/README.md`
12. `templates/README.md`
