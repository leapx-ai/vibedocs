import { loadProjectConfig } from "../config/load-config.js";
import { resolveProjectRoot } from "../lib/project.js";
import { createReport } from "../reporting/create-report.js";
import { buildRepositoryContext } from "../rule-engine/context.js";
import { coreRules } from "../rule-engine/core-rules.js";
import { loadRulePacks } from "../rule-engine/rule-packs.js";
import { runRules } from "../rule-engine/run-rules.js";
import { buildSemanticIndex, runHeuristicSemanticChecks } from "../semantic-audit/index.js";

export async function runAudit(targetPath, cwd, options = {}) {
  const projectRoot = resolveProjectRoot(targetPath, cwd);
  const config = await loadProjectConfig(projectRoot);
  const changedPaths = options.changedPaths ?? [];
  const semanticMode = options.semantic ?? "off";

  if (!["off", "heuristic"].includes(semanticMode)) {
    throw new Error(`Invalid semantic mode: ${semanticMode}. Expected "off" or "heuristic".`);
  }

  const rulePackPaths = [...(config.values.rulePacks ?? []), ...(options.rulePackPaths ?? [])];
  const rulePackSet = await loadRulePacks(projectRoot, rulePackPaths);
  const context = await buildRepositoryContext(targetPath, cwd, {
    mode: changedPaths.length > 0 ? "diff" : "repository",
    changedPaths,
  });
  const coreResults = await runRules(context, coreRules, {
    overrides: rulePackSet.overrides,
  });
  const semanticResults = semanticMode === "heuristic"
    ? runHeuristicSemanticChecks(context, buildSemanticIndex(context))
    : [];
  const results = [...coreResults, ...semanticResults];

  return createReport(results, {
    mode: context.mode,
    semanticMode,
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
