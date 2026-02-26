# Bug Fix Report: Utilization Not Applied to GPU Sizing

**Date:** 2026-02-25  
**Status:** Fixed

---

## 1. Bug Summary

The `utilization` input (0.2–1.0) was collected from users but **never used** when computing:
- GPU count for hardware recommendations
- Runtime and cost in provider comparison

This caused:
- Under-provisioning: lower utilization required more GPUs, but the system assumed 100%
- Incorrect costs: estimates ignored utilization, so costs were wrong for non-ideal clusters

---

## 2. Root Cause

- `estimateTraining()` computed `effectivePfDays` with utilization but did not pass it to downstream logic
- `gpuCountForTargetDays()` and `estimateDaysForGpuCount()` had no access to utilization
- `TrainingEstimate` did not include utilization

---

## 3. Fix Applied

| File | Change |
|------|--------|
| `shared/types.ts` | Added `utilization: number` to `TrainingEstimate` |
| `backend/src/estimation/trainingEstimator.ts` | Include `utilization` in return; scale `gpuHoursRequired` by `1/utilization` |
| `backend/src/recommendation/hardwareProfiles.ts` | Use `estimate.utilization` in `gpuCountForTargetDays` and `estimateDaysForGpuCount` |

**Formulas:**
- `gpuCountForTargetDays`: `rawGpus = totalPfNeeded / (targetDays * 24 * pfPerHourPerGpu * utilization)`
- `estimateDaysForGpuCount`: `runtime = totalPfNeeded / (pfPerHour * 24 * utilization)`
- `gpuHoursRequired`: `raw / utilization`

---

## 4. Verification

### Build & unit tests
```
✓ npm run build — success
✓ 5/5 tests passed (trainingEstimator, compareProviders)
```

### API behavior

**Utilization sensitivity (7B, 300B tokens, 10 days):**

| Utilization | GPUs (B200) | Est. days | Cost |
|-------------|-------------|-----------|------|
| 50% | 23,336 | 10.0 | $78.4M |
| 100% | 11,672 | 10.0 | $39.2M |

Cost scales as expected: 50% utilization ≈ 2× cost.

**Workload scaling:**

| Workload | Model | Tokens | Target | Util | Cheapest cost |
|----------|-------|--------|--------|------|---------------|
| SMALL | 7B | 300B | 10d | 50% | $78.4M |
| MEDIUM | 30B | 1.2T | 21d | 45% | $1.49B |
| FRONTIER | 180B | 20T | 60d | 40% | $168B |

---

## 5. Conclusion

Utilization is now applied consistently across estimation, hardware recommendations, and provider cost comparison. Costs and timelines reflect cluster efficiency as intended.
