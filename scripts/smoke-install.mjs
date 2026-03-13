import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

async function run(command, args, options = {}) {
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: {
      ...process.env,
      ...options.env,
    },
    maxBuffer: 10 * 1024 * 1024,
  });

  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  };
}

async function main() {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "vibedocs-smoke-install-"));
  const packDir = path.join(tempRoot, "pack");
  const consumerDir = path.join(tempRoot, "consumer");
  const cacheDir = path.join(tempRoot, ".npm-cache");

  try {
    await fs.mkdir(packDir, { recursive: true });
    await fs.mkdir(consumerDir, { recursive: true });

    const { stdout: packStdout } = await run("npm", [
      "pack",
      "--json",
      "--pack-destination",
      packDir,
      "--cache",
      cacheDir,
    ]);

    const packResult = JSON.parse(packStdout);
    const tarballName = packResult[0]?.filename;

    if (!tarballName) {
      throw new Error("Smoke install failed: npm pack did not return a tarball name.");
    }

    await fs.writeFile(
      path.join(consumerDir, "package.json"),
      JSON.stringify(
        {
          name: "vibedocs-smoke-consumer",
          private: true,
          type: "module",
        },
        null,
        2,
      ),
      "utf8",
    );

    await run(
      "npm",
      [
        "install",
        "--ignore-scripts",
        "--no-package-lock",
        "--cache",
        cacheDir,
        path.join(packDir, tarballName),
      ],
      { cwd: consumerDir },
    );

    const cliPath = process.platform === "win32"
      ? path.join(consumerDir, "node_modules", ".bin", "vibedocs.cmd")
      : path.join(consumerDir, "node_modules", ".bin", "vibedocs");

    const { stdout: helpStdout } = await run(cliPath, ["--help"], {
      cwd: consumerDir,
    });

    if (!helpStdout.includes("vibedocs")) {
      throw new Error("Smoke install failed: installed CLI did not return the expected help text.");
    }

    const { stdout: apiStdout } = await run(
      "node",
      [
        "--input-type=module",
        "--eval",
        "import { runAudit } from '@leapx-ai/vibedocs'; console.log(typeof runAudit);",
      ],
      { cwd: consumerDir },
    );

    if (apiStdout !== "function") {
      throw new Error("Smoke install failed: installed package did not expose the expected public API.");
    }

    await run(cliPath, ["init", "--mode", "minimal"], {
      cwd: consumerDir,
    });

    await fs.access(path.join(consumerDir, "docs", "README.md"));
    await fs.access(path.join(consumerDir, "guides", "AI-OPERATING-PROTOCOL.md"));
    await fs.access(path.join(consumerDir, "guides", "AI-PROMPTS.md"));

    process.stdout.write(`Smoke install passed with ${tarballName}\n`);
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
