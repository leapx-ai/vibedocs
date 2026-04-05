import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runCli } from "../src/cli/run.js";
import { createMemoryWriter } from "./helpers/io.js";

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "vibedocs-runtime-"));
}

test("runtime run emits a structured report for a feature-level contract change", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal", "--project-name", "Runtime Demo", "--owner", "Berlin"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  await runCli(["feature", "create", "focus-mode", "--owner", "Berlin"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const stdout = createMemoryWriter();
  const stderr = createMemoryWriter();
  const exitCode = await runCli([
    "runtime",
    "run",
    "--task",
    "Update API contract for focus mode",
    "--feature",
    "focus-mode",
    "--changed",
    "src/focus-mode/api.ts",
    "--format",
    "json",
  ], { cwd: tempDir, stdout, stderr });

  assert.equal(exitCode, 0);
  assert.equal(stderr.toString(), "");

  const report = JSON.parse(stdout.toString());
  assert.equal(report.runtimeVersion, "v1alpha1");
  assert.equal(report.classification.changeType, "contract_change");
  assert.equal(report.routing.executionMode, "implement");
  assert.deepEqual(report.routing.mustUpdate, ["docs/features/focus-mode/TECH-SPEC.md"]);
  assert.ok(report.routing.shouldReview.includes("docs/delivery/ACCEPTANCE-CHECKLIST.md"));
  assert.equal(report.state.ssotHealth.clear, true);
  assert.equal(report.finalStatus, "completed");
  assert.equal(report.input.featureSlug, "focus-mode");
});

test("runtime run blocks when the repository has no clear SSOT context", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await fs.mkdir(path.join(tempDir, "docs", "governance"), { recursive: true });
  await fs.writeFile(path.join(tempDir, "docs", "governance", "GLOSSARY.md"), "# GLOSSARY\n", "utf8");

  const stdout = createMemoryWriter();
  const stderr = createMemoryWriter();
  const exitCode = await runCli([
    "runtime",
    "run",
    "--task",
    "Refine onboarding scope",
    "--format",
    "json",
  ], { cwd: tempDir, stdout, stderr });

  assert.equal(exitCode, 2);
  assert.equal(stderr.toString(), "");

  const report = JSON.parse(stdout.toString());
  assert.equal(report.finalStatus, "needs_human_decision");
  assert.ok(report.gates.gates.includes("no_clear_ssot"));
});

test("runtime run raises release readiness gate when release docs are missing", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal", "--project-name", "Release Demo", "--owner", "Berlin"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const stdout = createMemoryWriter();
  const stderr = createMemoryWriter();
  const exitCode = await runCli([
    "runtime",
    "run",
    "--task",
    "Prepare release notes and publish the release",
    "--format",
    "json",
  ], { cwd: tempDir, stdout, stderr });

  assert.equal(exitCode, 2);
  assert.equal(stderr.toString(), "");

  const report = JSON.parse(stdout.toString());
  assert.equal(report.finalStatus, "needs_human_decision");
  assert.ok(report.gates.gates.includes("release_readiness_decision"));
  assert.ok(report.state.releaseState.missingForRelease.includes("docs/operations/RELEASE-NOTES.md"));
  assert.ok(report.state.releaseState.missingForRelease.includes("docs/operations/RUNBOOK.md"));
});
