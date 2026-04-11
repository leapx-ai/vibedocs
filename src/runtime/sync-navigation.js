import fs from "node:fs/promises";
import path from "node:path";

import { ensureDirectory, pathExists } from "../filesystem/fs.js";
import { currentDateIso } from "../lib/date.js";

export async function syncNavigation(runtimeReport) {
  const projectRoot = runtimeReport.input?.projectRoot;

  if (!projectRoot) {
    throw new Error("Runtime report is missing projectRoot, so navigation cannot be synced.");
  }

  const featureSlug = runtimeReport.input?.featureSlug;

  if (!featureSlug) {
    return {
      updatedFiles: [],
      summary: "no-feature-context",
    };
  }

  const updatedFiles = [];
  const docsReadmePath = path.join(projectRoot, "docs", "README.md");
  const documentMapPath = path.join(projectRoot, "docs", "governance", "DOCUMENT-MAP.md");

  if (await pathExists(docsReadmePath)) {
    const original = await fs.readFile(docsReadmePath, "utf8");
    const next = syncDocsReadme(original, featureSlug);

    if (next !== original) {
      await fs.writeFile(docsReadmePath, next, "utf8");
      updatedFiles.push("docs/README.md");
    }
  }

  const decisionLogPath = path.join(projectRoot, "docs", "governance", "DECISION-LOG.md");
  if (!(await pathExists(decisionLogPath))) {
    await ensureDirectory(path.dirname(decisionLogPath));
    await fs.writeFile(decisionLogPath, createDecisionLogSeed(), "utf8");
    updatedFiles.push("docs/governance/DECISION-LOG.md");
  }

  if (await pathExists(documentMapPath)) {
    const original = await fs.readFile(documentMapPath, "utf8");
    const next = syncDocumentMap(original, featureSlug);

    if (next !== original) {
      await fs.writeFile(documentMapPath, next, "utf8");
      updatedFiles.push("docs/governance/DOCUMENT-MAP.md");
    }
  }

  return {
    updatedFiles,
    summary: updatedFiles.length > 0 ? `synced ${updatedFiles.length} navigation file(s)` : "unchanged",
  };
}

function syncDocsReadme(content, featureSlug) {
  const featurePath = `docs/features/${featureSlug}/`;
  const sectionHeading = "## 6. Feature Packages";
  const line = `- \`${featurePath}\` - active working package for \`${featureSlug}\``;

  if (content.includes(line)) {
    return content;
  }

  if (content.includes(sectionHeading)) {
    return content.replace(sectionHeading, `${sectionHeading}\n\n${line}`);
  }

  return `${content.replace(/\s*$/, "")}\n\n${sectionHeading}\n\n${line}\n`;
}

function syncDocumentMap(content, featureSlug) {
  const row = `| \`docs/features/${featureSlug}/PRD.md\` | Draft | Feature-local draft created by runtime flow |`;

  if (content.includes(row)) {
    return content;
  }

  const tableHeading = "## 3. Current Non-SSOT Documents";

  if (content.includes(tableHeading)) {
    return content.replace("|  |  |  |", `${row}\n|  |  |  |`);
  }

  return `${content.replace(/\s*$/, "")}\n\n${tableHeading}\n\n| Document | Status | Reason |\n|---|---|---|\n${row}\n`;
}

function createDecisionLogSeed() {
  const date = currentDateIso();

  return `# Decision Log

Last Updated: ${date}
Status: Draft
Owner: TODO
Purpose: Record explicit human decisions that unblock runtime gates and documentation transitions.
Scope: Human approvals and rejections that affect SSOT, status, or release flow.
Non-Goals:

- Do not duplicate full feature specs
- Do not replace roadmap or release notes

Update Triggers:

- A runtime gate requires human confirmation
- A human approves or rejects a status transition
- A human resolves an SSOT conflict

Linked SSOT:

- \`docs/governance/DOCUMENT-MAP.md\`

## Decisions

`;
}
