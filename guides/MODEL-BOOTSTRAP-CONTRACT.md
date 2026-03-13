# Model Bootstrap Contract

Last Updated: 2026-03-13
Status: Active

## 1. Goal

This guide defines the minimum context a model should load before working on a VibeDocs project.

这份 contract 的目标是减少“模型拿到一点点上下文就开始改”的风险。

## 2. Minimum Required Context

Before acting, the model should load:

1. the docs entrypoint
2. the SSOT map
3. the glossary
4. the current task-relevant doc set

In most projects, that means:

- `docs/README.md`
- `docs/governance/DOCUMENT-MAP.md`
- `docs/governance/GLOSSARY.md`
- one or more of:
  - `docs/product/FEATURE-PRD.md`
  - `docs/engineering/TECH-SPEC.md`
  - `docs/delivery/ACCEPTANCE-CHECKLIST.md`
  - `docs/features/<slug>/*`

## 3. Optional But Recommended Context

Load these when available and relevant:

- `docs/governance/PROJECT-CONSTITUTION.md`
- `docs/strategy/PRODUCT-PRINCIPLES.md`
- `docs/strategy/ROADMAP-STATUS.md`
- `docs/design/WIREFLOW.md`
- `docs/operations/ANALYTICS-EVENTS.md`

## 4. Bootstrap Questions

Before editing, the model should be able to answer:

1. What question am I solving?
2. Which doc is the SSOT for that question?
3. Which docs are only supporting context?
4. What status are the relevant docs in?
5. Which docs should not be touched?

If these answers are missing, the model should stay in an understanding phase.

## 5. Missing Context Fallback

If the required context is missing:

- do not invent a replacement SSOT
- propose the missing docs
- keep new docs in `Draft`
- mark assumptions explicitly

If `DOCUMENT-MAP` is missing, the model should treat authority as unresolved and avoid broad edits.

## 6. Conflict Handling

If two docs conflict:

- prefer the explicit SSOT if one exists
- prefer `Active` over `Draft`
- prefer local feature docs for local implementation details
- escalate to a human if two `Active` docs disagree

## 7. Bootstrap Output

A correct bootstrap summary should include:

- files loaded
- task-relevant SSOT docs
- supporting docs
- gaps or ambiguity
- recommended execution mode

## 8. Recommended Prompt Wrapper

This is a reusable instruction block for tool users:

```text
Before making changes, first bootstrap yourself into the project.

Load:
1. docs/README.md
2. docs/governance/DOCUMENT-MAP.md
3. docs/governance/GLOSSARY.md
4. the task-relevant PRD / TECH-SPEC / ACCEPTANCE / feature package docs

Then tell me:
- which docs are SSOT
- which docs are supporting context
- which docs are missing
- which execution mode you are using

Do not start editing until those are clear.
```
