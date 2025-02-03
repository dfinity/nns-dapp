import * as governanceApi from "$lib/api/governance.api";
import * as proposalsApi from "$lib/api/proposals.api";
import { DEFAULT_LIST_PAGINATION_LIMIT } from "$lib/constants/constants";
import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import { ACTIONABLE_PROPOSALS_PARAM } from "$lib/constants/routes.constants";
import NnsProposals from "$lib/pages/NnsProposals.svelte";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import { authStore, type AuthStoreData } from "$lib/stores/auth.store";
import { proposalsFiltersStore } from "$lib/stores/proposals.store";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { IntersectionObserverActive } from "$tests/mocks/infinitescroll.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { NnsProposalListPo } from "$tests/page-objects/NnsProposalList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { Topic, type ProposalInfo } from "@dfinity/nns";
import { isNullish } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";

vi.mock("$lib/api/governance.api");

describe("NnsProposals", () => {
  const renderComponent = async () => {
    const { container } = render(NnsProposals);
    await runResolvedPromises();
    return NnsProposalListPo.under(new JestPageObjectElement(container));
  };
  const selectActionableProposals = async (po: NnsProposalListPo) => {
    await po
      .getNnsProposalFiltersPo()
      .getActionableProposalsSegmentPo()
      .clickActionableProposals();
    await runResolvedPromises();
  };

  beforeEach(() => {
    resetIdentity();
    vi.spyOn(proposalsApi, "queryProposals").mockResolvedValue(mockProposals);
    // Loading proposals is debounced but we don't want to wait for the delay in
    // the unit tests so we use fake timers.
    vi.useFakeTimers();
  });

  describe("logged in user", () => {
    describe("Matching results", () => {
      beforeEach(() => {
        vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
        actionableProposalsSegmentStore.set("all");
      });

      it("should render filters", async () => {
        const po = await renderComponent();

        expect(
          await po
            .getNnsProposalFiltersPo()
            .getFilterByTopicsButtonPo()
            .isPresent()
        ).toBe(true);
        expect(
          await po
            .getNnsProposalFiltersPo()
            .getFilterByStatusButtonPo()
            .isPresent()
        ).toBe(true);
      });

      it("should render a skeleton while searching proposals", async () => {
        let resolveQueryProposals;
        vi.spyOn(proposalsApi, "queryProposals").mockImplementation(
          () =>
            new Promise<ProposalInfo[]>((resolve) => {
              resolveQueryProposals = resolve;
            })
        );

        const po = await renderComponent();

        expect(await po.getSkeletonCardPo().isPresent()).toEqual(true);

        // Let the proposals load.
        resolveQueryProposals(mockProposals);
        await runResolvedPromises();
        expect(await po.getSkeletonCardPo().isPresent()).toEqual(false);
      });

      it("should reload proposals when proposal filter is set", async () => {
        let resolveQueryProposals;
        const queryProposalsSpy = vi
          .spyOn(proposalsApi, "queryProposals")
          .mockImplementation(
            () =>
              new Promise<ProposalInfo[]>((resolve) => {
                resolveQueryProposals = resolve;
              })
          );

        expect(queryProposalsSpy).toBeCalledTimes(0);

        const po = await renderComponent();

        // Let the proposals load the first time.
        resolveQueryProposals(mockProposals);
        resolveQueryProposals = undefined;

        await runResolvedPromises();
        expect(await po.getSkeletonCardPo().isPresent()).toEqual(false);

        const expectedQueryProposalsParams = {
          identity: mockIdentity,
          includeStatus: [],
          includeTopics: [],
        };
        expect(queryProposalsSpy).toBeCalledTimes(2);
        expect(queryProposalsSpy).toBeCalledWith({
          ...expectedQueryProposalsParams,
          certified: false,
        });
        expect(queryProposalsSpy).toBeCalledWith({
          ...expectedQueryProposalsParams,
          certified: true,
        });

        queryProposalsSpy.mockClear();
        expect(queryProposalsSpy).toBeCalledTimes(0);

        // Setting the filter should reload the proposals.
        proposalsFiltersStore.filterTopics(DEFAULT_PROPOSALS_FILTERS.topics);
        await runResolvedPromises();

        expect(await po.getSkeletonCardPo().isPresent()).toEqual(true);

        // Stop waiting for the debounce to load proposals.
        await advanceTime();

        expect(queryProposalsSpy).toBeCalledTimes(2);
        expect(queryProposalsSpy).toBeCalledWith({
          ...expectedQueryProposalsParams,
          certified: false,
        });
        expect(queryProposalsSpy).toBeCalledWith({
          ...expectedQueryProposalsParams,
          certified: true,
        });

        // Let the proposals load the second time.
        resolveQueryProposals(mockProposals);
        await runResolvedPromises();

        expect(await po.getSkeletonCardPo().isPresent()).toEqual(false);
      });

      it("should render a spinner while loading more proposals", async () => {
        // Make sure that the infinite scroll container thinks we are scrolling
        // to the bottom.
        vi.stubGlobal("IntersectionObserver", IntersectionObserverActive);

        // The first page must have DEFAULT_LIST_PAGINATION_LIMIT proposals
        // otherwise the service thinks we've already loaded all proposals.
        const firstPageProposals = Promise.resolve<ProposalInfo[]>(
          Array.from({ length: DEFAULT_LIST_PAGINATION_LIMIT }, (_, i) => ({
            ...mockProposals[0],
            id: BigInt(i),
          }))
        );

        // The second page doesn't resolve immediately so we can see the spinner
        // while it's loading.
        let resolveSecondPage;
        const secondPageProposals = new Promise<ProposalInfo[]>((resolve) => {
          resolveSecondPage = resolve;
        });

        // Return the first or second page depending on the beforeProposal parameter.
        vi.spyOn(proposalsApi, "queryProposals").mockImplementation(
          ({ beforeProposal }) => {
            return isNullish(beforeProposal)
              ? firstPageProposals
              : secondPageProposals;
          }
        );

        const po = await renderComponent();

        // The first page of proposals loads immediately.

        // Now the infinite scroll is loading the second page of proposals.
        expect(await po.hasListLoaderSpinner()).toEqual(true);

        // Finish loading the second page.
        resolveSecondPage(mockProposals);
        await advanceTime();
        expect(await po.hasListLoaderSpinner()).toEqual(false);
      });

      it("should render proposals", async () => {
        const po = await renderComponent();
        const firstProposal = mockProposals[0] as ProposalInfo;
        const secondProposal = mockProposals[1] as ProposalInfo;

        const cardPos = await po.getProposalCardPos();
        expect(cardPos).toHaveLength(2);
        expect(await cardPos[0].getProposalId()).toEqual(
          `ID: ${firstProposal.id}`
        );
        expect(await cardPos[1].getProposalId()).toEqual(
          `ID: ${secondProposal.id}`
        );
      });

      it("should not show old certified data if there is newer uncertified data", async () => {
        // The test first loads proposals with a filter.
        // While proposals are displayed based on the uncertified response,
        // before the certified response arrives, the filter is removed.
        // If the certified response for the filtered proposals arrives after
        // the uncertified response for the unfiltered proposals, this should
        // not result in displaying old data which doesn't match the current
        // filters.
        proposalsFiltersStore.filterTopics([Topic.Governance]);

        const proposalRequests = [];
        vi.spyOn(proposalsApi, "queryProposals").mockImplementation((args) => {
          return new Promise<ProposalInfo[]>((resolve) => {
            proposalRequests.push({
              args,
              resolve,
            });
          });
        });

        const matchingProposal: ProposalInfo = {
          ...mockProposals[0],
          topic: Topic.Governance,
        };
        const nonMatchingProposal: ProposalInfo = {
          ...mockProposals[1],
          topic: Topic.ProtocolCanisterManagement,
        };

        const po = await renderComponent();

        expect(proposalRequests).toHaveLength(2);
        expect(proposalRequests[0].args.certified).toBe(false);
        expect(proposalRequests[0].args.includeTopics).toEqual([
          Topic.Governance,
        ]);
        expect(proposalRequests[1].args.certified).toBe(true);
        expect(proposalRequests[1].args.includeTopics).toEqual([
          Topic.Governance,
        ]);
        // We resolve the uncertified request but not yet the certified request.
        proposalRequests[0].resolve([matchingProposal]);

        await runResolvedPromises();
        // There is 1 proposal that matches the filter.
        expect(await po.getProposalCardPos()).toHaveLength(1);

        // Remove the filter.
        const filters = po.getNnsProposalFiltersPo();
        await filters.clickFiltersByTopicsButton();
        const filterModal = filters.getFilterModalPo();
        await filterModal.clickClearSelectionButton();
        await filterModal.clickConfirmButton();

        // Finish the fade transition of the modal.
        await advanceTime(25);
        await filterModal.waitForAbsent();

        // Stop waiting for the debounce to reload proposals.
        await advanceTime(500);

        expect(proposalRequests).toHaveLength(4);
        expect(proposalRequests[2].args.certified).toBe(false);
        expect(proposalRequests[2].args.includeTopics).toEqual([]);
        expect(proposalRequests[3].args.certified).toBe(true);
        expect(proposalRequests[3].args.includeTopics).toEqual([]);

        // We resolve the second *uncertified* request before the first
        // *certified* request. Now there are 2 proposals.
        proposalRequests[2].resolve([matchingProposal, nonMatchingProposal]);
        await runResolvedPromises();
        expect(await po.getProposalCardPos()).toHaveLength(2);

        // When the old certified request (with 1 proposal) resolves, this
        // should not result in displaying old data which doesn't match the
        // current filters.
        proposalRequests[1].resolve([matchingProposal]);
        //await advanceTime(500);
        await runResolvedPromises();
        // We should still see both proposals from the request from after the
        // filter was removed.
        expect(await po.getProposalCardPos()).toHaveLength(2);
      });

      it("should not have actionable parameter in a proposal card href", async () => {
        const po = await renderComponent();
        const firstCardPos = (await po.getProposalCardPos())[0];

        expect(
          (await firstCardPos.getCardHref()).includes(
            ACTIONABLE_PROPOSALS_PARAM
          )
        ).toEqual(false);
      });

      it("should display actionable mark on all proposals view", async () => {
        // proposal ID:303 is actionable
        actionableNnsProposalsStore.setProposals([mockProposals[1]]);
        const po = await renderComponent();
        await po
          .getNnsProposalFiltersPo()
          .getActionableProposalsSegmentPo()
          .clickAllProposals();
        await runResolvedPromises();

        expect(await po.getProposalCardPos()).toHaveLength(2);
        // not actionable proposal
        expect(
          await (await po.getProposalCardPos())[0].getProposalId()
        ).toEqual("ID: 404");
        expect(
          await (await po.getProposalCardPos())[0]
            .getProposalStatusTagPo()
            .hasActionableStatusBadge()
        ).toEqual(false);
        // actionable proposal
        expect(
          await (await po.getProposalCardPos())[1].getProposalId()
        ).toEqual("ID: 303");
        expect(
          await (await po.getProposalCardPos())[1]
            .getProposalStatusTagPo()
            .hasActionableStatusBadge()
        ).toEqual(true);
      });

      it("should disable infinite scroll when all proposals loaded", async () => {
        const testProps = $state({
          disableInfiniteScroll: false,
        });

        render(NnsProposals, { props: testProps });

        await waitFor(() =>
          expect(testProps.disableInfiniteScroll).toBe(false)
        );
      });

      it("should not render not found text on init", async () => {
        const po = await renderComponent();

        expect(await po.getNoProposalsPo().isPresent()).toBe(false);
      });
    });

    describe("No results", () => {
      beforeEach(() => {
        vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
        actionableProposalsSegmentStore.set("all");
        vi.spyOn(proposalsApi, "queryProposals").mockResolvedValue([]);
      });

      it("should render not found text", async () => {
        const po = await renderComponent();

        expect(await po.getNoProposalsPo().isPresent()).toBe(true);
      });

      it("should render not found text when not signed in", async () => {
        setNoIdentity();
        const po = await renderComponent();

        expect(await po.getNoProposalsPo().isPresent()).toBe(true);
      });
    });

    describe("Async results", () => {
      const resolveQueryProposals = [];
      beforeEach(() => {
        resolveQueryProposals.length = 0;
        actionableProposalsSegmentStore.set("all");
        vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
        vi.spyOn(proposalsApi, "queryProposals").mockImplementation(() => {
          return new Promise<ProposalInfo[]>((resolve) => {
            resolveQueryProposals.push(resolve);
          });
        });
      });

      it("should not stop showing loading skeletons when a newer request is still loading", async () => {
        const po = await renderComponent();

        const changeFilters = async () => {
          const filters = po.getNnsProposalFiltersPo();
          await filters.clickFiltersByTopicsButton();
          const filtersModal = filters.getFilterModalPo();
          // We just change one entry. We don't care what it is.
          const filterEntry = (await filtersModal.getFilterEntryPos())[0];
          await filterEntry.click();
          await filtersModal.clickConfirmButton();

          // Stop waiting for the debounce to load proposals.
          await advanceTime();
        };

        expect(resolveQueryProposals).toHaveLength(2);
        expect(await po.getSkeletonCardPo().isPresent()).toEqual(true);
        expect(await po.getNoProposalsPo().isPresent()).toBe(false);

        // Finish initialization.
        resolveQueryProposals[0]([]); // query
        resolveQueryProposals[1]([]); // update
        resolveQueryProposals.length = 0;

        // Change filters to start a new request.
        await changeFilters();

        // Stop waiting for the debounce to load proposals.
        await advanceTime();

        expect(resolveQueryProposals).toHaveLength(2);

        // Change filters again to start a new request before the first request
        // finishes.
        await changeFilters();

        expect(resolveQueryProposals).toHaveLength(4);

        // The first request has become obsolete so resolving it should not take
        // the component out of the loading state.
        resolveQueryProposals[0]([]); // query
        resolveQueryProposals[1]([]); // update
        await runResolvedPromises();

        expect(await po.getSkeletonCardPo().isPresent()).toEqual(true);
        expect(await po.getNoProposalsPo().isPresent()).toBe(false);

        // Resolving the last request should end the loading state.
        resolveQueryProposals[2]([]); // query
        resolveQueryProposals[3]([]); // update
        await runResolvedPromises();

        expect(await po.getSkeletonCardPo().isPresent()).toEqual(false);
        expect(await po.getNoProposalsPo().isPresent()).toBe(true);
      });
    });
  });

  describe("when not logged in", () => {
    beforeEach(() => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        (run: Subscriber<AuthStoreData>): (() => void) => {
          run({ identity: undefined });

          return () => undefined;
        }
      );
      vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
      actionableProposalsSegmentStore.set("all");
    });

    describe("neurons", () => {
      it("should NOT load neurons", async () => {
        await renderComponent();

        await waitFor(() =>
          expect(governanceApi.queryNeurons).not.toHaveBeenCalled()
        );
      });
    });

    describe("Matching results", () => {
      it("should render proposals", async () => {
        const po = await renderComponent();
        const cardPos = await po.getProposalCardPos();
        const firstProposal = mockProposals[0] as ProposalInfo;
        const secondProposal = mockProposals[1] as ProposalInfo;

        expect(cardPos).toHaveLength(2);
        expect(await cardPos[0].getProposalId()).toEqual(
          `ID: ${firstProposal.id}`
        );
        expect(await cardPos[1].getProposalId()).toEqual(
          `ID: ${secondProposal.id}`
        );
      });
    });
  });

  describe("actionable proposals segment", () => {
    it("should render actionable proposals by default", async () => {
      const po = await renderComponent();

      expect(await po.getAllProposalList().isPresent()).toEqual(false);
      expect(await po.getActionableProposalList().isPresent()).toEqual(true);
    });

    it("should switch proposal lists on actionable segment change", async () => {
      actionableProposalsSegmentStore.set("all");
      const po = await renderComponent();
      expect(await po.getAllProposalList().isPresent()).toEqual(true);
      expect(await po.getActionableProposalList().isPresent()).toEqual(false);

      await selectActionableProposals(po);
      expect(await po.getAllProposalList().isPresent()).toEqual(false);
      expect(await po.getActionableProposalList().isPresent()).toEqual(true);

      await po
        .getNnsProposalFiltersPo()
        .getActionableProposalsSegmentPo()
        .clickAllProposals();
      await runResolvedPromises();

      expect(await po.getAllProposalList().isPresent()).toEqual(true);
      expect(await po.getActionableProposalList().isPresent()).toEqual(false);
    });

    it("should render skeletons while loading actionable", async () => {
      const po = await renderComponent();

      expect(await po.getSkeletonCardPo().isPresent()).toEqual(true);

      actionableNnsProposalsStore.setProposals(mockProposals);
      await runResolvedPromises();

      expect(await po.getSkeletonCardPo().isPresent()).toEqual(false);
    });

    it("should display no segment when not sign-in", async () => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        (run: Subscriber<AuthStoreData>): (() => void) => {
          run({ identity: undefined });

          return () => undefined;
        }
      );
      const po = await renderComponent();
      expect(
        await po
          .getNnsProposalFiltersPo()
          .getActionableProposalsSegmentPo()
          .isPresent()
      ).toBe(false);
    });

    it('should display "no actionable proposals" banner', async () => {
      actionableNnsProposalsStore.setProposals([]);
      const po = await renderComponent();

      await selectActionableProposals(po);
      expect(await po.getActionableEmptyBanner().isPresent()).toEqual(true);
      expect(await po.getActionableEmptyBanner().getTitleText()).toEqual(
        "You're all caught up."
      );
      expect(await po.getActionableEmptyBanner().getDescriptionText()).toEqual(
        "Check back later!"
      );
    });

    it("should display actionable proposals", async () => {
      actionableNnsProposalsStore.setProposals([
        mockProposals[0],
        mockProposals[1],
      ]);
      const po = await renderComponent();

      await selectActionableProposals(po);
      expect(await po.getProposalCardPos()).toHaveLength(2);
      expect(await (await po.getProposalCardPos())[0].getProposalId()).toEqual(
        "ID: 404"
      );
      expect(await (await po.getProposalCardPos())[1].getProposalId()).toEqual(
        "ID: 303"
      );
    });
  });
});
