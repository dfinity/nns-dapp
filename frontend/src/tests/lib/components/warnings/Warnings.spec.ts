import Warnings from "$lib/components/warnings/Warnings.svelte";
import type { MetricsCallback } from "$lib/services/public/worker-metrics.services";
import { metricsStore } from "$lib/stores/metrics.store";
import type { DashboardMessageExecutionRateResponse } from "$lib/types/dashboard";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { toastsStore } from "@dfinity/gix-components";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor, type RenderResult } from "@testing-library/svelte";
import { SvelteComponent, tick } from "svelte";
import WarningsTest from "./WarningsTest.svelte";

let metricsCallback: MetricsCallback | undefined;

vi.mock("$lib/services/public/worker-metrics.services", () => ({
  initMetricsWorker: vi.fn(() =>
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

vi.mock("$lib/constants/environment.constants.ts", async () => {
  return {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    ...(await vi.importActual<any>("$lib/constants/environment.constants.ts")),
    IS_TEST_MAINNET: true,
  };
});

describe("Warnings", () => {
  beforeEach(() => {
    metricsCallback = undefined;
  });

  describe("TransactionRateWarning", () => {
    beforeEach(() => {
      metricsStore.set(undefined);
      toastsStore.reset();
    });

    afterAll(() => {
      vi.clearAllMocks();
      vi.resetAllMocks();
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

      // Wait for initialization of the callback
      await waitFor(() => expect(metricsCallback).not.toBeUndefined());

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

      metricsCallback?.({
        metrics: {
          transactionRate: transactionRateHighLoad,
        },
      });

      await tick();

      expect(container.querySelectorAll(".toast").length).toEqual(1);
    });
  });

  describe("TestEnvironmentWarning", () => {
    describe("not signed in", () => {
      beforeEach(() => {
        setNoIdentity();
      });

      it("should not render test environment warning", async () => {
        const { getByTestId } = render(Warnings, {
          props: {
            testEnvironmentWarning: true,
          },
        });

        await waitFor(() =>
          expect(() => getByTestId("test-env-warning")).toThrow()
        );
      });
    });

    describe("signed in", () => {
      beforeEach(() => {
        resetIdentity();
      });

      it("should render test environment warning", async () => {
        const { getByTestId } = render(Warnings, {
          props: {
            testEnvironmentWarning: true,
          },
        });

        await waitFor(() =>
          expect(getByTestId("test-env-warning")).not.toBeNull()
        );
      });

      const waitAndClose = async ({
        getByTestId,
      }: RenderResult<SvelteComponent>) => {
        await waitFor(() =>
          expect(getByTestId("test-env-warning-ack")).not.toBeNull()
        );

        const button = getByTestId("test-env-warning-ack");
        fireEvent.click(button);

        await waitFor(
          () => expect(() => getByTestId("test-env-warning")).toThrow
        );
      };

      it("should close test environment warning", async () => {
        const result = render(Warnings, {
          props: {
            testEnvironmentWarning: true,
          },
        });

        await waitAndClose(result);
      });

      it("should not reopen environment warning", async () => {
        const result = render(Warnings, {
          props: {
            testEnvironmentWarning: true,
          },
        });

        await waitAndClose(result);

        const { rerender, getByTestId } = result;

        rerender(Warnings);

        await waitFor(
          () => expect(() => getByTestId("test-env-warning")).toThrow
        );
      });
    });
  });
});
