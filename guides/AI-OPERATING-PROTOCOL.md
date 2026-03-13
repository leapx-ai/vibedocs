# AI Operating Protocol

Last Updated: 2026-03-13
Status: Active

## 1. Goal

This guide defines how an AI model should operate inside a VibeDocs-based project.

目标不是让模型“自由发挥”，而是让它在稳定上下文、清晰边界和可回溯决策下工作。

一句话：

- 文档系统定义项目事实
- 人负责节奏和最终裁决
- AI 在明确协议下读取、判断、修改、回写

## 2. Core Principles

The model should follow these principles in order:

1. Trust documented structure before improvisation.
2. Prefer SSOT over summaries or duplicated notes.
3. Read before editing.
4. Update the smallest correct document set.
5. Keep status transitions explicit.
6. Escalate conflicts instead of guessing.

## 3. Loading Order

When entering a project, the model should load docs in this order:

1. `docs/README.md`
2. `docs/governance/DOCUMENT-MAP.md`
3. `docs/governance/GLOSSARY.md`
4. `docs/governance/PROJECT-CONSTITUTION.md`
5. `docs/strategy/PRODUCT-PRINCIPLES.md`
6. `docs/strategy/ROADMAP-STATUS.md`
7. task-specific docs such as `FEATURE-PRD`, `TECH-SPEC`, `ACCEPTANCE`, or `features/<slug>/*`

如果上下文有限，至少要先拿到：

- 文档入口
- SSOT 对照
- 术语表
- 当前任务相关的局部文档

## 4. Authority Rules

When documents conflict, use this order:

1. Explicit SSOT listed in `DOCUMENT-MAP`
2. Active doc over Draft / Snapshot / Archive
3. Feature-local docs for feature-local facts
4. Global docs for cross-project rules
5. Human instruction over inferred interpretation

Do not merge conflicting statements into a blended answer without calling out the conflict.

## 5. Status Rules

The model must treat document status as an operating contract:

- `Draft`: incomplete, not yet reliable as a project fact source
- `Active`: maintained and safe to depend on
- `Snapshot`: historical context, not a current source of truth
- `Archive`: retired and normally excluded from current reasoning

Default transition rule:

1. Generate as `Draft`
2. Complete metadata and core content
3. Promote to `Active`
4. Downgrade replaced docs to `Snapshot`
5. Move retired docs to `Archive`

The model should not silently promote a document to `Active` unless the content is complete enough to be relied on.

## 6. Update Routing

When a task changes, update the smallest correct document set:

- Scope or user outcome changed: update `PRD`
- Flow or UI state changed: update `WIREFLOW` or `ACCEPTANCE`
- Fields, interfaces, or state machine changed: update `TECH-SPEC`
- Events or metrics changed: update `ANALYTICS-EVENTS` or `ANALYTICS`
- Current iteration status changed: update `ROADMAP-STATUS`
- Global term changed: update `GLOSSARY`

Do not update unrelated documents just because they mention the same concept.

## 7. Write Rules

When editing docs, the model should:

- preserve SSOT boundaries
- avoid duplicating global rules inside feature packages
- keep structure fields in English
- keep narrative text in the team’s working language
- explain which docs changed and why

The model should not:

- invent a new SSOT without explicit human confirmation
- keep parallel status sections in multiple docs
- treat Snapshot docs as current instructions
- silently rewrite business rules across multiple files

## 8. Output Contract

When the model finishes a documentation task, it should report:

1. which files were read
2. which files were changed
3. why each file changed
4. whether any status transition is recommended
5. what still requires human confirmation

这层输出契约的目的，是让人继续掌握节奏，而不是把项目控制权交给模型。

## 9. Escalation Cases

The model should pause and ask for human confirmation when:

- two Active docs conflict
- no clear SSOT exists for the question
- a Draft doc appears to be treated like a production source
- a status change would affect project planning or release judgment
- a feature package seems to redefine a global rule

## 10. Minimum Success Condition

The model is operating correctly only when it can answer:

- What is the current source of truth for this question?
- Which docs are safe to trust?
- Which docs must be updated for this change?
- Which docs should remain unchanged?

If it cannot answer those four questions, it should read more before acting.
