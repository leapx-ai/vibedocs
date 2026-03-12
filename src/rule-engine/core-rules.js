import { inferAffectedDocs } from "./affected-docs.js";

const MINIMAL_DOCS = [
  "docs/governance/PROJECT-CONSTITUTION.md",
  "docs/governance/DOCUMENT-MAP.md",
  "docs/governance/GLOSSARY.md",
  "docs/strategy/PRODUCT-PRINCIPLES.md",
  "docs/strategy/ROADMAP-STATUS.md",
  "docs/product/FEATURE-PRD.md",
  "docs/engineering/TECH-SPEC.md",
  "docs/delivery/ACCEPTANCE-CHECKLIST.md",
];

const FEATURE_PACKAGE_FILES = ["PRD.md", "WIREFLOW.md", "TECH-SPEC.md", "ACCEPTANCE.md", "ANALYTICS.md"];
const REQUIRED_ACTIVE_FIELDS = ["Last Updated", "Owner", "Purpose", "Scope", "Non-Goals", "Update Triggers", "Linked SSOT"];
const STATUS_HEADINGS = ["## Done", "## In Progress", "## Blocked", "## Next Up"];

function makeResult(overrides) {
  return {
    status: "pass",
    severity: "info",
    category: "structure",
    target: "repo",
    context: "repository",
    reason: "",
    evidence: [],
    suggested_docs: [],
    suggestion: "",
    owner_hint: "project-owner",
    snapshot_key: "",
    ...overrides,
  };
}

function findGlossaryTerms(glossaryContent) {
  const rows = glossaryContent
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .slice(2);

  return rows
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 4 && cells[0] && cells[2])
    .map((cells) => ({
      term: cells[0],
      banned: cells[2]
        .split(/[、,\/]/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    }));
}

