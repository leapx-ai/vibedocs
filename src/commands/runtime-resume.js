import { getBooleanOption, getListOption, getStringOption, parseArgs } from "../cli/args.js";
import { emitReport } from "../reporting/write-report.js";
import { resolveProjectRoot } from "../lib/project.js";
import { loadResumeInputFromReport } from "../runtime/load-resume-input.js";
import { findLatestDecisionForGate, getLatestGateDecisionMap, isHumanDecisionRuntimeStatus, runRuntime, writeRuntimeReport } from "../runtime/index.js";
import { formatRuntimeReport } from "../runtime/report.js";

export async function handleRuntimeResumeCommand(argv, io) {
  const { positionals, options } = parseArgs(argv);
  const targetPath = positionals[0];
  const task = getStringOption(options, "task");
  const gate = getStringOption(options, "gate");
  const featureSlug = getStringOption(options, "feature");
  const reportPath = getStringOption(options, "report");
  const format = getStringOption(options, "format", "text");
  const outputPath = getStringOption(options, "output");
  const semanticMode = getStringOption(options, "semantic", "heuristic");
  const changedPaths = getListOption(options, "changed");
  const writeDrafts = getBooleanOption(options, "write-drafts");
  const projectRoot = resolveProjectRoot(targetPath, io.cwd);

  if (!gate) {
    throw new Error('Missing required --gate for "vibedocs runtime resume".');
  }

  const decision = await findLatestDecisionForGate(projectRoot, gate);

  if (!decision) {
    throw new Error(`No recorded human decision found for gate "${gate}".`);
  }

  if (decision.status === "rejected") {
    throw new Error(`Gate "${gate}" is recorded as rejected, so runtime cannot resume from it.`);
  }

  if (decision.status === "deferred") {
    throw new Error(`Gate "${gate}" is recorded as deferred, so runtime cannot resume until a later acceptance decision is recorded.`);
  }

  const resumeInput = reportPath
    ? await loadResumeInputFromReport(projectRoot, reportPath)
    : null;

  const resolvedTask = task ?? resumeInput?.task;

  if (!resolvedTask) {
    throw new Error('Missing required task context. Provide --task or --report for "vibedocs runtime resume".');
  }

  const report = await runRuntime(targetPath, io.cwd, {
    task: resolvedTask,
    featureSlug: featureSlug ?? decision.featureSlug ?? resumeInput?.featureSlug,
    semantic: semanticMode,
    changedPaths: changedPaths.length > 0 ? changedPaths : (resumeInput?.changedPaths ?? []),
    writeDrafts,
    gateDecisions: await getLatestGateDecisionMap(projectRoot),
    resumedFrom: {
      gate,
      decision: decision.decision,
      status: decision.status ?? "accepted",
      sourceReport: resumeInput?.sourceReport ?? null,
    },
  });
  const content = formatRuntimeReport(report, { format });
  if (format === "json" && outputPath) {
    io.stdout.write(content);
    await writeRuntimeReport(report, outputPath, io.cwd);
  } else {
    await emitReport(content, io, outputPath, io.cwd);
  }
  return isHumanDecisionRuntimeStatus(report.finalStatus) ? 2 : 0;
}
