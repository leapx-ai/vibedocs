export const GATE_DECISION_STATUSES = new Set(["accepted", "rejected", "deferred"]);

export function normalizeGateDecisionStatus(status) {
  const normalized = String(status ?? "accepted").trim().toLowerCase();

  if (!GATE_DECISION_STATUSES.has(normalized)) {
    throw new Error(`Invalid gate decision status: ${status}. Expected accepted, rejected, or deferred.`);
  }

  return normalized;
}

export function buildGateDecisionMap(decisions = []) {
  const map = {};

  for (const decision of decisions) {
    if (!decision?.gate) {
      continue;
    }

    map[decision.gate] = {
      status: normalizeGateDecisionStatus(decision.status ?? "accepted"),
      decision: decision.decision ?? "",
      note: decision.note ?? "",
      featureSlug: decision.featureSlug ?? null,
      heading: decision.heading ?? null,
    };
  }

  return map;
}

export function listApprovedGates(gateDecisionMap = {}) {
  return Object.entries(gateDecisionMap)
    .filter(([, value]) => value?.status === "accepted")
    .map(([gate]) => gate);
}
