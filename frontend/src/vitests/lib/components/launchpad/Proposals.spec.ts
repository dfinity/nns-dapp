import * as api from "$lib/api/proposals.api";
import Proposals from "$lib/components/launchpad/Proposals.svelte";
import { snsProposalsStore } from "$lib/stores/sns.store";
import en from "$tests/mocks/i18n.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { AnonymousIdentity } from "@dfinity/agent";
import { ProposalStatus, Topic, type ProposalInfo } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";

describe("Proposals", () => {
  const mockProposals = (proposals: ProposalInfo[] | null) =>
    proposals === null
      ? snsProposalsStore.reset()
      : snsProposalsStore.setProposals({ proposals, certified: true });

  const queryProposalsSpy = vitest
    .spyOn(api, "queryProposals")
    .mockResolvedValue([mockProposalInfo]);

  beforeEach(() => {
    vitest.clearAllMocks();
    snsProposalsStore.reset();
  });

  it("should trigger call to query proposals", () => {
    render(Proposals);

    expect(queryProposalsSpy).toBeCalledWith({
      beforeProposal: undefined,
      certified: false,
      identity: new AnonymousIdentity(),
      filters: {
        topics: [Topic.SnsAndCommunityFund],
        rewards: [],
        status: [ProposalStatus.Open],
        excludeVotedProposals: false,
        lastAppliedFilter: undefined,
      },
    });
  });

  it("should not trigger call to query proposals if already loaded", () => {
    snsProposalsStore.setProposals({
      proposals: [],
      certified: true,
    });

    render(Proposals);

    expect(queryProposalsSpy).not.toBeCalled();
  });

  it("should display skeletons", async () => {
    mockProposals(null);

    const { container } = render(Proposals);

    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="skeleton-card"]')
      ).toBeInTheDocument()
    );
  });

  it("should display proposal cards", async () => {
    mockProposals([{ ...mockProposalInfo, status: ProposalStatus.Open }]);

    const { queryAllByTestId } = render(Proposals);

    await waitFor(() =>
      expect(queryAllByTestId("proposal-card").length).toBeGreaterThan(0)
    );
  });

  it("should hide skeletons", async () => {
    mockProposals([{ ...mockProposalInfo, status: ProposalStatus.Open }]);

    const { container } = render(Proposals);

    await waitFor(() =>
      expect(
        container.querySelectorAll('[data-tid="proposal-card"]').length
      ).toBeGreaterThan(0)
    );

    expect(container.querySelector('[data-tid="skeleton-card"]')).toBeNull();
  });

  it("should display no_message", async () => {
    mockProposals([]);

    const { queryByText } = render(Proposals);

    await waitFor(() =>
      expect(queryByText(en.sns_launchpad.no_proposals)).toBeInTheDocument()
    );
  });
});
