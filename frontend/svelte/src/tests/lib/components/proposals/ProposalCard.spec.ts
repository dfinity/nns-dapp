/**
 * @jest-environment jsdom
 */

import {render, waitFor} from '@testing-library/svelte';
import ProposalCard from "../../../../lib/components/proposals/ProposalCard.svelte";
import { mockProposals } from "../../../mocks/proposals.store.mock";
import {proposalsFiltersStore} from '../../../../lib/stores/proposals.store';
import {Vote} from '@dfinity/nns';

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
          ballots: [Vote.YES]
        },
      },
    });

    proposalsFiltersStore.toggleExcludeVotedProposals();

    await waitFor(() =>
        expect(container.querySelector("article")).toBeNull()
    );
  });
});
