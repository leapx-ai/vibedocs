import { parseArgs, getListOption, getStringOption } from "../cli/args.js";
import { runGlossaryCheck } from "../api/run-glossary-check.js";
import { formatResults, hasFailures } from "../reporting/format-results.js";
import { emitReport } from "../reporting/write-report.js";

export async function handleGlossaryCheckCommand(argv, io) {
  const { positionals, options } = parseArgs(argv);
  const targetPath = positionals[0];
  const format = getStringOption(options, "format", "text");
  const outputPath = getStringOption(options, "output");
  const selectedPaths = getListOption(options, "path");
  const rulePackPaths = getListOption(options, "rule-pack");
  const report = await runGlossaryCheck(targetPath, io.cwd, {
    selectedPaths,
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
