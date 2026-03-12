import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runCli } from "../src/cli/run.js";
import { createMemoryWriter } from "./helpers/io.js";

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "vibedocs-rule-pack-"));
}

test("audit consumes local rule packs in read-only mode", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await fs.writeFile(
    path.join(tempDir, "vibedocs.config.json"),
    JSON.stringify(
      {
        rulePacks: ["rule-packs/team-defaults.json"],
      },
      null,
      2,
    ),
    "utf8",
  );

  await fs.mkdir(path.join(tempDir, "rule-packs"), { recursive: true });
  await fs.writeFile(
    path.join(tempDir, "rule-packs", "team-defaults.json"),
    JSON.stringify(
      {
        id: "team-defaults",
        name: "Team Defaults",
        rules: {
          "core.diff.docs_touchpoint_present": {
            severity: "high",
            ownerHint: "tech-lead",
            suggestion: "Update the affected docs before merge.",
          },
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  await runCli(["init", "--mode", "minimal"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const stdout = createMemoryWriter();
  const exitCode = await runCli(["audit", "--format", "json", "--changed", "src/app.js"], {
    cwd: tempDir,
    stdout,
    stderr: createMemoryWriter(),
  });

  assert.equal(exitCode, 0);

  const report = JSON.parse(stdout.toString());
  const diffResult = report.results.find((result) => result.rule_id === "core.diff.docs_touchpoint_present");

  assert.equal(report.run.rulePacks.length, 1);
  assert.equal(report.run.rulePacks[0].id, "team-defaults");
  assert.equal(diffResult.severity, "high");
  assert.equal(diffResult.owner_hint, "tech-lead");
  assert.equal(diffResult.suggestion, "Update the affected docs before merge.");
});
