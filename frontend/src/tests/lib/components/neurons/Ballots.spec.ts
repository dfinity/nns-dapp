import Ballots from "$lib/components/neuron-detail/Ballots/Ballots.svelte";
import { authStore } from "$lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { MockGovernanceCanister } from "$tests/mocks/governance.canister.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { silentConsoleErrors } from "$tests/utils/utils.test-utils";
import type { BallotInfo } from "@dfinity/nns";
import { GovernanceCanister, Vote } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";

describe("Ballots", () => {
  const mockBallot: BallotInfo = {
    vote: Vote.Yes,
    proposalId: mockProposals[0].id,
  };

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  beforeEach(() => {
    silentConsoleErrors();
    vi.spyOn(GovernanceCanister, "create").mockImplementation(
      (): GovernanceCanister => mockGovernanceCanister
    );

    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render multiple ballots", async () => {
    const neuron = {
      ...mockNeuron,
      recentBallots: [mockBallot, mockBallot],
    };
    const { container } = render(Ballots, {
      props: {
        neuron,
      },
    });

    await waitFor(() =>
      expect(
        container.querySelector("[data-tid='markdown-text']")
      ).not.toBeNull()
    );
    expect(container.querySelectorAll("li").length).toBe(2);
    expect(container.querySelectorAll(".summary").length).toBe(2);
  });

  it("should render no ballots message", async () => {
    const neuron = {
      ...mockNeuron,
      recentBallots: [],
    };
    const { getByText } = render(Ballots, {
      props: {
        neuron,
      },
    });

    expect(getByText(en.neuron_detail.no_ballots)).toBeInTheDocument();
  });
});
