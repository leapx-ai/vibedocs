import fs from "node:fs/promises";
import path from "node:path";

import { listFilesRecursive, pathExists } from "../filesystem/fs.js";
import { resolveDocsDir, resolveProjectRoot } from "../lib/project.js";

function parseMetadata(content) {
  const metadata = {};
  const keys = ["Last Updated", "Status", "Owner", "Purpose", "Scope", "Non-Goals", "Update Triggers", "Linked SSOT"];

  for (const key of keys) {
    const match = content.match(new RegExp(`^${key}:\\s*(.+)?$`, "m"));

    if (match) {
      metadata[key] = match[1]?.trim() ?? "";
    }
  }

  return metadata;
}

function parseStatus(content) {
  const match = content.match(/^Status:\s*(.+)$/m);
  return match ? match[1].trim() : undefined;
}

export async function buildRepositoryContext(targetPath, cwd, options = {}) {
  const projectRoot = resolveProjectRoot(targetPath, cwd);
  const docsDir = resolveDocsDir(projectRoot);
  const docsExists = await pathExists(docsDir);
  const selectedPaths = options.selectedPaths?.map((entry) => path.resolve(projectRoot, entry)) ?? [];

  const files = new Map();

  if (docsExists) {
    const absolutePaths = (await listFilesRecursive(docsDir)).filter((entry) => entry.endsWith(".md"));

    for (const absolutePath of absolutePaths) {
      if (selectedPaths.length > 0 && !selectedPaths.some((selected) => absolutePath.startsWith(selected))) {
        continue;
      }

      const content = await fs.readFile(absolutePath, "utf8");
      const relativePath = path.relative(projectRoot, absolutePath);

      files.set(relativePath, {
        absolutePath,
        relativePath,
        content,
        metadata: parseMetadata(content),
        status: parseStatus(content),
      });
    }
  }

  return {
    projectRoot,
    docsDir,
    docsExists,
    files,
    mode: options.mode ?? "repository",
  };
}
