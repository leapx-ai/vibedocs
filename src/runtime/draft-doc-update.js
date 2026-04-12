import fs from "node:fs/promises";
import path from "node:path";

import { scaffoldDocsDir, templatesDir } from "../assets.js";
import { ensureDirectory, pathExists } from "../filesystem/fs.js";
import { hydrateScaffoldContent, hydrateTemplateContent } from "../filesystem/placeholders.js";
import { currentDateIso } from "../lib/date.js";
import { toDisplayName } from "../lib/slug.js";

const FEATURE_TEMPLATE_MAP = {
  "PRD.md": { source: "FEATURE-PRD.template.md", title: (name) => `${name} PRD` },
  "WIREFLOW.md": { source: "WIREFLOW.template.md", title: (name) => `${name} Wireflow` },
  "TECH-SPEC.md": { source: "TECH-SPEC.template.md", title: (name) => `${name} Tech Spec` },
  "ACCEPTANCE.md": { source: "ACCEPTANCE-CHECKLIST.template.md", title: (name) => `${name} Acceptance` },
  "ANALYTICS.md": { source: "ANALYTICS-EVENTS.template.md", title: (name) => `${name} Analytics` },
};

export async function applyDraftDocUpdates(runtimeReport, options = {}) {
  const projectRoot = runtimeReport.input?.projectRoot;

  if (!projectRoot) {
    throw new Error("Runtime report is missing projectRoot, so draft updates cannot be applied.");
  }

  const targetDocs = runtimeReport.routing?.mustUpdate ?? [];
  const writes = [];
  const date = currentDateIso();
  const owner = options.owner ?? "TODO";

  for (const relativePath of targetDocs) {
    const absolutePath = path.join(projectRoot, relativePath);
    const exists = await pathExists(absolutePath);

    if (!exists) {
      const seeded = await seedDocFile(relativePath, absolutePath, {
        date,
        owner,
      });

      writes.push({
        path: relativePath,
        action: seeded ? "created" : "skipped",
        reason: seeded ? "Seeded missing document before applying runtime draft update." : "No known template or scaffold source for this target.",
      });

      if (!seeded) {
        continue;
      }
    }

    const existing = await fs.readFile(absolutePath, "utf8");
    const draftUpdate = appendRuntimeDraftSection(existing, {
      task: runtimeReport.input.task,
      changeType: runtimeReport.classification?.changeType,
      executionMode: runtimeReport.routing?.executionMode,
      date,
      relativePath,
    });

    if (draftUpdate.content === existing) {
      writes.push({
        path: relativePath,
        action: "unchanged",
        reason: "An equivalent runtime draft section already exists for this task.",
      });
      continue;
    }

    await fs.writeFile(absolutePath, draftUpdate.content, "utf8");
    writes.push({
      path: relativePath,
      action: exists ? "updated" : "created_and_updated",
      reason: "Applied runtime draft section to the routed target document.",
      anchorHeading: draftUpdate.anchorHeading ?? null,
      insertionStrategy: draftUpdate.insertionStrategy,
    });
  }

  return {
    attempted: targetDocs.length,
    writes,
    updated: writes.filter((entry) => entry.action === "updated" || entry.action === "created_and_updated").length,
    created: writes.filter((entry) => entry.action === "created" || entry.action === "created_and_updated").length,
    unchanged: writes.filter((entry) => entry.action === "unchanged").length,
    skipped: writes.filter((entry) => entry.action === "skipped").length,
  };
}

async function seedDocFile(relativePath, absolutePath, options) {
  const source = await resolveSeedSource(relativePath);

  if (!source) {
    return false;
  }

  await ensureDirectory(path.dirname(absolutePath));
  const rawContent = await fs.readFile(source.path, "utf8");
  const content = source.kind === "feature-template"
    ? hydrateTemplateContent(rawContent, {
        date: options.date,
        owner: options.owner,
        title: source.title,
      })
    : hydrateScaffoldContent(rawContent, {
        date: options.date,
        owner: options.owner,
        projectName: "Runtime Draft",
        mode: "minimal",
      });
  await fs.writeFile(absolutePath, content, "utf8");
  return true;
}

