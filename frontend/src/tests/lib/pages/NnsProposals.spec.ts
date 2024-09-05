import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import * as governanceApi from "$lib/api/governance.api";
import * as proposalsApi from "$lib/api/proposals.api";
import { DEFAULT_LIST_PAGINATION_LIMIT } from "$lib/constants/constants";
import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import { ACTIONABLE_PROPOSALS_PARAM } from "$lib/constants/routes.constants";
import NnsProposals from "$lib/pages/NnsProposals.svelte";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import { authStore, type AuthStoreData } from "$lib/stores/auth.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import {
  proposalsFiltersStore,
  proposalsStore,
} from "$lib/stores/proposals.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { IntersectionObserverActive } from "$tests/mocks/infinitescroll.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { NnsProposalListPo } from "$tests/page-objects/NnsProposalList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import type { ProposalInfo } from "@dfinity/nns";
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
    vi.restoreAllMocks();
    proposalsStore.reset();
    resetNeuronsApiService();
    neuronsStore.reset();
    proposalsFiltersStore.reset();
    actionableNnsProposalsStore.reset();
    actionableProposalsSegmentStore.resetForTesting();

    resetIdentity();
    vi.spyOn(proposalsApi, "queryProposals").mockResolvedValue(mockProposals);
    // Loading proposals is debounced but we don't want to wait for the delay in
    // the unit tests so we use fake timers.
    vi.useFakeTimers();
  });

  describe("logged in user", () => {
    describe("Matching results", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.reset();
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

      it("should reload transactions when proposal filter is set", async () => {
        let resolveQueryProposals;
        vi.spyOn(proposalsApi, "queryProposals").mockImplementation(
          () =>
            new Promise<ProposalInfo[]>((resolve) => {
              resolveQueryProposals = resolve;
            })
        );

        const po = await renderComponent();

        // Let the proposals load the first time.
        resolveQueryProposals(mockProposals);
        resolveQueryProposals = undefined;

        await runResolvedPromises();
        expect(await po.getSkeletonCardPo().isPresent()).toEqual(false);

        // Setting the filter should reload the proposals.
        proposalsFiltersStore.filterTopics(DEFAULT_PROPOSALS_FILTERS.topics);
        await runResolvedPromises();

        expect(await po.getSkeletonCardPo().isPresent()).toEqual(true);

        // Stop waiting for the debounce to load proposals.
        await advanceTime();

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
        const { component } = render(NnsProposals);

        // How to check the value of a prop in a Svelte component
        // https://github.com/testing-library/svelte-testing-library/issues/117
        await waitFor(() =>
          expect(
            component.$$.ctx[component.$$.props["disableInfiniteScroll"]]
          ).toBe(false)
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
