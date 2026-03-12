import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runCli } from "../src/cli/run.js";
import { createMemoryWriter } from "./helpers/io.js";

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "vibedocs-glossary-"));
}

test("glossary check flags banned glossary variants in scoped paths", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const glossaryPath = path.join(tempDir, "docs", "governance", "GLOSSARY.md");
  const prdPath = path.join(tempDir, "docs", "product", "FEATURE-PRD.md");

  await fs.writeFile(
    glossaryPath,
    `# 术语表

Last Updated: 2026-03-12
Status: Active
Owner: Berlin
Purpose: test
Scope: test
Non-Goals:
Update Triggers:
Linked SSOT:

## 1. 使用规则

- 一个概念只保留一个标准叫法

## 2. 术语清单

| 术语 | 定义 | 禁止混用 | SSOT |
|---|---|---|---|
| Feature Package | 功能包 | 功能文档包 | docs/features/README.md |
`,
    "utf8",
  );

  await fs.appendFile(prdPath, "\n功能文档包需要在本轮补齐。\n", "utf8");

  const stdout = createMemoryWriter();
  const exitCode = await runCli(
    ["glossary", "check", "--format", "json", "--path", "docs/product"],
    { cwd: tempDir, stdout, stderr: createMemoryWriter() },
  );

  assert.equal(exitCode, 0);

  const report = JSON.parse(stdout.toString());
  const driftResult = report.results.find((result) => result.rule_id === "core.terminology.glossary_term_drift");

  assert.equal(report.summary.failed, 0);
  assert.equal(driftResult.status, "warn");
  assert.ok(driftResult.evidence.some((entry) => entry.includes("功能文档包")));
});
