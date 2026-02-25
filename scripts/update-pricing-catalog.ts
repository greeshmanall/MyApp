import { readFile } from "node:fs/promises";

const catalogPath = new URL("../data/pricing/catalog.usd.json", import.meta.url);
const metaPath = new URL("../data/pricing/catalog.meta.json", import.meta.url);

async function validateCatalog(): Promise<void> {
  const [catalogText, metaText] = await Promise.all([
    readFile(catalogPath, "utf-8"),
    readFile(metaPath, "utf-8")
  ]);

  const catalog = JSON.parse(catalogText) as { skus?: Array<Record<string, unknown>> };
  const meta = JSON.parse(metaText) as { catalogVersion?: string; refreshedAt?: string };

  if (!Array.isArray(catalog.skus) || catalog.skus.length === 0) {
    throw new Error("catalog.usd.json must include a non-empty skus array.");
  }

  if (!meta.catalogVersion || !meta.refreshedAt) {
    throw new Error("catalog.meta.json must include catalogVersion and refreshedAt.");
  }

  for (const sku of catalog.skus) {
    const required = ["id", "provider", "gpuModel", "gpuCount", "region", "hourlyUsd", "fp16TflopsPerGpu"];
    for (const key of required) {
      if (!(key in sku)) {
        throw new Error(`SKU is missing required key: ${key}`);
      }
    }
  }

  console.log(`Catalog validation passed for ${catalog.skus.length} SKUs.`);
}

validateCatalog().catch((error) => {
  console.error(error);
  process.exit(1);
});
