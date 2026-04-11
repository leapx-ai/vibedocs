import fs from "node:fs/promises";
import path from "node:path";

import { scaffoldDocsDir, templatesDir } from "../assets.js";
import { ensureDirectory, pathExists } from "../filesystem/fs.js";
import { hydrateScaffoldContent, hydrateTemplateContent } from "../filesystem/placeholders.js";
import { currentDateIso } from "../lib/date.js";
import { toDisplayName } from "../lib/slug.js";

const FEATURE_TEMPLATE_MAP = {
  "PRD.md": { source: "FEATURE-PRD.template.md", title: (name) => `${name} PRD` },
  "WIREFLOW.md": { source: "WIREFLOW.template.md", title: (name) => `${name} Wireflow` },
  "TECH-SPEC.md": { source: "TECH-SPEC.template.md", title: (name) => `${name} Tech Spec` },
  "ACCEPTANCE.md": { source: "ACCEPTANCE-CHECKLIST.template.md", title: (name) => `${name} Acceptance` },
  "ANALYTICS.md": { source: "ANALYTICS-EVENTS.template.md", title: (name) => `${name} Analytics` },
};

export async function applyDraftDocUpdates(runtimeReport, options = {}) {
  const projectRoot = runtimeReport.input?.projectRoot;

  if (!projectRoot) {
    throw new Error("Runtime report is missing projectRoot, so draft updates cannot be applied.");
  }

  const targetDocs = runtimeReport.routing?.mustUpdate ?? [];
  const writes = [];
  const date = currentDateIso();
  const owner = options.owner ?? "TODO";

  for (const relativePath of targetDocs) {
    const absolutePath = path.join(projectRoot, relativePath);
    const exists = await pathExists(absolutePath);

    if (!exists) {
      const seeded = await seedDocFile(relativePath, absolutePath, {
        date,
        owner,
      });

      writes.push({
        path: relativePath,
        action: seeded ? "created" : "skipped",
        reason: seeded ? "Seeded missing document before applying runtime draft update." : "No known template or scaffold source for this target.",
      });

      if (!seeded) {
        continue;
      }
    }

    const existing = await fs.readFile(absolutePath, "utf8");
    const nextContent = appendRuntimeDraftSection(existing, {
      task: runtimeReport.input.task,
      changeType: runtimeReport.classification?.changeType,
      executionMode: runtimeReport.routing?.executionMode,
      date,
    });

    if (nextContent === existing) {
      writes.push({
        path: relativePath,
        action: "unchanged",
        reason: "An equivalent runtime draft section already exists for this task.",
      });
      continue;
    }

    await fs.writeFile(absolutePath, nextContent, "utf8");
    writes.push({
      path: relativePath,
      action: exists ? "updated" : "created_and_updated",
      reason: "Applied runtime draft section to the routed target document.",
    });
  }

  return {
    attempted: targetDocs.length,
    writes,
    updated: writes.filter((entry) => entry.action === "updated" || entry.action === "created_and_updated").length,
    created: writes.filter((entry) => entry.action === "created" || entry.action === "created_and_updated").length,
    unchanged: writes.filter((entry) => entry.action === "unchanged").length,
    skipped: writes.filter((entry) => entry.action === "skipped").length,
  };
}

async function seedDocFile(relativePath, absolutePath, options) {
  const source = await resolveSeedSource(relativePath);

  if (!source) {
    return false;
  }

  await ensureDirectory(path.dirname(absolutePath));
  const rawContent = await fs.readFile(source.path, "utf8");
  const content = source.kind === "feature-template"
    ? hydrateTemplateContent(rawContent, {
        date: options.date,
        owner: options.owner,
        title: source.title,
      })
    : hydrateScaffoldContent(rawContent, {
        date: options.date,
        owner: options.owner,
        projectName: "Runtime Draft",
        mode: "minimal",
      });
  await fs.writeFile(absolutePath, content, "utf8");
  return true;
}

async function resolveSeedSource(relativePath) {
  const featureMatch = relativePath.match(/^docs\/features\/([^/]+)\/([^/]+)$/);

  if (featureMatch) {
    const slug = featureMatch[1];
    const fileName = featureMatch[2];
    const mapping = FEATURE_TEMPLATE_MAP[fileName];

    if (!mapping) {
      return null;
    }

    return {
      kind: "feature-template",
      path: path.join(templatesDir, mapping.source),
      title: mapping.title(toDisplayName(slug)),
    };
  }

  if (!relativePath.startsWith("docs/")) {
    return null;
  }

  const scaffoldRelativePath = relativePath.slice("docs/".length);
  const scaffoldPath = path.join(scaffoldDocsDir, scaffoldRelativePath);

  return (await pathExists(scaffoldPath))
    ? { kind: "scaffold", path: scaffoldPath }
    : null;
}

function appendRuntimeDraftSection(content, details) {
  const marker = `Task: ${details.task}`;

  if (content.includes("## Runtime Draft Update") && content.includes(marker)) {
    return content;
  }

  const section = [
    "",
    "## Runtime Draft Update",
    "",
    `Last Updated: ${details.date}`,
    `Task: ${details.task}`,
    `Change Type: ${details.changeType ?? "unknown"}`,
    `Execution Mode: ${details.executionMode ?? "unknown"}`,
    "",
    "This section was added by `vibedocs runtime run --write-drafts` and should be reviewed by a human before promotion.",
    "",
  ].join("\n");

  return `${content.replace(/\s*$/, "")}\n${section}`;
}
