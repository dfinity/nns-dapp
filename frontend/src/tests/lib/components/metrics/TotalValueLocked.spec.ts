/**
 * @jest-environment jsdom
 */

import TotalValueLocked from "$lib/components/metrics/TotalValueLocked.svelte";
import type { MetricsCallback } from "$lib/services/$public/worker-metrics.services";
import type { BinanceAvgPrice } from "$lib/types/binance";
import type { DissolvingNeurons } from "$lib/types/governance-metrics";
import { render, waitFor } from "@testing-library/svelte";

let metricsCallback: MetricsCallback | undefined;

jest.mock("$lib/services/$public/worker-metrics.services", () => ({
  initMetricsWorker: jest.fn(() =>
    Promise.resolve({
      startMetricsTimer: ({ callback }: { callback: MetricsCallback }) => {
        metricsCallback = callback;
      },
      stopMetricsTimer: () => {
        // Do nothing
      },
    })
  ),
}));

describe("TotalValueLocked", () => {
  afterAll(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  const avgPrice: BinanceAvgPrice = { mins: 5, price: "5.42963025" };
  const dissolvingNeurons: DissolvingNeurons = {
    totalDissolvingNeurons: 8147494574194015,
    totalNotDissolvingNeurons: 1674035200397,
  };

  it("should render TVL", async () => {
    const { getByTestId } = render(TotalValueLocked);

    metricsCallback?.({
      metrics: {
        avgPrice,
        dissolvingNeurons,
      },
    });

    await waitFor(() =>
      expect(getByTestId("tvl-metrics")?.textContent).toEqual(
        "TVL in USD: $442,469,723.94"
      )
    );
  });
});
