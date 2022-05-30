/**
 * @jest-environment jsdom
 */

import type { RenderResult } from "@testing-library/svelte";
import { render } from "@testing-library/svelte";
import ProposalDetailCard from "../../../../../lib/components/proposal-detail/ProposalDetailCard/ProposalDetailCard.svelte";
import { mockProposalInfo } from "../../../../mocks/proposal.mock";
import { silentConsoleErrors } from "../../../../mocks/utils.mock";

describe("ProposalDetailCard", () => {
  let renderResult: RenderResult;

  beforeAll(silentConsoleErrors);

  beforeEach(() => {
    renderResult = render(ProposalDetailCard, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });
  });

  it("should render title", () => {
    const { getByText } = renderResult;
    expect(getByText("title")).toBeInTheDocument();
  });

  it("should render status", () => {
    const { getByText } = renderResult;
    expect(getByText("Rejected")).toBeInTheDocument();
  });
});
