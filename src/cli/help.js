export const HELP_TEXT = `vibedocs

Usage:
  vibedocs init [target] [--mode minimal|standard|full] [--project-name NAME] [--owner OWNER] [--force] [--dry-run]
  vibedocs feature create <name> [target] [--owner OWNER] [--force] [--dry-run]
  vibedocs audit [target] [--format text|json|markdown]
  vibedocs glossary check [target] [--path docs/product --path docs/features]
  vibedocs --help
  vibedocs --version

Commands:
  init              Create docs/ scaffold from the bundled templates.
  feature create    Create a feature package under docs/features/<feature>.
  audit             Run the core rule set against a repository.
  glossary check    Run glossary-focused checks against the repository.
`;
