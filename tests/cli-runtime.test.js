import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runCli } from "../src/cli/run.js";
import { loadResumeInputFromReport } from "../src/runtime/index.js";
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

test("runtime run can apply draft updates to routed docs when explicitly requested", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal", "--project-name", "Draft Demo", "--owner", "Berlin"], {
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
    "--write-drafts",
    "--format",
    "json",
  ], { cwd: tempDir, stdout, stderr });

  assert.equal(exitCode, 0);
  assert.equal(stderr.toString(), "");

  const report = JSON.parse(stdout.toString());
  assert.equal(report.finalStatus, "completed_with_draft_updates");
  const spec = await fs.readFile(path.join(tempDir, "docs", "features", "focus-mode", "TECH-SPEC.md"), "utf8");
  const docsReadme = await fs.readFile(path.join(tempDir, "docs", "README.md"), "utf8");
  const decisionLog = await fs.readFile(path.join(tempDir, "docs", "governance", "DECISION-LOG.md"), "utf8");

  assert.ok(report.actions.includes("draft_doc_update"));
  assert.ok(report.actions.includes("sync_navigation"));
  assert.match(report.writes.summary, /updated|created/);
  assert.equal(report.writes.writes[0].path, "docs/features/focus-mode/TECH-SPEC.md");
  assert.equal(report.writes.writes[0].anchorHeading, "## 5. Data Structures / Interfaces");
  assert.equal(report.writes.writes[0].insertionStrategy, "insert-after-heading");
  assert.ok(spec.includes("## Runtime Draft Update"));
  assert.ok(spec.includes("Task: Update API contract for focus mode"));
  assert.ok(spec.includes("### Interface / Contract Impact"));
  assert.ok(spec.includes("### Regression and Constraint Notes"));
  assert.ok(spec.indexOf("## 5. Data Structures / Interfaces") < spec.indexOf("## Runtime Draft Update"));
  assert.ok(spec.indexOf("## Runtime Draft Update") < spec.indexOf("## 6. Validation and Regression Points"));
  assert.equal(report.navigation.summary, "synced 3 navigation file(s)");
  assert.ok(docsReadme.includes("## 6. Feature Packages"));
  assert.ok(docsReadme.includes("docs/features/focus-mode/"));
  assert.ok(decisionLog.includes("# Decision Log"));
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
  assert.ok(!report.actions.includes("draft_doc_update"));
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

test("runtime decide records a human decision in the project decision log", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal", "--project-name", "Decision Demo", "--owner", "Berlin"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const stdout = createMemoryWriter();
  const stderr = createMemoryWriter();
  const exitCode = await runCli([
    "runtime",
    "decide",
    "--gate",
    "draft_to_active_promotion",
    "--decision",
    "Keep the document in Draft until acceptance coverage is complete",
    "--status",
    "deferred",
    "--feature",
    "focus-mode",
    "--note",
    "Wait for QA review before promoting.",
  ], { cwd: tempDir, stdout, stderr });

  assert.equal(exitCode, 0);
  assert.equal(stderr.toString(), "");
  assert.match(stdout.toString(), /Recorded deferred decision/);

  const decisionLog = await fs.readFile(path.join(tempDir, "docs", "governance", "DECISION-LOG.md"), "utf8");
  assert.ok(decisionLog.includes("draft_to_active_promotion"));
  assert.ok(decisionLog.includes("Keep the document in Draft until acceptance coverage is complete"));
  assert.ok(decisionLog.includes("Wait for QA review before promoting."));
});

