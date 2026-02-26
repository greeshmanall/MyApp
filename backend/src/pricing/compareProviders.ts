import type {
  HardwareRecommendation,
  ProviderCostBreakdown,
  TrainingEstimate,
  TrainingWorkloadInput
} from "../../../shared/types.js";
import {
  estimateDaysForGpuCount,
  gpuCountForTargetDays
} from "../recommendation/hardwareProfiles.js";
import { loadCatalogSkus } from "./catalog.js";

export function compareProviderCosts(
  estimate: TrainingEstimate,
  workload: TrainingWorkloadInput,
  _recommendations: HardwareRecommendation[]
): ProviderCostBreakdown[] {
  const skus = loadCatalogSkus();

  const withRegionPreference = workload.preferredRegion
    ? skus.filter((sku) => sku.region === workload.preferredRegion)
    : skus;
  const finalCandidates = withRegionPreference.length > 0 ? withRegionPreference : skus;

  return finalCandidates
    .map((sku) => {
      const requiredGpus = gpuCountForTargetDays(
        estimate,
        sku.fp16TflopsPerGpu,
        workload.targetDays
      );
      const nodesNeeded = Math.ceil(requiredGpus / sku.gpuCount);
      const actualGpus = nodesNeeded * sku.gpuCount;

      const runtimeDays = estimateDaysForGpuCount(
        estimate,
        actualGpus,
        sku.fp16TflopsPerGpu
      );
      const totalHours = runtimeDays * 24;
      const totalUsd = totalHours * nodesNeeded * sku.hourlyUsd;

      return {
        provider: sku.provider,
        skuId: sku.id,
        region: sku.region,
        gpuModel: sku.gpuModel,
        gpuCount: actualGpus,
        hourlyUsd: sku.hourlyUsd * nodesNeeded,
        estimatedDays: runtimeDays,
        totalUsd,
        effectiveUsdPerGpuHour: totalUsd / (totalHours * actualGpus),
        assumptions: [
          `Utilization set to ${(workload.utilization * 100).toFixed(0)}%.`,
          "Includes compute hourly pricing only."
        ]
      };
    })
    .sort((a, b) => a.totalUsd - b.totalUsd);
}
