# niord-info

Reusable Angular library for Niord-based apps.

Published package name: `@niord-org/niord-info`

This directory is intended to become the standalone library repo.

The temporary standalone staging remote can be a fork, but the final canonical home is:

- `https://github.com/NiordOrg/niord-info`

During the temporary combined-workspace phase, `niord-info-dk` still consumes this library source directly
from the parent workspace for fast local development.

## Standalone library development

Install dependencies and build:

```bash
npm install
npm run build
```

Build output:

- `dist/`

## Temporary workspace development

From the parent workspace root:

```bash
npm run dev
```

That lets `niord-info-dk` use this library source directly without publishing every change.

## GitHub Actions release flow

- CI workflow: `.github/workflows/ci.yml`
- Release workflow: `.github/workflows/release.yml`

Required GitHub secret:

- `NPM_TOKEN` (npm publish token)

Release steps:

```bash
# in the standalone niord-info repo
npm version patch
git push
git tag v$(node -p "require('./package.json').version")
git push --tags
```

The tag-triggered workflow validates the `v*` tag against `package.json`, builds the library,
creates a GitHub Release with the packed `.tgz` artifact, and publishes to npm.