test("runtime resume refuses deferred gate decisions", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal", "--project-name", "Deferred Demo", "--owner", "Berlin"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const decideExitCode = await runCli([
    "runtime",
    "decide",
    "--gate",
    "draft_to_active_promotion",
    "--decision",
    "Wait until acceptance coverage is complete",
    "--status",
    "deferred",
  ], { cwd: tempDir, stdout: createMemoryWriter(), stderr: createMemoryWriter() });

  assert.equal(decideExitCode, 0);

  const resumeStdout = createMemoryWriter();
  const resumeStderr = createMemoryWriter();
  const resumeExitCode = await runCli([
    "runtime",
    "resume",
    "--gate",
    "draft_to_active_promotion",
    "--task",
    "Update roadmap status for the next sprint",
    "--format",
    "json",
  ], { cwd: tempDir, stdout: resumeStdout, stderr: resumeStderr });

  assert.equal(resumeExitCode, 1);
  assert.match(resumeStderr.toString(), /recorded as deferred/);
});

test("runtime resume continues after an approved gate decision", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal", "--project-name", "Resume Demo", "--owner", "Berlin"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const blockedStdout = createMemoryWriter();
  const blockedStderr = createMemoryWriter();
  const blockedExitCode = await runCli([
    "runtime",
    "run",
    "--task",
    "Update roadmap status for the next sprint",
    "--format",
    "json",
  ], { cwd: tempDir, stdout: blockedStdout, stderr: blockedStderr });

  assert.equal(blockedExitCode, 2);
  assert.equal(blockedStderr.toString(), "");
  const blockedReport = JSON.parse(blockedStdout.toString());
  assert.ok(blockedReport.gates.gates.includes("draft_to_active_promotion"));

  const decideStdout = createMemoryWriter();
  const decideStderr = createMemoryWriter();
  const decideExitCode = await runCli([
    "runtime",
    "decide",
    "--gate",
    "draft_to_active_promotion",
    "--decision",
    "Proceed with the status update while keeping the document in Draft",
    "--status",
    "accepted",
  ], { cwd: tempDir, stdout: decideStdout, stderr: decideStderr });

  assert.equal(decideExitCode, 0);
  assert.equal(decideStderr.toString(), "");

  const resumeStdout = createMemoryWriter();
  const resumeStderr = createMemoryWriter();
  const resumeExitCode = await runCli([
    "runtime",
    "resume",
    "--task",
    "Update roadmap status for the next sprint",
    "--gate",
    "draft_to_active_promotion",
    "--write-drafts",
    "--format",
    "json",
  ], { cwd: tempDir, stdout: resumeStdout, stderr: resumeStderr });

  assert.equal(resumeExitCode, 0);
  assert.equal(resumeStderr.toString(), "");

  const resumedReport = JSON.parse(resumeStdout.toString());
  const roadmapStatus = await fs.readFile(path.join(tempDir, "docs", "strategy", "ROADMAP-STATUS.md"), "utf8");

  assert.equal(resumedReport.finalStatus, "resumed_with_draft_updates");
  assert.ok(resumedReport.gates.approvedGates.includes("draft_to_active_promotion"));
  assert.equal(resumedReport.input.resumedFrom.gate, "draft_to_active_promotion");
  assert.ok(resumedReport.actions.includes("draft_doc_update"));
  assert.ok(roadmapStatus.includes("## Runtime Draft Update"));
});

test("runtime can restore task context from a previous runtime report", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal", "--project-name", "Resume Report Demo", "--owner", "Berlin"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const blockedReportPath = path.join(tempDir, "blocked-runtime.json");
  const blockedStdout = createMemoryWriter();
  const blockedStderr = createMemoryWriter();
  const blockedExitCode = await runCli([
    "runtime",
    "run",
    "--task",
    "Update roadmap status for the next sprint",
    "--format",
    "json",
    "--output",
    blockedReportPath,
  ], { cwd: tempDir, stdout: blockedStdout, stderr: blockedStderr });

  assert.equal(blockedExitCode, 2);
  assert.equal(blockedStderr.toString(), "");

  const resumeInput = await loadResumeInputFromReport(tempDir, blockedReportPath);
  assert.equal(resumeInput.task, "Update roadmap status for the next sprint");
  assert.equal(resumeInput.featureSlug, null);
  assert.ok(resumeInput.sourceReport.endsWith("blocked-runtime.json"));
});
