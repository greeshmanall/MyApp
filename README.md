# LLM Compute Planner (MVP)

Web MVP for researchers to estimate training compute capacity, pick hardware profiles, and compare USD pricing across AWS, Google Cloud, CoreWeave, and RunPod.

## What this MVP includes

- Training-only estimator (no inference path yet)
- Hardware recommendations with tradeoff rationale
- Provider cost comparison driven by a manually maintained monthly catalog
- React frontend + Express backend

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run in development:

   ```bash
   npm run dev
   ```

3. Open the frontend URL shown by Vite (usually `http://localhost:5173`).

## Project structure

- `frontend/` React UI for scenario inputs and result views
- `backend/` API for estimation, recommendations, and pricing comparison
- `shared/` shared TypeScript types and interfaces
- `data/pricing/` static USD catalog and metadata for provider pricing
- `docs/` product notes and pricing refresh playbook

## Pricing updates

Use the monthly process in `docs/pricing-update-playbook.md`.

## Handover documentation

For onboarding a new engineer, start with `docs/engineer-handover.md`.
