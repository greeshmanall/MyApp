import type { EstimateScenarioResponse } from "../../../shared/types";

interface AssumptionsSummaryProps {
  result: EstimateScenarioResponse | null;
  previousResult: EstimateScenarioResponse | null;
}

function deltaText(current: number, previous: number): string {
  const delta = current - previous;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}`;
}

export function AssumptionsSummary({ result, previousResult }: AssumptionsSummaryProps) {
  if (!result) {
    return null;
  }

  const topProvider = result.providerComparison[0];
  const prevTopProvider = previousResult?.providerComparison[0];

  return (
    <section className="card">
      <h2>Assumptions summary</h2>
      <p>
        Model: {result.assumptions.modelParamsB}B params · Tokens: {result.assumptions.trainingTokensB}B ·
        Utilization: {(result.assumptions.utilization * 100).toFixed(0)}%
      </p>
      <p>Catalog: {result.catalog.catalogVersion} (refreshed {new Date(result.catalog.refreshedAt).toLocaleDateString()})</p>
      <p>
        Lowest estimated cost provider: {topProvider.provider} at {topProvider.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD.
      </p>

      {previousResult && prevTopProvider && (
        <p>
          Since last run: top option cost delta {deltaText(topProvider.totalUsd, prevTopProvider.totalUsd)} USD.
        </p>
      )}
    </section>
  );
}
