import { parseArgs, getStringOption } from "../cli/args.js";
import { formatResults, hasFailures } from "../reporting/format-results.js";
import { buildRepositoryContext } from "../rule-engine/context.js";
import { coreRules } from "../rule-engine/core-rules.js";
import { runRules } from "../rule-engine/run-rules.js";

export async function handleAuditCommand(argv, io) {
  const { positionals, options } = parseArgs(argv);
  const format = getStringOption(options, "format", "text");
  const targetPath = positionals[0];
  const context = await buildRepositoryContext(targetPath, io.cwd, { mode: "repository" });
  const results = await runRules(context, coreRules);
  io.stdout.write(formatResults(results, format));
  return hasFailures(results) ? 1 : 0;
}
