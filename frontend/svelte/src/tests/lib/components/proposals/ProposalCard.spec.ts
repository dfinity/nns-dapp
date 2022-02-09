/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ProposalCard from "../../../../lib/components/proposals/ProposalCard.svelte";
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
});
