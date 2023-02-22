/**
 * @jest-environment jsdom
 */

import NnsProposalProposerInfoSection from "$lib/components/proposal-detail/NnsProposalProposerInfoSection.svelte";
import { mapProposalInfo } from "$lib/utils/proposals.utils";
import { render, waitFor } from "@testing-library/svelte";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

jest.mock("$lib/utils/html.utils", () => ({
  markdownToHTML: (value) => Promise.resolve(value),
}));

describe("NnsProposalProposerInfoSection", () => {
  const { title, proposal, url } = mapProposalInfo(mockProposalInfo);

  it("should render title", () => {
    const renderResult = render(NnsProposalProposerInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    const { getByText } = renderResult;
    expect(getByText(title as string)).toBeInTheDocument();
  });

  it("should render summary", async () => {
    const renderResult = render(NnsProposalProposerInfoSection, {
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
    const renderResult = render(NnsProposalProposerInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    const { getByText } = renderResult;
    await waitFor(() => expect(getByText(url as string)).toBeInTheDocument());
  });
});
