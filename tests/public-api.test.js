import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { REPORT_SCHEMA_VERSION, TOOL_NAME, TOOL_VERSION, runAudit, runRuntime, readRuntimeReport, writeRuntimeReport } from "@leapx-ai/vibedocs";
import { createReport } from "@leapx-ai/vibedocs/reporting";
import { loadRulePacks } from "@leapx-ai/vibedocs/rule-engine";

import { runCli } from "../src/cli/run.js";
import { createMemoryWriter } from "./helpers/io.js";

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "vibedocs-public-api-"));
}

test("package exports expose the stable programmatic API", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  assert.equal(TOOL_NAME, "vibedocs");
  assert.equal(TOOL_VERSION, "0.2.0");
  assert.equal(REPORT_SCHEMA_VERSION, "v1alpha1");

  await runCli(["init", "--mode", "minimal"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const report = await runAudit(undefined, tempDir, {
    changedPaths: ["src/app.js"],
    semantic: "heuristic",
  });

  assert.equal(report.schemaVersion, "v1alpha1");
  assert.equal(report.tool.name, "vibedocs");
  assert.equal(report.run.mode, "diff");
  assert.equal(report.run.semanticMode, "heuristic");
  assert.ok(Array.isArray(report.results));

  const runtimeReport = await runRuntime(undefined, tempDir, {
    task: "Update API contract for the demo flow",
    changedPaths: ["src/demo/api.js"],
    semantic: "heuristic",
  });
  assert.equal(runtimeReport.runtimeVersion, "v1alpha1");
  assert.equal(runtimeReport.classification.changeType, "contract_change");
  assert.ok(Array.isArray(runtimeReport.routing.mustUpdate));

  const runtimeReportPath = await writeRuntimeReport(runtimeReport, "runtime-report.json", tempDir);
  const loadedRuntimeReport = await readRuntimeReport(tempDir, runtimeReportPath);
  assert.equal(loadedRuntimeReport.absolutePath, runtimeReportPath);
  assert.equal(loadedRuntimeReport.report.input.task, "Update API contract for the demo flow");
  assert.ok(Array.isArray(loadedRuntimeReport.report.actions));
  assert.ok(Array.isArray(loadedRuntimeReport.report.gates.gates));

  const synthetic = createReport([], { mode: "repository" });
  assert.equal(synthetic.schemaVersion, "v1alpha1");
  assert.equal(synthetic.summary.passed, 0);

  await fs.mkdir(path.join(tempDir, "rule-packs"), { recursive: true });
  const packPath = path.join(tempDir, "rule-packs", "defaults.json");
  await fs.writeFile(
    packPath,
    JSON.stringify(
      {
        id: "defaults",
        name: "Defaults",
        rules: {
          "core.diff.docs_touchpoint_present": {
            severity: "high",
          },
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  const packs = await loadRulePacks(tempDir, ["rule-packs/defaults.json"]);
  assert.equal(packs.packs.length, 1);
  assert.equal(packs.overrides["core.diff.docs_touchpoint_present"].severity, "high");
});

test("runtime report IO preserves structured write details", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  await runCli(["feature", "create", "focus-mode"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const runtimeReport = await runRuntime(undefined, tempDir, {
    task: "Update API contract for focus mode",
    featureSlug: "focus-mode",
    changedPaths: ["src/focus-mode/api.js"],
    semantic: "heuristic",
    writeDrafts: true,
  });

  const runtimeReportPath = await writeRuntimeReport(runtimeReport, "runtime-report.json", tempDir);
  const loadedRuntimeReport = await readRuntimeReport(tempDir, runtimeReportPath);
  const writeEntry = loadedRuntimeReport.report.writes.writes.find((entry) => entry.path === "docs/features/focus-mode/TECH-SPEC.md");

  assert.ok(writeEntry);
  assert.equal(writeEntry.anchorHeading, "## 5. Data Structures / Interfaces");
  assert.equal(writeEntry.insertionStrategy, "insert-after-heading");
});
