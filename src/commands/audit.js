import { parseArgs, getListOption, getStringOption } from "../cli/args.js";
import { runAudit } from "../api/run-audit.js";
import { formatResults, hasFailures } from "../reporting/format-results.js";
import { emitReport } from "../reporting/write-report.js";

export async function handleAuditCommand(argv, io) {
  const { positionals, options } = parseArgs(argv);
  const format = getStringOption(options, "format", "text");
  const outputPath = getStringOption(options, "output");
  const targetPath = positionals[0];
  const changedPaths = getListOption(options, "changed");
  const rulePackPaths = getListOption(options, "rule-pack");
  const report = await runAudit(targetPath, io.cwd, {
    changedPaths,
    rulePackPaths,
  });
  const content = formatResults(report.results, {
    format,
    ...report.run,
    rulePacks: report.run.rulePacks,
  });
  await emitReport(content, io, outputPath, io.cwd);
  return hasFailures(report.results) ? 1 : 0;
}
