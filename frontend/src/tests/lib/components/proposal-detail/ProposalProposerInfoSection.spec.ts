/**
 * @jest-environment jsdom
 */
import ProposalProposerInfoSection from "$lib/components/proposal-detail/ProposalProposerInfoSection.svelte";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ProposalProposerInfoSectionPo } from "$tests/page-objects/ProposalProposerInfoSection.page-object";
import { render, waitFor } from "@testing-library/svelte";

jest.mock("$lib/utils/html.utils", () => ({
  markdownToHTML: (value) => Promise.resolve(value),
}));

describe("ProposalProposerInfoSection", () => {
  const title = "title";
  const summary = "# Some Summary";
  const url = "https://nns.internetcomputer.org/";
  const props = { title, summary, url };

  it("should render title", async () => {
    const { container } = render(ProposalProposerInfoSection, {
      props,
    });

    const po = ProposalProposerInfoSectionPo.under(
      new JestPageObjectElement(container)
    );
    expect(await po.getProposalTitle()).toBe(title);
  });

  it("should render summary", async () => {
    const renderResult = render(ProposalProposerInfoSection, {
      props,
    });

    const { getByText } = renderResult;
    await waitFor(() => expect(getByText(summary)).toBeInTheDocument());
  });

  it("should render url", async () => {
    const { container } = render(ProposalProposerInfoSection, {
      props,
    });

    const po = ProposalProposerInfoSectionPo.under(
      new JestPageObjectElement(container)
    );
    expect(await po.getProposalUrlText()).toBe(url);
  });
});
