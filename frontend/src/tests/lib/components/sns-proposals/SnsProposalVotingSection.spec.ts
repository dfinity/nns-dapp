/**
 * @jest-environment jsdom
 */
import SnsProposalVotingSection from "$lib/components/sns-proposals/SnsProposalVotingSection.svelte";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import type { SnsProposalData } from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("SnsProposalVotingSection", () => {
  const proposal: SnsProposalData = {
    ...mockSnsProposal,
  };

  it("should render vote results", () => {
    const tally = fromDefinedNullable(mockSnsProposal.latest_tally);
    const { yes, total } = tally;
    const { getByRole } = render(SnsProposalVotingSection, {
      props: {
        proposal: {
          ...proposal,
        },
      },
    });

    const progressbar = getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressbar.getAttribute("aria-valuemax")).toBe(`${total}`);
    expect(progressbar.getAttribute("aria-valuenow")).toBe(`${yes}`);
  });
});
