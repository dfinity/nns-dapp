import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import * as governanceApi from "$lib/api/governance.api";
import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import NnsProposals from "$lib/pages/NnsProposals.svelte";
import { authStore, type AuthStoreData } from "$lib/stores/auth.store";
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
import {
  buildMockNeuronsStoreSubscribe,
  mockNeuron,
} from "$tests/mocks/neurons.mock";
import {
  mockEmptyProposalsStoreSubscribe,
  mockProposals,
  mockProposalsStoreSubscribe,
} from "$tests/mocks/proposals.store.mock";
import {
  GovernanceCanister,
  type Proposal,
  type ProposalInfo,
} from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import { vi } from "vitest";

vi.mock("$lib/api/governance.api");

describe("NnsProposals", () => {
  const nothingFound = (
    container: HTMLElement
  ): HTMLParagraphElement | undefined =>
    Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent === en.voting.nothing_found
    )[0];

  beforeEach(() => {
    vi.clearAllMocks();
    resetNeuronsApiService();
    neuronsStore.reset();
  });

  describe("logged in user", () => {
    beforeEach(() => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );
    });

    afterAll(() => vi.clearAllMocks());

    describe("neurons", () => {
      beforeEach(() => {
        // TODO: Mock the canister call instead of the canister itself
        const mockGovernanceCanister: MockGovernanceCanister =
          new MockGovernanceCanister([]);
        vi.spyOn(GovernanceCanister, "create").mockReturnValue(
          mockGovernanceCanister
        );

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

      it("should hide proposal card if already voted", async () => {
        vi.spyOn(neuronsStore, "subscribe").mockImplementation(
          buildMockNeuronsStoreSubscribe([mockNeuron])
        );

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

    afterAll(() => vi.clearAllMocks());

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

      beforeEach(() =>
        vi
          .spyOn(GovernanceCanister, "create")
          .mockImplementation((): GovernanceCanister => mockGovernanceCanister)
      );

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
    beforeEach(() => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mutableMockAuthStoreSubscribe
      );

      vi.spyOn(proposalsStore, "subscribe").mockImplementation(
        mockProposalsStoreSubscribe
      );
    });

    beforeEach(() => vi.clearAllMocks());

    const spyReload = vi.spyOn(proposalsFiltersStore, "reload");

    it("should reload filters on sign-in", () => {
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
});
