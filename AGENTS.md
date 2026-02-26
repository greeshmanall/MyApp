# AGENTS.md

## Cursor Cloud specific instructions

This is a self-contained Node.js monorepo (npm workspaces) with no databases, Docker, external services, or environment variables required.

### Services

| Service | Port | Command |
|---------|------|---------|
| Backend (Express + TypeScript) | 4000 | `npm run dev:backend` |
| Frontend (React + Vite) | 5173 | `npm run dev:frontend` |
| Both (parallel) | 4000 + 5173 | `npm run dev` |

### Key commands

See `package.json` scripts. Summary:

- **Dev**: `npm run dev` — starts backend (tsx watch) and frontend (vite) in parallel
- **Test**: `npm run test` — runs Vitest suite in backend workspace (6 tests across 2 files)
- **Build**: `npm run build` — TypeScript compilation + Vite production build

### Non-obvious notes

- The frontend Vite config proxies `/api` requests to the backend at `localhost:4000`, so both servers must be running for the UI to work.
- The estimation API endpoint is `POST /api/estimate` with fields: `modelParamsB`, `trainingTokensB`, `targetDays`, `utilization` (see `shared/types.ts` for the full `TrainingWorkloadInput` schema).
- There is no ESLint configured in this project; type checking is done via `tsc` during the build step.
- All pricing data is static JSON in `data/pricing/`; no external API calls are made.
