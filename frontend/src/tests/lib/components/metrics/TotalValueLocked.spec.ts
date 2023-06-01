/**
 * @jest-environment jsdom
 */

import TotalValueLocked from "$lib/components/metrics/TotalValueLocked.svelte";
import type { MetricsCallback } from "$lib/services/$public/worker-metrics.services";
import { metricsStore } from "$lib/stores/metrics.store";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import TotalValueLockedTest from "./TotalValueLockedTest.svelte";

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
  beforeEach(() => metricsStore.set(undefined));

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  const tvl = {
    tvl: 442469700n,
    time_sec: 123n,
  };

  it("should render TVL", async () => {
    const { getByTestId } = render(TotalValueLockedTest);

    // Wait for initialization of the callback
    await waitFor(() => expect(metricsCallback).not.toBeUndefined());

    metricsCallback?.({
      metrics: {
        tvl,
      },
    });

    await waitFor(() =>
      expect(getByTestId("tvl-metric")?.textContent).toEqual("$442’469’700")
    );
  });

  it("should not render TVL on load", () => {
    const { getByTestId } = render(TotalValueLocked);
    expect(() => getByTestId("tvl-metric")).toThrow();
  });

  it("should not render TVL if response has zero metrics", async () => {
    const { getByTestId } = render(TotalValueLocked);

    await tick();

    metricsCallback?.({
      metrics: {
        tvl,
      },
    });

    await waitFor(() => expect(() => getByTestId("tvl-metric")).toThrow());
  });
});
