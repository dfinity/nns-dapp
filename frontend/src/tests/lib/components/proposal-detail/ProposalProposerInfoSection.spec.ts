/**
 * @jest-environment jsdom
 */
import ProposalProposerInfoSection from "$lib/components/proposal-detail/ProposalProposerInfoSection.svelte";
import { render, waitFor } from "@testing-library/svelte";

jest.mock("$lib/utils/html.utils", () => ({
  markdownToHTML: (value) => Promise.resolve(value),
}));

describe("ProposalProposerInfoSection", () => {
  const title = "title";
  const summary = "# Some Summary";
  const url = "https://nns.ic0.app/";
  const props = { title, summary, url };

  it("should render title", () => {
    const renderResult = render(ProposalProposerInfoSection, {
      props,
    });

    const { getByText } = renderResult;
    expect(getByText(title as string)).toBeInTheDocument();
  });

  it("should render summary", async () => {
    const renderResult = render(ProposalProposerInfoSection, {
      props,
    });

    const { getByText } = renderResult;
    await waitFor(() => expect(getByText(summary)).toBeInTheDocument());
  });

  it("should render url", async () => {
    const renderResult = render(ProposalProposerInfoSection, {
      props,
    });

    const { getByText } = renderResult;
    await waitFor(() => expect(getByText(url)).toBeInTheDocument());
  });
});
