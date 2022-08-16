/**
 * @jest-environment jsdom
 */

import {
  GovernanceCanister,
  type Proposal,
  type ProposalInfo,
} from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import { DEFAULT_PROPOSALS_FILTERS } from "../../lib/constants/proposals.constants";
import { authStore } from "../../lib/stores/auth.store";
import {
  neuronsStore,
  type NeuronsStore,
} from "../../lib/stores/neurons.store";
import {
  proposalsFiltersStore,
  proposalsStore,
} from "../../lib/stores/proposals.store";
import Proposals from "../../routes/Proposals.svelte";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../mocks/governance.canister.mock";
import en from "../mocks/i18n.mock";
import {
  mockEmptyProposalsStoreSubscribe,
  mockProposals,
  mockProposalsStoreSubscribe,
} from "../mocks/proposals.store.mock";

describe("Proposals", () => {
  const nothingFound = (
    container: HTMLElement
  ): HTMLParagraphElement | undefined =>
    Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent === en.voting.nothing_found
    )[0];

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

    it("should render a description", () => {
      const { getByText } = render(Proposals);

      expect(
        getByText(
          "The Internet Computer network runs under the control of the Network Nervous System",
          { exact: false }
        )
      ).toBeInTheDocument();
    });

    it("should render filters", () => {
      const { getByText } = render(Proposals);

      expect(getByText("Topics")).toBeInTheDocument();
      expect(getByText("Reward Status")).toBeInTheDocument();
      expect(getByText("Proposal Status")).toBeInTheDocument();
      expect(
        getByText('Hide "Open" proposals', {
          exact: false,
        })
      ).toBeInTheDocument();
    });

    it("should render a spinner while searching proposals", async () => {
      const { getByTestId } = render(Proposals);

      proposalsFiltersStore.filterTopics(DEFAULT_PROPOSALS_FILTERS.topics);

      await waitFor(() =>
        expect(getByTestId("proposals-loading")).not.toBeNull()
      );
    });

    describe("neuron loading", () => {
      beforeEach(() => {
        const mockNeuronsStoreSubscribe = (
          run: Subscriber<NeuronsStore>
        ): (() => void) => {
          run({ neurons: undefined, certified: false });

          return () => undefined;
        };
        jest
          .spyOn(neuronsStore, "subscribe")
          .mockImplementation(mockNeuronsStoreSubscribe);
      });
      afterEach(() => jest.clearAllMocks());

      it("should render a spinner while loading neurons", async () => {
        const { getByTestId } = render(Proposals);

        await waitFor(() =>
          expect(getByTestId("proposals-loading")).not.toBeNull()
        );
      });
    });

    it("should render proposals", () => {
      mockLoadProposals();

      const { getByText } = render(Proposals);

      const firstProposal = mockProposals[0] as ProposalInfo;
      const secondProposal = mockProposals[1] as ProposalInfo;
      expect(
        getByText((firstProposal.proposal as Proposal).title as string)
      ).toBeInTheDocument();
      expect(
        getByText((secondProposal.proposal as Proposal).title as string)
      ).toBeInTheDocument();
    });

    it("should not render not found text on init", () => {
      const { container } = render(Proposals);

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

      const { container } = render(Proposals);

      await waitFor(() => {
        const p: HTMLParagraphElement | undefined = nothingFound(container);
        expect(p).not.toBeUndefined();
      });
    });
  });
});
