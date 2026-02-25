# Product Spec (MVP)

## Problem

Researchers need a practical way to estimate training capacity requirements and compare infrastructure costs before committing to a provider or hardware mix.

## MVP scope

- Workloads: training only
- Currency: USD only
- Pricing source: manual monthly-updated catalog
- Providers: AWS, Google Cloud, CoreWeave, RunPod

## Primary workflow

1. Researcher enters workload assumptions.
2. App estimates compute requirement and feasible timelines.
3. App recommends candidate GPU hardware profiles.
4. App compares provider-specific costs using current catalog rates.

## Inputs

- Model parameters (billions)
- Training tokens (billions)
- Target training days
- Cluster utilization (0-1)
- Optional preferred region

## Outputs

- Estimated total FLOPs
- Estimated aggregate GPU-hours
- Recommended hardware profiles and rationale
- Provider ranking by total cost
- Assumptions summary and pricing catalog timestamp