async function resolveSeedSource(relativePath) {
  const featureMatch = relativePath.match(/^docs\/features\/([^/]+)\/([^/]+)$/);

  if (featureMatch) {
    const slug = featureMatch[1];
    const fileName = featureMatch[2];
    const mapping = FEATURE_TEMPLATE_MAP[fileName];

    if (!mapping) {
      return null;
    }

    return {
      kind: "feature-template",
      path: path.join(templatesDir, mapping.source),
      title: mapping.title(toDisplayName(slug)),
    };
  }

  if (!relativePath.startsWith("docs/")) {
    return null;
  }

  const scaffoldRelativePath = relativePath.slice("docs/".length);
  const scaffoldPath = path.join(scaffoldDocsDir, scaffoldRelativePath);

  return (await pathExists(scaffoldPath))
    ? { kind: "scaffold", path: scaffoldPath }
    : null;
}

function appendRuntimeDraftSection(content, details) {
  const marker = `Task: ${details.task}`;

  if (content.includes("## Runtime Draft Update") && content.includes(marker)) {
    return {
      content,
      anchorHeading: null,
      insertionStrategy: "duplicate-skip",
    };
  }

  const section = buildRuntimeDraftSection(details);
  const anchorHeading = selectAnchorHeading(details.relativePath, details.changeType);

  if (anchorHeading) {
    const inserted = insertAfterHeading(content, anchorHeading, section);

    if (inserted.content !== content) {
      return inserted;
    }
  }

  return {
    content: `${content.replace(/\s*$/, "")}\n${section}`,
    anchorHeading: anchorHeading ?? null,
    insertionStrategy: "append",
  };
}

function buildRuntimeDraftSection(details) {
  const header = [
    "",
    "## Runtime Draft Update",
    "",
    `Last Updated: ${details.date}`,
    `Task: ${details.task}`,
    `Change Type: ${details.changeType ?? "unknown"}`,
    `Execution Mode: ${details.executionMode ?? "unknown"}`,
    "",
    "This section was added by `vibedocs runtime run --write-drafts` and should be reviewed by a human before promotion.",
    "",
  ];

  const body = buildDocSpecificDraftBody(details.relativePath, details);
  return [...header, ...body, ""].join("\n");
}

