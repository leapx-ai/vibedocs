export function resolveGates(input = {}) {
  const gates = new Set(input.routing?.gates ?? []);
  const loadedContext = input.loadedContext ?? {};
  const changedPaths = input.changedPaths ?? [];
  const ssotHealth = input.projectState?.ssotHealth ?? {};
  const releaseState = input.projectState?.releaseState ?? {};

  if ((loadedContext.missingContext ?? []).includes("docs/governance/DOCUMENT-MAP.md")) {
    gates.add("no_clear_ssot");
  }

  if ((ssotHealth.statusLeakDocs ?? []).length > 0) {
    gates.add("active_ssot_conflict");
  }

  const featureSlugs = new Set();

  for (const relativePath of changedPaths) {
    const match = String(relativePath).match(/docs\/features\/([^/]+)\//);

    if (match) {
      featureSlugs.add(match[1]);
    }
  }

  if (featureSlugs.size > 1 && input.classification?.changeType === "scope_change") {
    gates.add("cross_feature_scope_change");
  }

  const text = String(input.task ?? "").toLowerCase();

  if (/\b(release|publish|ship)\b/.test(text)) {
    gates.add("release_readiness_decision");
  }

  if ((releaseState.missingForRelease ?? []).length > 0 && /\b(release|publish|ship)\b/.test(text)) {
    gates.add("release_readiness_decision");
  }

  if (input.routing?.gatingDocs?.length > 0 && (ssotHealth.missingRequiredDocs ?? []).length > 0) {
    gates.add("no_clear_ssot");
  }

  if (input.routing?.humanDecisionRequired && input.classification?.changeType === "scope_change" && !input.loadedContext?.featureContext?.slug) {
    gates.add("cross_feature_scope_change");
  }

  return {
    gates: [...gates],
    blocked: gates.size > 0,
    humanDecisionRequired: gates.size > 0 || Boolean(input.routing?.humanDecisionRequired),
  };
}
