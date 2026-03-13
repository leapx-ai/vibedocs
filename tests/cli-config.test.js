import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runCli } from "../src/cli/run.js";
import { createMemoryWriter } from "./helpers/io.js";

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "vibedocs-config-"));
}

test("init and feature create consume defaults from vibedocs.config.json", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await fs.writeFile(
    path.join(tempDir, "vibedocs.config.json"),
    JSON.stringify(
      {
        projectName: "Configured Project",
        owner: "Configured Owner",
        defaultMode: "standard",
        featureSlugStyle: "snake",
      },
      null,
      2,
    ),
    "utf8",
  );

  const initStdout = createMemoryWriter();
  const initExitCode = await runCli(["init"], {
    cwd: tempDir,
    stdout: initStdout,
    stderr: createMemoryWriter(),
  });

  assert.equal(initExitCode, 0);
  assert.match(initStdout.toString(), /Mode: standard/);
  assert.match(initStdout.toString(), /Config:/);

  const rootReadme = await fs.readFile(path.join(tempDir, "docs", "README.md"), "utf8");
  const guideReadme = await fs.readFile(path.join(tempDir, "guides", "README.md"), "utf8");
  assert.ok(rootReadme.includes("- Project Name: Configured Project"));
  assert.ok(rootReadme.includes("Owner: Configured Owner"));
  assert.ok(guideReadme.includes("AI-OPERATING-PROTOCOL.md"));

  const featureStdout = createMemoryWriter();
  const featureExitCode = await runCli(["feature", "create", "Focus Mode"], {
    cwd: tempDir,
    stdout: featureStdout,
    stderr: createMemoryWriter(),
  });

  assert.equal(featureExitCode, 0);
  assert.match(featureStdout.toString(), /Config:/);

  const featureDir = path.join(tempDir, "docs", "features", "focus_mode");
  const prd = await fs.readFile(path.join(featureDir, "PRD.md"), "utf8");

  assert.ok(prd.includes("Owner: Configured Owner"));
});
