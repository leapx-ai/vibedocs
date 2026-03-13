# Changelog

All notable changes to this project will be documented in this file.

The format follows Keep a Changelog and the versioning policy is documented in `docs/product/VERSIONING.md`.

## [Unreleased]

### Added

- Packaged AI operating guides for VibeDocs projects: operating protocol, execution modes, and model bootstrap contract

## [0.1.1] - 2026-03-13

### Changed

- Reduced the published npm package to runtime-only assets required by the CLI
- Removed internal repository docs, website sources, schemas, examples, and other non-runtime assets from the npm tarball
- Rewrote the package README to focus on installation, commands, config, and public documentation links
- Pointed the package homepage to the public docs site instead of the repository README
- Standardized scaffold and template structure in English while keeping narrative guidance in Chinese
- Updated runtime placeholder hydration and semantic checks to match the new structure-language convention

## [0.1.0] - 2026-03-13

### Added

- Open-core VibeDocs CLI with `init`, `feature create`, `audit`, and `glossary check`
- Shared rule engine, report schema, rule pack schema, templates, and scaffold assets
- Initial heuristic semantic audit layer for content misplacement, status leakage, duplicated global principles, glossary-like tables, and duplicate same-role definition sections
- Public package metadata for `@leapx-ai/vibedocs`
- Public docs site on GitHub Pages with quickstart, CLI, concepts, and reference pages
- GitHub Actions for CI, Pages deployment, and npm package publishing
- Clean-install smoke verification via `npm run smoke:install`
- Initial affected-doc suggestion mapping for diff audits
- Versioning, changelog, and repository setup documentation for the first public release
