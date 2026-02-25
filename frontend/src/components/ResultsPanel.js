import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
});
export function ResultsPanel({ result }) {
    if (!result) {
        return (_jsxs("div", { className: "card", children: [_jsx("h2", { children: "Results" }), _jsx("p", { children: "Submit a workload to see capacity, hardware, and pricing estimates." })] }));
    }
    return (_jsxs("div", { className: "grid", children: [_jsxs("section", { className: "card", children: [_jsx("h2", { children: "Compute requirement" }), _jsxs("p", { children: ["Total FLOPs: ", result.estimate.totalFlops.toExponential(2)] }), _jsxs("p", { children: ["GPU-hours (A100-equivalent): ", result.estimate.gpuHoursRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })] })] }), _jsxs("section", { className: "card", children: [_jsx("h2", { children: "Recommended hardware" }), result.recommendations.map((rec) => (_jsxs("div", { children: [_jsx("strong", { children: rec.title }), _jsxs("p", { children: [rec.gpuCount, "x ", rec.gpuModel, " \u00B7 ", rec.estimatedDays.toFixed(1), " days \u00B7 ", rec.tradeoff] }), _jsx("p", { children: rec.rationale })] }, rec.profileId)))] }), _jsxs("section", { className: "card", style: { gridColumn: "1 / -1" }, children: [_jsxs("h2", { children: ["Provider comparison (", result.catalog.currency, ")"] }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Provider" }), _jsx("th", { children: "SKU" }), _jsx("th", { children: "Region" }), _jsx("th", { children: "Est. days" }), _jsx("th", { children: "Total USD" })] }) }), _jsx("tbody", { children: result.providerComparison.map((row) => (_jsxs("tr", { children: [_jsx("td", { children: row.provider }), _jsxs("td", { children: [row.gpuModel, " x", row.gpuCount] }), _jsx("td", { children: row.region }), _jsx("td", { children: row.estimatedDays.toFixed(1) }), _jsx("td", { children: currency.format(row.totalUsd) })] }, row.skuId))) })] })] })] }));
}
