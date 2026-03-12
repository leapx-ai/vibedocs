import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runCli } from "../src/cli/run.js";
import { createMemoryWriter } from "./helpers/io.js";

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "vibedocs-audit-diff-"));
}

test("audit supports diff-ready context and writing reports to disk", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await fs.writeFile(
    path.join(tempDir, "vibedocs.config.json"),
    JSON.stringify({ owner: "Configured Owner" }, null, 2),
    "utf8",
  );

  await runCli(["init", "--mode", "minimal"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const reportPath = path.join("artifacts", "audit.json");
  const stdout = createMemoryWriter();
  const exitCode = await runCli(
    ["audit", "--format", "json", "--changed", "src/app.js", "--output", reportPath],
    {
      cwd: tempDir,
      stdout,
      stderr: createMemoryWriter(),
    },
  );

  assert.equal(exitCode, 0);

  const report = JSON.parse(stdout.toString());
  const diffResult = report.results.find((result) => result.rule_id === "core.diff.docs_touchpoint_present");
  const writtenReport = JSON.parse(await fs.readFile(path.join(tempDir, reportPath), "utf8"));

  assert.equal(report.schemaVersion, "v1alpha1");
  assert.equal(report.run.mode, "diff");
  assert.deepEqual(report.run.changedPaths, ["src/app.js"]);
  assert.match(report.run.configPath, /vibedocs\.config\.json$/);
  assert.equal(diffResult.status, "warn");
  assert.equal(diffResult.category, "diff");
  assert.deepEqual(diffResult.suggested_docs, [
    "docs/engineering/TECH-SPEC.md",
    "docs/delivery/ACCEPTANCE-CHECKLIST.md",
  ]);
  assert.equal(writtenReport.run.mode, "diff");
});

test("audit suggests feature package docs when changed paths match a known feature slug", async (t) => {
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

  const stdout = createMemoryWriter();
  const exitCode = await runCli(
    ["audit", "--format", "json", "--changed", "src/focus-mode/controller.js"],
    {
      cwd: tempDir,
      stdout,
      stderr: createMemoryWriter(),
    },
  );

  assert.equal(exitCode, 0);

  const report = JSON.parse(stdout.toString());
  const diffResult = report.results.find((result) => result.rule_id === "core.diff.docs_touchpoint_present");

  assert.ok(diffResult.suggested_docs.includes("docs/features/focus-mode/PRD.md"));
  assert.ok(diffResult.suggested_docs.includes("docs/features/focus-mode/TECH-SPEC.md"));
  assert.ok(diffResult.suggested_docs.includes("docs/features/focus-mode/ACCEPTANCE.md"));
});
