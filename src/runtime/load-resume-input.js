import fs from "node:fs/promises";
import path from "node:path";

export async function loadResumeInputFromReport(projectRoot, reportPath) {
  const absolutePath = path.resolve(projectRoot, reportPath);
  const raw = await fs.readFile(absolutePath, "utf8");
  const report = JSON.parse(raw);

  return {
    task: report.input?.task ?? null,
    featureSlug: report.input?.featureSlug ?? null,
    changedPaths: report.input?.changedPaths ?? [],
    sourceReport: absolutePath,
  };
}
