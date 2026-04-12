import { getStringOption, parseArgs } from "../cli/args.js";
import { loadProjectConfig } from "../config/load-config.js";
import { resolveProjectRoot } from "../lib/project.js";
import { normalizeGateDecisionStatus, recordHumanDecision } from "../runtime/index.js";

export async function handleRuntimeDecideCommand(argv, io) {
  const { positionals, options } = parseArgs(argv);
  const targetPath = positionals[0];
  const projectRoot = resolveProjectRoot(targetPath, io.cwd);
  const config = await loadProjectConfig(projectRoot);
  const gate = getStringOption(options, "gate");
  const decision = getStringOption(options, "decision");
  const featureSlug = getStringOption(options, "feature");
  const note = getStringOption(options, "note");
  const status = normalizeGateDecisionStatus(getStringOption(options, "status", "accepted"));

  if (!gate) {
    throw new Error('Missing required --gate for "vibedocs runtime decide".');
  }

  if (!decision) {
    throw new Error('Missing required --decision for "vibedocs runtime decide".');
  }

  const result = await recordHumanDecision(projectRoot, {
    gate,
    decision,
    status,
    featureSlug,
    note,
    owner: config.values.owner ?? "TODO",
  });

  io.stdout.write(`Recorded ${status} decision for ${gate} in ${result.path}\n`);
  return 0;
}
