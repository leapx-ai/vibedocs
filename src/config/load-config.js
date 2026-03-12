import fs from "node:fs/promises";
import path from "node:path";

import { pathExists } from "../filesystem/fs.js";

const CONFIG_FILE_NAMES = ["vibedocs.config.json", ".vibedocsrc.json"];

function assertStringArray(value, key) {
  if (value === undefined) {
    return;
  }

  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`Invalid config: "${key}" must be an array of strings.`);
  }
}

function validateConfig(config, configPath) {
  if (config === null || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(`Invalid config in ${configPath}: expected a JSON object.`);
  }

  const allowedModes = new Set(["minimal", "standard", "full"]);
  const allowedSlugStyles = new Set(["kebab", "snake"]);

  if (config.projectName !== undefined && typeof config.projectName !== "string") {
    throw new Error(`Invalid config in ${configPath}: "projectName" must be a string.`);
  }

  if (config.owner !== undefined && typeof config.owner !== "string") {
    throw new Error(`Invalid config in ${configPath}: "owner" must be a string.`);
  }

  if (config.defaultMode !== undefined && !allowedModes.has(String(config.defaultMode))) {
    throw new Error(`Invalid config in ${configPath}: "defaultMode" must be minimal, standard, or full.`);
  }

  if (config.featureSlugStyle !== undefined && !allowedSlugStyles.has(String(config.featureSlugStyle))) {
    throw new Error(`Invalid config in ${configPath}: "featureSlugStyle" must be kebab or snake.`);
  }

  assertStringArray(config.glossaryPaths, "glossaryPaths");
  assertStringArray(config.rulePacks, "rulePacks");
}

export async function loadProjectConfig(projectRoot) {
  for (const fileName of CONFIG_FILE_NAMES) {
    const configPath = path.join(projectRoot, fileName);

    if (!(await pathExists(configPath))) {
      continue;
    }

    const rawConfig = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(rawConfig);
    validateConfig(config, configPath);
    return {
      path: configPath,
      values: config,
    };
  }

  return {
    path: null,
    values: {},
  };
}
