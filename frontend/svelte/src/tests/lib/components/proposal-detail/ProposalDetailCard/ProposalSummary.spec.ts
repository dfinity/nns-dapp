/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import ProposalSummary from "../../../../../lib/components/proposal-detail/ProposalDetailCard/ProposalSummary.svelte";
import { mockProposalInfo } from "../../../../mocks/proposal.mock";

const en = require("../../../../../lib/i18n/en.json");

describe("ProposalSummary", () => {
  it("should render title", () => {
    const { getByText } = render(ProposalSummary, {
      props: {
        proposal: mockProposalInfo.proposal,
      },
    });
    expect(getByText(en.proposal_detail.summary)).toBeInTheDocument();
  });

  it("should render content", async () => {
    const { getByText, container } = render(ProposalSummary, {
      props: {
        proposal: mockProposalInfo.proposal,
      },
    });
    await tick();

    expect(getByText("summary-content")).toBeInTheDocument();
  });
});
