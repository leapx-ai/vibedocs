import { parseArgs, getListOption, getStringOption } from "../cli/args.js";
import { loadProjectConfig } from "../config/load-config.js";
import { resolveProjectRoot } from "../lib/project.js";
import { formatResults, hasFailures } from "../reporting/format-results.js";
import { emitReport } from "../reporting/write-report.js";
import { buildRepositoryContext } from "../rule-engine/context.js";
import { coreRules } from "../rule-engine/core-rules.js";
import { loadRulePacks } from "../rule-engine/rule-packs.js";
import { runRules } from "../rule-engine/run-rules.js";

export async function handleAuditCommand(argv, io) {
  const { positionals, options } = parseArgs(argv);
  const format = getStringOption(options, "format", "text");
  const outputPath = getStringOption(options, "output");
  const targetPath = positionals[0];
  const projectRoot = resolveProjectRoot(targetPath, io.cwd);
  const config = await loadProjectConfig(projectRoot);
  const changedPaths = getListOption(options, "changed");
  const rulePackPaths = [...(config.values.rulePacks ?? []), ...getListOption(options, "rule-pack")];
  const rulePackSet = await loadRulePacks(projectRoot, rulePackPaths);
  const context = await buildRepositoryContext(targetPath, io.cwd, {
    mode: changedPaths.length > 0 ? "diff" : "repository",
    changedPaths,
  });
  const results = await runRules(context, coreRules, {
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
