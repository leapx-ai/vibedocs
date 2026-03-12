import fs from "node:fs/promises";
import path from "node:path";

import { pathExists } from "../filesystem/fs.js";

const SEVERITIES = new Set(["info", "low", "medium", "high", "critical"]);

function assertString(value, message) {
  if (value !== undefined && typeof value !== "string") {
    throw new Error(message);
  }
}

function validateRuleOverride(ruleId, override, packPath) {
  if (override === null || typeof override !== "object" || Array.isArray(override)) {
    throw new Error(`Invalid rule pack ${packPath}: override for "${ruleId}" must be an object.`);
  }

  if (override.enabled !== undefined && typeof override.enabled !== "boolean") {
    throw new Error(`Invalid rule pack ${packPath}: "enabled" for "${ruleId}" must be boolean.`);
  }

  if (override.severity !== undefined && !SEVERITIES.has(String(override.severity))) {
    throw new Error(`Invalid rule pack ${packPath}: "severity" for "${ruleId}" is not supported.`);
  }

  assertString(override.ownerHint, `Invalid rule pack ${packPath}: "ownerHint" for "${ruleId}" must be a string.`);
  assertString(override.suggestion, `Invalid rule pack ${packPath}: "suggestion" for "${ruleId}" must be a string.`);
}

function validateRulePack(pack, packPath) {
  if (pack === null || typeof pack !== "object" || Array.isArray(pack)) {
    throw new Error(`Invalid rule pack ${packPath}: expected a JSON object.`);
  }

  assertString(pack.id, `Invalid rule pack ${packPath}: "id" must be a string.`);
  assertString(pack.name, `Invalid rule pack ${packPath}: "name" must be a string.`);

  if (pack.rules !== undefined && (pack.rules === null || typeof pack.rules !== "object" || Array.isArray(pack.rules))) {
    throw new Error(`Invalid rule pack ${packPath}: "rules" must be an object.`);
  }

  for (const [ruleId, override] of Object.entries(pack.rules ?? {})) {
    validateRuleOverride(ruleId, override, packPath);
  }
}

function mergeRulePacks(rulePacks) {
  const merged = {};

  for (const pack of rulePacks) {
    for (const [ruleId, override] of Object.entries(pack.rules ?? {})) {
      merged[ruleId] = {
        ...(merged[ruleId] ?? {}),
        ...override,
      };
    }
  }

  return merged;
}

export async function loadRulePacks(projectRoot, relativePaths = []) {
  const resolvedPaths = [...new Set(relativePaths)].map((entry) => path.resolve(projectRoot, entry));
  const packs = [];

  for (const packPath of resolvedPaths) {
    if (!(await pathExists(packPath))) {
      throw new Error(`Rule pack not found: ${packPath}`);
    }

    const rawPack = await fs.readFile(packPath, "utf8");
    const pack = JSON.parse(rawPack);
    validateRulePack(pack, packPath);
    packs.push({
      id: pack.id ?? path.basename(packPath, path.extname(packPath)),
      name: pack.name ?? path.basename(packPath),
      path: packPath,
      rules: pack.rules ?? {},
    });
  }

  return {
    packs,
    overrides: mergeRulePacks(packs),
  };
}
