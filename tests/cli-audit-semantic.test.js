import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runCli } from "../src/cli/run.js";
import { createMemoryWriter } from "./helpers/io.js";

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "vibedocs-audit-semantic-"));
}

test("audit can run heuristic semantic checks for product-like content inside engineering docs", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const techSpecPath = path.join(tempDir, "docs", "engineering", "TECH-SPEC.md");
  await fs.appendFile(
    techSpecPath,
    "\n## 7. 目标用户\n\n- 目标用户：创作者\n- 用户问题：缺少专注反馈\n- 非目标：不做社区功能\n",
    "utf8",
  );

  const stdout = createMemoryWriter();
  const exitCode = await runCli(["audit", "--format", "json", "--semantic", "heuristic"], {
    cwd: tempDir,
    stdout,
    stderr: createMemoryWriter(),
  });

  assert.equal(exitCode, 0);

  const report = JSON.parse(stdout.toString());
  const semanticResult = report.results.find((result) => result.rule_id === "semantic.role.product_content_in_engineering_doc");

  assert.equal(report.run.semanticMode, "heuristic");
  assert.equal(semanticResult.status, "warn");
  assert.equal(semanticResult.semantic_type, "role_misplacement");
  assert.equal(semanticResult.engine, "heuristic-semantic");
  assert.match(semanticResult.target, /docs\/engineering\/TECH-SPEC\.md#7\. 目标用户|docs\/engineering\/TECH-SPEC\.md#目标用户/);
});

test("audit can run heuristic semantic checks for status leakage outside roadmap status", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const productPath = path.join(tempDir, "docs", "product", "FEATURE-PRD.md");
  await fs.appendFile(
    productPath,
    "\n## 7. 当前进展\n\n- 已完成：完成原型\n- 进行中：补交互细节\n- 下一步：补埋点\n",
    "utf8",
  );

  const stdout = createMemoryWriter();
  const exitCode = await runCli(["audit", "--format", "json", "--semantic", "heuristic"], {
    cwd: tempDir,
    stdout,
    stderr: createMemoryWriter(),
  });

  assert.equal(exitCode, 0);

  const report = JSON.parse(stdout.toString());
  const semanticResult = report.results.find((result) => result.rule_id === "semantic.ssot.status_leakage");

  assert.equal(semanticResult.status, "warn");
  assert.equal(semanticResult.semantic_type, "status_leakage");
  assert.match(semanticResult.target, /docs\/product\/FEATURE-PRD\.md#7\. 当前进展|docs\/product\/FEATURE-PRD\.md#当前进展/);
  assert.ok(semanticResult.trigger_signals.includes("content:已完成"));
  assert.ok(semanticResult.trigger_signals.includes("content:进行中"));
});

test("audit stays quiet on a freshly initialized minimal repository when heuristic semantic checks are enabled", async (t) => {
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
  const exitCode = await runCli(["audit", "--format", "json", "--semantic", "heuristic"], {
    cwd: tempDir,
    stdout,
    stderr: createMemoryWriter(),
  });

  assert.equal(exitCode, 0);

  const report = JSON.parse(stdout.toString());
  const semanticResults = report.results.filter((result) => result.engine === "heuristic-semantic");

  assert.deepEqual(semanticResults, []);
});

test("audit stays quiet on a generated feature package when heuristic semantic checks are enabled", async (t) => {
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
  const exitCode = await runCli(["audit", "--format", "json", "--semantic", "heuristic"], {
    cwd: tempDir,
    stdout,
    stderr: createMemoryWriter(),
  });

  assert.equal(exitCode, 0);

  const report = JSON.parse(stdout.toString());
  const semanticResults = report.results.filter((result) => result.engine === "heuristic-semantic");

  assert.deepEqual(semanticResults, []);
});

