# VibeDocs

VibeDocs is a local-first documentation toolkit for projects that need to stay understandable to AI and humans.

VibeDocs 是一个本地优先的文档工具，帮助项目更容易被 AI 理解、被团队协作、并保持可持续开发。

Package: `@leapx-ai/vibedocs`  
CLI: `vibedocs`

## Install / 安装

Requirements / 环境要求:

- Node.js `>= 22`

```bash
npm install @leapx-ai/vibedocs
npx vibedocs --help
```

## What It Does / 它提供什么

- Initialize a structured docs system inside a repo  
  在仓库里初始化一套结构化文档系统
- Create feature-level document packages  
  为功能生成局部文档包
- Audit structural drift and semantic drift locally  
  本地检查结构漂移和语义漂移
- Run glossary checks before terminology inconsistency spreads  
  在术语漂移扩散前做巡检
- Run a human-in-the-loop agent runtime flow with `run -> decide -> resume`  
  用 `run -> decide -> resume` 跑一条有人类裁决的 agent runtime 流程

## Quick Start / 快速开始

Initialize a minimal docs system / 初始化最小文档系统:

```bash
npx vibedocs init --mode minimal
```

Create a feature package / 生成功能包:

```bash
npx vibedocs feature create focus-mode
```

Run audit / 运行巡检:

```bash
npx vibedocs audit
```

Enable heuristic semantic checks / 开启启发式语义巡检:

```bash
npx vibedocs audit --semantic heuristic --format json
```

Check glossary drift / 检查术语漂移:

```bash
npx vibedocs glossary check --path docs/product --format json
```

Run the agent runtime / 运行 agent runtime:

```bash
npx vibedocs runtime run --task "Update API contract for focus mode" --feature focus-mode --changed src/focus-mode/api.ts --write-drafts --format json
```

## Config / 配置

The CLI reads either of these files from the project root.  
CLI 会从项目根目录读取以下任一配置文件：

- `vibedocs.config.json`
- `.vibedocsrc.json`

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

## Programmatic API / 编程接口

```js
import { runAudit } from "@leapx-ai/vibedocs";

const report = await runAudit(undefined, process.cwd(), {
  changedPaths: ["src/app.js"],
  semantic: "heuristic",
});

console.log(report.summary);
```

Stable exports / 稳定导出:

- `@leapx-ai/vibedocs`
- `@leapx-ai/vibedocs/config`
- `@leapx-ai/vibedocs/reporting`
- `@leapx-ai/vibedocs/rule-engine`

## Docs / 文档

- Public docs site / 公开文档站: [https://leapx-ai.github.io/vibedocs/](https://leapx-ai.github.io/vibedocs/)
- Repository / 仓库: [https://github.com/leapx-ai/vibedocs](https://github.com/leapx-ai/vibedocs)
- Packaged guides / 随包指南:
- `guides/AI-OPERATING-PROTOCOL.md`
- `guides/AI-EXECUTION-MODES.md`
- `guides/MODEL-BOOTSTRAP-CONTRACT.md`
- `guides/AGENT-RUNTIME.md`
- `guides/AI-PROMPTS.md`
