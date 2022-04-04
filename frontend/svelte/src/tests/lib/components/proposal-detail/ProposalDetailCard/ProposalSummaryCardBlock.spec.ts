/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import ProposalSummaryCardBlock from "../../../../../lib/components/proposal-detail/ProposalDetailCard/ProposalSummaryCardBlock.svelte";
import en from "../../../../mocks/i18n.mock";
import { mockProposalInfo } from "../../../../mocks/proposal.mock";

describe("ProposalSummaryCardBlock", () => {
  it("should render title", () => {
    const { getByText } = render(ProposalSummaryCardBlock, {
      props: {
        proposal: mockProposalInfo.proposal,
      },
    });
    expect(getByText(en.proposal_detail.summary)).toBeInTheDocument();
  });

  it("should render content", async () => {
    const { getByText } = render(ProposalSummaryCardBlock, {
      props: {
        proposal: mockProposalInfo.proposal,
      },
    });
    await tick();

    expect(getByText("summary-content")).toBeInTheDocument();
  });
});
