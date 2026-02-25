import { z } from "zod";
import catalogJson from "../../../data/pricing/catalog.usd.json";
import type { GpuSku } from "../../../shared/types.js";

const skuSchema = z.object({
  id: z.string(),
  provider: z.enum(["aws", "gcp", "coreweave", "runpod"]),
  displayName: z.string(),
  gpuModel: z.string(),
  gpuCount: z.number().int().positive(),
  region: z.string(),
  hourlyUsd: z.number().positive(),
  fp16TflopsPerGpu: z.number().positive(),
  notes: z.string().optional()
});

const catalogSchema = z.object({
  skus: z.array(skuSchema).min(1)
});

export function loadCatalogSkus(): GpuSku[] {
  const parsed = catalogSchema.safeParse(catalogJson);
  if (!parsed.success) {
    throw new Error(`Invalid pricing catalog: ${parsed.error.message}`);
  }

  return parsed.data.skus;
}
