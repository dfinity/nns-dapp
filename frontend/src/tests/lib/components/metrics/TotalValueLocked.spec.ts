import type { FiatCurrency } from "$lib/canisters/tvl/tvl.types";
import type { MetricsCallback } from "$lib/services/public/worker-metrics.services";
import * as workerMetricsServices from "$lib/services/public/worker-metrics.services";
import { metricsStore } from "$lib/stores/metrics.store";
import TotalValueLockedTest from "$tests/lib/components/metrics/TotalValueLockedTest.svelte";
import { nonNullish } from "@dfinity/utils";
import { render, waitFor } from "@testing-library/svelte";

let metricsCallback: MetricsCallback | undefined;

describe("TotalValueLocked", () => {
  beforeEach(() => {
    metricsCallback = undefined;
    metricsStore.set(undefined);

    vi.spyOn(workerMetricsServices, "initMetricsWorker").mockImplementation(
      async () => ({
        startMetricsTimer: ({ callback }: { callback: MetricsCallback }) => {
          metricsCallback = callback;
        },
        stopMetricsTimer: () => {
          // Do nothing
        },
      })
    );
  });

  const tvl = {
    tvl: 442469700n,
    time_sec: 123n,
  };

  const testRenderTVL = async ({
    currency,
    symbol,
  }: {
    currency?: FiatCurrency;
    symbol: string;
  }) => {
    expect(metricsCallback).toBeUndefined();

    const { getByTestId } = render(TotalValueLockedTest);

    // Wait for initialization of the callback
    await waitFor(() => expect(metricsCallback).not.toBeUndefined());

    metricsCallback?.({
      metrics: {
        tvl: {
          ...tvl,
          ...(nonNullish(currency) && { currency }),
        },
      },
    });

    await waitFor(() =>
      expect(getByTestId("tvl-metric")?.textContent).toEqual(
        `${symbol}442’469’700`
      )
    );
  };

  it("should render TVL", async () => {
    await testRenderTVL({ symbol: "$" });
  });

  it("should render TVL for CNY", async () => {
    await testRenderTVL({ symbol: "CN¥", currency: { CNY: null } });
  });

  it("should render TVL for GBP", async () => {
    await testRenderTVL({ symbol: "£", currency: { GBP: null } });
  });

  it("should render TVL for EUR", async () => {
    await testRenderTVL({ symbol: "€", currency: { EUR: null } });
  });

  it("should render TVL for JPY", async () => {
    await testRenderTVL({ symbol: "¥", currency: { JPY: null } });
  });

  it("should not render TVL on load", () => {
    const { getByTestId } = render(TotalValueLockedTest);

    expect(
      getByTestId("total-value-locked-component").classList.contains("visible")
    ).toBeFalsy();
  });

  it("should not render TVL if response has zero metrics", async () => {
    expect(metricsCallback).toBeUndefined();

    const { getByTestId } = render(TotalValueLockedTest);

    // Wait for initialization of the callback
    await waitFor(() => expect(metricsCallback).not.toBeUndefined());

    metricsCallback?.({
      metrics: {
        tvl,
      },
    });

    expect(
      getByTestId("total-value-locked-component").classList.contains("visible")
    ).toBeFalsy();
  });
});
