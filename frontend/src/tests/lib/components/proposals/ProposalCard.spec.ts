/**
 * @jest-environment jsdom
 */

import type { Ballot, Proposal, ProposalInfo } from "@dfinity/nns";
import { GovernanceCanister, ProposalStatus, Topic, Vote } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import ProposalCard from "../../../../lib/components/proposals/ProposalCard.svelte";
import { DEFAULT_PROPOSALS_FILTERS } from "../../../../lib/constants/proposals.constants";
import { authStore } from "../../../../lib/stores/auth.store";
import { proposalsFiltersStore } from "../../../../lib/stores/proposals.store";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../../mocks/governance.canister.mock";
import en from "../../../mocks/i18n.mock";
import { mockProposals } from "../../../mocks/proposals.store.mock";

describe("ProposalCard", () => {
  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  beforeEach(() => {
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render a proposal title", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    const firstProposal = mockProposals[0] as ProposalInfo;
    expect(
      getByText((firstProposal.proposal as Proposal).title as string)
    ).toBeInTheDocument();
  });

  it("should render a proposal status", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(getByText(en.status.Open)).toBeInTheDocument();
  });

  it("should render a proposer", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(
      getByText(`${mockProposals[0].proposer}`, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a proposal id", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(
      getByText(`${mockProposals[0].id}`, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a proposal topic", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(
      getByText(`${en.topics[Topic[mockProposals[0].topic]]}`, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a proposal a type", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
        layout: "modern",
      },
    });

    expect(getByText(en.actions.RegisterKnownNeuron)).toBeInTheDocument();
  });

  it("should render accessible info without label", () => {
    const { container } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
        layout: "modern",
      },
    });

    expect(
      container.querySelector(`[aria-label="${en.proposal_detail.id_prefix}"]`)
    ).not.toBeNull();
    expect(
      container.querySelector(
        `[aria-label="${en.proposal_detail.type_prefix}"]`
      )
    ).not.toBeNull();
  });

  it("should render a specific color for the status", () => {
    proposalsFiltersStore.filterStatus([
      ...DEFAULT_PROPOSALS_FILTERS.status,
      ProposalStatus.Executed,
    ]);

    const { queryByTestId } = render(ProposalCard, {
      props: {
        proposalInfo: {
          ...mockProposals[1],
          status: ProposalStatus.Executed,
        },
      },
    });

    const tag = queryByTestId("tag");
    expect(tag).not.toBeNull();
    expect(tag?.classList.contains("success")).toBe(true);

    proposalsFiltersStore.filterStatus(DEFAULT_PROPOSALS_FILTERS.status);
  });

  it("should hide card if already voted", async () => {
    const { container } = render(ProposalCard, {
      props: {
        proposalInfo: {
          ...mockProposals[0],
          ballots: [
            {
              vote: Vote.Yes,
            } as Ballot,
          ],
        },
      },
    });

    proposalsFiltersStore.toggleExcludeVotedProposals();

    await waitFor(() => expect(container.querySelector("article")).toBeNull());
  });

  it("should open neuron modal", async () => {
    proposalsFiltersStore.reset();

    const { container } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[1],
      },
    });

    const button = container.querySelector("button.text");
    expect(button).not.toBeNull();
    button && (await fireEvent.click(button));

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
  });
});
