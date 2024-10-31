import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import * as proposalsApi from "$lib/api/proposals.api";
import * as snsSaleApi from "$lib/api/sns-sale.api";
import * as snsMetricsApi from "$lib/api/sns-swap-metrics.api";
import * as snsApi from "$lib/api/sns.api";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import { AppPath } from "$lib/constants/routes.constants";
import { WATCH_SALE_STATE_EVERY_MILLISECONDS } from "$lib/constants/sns.constants";
import { NOT_LOADED } from "$lib/constants/stores.constants";
import { pageStore } from "$lib/derived/page.derived";
import ProjectDetail from "$lib/pages/ProjectDetail.svelte";
import { cancelPollGetOpenTicket } from "$lib/services/sns-sale.services";
import { getOrCreateSnsFinalizationStatusStore } from "$lib/stores/sns-finalization-status.store";
import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
import { snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { userCountryStore } from "$lib/stores/user-country.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { formatTokenE8s, numberToE8s } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import * as fakeLocationApi from "$tests/fakes/location-api.fake";
import {
  mockPrincipal,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  mockAccountDetails,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import {
  createFinalizationStatusMock,
  snsFinalizationStatusResponseMock,
} from "$tests/mocks/sns-finalization-status.mock";
import { snsTicketMock } from "$tests/mocks/sns.mock";
import { ProjectDetailPo } from "$tests/page-objects/ProjectDetail.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/nns-dapp.api");
vi.mock("$lib/api/sns.api");
vi.mock("$lib/api/sns-swap-metrics.api");
vi.mock("$lib/api/sns-sale.api");
vi.mock("$lib/api/icp-ledger.api");
vi.mock("$lib/api/location.api");
vi.mock("$lib/api/proposals.api");

const blockedApiPaths = [
  "$lib/api/nns-dapp.api",
  "$lib/api/sns.api",
  "$lib/api/sns-swap-metrics.api",
  "$lib/api/sns-sale.api",
  "$lib/api/icp-ledger.api",
  "$lib/api/location.api",
  "$lib/api/proposals.api",
];

describe("ProjectDetail", () => {
  blockAllCallsTo(blockedApiPaths);
  fakeLocationApi.install();

  const rootCanisterId = mockCanisterId;
  const userCountryCode = "CH";
  const notUserCountryCode = "US";
  const newBalance = 10_000_000_000n;
  const saleBuyerCount = 1_000_000;
  const rawMetricsText = `
# TYPE sale_buyer_count gauge
sale_buyer_count ${saleBuyerCount} 1677707139456
# HELP sale_cf_participants_count`;
  const now = Date.now();
  const nowInSeconds = Math.floor(now / 1000);

  beforeEach(() => {
    vi.clearAllMocks();
    resetSnsProjects();
    snsSwapCommitmentsStore.reset();
    snsSwapMetricsStore.reset();
    snsTicketsStore.reset();
    userCountryStore.set(NOT_LOADED);

    vi.clearAllTimers();
    vi.useFakeTimers().setSystemTime(now);

    vi.spyOn(ledgerApi, "sendICP").mockResolvedValue(undefined);

    vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue(mockAccountDetails);
    vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(newBalance);

    vi.spyOn(proposalsApi, "queryProposal").mockResolvedValue(mockProposalInfo);

    fakeLocationApi.setCountryCode(userCountryCode);

    vi.spyOn(snsApi, "querySnsDerivedState").mockResolvedValue({
      sns_tokens_per_icp: [1],
      buyer_total_icp_e8s: [200_000_000n],
      cf_participant_count: [],
      direct_participant_count: [],
      cf_neuron_count: [],
      neurons_fund_participation_icp_e8s: [],
      direct_participation_icp_e8s: [],
    });

    vi.spyOn(snsSaleApi, "queryFinalizationStatus").mockResolvedValue(
      snsFinalizationStatusResponseMock
    );

    vi.spyOn(snsMetricsApi, "querySnsSwapMetrics").mockResolvedValue(
      rawMetricsText
    );
  });

  describe("not logged in user", () => {
    beforeEach(() => {
      page.mock({ data: { universe: null } });
      setNoIdentity();
    });

    // TODO: Remove once all SNSes support buyers count in derived state
    describe("Open project without buyers count on derived state", () => {
      const props = {
        rootCanisterId: rootCanisterId.toText(),
      };
      beforeEach(() => {
        setSnsProjects([
          {
            rootCanisterId,
            lifecycle: SnsSwapLifecycle.Open,
            directParticipantCount: [],
            certified: true,
          },
        ]);
      });

      it("should fetch swap metrics on load", async () => {
        render(ProjectDetail, props);

        await runResolvedPromises();
        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(1);
      });
    });

    describe("Open project with buyers count on derived state", () => {
      const props = {
        rootCanisterId: rootCanisterId.toText(),
      };
      beforeEach(() => {
        setSnsProjects([
          {
            rootCanisterId,
            lifecycle: SnsSwapLifecycle.Open,
            directParticipantCount: [30n],
            certified: true,
          },
        ]);
      });

      it("should NOT start watching swap metrics", async () => {
        render(ProjectDetail, props);

        await runResolvedPromises();
        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(0);

        const retryDelay = WATCH_SALE_STATE_EVERY_MILLISECONDS;
        await advanceTime(retryDelay);
        await runResolvedPromises();

        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(0);
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

    // TODO: Remove once all SNSes support buyers count in derived state
    describe("Committed project without buyers in derived state", () => {
      const props = {
        rootCanisterId: rootCanisterId.toText(),
      };
      beforeEach(() => {
        setSnsProjects([
          {
            rootCanisterId,
            lifecycle: SnsSwapLifecycle.Committed,
            directParticipantCount: [],
            certified: true,
          },
        ]);
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
    });

    describe("Committed project with buyers count in derived state", () => {
      const props = {
        rootCanisterId: rootCanisterId.toText(),
      };
      beforeEach(() => {
        setSnsProjects([
          {
            rootCanisterId,
            lifecycle: SnsSwapLifecycle.Committed,
            directParticipantCount: [30n],
            certified: true,
            swapDueTimestampSeconds: nowInSeconds - SECONDS_IN_DAY,
          },
        ]);
      });

      it("should NOT query metrics nor watch them", async () => {
        const { queryByTestId } = render(ProjectDetail, props);

        expect(queryByTestId("sns-project-detail-status")).toBeInTheDocument();

        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(0);

        const retryDelay = WATCH_SALE_STATE_EVERY_MILLISECONDS;

        // Even after waiting a long time there shouldn't be more calls.
        await advanceTime(99 * retryDelay);
        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(0);
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

      it("should query finalization status and load it in store", async () => {
        render(ProjectDetail, props);

        await runResolvedPromises();
        const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
        expect(get(store)?.data).toEqual(snsFinalizationStatusResponseMock);
      });
    });

    describe("project with nns_proposal_id present", () => {
      const props = {
        rootCanisterId: rootCanisterId.toText(),
      };
      beforeEach(() => {
        setSnsProjects([
          {
            rootCanisterId,
            // Open lifecycle makes the watcher poll for derived state.
            lifecycle: SnsSwapLifecycle.Open,
            certified: true,
            nnsProposalId: Number(mockProposalInfo.id),
          },
        ]);
      });

      it("should show a proposal card from the proposal id", async () => {
        const { queryByTestId } = render(ProjectDetail, props);

        await runResolvedPromises();

        expect(queryByTestId("proposal-card")).toBeInTheDocument();
      });

      it("should not reload proposal when derived state updates", async () => {
        render(ProjectDetail, props);

        await runResolvedPromises();

        vi.mocked(proposalsApi.queryProposal).mockClear();

        expect(snsApi.querySnsDerivedState).toBeCalledTimes(0);
        expect(proposalsApi.queryProposal).toBeCalledTimes(0);

        await advanceTime(WATCH_SALE_STATE_EVERY_MILLISECONDS);

        // There used to be a bug where the proposal get reloaded every time the
        // derived state was updated, even though the proposal card won't change.
        // So we verify that the derived state is queried but the proposal is not.
        expect(snsApi.querySnsDerivedState).toBeCalledTimes(1);
        expect(proposalsApi.queryProposal).toBeCalledTimes(0);
      });
    });
  });

  describe("logged in user", () => {
    beforeEach(() => {
      resetIdentity();

      vi.spyOn(snsSaleApi, "getOpenTicket").mockResolvedValue(undefined);
      vi.spyOn(snsApi, "querySnsLifecycle").mockResolvedValue({
        decentralization_sale_open_timestamp_seconds: [11_231_312n],
        lifecycle: [SnsSwapLifecycle.Open],
        decentralization_swap_termination_timestamp_seconds: [],
      });

      cancelPollGetOpenTicket();
    });

    describe("Open project", () => {
      const props = {
        rootCanisterId: rootCanisterId.toText(),
      };
      const { ticket: testTicket } = snsTicketMock({
        rootCanisterId,
        owner: mockPrincipal,
      });
      beforeEach(() => {
        setSnsProjects([
          {
            rootCanisterId,
            lifecycle: SnsSwapLifecycle.Open,
            restrictedCountries: [],
            certified: true,
          },
        ]);
        vi.spyOn(snsSaleApi, "notifyParticipation").mockResolvedValue({
          icp_accepted_participation_e8s: testTicket.amount_icp_e8s,
          icp_ledger_account_balance_e8s: testTicket.amount_icp_e8s,
        });
        vi.spyOn(ledgerApi, "sendICP").mockResolvedValue(10n);
        vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
          1_000_000_000n
        );
      });

      it("should show user's commitment", async () => {
        const userCommitment = 100_000_000n;
        vi.spyOn(snsApi, "querySnsSwapCommitment").mockResolvedValue({
          rootCanisterId,
          myCommitment: {
            icp: [
              {
                transfer_start_timestamp_seconds: 123_444n,
                amount_e8s: userCommitment,
                transfer_success_timestamp_seconds: 123_445n,
                transfer_fee_paid_e8s: [],
                amount_transferred_e8s: [],
              },
            ],
            has_created_neuron_recipes: [],
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
        ).toMatch(formatTokenE8s({ value: userCommitment }));
      });

      describe("no open ticket and no commitment", () => {
        beforeEach(() => {
          vi.spyOn(snsSaleApi, "getOpenTicket").mockResolvedValue(undefined);
          vi.spyOn(snsApi, "querySnsSwapCommitment").mockResolvedValue({
            rootCanisterId,
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
          setSnsProjects([
            {
              rootCanisterId,
              lifecycle: SnsSwapLifecycle.Open,
              certified: true,
              restrictedCountries: ["US"],
            },
          ]);
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
              transfer_start_timestamp_seconds: 123_444n,
              amount_e8s: amountE8s,
              transfer_success_timestamp_seconds: 123_445n,
            },
          ],
          has_created_neuron_recipes: [],
        };

        beforeEach(() => {
          // Do not rely on the `loadAccounts` from the modal.
          setAccountsForTesting({
            main: mockMainAccount,
            subAccounts: [],
            hardwareWallets: [],
          });
          vi.spyOn(snsSaleApi, "getOpenTicket").mockResolvedValue(undefined);
          vi.spyOn(snsSaleApi, "newSaleTicket").mockResolvedValue({
            ...testTicket,
            amount_icp_e8s: amountE8s,
          });
          vi.spyOn(snsApi, "querySnsSwapCommitment")
            // Query call
            .mockResolvedValueOnce({
              rootCanisterId,
              myCommitment: undefined,
            } as SnsSwapCommitment)
            // Update call
            .mockResolvedValueOnce({
              rootCanisterId,
              myCommitment: undefined,
            } as SnsSwapCommitment)
            .mockResolvedValue({
              rootCanisterId,
              myCommitment: finalCommitment,
            } as SnsSwapCommitment);
        });

        const participateInSwap = async (): Promise<ProjectDetailPo> => {
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

          await projectDetail.clickParticipate();
          const modal = projectDetail.getParticipateSwapModalPo();
          await modal.participate({
            amount: amountICP,
            acceptConditions: false,
          });
          await advanceTime();
          await modal.waitForAbsent();
          expect(await projectDetail.getCommitmentAmount()).toBe(
            formattedAmountICP
          );

          return projectDetail;
        };

        it("when no restricted countries", async () => {
          await participateInSwap();
        });

        it("when restricted countries and user is from another country", async () => {
          setSnsProjects([
            {
              rootCanisterId,
              lifecycle: SnsSwapLifecycle.Open,
              certified: true,
              restrictedCountries: [notUserCountryCode],
            },
          ]);

          await participateInSwap();
        });

        it("when restricted countries and getting location fails", async () => {
          vi.spyOn(console, "error").mockImplementation(() => undefined);
          fakeLocationApi.setCountryCode(
            new Error("Failed to get user location")
          );

          setSnsProjects([
            {
              rootCanisterId,
              lifecycle: SnsSwapLifecycle.Open,
              certified: true,
              restrictedCountries: ["US"],
            },
          ]);
          await participateInSwap();
        });

        it("should show finalizing after successful participation if api returns finalizing state", async () => {
          const finalizingStatus = createFinalizationStatusMock(true);
          vi.spyOn(snsSaleApi, "queryFinalizationStatus").mockResolvedValue(
            finalizingStatus
          );

          const po = await participateInSwap();

          expect(await po.getStatus()).toBe("Finalizing");
        });
      });

      it("should participate without user interaction if there is an open ticket.", async () => {
        const initialCommitment = { icp: [], has_created_neuron_recipes: [] };
        const finalCommitment = {
          icp: [
            {
              transfer_start_timestamp_seconds: 123_444n,
              amount_e8s: testTicket.amount_icp_e8s,
              transfer_success_timestamp_seconds: 123_445n,
            },
          ],
          has_created_neuron_recipes: [],
        };
        vi.spyOn(snsApi, "querySnsSwapCommitment")
          // Query call
          .mockResolvedValueOnce({
            rootCanisterId,
            myCommitment: initialCommitment,
          } as SnsSwapCommitment)
          // Update call
          .mockResolvedValueOnce({
            rootCanisterId,
            myCommitment: initialCommitment,
          } as SnsSwapCommitment)
          .mockResolvedValue({
            rootCanisterId,
            myCommitment: finalCommitment,
          } as SnsSwapCommitment);
        vi.spyOn(snsSaleApi, "getOpenTicket").mockResolvedValue(testTicket);

        expect(snsApi.querySnsSwapCommitment).not.toBeCalled();

        const { getByTestId, queryByTestId } = render(ProjectDetail, props);

        expect(queryByTestId("sns-user-commitment")).not.toBeInTheDocument();

        await waitFor(() =>
          expect(getByTestId("sale-in-progress-modal")).toBeInTheDocument()
        );

        expect(snsApi.querySnsSwapCommitment).toBeCalledTimes(2);

        await waitFor(() =>
          expect(queryByTestId("sns-user-commitment")).toBeInTheDocument()
        );

        expect(
          queryByTestId("sns-user-commitment")?.querySelector(
            "[data-tid='token-value']"
          )?.innerHTML
        ).toMatch(formatTokenE8s({ value: testTicket.amount_icp_e8s }));
        expect(snsApi.querySnsSwapCommitment).toBeCalledTimes(3);
      });
    });

    describe("Committed project", () => {
      const props = {
        rootCanisterId: rootCanisterId.toText(),
      };
      beforeEach(() => {
        setSnsProjects([
          {
            rootCanisterId,
            lifecycle: SnsSwapLifecycle.Committed,
            directParticipantCount: [],
            certified: true,
          },
        ]);
        vi.spyOn(snsApi, "querySnsSwapCommitment").mockResolvedValue({
          rootCanisterId,
          myCommitment: {
            icp: [],
            has_created_neuron_recipes: [],
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
    });

    describe("Committed project with buyers count in state", () => {
      const props = {
        rootCanisterId: rootCanisterId.toText(),
      };
      const userCommitment = 100_000_000n;
      beforeEach(() => {
        setSnsProjects([
          {
            rootCanisterId,
            lifecycle: SnsSwapLifecycle.Committed,
            directParticipantCount: [30n],
            certified: true,
          },
        ]);
        vi.spyOn(snsApi, "querySnsSwapCommitment").mockResolvedValue({
          rootCanisterId,
          myCommitment: {
            icp: [
              {
                transfer_start_timestamp_seconds: 123_444n,
                amount_e8s: userCommitment,
                transfer_success_timestamp_seconds: 123_445n,
                transfer_fee_paid_e8s: [],
                amount_transferred_e8s: [],
              },
            ],
            has_created_neuron_recipes: [],
          },
        });
      });

      it("should NOT query metrics nor watch them", async () => {
        const { queryByTestId } = render(ProjectDetail, props);

        expect(queryByTestId("sns-project-detail-status")).toBeInTheDocument();

        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(0);

        const retryDelay = WATCH_SALE_STATE_EVERY_MILLISECONDS;

        // Even after waiting a long time there shouldn't be more calls.
        await advanceTime(99 * retryDelay);
        expect(snsMetricsApi.querySnsSwapMetrics).toBeCalledTimes(0);
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
        ).toMatch(formatTokenE8s({ value: userCommitment }));
      });
    });
  });

  describe("invalid root canister id", () => {
    beforeEach(() => {
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Open,
          certified: true,
        },
      ]);
      page.mock({ data: { universe: null } });
      setNoIdentity();
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
    beforeEach(() => {
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Open,
          certified: true,
        },
      ]);
      page.mock({ data: { universe: null } });
      setNoIdentity();
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
