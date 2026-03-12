import { parseArgs, getListOption, getStringOption } from "../cli/args.js";
import { loadProjectConfig } from "../config/load-config.js";
import { resolveProjectRoot } from "../lib/project.js";
import { formatResults, hasFailures } from "../reporting/format-results.js";
import { emitReport } from "../reporting/write-report.js";
import { buildRepositoryContext } from "../rule-engine/context.js";
import { coreRules } from "../rule-engine/core-rules.js";
import { loadRulePacks } from "../rule-engine/rule-packs.js";
import { runRules } from "../rule-engine/run-rules.js";

const GLOSSARY_RULE_IDS = new Set([
  "core.terminology.glossary_exists",
  "core.terminology.glossary_term_drift",
]);

export async function handleGlossaryCheckCommand(argv, io) {
  const { positionals, options } = parseArgs(argv);
  const targetPath = positionals[0];
  const format = getStringOption(options, "format", "text");
  const outputPath = getStringOption(options, "output");
  const projectRoot = resolveProjectRoot(targetPath, io.cwd);
  const config = await loadProjectConfig(projectRoot);
  const rulePackPaths = [...(config.values.rulePacks ?? []), ...getListOption(options, "rule-pack")];
  const rulePackSet = await loadRulePacks(projectRoot, rulePackPaths);
  const selectedPaths = getListOption(options, "path");
  const configuredPaths = selectedPaths.length > 0 ? selectedPaths : config.values.glossaryPaths ?? [];
  const effectivePaths = selectedPaths.length > 0 ? [...selectedPaths, "docs/governance"] : selectedPaths;
  const finalPaths = configuredPaths.length > 0 ? [...configuredPaths, "docs/governance"] : effectivePaths;
  const context = await buildRepositoryContext(targetPath, io.cwd, {
    mode: "path",
    selectedPaths: finalPaths,
  });
  const rules = coreRules.filter((rule) => GLOSSARY_RULE_IDS.has(rule.id));
  const results = await runRules(context, rules, {
    overrides: rulePackSet.overrides,
  });
  const content = formatResults(results, {
    format,
    mode: context.mode,
    projectRoot: context.projectRoot,
    docsDir: context.docsDir,
    changedPaths: context.changedPaths,
    selectedPaths: context.selectedPaths,
    configPath: config.path,
    rulePacks: rulePackSet.packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      path: pack.path,
    })),
  });
  await emitReport(content, io, outputPath, io.cwd);
  return hasFailures(results) ? 1 : 0;
}
