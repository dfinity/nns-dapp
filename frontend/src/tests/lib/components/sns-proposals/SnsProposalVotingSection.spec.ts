/**
 * @jest-environment jsdom
 */
import SnsProposalVotingSection from "$lib/components/sns-proposals/SnsProposalVotingSection.svelte";
import en from "$tests/mocks/i18n.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import type { SnsProposalData } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsProposalsList", () => {
  const proposal: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(1) }],
  };

  it("should render vote results", () => {
    const { queryByText } = render(SnsProposalVotingSection, {
      props: {
        proposal: {
          ...proposal,
        },
      },
    });

    expect(queryByText(en.proposal_detail.voting_results)).toBeInTheDocument();
  });
});
