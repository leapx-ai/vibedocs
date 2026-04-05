const STATUS_HEADINGS = ["Done", "In Progress", "Blocked", "Next Up"];

function countStatuses(files) {
  const counts = {
    draft: 0,
    active: 0,
    snapshot: 0,
    archive: 0,
    unknown: 0,
  };

  for (const file of files.values()) {
    const status = normalizeStatus(file.status);
    counts[status] = (counts[status] ?? 0) + 1;
  }

  return counts;
}

function normalizeStatus(status) {
  const normalized = String(status ?? "").toLowerCase();

  if (normalized.startsWith("draft")) {
    return "draft";
  }

  if (normalized.startsWith("active")) {
    return "active";
  }

  if (normalized.startsWith("snapshot")) {
    return "snapshot";
  }

  if (normalized.startsWith("archive")) {
    return "archive";
  }

  return "unknown";
}

function hasReservedStatusHeading(content) {
  return STATUS_HEADINGS.some((heading) => new RegExp(`^#{2,6}\\s+${heading}\\s*$`, "mi").test(content));
}

function inferProjectPhase(task, featureStates, docsExists) {
  const text = String(task ?? "").toLowerCase();

  if (!docsExists) {
    return "bootstrap";
  }

  if (/\b(release|publish|ship)\b/.test(text)) {
    return "operate";
  }

  if (/\b(test|verify|acceptance|regression)\b/.test(text)) {
    return "verify";
  }

  if (/\b(build|implement|code|refactor|fix)\b/.test(text)) {
    return "implement";
  }

  if (/\b(scope|plan|define|spec|requirements|prd)\b/.test(text)) {
    return "define";
  }

  if (featureStates.some((state) => state.activeDocs > 0)) {
    return "implement";
  }

  return "understand";
}

function inferSsotHealth(context, loadedContext) {
  const requiredDocs = [
    "docs/governance/DOCUMENT-MAP.md",
    "docs/governance/GLOSSARY.md",
    "docs/strategy/ROADMAP-STATUS.md",
  ];
  const statusLeakDocs = [...context.files.values()]
    .filter((file) => file.relativePath !== "docs/strategy/ROADMAP-STATUS.md")
    .filter((file) => hasReservedStatusHeading(file.content))
    .map((file) => file.relativePath);

  return {
    requiredDocs,
    missingRequiredDocs: requiredDocs.filter((relativePath) => !context.files.has(relativePath)),
    hasDocumentMap: context.files.has("docs/governance/DOCUMENT-MAP.md"),
    hasGlossary: context.files.has("docs/governance/GLOSSARY.md"),
    hasRoadmapStatus: context.files.has("docs/strategy/ROADMAP-STATUS.md"),
    statusLeakDocs,
    clear: loadedContext.missingContext.length === 0 && statusLeakDocs.length === 0,
  };
}

function inferFeaturePhase(featureState) {
  if (featureState.activeDocs > 0) {
    return "active";
  }

  if (featureState.draftDocs > 0) {
    return "drafting";
  }

  if (featureState.snapshotDocs > 0) {
    return "historical";
  }

  return "unknown";
}

function inferFeatureCoverage(featureState) {
  if (featureState.files >= 5) {
    return "complete";
  }

  if (featureState.files >= 3) {
    return "partial";
  }

  return "thin";
}

export function inferProjectState(runtimeContext, options = {}) {
  const { context, loadedContext } = runtimeContext;
  const statusCounts = countStatuses(context.files);
  const featureStates = [];
  const featureMap = new Map();

  for (const [relativePath, file] of context.files.entries()) {
    const match = relativePath.match(/^docs\/features\/([^/]+)\//);

    if (!match) {
      continue;
    }

    const slug = match[1];
    const current = featureMap.get(slug) ?? {
      slug,
      files: 0,
      activeDocs: 0,
      draftDocs: 0,
      snapshotDocs: 0,
      archiveDocs: 0,
      unknownDocs: 0,
    };

    current.files += 1;
    current[`${normalizeStatus(file.status)}Docs`] += 1;
    featureMap.set(slug, current);
  }

  featureStates.push(...[...featureMap.values()].map((state) => ({
    ...state,
    phase: inferFeaturePhase(state),
    coverage: inferFeatureCoverage(state),
  })));

  const blockingGaps = [];
  const ssotHealth = inferSsotHealth(context, loadedContext);

  if (loadedContext.missingContext.includes("docs/governance/DOCUMENT-MAP.md")) {
    blockingGaps.push("missing_document_map");
  }

  if (loadedContext.missingContext.includes("docs/governance/GLOSSARY.md")) {
    blockingGaps.push("missing_glossary");
  }

  if (ssotHealth.statusLeakDocs.length > 0) {
    blockingGaps.push("status_leakage");
  }

  const releaseState = {
    hasReleaseNotes: context.files.has("docs/operations/RELEASE-NOTES.md"),
    hasAcceptanceChecklist: context.files.has("docs/delivery/ACCEPTANCE-CHECKLIST.md"),
    hasRunbook: context.files.has("docs/operations/RUNBOOK.md"),
    missingForRelease: [
      !context.files.has("docs/delivery/ACCEPTANCE-CHECKLIST.md") ? "docs/delivery/ACCEPTANCE-CHECKLIST.md" : null,
      !context.files.has("docs/operations/RELEASE-NOTES.md") ? "docs/operations/RELEASE-NOTES.md" : null,
      !context.files.has("docs/operations/RUNBOOK.md") ? "docs/operations/RUNBOOK.md" : null,
    ].filter(Boolean),
  };
  releaseState.readyForReview = releaseState.missingForRelease.length === 0;

  return {
    phase: inferProjectPhase(options.task, featureStates, context.docsExists),
    docStatusMap: statusCounts,
    featureStates,
    releaseState,
    ssotHealth,
    blockingGaps,
    confidence: blockingGaps.length > 0 ? "low" : ssotHealth.clear ? "high" : "medium",
  };
}
