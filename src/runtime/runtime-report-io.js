import fs from "node:fs/promises";
import path from "node:path";

import { ensureDirectory } from "../filesystem/fs.js";

const REQUIRED_TOP_LEVEL_FIELDS = [
  "runtimeVersion",
  "tool",
  "generatedAt",
  "input",
  "classification",
  "routing",
  "gates",
  "actions",
  "finalStatus",
];

export function validateRuntimeReportShape(report) {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    throw new Error("Invalid runtime report: expected a JSON object.");
  }

  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (!(field in report)) {
      throw new Error(`Invalid runtime report: missing required field "${field}".`);
    }
  }

  if (!report.input || typeof report.input !== "object") {
    throw new Error('Invalid runtime report: missing "input" object.');
  }

  if (typeof report.input.task !== "string" || report.input.task.trim().length === 0) {
    throw new Error('Invalid runtime report: "input.task" must be a non-empty string.');
  }

  if (!Array.isArray(report.input.changedPaths)) {
    throw new Error('Invalid runtime report: "input.changedPaths" must be an array.');
  }

  if (!report.routing || typeof report.routing !== "object") {
    throw new Error('Invalid runtime report: missing "routing" object.');
  }

  if (!report.gates || typeof report.gates !== "object") {
    throw new Error('Invalid runtime report: missing "gates" object.');
  }

  if (!Array.isArray(report.actions)) {
    throw new Error('Invalid runtime report: "actions" must be an array.');
  }

  if (report.writes && typeof report.writes === "object" && "writes" in report.writes && !Array.isArray(report.writes.writes)) {
    throw new Error('Invalid runtime report: "writes.writes" must be an array when present.');
  }

  return report;
}

export async function readRuntimeReport(projectRoot, reportPath) {
  const absolutePath = path.resolve(projectRoot, reportPath);
  const raw = await fs.readFile(absolutePath, "utf8");
  const report = JSON.parse(raw);

  return {
    absolutePath,
    report: validateRuntimeReportShape(report),
  };
}

export async function writeRuntimeReport(report, outputPath, cwd) {
  const validated = validateRuntimeReportShape(report);
  const absolutePath = path.resolve(cwd, outputPath);
  await ensureDirectory(path.dirname(absolutePath));
  await fs.writeFile(absolutePath, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  return absolutePath;
}