export const coreRules = [
  {
    id: "core.structure.minimal_docs_exist",
    title: "Minimal docs exist",
    category: "structure",
    severity: "high",
    contexts: ["repository", "diff"],
    run(context) {
      if (!context.docsExists) {
        return makeResult({
          rule_id: this.id,
          status: "fail",
          severity: this.severity,
          category: this.category,
          target: "docs",
          context: context.mode,
          reason: "Missing docs/ directory in the target repository.",
          suggestion: "Run `vibedocs init --mode minimal` to create the baseline document set.",
          snapshot_key: this.id,
        });
      }

      const missing = MINIMAL_DOCS.filter((relativePath) => !context.files.has(relativePath));

      if (missing.length > 0) {
        return makeResult({
          rule_id: this.id,
          status: "fail",
          severity: this.severity,
          category: this.category,
          target: "docs",
          context: context.mode,
          reason: "The repository is missing one or more minimal documents.",
          evidence: missing,
          suggestion: "Re-run `vibedocs init` or create the missing files manually.",
          snapshot_key: this.id,
        });
      }

      return makeResult({
        rule_id: this.id,
        target: "docs",
        context: context.mode,
        reason: "All minimal documents are present.",
        snapshot_key: this.id,
      });
    },
  },
  {
    id: "core.metadata.active_doc_required_fields",
    title: "Active docs have required metadata",
    category: "metadata",
    severity: "medium",
    contexts: ["repository", "diff"],
    run(context) {
      const activeDocs = [...context.files.values()].filter((file) => file.status?.startsWith("Active"));

      if (activeDocs.length === 0) {
        return makeResult({
          rule_id: this.id,
          status: "skip",
          severity: "info",
          category: this.category,
          target: "docs",
          context: context.mode,
          reason: "No Active documents found, so metadata completeness was skipped.",
          snapshot_key: this.id,
        });
      }

      const offenders = [];

      for (const file of activeDocs) {
        const missing = REQUIRED_ACTIVE_FIELDS.filter((field) => !file.metadata[field]);
        if (missing.length > 0) {
          offenders.push(`${file.relativePath} -> ${missing.join(", ")}`);
        }
      }

      if (offenders.length > 0) {
        return makeResult({
          rule_id: this.id,
          status: "warn",
          severity: this.severity,
          category: this.category,
          target: "docs",
          context: context.mode,
          reason: "Some Active documents are missing required metadata fields.",
          evidence: offenders,
          suggestion: "Fill in the standard metadata fields before relying on these files as SSOT.",
          snapshot_key: this.id,
        });
      }

      return makeResult({
        rule_id: this.id,
        target: "docs",
        context: context.mode,
        reason: "All Active documents contain the required metadata fields.",
        snapshot_key: this.id,
      });
    },
  },
  {
    id: "core.ssot.document_map_exists",
    title: "Document map exists",
    category: "ssot",
    severity: "high",
    contexts: ["repository", "diff"],
    run(context) {
      const relativePath = "docs/governance/DOCUMENT-MAP.md";
      const exists = context.files.has(relativePath);

      return exists
        ? makeResult({
            rule_id: this.id,
            category: this.category,
            target: relativePath,
            context: context.mode,
            reason: "DOCUMENT-MAP is present.",
            snapshot_key: this.id,
          })
        : makeResult({
            rule_id: this.id,
            status: "fail",
            severity: this.severity,
            category: this.category,
            target: relativePath,
            context: context.mode,
            reason: "DOCUMENT-MAP is missing, so SSOT ownership cannot be verified.",
            suggestion: "Create `docs/governance/DOCUMENT-MAP.md` and assign core SSOT ownership.",
            snapshot_key: this.id,
          });
    },
  },
  {
    id: "core.ssot.single_status_source",
    title: "Single status source",
    category: "ssot",
    severity: "high",
    contexts: ["repository", "diff"],
    run(context) {
      const allowedPath = "docs/strategy/ROADMAP-STATUS.md";
      const offenders = [...context.files.values()]
        .filter((file) => file.relativePath !== allowedPath)
        .filter((file) => STATUS_HEADINGS.some((heading) => file.content.includes(heading)))
        .map((file) => file.relativePath);

      if (offenders.length > 0) {
        return makeResult({
          rule_id: this.id,
          status: "fail",
          severity: this.severity,
          category: this.category,
          target: "docs",
          context: context.mode,
          reason: "Multiple documents appear to maintain execution status sections.",
          evidence: offenders,
          suggestion: "Keep Done / In Progress / Blocked / Next Up only in `docs/strategy/ROADMAP-STATUS.md`.",
          snapshot_key: this.id,
        });
      }

      return makeResult({
        rule_id: this.id,
        category: this.category,
        target: allowedPath,
        context: context.mode,
        reason: "Execution status headings are limited to the roadmap status document.",
        snapshot_key: this.id,
      });
    },
  },
  {
    id: "core.structure.feature_package_required_files",
    title: "Feature packages are complete",
    category: "structure",
    severity: "medium",
    contexts: ["repository", "diff"],
    run(context) {
      const featureDirs = new Map();

      for (const relativePath of context.files.keys()) {
        if (!relativePath.startsWith("docs/features/") || relativePath === "docs/features/README.md") {
          continue;
        }

        const parts = relativePath.split("/");
        if (parts.length >= 4) {
          const featureDir = parts.slice(0, 3).join("/");
          featureDirs.set(featureDir, featureDirs.get(featureDir) ?? new Set());
          featureDirs.get(featureDir).add(parts[3]);
        }
      }

      const offenders = [];

      for (const [featureDir, files] of featureDirs.entries()) {
        const missing = FEATURE_PACKAGE_FILES.filter((fileName) => !files.has(fileName));
        if (missing.length > 0) {
          offenders.push(`${featureDir} -> ${missing.join(", ")}`);
        }
      }

      if (offenders.length > 0) {
        return makeResult({
          rule_id: this.id,
          status: "warn",
          severity: this.severity,
          category: this.category,
          target: "docs/features",
          context: context.mode,
          reason: "Some feature packages are missing required files.",
          evidence: offenders,
          suggestion: "Run `vibedocs feature create <name>` or fill the missing files manually.",
          snapshot_key: this.id,
        });
      }

      return makeResult({
        rule_id: this.id,
        category: this.category,
        target: "docs/features",
        context: context.mode,
        reason: "All feature packages contain the required file set.",
        snapshot_key: this.id,
      });
    },
  },
  {
    id: "core.terminology.glossary_exists",
    title: "Glossary exists",
    category: "terminology",
    severity: "high",
    contexts: ["repository", "path", "diff"],
    run(context) {
      const relativePath = "docs/governance/GLOSSARY.md";
      const exists = context.files.has(relativePath);

      return exists
        ? makeResult({
            rule_id: this.id,
            category: this.category,
            target: relativePath,
            context: context.mode,
            reason: "GLOSSARY is present.",
            snapshot_key: this.id,
          })
        : makeResult({
            rule_id: this.id,
            status: "fail",
            severity: this.severity,
            category: this.category,
            target: relativePath,
            context: context.mode,
            reason: "GLOSSARY is missing, so terminology checks cannot be anchored.",
            suggestion: "Create `docs/governance/GLOSSARY.md` before running terminology checks.",
            snapshot_key: this.id,
          });
    },
  },
  {
    id: "core.terminology.glossary_term_drift",
    title: "Glossary term drift",
    category: "terminology",
    severity: "medium",
    contexts: ["repository", "path", "diff"],
    run(context) {
      const glossary = context.files.get("docs/governance/GLOSSARY.md");

      if (!glossary) {
        return makeResult({
          rule_id: this.id,
          status: "skip",
          severity: "info",
          category: this.category,
          target: "docs/governance/GLOSSARY.md",
          context: context.mode,
          reason: "GLOSSARY is missing, so term drift was skipped.",
          snapshot_key: this.id,
        });
      }

      const definitions = findGlossaryTerms(glossary.content);

      if (definitions.length === 0) {
        return makeResult({
          rule_id: this.id,
          status: "skip",
          severity: "info",
          category: this.category,
          target: glossary.relativePath,
          context: context.mode,
          reason: "GLOSSARY does not define any banned synonyms yet.",
          snapshot_key: this.id,
        });
      }

      const offenders = [];

      for (const file of context.files.values()) {
        if (file.relativePath === glossary.relativePath || file.status?.startsWith("Snapshot") || file.status?.startsWith("Archive")) {
          continue;
        }

        for (const definition of definitions) {
          for (const banned of definition.banned) {
            if (file.content.includes(banned)) {
              offenders.push(`${file.relativePath} -> "${banned}" (prefer "${definition.term}")`);
            }
          }
        }
      }

      if (offenders.length > 0) {
        return makeResult({
          rule_id: this.id,
          status: "warn",
          severity: this.severity,
          category: this.category,
          target: "docs",
          context: context.mode,
          reason: "Some documents still use banned glossary variants.",
          evidence: offenders,
          suggestion: "Normalize the flagged terms to the glossary-approved wording.",
          snapshot_key: this.id,
        });
      }

      return makeResult({
        rule_id: this.id,
        category: this.category,
        target: "docs",
        context: context.mode,
        reason: "No banned glossary variants were found in the scanned documents.",
        snapshot_key: this.id,
      });
    },
  },
  {
    id: "core.freshness.snapshot_not_used_as_active",
    title: "Snapshot files are not active entrypoints",
    category: "freshness",
    severity: "medium",
    contexts: ["repository", "diff"],
    run(context) {
      const snapshotDocs = new Set(
        [...context.files.values()]
          .filter((file) => file.status?.startsWith("Snapshot"))
          .map((file) => file.relativePath),
      );

      if (snapshotDocs.size === 0) {
        return makeResult({
          rule_id: this.id,
          status: "skip",
          severity: "info",
          category: this.category,
          target: "docs",
          context: context.mode,
          reason: "No Snapshot documents were found.",
          snapshot_key: this.id,
        });
      }

      const entrypoints = ["docs/README.md", "docs/governance/DOCUMENT-MAP.md"]
        .map((relativePath) => context.files.get(relativePath))
        .filter(Boolean);

      const offenders = [];

      for (const entrypoint of entrypoints) {
        const references = [...entrypoint.content.matchAll(/`(docs\/[^`]+\.md)`/g)].map((match) => match[1]);
        for (const reference of references) {
          if (snapshotDocs.has(reference)) {
            offenders.push(`${entrypoint.relativePath} -> ${reference}`);
          }
        }
      }

      if (offenders.length > 0) {
        return makeResult({
          rule_id: this.id,
          status: "warn",
          severity: this.severity,
          category: this.category,
          target: "docs",
          context: context.mode,
          reason: "Snapshot documents are still referenced by active entrypoints.",
          evidence: offenders,
          suggestion: "Remove or demote snapshot links from active navigation and SSOT maps.",
          snapshot_key: this.id,
        });
      }

      return makeResult({
        rule_id: this.id,
        category: this.category,
        target: "docs",
        context: context.mode,
        reason: "Snapshot documents are not referenced by active entrypoints.",
        snapshot_key: this.id,
      });
    },
  },
  {
    id: "core.diff.docs_touchpoint_present",
    title: "Changed paths include a docs touchpoint",
    category: "diff",
    severity: "medium",
    contexts: ["diff"],
    run(context) {
      const changedDocs = context.changedPaths.filter((entry) => entry.startsWith("docs/"));
      const changedNonDocs = context.changedPaths.filter((entry) => !entry.startsWith("docs/"));
      const suggestedDocs = inferAffectedDocs(context, changedNonDocs);

      if (context.changedPaths.length === 0) {
        return makeResult({
          rule_id: this.id,
          status: "skip",
          severity: "info",
          category: this.category,
          target: "repo",
          context: context.mode,
          reason: "No changed paths were provided for diff mode.",
          snapshot_key: this.id,
        });
      }

      if (changedNonDocs.length > 0 && changedDocs.length === 0) {
        return makeResult({
          rule_id: this.id,
          status: "warn",
          severity: this.severity,
          category: this.category,
          target: "repo",
          context: context.mode,
          reason: "Code or non-doc files changed without any matching docs updates in the changed set.",
          evidence: changedNonDocs,
          suggested_docs: suggestedDocs,
          suggestion: suggestedDocs.length > 0
            ? `Review the suggested docs touchpoints: ${suggestedDocs.join(", ")}.`
            : "Review whether ROADMAP, FEATURE-PRD, TECH-SPEC, ACCEPTANCE, or feature package docs should be updated alongside this change.",
          owner_hint: "feature-owner",
          snapshot_key: this.id,
        });
      }

      return makeResult({
        rule_id: this.id,
        category: this.category,
        target: "repo",
        context: context.mode,
        reason: "The changed set already includes at least one docs touchpoint.",
        evidence: changedDocs,
        snapshot_key: this.id,
      });
    },
  },
];
