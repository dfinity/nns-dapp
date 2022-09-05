/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import ProposalProposerInfoSection from "../../../../lib/components/proposal-detail/ProposalProposerInfoSection.svelte";
import { mapProposalInfo } from "../../../../lib/utils/proposals.utils";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

jest.mock("../../../../lib/utils/html.utils", () => ({
  markdownToSanitizedHTML: (value) => Promise.resolve(value),
}));

describe("ProposalProposerInfoSection", () => {
  const { title, proposal, url } = mapProposalInfo(mockProposalInfo);

  it("should render title", () => {
    const renderResult = render(ProposalProposerInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    const { getByText } = renderResult;
    expect(getByText(title as string)).toBeInTheDocument();
  });

  it("should render summary", async () => {
    const renderResult = render(ProposalProposerInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    const { getByText } = renderResult;
    await waitFor(() =>
      expect(getByText(proposal?.summary as string)).toBeInTheDocument()
    );
  });

  it("should render url", async () => {
    const renderResult = render(ProposalProposerInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    const { getByText } = renderResult;
    await waitFor(() => expect(getByText(url as string)).toBeInTheDocument());
  });
});
