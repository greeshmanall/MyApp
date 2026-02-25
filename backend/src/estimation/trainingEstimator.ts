import type { TrainingEstimate, TrainingWorkloadInput } from "../../../shared/types.js";

const FLOPS_PER_PARAM_TOKEN = 6;
const PFLOP_TO_FLOP = 1e15;

export function estimateTraining(input: TrainingWorkloadInput): TrainingEstimate {
  const totalFlops = FLOPS_PER_PARAM_TOKEN * input.modelParamsB * 1e9 * input.trainingTokensB * 1e9;
  const effectivePfPerDayTarget = totalFlops / PFLOP_TO_FLOP / input.targetDays;
  const normalizedPfPerDay = effectivePfPerDayTarget / input.utilization;

  // Convert petaFLOP-days into equivalent GPU-hours using an A100 baseline proxy.
  const a100PfPerHour = (312 * 1e12) / PFLOP_TO_FLOP;
  const gpuHoursRequired = (totalFlops / PFLOP_TO_FLOP) / a100PfPerHour;

  return {
    totalFlops,
    gpuHoursRequired,
    effectivePfDays: normalizedPfPerDay
  };
}
