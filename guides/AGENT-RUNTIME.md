# Agent Runtime

This guide explains how to use the VibeDocs runtime commands as a small human-in-the-loop agent workflow.

这不是一个“自动替你完成所有事情”的黑盒，而是一条可检查、可暂停、可恢复的执行链。

## 1. What The Runtime Does

`runtime` is the execution layer that turns a task into:

- context loading
- state inference
- change classification
- task routing
- human gate resolution
- draft doc updates
- structural and semantic verification

一句话：

- `audit` 负责检查
- `runtime` 负责推进一轮 agent 工作

## 2. Commands

### `runtime run`

Use this to start a runtime pass.

```bash
vibedocs runtime run --task "Update API contract for focus mode" --feature focus-mode --changed src/focus-mode/api.ts --format json
```

If you also want draft document updates:

```bash
vibedocs runtime run --task "Update API contract for focus mode" --feature focus-mode --changed src/focus-mode/api.ts --write-drafts --format json
```

### `runtime decide`

Use this when runtime stops on a human gate and you want to record a decision.

```bash
vibedocs runtime decide --gate draft_to_active_promotion --decision "Keep the document in Draft until acceptance coverage is complete" --status deferred --feature focus-mode
```

Allowed statuses:

- `accepted`
- `rejected`
- `deferred`

### `runtime resume`

Use this after a recorded decision to continue the runtime flow.

```bash
vibedocs runtime resume --gate draft_to_active_promotion --task "Update roadmap status for the next sprint" --write-drafts --format json
```

You can also restore the previous input from a saved runtime report:

```bash
vibedocs runtime resume --gate draft_to_active_promotion --report runtime-report.json --write-drafts --format json
```

## 3. Final Status Meanings

Runtime reports currently use these final statuses:

- `completed`
  The runtime finished without blocking gates and did not write drafts.
- `completed_with_draft_updates`
  The runtime finished and wrote draft doc updates.
- `resumed`
  The runtime resumed from a recorded human decision and finished without draft writes.
- `resumed_with_draft_updates`
  The runtime resumed from a recorded human decision and also wrote draft doc updates.
- `needs_human_decision`
  The runtime stopped because a gate still needs a human decision.

## 4. How To Read The Report

The runtime report tells you:

- what kind of change was inferred
- which docs must update
- which docs should be reviewed
- which gates blocked progress
- what draft writes happened
- where each draft section was inserted
- what the structural and semantic audits found

When `writes.writes[]` is present, each entry includes:

- `path`
- `action`
- `anchorHeading`
- `insertionStrategy`

That means you can tell not only which file changed, but also where the runtime tried to place the draft.

## 5. Recommended Flow

For a normal task, use this sequence:

1. Run `runtime run`
2. If it returns `needs_human_decision`, inspect the gates
3. Record a decision with `runtime decide`
4. Continue with `runtime resume`
5. Review any written drafts before promoting document status

## 6. Current Boundaries

Runtime v1 intentionally does not:

- change code
- auto-promote docs to `Active`
- bypass human gates
- replace human release judgment

It is designed to produce structured, reviewable progress rather than silent autonomous changes.
