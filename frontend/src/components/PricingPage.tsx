import { useEffect, useMemo, useState } from "react";
import type { PricingCatalogResponse } from "../../../shared/types";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

interface PricingLoadState {
  data: PricingCatalogResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: PricingLoadState = {
  data: null,
  loading: true,
  error: null
};

export function PricingPage() {
  const [state, setState] = useState<PricingLoadState>(initialState);

  useEffect(() => {
    const abortController = new AbortController();

    const loadPricingCatalog = async () => {
      try {
        const response = await fetch("/api/catalog", {
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(`Pricing catalog request failed (${response.status})`);
        }

        const data = (await response.json()) as PricingCatalogResponse;
        setState({
          data,
          loading: false,
          error: null
        });
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Unexpected catalog API error"
        });
      }
    };

    void loadPricingCatalog();

    return () => {
      abortController.abort();
    };
  }, []);

  const sortedSkus = useMemo(() => {
    if (!state.data) {
      return [];
    }

    return [...state.data.skus].sort((a, b) => {
      const modelSort = a.gpuModel.localeCompare(b.gpuModel);
      if (modelSort !== 0) {
        return modelSort;
      }

      const providerSort = a.provider.localeCompare(b.provider);
      if (providerSort !== 0) {
        return providerSort;
      }

      return a.hourlyUsd - b.hourlyUsd;
    });
  }, [state.data]);

  return (
    <section className="card pricing-card">
      <h2>GPU pricing catalog</h2>
      <p>All catalog entries with per-node and per-GPU pricing details.</p>

      {state.loading && <p>Loading pricing catalog...</p>}

      {state.error && (
        <div className="card">
          <strong>Request failed:</strong> {state.error}
        </div>
      )}

      {state.data && (
        <>
          <p>
            Catalog: {state.data.meta.catalogVersion} · Currency: {state.data.meta.currency} · Refreshed:{" "}
            {new Date(state.data.meta.refreshedAt).toLocaleDateString()}
          </p>
          <ul className="source-notes">
            {state.data.meta.sourceNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>GPU model</th>
                  <th>Provider</th>
                  <th>Display name</th>
                  <th>Region</th>
                  <th>GPU count</th>
                  <th>Hourly / node</th>
                  <th>Hourly / GPU</th>
                  <th>FP16 TFLOPS / GPU</th>
                  <th>SKU ID</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {sortedSkus.map((sku) => (
                  <tr key={sku.id}>
                    <td>{sku.gpuModel}</td>
                    <td>{sku.provider}</td>
                    <td>{sku.displayName}</td>
                    <td>{sku.region}</td>
                    <td>{sku.gpuCount}</td>
                    <td>{usd.format(sku.hourlyUsd)}</td>
                    <td>{usd.format(sku.hourlyUsd / sku.gpuCount)}</td>
                    <td>{sku.fp16TflopsPerGpu.toLocaleString()}</td>
                    <td>{sku.id}</td>
                    <td>{sku.notes ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
