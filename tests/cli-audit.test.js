import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runCli } from "../src/cli/run.js";
import { createMemoryWriter } from "./helpers/io.js";

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "vibedocs-audit-"));
}

test("audit passes on a freshly initialized minimal repository", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const stdout = createMemoryWriter();
  const stderr = createMemoryWriter();
  const exitCode = await runCli(["audit", "--format", "json"], {
    cwd: tempDir,
    stdout,
    stderr,
  });

  assert.equal(exitCode, 0);
  assert.equal(stderr.toString(), "");

  const report = JSON.parse(stdout.toString());
  const ruleIds = report.results.map((result) => result.rule_id);

  assert.equal(report.schemaVersion, "v1alpha1");
  assert.equal(report.tool.name, "vibedocs");
  assert.equal(report.run.mode, "repository");
  assert.equal(report.summary.failed, 0);
  assert.ok(ruleIds.includes("core.structure.minimal_docs_exist"));
  assert.ok(ruleIds.includes("core.ssot.document_map_exists"));
});
