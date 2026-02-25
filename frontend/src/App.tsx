import { useState } from "react";
import { AssumptionsSummary } from "./components/AssumptionsSummary";
import { ResultsPanel } from "./components/ResultsPanel";
import { WorkloadForm } from "./components/WorkloadForm";
import type { EstimateScenarioResponse, TrainingWorkloadInput } from "../../shared/types";

const API_BASE = "";

const App = () => {
  const [result, setResult] = useState<EstimateScenarioResponse | null>(null);
  const [previousResult, setPreviousResult] = useState<EstimateScenarioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runEstimate = async (payload: TrainingWorkloadInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/estimate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Estimate request failed (${response.status})`);
      }

      const data = (await response.json()) as EstimateScenarioResponse;
      setPreviousResult(result);
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected API error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>LLM Compute Planner</h1>
      <p>Estimate training capacity, hardware choices, and provider cost in one pass.</p>

      <div className="grid">
        <WorkloadForm onSubmit={runEstimate} loading={loading} />
        <div>
          {error && (
            <div className="card">
              <strong>Request failed:</strong> {error}
            </div>
          )}
          <AssumptionsSummary result={result} previousResult={previousResult} />
        </div>
      </div>

      <ResultsPanel result={result} />
    </div>
  );
};

export default App;
