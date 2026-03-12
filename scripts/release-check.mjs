import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function assertFileExists(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);

  try {
    await fs.access(absolutePath);
  } catch {
    throw new Error(`Release check failed: missing required file ${relativePath}`);
  }
}

async function run(command, args) {
  const child = execFile(command, args, {
    cwd: repoRoot,
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
  });

  if (child.stdout) {
    child.stdout.pipe(process.stdout);
  }

  if (child.stderr) {
    child.stderr.pipe(process.stderr);
  }

  const result = await promisify((callback) => {
    child.on("exit", (code) => {
      if (code === 0) {
        callback(null);
        return;
      }

      callback(new Error(`Command failed: ${command} ${args.join(" ")}`));
    });

    child.on("error", callback);
  })();

  return result;
}

async function main() {
  const packageJson = await readJson(path.join(repoRoot, "package.json"));
  const version = packageJson.version;
  const changelog = await fs.readFile(path.join(repoRoot, "CHANGELOG.md"), "utf8");
  const releaseHeading = `## [${version}]`;
  const releaseNotesPath = `docs/releases/${version}.md`;

  if (!changelog.includes(releaseHeading)) {
    throw new Error(`Release check failed: CHANGELOG.md does not contain ${releaseHeading}`);
  }

  await assertFileExists(releaseNotesPath);

  process.stdout.write(`Release metadata looks aligned for v${version}\n`);

  await run("npm", ["test"]);
  await run("npm", ["run", "pack:check"]);
  await run("npm", ["run", "smoke:install"]);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
