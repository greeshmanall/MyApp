import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function deltaText(current, previous) {
    const delta = current - previous;
    const sign = delta > 0 ? "+" : "";
    return `${sign}${delta.toFixed(1)}`;
}
export function AssumptionsSummary({ result, previousResult }) {
    if (!result) {
        return null;
    }
    const topProvider = result.providerComparison[0];
    const prevTopProvider = previousResult?.providerComparison[0];
    return (_jsxs("section", { className: "card", children: [_jsx("h2", { children: "Assumptions summary" }), _jsxs("p", { children: ["Model: ", result.assumptions.modelParamsB, "B params \u00B7 Tokens: ", result.assumptions.trainingTokensB, "B \u00B7 Utilization: ", (result.assumptions.utilization * 100).toFixed(0), "%"] }), _jsxs("p", { children: ["Catalog: ", result.catalog.catalogVersion, " (refreshed ", new Date(result.catalog.refreshedAt).toLocaleDateString(), ")"] }), _jsxs("p", { children: ["Lowest estimated cost provider: ", topProvider.provider, " at ", topProvider.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 }), " USD."] }), previousResult && prevTopProvider && (_jsxs("p", { children: ["Since last run: top option cost delta ", deltaText(topProvider.totalUsd, prevTopProvider.totalUsd), " USD."] }))] }));
}
