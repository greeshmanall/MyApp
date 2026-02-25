import type { TrainingWorkloadInput } from "../../../shared/types";

export const SCENARIOS: Record<string, TrainingWorkloadInput> = {
  small: {
    modelParamsB: 7,
    trainingTokensB: 300,
    targetDays: 10,
    utilization: 0.5
  },
  medium: {
    modelParamsB: 30,
    trainingTokensB: 1200,
    targetDays: 21,
    utilization: 0.45
  },
  frontierish: {
    modelParamsB: 180,
    trainingTokensB: 20000,
    targetDays: 60,
    utilization: 0.4
  }
};
