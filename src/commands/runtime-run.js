import { getBooleanOption, getListOption, getStringOption, parseArgs } from "../cli/args.js";
import { runRuntime } from "../runtime/index.js";
import { emitReport } from "../reporting/write-report.js";
import { formatRuntimeReport } from "../runtime/report.js";

export async function handleRuntimeRunCommand(argv, io) {
  const { positionals, options } = parseArgs(argv);
  const targetPath = positionals[0];
  const task = getStringOption(options, "task");
  const featureSlug = getStringOption(options, "feature");
  const format = getStringOption(options, "format", "text");
  const outputPath = getStringOption(options, "output");
  const semanticMode = getStringOption(options, "semantic", "heuristic");
  const changedPaths = getListOption(options, "changed");
  const writeDrafts = getBooleanOption(options, "write-drafts");
  const report = await runRuntime(targetPath, io.cwd, {
    task,
    featureSlug,
    semantic: semanticMode,
    changedPaths,
    writeDrafts,
  });
  const content = formatRuntimeReport(report, { format });
  await emitReport(content, io, outputPath, io.cwd);
  return report.finalStatus === "needs_human_decision" ? 2 : 0;
}
