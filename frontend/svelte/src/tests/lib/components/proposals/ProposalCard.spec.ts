/**
 * @jest-environment jsdom
 */

import {
  Ballot,
  GovernanceCanister,
  Proposal,
  ProposalInfo,
  Vote,
} from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import ProposalCard from "../../../../lib/components/proposals/ProposalCard.svelte";
import * as en from "../../../../lib/i18n/en.json";
import { authStore } from "../../../../lib/stores/auth.store";
import { proposalsFiltersStore } from "../../../../lib/stores/proposals.store";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../../mocks/governance.canister.mock";
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

    expect(getByText(en.status.PROPOSAL_STATUS_OPEN)).toBeInTheDocument();
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

  it("should render a specific color for the status", () => {
    const { container } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[1],
      },
    });

    expect(container.querySelector("div.success")).not.toBeNull();
  });

  it("should hide card if already voted", async () => {
    const { container } = render(ProposalCard, {
      props: {
        proposalInfo: {
          ...mockProposals[0],
          ballots: [
            {
              vote: Vote.YES,
            } as Ballot,
          ],
        },
      },
    });

    proposalsFiltersStore.toggleExcludeVotedProposals();

    await waitFor(() => expect(container.querySelector("article")).toBeNull());
  });

  it("should open neuron modal", async () => {
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
