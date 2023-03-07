/**
 * @jest-environment jsdom
 */

import type { MetricsCallback } from "$lib/services/$public/worker-metrics.services";
import { metricsStore } from "$lib/stores/metrics.store";
import type { DashboardMessageExecutionRateResponse } from "$lib/types/dashboard";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import en from "$tests/mocks/i18n.mock";
import WarningsTest from "./WarningsTest.svelte";

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

describe("Warnings", () => {
  describe("TransactionRateWarning", () => {
    beforeEach(() => metricsStore.set(undefined));

    afterAll(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    const transactionRateHighLoad: DashboardMessageExecutionRateResponse = {
      message_execution_rate: [[1234, 300]],
    };

    const transactionRateNormalLoad: DashboardMessageExecutionRateResponse = {
      message_execution_rate: [[1234, 20]],
    };

    it("should render transaction warning", async () => {
      const { container } = render(WarningsTest);

      // Wait for initialization of the callback
      await waitFor(() => expect(metricsCallback).not.toBeUndefined());

      metricsCallback?.({
        metrics: {
          transactionRate: transactionRateHighLoad,
        },
      });

      await waitFor(() => {
        const toast = container.querySelector(".toast");

        expect(toast?.textContent ?? "").toContain(en.metrics.nns_high_load);
        expect(toast?.textContent ?? "").toContain(en.metrics.thanks_fun);
      });
    });

    it("should render no transaction warning", async () => {
      const { container } = render(WarningsTest);

      // Close toast if one remains open
      const tmp = container.querySelector(".toast .close");
      tmp && fireEvent.click(tmp);

      metricsCallback?.({
        metrics: {
          transactionRate: transactionRateNormalLoad,
        },
      });

      await waitFor(() => {
        expect(container.querySelector(".toast")).toBeNull();
      });
    });

    it("should render transaction warning once", async () => {
      const { container } = render(WarningsTest);

      metricsCallback?.({
        metrics: {
          transactionRate: transactionRateHighLoad,
        },
      });

      await waitFor(() => {
        const toast = container.querySelector(".toast");

        expect(toast?.textContent ?? "").toContain(en.metrics.nns_high_load);
        expect(toast?.textContent ?? "").toContain(en.metrics.thanks_fun);
      });

      metricsCallback?.({
        metrics: {
          transactionRate: transactionRateHighLoad,
        },
      });

      await tick();

      expect(container.querySelectorAll(".toast").length).toEqual(1);
    });
  });
});
