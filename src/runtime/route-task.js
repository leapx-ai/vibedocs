import { inferAffectedDocs } from "../rule-engine/affected-docs.js";

function makeFeaturePath(slug, fileName, fallbackPath) {
  return slug ? `docs/features/${slug}/${fileName}` : fallbackPath;
}

const ROUTES = {
  scope_change(slug) {
    return {
      executionMode: "define",
      mustUpdate: [makeFeaturePath(slug, "PRD.md", "docs/product/FEATURE-PRD.md")],
      shouldReview: [
        makeFeaturePath(slug, "WIREFLOW.md", "docs/design/WIREFLOW.md"),
        makeFeaturePath(slug, "ACCEPTANCE.md", "docs/delivery/ACCEPTANCE-CHECKLIST.md"),
      ],
      suggestedActions: ["update_prd", "review_wireflow", "review_acceptance"],
      gates: slug ? [] : ["cross_feature_scope_change"],
      humanDecisionRequired: !slug,
      rationale: slug
        ? "Scope changes should update the feature-local PRD first."
        : "Scope changes without a single feature anchor usually require a global decision.",
    };
  },
  ui_change(slug) {
    return {
      executionMode: "define",
      mustUpdate: [makeFeaturePath(slug, "WIREFLOW.md", "docs/design/WIREFLOW.md")],
      shouldReview: [
        makeFeaturePath(slug, "PRD.md", "docs/product/FEATURE-PRD.md"),
        makeFeaturePath(slug, "ACCEPTANCE.md", "docs/delivery/ACCEPTANCE-CHECKLIST.md"),
      ],
      suggestedActions: ["update_wireflow", "review_prd", "review_acceptance"],
      gates: [],
      humanDecisionRequired: false,
      rationale: "UI changes should land in the interaction flow first, then cascade into PRD and acceptance.",
    };
  },
  contract_change(slug) {
    return {
      executionMode: "implement",
      mustUpdate: [makeFeaturePath(slug, "TECH-SPEC.md", "docs/engineering/TECH-SPEC.md")],
      shouldReview: [
        makeFeaturePath(slug, "ACCEPTANCE.md", "docs/delivery/ACCEPTANCE-CHECKLIST.md"),
        makeFeaturePath(slug, "ANALYTICS.md", "docs/operations/ANALYTICS-EVENTS.md"),
      ],
      suggestedActions: ["update_spec", "review_acceptance", "review_analytics"],
      gates: [],
      humanDecisionRequired: false,
      rationale: "Contract changes should update the spec first and verify downstream acceptance and analytics.",
    };
  },
  acceptance_change(slug) {
    return {
      executionMode: "verify",
      mustUpdate: [makeFeaturePath(slug, "ACCEPTANCE.md", "docs/delivery/ACCEPTANCE-CHECKLIST.md")],
      shouldReview: [
        makeFeaturePath(slug, "PRD.md", "docs/product/FEATURE-PRD.md"),
        makeFeaturePath(slug, "TECH-SPEC.md", "docs/engineering/TECH-SPEC.md"),
      ],
      suggestedActions: ["update_acceptance", "review_prd", "review_spec"],
      gates: [],
      humanDecisionRequired: false,
      rationale: "Acceptance changes should update the checklist first and review the intent and implementation docs.",
    };
  },
  terminology_change() {
    return {
      executionMode: "define",
      mustUpdate: ["docs/governance/GLOSSARY.md"],
      shouldReview: ["docs/governance/DOCUMENT-MAP.md"],
      suggestedActions: ["update_glossary", "review_document_map"],
      gates: [],
      humanDecisionRequired: false,
      rationale: "Terminology changes should anchor in the glossary before broader propagation.",
    };
  },
  status_change() {
    return {
      executionMode: "operate",
      mustUpdate: ["docs/strategy/ROADMAP-STATUS.md"],
      shouldReview: ["docs/governance/DOCUMENT-MAP.md"],
      suggestedActions: ["update_status", "review_document_map"],
      gates: ["draft_to_active_promotion"],
      humanDecisionRequired: true,
      rationale: "Status updates can impact project truth, so promotion-related decisions stay human-gated.",
    };
  },
  mixed_change(slug) {
    return {
      executionMode: "understand",
      mustUpdate: slug ? [`docs/features/${slug}/PRD.md`] : [],
      shouldReview: ["docs/README.md", "docs/governance/DOCUMENT-MAP.md"],
      suggestedActions: ["decompose_change", "review_context"],
      gates: ["no_clear_ssot"],
      humanDecisionRequired: true,
      rationale: "Mixed changes should be decomposed before writing to avoid spreading updates across the wrong files.",
    };
  },
};

export function routeTask(input = {}) {
  const slug = input.featureSlug || null;
  const route = ROUTES[input.changeType] ?? ROUTES.mixed_change;
  const result = route(slug);
  const affectedDocs = input.context?.files
    ? inferAffectedDocs(input.context, input.changedPaths ?? [])
    : [];
  const derivedReviews = affectedDocs.filter((entry) => !result.mustUpdate.includes(entry));
  const gatingDocs = [];

  if (input.projectState?.ssotHealth?.missingRequiredDocs?.length) {
    gatingDocs.push(...input.projectState.ssotHealth.missingRequiredDocs);
  }

  if (input.changeType === "release_change" || /\b(release|publish|ship)\b/.test(String(input.task ?? "").toLowerCase())) {
    gatingDocs.push(...(input.projectState?.releaseState?.missingForRelease ?? []));
  }

  return {
    changeType: input.changeType,
    executionMode: result.executionMode,
    mustUpdate: unique(result.mustUpdate),
    shouldReview: unique([...result.shouldReview, ...derivedReviews].filter((entry) => !result.mustUpdate.includes(entry))),
    suggestedActions: unique(result.suggestedActions),
    gates: unique(result.gates),
    humanDecisionRequired: Boolean(result.humanDecisionRequired),
    rationale: result.rationale,
    derivedReviews,
    gatingDocs: unique(gatingDocs),
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
