import { describe, expect, it } from "vitest";
import { estimateTraining } from "../src/estimation/trainingEstimator.js";
import { SCENARIOS } from "./fixtures/scenarios.js";

describe("estimateTraining", () => {
  it("increases compute requirement with larger scenarios", () => {
    const small = estimateTraining(SCENARIOS.small);
    const medium = estimateTraining(SCENARIOS.medium);
    const frontier = estimateTraining(SCENARIOS.frontierish);

    expect(small.totalFlops).toBeGreaterThan(0);
    expect(small.gpuHoursRequired).toBeGreaterThan(0);
    expect(medium.totalFlops).toBeGreaterThan(small.totalFlops);
    expect(frontier.totalFlops).toBeGreaterThan(medium.totalFlops);
    expect(frontier.gpuHoursRequired).toBeGreaterThan(medium.gpuHoursRequired);
  });

  it("penalizes lower utilization with higher effective PF-days", () => {
    const efficient = estimateTraining({ ...SCENARIOS.medium, utilization: 0.7 });
    const inefficient = estimateTraining({ ...SCENARIOS.medium, utilization: 0.35 });

    expect(inefficient.effectivePfDays).toBeGreaterThan(efficient.effectivePfDays);
  });
});
