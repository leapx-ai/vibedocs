import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { REPORT_SCHEMA_VERSION, TOOL_NAME, TOOL_VERSION, runAudit } from "@leapx-ai/vibedocs";
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
  assert.equal(TOOL_VERSION, "0.1.0");
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