function buildDocSpecificDraftBody(relativePath, details) {
  if (relativePath.endsWith("/PRD.md") || relativePath === "docs/product/FEATURE-PRD.md") {
    return [
      "### Suggested Scope Update",
      "",
      `- Proposed change to capture: ${details.task}`,
      "- User-facing impact:",
      "- Scope adjustment or clarification:",
      "",
      "### Follow-up Checks",
      "",
      "- Confirm whether acceptance criteria also need updates.",
      "- Confirm whether wireflow or analytics docs should change.",
    ];
  }

  if (relativePath.endsWith("/TECH-SPEC.md") || relativePath === "docs/engineering/TECH-SPEC.md") {
    return [
      "### Interface / Contract Impact",
      "",
      `- Implementation change to define: ${details.task}`,
      "- Inputs or outputs affected:",
      "- Data structures or interfaces to revise:",
      "",
      "### Regression and Constraint Notes",
      "",
      "- Regression points to verify:",
      "- Invariants or error handling to review:",
    ];
  }

  if (relativePath.endsWith("/ACCEPTANCE.md") || relativePath === "docs/delivery/ACCEPTANCE-CHECKLIST.md") {
    return [
      "### Verification Path",
      "",
      `1. Verify the updated behavior for: ${details.task}`,
      "2. Confirm expected state transitions.",
      "3. Check edge cases and failure paths.",
      "",
      "### Expected Results",
      "",
      "- Expected UI / output:",
      "- Expected events / data:",
      "- Required regression checks:",
    ];
  }

  if (relativePath.endsWith("/WIREFLOW.md") || relativePath === "docs/design/WIREFLOW.md") {
    return [
      "### Flow Update",
      "",
      `- Scenario change to map: ${details.task}`,
      "- Entry point affected:",
      "- Core step changes:",
      "",
      "### State Notes",
      "",
      "- Normal state:",
      "- Empty / error / restricted states:",
    ];
  }

  if (relativePath.endsWith("/ANALYTICS.md") || relativePath === "docs/operations/ANALYTICS-EVENTS.md") {
    return [
      "### Event Drafts",
      "",
      "| Event | Trigger | Key Fields | Notes |",
      "|---|---|---|---|",
      `|  | ${details.task} |  | Added by runtime draft update |`,
      "",
      "### Review Notes",
      "",
      "- Confirm naming against glossary.",
      "- Confirm downstream dashboards or release notes impact.",
    ];
  }

  if (relativePath === "docs/strategy/ROADMAP-STATUS.md") {
    return [
      "### Proposed Status Sync",
      "",
      `- Work item to reflect: ${details.task}`,
      "- Section to update (`Done`, `In Progress`, `Blocked`, `Next Up`):",
      "- Related docs to sync after status update:",
    ];
  }

  if (relativePath === "docs/governance/GLOSSARY.md") {
    return [
      "### Candidate Term Updates",
      "",
      "| Term | Definition | Banned Synonyms | SSOT |",
      "|---|---|---|---|",
      `|  | Introduced while working on: ${details.task} |  |  |`,
      "",
      "### Review Notes",
      "",
      "- Check whether this term already exists under another name.",
      "- Confirm downstream docs that should adopt the standard term.",
    ];
  }

  return [
    "### Draft Notes",
    "",
    `- Proposed update to review: ${details.task}`,
    "- Files or sections likely affected:",
    "- Human follow-up required before promotion:",
  ];
}

function selectAnchorHeading(relativePath, changeType) {
  if (relativePath.endsWith("/PRD.md") || relativePath === "docs/product/FEATURE-PRD.md") {
    return changeType === "acceptance_change" ? "## 6. Acceptance Criteria" : "## 5. Rules and Boundaries";
  }

  if (relativePath.endsWith("/TECH-SPEC.md") || relativePath === "docs/engineering/TECH-SPEC.md") {
    return changeType === "contract_change" ? "## 5. Data Structures / Interfaces" : "## 6. Validation and Regression Points";
  }

  if (relativePath.endsWith("/ACCEPTANCE.md") || relativePath === "docs/delivery/ACCEPTANCE-CHECKLIST.md") {
    return changeType === "acceptance_change" ? "## 2. Steps" : "## 4. Expected Events / Data";
  }

  if (relativePath.endsWith("/WIREFLOW.md") || relativePath === "docs/design/WIREFLOW.md") {
    return "## 2. Core Flow";
  }

  if (relativePath.endsWith("/ANALYTICS.md") || relativePath === "docs/operations/ANALYTICS-EVENTS.md") {
    return "## Event List";
  }

  if (relativePath === "docs/strategy/ROADMAP-STATUS.md") {
    return "## 3. Documentation Sync Actions";
  }

  if (relativePath === "docs/governance/GLOSSARY.md") {
    return "## 2. Terms";
  }

  return null;
}

function insertAfterHeading(content, heading, section) {
  const lines = content.split("\n");
  const headingIndex = lines.findIndex((line) => line.trim() === heading);

  if (headingIndex === -1) {
    return {
      content,
      anchorHeading: null,
      insertionStrategy: "heading-not-found",
    };
  }

  let insertAt = headingIndex + 1;

  if (lines[insertAt] !== "") {
    lines.splice(insertAt, 0, "");
    insertAt += 1;
  }

  while (insertAt < lines.length && lines[insertAt] === "") {
    insertAt += 1;
  }

  const sectionLines = section.trimEnd().split("\n");
  lines.splice(insertAt, 0, ...sectionLines, "");
  return {
    content: lines.join("\n").replace(/\s*$/, "\n"),
    anchorHeading: heading,
    insertionStrategy: "insert-after-heading",
  };
}
