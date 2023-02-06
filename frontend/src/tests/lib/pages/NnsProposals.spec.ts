/**
 * @jest-environment jsdom
 */

import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import NnsProposals from "$lib/pages/NnsProposals.svelte";
import { authStore, type AuthStore } from "$lib/stores/auth.store";
import { neuronsStore, type NeuronsStore } from "$lib/stores/neurons.store";
import {
  proposalsFiltersStore,
  proposalsStore,
} from "$lib/stores/proposals.store";
import {
  GovernanceCanister,
  type Proposal,
  type ProposalInfo,
} from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import {
  authStoreMock,
  mockAuthStoreSubscribe,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../mocks/governance.canister.mock";
import en from "../../mocks/i18n.mock";
import {
  buildMockNeuronsStoreSubscribe,
  mockNeuron,
} from "../../mocks/neurons.mock";
import {
  mockEmptyProposalsStoreSubscribe,
  mockProposals,
  mockProposalsStoreSubscribe,
} from "../../mocks/proposals.store.mock";

describe("NnsProposals", () => {
  const nothingFound = (
    container: HTMLElement
  ): HTMLParagraphElement | undefined =>
    Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent === en.voting.nothing_found
    )[0];

  describe("logged in user", () => {
    beforeEach(() => {
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);

      const mockNeuronsStoreSubscribe = (
        run: Subscriber<NeuronsStore>
      ): (() => void) => {
        run({ neurons: [], certified: true });

        return () => undefined;
      };
      jest
        .spyOn(neuronsStore, "subscribe")
        .mockImplementation(mockNeuronsStoreSubscribe);
    });

    afterAll(() => jest.clearAllMocks());

    describe("Matching results", () => {
      const mockGovernanceCanister: MockGovernanceCanister =
        new MockGovernanceCanister(mockProposals);

      const mockLoadProposals = () =>
        jest
          .spyOn(proposalsStore, "subscribe")
          .mockImplementation(mockProposalsStoreSubscribe);

      beforeEach(() =>
        jest
          .spyOn(GovernanceCanister, "create")
          .mockImplementation((): GovernanceCanister => mockGovernanceCanister)
      );

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

      it("should hide proposal card if already voted", async () => {
        mockLoadProposals();

        jest
          .spyOn(neuronsStore, "subscribe")
          .mockImplementation(buildMockNeuronsStoreSubscribe([mockNeuron]));

        const { container } = render(NnsProposals);

        proposalsFiltersStore.toggleExcludeVotedProposals();

        await waitFor(() =>
          expect(container.querySelectorAll("article").length).toBe(
            mockProposals.length - 1
          )
        );
      });

      it("should disable infinite scroll when all proposals loaded", async () => {
        mockLoadProposals();

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

      beforeEach(() =>
        jest
          .spyOn(GovernanceCanister, "create")
          .mockImplementation((): GovernanceCanister => mockGovernanceCanister)
      );

      it("should render not found text", async () => {
        jest
          .spyOn(proposalsStore, "subscribe")
          .mockImplementation(mockEmptyProposalsStoreSubscribe);

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
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation((run: Subscriber<AuthStore>): (() => void) => {
          run({ identity: undefined });

          return () => undefined;
        });
    });

    afterAll(() => jest.clearAllMocks());

    describe("Matching results", () => {
      const mockGovernanceCanister: MockGovernanceCanister =
        new MockGovernanceCanister(mockProposals);

      const mockLoadProposals = () =>
        jest
          .spyOn(proposalsStore, "subscribe")
          .mockImplementation(mockProposalsStoreSubscribe);

      beforeEach(() =>
        jest
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
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mutableMockAuthStoreSubscribe);

      jest
        .spyOn(proposalsStore, "subscribe")
        .mockImplementation(mockProposalsStoreSubscribe);
    });

    beforeEach(() => jest.clearAllMocks());

    const spyReload = jest.spyOn(proposalsFiltersStore, "reload");

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
