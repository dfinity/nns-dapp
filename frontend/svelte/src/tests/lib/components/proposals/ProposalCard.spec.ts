/**
 * @jest-environment jsdom
 */

import { Ballot, Vote } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import ProposalCard from "../../../../lib/components/proposals/ProposalCard.svelte";
import { proposalsFiltersStore } from "../../../../lib/stores/proposals.store";
import { mockProposals } from "../../../mocks/proposals.store.mock";

const en = require("../../../../lib/i18n/en.json");

describe("ProposalCard", () => {
  it("should render a proposal title", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(getByText(mockProposals[0].proposal.title)).toBeInTheDocument();
  });

  it("should render a proposal status", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(getByText(en.status.PROPOSAL_STATUS_OPEN)).toBeInTheDocument();
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
});
