import fs from "node:fs/promises";
import path from "node:path";

import { listFilesRecursive, pathExists } from "../filesystem/fs.js";
import { resolveProjectRoot } from "../lib/project.js";
import { buildRepositoryContext } from "../rule-engine/context.js";

const SSOT_PATHS = [
  "docs/README.md",
  "docs/governance/DOCUMENT-MAP.md",
  "docs/governance/GLOSSARY.md",
  "docs/strategy/ROADMAP-STATUS.md",
];

export async function bootstrapRuntime(targetPath, cwd, options = {}) {
  const projectRoot = resolveProjectRoot(targetPath, cwd);
  const context = await buildRepositoryContext(targetPath, cwd, {
    mode: options.changedPaths?.length ? "diff" : "repository",
    changedPaths: options.changedPaths ?? [],
  });
  const guidesDir = path.join(projectRoot, "guides");
  const guideFiles = [];

  if (await pathExists(guidesDir)) {
    const files = await listFilesRecursive(guidesDir);

    for (const absolutePath of files.filter((entry) => entry.endsWith(".md"))) {
      guideFiles.push(path.relative(projectRoot, absolutePath));
    }
  }

  const requestedFeatureSlug = options.featureSlug ? String(options.featureSlug).trim() : undefined;
  const featureSlug = requestedFeatureSlug || inferFeatureSlug(context, options.changedPaths ?? []);
  const featureDocs = featureSlug
    ? [...context.files.keys()].filter((relativePath) => relativePath.startsWith(`docs/features/${featureSlug}/`))
    : [];
  const ssotDocs = SSOT_PATHS.filter((relativePath) => context.files.has(relativePath));
  const supportingDocs = featureDocs.length > 0
    ? featureDocs
    : [...context.files.keys()].filter((relativePath) => !ssotDocs.includes(relativePath)).slice(0, 10);
  const missingContext = SSOT_PATHS.filter((relativePath) => !context.files.has(relativePath));

  return {
    context,
    loadedContext: {
      projectRoot,
      mode: context.mode,
      docsExists: context.docsExists,
      loadedFiles: [...context.files.keys()],
      guideFiles,
      ssotDocs,
      supportingDocs,
      missingContext,
      featureContext: featureSlug ? { slug: featureSlug, docs: featureDocs } : null,
    },
  };
}

function inferFeatureSlug(context, changedPaths) {
  const candidates = new Set();

  for (const relativePath of [...context.files.keys(), ...changedPaths]) {
    const match = String(relativePath).match(/docs\/features\/([^/]+)\//);

    if (match) {
      candidates.add(match[1]);
    }
  }

  return candidates.size === 1 ? [...candidates][0] : null;
}
