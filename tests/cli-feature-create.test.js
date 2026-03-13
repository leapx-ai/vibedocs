import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runCli } from "../src/cli/run.js";
import { createMemoryWriter } from "./helpers/io.js";

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "vibedocs-feature-"));
}

test("feature create generates a complete feature package", async (t) => {
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
  const exitCode = await runCli(["feature", "create", "focus-mode", "--owner", "Berlin"], {
    cwd: tempDir,
    stdout,
    stderr,
  });

  assert.equal(exitCode, 0);
  assert.equal(stderr.toString(), "");

  const featureDir = path.join(tempDir, "docs", "features", "focus-mode");
  const files = await fs.readdir(featureDir);
  const prd = await fs.readFile(path.join(featureDir, "PRD.md"), "utf8");
  const acceptance = await fs.readFile(path.join(featureDir, "ACCEPTANCE.md"), "utf8");
  const analytics = await fs.readFile(path.join(featureDir, "ANALYTICS.md"), "utf8");

  assert.deepEqual(files.sort(), ["ACCEPTANCE.md", "ANALYTICS.md", "PRD.md", "TECH-SPEC.md", "WIREFLOW.md"]);
  assert.ok(prd.startsWith("# Focus Mode PRD"));
  assert.ok(prd.includes("Last Updated:"));
  assert.ok(prd.includes("Owner: Berlin"));
  assert.ok(!prd.includes("更新时间："));
  assert.ok(acceptance.includes("Status: Draft / Active"));
  assert.ok(acceptance.includes("Owner: Berlin"));
  assert.ok(analytics.startsWith("# Focus Mode Analytics"));
  assert.ok(analytics.includes("Last Updated:"));
  assert.ok(analytics.includes("Owner: Berlin"));
  assert.match(stdout.toString(), /Created feature package/);
});
