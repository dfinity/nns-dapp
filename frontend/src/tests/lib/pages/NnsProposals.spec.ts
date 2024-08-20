import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import * as agent from "$lib/api/agent.api";
import * as governanceApi from "$lib/api/governance.api";
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
import {
  authStoreMock,
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { MockGovernanceCanister } from "$tests/mocks/governance.canister.mock";
import {
  mockEmptyProposalsStoreSubscribe,
  mockProposals,
  mockProposalsStoreSubscribe,
} from "$tests/mocks/proposals.store.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NnsProposalListPo } from "$tests/page-objects/NnsProposalList.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import { GovernanceCanister, type ProposalInfo } from "@dfinity/nns";
import { waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import { mock } from "vitest-mock-extended";

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
    resetNeuronsApiService();
    neuronsStore.reset();
    proposalsFiltersStore.reset();
    actionableProposalsSegmentStore.resetForTesting();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());

    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);

    // TODO: Mock the canister call instead of the canister itself
    const mockGovernanceCanister: MockGovernanceCanister =
      new MockGovernanceCanister([]);
    vi.spyOn(GovernanceCanister, "create").mockReturnValue(
      mockGovernanceCanister
    );
  });

  describe("logged in user", () => {
    describe("neurons", () => {
      beforeEach(() => {
        vi.spyOn(proposalsStore, "subscribe").mockImplementation(
          mockProposalsStoreSubscribe
        );
        vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
        actionableProposalsSegmentStore.set("all");
      });

      it("should load neurons", async () => {
        await renderComponent();

        await waitFor(() =>
          expect(governanceApi.queryNeurons).toHaveBeenCalledWith({
            identity: mockIdentity,
            certified: true,
            includeEmptyNeurons: false,
          })
        );
        expect(governanceApi.queryNeurons).toHaveBeenCalledWith({
          identity: mockIdentity,
          certified: false,
          includeEmptyNeurons: false,
        });
      });
    });

    describe("Matching results", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.reset();
        const mockGovernanceCanister: MockGovernanceCanister =
          new MockGovernanceCanister(mockProposals);

        vi.spyOn(proposalsStore, "subscribe").mockImplementation(
          mockProposalsStoreSubscribe
        );
        vi.spyOn(GovernanceCanister, "create").mockImplementation(
          (): GovernanceCanister => mockGovernanceCanister
        );

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

      it("should render a spinner while searching proposals", async () => {
        const po = await renderComponent();

        proposalsFiltersStore.filterTopics(DEFAULT_PROPOSALS_FILTERS.topics);
        await runResolvedPromises();

        expect(await po.hasListLoaderSpinner()).toEqual(true);
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
      const mockGovernanceCanister: MockGovernanceCanister =
        new MockGovernanceCanister([]);

      beforeEach(() => {
        vi.spyOn(GovernanceCanister, "create").mockImplementation(
          (): GovernanceCanister => mockGovernanceCanister
        );

        vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
        actionableProposalsSegmentStore.set("all");
      });

      it("should render not found text", async () => {
        vi.spyOn(proposalsStore, "subscribe").mockImplementation(
          mockEmptyProposalsStoreSubscribe
        );

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
      beforeEach(() => {
        // TODO: Mock the canister call instead of the canister itself
        const mockGovernanceCanister: MockGovernanceCanister =
          new MockGovernanceCanister([]);
        vi.spyOn(GovernanceCanister, "create").mockReturnValue(
          mockGovernanceCanister
        );
      });

      it("should NOT load neurons", async () => {
        await renderComponent();

        await waitFor(() =>
          expect(governanceApi.queryNeurons).not.toHaveBeenCalled()
        );
      });
    });

    describe("Matching results", () => {
      const mockGovernanceCanister: MockGovernanceCanister =
        new MockGovernanceCanister(mockProposals);

      const mockLoadProposals = () =>
        vi
          .spyOn(proposalsStore, "subscribe")
          .mockImplementation(mockProposalsStoreSubscribe);

      beforeEach(() => {
        vi.spyOn(GovernanceCanister, "create").mockImplementation(
          (): GovernanceCanister => mockGovernanceCanister
        );
      });

      it("should render proposals", async () => {
        mockLoadProposals();

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
    beforeEach(() => {
      actionableNnsProposalsStore.reset();

      authStoreMock.next({
        identity: mockIdentity,
      });
    });

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
