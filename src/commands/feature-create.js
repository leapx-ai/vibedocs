import fs from "node:fs/promises";
import path from "node:path";

import { templatesDir } from "../assets.js";
import { parseArgs, getBooleanOption, getStringOption } from "../cli/args.js";
import { collectConflicts, ensureDirectory } from "../filesystem/fs.js";
import { hydrateTemplateContent } from "../filesystem/placeholders.js";
import { currentDateIso } from "../lib/date.js";
import { resolveProjectRoot } from "../lib/project.js";
import { toDisplayName, toSlug } from "../lib/slug.js";

const FEATURE_TEMPLATES = [
  { source: "FEATURE-PRD.template.md", target: "PRD.md", title: (name) => `${name} PRD` },
  { source: "WIREFLOW.template.md", target: "WIREFLOW.md", title: (name) => `${name} Wireflow` },
  { source: "TECH-SPEC.template.md", target: "TECH-SPEC.md", title: (name) => `${name} Tech Spec` },
  { source: "ACCEPTANCE-CHECKLIST.template.md", target: "ACCEPTANCE.md", title: (name) => `${name} Acceptance` },
  { source: "ANALYTICS-EVENTS.template.md", target: "ANALYTICS.md", title: (name) => `${name} Analytics` },
];

export async function handleFeatureCreateCommand(argv, io) {
  const { positionals, options } = parseArgs(argv);
  const rawName = positionals[0];

  if (!rawName) {
    throw new Error("Missing feature name. Usage: vibedocs feature create <name>");
  }

  const explicitTarget = positionals[1];
  const owner = getStringOption(options, "owner");
  const dryRun = getBooleanOption(options, "dry-run");
  const force = getBooleanOption(options, "force");
  const projectRoot = resolveProjectRoot(explicitTarget, io.cwd);
  const slug = toSlug(rawName);

  if (!slug) {
    throw new Error(`Could not derive a feature slug from "${rawName}".`);
  }

  const displayName = toDisplayName(rawName);
  const featureDir = path.join(projectRoot, "docs", "features", slug);
  const targetPaths = FEATURE_TEMPLATES.map((template) => path.join(featureDir, template.target));
  const conflicts = force ? [] : await collectConflicts(targetPaths);

  if (conflicts.length > 0) {
    io.stderr.write(`Refusing to overwrite existing feature files:\n${conflicts.map((entry) => `- ${entry}`).join("\n")}\n`);
    io.stderr.write("Re-run with --force to overwrite them.\n");
    return 1;
  }

  if (!dryRun) {
    await ensureDirectory(featureDir);
  }

  const date = currentDateIso();

  for (const template of FEATURE_TEMPLATES) {
    if (!dryRun) {
      const sourcePath = path.join(templatesDir, template.source);
      const targetPath = path.join(featureDir, template.target);
      const rawContent = await fs.readFile(sourcePath, "utf8");
      const content = hydrateTemplateContent(rawContent, {
        date,
        owner,
        title: template.title(displayName),
      });

      await fs.writeFile(targetPath, content, "utf8");
    }
  }

  io.stdout.write(`${dryRun ? "Planned" : "Created"} feature package at ${featureDir}\n`);
  io.stdout.write("Remember to update docs/governance/DOCUMENT-MAP.md if this feature becomes a new SSOT boundary.\n");

  return 0;
}
