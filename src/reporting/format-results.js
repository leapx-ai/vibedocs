function summarize(results) {
  const summary = {
    passed: 0,
    warned: 0,
    failed: 0,
    skipped: 0,
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
  }

  return summary;
}

export function formatResults(results, format) {
  const summary = summarize(results);

  if (format === "json") {
    return JSON.stringify({ summary, results }, null, 2);
  }

  if (format === "markdown") {
    const lines = [
      "# Audit Results",
      "",
      `- Passed: ${summary.passed}`,
      `- Warned: ${summary.warned}`,
      `- Failed: ${summary.failed}`,
      `- Skipped: ${summary.skipped}`,
      "",
      "| Status | Severity | Rule | Target | Reason |",
      "|---|---|---|---|---|",
    ];

    for (const result of results) {
      lines.push(`| ${result.status} | ${result.severity} | ${result.rule_id} | ${result.target} | ${result.reason} |`);
    }

    return `${lines.join("\n")}\n`;
  }

  const lines = [
    `Passed: ${summary.passed}  Warned: ${summary.warned}  Failed: ${summary.failed}  Skipped: ${summary.skipped}`,
    "",
  ];

  for (const result of results) {
    lines.push(`[${result.status.toUpperCase()}][${result.severity}] ${result.rule_id} -> ${result.target}`);
    lines.push(`  reason: ${result.reason}`);

    if (result.suggestion) {
      lines.push(`  suggestion: ${result.suggestion}`);
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
