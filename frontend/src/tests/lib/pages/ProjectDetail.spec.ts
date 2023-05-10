/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ledger.api";
import * as locationApi from "$lib/api/location.api";
import * as snsSaleApi from "$lib/api/sns-sale.api";
import * as snsMetricsApi from "$lib/api/sns-swap-metrics.api";
import * as snsApi from "$lib/api/sns.api";
import { AppPath } from "$lib/constants/routes.constants";
import { WATCH_SALE_STATE_EVERY_MILLISECONDS } from "$lib/constants/sns.constants";
import { pageStore } from "$lib/derived/page.derived";
import ProjectDetail from "$lib/pages/ProjectDetail.svelte";
import { cancelPollGetOpenTicket } from "$lib/services/sns-sale.services";
import { authStore } from "$lib/stores/auth.store";
import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import {
  mockAuthStoreNoIdentitySubscribe,
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import { snsResponsesForLifecycle } from "$tests/mocks/sns-response.mock";
import { snsTicketMock } from "$tests/mocks/sns.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

jest.mock("$lib/api/sns.api");
jest.mock("$lib/api/sns-swap-metrics.api");
jest.mock("$lib/api/sns-sale.api");
jest.mock("$lib/api/ledger.api");
jest.mock("$lib/api/location.api");

const blockedApiPaths = [
  "$lib/api/sns.api",
  "$lib/api/sns-swap-metrics.api",
  "$lib/api/sns-sale.api",
  "$lib/api/ledger.api",
  "$lib/api/location.api",
];

describe("ProjectDetail", () => {
  blockAllCallsTo(blockedApiPaths);
  const countryCode = "CH";
  const newBalance = BigInt(1_000_000_000);
  const saleBuyerCount = 1_000_000;
  const rawMetricsText = `
# TYPE sale_buyer_count gauge
sale_buyer_count ${saleBuyerCount} 1677707139456
# HELP sale_cf_participants_count`;

  beforeEach(() => {
    jest.clearAllMocks();
    snsQueryStore.reset();
    snsSwapCommitmentsStore.reset();
    snsSwapMetricsStore.reset();

    jest.clearAllTimers();
    const now = Date.now();
    jest.useFakeTimers().setSystemTime(now);

    jest.spyOn(ledgerApi, "sendICP").mockResolvedValue(undefined);
    jest.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(newBalance);

    jest
      .spyOn(locationApi, "queryUserCountryLocation")
      .mockResolvedValue(countryCode);

    jest.spyOn(snsApi, "querySnsDerivedState").mockResolvedValue({
      sns_tokens_per_icp: [1],
      buyer_total_icp_e8s: [BigInt(200_000_000)],
    });

    jest
      .spyOn(snsMetricsApi, "querySnsSwapMetrics")
      .mockResolvedValue(rawMetricsText);
  });

  describe("not logged in user", () => {
    beforeEach(() => {
      page.mock({ data: { universe: null } });
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreNoIdentitySubscribe);
    });

    describe("Open project", () => {
      const responses = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Open],
        certified: true,
      });
      const rootCanisterId = responses[0][0].rootCanisterId;
      const props = {
        rootCanisterId,
      };
      beforeEach(() => {
        snsQueryStore.setData(responses);
      });

      it("should start watching swap metrics and stop on unmounting", async () => {
        const { unmount } = render(ProjectDetail, props);

        await runResolvedPromises();
        let expectedCalls = 1;
        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(
          expectedCalls
        );

        const retryDelay = WATCH_SALE_STATE_EVERY_MILLISECONDS;
        const callsBeforeStopPolling = 4;

        while (expectedCalls < callsBeforeStopPolling) {
          await advanceTime(retryDelay);
          expectedCalls += 1;
          expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(
            expectedCalls
          );
        }
        unmount();

        await runResolvedPromises();
        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(
          expectedCalls
        );

        // Even after waiting a long time there shouldn't be more calls.
        await advanceTime(99 * retryDelay);
        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(
          expectedCalls
        );
      });

      it("should start watching derived state and stop on unmounting", async () => {
        const { unmount } = render(ProjectDetail, props);

        await runResolvedPromises();
        let expectedCalls = 0;
        expect(snsApi.querySnsDerivedState).toBeCalledTimes(expectedCalls);

        const retryDelay = WATCH_SALE_STATE_EVERY_MILLISECONDS;
        const callsBeforeStopPolling = 4;

        while (expectedCalls < callsBeforeStopPolling) {
          await advanceTime(retryDelay);
          expectedCalls += 1;
          expect(snsApi.querySnsDerivedState).toBeCalledTimes(expectedCalls);
        }
        unmount();

        await runResolvedPromises();
        expect(snsApi.querySnsDerivedState).toBeCalledTimes(expectedCalls);

        // Even after waiting a long time there shouldn't be more calls.
        await advanceTime(99 * retryDelay);
        expect(snsApi.querySnsDerivedState).toBeCalledTimes(expectedCalls);
      });

      it("should not load user's commitment", async () => {
        render(ProjectDetail, props);

        await waitFor(() =>
          expect(snsApi.querySnsSwapCommitment).not.toBeCalled()
        );
      });

      it("should render info section", async () => {
        const { queryByTestId } = render(ProjectDetail, props);

        expect(queryByTestId("sns-project-detail-info")).toBeInTheDocument();
      });

      it("should render status section", async () => {
        const { queryByTestId } = render(ProjectDetail, props);

        expect(queryByTestId("sns-project-detail-status")).toBeInTheDocument();
      });
    });

    describe("Committed project project", () => {
      const responses = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Committed],
        certified: true,
      });
      const rootCanisterId = responses[0][0].rootCanisterId;
      const props = {
        rootCanisterId,
      };
      beforeEach(() => {
        snsQueryStore.setData(responses);
      });

      it("should query metrics but not watch them", async () => {
        const { queryByTestId } = render(ProjectDetail, props);

        expect(queryByTestId("sns-project-detail-status")).toBeInTheDocument();

        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(1);

        const retryDelay = WATCH_SALE_STATE_EVERY_MILLISECONDS;

        // Even after waiting a long time there shouldn't be more calls.
        await advanceTime(99 * retryDelay);
        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(1);
      });

      it("should not query total commitments, nor start watching them", async () => {
        const { queryByTestId } = render(ProjectDetail, props);

        expect(queryByTestId("sns-project-detail-status")).toBeInTheDocument();
        expect(snsApi.querySnsDerivedState).not.toBeCalled();

        const retryDelay = WATCH_SALE_STATE_EVERY_MILLISECONDS;

        // Even after waiting a long time there shouldn't be more calls.
        await advanceTime(99 * retryDelay);
        expect(snsApi.querySnsDerivedState).toBeCalledTimes(0);
      });
    });
  });

  describe("logged in user", () => {
    beforeEach(() => {
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);

      jest.spyOn(snsSaleApi, "getOpenTicket").mockResolvedValue(undefined);
      jest.spyOn(snsApi, "querySnsLifecycle").mockResolvedValue({
        decentralization_sale_open_timestamp_seconds: [BigInt(11231312)],
        lifecycle: [SnsSwapLifecycle.Open],
      });

      cancelPollGetOpenTicket();
    });

    describe("Open project", () => {
      const responses = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Open],
        certified: true,
      });
      const rootCanisterId = responses[0][0].rootCanisterId;
      const props = {
        rootCanisterId,
      };
      const { ticket: testTicket } = snsTicketMock({
        rootCanisterId: Principal.fromText(rootCanisterId),
        owner: mockPrincipal,
      });
      beforeEach(() => {
        snsQueryStore.setData(responses);
        jest.spyOn(snsSaleApi, "notifyParticipation").mockResolvedValue({
          icp_accepted_participation_e8s: testTicket.amount_icp_e8s,
          icp_ledger_account_balance_e8s: testTicket.amount_icp_e8s,
        });
        jest.spyOn(ledgerApi, "sendICP").mockResolvedValue(BigInt(10));
        jest
          .spyOn(ledgerApi, "queryAccountBalance")
          .mockResolvedValue(BigInt(10_000_000));
      });

      it("should show user's commitment", async () => {
        const userCommitment = BigInt(100_000_000);
        jest.spyOn(snsApi, "querySnsSwapCommitment").mockResolvedValue({
          rootCanisterId: Principal.fromText(rootCanisterId),
          myCommitment: {
            icp: [
              {
                transfer_start_timestamp_seconds: BigInt(123444),
                amount_e8s: userCommitment,
                transfer_success_timestamp_seconds: BigInt(123445),
              },
            ],
          },
        });
        const { queryByTestId } = render(ProjectDetail, props);

        await waitFor(() =>
          expect(queryByTestId("sns-user-commitment")).toBeInTheDocument()
        );

        expect(
          queryByTestId("sns-user-commitment")?.querySelector(
            "[data-tid='token-value']"
          )?.innerHTML
        ).toMatch(formatToken({ value: userCommitment }));
      });

      // TODO: GIX-1541 use this test to show that button is disabled if user is in a country that is not allowed to participate
      it("should NOT load user's country", async () => {
        jest.spyOn(snsSaleApi, "getOpenTicket").mockResolvedValue(undefined);
        jest.spyOn(snsApi, "querySnsSwapCommitment").mockResolvedValue({
          rootCanisterId: Principal.fromText(rootCanisterId),
          myCommitment: undefined,
        } as SnsSwapCommitment);

        render(ProjectDetail, props);

        expect(locationApi.queryUserCountryLocation).not.toBeCalled();
      });

      it("should participate without user interaction if there is an open ticket.", async () => {
        const initialCommitment = { icp: [] };
        const finalCommitment = {
          icp: [
            {
              transfer_start_timestamp_seconds: BigInt(123444),
              amount_e8s: testTicket.amount_icp_e8s,
              transfer_success_timestamp_seconds: BigInt(123445),
            },
          ],
        };
        jest
          .spyOn(snsApi, "querySnsSwapCommitment")
          .mockResolvedValueOnce({
            rootCanisterId: Principal.fromText(rootCanisterId),
            myCommitment: initialCommitment,
          } as SnsSwapCommitment)
          .mockResolvedValue({
            rootCanisterId: Principal.fromText(rootCanisterId),
            myCommitment: finalCommitment,
          } as SnsSwapCommitment);
        jest.spyOn(snsSaleApi, "getOpenTicket").mockResolvedValue(testTicket);

        const { getByTestId, queryByTestId } = render(ProjectDetail, props);

        expect(queryByTestId("sns-user-commitment")).not.toBeInTheDocument();

        await waitFor(() =>
          expect(getByTestId("sale-in-progress-modal")).toBeInTheDocument()
        );

        await waitFor(() =>
          expect(queryByTestId("sns-user-commitment")).toBeInTheDocument()
        );

        expect(
          queryByTestId("sns-user-commitment")?.querySelector(
            "[data-tid='token-value']"
          )?.innerHTML
        ).toMatch(formatToken({ value: testTicket.amount_icp_e8s }));
      });
    });

    describe("Committed project", () => {
      const responses = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Committed],
        certified: true,
      });
      const rootCanisterId = responses[0][0].rootCanisterId;
      const props = {
        rootCanisterId,
      };
      const userCommitment = BigInt(100_000_000);
      beforeEach(() => {
        snsQueryStore.setData(responses);
        jest.spyOn(snsApi, "querySnsSwapCommitment").mockResolvedValue({
          rootCanisterId: Principal.fromText(rootCanisterId),
          myCommitment: {
            icp: [
              {
                transfer_start_timestamp_seconds: BigInt(123444),
                amount_e8s: userCommitment,
                transfer_success_timestamp_seconds: BigInt(123445),
              },
            ],
          },
        });
      });

      it("should query metrics but not watch them", async () => {
        const { queryByTestId } = render(ProjectDetail, props);

        expect(queryByTestId("sns-project-detail-status")).toBeInTheDocument();

        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(1);

        const retryDelay = WATCH_SALE_STATE_EVERY_MILLISECONDS;

        // Even after waiting a long time there shouldn't be more calls.
        await advanceTime(99 * retryDelay);
        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(1);
      });

      it("should not query total commitments, nor start watching them", async () => {
        const { queryByTestId } = render(ProjectDetail, props);

        expect(queryByTestId("sns-project-detail-status")).toBeInTheDocument();
        expect(snsApi.querySnsDerivedState).not.toBeCalled();

        const retryDelay = WATCH_SALE_STATE_EVERY_MILLISECONDS;

        // Even after waiting a long time there shouldn't be more calls.
        await advanceTime(99 * retryDelay);
        expect(snsApi.querySnsDerivedState).toBeCalledTimes(0);
      });

      it("should load user's commitment", async () => {
        const { queryByTestId } = render(ProjectDetail, props);

        await waitFor(() =>
          expect(queryByTestId("sns-user-commitment")).toBeInTheDocument()
        );

        expect(
          queryByTestId("sns-user-commitment")?.querySelector(
            "[data-tid='token-value']"
          )?.innerHTML
        ).toMatch(formatToken({ value: userCommitment }));
      });
    });
  });

  describe("invalid root canister id", () => {
    const responses = snsResponsesForLifecycle({
      lifecycles: [SnsSwapLifecycle.Open],
      certified: true,
    });
    beforeEach(() => {
      snsQueryStore.setData(responses);
      page.mock({ data: { universe: null } });
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreNoIdentitySubscribe);
    });

    it("should redirect to launchpad", async () => {
      render(ProjectDetail, {
        props: {
          rootCanisterId: "invalid-project",
        },
      });

      await waitFor(() => {
        const { path } = get(pageStore);
        return expect(path).toEqual(AppPath.Launchpad);
      });
    });
  });

  describe("not found canister id", () => {
    const responses = snsResponsesForLifecycle({
      lifecycles: [SnsSwapLifecycle.Open],
      certified: true,
    });
    beforeEach(() => {
      snsQueryStore.setData(responses);
      page.mock({ data: { universe: null } });
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreNoIdentitySubscribe);
    });

    it("should redirect to launchpad", async () => {
      render(ProjectDetail, {
        props: {
          rootCanisterId: "aaaaa-aa",
        },
      });

      await waitFor(() => {
        const { path } = get(pageStore);
        return expect(path).toEqual(AppPath.Launchpad);
      });
    });
  });
});
