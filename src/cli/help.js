export const HELP_TEXT = `vibedocs

Usage:
  vibedocs init [target] [--mode minimal|standard|full] [--project-name NAME] [--owner OWNER] [--force] [--dry-run]
  vibedocs feature create <name> [target] [--owner OWNER] [--force] [--dry-run]
  vibedocs audit [target] [--format text|json|markdown] [--semantic off|heuristic] [--changed path] [--rule-pack FILE] [--output FILE]
  vibedocs runtime run [target] --task TEXT [--feature SLUG] [--semantic off|heuristic] [--changed path] [--write-drafts] [--format text|json] [--output FILE]
  vibedocs glossary check [target] [--path docs/product --path docs/features] [--rule-pack FILE] [--format text|json|markdown] [--output FILE]
  vibedocs --help
  vibedocs --version

Commands:
  init              Create docs/ scaffold from the bundled templates.
  feature create    Create a feature package under docs/features/<feature>.
  audit             Run the core rule set, with optional heuristic semantic checks.
  runtime run       Run the first-pass agent runtime flow and emit a structured runtime report.
  glossary check    Run glossary-focused checks against the repository.

Config:
  The CLI will automatically read vibedocs.config.json or .vibedocsrc.json from the project root.
  Rule packs can be supplied by config or repeated --rule-pack flags.
`;
