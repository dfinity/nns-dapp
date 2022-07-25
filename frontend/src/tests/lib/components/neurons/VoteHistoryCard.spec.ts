/**
 * @jest-environment jsdom
 */

import type { Proposal } from "@dfinity/nns";
import { GovernanceCanister, Vote } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import VotingHistoryCard from "../../../../lib/components/neurons/VotingHistoryCard.svelte";
import { authStore } from "../../../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../../mocks/governance.canister.mock";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";
import { mockProposals } from "../../../mocks/proposals.store.mock";
import { silentConsoleErrors } from "../../../mocks/utils.mock";

describe("VoteHistoryCard", () => {
  const props = {
    neuron: {
      ...mockNeuron,
      recentBallots: [
        {
          vote: Vote.YES,
          proposalId: mockProposals[0].id,
        },
        {
          vote: Vote.NO,
          proposalId: mockProposals[1].id,
        },
      ],
    },
  };

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  beforeAll(silentConsoleErrors);

  beforeEach(() => {
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render title", async () => {
    const { getByText } = render(VotingHistoryCard, {
      props,
    });

    expect(getByText(en.neuron_detail.voting_history)).toBeInTheDocument();
  });

  it("should render column titles", async () => {
    const { getByText } = render(VotingHistoryCard, {
      props,
    });

    expect(getByText(en.proposal_detail.title)).toBeInTheDocument();
    expect(getByText(en.neuron_detail.vote)).toBeInTheDocument();
  });

  it("should render ballots", async () => {
    const { container, getByText } = render(VotingHistoryCard, {
      props,
    });
    await waitFor(() =>
      expect(
        container.querySelectorAll("[data-tid='markdown-text']").length
      ).toEqual(2)
    );

    expect(
      getByText((mockProposals[0].proposal as Proposal).summary)
    ).toBeInTheDocument();

    expect(
      getByText((mockProposals[1].proposal as Proposal).summary)
    ).toBeInTheDocument();
  });

  it("should render skeleton texts", async () => {
    const { container } = render(VotingHistoryCard, {
      props,
    });

    expect(
      container.querySelectorAll('[data-tid="skeleton-paragraph"]').length
    ).toEqual(props.neuron.recentBallots.length * 5);
  });
});
