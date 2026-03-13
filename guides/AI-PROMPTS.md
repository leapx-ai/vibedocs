# AI Prompts

Last Updated: 2026-03-13
Status: Active

## 1. Goal

This guide packages reusable prompts for developers who want AI to help create, migrate, maintain, and audit a VibeDocs-based doc system.

These prompts are intentionally operational rather than theoretical. They are meant to be copied, adapted, and used directly in real project work.

## 2. Default Prompt Rules

When using these prompts, keep these rules attached unless you have a strong reason not to:

- New docs should default to `Draft`
- Only complete docs should move to `Active`
- Replaced current docs should move to `Snapshot`
- Historical-only docs should move to `Archive`
- The model should name the task-relevant SSOT docs before editing
- The model should mark assumptions explicitly when context is missing

## 3. Before You Start

Before sending any prompt, prepare at least:

- project goal
- current stage
- existing docs list
- the main confusion or risk

If code or product state already exists, also include:

- current implementation status
- latest important changes

## 4. Prompt A: Bootstrap a New Docs System

Use this when:

- the project is new
- there is no docs system yet
- you want the smallest useful starting point

```text
Please design a minimal VibeDocs documentation system for this project.

Project goal: <fill in>
Current stage: <fill in>
Core user flow: <fill in>
Main risk or confusion: <fill in>

Please do the following:
1. Propose the smallest useful docs directory structure
2. Define the role, SSOT boundary, and update trigger for each doc
3. Draft the minimal core docs and keep all new docs in `Draft`
4. Tell me which decisions still require human confirmation
5. Avoid overbuilding an enterprise-style system
```

## 5. Prompt B: Migrate a Messy Existing Project

Use this when:

- docs already exist
- structure is inconsistent
- status, rules, and product decisions are scattered

```text
Please audit and reorganize the documentation system for this existing project.

Project background: <fill in>
Current implementation status: <fill in>
Existing docs list: <fill in>
Main conflicts or confusion: <fill in>

Please output:
1. A role classification for the existing docs using governance / strategy / product / design / engineering / delivery / operations
2. Which docs should stay SSOT and which should become `Snapshot`
3. Which docs are misnamed versus fundamentally misplaced
4. Which docs should stay `Draft` and which can become `Active`
5. A lowest-risk migration sequence
6. Focus on convergence first, not a full rewrite
```

## 6. Prompt C: Create a Feature Package

Use this when:

- a new feature spans multiple modules or screens
- you want PRD, design, spec, acceptance, and analytics to land together

```text
Please create a VibeDocs feature package plan for this feature.

Feature name: <fill in>
User problem: <fill in>
Core flow: <fill in>
Affected modules or screens: <fill in>
Constraints: <fill in>

Please output:
1. The docs that should exist under `docs/features/<feature>/`
2. The role and boundary of each file
3. The initial status of each doc and when it should move from `Draft` to `Active`
4. A minimum outline for PRD, WIREFLOW, TECH-SPEC, ACCEPTANCE, and ANALYTICS
5. What should inherit from global principles and glossary instead of being redefined locally
```

## 7. Prompt D: Update Docs After an Iteration

Use this when:

- the implementation changed
- you want AI to help route the needed doc updates

```text
Please identify and draft the required documentation updates for this iteration.

Changes in this iteration: <fill in>
Affected modules: <fill in>
Affected screens: <fill in>
Did business rules change? <yes/no>
Did fields, states, events, or interfaces change? <yes/no>

Please output:
1. The docs that must be updated
2. Why each doc needs an update
3. The sections that should change
4. Which docs should remain in the same status and which can move from `Draft` to `Active`
5. Which old docs should be marked `Snapshot`
6. Avoid editing unrelated docs
```

## 8. Prompt E: Reconcile Docs Before Release

Use this when:

- a release is coming
- you want to verify docs and implementation are aligned

```text
Please run a release-readiness documentation reconciliation for this version.

Version range: <fill in>
Main feature changes: <fill in>
Primary risks: <fill in>
Current doc entrypoints: <fill in>

Please check and output:
1. Which SSOT docs must be updated before release
2. Whether acceptance coverage matches the shipped changes
3. Whether Analytics, Runbook, and Release Notes are missing
4. Whether any doc is incorrectly marked `Active`
5. Whether old rules, states, or wording still remain
6. The smallest useful set of doc fixes
```

## 9. Prompt F: Check Terminology Drift

Use this when:

- terminology has started to drift across iterations
- different docs or teammates use inconsistent names

```text
Please run a terminology consistency review for this project.

Core terms: <fill in>
Docs scope: <fill in>
Known confusing concepts: <fill in>

Please output:
1. Terms that are inconsistent or ambiguous
2. Which docs use conflicting wording
3. A glossary-aligned preferred term for each case
4. Which docs should be updated
5. Which docs are only historical snapshots and should not control current wording
```

## 10. What The Model Should Not Decide Alone

Do not let the model unilaterally decide:

- the final business rule
- whether a historical doc should be deleted
- whether an old approach is fully abandoned
- long-term technical naming compatibility

The model should help with:

- structure cleanup
- conflict detection
- draft generation
- navigation and linkage updates

## 11. Suggested Usage Order

For the best results:

1. bootstrap the model with `MODEL-BOOTSTRAP-CONTRACT.md`
2. apply `AI-OPERATING-PROTOCOL.md`
3. choose a mode from `AI-EXECUTION-MODES.md`
4. then use one of the prompts in this guide
