import { createReport } from "./create-report.js";

export function formatResults(results, options = {}) {
  const format = options.format ?? "text";
  const report = createReport(results, options);
  const summary = report.summary;

  if (format === "json") {
    return JSON.stringify(report, null, 2);
  }

  if (format === "markdown") {
    const lines = [
      "# Audit Results",
      "",
      `- Schema: ${report.schemaVersion}`,
      `- Tool: ${report.tool.name}@${report.tool.version}`,
      `- Mode: ${report.run.mode}`,
      `- Semantic: ${report.run.semanticMode}`,
      `- Passed: ${summary.passed}`,
      `- Warned: ${summary.warned}`,
      `- Failed: ${summary.failed}`,
      `- Skipped: ${summary.skipped}`,
      "",
    ];

    if (report.run.configPath) {
      lines.push(`- Config: ${report.run.configPath}`);
      lines.push("");
    }

    if (report.run.rulePacks.length > 0) {
      lines.push(`- Rule Packs: ${report.run.rulePacks.map((pack) => pack.id).join(", ")}`);
      lines.push("");
    }

    if (report.run.selectedPaths.length > 0) {
      lines.push(`- Selected Paths: ${report.run.selectedPaths.join(", ")}`);
      lines.push("");
    }

    if (report.run.changedPaths.length > 0) {
      lines.push(`- Changed Paths: ${report.run.changedPaths.join(", ")}`);
      lines.push("");
    }

    lines.push(
      "| Status | Severity | Category | Rule | Target | Reason | Suggested Docs |",
      "|---|---|---|---|---|---|---|",
    );

    for (const result of results) {
      lines.push(`| ${result.status} | ${result.severity} | ${result.category} | ${result.rule_id} | ${result.target} | ${result.reason} | ${(result.suggested_docs ?? []).join(", ")} |`);
    }

    return `${lines.join("\n")}\n`;
  }

  const lines = [
    `Schema: ${report.schemaVersion}`,
    `Tool: ${report.tool.name}@${report.tool.version}`,
    `Mode: ${report.run.mode}`,
    `Semantic: ${report.run.semanticMode}`,
    `Passed: ${summary.passed}  Warned: ${summary.warned}  Failed: ${summary.failed}  Skipped: ${summary.skipped}`,
    "",
  ];

  if (report.run.configPath) {
    lines.push(`Config: ${report.run.configPath}`);
    lines.push("");
  }

  if (report.run.rulePacks.length > 0) {
    lines.push(`Rule Packs: ${report.run.rulePacks.map((pack) => pack.id).join(", ")}`);
    lines.push("");
  }

  if (report.run.selectedPaths.length > 0) {
    lines.push(`Selected Paths: ${report.run.selectedPaths.join(", ")}`);
    lines.push("");
  }

  if (report.run.changedPaths.length > 0) {
    lines.push(`Changed Paths: ${report.run.changedPaths.join(", ")}`);
    lines.push("");
  }

  for (const result of results) {
    lines.push(`[${result.status.toUpperCase()}][${result.severity}][${result.category}] ${result.rule_id} -> ${result.target}`);
    lines.push(`  context: ${result.context}`);
    lines.push(`  reason: ${result.reason}`);

    if (result.suggestion) {
      lines.push(`  suggestion: ${result.suggestion}`);
    }

    if (result.suggested_docs?.length) {
      lines.push(`  suggested_docs: ${result.suggested_docs.join(", ")}`);
    }

    if (result.semantic_type) {
      lines.push(`  semantic_type: ${result.semantic_type}`);
    }

    if (result.trigger_signals?.length) {
      lines.push(`  trigger_signals: ${result.trigger_signals.join(", ")}`);
    }

    if (result.owner_hint) {
      lines.push(`  owner_hint: ${result.owner_hint}`);
    }

    if (result.evidence?.length) {
      lines.push(`  evidence: ${result.evidence.join(", ")}`);
    }

    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export function hasFailures(results) {
  return results.some((result) => result.status === "fail");
}
