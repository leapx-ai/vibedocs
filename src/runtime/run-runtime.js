import { runAudit } from "../api/run-audit.js";
import { loadProjectConfig } from "../config/load-config.js";
import { bootstrapRuntime } from "./bootstrap.js";
import { classifyChange } from "./classify-change.js";
import { applyDraftDocUpdates } from "./draft-doc-update.js";
import { inferProjectState } from "./infer-state.js";
import { createRuntimeReport } from "./report.js";
import { resolveGates } from "./resolve-gates.js";
import { routeTask } from "./route-task.js";
import { syncNavigation } from "./sync-navigation.js";

function summarizeVerification(report) {
  const summary = report.summary ?? {};
  return `${summary.passed ?? 0} pass / ${summary.warned ?? 0} warn / ${summary.failed ?? 0} fail / ${summary.skipped ?? 0} skip`;
}

export async function runRuntime(targetPath, cwd, options = {}) {
  if (!options.task || String(options.task).trim().length === 0) {
    throw new Error('Missing required --task for "vibedocs runtime run".');
  }

  const changedPaths = options.changedPaths ?? [];
  const semanticMode = options.semantic ?? "heuristic";
  const runtimeContext = await bootstrapRuntime(targetPath, cwd, {
    changedPaths,
    featureSlug: options.featureSlug,
  });
  const config = await loadProjectConfig(runtimeContext.context.projectRoot);
  const state = inferProjectState(runtimeContext, {
    task: options.task,
  });
  const classification = classifyChange({
    task: options.task,
    changedPaths,
  });
  const routing = routeTask({
    task: options.task,
    changeType: classification.changeType,
    featureSlug: runtimeContext.loadedContext.featureContext?.slug,
    projectState: state,
    changedPaths,
    context: runtimeContext.context,
  });
  const gates = resolveGates({
    task: options.task,
    changedPaths,
    loadedContext: runtimeContext.loadedContext,
    projectState: state,
    classification,
    routing,
  });
  const actions = [
    "bootstrap_context",
    "infer_state",
    "classify_change",
    "route_task",
    "resolve_gates",
  ];
  let writeSummary = {
    summary: options.writeDrafts ? "blocked-before-write" : "not-requested",
    attempted: 0,
    writes: [],
  };
  let navigationSummary = {
    summary: options.writeDrafts ? "not-run" : "not-requested",
    updatedFiles: [],
  };

  if (options.writeDrafts && !gates.blocked) {
    const baseReport = createRuntimeReport({
      input: {
        projectRoot: runtimeContext.context.projectRoot,
        task: options.task,
        featureSlug: runtimeContext.loadedContext.featureContext?.slug ?? null,
      },
      classification,
      routing,
    });
    const writeResult = await applyDraftDocUpdates(baseReport, {
      owner: config.values.owner ?? "TODO",
    });

    writeSummary = {
      ...writeResult,
      summary: `${writeResult.updated} updated / ${writeResult.created} created / ${writeResult.unchanged} unchanged / ${writeResult.skipped} skipped`,
    };
    actions.push("draft_doc_update");
    navigationSummary = await syncNavigation(baseReport);
    actions.push("sync_navigation");
  } else if (options.writeDrafts && gates.blocked) {
    actions.push("skip_draft_doc_update");
    actions.push("skip_navigation_sync");
  }

  const verificationReport = await runAudit(targetPath, cwd, {
    changedPaths,
    semantic: semanticMode,
  });
  actions.push("run_structural_audit");
  actions.push(semanticMode === "heuristic" ? "run_semantic_audit" : "skip_semantic_audit");

  return createRuntimeReport({
    input: {
      projectRoot: runtimeContext.context.projectRoot,
      task: options.task,
      changedPaths,
      featureSlug: runtimeContext.loadedContext.featureContext?.slug ?? null,
      semanticMode,
    },
    loadedContext: runtimeContext.loadedContext,
    state,
    classification,
    routing,
    gates,
    actions: [
      "bootstrap_context",
      "infer_state",
      "classify_change",
      "route_task",
      "resolve_gates",
      "run_structural_audit",
      semanticMode === "heuristic" ? "run_semantic_audit" : "skip_semantic_audit",
    ],
    verification: {
      structural: {
        summary: summarizeVerification(verificationReport),
        failed: verificationReport.summary.failed,
        warned: verificationReport.summary.warned,
      },
      semantic: {
        mode: semanticMode,
        summary: semanticMode === "heuristic"
          ? `${verificationReport.results.filter((result) => result.semantic_type).length} semantic signals`
          : "off",
      },
      auditReport: verificationReport,
    },
    writes: writeSummary,
    navigation: navigationSummary,
    actions,
    finalStatus: gates.blocked ? "needs_human_decision" : "completed",
  });
}
