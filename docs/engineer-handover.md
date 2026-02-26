# Engineer Handover Guide

This document is for a new engineer taking over the LLM Compute Planner MVP.

## 1) Product Summary

LLM Compute Planner is a training-cost planning app for researchers.

- Input: model size, token count, target training duration, utilization, optional preferred region
- Output:
  - training compute estimate
  - hardware recommendations (GPU family + dynamic GPU count)
  - provider comparison (AWS, GCP, CoreWeave, RunPod)
- Current scope:
  - training only (no inference path)
  - USD only
  - manually maintained monthly pricing catalog

## 2) High-Level Architecture

- `frontend/` (React + Vite): input form + results rendering
- `backend/` (Express + TypeScript): estimator, recommendation, pricing comparison API
- `shared/`: shared TypeScript contracts
- `data/pricing/`: static provider price catalog + metadata
- `docs/`: product and operational docs

Primary flow:

1. User submits scenario in frontend.
2. Frontend calls `POST /api/estimate`.
3. Backend validates payload (`zod`), runs:
   - `estimateTraining(...)`
   - `recommendHardwareProfiles(...)`
   - `compareProviderCosts(...)`
4. Backend returns unified result object for UI display.

## 3) Key Files to Know

- API entrypoint: `backend/src/server.ts`
- Training estimator: `backend/src/estimation/trainingEstimator.ts`
- Hardware sizing logic: `backend/src/recommendation/hardwareProfiles.ts`
- Provider pricing comparison: `backend/src/pricing/compareProviders.ts`
- Catalog loader/validation: `backend/src/pricing/catalog.ts`
- Shared types: `shared/types.ts`
- Pricing dataset: `data/pricing/catalog.usd.json`
- Pricing metadata: `data/pricing/catalog.meta.json`
- Frontend app shell/API call: `frontend/src/App.tsx`

## 4) Local Development Runbook

Requirements:

- Node.js + npm

Commands:

```bash
npm install
npm run dev
```

Expected local endpoints:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health check: `GET http://localhost:4000/health`

Build and test:

```bash
npm run build
npm run test
```

## 5) API Contract (MVP)

### POST `/api/estimate`

Request body:

- `modelParamsB` (number > 0)
- `trainingTokensB` (number > 0)
- `targetDays` (number > 0)
- `utilization` (0.2 to 1)
- `preferredRegion` (optional string)

Response:

- `assumptions`
- `estimate`
- `recommendations`
- `providerComparison`
- `catalog` metadata
- `caveats`

Validation currently lives in `workloadSchema` in `backend/src/server.ts`.

## 6) Estimation Model Assumptions

Current formulas are intentionally lightweight for MVP:

- Total FLOPs proxy: `6 * params * tokens`
- GPU count recommendation:
  - derived from target days and GPU theoretical throughput
  - rounded up to increments of 8 GPUs
- Provider comparison:
  - scales node count by SKU `gpuCount` (currently mostly 8-GPU SKUs)
  - compares compute-only costs

Important limitations:

- Throughput is theoretical and does not include real-world bottlenecks.
- No networking, storage, data pipeline, or orchestration overhead in cost.
- No spot/preemptible modeling yet.

## 7) Pricing Catalog Operations

Monthly workflow:

1. Update `data/pricing/catalog.usd.json`
2. Update `data/pricing/catalog.meta.json` (`catalogVersion`, `refreshedAt`, `sourceNotes`)
3. Run tests and scenario sanity checks

Reference: `docs/pricing-update-playbook.md`

## 8) Testing Strategy

Current tests are in `backend/test/`:

- `trainingEstimator.test.ts`: monotonicity + utilization sensitivity
- `compareProviders.test.ts`:
  - recommendation scaling behavior
  - provider ranking order
  - preferred region filtering

When changing formulas/catalog structure, update tests first or in same PR.

## 9) Known Gaps / Tech Debt

- No inference planner yet.
- No auth, persistence, or saved scenarios.
- No automated live pricing ingestion.
- No explicit API versioning.
- Some generated JS build artifacts are currently present in tracked source areas; clean separation between source and build outputs should be enforced in a cleanup pass.

## 10) Safe First Tasks for a New Engineer

1. Add API response snapshots for a few canonical scenarios.
2. Add explanation text in UI for why provider rank changed between runs.
3. Add schema-level validation for pricing catalog CI checks.
4. Add optional cost components (storage/network) behind toggles.
5. Start inference-mode planner as a separate endpoint and UI tab.

## 11) Release / PR Checklist

- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] Manual sanity check in UI with at least 2 scenarios
- [ ] If pricing changed, update `catalog.meta.json` timestamp/version
- [ ] Update docs if formulas or response shape changed
