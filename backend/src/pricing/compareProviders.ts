import type {
  HardwareRecommendation,
  ProviderCostBreakdown,
  TrainingEstimate,
  TrainingWorkloadInput
} from "../../../shared/types.js";
import { estimateDaysForProfile } from "../recommendation/hardwareProfiles.js";
import { loadCatalogSkus } from "./catalog.js";

export function compareProviderCosts(
  estimate: TrainingEstimate,
  workload: TrainingWorkloadInput,
  recommendations: HardwareRecommendation[]
): ProviderCostBreakdown[] {
  const skus = loadCatalogSkus();

  const preferred = recommendations[0];
  const filteredByModel = skus.filter((sku) => sku.gpuModel === preferred.gpuModel);
  const candidateSkus = filteredByModel.length > 0 ? filteredByModel : skus;

  const withRegionPreference = workload.preferredRegion
    ? candidateSkus.filter((sku) => sku.region === workload.preferredRegion)
    : candidateSkus;

  const finalCandidates = withRegionPreference.length > 0 ? withRegionPreference : candidateSkus;

  return finalCandidates
    .map((sku) => {
      const runtimeDays = estimateDaysForProfile(estimate, {
        profileId: `${sku.gpuModel.toLowerCase()}x${sku.gpuCount}`,
        title: sku.displayName,
        gpuModel: sku.gpuModel,
        gpuCount: sku.gpuCount,
        fp16TflopsPerGpu: sku.fp16TflopsPerGpu,
        tradeoff: "balanced"
      });

      const totalHours = runtimeDays * 24;
      const totalUsd = totalHours * sku.hourlyUsd;

      return {
        provider: sku.provider,
        skuId: sku.id,
        region: sku.region,
        gpuModel: sku.gpuModel,
        gpuCount: sku.gpuCount,
        hourlyUsd: sku.hourlyUsd,
        estimatedDays: runtimeDays,
        totalUsd,
        effectiveUsdPerGpuHour: sku.hourlyUsd / sku.gpuCount,
        assumptions: [
          `Utilization set to ${(workload.utilization * 100).toFixed(0)}%.`,
          "Includes compute hourly pricing only."
        ]
      };
    })
    .sort((a, b) => a.totalUsd - b.totalUsd);
}
