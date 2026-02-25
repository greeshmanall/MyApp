export type Provider = "aws" | "gcp" | "coreweave" | "runpod";

export interface TrainingWorkloadInput {
  modelParamsB: number;
  trainingTokensB: number;
  targetDays: number;
  utilization: number;
  preferredRegion?: string;
}

export interface TrainingEstimate {
  totalFlops: number;
  gpuHoursRequired: number;
  effectivePfDays: number;
}

export interface GpuSku {
  id: string;
  provider: Provider;
  displayName: string;
  gpuModel: string;
  gpuCount: number;
  region: string;
  hourlyUsd: number;
  fp16TflopsPerGpu: number;
  notes?: string;
}

export interface CatalogMetadata {
  catalogVersion: string;
  currency: "USD";
  refreshedAt: string;
  sourceNotes: string[];
}

export interface HardwareRecommendation {
  profileId: string;
  title: string;
  gpuModel: string;
  gpuCount: number;
  estimatedDays: number;
  rationale: string;
  tradeoff: "speed_optimized" | "balanced" | "cost_optimized";
}

export interface ProviderCostBreakdown {
  provider: Provider;
  skuId: string;
  region: string;
  gpuModel: string;
  gpuCount: number;
  hourlyUsd: number;
  estimatedDays: number;
  totalUsd: number;
  effectiveUsdPerGpuHour: number;
  assumptions: string[];
}

export interface EstimateScenarioResponse {
  assumptions: TrainingWorkloadInput;
  estimate: TrainingEstimate;
  recommendations: HardwareRecommendation[];
  providerComparison: ProviderCostBreakdown[];
  catalog: Pick<CatalogMetadata, "catalogVersion" | "refreshedAt" | "currency">;
  caveats: string[];
}
