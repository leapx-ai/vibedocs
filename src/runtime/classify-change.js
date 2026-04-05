const KEYWORD_MAP = [
  { type: "acceptance_change", patterns: ["acceptance", "verify", "regression", "test case", "testcases"] },
  { type: "terminology_change", patterns: ["terminology", "glossary", "rename", "naming", "wording"] },
  { type: "status_change", patterns: ["status", "roadmap", "blocked", "in progress", "next up"] },
  { type: "ui_change", patterns: ["ui", "ux", "wireflow", "screen", "page", "component", "layout", "interaction"] },
  { type: "contract_change", patterns: ["contract", "api", "schema", "payload", "field", "state machine", "data model", "spec"] },
  { type: "scope_change", patterns: ["scope", "goal", "requirement", "prd", "user problem", "non-goal", "feature boundary"] },
];

export function classifyChange(input = {}) {
  const changedPaths = input.changedPaths ?? [];
  const signals = [
    String(input.task ?? ""),
    ...changedPaths,
  ].join(" ").toLowerCase();

  for (const candidate of KEYWORD_MAP) {
    if (candidate.patterns.some((pattern) => signals.includes(pattern))) {
      return {
        changeType: candidate.type,
        confidence: "medium",
        rationale: `Matched ${candidate.type} keywords from task or changed paths.`,
      };
    }
  }

  return {
    changeType: "mixed_change",
    confidence: "low",
    rationale: "Could not classify the request confidently from the current task and changed paths.",
  };
}
