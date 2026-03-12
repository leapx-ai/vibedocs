import { REPORT_SCHEMA_VERSION, TOOL_NAME, TOOL_VERSION } from "../meta.js";

function summarize(results) {
  const summary = {
    passed: 0,
    warned: 0,
    failed: 0,
    skipped: 0,
    bySeverity: {},
    byCategory: {},
  };

  for (const result of results) {
    if (result.status === "pass") {
      summary.passed += 1;
    } else if (result.status === "warn") {
      summary.warned += 1;
    } else if (result.status === "fail") {
      summary.failed += 1;
    } else if (result.status === "skip") {
      summary.skipped += 1;
    }

    summary.bySeverity[result.severity] = (summary.bySeverity[result.severity] ?? 0) + 1;
    summary.byCategory[result.category] = (summary.byCategory[result.category] ?? 0) + 1;
  }

  return summary;
}

export function createReport(results, options = {}) {
  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    tool: {
      name: TOOL_NAME,
      version: TOOL_VERSION,
    },
    run: {
      generatedAt: new Date().toISOString(),
      mode: options.mode ?? "repository",
      projectRoot: options.projectRoot ?? null,
      docsDir: options.docsDir ?? null,
      configPath: options.configPath ?? null,
      changedPaths: options.changedPaths ?? [],
      selectedPaths: options.selectedPaths ?? [],
      rulePacks: options.rulePacks ?? [],
    },
    summary: summarize(results),
    results,
  };
}
