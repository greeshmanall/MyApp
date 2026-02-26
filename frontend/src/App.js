import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { AssumptionsSummary } from "./components/AssumptionsSummary";
import { ResultsPanel } from "./components/ResultsPanel";
import { WorkloadForm } from "./components/WorkloadForm";
const API_BASE = "";
const App = () => {
    const [result, setResult] = useState(null);
    const [previousResult, setPreviousResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const runEstimate = async (payload) => {
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
            const data = (await response.json());
            setPreviousResult(result);
            setResult(data);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Unexpected API error";
            setError(message);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "container", children: [_jsx("h1", { children: "Training Compute Planner" }), _jsx("p", { children: "Estimate training capacity, hardware choices, and provider cost in one pass." }), _jsxs("div", { className: "grid", children: [_jsx(WorkloadForm, { onSubmit: runEstimate, loading: loading }), _jsxs("div", { children: [error && (_jsxs("div", { className: "card", children: [_jsx("strong", { children: "Request failed:" }), " ", error] })), _jsx(AssumptionsSummary, { result: result, previousResult: previousResult })] })] }), _jsx(ResultsPanel, { result: result })] }));
};
export default App;
