import { parseArgs, getListOption, getStringOption } from "../cli/args.js";
import { formatResults, hasFailures } from "../reporting/format-results.js";
import { buildRepositoryContext } from "../rule-engine/context.js";
import { coreRules } from "../rule-engine/core-rules.js";
import { runRules } from "../rule-engine/run-rules.js";

const GLOSSARY_RULE_IDS = new Set([
  "core.terminology.glossary_exists",
  "core.terminology.glossary_term_drift",
]);

export async function handleGlossaryCheckCommand(argv, io) {
  const { positionals, options } = parseArgs(argv);
  const targetPath = positionals[0];
  const format = getStringOption(options, "format", "text");
  const selectedPaths = getListOption(options, "path");
  const effectivePaths = selectedPaths.length > 0 ? [...selectedPaths, "docs/governance"] : selectedPaths;
  const context = await buildRepositoryContext(targetPath, io.cwd, {
    mode: "path",
    selectedPaths: effectivePaths,
  });
  const rules = coreRules.filter((rule) => GLOSSARY_RULE_IDS.has(rule.id));
  const results = await runRules(context, rules);
  io.stdout.write(formatResults(results, format));
  return hasFailures(results) ? 1 : 0;
}
