import fs from "node:fs/promises";
import path from "node:path";

import { scaffoldDocsDir } from "../assets.js";
import { parseArgs, getBooleanOption, getStringOption } from "../cli/args.js";
import { collectConflicts, ensureDirectory, listFilesRecursive } from "../filesystem/fs.js";
import { hydrateScaffoldContent } from "../filesystem/placeholders.js";
import { currentDateIso } from "../lib/date.js";
import { resolveProjectRoot, resolveDocsDir } from "../lib/project.js";

const MODE_FILES = {
  minimal: [
    "README.md",
    "features/README.md",
    "governance/PROJECT-CONSTITUTION.md",
    "governance/DOCUMENT-MAP.md",
    "governance/GLOSSARY.md",
    "strategy/PRODUCT-PRINCIPLES.md",
    "strategy/ROADMAP-STATUS.md",
    "product/FEATURE-PRD.md",
    "engineering/TECH-SPEC.md",
    "delivery/ACCEPTANCE-CHECKLIST.md",
  ],
  standard: [
    "README.md",
    "features/README.md",
    "governance/PROJECT-CONSTITUTION.md",
    "governance/DOCUMENT-MAP.md",
    "governance/GLOSSARY.md",
    "strategy/PRODUCT-PRINCIPLES.md",
    "strategy/ROADMAP-STATUS.md",
    "strategy/VISION.md",
    "product/FEATURE-PRD.md",
    "design/UI-STYLE-GUIDE.md",
    "design/WIREFLOW.md",
    "engineering/TECH-SPEC.md",
    "delivery/ACCEPTANCE-CHECKLIST.md",
    "delivery/TASK-LIBRARY.md",
    "delivery/REGRESSION-CHECKLIST.md",
    "delivery/TESTING-REPORT.md",
    "operations/ANALYTICS-EVENTS.md",
  ],
  full: null,
};

function resolveMode(mode) {
  const normalized = (mode ?? "minimal").toLowerCase();

  if (!["minimal", "standard", "full"].includes(normalized)) {
    throw new Error(`Unsupported mode: ${mode}`);
  }

  return normalized;
}

async function collectFilesForMode(mode) {
  if (mode === "full") {
    const files = await listFilesRecursive(scaffoldDocsDir);
    return files.map((entry) => path.relative(scaffoldDocsDir, entry));
  }

  return MODE_FILES[mode];
}

export async function handleInitCommand(argv, io) {
  const { positionals, options } = parseArgs(argv);
  const mode = resolveMode(getStringOption(options, "mode", "minimal"));
  const projectName = getStringOption(options, "project-name");
  const owner = getStringOption(options, "owner", "TODO");
  const dryRun = getBooleanOption(options, "dry-run");
  const force = getBooleanOption(options, "force");
  const targetRoot = resolveProjectRoot(positionals[0], io.cwd);
  const docsDir = resolveDocsDir(targetRoot);
  const relativeFiles = await collectFilesForMode(mode);
  const targetPaths = relativeFiles.map((relativePath) => path.join(docsDir, relativePath));
  const conflicts = force ? [] : await collectConflicts(targetPaths);

  if (conflicts.length > 0) {
    io.stderr.write(`Refusing to overwrite existing files:\n${conflicts.map((entry) => `- ${entry}`).join("\n")}\n`);
    io.stderr.write("Re-run with --force to overwrite them.\n");
    return 1;
  }

  const date = currentDateIso();

  if (!dryRun) {
    await ensureDirectory(docsDir);
  }

  for (const relativePath of relativeFiles) {
    const sourcePath = path.join(scaffoldDocsDir, relativePath);
    const targetPath = path.join(docsDir, relativePath);

    if (!dryRun) {
      await ensureDirectory(path.dirname(targetPath));
      const rawContent = await fs.readFile(sourcePath, "utf8");
      const content = hydrateScaffoldContent(rawContent, {
        date,
        owner,
        projectName,
        mode,
      });

      await fs.writeFile(targetPath, content, "utf8");
    }
  }

  io.stdout.write(`${dryRun ? "Planned" : "Created"} ${relativeFiles.length} docs files in ${docsDir}\n`);
  io.stdout.write(`Mode: ${mode}\n`);

  return 0;
}
