import fs from "node:fs/promises";
import path from "node:path";

export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDirectory(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

export async function listFilesRecursive(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(entryPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

export async function collectConflicts(paths) {
  const conflicts = [];

  for (const targetPath of paths) {
    if (await pathExists(targetPath)) {
      conflicts.push(targetPath);
    }
  }

  return conflicts;
}
