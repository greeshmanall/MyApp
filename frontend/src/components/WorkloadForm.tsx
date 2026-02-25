import { useState, type FormEvent } from "react";
import type { TrainingWorkloadInput } from "../../../shared/types";

interface WorkloadFormProps {
  onSubmit: (values: TrainingWorkloadInput) => Promise<void>;
  loading: boolean;
}

const defaults: TrainingWorkloadInput = {
  modelParamsB: 7,
  trainingTokensB: 500,
  targetDays: 14,
  utilization: 0.45,
  preferredRegion: ""
};

export function WorkloadForm({ onSubmit, loading }: WorkloadFormProps) {
  const [values, setValues] = useState<TrainingWorkloadInput>(defaults);

  const update = (key: keyof TrainingWorkloadInput, value: string) => {
    const nextValue = key === "preferredRegion" ? value : Number(value);
    setValues((prev) => ({ ...prev, [key]: nextValue }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      ...values,
      preferredRegion: values.preferredRegion || undefined
    });
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Training workload</h2>

      <label>
        Model parameters (B)
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={values.modelParamsB}
          onChange={(e) => update("modelParamsB", e.target.value)}
        />
      </label>

      <label>
        Training tokens (B)
        <input
          type="number"
          step="1"
          min="1"
          value={values.trainingTokensB}
          onChange={(e) => update("trainingTokensB", e.target.value)}
        />
      </label>

      <label>
        Target duration (days)
        <input
          type="number"
          step="1"
          min="1"
          value={values.targetDays}
          onChange={(e) => update("targetDays", e.target.value)}
        />
      </label>

      <label>
        Cluster utilization (0-1)
        <input
          type="number"
          step="0.05"
          min="0.2"
          max="1"
          value={values.utilization}
          onChange={(e) => update("utilization", e.target.value)}
        />
      </label>

      <label>
        Preferred region (optional)
        <input
          type="text"
          placeholder="us-east-1"
          value={values.preferredRegion ?? ""}
          onChange={(e) => update("preferredRegion", e.target.value)}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Estimating..." : "Run estimate"}
      </button>
    </form>
  );
}
