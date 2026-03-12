import path from "node:path";

export function resolveProjectRoot(inputPath, cwd) {
  const resolved = inputPath ? path.resolve(cwd, inputPath) : cwd;
  return path.basename(resolved) === "docs" ? path.dirname(resolved) : resolved;
}

export function resolveDocsDir(projectRoot) {
  return path.join(projectRoot, "docs");
}
