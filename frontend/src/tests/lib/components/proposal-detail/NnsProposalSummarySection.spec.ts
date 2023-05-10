import NnsProposalSummarySection from "$lib/components/proposal-detail/NnsProposalSummarySection.svelte";
import { mapProposalInfo } from "$lib/utils/proposals.utils";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

vi.mock("$lib/utils/html.utils", () => ({
  markdownToHTML: (value) => Promise.resolve(value),
}));

describe("NnsProposalSummarySection", () => {
  const { title, proposal, url } = mapProposalInfo(mockProposalInfo);

  it("should render title", () => {
    const renderResult = render(NnsProposalSummarySection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    const { getByText } = renderResult;
    expect(getByText(title as string)).toBeInTheDocument();
  });

  it("should render summary", async () => {
    const renderResult = render(NnsProposalSummarySection, {
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
    const renderResult = render(NnsProposalSummarySection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    const { getByText } = renderResult;
    await waitFor(() => expect(getByText(url as string)).toBeInTheDocument());
  });
});
