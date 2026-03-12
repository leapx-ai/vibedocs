# Repository Setup

Last Updated: 2026-03-12
Status: Active

## 1. Goal

Capture the one-time external setup steps that cannot be completed purely from repository code:

- GitHub Pages enablement
- npm trusted publishing enablement
- release prerequisites for the public package

This keeps the repo publish-ready even when local code changes and external account settings are handled separately.

## 2. Current External State

As of 2026-03-12:

- CI workflow is passing.
- The first GitHub Pages deployment attempt failed because the repository does not yet have Pages enabled for GitHub Actions.
- npm CLI on the current machine is not logged in, and trusted publishing has not yet been configured.

## 3. GitHub Pages One-Time Setup

The workflow file already exists at `.github/workflows/pages.yml`.

One-time repo setup still required in GitHub:

1. Open repository settings for `leapx-ai/vibedocs`.
2. Go to `Pages`.
3. Set the build and deployment source to `GitHub Actions`.
4. Re-run the `Deploy Docs Site` workflow or push a new commit touching `website/`.

Expected outcome:

- Future pushes to `main` that touch `website/` will deploy automatically.
- The public docs site will be served from GitHub Pages without changing the package release flow.

## 4. npm Trusted Publishing One-Time Setup

The publish workflow already exists at `.github/workflows/publish.yml`.

One-time npm setup still required:

1. Open npm package settings for `@leapx-ai/vibedocs`.
2. Configure GitHub Actions trusted publishing for the `leapx-ai/vibedocs` repository.
3. Scope the trusted publisher to the publish workflow file.
4. Create a GitHub Release from a tagged version once trusted publishing is active.

Expected outcome:

- `publish.yml` can release the package without storing a long-lived npm automation token in repository secrets.

## 5. Release Prerequisites

Before the first public release:

1. Confirm `package.json`, `CHANGELOG.md`, and docs are aligned.
2. Confirm `npm test`, `npm run pack:check`, and `npm run smoke:install` all pass.
3. Confirm repository links point to `leapx-ai/vibedocs`.
4. Create tag `vX.Y.Z`.
5. Create a GitHub Release from that tag.

## 6. Non-Goals

This document does not define:

- Paid workflow deployment
- Private rule pack distribution
- Internal planning repository structure
