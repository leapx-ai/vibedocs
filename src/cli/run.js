import { HELP_TEXT } from "./help.js";
import { TOOL_VERSION } from "../meta.js";
import { handleAuditCommand } from "../commands/audit.js";
import { handleFeatureCreateCommand } from "../commands/feature-create.js";
import { handleGlossaryCheckCommand } from "../commands/glossary-check.js";
import { handleInitCommand } from "../commands/init.js";
import { handleRuntimeDecideCommand } from "../commands/runtime-decide.js";
import { handleRuntimeResumeCommand } from "../commands/runtime-resume.js";
import { handleRuntimeRunCommand } from "../commands/runtime-run.js";

export async function runCli(argv, io = {}) {
  const stdout = io.stdout ?? process.stdout;
  const stderr = io.stderr ?? process.stderr;
  const cwd = io.cwd ?? process.cwd();

  if (argv.length === 0 || argv.includes("--help")) {
    stdout.write(`${HELP_TEXT}\n`);
    return 0;
  }

  if (argv.includes("--version")) {
    stdout.write(`${TOOL_VERSION}\n`);
    return 0;
  }

  const [command, subcommand, ...rest] = argv;

  try {
    if (command === "init") {
      return await handleInitCommand([subcommand, ...rest].filter(Boolean), { cwd, stdout, stderr });
    }

    if (command === "feature" && subcommand === "create") {
      return await handleFeatureCreateCommand(rest, { cwd, stdout, stderr });
    }

    if (command === "audit") {
      return await handleAuditCommand([subcommand, ...rest].filter(Boolean), { cwd, stdout, stderr });
    }

    if (command === "runtime" && subcommand === "run") {
      return await handleRuntimeRunCommand(rest, { cwd, stdout, stderr });
    }

    if (command === "runtime" && subcommand === "decide") {
      return await handleRuntimeDecideCommand(rest, { cwd, stdout, stderr });
    }

    if (command === "runtime" && subcommand === "resume") {
      return await handleRuntimeResumeCommand(rest, { cwd, stdout, stderr });
    }

    if (command === "glossary" && subcommand === "check") {
      return await handleGlossaryCheckCommand(rest, { cwd, stdout, stderr });
    }

    stderr.write(`Unknown command: ${argv.join(" ")}\n\n${HELP_TEXT}\n`);
    return 1;
  } catch (error) {
    stderr.write(`${error.message}\n`);
    return 1;
  }
}
