/**
 * @jest-environment jsdom
 */
import ProposalProposerInfoSection from "$lib/components/proposal-detail/ProposalProposerInfoSection.svelte";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ProposalProposerInfoSectionPo } from "$tests/page-objects/ProposalProposerInfoSection.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

jest.mock("$lib/utils/html.utils", () => ({
  markdownToHTML: (value) => Promise.resolve(value),
}));

describe("ProposalProposerInfoSection", () => {
  const title = "title";
  const summary = "# Some Summary";
  const url = "https://nns.internetcomputer.org/";
  const props = { title, summary, url };

  const renderComponent = async () => {
    const { container } = render(ProposalProposerInfoSection, {
      props,
    });

    await runResolvedPromises();

    return ProposalProposerInfoSectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render title", async () => {
    const po = await renderComponent();

    expect(await po.getProposalTitle()).toBe(title);
  });

  it("should render summary", async () => {
    const po = await renderComponent();

    expect(await po.getProposalSummary()).toContain(summary);
  });

  it("should render url", async () => {
    const po = await renderComponent();

    expect(await po.getProposalUrlText()).toBe(url);
  });
});
