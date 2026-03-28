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

## Releasing

Publishing to npm uses OIDC trusted publishing — no tokens or secrets needed.

1. Update the version in `package.json` and commit:
   ```bash
   npm version patch  # or minor, major
   git push
   ```
2. Create a GitHub Release at https://github.com/NiordOrg/niord-info/releases/new
   - Tag: `v<version>` (e.g. `v0.2.0`) — the `v` prefix is required
   - The tag version must match the version in `package.json`
3. Publishing the release triggers the workflow, which builds the library and publishes to npm.
