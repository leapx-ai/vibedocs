# VibeDocs

这不是一组零散的 Markdown 模板，而是一套可复用的 VibeCoding 文档操作系统起点。

发布包名确定为 `@leapx-ai/vibedocs`，CLI 命令保持为 `vibedocs`。

仓库现在分成两层：

1. 运行资产：`bin/`、`src/`、`tests/`、`package.json`
2. 文档资产：`docs/`、`templates/`、`scaffold/`、`website/`

## 仓库结构

### 仓库文档

- `docs/README.md`：仓库文档总索引
- `docs/foundations/`：理念、结构研究、创建机制、提示词
- `docs/product/`：产品化边界、CLI、规则引擎、付费能力包
- `docs/plans/`：免费层与付费层实施计划

### 可复用资产

- `templates/`：单份文档模板，适合按需复制
- `scaffold/`：一套完整的 `docs/` 初始骨架，适合直接拷进项目
- `website/`：公开使用文档站源码，仅承载对外产品与使用说明

### 开发中实现

- `bin/vibedocs.js`：CLI 入口
- `src/index.js`：对外 programmatic API 入口
- `src/commands/`：命令实现
- `src/rule-engine/`：共享规则引擎最小实现
- `scripts/`：发布与验收辅助脚本
- `.github/workflows/`：CI、GitHub Pages、npm 发布自动化
- `schemas/`：report 与 rule pack schema
- `examples/`：配置和 rule pack 示例
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
- `node bin/vibedocs.js audit --changed src/app.js --output artifacts/audit.json --format json`
- `node bin/vibedocs.js glossary check --path docs/product --format json`

当前还支持项目级配置文件：

- `vibedocs.config.json`
- `.vibedocsrc.json`

最小示例：

```json
{
  "projectName": "Demo Project",
  "owner": "Berlin",
  "defaultMode": "standard",
  "featureSlugStyle": "snake",
  "glossaryPaths": ["docs/product", "docs/features"],
  "rulePacks": ["rule-packs/team-defaults.json"]
}
```

本地 rule pack 示例：

```json
{
  "id": "team-defaults",
  "name": "Team Defaults",
  "rules": {
    "core.diff.docs_touchpoint_present": {
      "severity": "high",
      "ownerHint": "tech-lead",
      "suggestion": "Update the affected docs before merge."
    }
  }
}
```

本轮实现选择了零依赖 Node 方案，优先保证：

- 本地可直接运行
- 不依赖额外安装 CLI 框架
- 共享规则结果可被后续付费工作流复用
- 能提前为 PR 检查准备 diff-ready 结果上下文

JSON 输出现在使用稳定 envelope：

- `schemaVersion`
- `tool`
- `run`
- `summary`
- `results`

验证方式：

- `npm test`
- `npm run pack:check`
- `npm run smoke:install`

## 分发与依赖

仓库现在已经具备包形态的基础要素：

- `package.json` `exports`
- `bin` CLI 入口
- `files` 白名单
- 稳定 JSON report envelope
- 本地 rule pack schema

当前更适合的分发方式有两种：

1. 直接作为仓库依赖或源码依赖使用
2. 用 `npm pack` 生成 tarball 后在外部项目安装

安装：

```bash
npm install @leapx-ai/vibedocs
```

programmatic API 示例：

```js
import { runAudit } from "@leapx-ai/vibedocs";

const report = await runAudit(undefined, process.cwd(), {
  changedPaths: ["src/app.js"],
});

console.log(report.summary);
```

稳定子路径入口：

- `@leapx-ai/vibedocs`
- `@leapx-ai/vibedocs/config`
- `@leapx-ai/vibedocs/reporting`
- `@leapx-ai/vibedocs/rule-engine`

发布前和发布时的检查、版本策略、`npm publish` 约束，见 `docs/product/PUBLISHING.md` 和 `docs/product/VERSIONING.md`。

## Public Docs Site

公开站点源码位于 `website/`，通过 `.github/workflows/pages.yml` 部署到 GitHub Pages。

这个站点只承载：

- 产品定位
- 快速开始
- CLI 使用方式
- 配置与 schema 参考

它不应直接镜像仓库内的内部策略、规划或未公开能力说明。

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
10. `docs/product/PUBLISHING.md`
11. `docs/product/VERSIONING.md`
12. `docs/foundations/AI-DOC-BOOTSTRAP-PROMPTS.md`
13. `scaffold/README.md`
14. `templates/README.md`
