import { diceCoefficient, normalizedLength } from "./similarity.js";

function makeSemanticResult(overrides = {}) {
  return {
    rule_id: "",
    status: "warn",
    severity: "medium",
    category: "semantic",
    target: "repo",
    context: "repository",
    reason: "",
    evidence: [],
    suggested_docs: [],
    suggestion: "",
    owner_hint: "doc-owner",
    snapshot_key: "",
    engine: "heuristic-semantic",
    semantic_type: "",
    trigger_signals: [],
    ...overrides,
  };
}

const STATUS_LINE_PATTERNS = [
  "done",
  "in progress",
  "blocked",
  "next up",
  "current progress",
  "next step",
  "已完成",
  "进行中",
  "阻塞",
  "阻塞项",
  "下一步",
  "当前进展",
  "本周完成",
  "下周计划",
  "下一阶段",
];

const STATUS_HEADING_HINTS = [
  "current progress",
  "progress",
  "milestone",
  "当前进展",
  "迭代状态",
  "本周进展",
  "下一阶段",
];

const GLOBAL_PRINCIPLE_HEADING_HINTS = [
  "原则排序",
  "执行要求",
  "冲突判断法",
  "principle ranking",
  "conflict",
];

const GLOBAL_PRINCIPLE_CONTENT_HINTS = [
  "项目宪法",
  "术语边界",
  "产品原则",
  "用户价值是否成立",
  "是否违反项目宪法和术语边界",
  "是否能被当前验收和运营机制承接",
];

const GLOSSARY_TABLE_COLUMNS = [
  ["术语", "term"],
  ["定义", "definition"],
  ["禁止混用", "banned synonyms", "banned"],
  ["ssot"],
];

function isActiveEnough(status) {
  return !(status?.startsWith("Snapshot") || status?.startsWith("Archive"));
}

function formatSectionTarget(section) {
  return section.heading ? `${section.filePath}#${section.heading}` : section.filePath;
}

