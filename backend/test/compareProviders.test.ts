import { describe, expect, it } from "vitest";
import { estimateTraining } from "../src/estimation/trainingEstimator.js";
import { compareProviderCosts } from "../src/pricing/compareProviders.js";
import { recommendHardwareProfiles } from "../src/recommendation/hardwareProfiles.js";
import { SCENARIOS } from "./fixtures/scenarios.js";

describe("compareProviderCosts", () => {
  it("returns ranked rows from cheapest to most expensive", () => {
    const estimate = estimateTraining(SCENARIOS.small);
    const recommendations = recommendHardwareProfiles(estimate, SCENARIOS.small.targetDays);
    const rows = compareProviderCosts(estimate, SCENARIOS.small, recommendations);

    expect(rows.length).toBeGreaterThan(0);
    for (let i = 1; i < rows.length; i += 1) {
      expect(rows[i].totalUsd).toBeGreaterThanOrEqual(rows[i - 1].totalUsd);
    }
  });

  it("respects preferred region when matches exist", () => {
    const estimate = estimateTraining({ ...SCENARIOS.small, preferredRegion: "us-east-1" });
    const recommendations = recommendHardwareProfiles(estimate, SCENARIOS.small.targetDays);
    const rows = compareProviderCosts(estimate, { ...SCENARIOS.small, preferredRegion: "us-east-1" }, recommendations);

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.region === "us-east-1")).toBe(true);
  });
});
