import type { HardwareRecommendation, TrainingEstimate } from "../../../shared/types.js";

interface HardwareProfile {
  profileId: string;
  title: string;
  gpuModel: string;
  gpuCount: number;
  fp16TflopsPerGpu: number;
  tradeoff: HardwareRecommendation["tradeoff"];
}

const PROFILES: HardwareProfile[] = [
  {
    profileId: "h100x64",
    title: "64x H100 cluster",
    gpuModel: "H100",
    gpuCount: 64,
    fp16TflopsPerGpu: 1979,
    tradeoff: "speed_optimized"
  },
  {
    profileId: "a100x64",
    title: "64x A100 cluster",
    gpuModel: "A100",
    gpuCount: 64,
    fp16TflopsPerGpu: 312,
    tradeoff: "balanced"
  },
  {
    profileId: "l40sx64",
    title: "64x L40S cluster",
    gpuModel: "L40S",
    gpuCount: 64,
    fp16TflopsPerGpu: 181,
    tradeoff: "cost_optimized"
  }
];

export function estimateDaysForProfile(estimate: TrainingEstimate, profile: HardwareProfile): number {
  const petaFlopsPerHourPerGpu = profile.fp16TflopsPerGpu / 1000;
  const petaFlopsPerHour = petaFlopsPerHourPerGpu * profile.gpuCount;
  const totalPfNeeded = estimate.totalFlops / 1e15;

  return totalPfNeeded / (petaFlopsPerHour * 24);
}

export function recommendHardwareProfiles(
  estimate: TrainingEstimate,
  targetDays: number
): HardwareRecommendation[] {
  return PROFILES.map((profile) => {
    const estimatedDays = estimateDaysForProfile(estimate, profile);
    const delta = estimatedDays - targetDays;

    const rationale =
      delta <= 0
        ? `Meets target timeline with ~${Math.abs(delta).toFixed(1)} days of buffer.`
        : `Misses target by ~${delta.toFixed(1)} days unless throughput optimization is improved.`;

    return {
      profileId: profile.profileId,
      title: profile.title,
      gpuModel: profile.gpuModel,
      gpuCount: profile.gpuCount,
      estimatedDays,
      rationale,
      tradeoff: profile.tradeoff
    };
  }).sort((a, b) => a.estimatedDays - b.estimatedDays);
}
