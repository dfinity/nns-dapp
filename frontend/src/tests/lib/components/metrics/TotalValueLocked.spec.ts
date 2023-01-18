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
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should render TVL", async () => {
    const { getByTestId } = render(TotalValueLocked);

    // Wait for initialization of the callback
    await waitFor(() => expect(metricsCallback).not.toBeUndefined());

    const avgPrice: BinanceAvgPrice = { mins: 5, price: "5.42963025" };
    const dissolvingNeurons: DissolvingNeurons = {
      totalDissolvingNeurons: 8147494574194015,
      totalNotDissolvingNeurons: 1674035200397,
    };

    metricsCallback?.({
      metrics: {
        avgPrice,
        dissolvingNeurons,
      },
    });

    await waitFor(() =>
      expect(getByTestId("tvl-metric")?.textContent).toEqual("$442,469,723.94")
    );
  });

  it("should not render TVL on load", () => {
    const { getByTestId } = render(TotalValueLocked);
    expect(() => getByTestId("tvl-metric")).toThrow();
  });

  it("should not render TVL if response has no metrics", async () => {
    const { getByTestId } = render(TotalValueLocked);

    metricsCallback?.({});

    await waitFor(() => expect(() => getByTestId("tvl-metric")).toThrow());
  });

  it("should not render TVL if response has zero metrics", async () => {
    const { getByTestId } = render(TotalValueLocked);

    // Wait for initialization
    await waitFor(() => expect(metricsCallback).not.toBeUndefined());

    const avgPrice: BinanceAvgPrice = { mins: 5, price: "0" };
    const dissolvingNeurons: DissolvingNeurons = {
      totalDissolvingNeurons: 0,
      totalNotDissolvingNeurons: 0,
    };

    metricsCallback?.({
      metrics: {
        avgPrice,
        dissolvingNeurons,
      },
    });

    await waitFor(() => expect(() => getByTestId("tvl-metric")).toThrow());
  });
});
