import SnsProposalSummarySection from "$lib/components/sns-proposals/SnsProposalSummarySection.svelte";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { ProposalSummarySectionPo } from "$tests/page-objects/ProposalSummarySection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { SnsProposalData } from "@dfinity/sns";
import { expect } from "@playwright/test";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";

describe("SnsProposalSummarySection", () => {
  const renderComponent = async (props) => {
    const { container } = render(SnsProposalSummarySection, {
      props,
    });

    await runResolvedPromises();

    return ProposalSummarySectionPo.under(new JestPageObjectElement(container));
  };

  describe("when proposal is defined", () => {
    const title = "title";
    const summary = "Some Summary";
    const url = "https://nns.internetcomputer.org/";
    const proposal: SnsProposalData = {
      ...mockSnsProposal,
      proposal: [
        {
          title,
          url,
          summary,
          action: [{ Unspecified: {} }],
        },
      ],
    };
    const props = { proposal };

    it("should render title", async () => {
      const po = await renderComponent(props);

      expect(await po.getProposalTitle()).toBe(title);
    });

    it("should contain summary", async () => {
      const po = await renderComponent(props);

      // We use waitFor instead of runResolvedPromises because markdown is sometimes too slow for runResolvedPromises.
      await waitFor(async () => {
        expect(await po.getProposalSummary()).toContain(summary);
      });
    });

    it("should render url", async () => {
      const po = await renderComponent(props);
      expect(await po.getProposalUrlText()).toBe(url);
    });
  });

  describe("when proposal is not defined", () => {
    const proposal: SnsProposalData = {
      ...mockSnsProposal,
      proposal: [],
    };
    const props = { proposal };

    it("should not render content", async () => {
      const po = await renderComponent(props);
      expect(await po.isPresent()).toBe(false);
    });
  });
});
