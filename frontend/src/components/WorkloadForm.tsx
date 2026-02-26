import { useState, type FormEvent } from "react";
import type { TrainingWorkloadInput } from "../../../shared/types";

interface WorkloadFormProps {
  onSubmit: (values: TrainingWorkloadInput) => Promise<void>;
  loading: boolean;
}

type NumericWorkloadKey = Exclude<keyof TrainingWorkloadInput, "preferredRegion">;
type SliderScale = "linear" | "log10";

interface NumericFieldConfig {
  key: NumericWorkloadKey;
  label: string;
  min: number;
  max: number;
  step: number;
  sliderStep?: number;
  scale?: SliderScale;
  format: (value: number) => string;
}

const defaults: TrainingWorkloadInput = {
  modelParamsB: 7,
  trainingTokensB: 500,
  targetDays: 14,
  utilization: 0.45,
  preferredRegion: ""
};

const NUMBER_FIELD_CONFIG: NumericFieldConfig[] = [
  {
    key: "modelParamsB",
    label: "Model parameters (B)",
    min: 0.1,
    max: 1000,
    step: 0.1,
    sliderStep: 0.01,
    scale: "log10",
    format: (value) => `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}B params`
  },
  {
    key: "trainingTokensB",
    label: "Training tokens (B)",
    min: 1,
    max: 100000,
    step: 1,
    sliderStep: 0.01,
    scale: "log10",
    format: (value) => `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}B tokens`
  },
  {
    key: "targetDays",
    label: "Target duration (days)",
    min: 1,
    max: 180,
    step: 1,
    format: (value) => `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} days`
  },
  {
    key: "utilization",
    label: "Cluster utilization (0-1)",
    min: 0.2,
    max: 1,
    step: 0.01,
    sliderStep: 0.01,
    format: (value) => `${(value * 100).toFixed(0)}% utilization`
  }
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function stepPrecision(step: number): number {
  const [, decimals = ""] = step.toString().split(".");
  return decimals.length;
}

function roundToStep(value: number, step: number): number {
  const precision = stepPrecision(step);
  return Number((Math.round(value / step) * step).toFixed(precision));
}

function normalizeNumericValue(value: number, config: NumericFieldConfig): number {
  return clamp(roundToStep(value, config.step), config.min, config.max);
}

function toSliderValue(value: number, config: NumericFieldConfig): number {
  const clampedValue = clamp(value, config.min, config.max);
  return config.scale === "log10" ? Math.log10(clampedValue) : clampedValue;
}

function fromSliderValue(value: number, config: NumericFieldConfig): number {
  return config.scale === "log10" ? 10 ** value : value;
}

interface NumericSliderFieldProps {
  config: NumericFieldConfig;
  value: number;
  onChange: (value: number) => void;
}

function NumericSliderField({ config, value, onChange }: NumericSliderFieldProps) {
  const sliderMin = config.scale === "log10" ? Math.log10(config.min) : config.min;
  const sliderMax = config.scale === "log10" ? Math.log10(config.max) : config.max;
  const sliderStep = config.sliderStep ?? config.step;
  const sliderValue = toSliderValue(value, config);

  return (
    <div className="slider-field">
      <label htmlFor={`${config.key}-number`}>{config.label}</label>
      <div className="slider-field__controls">
        <input
          id={`${config.key}-slider`}
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
          value={sliderValue}
          onChange={(event) => {
            const nextSliderValue = Number(event.target.value);
            if (Number.isNaN(nextSliderValue)) {
              return;
            }

            const nextValue = normalizeNumericValue(fromSliderValue(nextSliderValue, config), config);
            onChange(nextValue);
          }}
        />
        <input
          id={`${config.key}-number`}
          className="slider-field__number"
          type="number"
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={(event) => {
            const nextValue = event.target.valueAsNumber;
            if (Number.isNaN(nextValue)) {
              return;
            }

            onChange(normalizeNumericValue(nextValue, config));
          }}
        />
      </div>
      <p className="slider-field__value">{config.format(value)}</p>
    </div>
  );
}

export function WorkloadForm({ onSubmit, loading }: WorkloadFormProps) {
  const [values, setValues] = useState<TrainingWorkloadInput>(defaults);

  const updateNumeric = (key: NumericWorkloadKey, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const updatePreferredRegion = (value: string) => {
    setValues((prev) => ({ ...prev, preferredRegion: value }));
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

      {NUMBER_FIELD_CONFIG.map((config) => (
        <NumericSliderField
          key={config.key}
          config={config}
          value={values[config.key]}
          onChange={(nextValue) => updateNumeric(config.key, nextValue)}
        />
      ))}

      <label>
        Preferred region (optional)
        <input
          type="text"
          placeholder="us-east-1"
          value={values.preferredRegion ?? ""}
          onChange={(event) => updatePreferredRegion(event.target.value)}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Estimating..." : "Run estimate"}
      </button>
    </form>
  );
}
