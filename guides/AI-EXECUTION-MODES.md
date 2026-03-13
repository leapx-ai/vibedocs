# AI Execution Modes

Last Updated: 2026-03-13
Status: Active

## 1. Goal

This guide defines the working modes an AI model should use inside a VibeDocs-based project.

它回答的不是“模型能做什么”，而是“在不同任务阶段，模型应采用什么工作模式”。

## 2. Why Modes Matter

如果模型对所有任务都使用同一种工作方式，通常会出现两类问题：

- 该先理解时直接开始改
- 该只改局部时却大范围扩散修改

Execution mode lets the human set the pace while the model adapts its behavior.

## 3. Mode A: Understand

Use this when:

- entering an unfamiliar project
- receiving a broad task
- resolving conflicting docs

Primary behavior:

- read before editing
- identify SSOT
- summarize boundaries and unknowns

Expected output:

- docs read
- current understanding
- unresolved conflicts

## 4. Mode B: Define

Use this when:

- creating a new feature package
- refining scope before implementation
- turning a vague task into an actionable doc set

Primary behavior:

- propose the minimum required docs
- keep new docs in `Draft`
- inherit global rules instead of duplicating them

Expected output:

- files to create
- initial statuses
- sections to fill
- items requiring human confirmation

## 5. Mode C: Implement

Use this when:

- changing code under an existing scope
- updating docs and code together
- routing a concrete change through the right files

Primary behavior:

- update only impacted docs
- preserve SSOT boundaries
- do not promote docs unless complete

Expected output:

- changed code/docs set
- why each file changed
- whether any `Draft -> Active` transition is justified

## 6. Mode D: Verify

Use this when:

- reviewing a completed change
- checking release readiness
- looking for doc drift

Primary behavior:

- run `audit`
- run `glossary check`
- compare change scope against docs touched

Expected output:

- warnings and failures
- missing doc updates
- suggested status downgrades or promotions

## 7. Mode E: Operate

Use this when:

- publishing
- handling incidents
- closing an iteration

Primary behavior:

- update `ROADMAP-STATUS`, release docs, runbook, or postmortem docs
- archive or snapshot outdated material
- keep current entrypoints clean

Expected output:

- release or incident doc updates
- snapshot/archive recommendations
- residual risk notes

## 8. Mode Selection Rule

If the task is unclear, the model should start in `Understand`.

If the task creates new structure, use `Define`.

If the task changes implementation under a known scope, use `Implement`.

If the task evaluates completeness, use `Verify`.

If the task closes or operates the system, use `Operate`.

## 9. Human Override

Humans own the pace.

The model should treat an explicit human instruction to stay in a narrower mode as higher priority than its own preference.

Example:

- if asked to “just inspect” the project, do not enter `Implement`
- if asked to “only update docs”, do not broaden into code refactors
