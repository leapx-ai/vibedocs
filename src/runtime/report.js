import { TOOL_NAME, TOOL_VERSION } from "../meta.js";

export const RUNTIME_FINAL_STATUSES = {
  COMPLETED: "completed",
  COMPLETED_WITH_DRAFT_UPDATES: "completed_with_draft_updates",
  RESUMED: "resumed",
  RESUMED_WITH_DRAFT_UPDATES: "resumed_with_draft_updates",
  NEEDS_HUMAN_DECISION: "needs_human_decision",
};

export function isHumanDecisionRuntimeStatus(status) {
  return status === RUNTIME_FINAL_STATUSES.NEEDS_HUMAN_DECISION;
}

export function deriveRuntimeFinalStatus({ blocked, resumedFrom, writeSummary } = {}) {
  if (blocked) {
    return RUNTIME_FINAL_STATUSES.NEEDS_HUMAN_DECISION;
  }

  const wroteDrafts = Number(writeSummary?.updated ?? 0) > 0 || Number(writeSummary?.created ?? 0) > 0;

  if (resumedFrom) {
    return wroteDrafts
      ? RUNTIME_FINAL_STATUSES.RESUMED_WITH_DRAFT_UPDATES
      : RUNTIME_FINAL_STATUSES.RESUMED;
  }

  return wroteDrafts
    ? RUNTIME_FINAL_STATUSES.COMPLETED_WITH_DRAFT_UPDATES
    : RUNTIME_FINAL_STATUSES.COMPLETED;
}

export function createRuntimeReport(payload = {}) {
  return {
    runtimeVersion: "v1alpha1",
    tool: {
      name: TOOL_NAME,
      version: TOOL_VERSION,
    },
    generatedAt: new Date().toISOString(),
    input: payload.input ?? {},
    loadedContext: payload.loadedContext ?? {},
    state: payload.state ?? {},
    classification: payload.classification ?? {},
    routing: payload.routing ?? {},
    gates: payload.gates ?? {},
    verification: payload.verification ?? {},
    writes: payload.writes ?? {},
    navigation: payload.navigation ?? {},
    actions: payload.actions ?? [],
    finalStatus: payload.finalStatus ?? "completed",
  };
}

export function formatRuntimeReport(report, options = {}) {
  const format = options.format ?? "text";

  if (format === "json") {
    return JSON.stringify(report, null, 2);
  }

  const lines = [
    `Runtime: ${report.runtimeVersion}`,
    `Tool: ${report.tool.name}@${report.tool.version}`,
    `Final Status: ${report.finalStatus}`,
    `Execution Mode: ${report.routing.executionMode ?? "unknown"}`,
    `Change Type: ${report.classification.changeType ?? "unknown"}`,
    `Confidence: ${report.classification.confidence ?? "unknown"}`,
    "",
    `Phase: ${report.state.phase ?? "unknown"}`,
    `Blocking Gaps: ${(report.state.blockingGaps ?? []).join(", ") || "none"}`,
    `Missing Context: ${(report.loadedContext.missingContext ?? []).join(", ") || "none"}`,
    `Resumed From: ${report.input.resumedFrom ? `${report.input.resumedFrom.gate} (${report.input.resumedFrom.status})` : "no"}`,
    "",
    `Must Update: ${(report.routing.mustUpdate ?? []).join(", ") || "none"}`,
    `Should Review: ${(report.routing.shouldReview ?? []).join(", ") || "none"}`,
    `Suggested Actions: ${(report.routing.suggestedActions ?? []).join(", ") || "none"}`,
    `Derived Reviews: ${(report.routing.derivedReviews ?? []).join(", ") || "none"}`,
    `Gating Docs: ${(report.routing.gatingDocs ?? []).join(", ") || "none"}`,
    `Gates: ${(report.gates.gates ?? []).join(", ") || "none"}`,
    `Approved Gates: ${(report.gates.approvedGates ?? []).join(", ") || "none"}`,
    `Rejected Gates: ${(report.gates.rejectedGates ?? []).join(", ") || "none"}`,
    `Deferred Gates: ${(report.gates.deferredGates ?? []).join(", ") || "none"}`,
    `Routing Rationale: ${report.routing.rationale ?? "none"}`,
    "",
    `Draft Writes: ${report.writes.summary ?? "not-applied"}`,
    `Navigation Sync: ${report.navigation.summary ?? "not-run"}`,
    "",
    ...formatWriteDetails(report.writes.writes ?? []),
    `Structural Audit: ${report.verification.structural?.summary ?? "not-run"}`,
    `Semantic Audit: ${report.verification.semantic?.summary ?? "not-run"}`,
    "",
  ];

  return `${lines.join("\n")}\n`;
}

function formatWriteDetails(writes) {
  if (!writes.length) {
    return [];
  }

  const lines = ["Draft Write Details:"];

  for (const write of writes) {
    const placement = write.anchorHeading
      ? `${write.insertionStrategy ?? "unknown"} -> ${write.anchorHeading}`
      : (write.insertionStrategy ?? "n/a");
    lines.push(`- ${write.path}: ${write.action} (${placement})`);
  }

  lines.push("");
  return lines;
}
