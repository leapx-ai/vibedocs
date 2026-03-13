import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runCli } from "../src/cli/run.js";
import { createMemoryWriter } from "./helpers/io.js";

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "vibedocs-init-"));
}

test("init creates a minimal docs system with hydrated placeholders", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  const stdout = createMemoryWriter();
  const stderr = createMemoryWriter();
  const exitCode = await runCli(
    ["init", "--mode", "minimal", "--project-name", "Demo Docs", "--owner", "Berlin"],
    { cwd: tempDir, stdout, stderr },
  );

  assert.equal(exitCode, 0);
  assert.equal(stderr.toString(), "");

  const readme = await fs.readFile(path.join(tempDir, "docs", "README.md"), "utf8");
  const constitution = await fs.readFile(path.join(tempDir, "docs", "governance", "PROJECT-CONSTITUTION.md"), "utf8");
  const protocolGuide = await fs.readFile(path.join(tempDir, "guides", "AI-OPERATING-PROTOCOL.md"), "utf8");
  const promptsGuide = await fs.readFile(path.join(tempDir, "guides", "AI-PROMPTS.md"), "utf8");

  assert.match(stdout.toString(), /Created 10 docs files and 5 guide files/);
  assert.ok(readme.startsWith("# Project Docs Index"));
  assert.ok(readme.includes("Owner: Berlin"));
  assert.ok(readme.includes("- Project Name: Demo Docs"));
  assert.ok(readme.includes("- Current Mode: `Minimal`"));
  assert.ok(!readme.includes("<YYYY-MM-DD>"));
  assert.ok(constitution.includes("Owner: Berlin"));
  assert.ok(protocolGuide.includes("# AI Operating Protocol"));
  assert.ok(promptsGuide.includes("# AI Prompts"));
});
