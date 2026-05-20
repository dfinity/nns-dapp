# NNS Dapp

## Cursor Cloud specific instructions

### Overview

This is the NNS Dapp (Network Nervous System Decentralized Application) for the Internet Computer. The primary development target is the **frontend** SvelteKit application in `frontend/`.

### Node.js version

The project requires **Node.js 25.x** (pinned to 25.8.0 via Volta). The update script installs this via nvm. Verify with `node --version` in `frontend/`.

### Frontend development commands

All commands run from `frontend/`:

| Task              | Command                                         |
| ----------------- | ----------------------------------------------- |
| Install deps      | `npm ci`                                        |
| Dev server        | `npm run dev` (serves on http://localhost:5173) |
| Lint              | `npm run lint` (prettier + eslint)              |
| Type + lint check | `npm run check` (svelte-check + lint)           |
| Unit tests        | `npm run test` (tsc + vitest, ~670 test files)  |
| Build             | `npm run build`                                 |

### `.env` file requirement

The dev server requires a `frontend/.env` file with `VITE_*` variables (canister IDs, host, feature flags). Without it the server returns HTTP 500. The `.env` is gitignored.

To generate it with a running local replica: `DFX_NETWORK=local ./config.sh` from repo root.

For frontend-only development (no local IC replica), create `frontend/.env` with placeholder canister IDs. See `frontend/src/tests/lib/utils/env-vars.utils.spec.ts` for valid example values.

### Running without a local IC replica

The frontend dev server will start and render all pages, but:

- Authentication (Internet Identity) will not work
- Canister calls will fail with network errors
- The SNS aggregator JSON fetch will return HTML errors (benign)

This is sufficient for UI development, component testing, and running the full vitest suite.

### Full local environment (optional)

For end-to-end testing with canisters, follow `HACKING.md`: install dfx, create a snapshot via [snsdemo](https://github.com/dfinity/snsdemo/), start the replica with `scripts/dfx-snapshot-start`, then generate `.env` with `config.sh`.

### Test suite notes

- Unit tests (`npm run test`) run entirely in jsdom/node - no network or replica needed.
- Tests take ~5-6 minutes to complete (~5900 tests across ~670 files).
- E2E tests (Playwright) are in `frontend/src/tests/e2e/` and require a running replica.
