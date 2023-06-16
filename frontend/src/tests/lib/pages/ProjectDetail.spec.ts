/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import * as snsSaleApi from "$lib/api/sns-sale.api";
import * as snsMetricsApi from "$lib/api/sns-swap-metrics.api";
import * as snsApi from "$lib/api/sns.api";
import { AppPath } from "$lib/constants/routes.constants";
import { WATCH_SALE_STATE_EVERY_MILLISECONDS } from "$lib/constants/sns.constants";
import { NOT_LOADED } from "$lib/constants/stores.constants";
import { pageStore } from "$lib/derived/page.derived";
import ProjectDetail from "$lib/pages/ProjectDetail.svelte";
import { cancelPollGetOpenTicket } from "$lib/services/sns-sale.services";
import { accountsStore } from "$lib/stores/accounts.store";
import { authStore } from "$lib/stores/auth.store";
import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { userCountryStore } from "$lib/stores/user-country.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { formatToken, numberToE8s } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import * as fakeLocationApi from "$tests/fakes/location-api.fake";
import {
  mockAccountDetails,
  mockMainAccount,
} from "$tests/mocks/accounts.store.mock";
import {
  mockAuthStoreNoIdentitySubscribe,
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import {
  snsResponseFor,
  snsResponsesForLifecycle,
} from "$tests/mocks/sns-response.mock";
import { snsTicketMock } from "$tests/mocks/sns.mock";
import { ProjectDetailPo } from "$tests/page-objects/ProjectDetail.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

jest.mock("$lib/api/nns-dapp.api");
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
  fakeLocationApi.install();

  const userCountryCode = "CH";
  const notUserCountryCode = "US";
  const newBalance = BigInt(10_000_000_000);
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
    userCountryStore.set(NOT_LOADED);

    jest.clearAllTimers();
    const now = Date.now();
    jest.useFakeTimers().setSystemTime(now);

    jest.spyOn(ledgerApi, "sendICP").mockResolvedValue(undefined);

    jest
      .spyOn(nnsDappApi, "queryAccount")
      .mockResolvedValue(mockAccountDetails);
    jest.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(newBalance);

    fakeLocationApi.setCountryCode(userCountryCode);

    jest.spyOn(snsApi, "querySnsDerivedState").mockResolvedValue({
      sns_tokens_per_icp: [1],
      buyer_total_icp_e8s: [BigInt(200_000_000)],
      cf_participant_count: [],
      direct_participant_count: [],
      cf_neuron_count: [],
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
          .mockResolvedValue(BigInt(1_000_000_000));
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
                transfer_fee_paid_e8s: [],
                amount_transferred_e8s: [],
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

      describe("no open ticket and no commitment", () => {
        beforeEach(() => {
          jest.spyOn(snsSaleApi, "getOpenTicket").mockResolvedValue(undefined);
          jest.spyOn(snsApi, "querySnsSwapCommitment").mockResolvedValue({
            rootCanisterId: Principal.fromText(rootCanisterId),
            myCommitment: undefined,
          } as SnsSwapCommitment);
        });

        const renderProjectDetail = async (): Promise<ProjectDetailPo> => {
          const { container } = render(ProjectDetail, props);

          await runResolvedPromises();

          return ProjectDetailPo.under(new JestPageObjectElement(container));
        };

        it("should enable button without loading user's country if no deny list", async () => {
          const projectDetail = await renderProjectDetail();

          expect(await projectDetail.getParticipateButton().isPresent()).toBe(
            true
          );

          expect(get(userCountryStore)).toBe(NOT_LOADED);
        });

        it("should show enabled button after getting user country", async () => {
          const response = snsResponseFor({
            principal: Principal.fromText(rootCanisterId),
            lifecycle: SnsSwapLifecycle.Open,
            certified: true,
            restrictedCountries: ["US"],
          });
          snsQueryStore.setData(response);
          fakeLocationApi.setCountryCode("CH");

          fakeLocationApi.pause();

          const projectDetail = await renderProjectDetail();

          await runResolvedPromises();
          expect(await projectDetail.getParticipateButton().isPresent()).toBe(
            false
          );

          fakeLocationApi.resume();

          await runResolvedPromises();
          expect(await projectDetail.getParticipateButton().isPresent()).toBe(
            true
          );
          expect(await projectDetail.getParticipateButton().isDisabled()).toBe(
            false
          );
        });
      });

      describe("successful participation", () => {
        const formattedAmountICP = "5.00";
        const amountICP = 5;
        const amountE8s = numberToE8s(amountICP);
        const finalCommitment = {
          icp: [
            {
              transfer_start_timestamp_seconds: BigInt(123444),
              amount_e8s: amountE8s,
              transfer_success_timestamp_seconds: BigInt(123445),
            },
          ],
        };

        beforeEach(() => {
          // Do not rely on the `loadAccounts` from the modal.
          accountsStore.setForTesting({
            main: mockMainAccount,
            subAccounts: [],
            hardwareWallets: [],
          });
          jest.spyOn(snsSaleApi, "getOpenTicket").mockResolvedValue(undefined);
          jest.spyOn(snsSaleApi, "newSaleTicket").mockResolvedValue({
            ...testTicket,
            amount_icp_e8s: amountE8s,
          });
          jest
            .spyOn(snsApi, "querySnsSwapCommitment")
            // Query call
            .mockResolvedValueOnce({
              rootCanisterId: Principal.fromText(rootCanisterId),
              myCommitment: undefined,
            } as SnsSwapCommitment)
            // Update call
            .mockResolvedValueOnce({
              rootCanisterId: Principal.fromText(rootCanisterId),
              myCommitment: undefined,
            } as SnsSwapCommitment)
            .mockResolvedValue({
              rootCanisterId: Principal.fromText(rootCanisterId),
              myCommitment: finalCommitment,
            } as SnsSwapCommitment);
        });

        const participateInSwap = async () => {
          const { container } = render(ProjectDetail, props);

          await runResolvedPromises();

          const projectDetail = ProjectDetailPo.under(
            new JestPageObjectElement(container)
          );

          await waitFor(async () =>
            expect(
              await projectDetail.getParticipateButton().isDisabled()
            ).toBe(false)
          );

          expect(await projectDetail.hasCommitmentAmount()).toBe(false);
          await projectDetail.participate({
            amount: amountICP,
            acceptConditions: false,
          });
          expect(await projectDetail.getCommitmentAmount()).toBe(
            formattedAmountICP
          );
        };

        it("when no restricted countries", async () => {
          await participateInSwap();
        });

        it("when restricted countries and user is from another country", async () => {
          const response = snsResponseFor({
            principal: Principal.fromText(rootCanisterId),
            lifecycle: SnsSwapLifecycle.Open,
            certified: true,
            restrictedCountries: [notUserCountryCode],
          });
          snsQueryStore.setData(response);

          await participateInSwap();
        });

        it("when restricted countries and getting location fails", async () => {
          jest.spyOn(console, "error").mockImplementation(() => undefined);
          fakeLocationApi.setCountryCode(
            new Error("Failed to get user location")
          );

          const response = snsResponseFor({
            principal: Principal.fromText(rootCanisterId),
            lifecycle: SnsSwapLifecycle.Open,
            certified: true,
            restrictedCountries: ["US"],
          });
          snsQueryStore.setData(response);
          await participateInSwap();
        });
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
                transfer_fee_paid_e8s: [],
                amount_transferred_e8s: [],
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
