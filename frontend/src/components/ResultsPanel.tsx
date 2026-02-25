import type { EstimateScenarioResponse } from "../../../shared/types";

interface ResultsPanelProps {
  result: EstimateScenarioResponse | null;
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export function ResultsPanel({ result }: ResultsPanelProps) {
  if (!result) {
    return (
      <div className="card">
        <h2>Results</h2>
        <p>Submit a workload to see capacity, hardware, and pricing estimates.</p>
      </div>
    );
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Compute requirement</h2>
        <p>Total FLOPs: {result.estimate.totalFlops.toExponential(2)}</p>
        <p>GPU-hours (A100-equivalent): {result.estimate.gpuHoursRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
      </section>

      <section className="card">
        <h2>Recommended hardware</h2>
        {result.recommendations.map((rec) => (
          <div key={rec.profileId}>
            <strong>{rec.title}</strong>
            <p>
              {rec.gpuCount}x {rec.gpuModel} · {rec.estimatedDays.toFixed(1)} days · {rec.tradeoff}
            </p>
            <p>{rec.rationale}</p>
          </div>
        ))}
      </section>

      <section className="card" style={{ gridColumn: "1 / -1" }}>
        <h2>Provider comparison ({result.catalog.currency})</h2>
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>SKU</th>
              <th>Region</th>
              <th>Est. days</th>
              <th>Total USD</th>
            </tr>
          </thead>
          <tbody>
            {result.providerComparison.map((row) => (
              <tr key={row.skuId}>
                <td>{row.provider}</td>
                <td>{row.gpuModel} x{row.gpuCount}</td>
                <td>{row.region}</td>
                <td>{row.estimatedDays.toFixed(1)}</td>
                <td>{currency.format(row.totalUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
