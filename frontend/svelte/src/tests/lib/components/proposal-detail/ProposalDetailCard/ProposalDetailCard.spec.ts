/**
 * @jest-environment jsdom
 */

import { render, RenderResult } from "@testing-library/svelte";
import ProposalDetailCard from "../../../../../lib/components/proposal-detail/ProposalDetailCard/ProposalDetailCard.svelte";
import { mockProposalInfo } from "../../../../mocks/proposal.mock";

describe("ProposalDetailCard", () => {
  let renderResult: RenderResult;

  beforeEach(() => {
    renderResult = render(ProposalDetailCard, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });
  });

  it("should render title", () => {
    const { getByText, container } = renderResult;
    expect(getByText("title")).toBeInTheDocument();
  });

  it("should render status", () => {
    const { getByText } = renderResult;
    expect(getByText("Rejected")).toBeInTheDocument();
  });
});
