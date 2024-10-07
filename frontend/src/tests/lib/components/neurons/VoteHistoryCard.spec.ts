import * as agent from "$lib/api/agent.api";
import VotingHistoryCard from "$lib/components/neurons/VotingHistoryCard.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { MockGovernanceCanister } from "$tests/mocks/governance.canister.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { silentConsoleErrors } from "$tests/utils/utils.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import type { Proposal } from "@dfinity/nns";
import { GovernanceCanister, Vote } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

describe("VoteHistoryCard", () => {
  const props = {
    neuron: {
      ...mockNeuron,
      recentBallots: [
        {
          vote: Vote.Yes,
          proposalId: mockProposals[0].id,
        },
        {
          vote: Vote.No,
          proposalId: mockProposals[1].id,
        },
      ],
    },
  };

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  beforeEach(() => {
    silentConsoleErrors();

    vi.spyOn(GovernanceCanister, "create").mockImplementation(
      (): GovernanceCanister => mockGovernanceCanister
    );

    resetIdentity();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
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
    const { container } = render(VotingHistoryCard, {
      props,
    });
    await waitFor(() =>
      expect(
        container.querySelectorAll("[data-tid='proposal-summary-component'] p")
          .length
      ).toEqual(2)
    );

    const p = container.querySelectorAll(
      "[data-tid='proposal-summary-component'] p"
    );

    expect(p[0].textContent).toEqual(
      (mockProposals[0].proposal as Proposal).summary
    );

    expect(p[1].textContent).toEqual(
      (mockProposals[1].proposal as Proposal).summary
    );
  });

  it("should render skeleton texts", async () => {
    const { container } = render(VotingHistoryCard, {
      props,
    });

    expect(
      container.querySelectorAll('[data-tid="skeleton-text"]').length
    ).toEqual(props.neuron.recentBallots.length * 5);
  });
});
