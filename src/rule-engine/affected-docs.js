const KNOWN_DOCS = new Set([
  "docs/strategy/PRODUCT-PRINCIPLES.md",
  "docs/strategy/ROADMAP-STATUS.md",
  "docs/product/FEATURE-PRD.md",
  "docs/design/WIREFLOW.md",
  "docs/engineering/TECH-SPEC.md",
  "docs/delivery/ACCEPTANCE-CHECKLIST.md",
  "docs/operations/ANALYTICS-EVENTS.md",
  "docs/operations/DASHBOARD-DEFINITIONS.md",
  "docs/operations/RUNBOOK.md",
  "docs/operations/RELEASE-NOTES.md",
]);

const TOUCHPOINT_RULES = [
  {
    matches: (relativePath, tokens) =>
      relativePath.startsWith("src/")
      || relativePath.startsWith("app/")
      || relativePath.startsWith("lib/")
      || relativePath.startsWith("server/")
      || relativePath.startsWith("web/")
      || relativePath.startsWith("mobile/")
      || relativePath.startsWith("api/")
      || tokens.has("backend"),
    docs: [
      "docs/engineering/TECH-SPEC.md",
      "docs/delivery/ACCEPTANCE-CHECKLIST.md",
    ],
  },
  {
    matches: (relativePath, tokens) =>
      tokens.has("ui")
      || tokens.has("ux")
      || tokens.has("design")
      || tokens.has("component")
      || tokens.has("screen")
      || tokens.has("page")
      || relativePath.includes("/components/"),
    docs: [
      "docs/product/FEATURE-PRD.md",
      "docs/design/WIREFLOW.md",
      "docs/delivery/ACCEPTANCE-CHECKLIST.md",
    ],
  },
  {
    matches: (_, tokens) =>
      tokens.has("analytics")
      || tokens.has("tracking")
      || tokens.has("telemetry")
      || tokens.has("metric")
      || tokens.has("metrics")
      || tokens.has("event")
      || tokens.has("events"),
    docs: [
      "docs/operations/ANALYTICS-EVENTS.md",
      "docs/operations/DASHBOARD-DEFINITIONS.md",
      "docs/delivery/ACCEPTANCE-CHECKLIST.md",
    ],
  },
  {
    matches: (_, tokens) =>
      tokens.has("deploy")
      || tokens.has("release")
      || tokens.has("runbook")
      || tokens.has("ops")
      || tokens.has("incident")
      || tokens.has("infra")
      || tokens.has("migration"),
    docs: [
      "docs/operations/RUNBOOK.md",
      "docs/operations/RELEASE-NOTES.md",
      "docs/delivery/ACCEPTANCE-CHECKLIST.md",
    ],
  },
  {
    matches: (_, tokens) =>
      tokens.has("roadmap")
      || tokens.has("status")
      || tokens.has("strategy")
      || tokens.has("plan"),
    docs: [
      "docs/strategy/ROADMAP-STATUS.md",
      "docs/strategy/PRODUCT-PRINCIPLES.md",
    ],
  },
];

const FEATURE_FILES = ["PRD.md", "WIREFLOW.md", "TECH-SPEC.md", "ACCEPTANCE.md", "ANALYTICS.md"];

function tokenize(relativePath) {
  return new Set(relativePath.toLowerCase().split(/[\/._-]+/).filter(Boolean));
}

function listFeaturePackages(context) {
  const packages = new Map();

  for (const relativePath of context.files.keys()) {
    if (!relativePath.startsWith("docs/features/") || relativePath === "docs/features/README.md") {
      continue;
    }

    const parts = relativePath.split("/");
    if (parts.length < 4) {
      continue;
    }

    const featurePath = parts.slice(0, 3).join("/");
    const slug = parts[2];

    if (!packages.has(featurePath)) {
      packages.set(featurePath, {
        slug,
        path: featurePath,
        tokens: tokenize(slug),
      });
    }
  }

  return [...packages.values()];
}

function addSuggestedDoc(suggestions, context, relativePath) {
  if (context.files.has(relativePath) || KNOWN_DOCS.has(relativePath)) {
    suggestions.add(relativePath);
  }
}

export function inferAffectedDocs(context, changedPaths = context.changedPaths) {
  const suggestions = new Set();
  const featurePackages = listFeaturePackages(context);

  for (const relativePath of changedPaths) {
    const tokens = tokenize(relativePath);

    for (const rule of TOUCHPOINT_RULES) {
      if (!rule.matches(relativePath, tokens)) {
        continue;
      }

      for (const docPath of rule.docs) {
        addSuggestedDoc(suggestions, context, docPath);
      }
    }

    for (const featurePackage of featurePackages) {
      const overlaps = [...featurePackage.tokens].some((token) => tokens.has(token));

      if (!overlaps) {
        continue;
      }

      for (const fileName of FEATURE_FILES) {
        addSuggestedDoc(suggestions, context, `${featurePackage.path}/${fileName}`);
      }
    }
  }

  return [...suggestions];
}
