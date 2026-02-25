import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const defaults = {
    modelParamsB: 7,
    trainingTokensB: 500,
    targetDays: 14,
    utilization: 0.45,
    preferredRegion: ""
};
export function WorkloadForm({ onSubmit, loading }) {
    const [values, setValues] = useState(defaults);
    const update = (key, value) => {
        const nextValue = key === "preferredRegion" ? value : Number(value);
        setValues((prev) => ({ ...prev, [key]: nextValue }));
    };
    const submit = async (event) => {
        event.preventDefault();
        await onSubmit({
            ...values,
            preferredRegion: values.preferredRegion || undefined
        });
    };
    return (_jsxs("form", { className: "card", onSubmit: submit, children: [_jsx("h2", { children: "Training workload" }), _jsxs("label", { children: ["Model parameters (B)", _jsx("input", { type: "number", step: "0.1", min: "0.1", value: values.modelParamsB, onChange: (e) => update("modelParamsB", e.target.value) })] }), _jsxs("label", { children: ["Training tokens (B)", _jsx("input", { type: "number", step: "1", min: "1", value: values.trainingTokensB, onChange: (e) => update("trainingTokensB", e.target.value) })] }), _jsxs("label", { children: ["Target duration (days)", _jsx("input", { type: "number", step: "1", min: "1", value: values.targetDays, onChange: (e) => update("targetDays", e.target.value) })] }), _jsxs("label", { children: ["Cluster utilization (0-1)", _jsx("input", { type: "number", step: "0.05", min: "0.2", max: "1", value: values.utilization, onChange: (e) => update("utilization", e.target.value) })] }), _jsxs("label", { children: ["Preferred region (optional)", _jsx("input", { type: "text", placeholder: "us-east-1", value: values.preferredRegion ?? "", onChange: (e) => update("preferredRegion", e.target.value) })] }), _jsx("button", { type: "submit", disabled: loading, children: loading ? "Estimating..." : "Run estimate" })] }));
}
