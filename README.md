# VibeDocs

VibeDocs is a local-first documentation toolkit for projects that need to stay understandable to AI and humans.

It helps you:

- initialize a structured docs system
- create feature-level document packages
- run local checks before docs drift spreads through the repo

Package: `@leapx-ai/vibedocs`  
CLI: `vibedocs`

## Install

Requirements:

- Node.js `>= 22`

Install:

```bash
npm install @leapx-ai/vibedocs
```

Run:

```bash
npx vibedocs --help
```

## What It Includes

The package ships only the runtime pieces needed by the tool:

- CLI entrypoint
- local rule engine
- bundled scaffold used by `init`
- bundled templates used by `feature create`

It does not need a hosted service to run.

## Commands

### Initialize Docs

Create a baseline docs system inside the current repository:

```bash
npx vibedocs init --mode minimal
```

Modes:

- `minimal`
- `standard`
- `full`

Optional:

```bash
npx vibedocs init --mode standard --project-name "Demo" --owner "Berlin"
```

### Create A Feature Package

Generate a scoped document set for a feature:

```bash
npx vibedocs feature create focus-mode
```

This creates:

- `docs/features/focus-mode/PRD.md`
- `docs/features/focus-mode/WIREFLOW.md`
- `docs/features/focus-mode/TECH-SPEC.md`
- `docs/features/focus-mode/ACCEPTANCE.md`
- `docs/features/focus-mode/ANALYTICS.md`

### Run Audit

Run repository checks:

```bash
npx vibedocs audit
```

Structured output:

```bash
npx vibedocs audit --format json
```

Diff-aware audit:

```bash
npx vibedocs audit --changed src/app.js --format json
```

Enable heuristic content checks:

```bash
npx vibedocs audit --semantic heuristic --format json
```

Current audit coverage includes:

- minimal docs presence
- metadata completeness for active docs
- SSOT basics
- feature package completeness
- glossary existence and term drift
- snapshot entrypoint misuse
- diff docs touchpoints
- heuristic content misplacement and duplication checks

### Check Glossary Drift

Run terminology-focused checks:

```bash
npx vibedocs glossary check --path docs/product --format json
```

## Config

The CLI reads either of these files from the project root:

- `vibedocs.config.json`
- `.vibedocsrc.json`

Example:

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

## Programmatic API

You can also call the tool from code:

```js
import { runAudit } from "@leapx-ai/vibedocs";

const report = await runAudit(undefined, process.cwd(), {
  changedPaths: ["src/app.js"],
  semantic: "heuristic",
});

console.log(report.summary);
```

Stable exports:

- `@leapx-ai/vibedocs`
- `@leapx-ai/vibedocs/config`
- `@leapx-ai/vibedocs/reporting`
- `@leapx-ai/vibedocs/rule-engine`

## Documentation

Public docs site:

- [VibeDocs Docs](https://leapx-ai.github.io/vibedocs/)

Repository:

- [github.com/leapx-ai/vibedocs](https://github.com/leapx-ai/vibedocs)
