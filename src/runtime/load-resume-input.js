import { readRuntimeReport } from "./runtime-report-io.js";

export async function loadResumeInputFromReport(projectRoot, reportPath) {
  const { absolutePath, report } = await readRuntimeReport(projectRoot, reportPath);

  return {
    task: report.input?.task ?? null,
    featureSlug: report.input?.featureSlug ?? null,
    changedPaths: report.input?.changedPaths ?? [],
    sourceReport: absolutePath,
  };
}
