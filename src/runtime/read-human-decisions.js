import fs from "node:fs/promises";
import path from "node:path";

import { pathExists } from "../filesystem/fs.js";
import { buildGateDecisionMap, normalizeGateDecisionStatus } from "./gate-decisions.js";

export async function readHumanDecisions(projectRoot) {
  const decisionLogPath = path.join(projectRoot, "docs", "governance", "DECISION-LOG.md");

  if (!(await pathExists(decisionLogPath))) {
    return [];
  }

  const content = await fs.readFile(decisionLogPath, "utf8");
  return parseDecisionLog(content);
}

export async function findLatestDecisionForGate(projectRoot, gate) {
  const decisions = await readHumanDecisions(projectRoot);

  return [...decisions].reverse().find((entry) => entry.gate === gate) ?? null;
}

export async function getLatestGateDecisionMap(projectRoot) {
  return buildGateDecisionMap(await readHumanDecisions(projectRoot));
}

function parseDecisionLog(content) {
  const lines = content.split("\n");
  const decisions = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("### ")) {
      if (current?.gate && current?.decision) {
        decisions.push(current);
      }

      current = {
        heading: line.slice(4).trim(),
      };
      continue;
    }

    if (!current) {
      continue;
    }

    const match = line.match(/^- ([A-Za-z]+):\s*(.+)$/);

    if (!match) {
      continue;
    }

    const [, rawKey, rawValue] = match;
    const value = rawValue.trim().replace(/^`|`$/g, "");
    const key = rawKey.toLowerCase();

    if (key === "gate") {
      current.gate = value;
    } else if (key === "decision") {
      current.decision = value;
    } else if (key === "status") {
      current.status = normalizeGateDecisionStatus(value);
    } else if (key === "feature") {
      current.featureSlug = value;
    } else if (key === "note") {
      current.note = value;
    }
  }

  if (current?.gate && current?.decision) {
    decisions.push(current);
  }

  return decisions;
}
