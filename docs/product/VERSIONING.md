# Versioning

Last Updated: 2026-03-12
Status: Active

## 1. Goal

Define how the open-core package is versioned, tagged, and released so the npm package, changelog, and GitHub Releases stay aligned.

## 2. Policy

The package follows SemVer:

- `MAJOR`: breaking CLI behavior, breaking public API exports, breaking report schema changes
- `MINOR`: backward-compatible commands, options, rule coverage, public API additions
- `PATCH`: bug fixes, doc-only corrections to generated output, non-breaking workflow fixes

Because the report format is still `v1alpha1`, backward-compatible additive fields may ship in minor releases.

## 3. Release Units

Every public release must move these units together:

- `package.json` version
- `CHANGELOG.md`
- Git tag: `vX.Y.Z`
- GitHub Release

Do not publish from an untagged commit.

## 4. Changelog Rules

`CHANGELOG.md` keeps one `Unreleased` section at the top.

Before publishing:

1. Move the relevant entries from `Unreleased` into a dated version section.
2. Group changes under `Added`, `Changed`, `Fixed`, `Removed` where applicable.
3. Keep entries user-facing. Do not dump internal refactors with no external effect.
4. Keep a matching release notes file in `docs/releases/X.Y.Z.md`.

## 5. Release Flow

Recommended release flow:

1. Update `package.json` version.
2. Update `CHANGELOG.md`.
3. Run `npm run release:check`.
4. Commit the release changes.
5. Create tag `vX.Y.Z`.
6. Create a GitHub Release from that tag.
7. Let `.github/workflows/publish.yml` publish the npm package.

## 6. Breaking Change Bar

Treat the following as breaking until explicitly documented otherwise:

- Renaming a CLI command
- Removing a config field
- Renaming or removing a public subpath export
- Changing existing report fields in a non-additive way
- Changing rule IDs that downstream workflows may depend on

## 7. Non-Goals

This document does not define:

- Paid layer versioning
- Team rule pack private release strategy
- Multi-package monorepo release orchestration
