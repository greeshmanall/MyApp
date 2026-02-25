import cors from "cors";
import express from "express";
import { z } from "zod";
import { compareProviderCosts } from "./pricing/compareProviders.js";
import { estimateTraining } from "./estimation/trainingEstimator.js";
import { recommendHardwareProfiles } from "./recommendation/hardwareProfiles.js";
import catalogMeta from "../../data/pricing/catalog.meta.json";
import type { TrainingWorkloadInput } from "../../shared/types.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

const workloadSchema = z.object({
  modelParamsB: z.number().positive(),
  trainingTokensB: z.number().positive(),
  targetDays: z.number().positive(),
  utilization: z.number().min(0.2).max(1),
  preferredRegion: z.string().optional()
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/catalog/meta", (_req, res) => {
  res.json(catalogMeta);
});

app.post("/api/estimate", async (req, res) => {
  const parsed = workloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid workload input",
      issues: parsed.error.flatten()
    });
  }

  const workload: TrainingWorkloadInput = parsed.data;
  const estimate = estimateTraining(workload);
  const recommendations = recommendHardwareProfiles(estimate, workload.targetDays);
  const providerComparison = compareProviderCosts(estimate, workload, recommendations);

  return res.json({
    assumptions: workload,
    estimate,
    recommendations,
    providerComparison,
    catalog: {
      catalogVersion: catalogMeta.catalogVersion,
      refreshedAt: catalogMeta.refreshedAt,
      currency: catalogMeta.currency
    },
    caveats: [
      "Pricing excludes storage, networking, and support plan charges.",
      "Training throughput assumptions are approximate and should be validated with pilot runs."
    ]
  });
});

app.listen(port, () => {
  // Keep startup output minimal and explicit for local development.
  console.log(`Estimator API listening at http://localhost:${port}`);
});