function collectAnchoredStatusSignals(body) {
  const normalized = body.toLowerCase();

  return STATUS_LINE_PATTERNS.filter((signal) => {
    const escaped = signal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|\\n)\\s*(?:[-*]|\\d+\\.)\\s*${escaped}\\s*[:：]`, "i").test(normalized);
  });
}

function findGlossaryTableHeader(sectionText) {
  const lines = sectionText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (!line.startsWith("|")) {
      continue;
    }

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim().toLowerCase())
      .filter(Boolean);

    if (cells.length < 3) {
      continue;
    }

    const matchedGroups = GLOSSARY_TABLE_COLUMNS.filter((group) => group.some((entry) => cells.includes(entry)));

    if (matchedGroups.length >= 3) {
      return cells;
    }
  }

  return null;
}

function isProductLikeInEngineering(section) {
  const analysis = section.signalAnalysis;

  return (
    section.docRole === "engineering"
    && (
      analysis.productHeadingMatches.length > 0
      || (analysis.productMatches.length >= 2 && analysis.engineeringMatches.length === 0)
    )
  );
}

function isEngineeringLikeInProduct(section) {
  const analysis = section.signalAnalysis;

  return (
    section.docRole === "product"
    && (
      analysis.engineeringHeadingMatches.length > 0
      || (analysis.engineeringMatches.length >= 2 && analysis.productMatches.length === 0)
    )
  );
}

function hasStatusLeakage(section) {
  if (section.filePath === "docs/strategy/ROADMAP-STATUS.md") {
    return false;
  }

  const anchoredSignals = collectAnchoredStatusSignals(section.body);
  const headingText = section.heading.toLowerCase();
  const hasStatusHeading = STATUS_HEADING_HINTS.some((hint) => headingText.includes(hint));

  return anchoredSignals.length >= 2 || (hasStatusHeading && section.signalAnalysis.statusMatches.length >= 2);
}

function redefinesGlobalPrinciples(section) {
  if (section.docFamily !== "feature-package") {
    return false;
  }

  const headingText = section.heading.toLowerCase();
  const headingHits = GLOBAL_PRINCIPLE_HEADING_HINTS.filter((hint) => headingText.includes(hint.toLowerCase()));
  const contentHits = GLOBAL_PRINCIPLE_CONTENT_HINTS.filter((hint) => section.text.includes(hint));

  return headingHits.length > 0 || contentHits.length >= 2;
}

function hasLocalGlossaryLikeTable(section) {
  if (section.filePath === "docs/governance/GLOSSARY.md") {
    return false;
  }

  return findGlossaryTableHeader(section.text) !== null;
}

function findDuplicateDefinitionPairs(semanticIndex) {
  const featureSections = semanticIndex.sections.filter((section) =>
    section.docFamily === "feature-package"
    && section.heading
    && normalizedLength(section.body) >= 50,
  );
  const globalSections = semanticIndex.sections.filter((section) =>
    section.docFamily === "global"
    && section.heading
    && normalizedLength(section.body) >= 50,
  );
  const matches = [];

  for (const featureSection of featureSections) {
    let bestMatch = null;

    for (const globalSection of globalSections) {
      if (featureSection.docRole !== globalSection.docRole) {
        continue;
      }

      const headingSimilarity = diceCoefficient(featureSection.heading, globalSection.heading);
      const bodySimilarity = diceCoefficient(featureSection.body, globalSection.body);

      if (headingSimilarity < 0.45 || bodySimilarity < 0.82) {
        continue;
      }

      const combinedScore = (headingSimilarity * 0.25) + (bodySimilarity * 0.75);

      if (!bestMatch || combinedScore > bestMatch.combinedScore) {
        bestMatch = {
          featureSection,
          globalSection,
          headingSimilarity,
          bodySimilarity,
          combinedScore,
        };
      }
    }

    if (bestMatch) {
      matches.push(bestMatch);
    }
  }

  return matches;
}

export function runHeuristicSemanticChecks(context, semanticIndex) {
  const results = [];

  for (const document of semanticIndex.documents) {
    if (!isActiveEnough(document.status)) {
      continue;
    }

    for (const section of document.sections) {
      if (isProductLikeInEngineering(section)) {
        const triggers = [
          ...section.signalAnalysis.productHeadingMatches.map((entry) => `heading:${entry}`),
          ...section.signalAnalysis.productMatches.map((entry) => `content:${entry}`),
        ];

        results.push(makeSemanticResult({
          rule_id: "semantic.role.product_content_in_engineering_doc",
          target: formatSectionTarget(section),
          context: context.mode,
          reason: "This section looks more like product scope than engineering implementation.",
          evidence: [section.heading || "(root section)"],
          suggestion: "Move user/problem/scope content into a PRD document, or reduce this section to implementation impact only.",
          owner_hint: "feature-owner",
          snapshot_key: `semantic.role.product_content_in_engineering_doc:${section.filePath}:${section.heading}`,
          semantic_type: "role_misplacement",
          trigger_signals: triggers,
        }));
      }

      if (isEngineeringLikeInProduct(section)) {
        const triggers = [
          ...section.signalAnalysis.engineeringHeadingMatches.map((entry) => `heading:${entry}`),
          ...section.signalAnalysis.engineeringMatches.map((entry) => `content:${entry}`),
        ];

        results.push(makeSemanticResult({
          rule_id: "semantic.role.engineering_content_in_product_doc",
          target: formatSectionTarget(section),
          context: context.mode,
          reason: "This section looks more like engineering contract details than product definition.",
          evidence: [section.heading || "(root section)"],
          suggestion: "Move API/schema/implementation details into TECH-SPEC, or rewrite this section in product language.",
          owner_hint: "feature-owner",
          snapshot_key: `semantic.role.engineering_content_in_product_doc:${section.filePath}:${section.heading}`,
          semantic_type: "role_misplacement",
          trigger_signals: triggers,
        }));
      }

      if (hasStatusLeakage(section)) {
        results.push(makeSemanticResult({
          rule_id: "semantic.ssot.status_leakage",
          target: formatSectionTarget(section),
          context: context.mode,
          reason: "This section looks like it is maintaining execution status outside the roadmap status SSOT.",
          evidence: [section.heading || "(root section)"],
          suggestion: "Keep execution status updates in docs/strategy/ROADMAP-STATUS.md and replace this section with a reference if needed.",
          owner_hint: "project-owner",
          snapshot_key: `semantic.ssot.status_leakage:${section.filePath}:${section.heading}`,
          semantic_type: "status_leakage",
          trigger_signals: section.signalAnalysis.statusMatches.map((entry) => `content:${entry}`),
        }));
      }

      if (redefinesGlobalPrinciples(section)) {
        const headingText = section.heading.toLowerCase();
        const triggers = [
          ...GLOBAL_PRINCIPLE_HEADING_HINTS
            .filter((hint) => headingText.includes(hint.toLowerCase()))
            .map((hint) => `heading:${hint}`),
          ...GLOBAL_PRINCIPLE_CONTENT_HINTS
            .filter((hint) => section.text.includes(hint))
            .map((hint) => `content:${hint}`),
        ];

        results.push(makeSemanticResult({
          rule_id: "semantic.ssot.feature_redefines_global_principles",
          category: "ssot",
          target: formatSectionTarget(section),
          context: context.mode,
          reason: "This feature package section looks like it is redefining project-wide product principles.",
          evidence: [section.heading || "(root section)"],
          suggested_docs: ["docs/strategy/PRODUCT-PRINCIPLES.md"],
          suggestion: "Keep project-wide prioritization and conflict rules in docs/strategy/PRODUCT-PRINCIPLES.md, and keep this feature section scoped to local behavior only.",
          owner_hint: "project-owner",
          snapshot_key: `semantic.ssot.feature_redefines_global_principles:${section.filePath}:${section.heading}`,
          semantic_type: "global_rule_leakage",
          trigger_signals: triggers,
        }));
      }

      if (hasLocalGlossaryLikeTable(section)) {
        const header = findGlossaryTableHeader(section.text) ?? [];
        results.push(makeSemanticResult({
          rule_id: "semantic.terminology.local_glossary_like_table",
          category: "terminology",
          target: formatSectionTarget(section),
          context: context.mode,
          reason: "This section defines a glossary-like terminology table outside the governance glossary.",
          evidence: [section.heading || "(root section)"],
          suggested_docs: ["docs/governance/GLOSSARY.md"],
          suggestion: "Move shared terminology definitions into docs/governance/GLOSSARY.md and replace this local table with links or scoped notes.",
          owner_hint: "project-owner",
          snapshot_key: `semantic.terminology.local_glossary_like_table:${section.filePath}:${section.heading}`,
          semantic_type: "global_rule_leakage",
          trigger_signals: header.map((entry) => `table:${entry}`),
        }));
      }
    }
  }

  for (const match of findDuplicateDefinitionPairs(semanticIndex)) {
    results.push(makeSemanticResult({
      rule_id: "semantic.similarity.duplicate_definition_sections",
      category: "semantic",
      target: formatSectionTarget(match.featureSection),
      context: context.mode,
      reason: "This feature-package section is highly similar to a same-role global section and may be redefining shared content.",
      evidence: [formatSectionTarget(match.globalSection)],
      suggested_docs: [match.globalSection.filePath],
      suggestion: `Keep shared definitions in ${match.globalSection.filePath} and trim the feature section down to feature-local deltas only.`,
      owner_hint: "feature-owner",
      snapshot_key: `semantic.similarity.duplicate_definition_sections:${match.featureSection.filePath}:${match.featureSection.heading}`,
      semantic_type: "duplicate_definition",
      trigger_signals: [
        `heading_similarity:${match.headingSimilarity.toFixed(2)}`,
        `body_similarity:${match.bodySimilarity.toFixed(2)}`,
        `global_target:${formatSectionTarget(match.globalSection)}`,
      ],
    }));
  }

  return results;
}
