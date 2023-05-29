/**
 * @jest-environment jsdom
 */

import Warnings from "$lib/components/warnings/Warnings.svelte";
import type { MetricsCallback } from "$lib/services/$public/worker-metrics.services";
import { authStore } from "$lib/stores/auth.store";
import { bitcoinConvertBlockIndexes } from "$lib/stores/bitcoin.store";
import { layoutWarningToastId } from "$lib/stores/layout.store";
import { metricsStore } from "$lib/stores/metrics.store";
import type { DashboardMessageExecutionRateResponse } from "$lib/types/dashboard";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { toastsStore } from "@dfinity/gix-components";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor, type RenderResult } from "@testing-library/svelte";
import { SvelteComponent, tick } from "svelte";
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

jest.mock("$lib/constants/environment.constants.ts", () => ({
  ...jest.requireActual("$lib/constants/environment.constants.ts"),
  IS_RC_MAINNET: true,
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

  describe("ConvertCkBTCToBtcWarning", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();

      layoutWarningToastId.set(undefined);
      metricsStore.set(undefined);
      toastsStore.reset();

      bitcoinConvertBlockIndexes.reset();
    });

    describe("signed in", () => {
      beforeEach(() =>
        jest
          .spyOn(authStore, "subscribe")
          .mockImplementation(mockAuthStoreSubscribe)
      );

      it("should render ckBTC to BTC warning", async () => {
        bitcoinConvertBlockIndexes.addBlockIndex(1n);

        const { container } = render(Warnings, {
          props: {
            ckBTCWarnings: true,
          },
        });

        await waitFor(() => {
          const toast = container.querySelector(".toast");

          expect(toast?.textContent ?? "").toContain(
            en.ckbtc.warning_transaction_failed
          );
          expect(toast?.textContent ?? "").toContain(
            en.ckbtc.warning_transaction_description
          );
        });
      });

      it("should render no ckBTC warning if no warning", async () => {
        const { container } = render(Warnings, {
          props: {
            ckBTCWarnings: true,
          },
        });

        await waitFor(() => {
          expect(container.querySelector(".toast")).toBeNull();
        });
      });

      it("should render no ckBTC warning if disabled", async () => {
        bitcoinConvertBlockIndexes.addBlockIndex(1n);

        const { container } = render(Warnings);

        await waitFor(() => {
          expect(container.querySelector(".toast")).toBeNull();
        });
      });
    });

    describe("not signed in", () => {
      it("should render no ckBTC warning", async () => {
        bitcoinConvertBlockIndexes.addBlockIndex(1n);

        const { container } = render(Warnings, {
          props: {
            ckBTCWarnings: true,
          },
        });

        await waitFor(() => {
          expect(container.querySelector(".toast")).toBeNull();
        });
      });
    });
  });

  describe("TestEnvironmentWarning", () => {
    describe("not signed in", () => {
      it("should not render test environment warning", async () => {
        const { getByTestId } = render(Warnings, {
          props: {
            testEnvironmentWarning: true,
          },
        });

        await waitFor(expect(() => getByTestId("test-env-warning")).toThrow);
      });
    });

    describe("signed in", () => {
      beforeAll(() =>
        jest
          .spyOn(authStore, "subscribe")
          .mockImplementation(mockAuthStoreSubscribe)
      );

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