test("audit flags feature packages that redefine global product principles", async (t) => {
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

  const featurePrdPath = path.join(tempDir, "docs", "features", "focus-mode", "PRD.md");
  await fs.appendFile(
    featurePrdPath,
    "\n## 7. 原则排序\n\n1. 用户价值优先\n2. 一致性优先\n\n## 8. 冲突判断法\n\n1. 用户价值是否成立\n2. 是否违反项目宪法和术语边界\n3. 是否能被当前验收和运营机制承接\n",
    "utf8",
  );

  const stdout = createMemoryWriter();
  const exitCode = await runCli(["audit", "--format", "json", "--semantic", "heuristic"], {
    cwd: tempDir,
    stdout,
    stderr: createMemoryWriter(),
  });

  assert.equal(exitCode, 0);

  const report = JSON.parse(stdout.toString());
  const semanticResult = report.results.find((result) => result.rule_id === "semantic.ssot.feature_redefines_global_principles");

  assert.equal(semanticResult.status, "warn");
  assert.equal(semanticResult.category, "ssot");
  assert.equal(semanticResult.semantic_type, "global_rule_leakage");
  assert.ok(semanticResult.suggested_docs.includes("docs/strategy/PRODUCT-PRINCIPLES.md"));
});

test("audit flags glossary-like tables outside governance glossary", async (t) => {
  const tempDir = await makeTempDir();
  t.after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  await runCli(["init", "--mode", "minimal"], {
    cwd: tempDir,
    stdout: createMemoryWriter(),
    stderr: createMemoryWriter(),
  });

  const productPath = path.join(tempDir, "docs", "product", "FEATURE-PRD.md");
  await fs.appendFile(
    productPath,
    "\n## 8. 本地术语\n\n| 术语 | 定义 | 禁止混用 | SSOT |\n|---|---|---|---|\n| 专注模式 | 限制干扰的工作模式 | 深度模式 | docs/product/FEATURE-PRD.md |\n",
    "utf8",
  );

  const stdout = createMemoryWriter();
  const exitCode = await runCli(["audit", "--format", "json", "--semantic", "heuristic"], {
    cwd: tempDir,
    stdout,
    stderr: createMemoryWriter(),
  });

  assert.equal(exitCode, 0);

  const report = JSON.parse(stdout.toString());
  const semanticResult = report.results.find((result) => result.rule_id === "semantic.terminology.local_glossary_like_table");

  assert.equal(semanticResult.status, "warn");
  assert.equal(semanticResult.category, "terminology");
  assert.equal(semanticResult.semantic_type, "global_rule_leakage");
  assert.ok(semanticResult.suggested_docs.includes("docs/governance/GLOSSARY.md"));
});

test("audit flags highly similar same-role sections between feature and global docs", async (t) => {
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

  const globalTechSpecPath = path.join(tempDir, "docs", "engineering", "TECH-SPEC.md");
  const sharedSection = "\n## 7. API Contract\n\n- 输入：任务状态、用户上下文和当前会话配置\n- 输出：规范化的执行结果、错误处理和兼容性回退\n- 错误处理：当输入缺失时返回结构化错误对象并保留兼容行为\n";
  await fs.appendFile(globalTechSpecPath, sharedSection, "utf8");

  const featureTechSpecPath = path.join(tempDir, "docs", "features", "focus-mode", "TECH-SPEC.md");
  await fs.appendFile(featureTechSpecPath, sharedSection, "utf8");

  const stdout = createMemoryWriter();
  const exitCode = await runCli(["audit", "--format", "json", "--semantic", "heuristic"], {
    cwd: tempDir,
    stdout,
    stderr: createMemoryWriter(),
  });

  assert.equal(exitCode, 0);

  const report = JSON.parse(stdout.toString());
  const semanticResult = report.results.find((result) => result.rule_id === "semantic.similarity.duplicate_definition_sections");

  assert.equal(semanticResult.status, "warn");
  assert.equal(semanticResult.semantic_type, "duplicate_definition");
  assert.ok(semanticResult.suggested_docs.includes("docs/engineering/TECH-SPEC.md"));
  assert.ok(semanticResult.trigger_signals.some((entry) => entry.startsWith("body_similarity:")));
});
