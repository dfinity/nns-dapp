import * as agent from "$lib/api/agent.api";
import Ballots from "$lib/components/neuron-detail/Ballots/Ballots.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { MockGovernanceCanister } from "$tests/mocks/governance.canister.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { silentConsoleErrors } from "$tests/utils/utils.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import type { BallotInfo } from "@dfinity/nns";
import { GovernanceCanister, Vote } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

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

    resetIdentity();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
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
