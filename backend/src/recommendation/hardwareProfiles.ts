import type { HardwareRecommendation, TrainingEstimate } from "../../../shared/types.js";

const GPU_INCREMENT = 8;

interface GpuType {
  gpuModel: string;
  fp16TflopsPerGpu: number;
  tradeoff: HardwareRecommendation["tradeoff"];
}

const GPU_TYPES: GpuType[] = [
  { gpuModel: "B200", fp16TflopsPerGpu: 4500, tradeoff: "speed_optimized" },
  { gpuModel: "H100", fp16TflopsPerGpu: 1979, tradeoff: "speed_optimized" },
  { gpuModel: "A100", fp16TflopsPerGpu: 312, tradeoff: "balanced" },
  { gpuModel: "L40S", fp16TflopsPerGpu: 181, tradeoff: "cost_optimized" }
];

function roundUpToIncrement(n: number, increment: number): number {
  return Math.max(increment, Math.ceil(n / increment) * increment);
}

export function gpuCountForTargetDays(
  estimate: TrainingEstimate,
  fp16TflopsPerGpu: number,
  targetDays: number
): number {
  const totalPfNeeded = estimate.totalFlops / 1e15;
  const pfPerHourPerGpu = fp16TflopsPerGpu / 1000;
  const utilization = estimate.utilization ?? 1;
  const rawGpus = totalPfNeeded / (targetDays * 24 * pfPerHourPerGpu * utilization);
  return roundUpToIncrement(rawGpus, GPU_INCREMENT);
}

export function estimateDaysForGpuCount(
  estimate: TrainingEstimate,
  gpuCount: number,
  fp16TflopsPerGpu: number
): number {
  const totalPfNeeded = estimate.totalFlops / 1e15;
  const pfPerHour = (fp16TflopsPerGpu / 1000) * gpuCount;
  const utilization = estimate.utilization ?? 1;
  return totalPfNeeded / (pfPerHour * 24 * utilization);
}

export function recommendHardwareProfiles(
  estimate: TrainingEstimate,
  targetDays: number
): HardwareRecommendation[] {
  return GPU_TYPES.map((gpu) => {
    const gpuCount = gpuCountForTargetDays(estimate, gpu.fp16TflopsPerGpu, targetDays);
    const estimatedDays = estimateDaysForGpuCount(estimate, gpuCount, gpu.fp16TflopsPerGpu);
    const delta = estimatedDays - targetDays;

    const rationale =
      delta <= 0
        ? `Meets target timeline with ~${Math.abs(delta).toFixed(1)} days of buffer.`
        : `Slightly over target by ~${delta.toFixed(1)} days (GPU count rounded to ${GPU_INCREMENT}s).`;

    return {
      profileId: `${gpu.gpuModel.toLowerCase()}x${gpuCount}`,
      title: `${gpuCount}x ${gpu.gpuModel} cluster`,
      gpuModel: gpu.gpuModel,
      gpuCount,
      estimatedDays,
      rationale,
      tradeoff: gpu.tradeoff
    };
  }).sort((a, b) => a.gpuCount - b.gpuCount);
}
