import { useEffect, useState } from "react";
import { AssumptionsSummary } from "./components/AssumptionsSummary";
import { PricingPage } from "./components/PricingPage";
import { ResultsPanel } from "./components/ResultsPanel";
import { WorkloadForm } from "./components/WorkloadForm";
import type { EstimateScenarioResponse, TrainingWorkloadInput } from "../../shared/types";

const API_BASE = "";
type AppView = "estimator" | "pricing";

const viewFromPath = (pathname: string): AppView => {
  return pathname === "/pricing" ? "pricing" : "estimator";
};

const App = () => {
  const [view, setView] = useState<AppView>(() => viewFromPath(window.location.pathname));
  const [result, setResult] = useState<EstimateScenarioResponse | null>(null);
  const [previousResult, setPreviousResult] = useState<EstimateScenarioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onPopState = () => {
      setView(viewFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

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

  const navigate = (nextView: AppView) => {
    const nextPath = nextView === "pricing" ? "/pricing" : "/";
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setView(nextView);
  };

  return (
    <div className="container">
      <header className="app-header">
        <div>
          <h1>Training Compute Planner</h1>
          <p>Estimate training capacity, hardware choices, and provider cost in one pass.</p>
        </div>
        <nav className="page-nav" aria-label="Primary">
          <button
            type="button"
            className={`nav-button ${view === "estimator" ? "active" : ""}`}
            onClick={() => navigate("estimator")}
          >
            Estimator
          </button>
          <button
            type="button"
            className={`nav-button ${view === "pricing" ? "active" : ""}`}
            onClick={() => navigate("pricing")}
          >
            GPU Pricing
          </button>
        </nav>
      </header>

      {view === "estimator" ? (
        <>
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
        </>
      ) : (
        <PricingPage />
      )}
    </div>
  );
};

export default App;
