import { loadProjectConfig } from "../config/load-config.js";
import { resolveProjectRoot } from "../lib/project.js";
import { createReport } from "../reporting/create-report.js";
import { buildRepositoryContext } from "../rule-engine/context.js";
import { coreRules } from "../rule-engine/core-rules.js";
import { loadRulePacks } from "../rule-engine/rule-packs.js";
import { runRules } from "../rule-engine/run-rules.js";

const GLOSSARY_RULE_IDS = new Set([
  "core.terminology.glossary_exists",
  "core.terminology.glossary_term_drift",
]);

export async function runGlossaryCheck(targetPath, cwd, options = {}) {
  const projectRoot = resolveProjectRoot(targetPath, cwd);
  const config = await loadProjectConfig(projectRoot);
  const rulePackPaths = [...(config.values.rulePacks ?? []), ...(options.rulePackPaths ?? [])];
  const rulePackSet = await loadRulePacks(projectRoot, rulePackPaths);
  const selectedPaths = options.selectedPaths ?? [];
  const configuredPaths = selectedPaths.length > 0 ? selectedPaths : config.values.glossaryPaths ?? [];
  const finalPaths = configuredPaths.length > 0 ? [...configuredPaths, "docs/governance"] : [];
  const context = await buildRepositoryContext(targetPath, cwd, {
    mode: "path",
    selectedPaths: finalPaths,
  });
  const rules = coreRules.filter((rule) => GLOSSARY_RULE_IDS.has(rule.id));
  const results = await runRules(context, rules, {
    overrides: rulePackSet.overrides,
  });

  return createReport(results, {
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
}
