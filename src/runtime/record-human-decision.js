import fs from "node:fs/promises";
import path from "node:path";

import { ensureDirectory, pathExists } from "../filesystem/fs.js";
import { normalizeGateDecisionStatus } from "./gate-decisions.js";
import { currentDateIso } from "../lib/date.js";

export async function recordHumanDecision(projectRoot, input = {}) {
  const status = normalizeGateDecisionStatus(input.status);
  const decisionLogPath = path.join(projectRoot, "docs", "governance", "DECISION-LOG.md");

  if (!(await pathExists(decisionLogPath))) {
    await ensureDirectory(path.dirname(decisionLogPath));
    await fs.writeFile(decisionLogPath, createDecisionLogSeed(input.owner), "utf8");
  }

  const content = await fs.readFile(decisionLogPath, "utf8");
  const next = appendDecisionEntry(content, input);

  if (next !== content) {
    await fs.writeFile(decisionLogPath, next, "utf8");
  }

  return {
    path: "docs/governance/DECISION-LOG.md",
    status: "recorded",
  };
}

function appendDecisionEntry(content, input) {
  const date = currentDateIso();
  const status = normalizeGateDecisionStatus(input.status);
  const marker = `Gate: \`${input.gate}\``;
  const duplicate = content.includes(marker) && content.includes(`Decision: \`${input.decision}\``);

  if (duplicate) {
    return content;
  }

  const entry = [
    `### ${date} - ${input.gate}`,
    "",
    `- Gate: \`${input.gate}\``,
    `- Decision: \`${input.decision}\``,
    `- Status: \`${status}\``,
    input.featureSlug ? `- Feature: \`${input.featureSlug}\`` : null,
    input.note ? `- Note: ${input.note}` : null,
    "",
  ].filter(Boolean).join("\n");

  return `${content.replace(/\s*$/, "")}\n${entry}\n`;
}

function createDecisionLogSeed(owner = "TODO") {
  const date = currentDateIso();

  return `# Decision Log

Last Updated: ${date}
Status: Draft
Owner: ${owner}
Purpose: Record explicit human decisions that unblock runtime gates and document transitions.
Scope: Human approvals and rejections that affect SSOT, status, routing, or release flow.
Non-Goals:

- Do not duplicate full implementation details
- Do not replace roadmap status or release notes

Update Triggers:

- A runtime gate requires human confirmation
- A status promotion or downgrade is approved
- A human resolves an SSOT or scope conflict

Linked SSOT:

- \`docs/governance/DOCUMENT-MAP.md\`

## Decisions

`;
}
