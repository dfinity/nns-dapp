/**
 * @jest-environment jsdom
 */

import type { MetricsCallback } from "$lib/services/$public/worker-metrics.services";
import { metricsStore } from "$lib/stores/metrics.store";
import { render, waitFor } from "@testing-library/svelte";
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
    const { getByTestId } = render(TotalValueLockedTest);

    expect(getByTestId("total-value-locked-component")).not.toBeVisible();
  });

  it("should not render TVL if response has zero metrics", async () => {
    const { getByTestId } = render(TotalValueLockedTest);

    // Wait for initialization of the callback
    await waitFor(() => expect(metricsCallback).not.toBeUndefined());

    metricsCallback?.({
      metrics: {
        tvl,
      },
    });

    expect(getByTestId("total-value-locked-component")).not.toBeVisible();
  });
});
