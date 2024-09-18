import ProposalSummarySection from "$lib/components/proposal-detail/ProposalSummarySection.svelte";
import { ProposalSummarySectionPo } from "$tests/page-objects/ProposalSummarySection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { expect } from "@playwright/test";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";

describe("ProposalSummarySection", () => {
  const title = "title";
  const summary = "Some Summary";
  const url = "https://nns.internetcomputer.org/";
  const props = { title, summary, url };

  const renderComponent = async () => {
    const { container } = render(ProposalSummarySection, {
      props,
    });

    await runResolvedPromises();

    return ProposalSummarySectionPo.under(new JestPageObjectElement(container));
  };

  it("should render title", async () => {
    const po = await renderComponent();

    expect(await po.getProposalTitle()).toBe(title);
  });

  it("should render summary", async () => {
    const po = await renderComponent();

    // We use waitFor instead of runResolvedPromises because markdown is sometimes too slow for runResolvedPromises.
    await waitFor(async () => {
      expect(await po.getProposalSummary()).toContain(summary);
    });
  });

  it("should render url", async () => {
    const po = await renderComponent();

    expect(await po.getProposalUrlText()).toBe(url);
  });
});
