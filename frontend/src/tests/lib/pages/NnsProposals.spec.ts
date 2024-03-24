import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import * as agent from "$lib/api/agent.api";
import * as governanceApi from "$lib/api/governance.api";
import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import NnsProposals from "$lib/pages/NnsProposals.svelte";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
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
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { MockGovernanceCanister } from "$tests/mocks/governance.canister.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import {
  mockEmptyProposalsStoreSubscribe,
  mockProposals,
  mockProposalsStoreSubscribe,
} from "$tests/mocks/proposals.store.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NnsProposalListPo } from "$tests/page-objects/NnsProposalList.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import {
  GovernanceCanister,
  type Proposal,
  type ProposalInfo,
} from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/governance.api");

describe("NnsProposals", () => {
  const renderComponent = async () => {
    const { container } = render(NnsProposals);
    await runResolvedPromises();
    return NnsProposalListPo.under(new JestPageObjectElement(container));
  };
  const nothingFound = (
    container: HTMLElement
  ): HTMLParagraphElement | undefined =>
    Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent === en.voting.nothing_found
    )[0];

  beforeEach(() => {
    vi.restoreAllMocks();
    resetNeuronsApiService();
    neuronsStore.reset();
    proposalsFiltersStore.reset();
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
      });

      it("should load neurons", async () => {
        render(NnsProposals);

        await waitFor(() =>
          expect(governanceApi.queryNeurons).toHaveBeenCalledWith({
            identity: mockIdentity,
            certified: true,
          })
        );
        expect(governanceApi.queryNeurons).toHaveBeenCalledWith({
          identity: mockIdentity,
          certified: false,
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
      });

      it("should render filters", () => {
        overrideFeatureFlagsStore.setFlag("ENABLE_VOTING_INDICATION", false);

        const { getByText } = render(NnsProposals);

        expect(getByText("Topics")).toBeInTheDocument();
        expect(getByText("Reward Status")).toBeInTheDocument();
        expect(getByText("Proposal Status")).toBeInTheDocument();
        expect(
          getByText("Show only proposals", {
            exact: false,
          })
        ).toBeInTheDocument();
      });

      it("should render a spinner while searching proposals", async () => {
        const { getByTestId } = render(NnsProposals);

        proposalsFiltersStore.filterTopics(DEFAULT_PROPOSALS_FILTERS.topics);

        await waitFor(() =>
          expect(getByTestId("next-page-sns-proposals-spinner")).not.toBeNull()
        );
      });

      it("should render proposals", () => {
        const { getByText } = render(NnsProposals);

        const firstProposal = mockProposals[0] as ProposalInfo;
        const secondProposal = mockProposals[1] as ProposalInfo;
        expect(
          getByText((firstProposal.proposal as Proposal).title as string)
        ).toBeInTheDocument();
        expect(
          getByText((secondProposal.proposal as Proposal).title as string)
        ).toBeInTheDocument();
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
            .hasActionableMark()
        ).toEqual(false);
        // actionable proposal
        expect(
          await (await po.getProposalCardPos())[1].getProposalId()
        ).toEqual("ID: 303");
        expect(
          await (await po.getProposalCardPos())[1]
            .getProposalStatusTagPo()
            .hasActionableMark()
        ).toEqual(true);
      });

      it("should hide proposal card if already voted", async () => {
        neuronsStore.setNeurons({ neurons: [mockNeuron], certified: true });

        const { queryAllByTestId } = render(NnsProposals);

        proposalsFiltersStore.toggleExcludeVotedProposals();

        await waitFor(() =>
          expect(queryAllByTestId("proposal-card").length).toBe(
            mockProposals.length - 1
          )
        );
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

      it("should not render not found text on init", () => {
        const { container } = render(NnsProposals);

        const p: HTMLParagraphElement | undefined = nothingFound(container);

        expect(p).toBeUndefined();
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
      });

      it("should render not found text", async () => {
        vi.spyOn(proposalsStore, "subscribe").mockImplementation(
          mockEmptyProposalsStoreSubscribe
        );

        const { container } = render(NnsProposals);

        await waitFor(() => {
          const p: HTMLParagraphElement | undefined = nothingFound(container);
          expect(p).not.toBeUndefined();
        });
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
        render(NnsProposals);

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

      it("should render proposals", () => {
        mockLoadProposals();

        const { getByText } = render(NnsProposals);

        const firstProposal = mockProposals[0] as ProposalInfo;
        const secondProposal = mockProposals[1] as ProposalInfo;
        expect(
          getByText((firstProposal.proposal as Proposal).title as string)
        ).toBeInTheDocument();
        expect(
          getByText((secondProposal.proposal as Proposal).title as string)
        ).toBeInTheDocument();
      });

      it("should render proposals also when ", () => {
        mockLoadProposals();

        const { getByText } = render(NnsProposals);

        const firstProposal = mockProposals[0] as ProposalInfo;
        const secondProposal = mockProposals[1] as ProposalInfo;
        expect(
          getByText((firstProposal.proposal as Proposal).title as string)
        ).toBeInTheDocument();
        expect(
          getByText((secondProposal.proposal as Proposal).title as string)
        ).toBeInTheDocument();

        proposalsFiltersStore.toggleExcludeVotedProposals();
      });
    });
  });

  describe("log in and out", () => {
    let spyReload;

    beforeEach(() => {
      spyReload = vi.spyOn(proposalsFiltersStore, "reload");
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mutableMockAuthStoreSubscribe
      );

      vi.spyOn(proposalsStore, "subscribe").mockImplementation(
        mockProposalsStoreSubscribe
      );
    });

    it("should reload filters on sign-in", () => {
      expect(spyReload).not.toHaveBeenCalled();
      authStoreMock.next({
        identity: undefined,
      });

      render(NnsProposals);

      authStoreMock.next({
        identity: mockIdentity,
      });

      expect(spyReload).toHaveBeenCalledTimes(1);
    });

    it("should reload filters after sign-out", () => {
      expect(spyReload).not.toHaveBeenCalled();
      authStoreMock.next({
        identity: mockIdentity,
      });

      render(NnsProposals);

      authStoreMock.next({
        identity: undefined,
      });

      expect(spyReload).toHaveBeenCalledTimes(1);
    });
  });

  describe("actionable proposals segment", () => {
    const selectActionableProposals = async (po: NnsProposalListPo) => {
      await po
        .getNnsProposalFiltersPo()
        .getActionableProposalsSegmentPo()
        .clickActionableProposals();
      await runResolvedPromises();
    };

    beforeEach(() => {
      actionableNnsProposalsStore.reset();

      authStoreMock.next({
        identity: mockIdentity,
      });
      overrideFeatureFlagsStore.setFlag("ENABLE_VOTING_INDICATION", true);
    });

    it("should render all proposals by default", async () => {
      const po = await renderComponent();

      expect(await po.getAllProposalList().isPresent()).toEqual(true);
      expect(await po.getActionableProposalList().isPresent()).toEqual(false);
    });

    it("should switch proposal lists on actionable segment change", async () => {
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
      expect(await po.getSkeletonCardPo().isPresent()).toEqual(false);

      await selectActionableProposals(po);
      expect(await po.getSkeletonCardPo().isPresent()).toEqual(true);

      actionableNnsProposalsStore.setProposals(mockProposals);
      await runResolvedPromises();

      expect(await po.getSkeletonCardPo().isPresent()).toEqual(false);
    });

    it("should display login CTA", async () => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        (run: Subscriber<AuthStoreData>): (() => void) => {
          run({ identity: undefined });

          return () => undefined;
        }
      );
      const po = await renderComponent();
      await selectActionableProposals(po);
      expect(await po.getActionableSignInBanner().isPresent()).toEqual(true);
      expect(await po.getActionableSignInBanner().getTitleText()).toEqual(
        "You are not signed in."
      );
      expect(await po.getActionableSignInBanner().getDescriptionText()).toEqual(
        "Sign in to see actionable proposals"
      );
      expect(
        await po.getActionableSignInBanner().getBannerActionsText()
      ).toEqual("Sign in with Internet Identity");
    });

    it('should display "no actionable proposals" banner', async () => {
      actionableNnsProposalsStore.setProposals([]);
      const po = await renderComponent();

      await selectActionableProposals(po);
      expect(await po.getActionableEmptyBanner().isPresent()).toEqual(true);
      expect(await po.getActionableEmptyBanner().getTitleText()).toEqual(
        "There are no actionable proposals you can vote for."
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
