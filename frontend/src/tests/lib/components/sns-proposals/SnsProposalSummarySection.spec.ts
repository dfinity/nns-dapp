/**
 * @jest-environment jsdom
 */
import SnsProposalSummarySection from "$lib/components/sns-proposals/SnsProposalSummarySection.svelte";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ProposalProposerInfoSectionPo } from "$tests/page-objects/ProposalProposerInfoSection.page-object";
import type { SnsProposalData } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";

jest.mock("$lib/utils/html.utils", () => ({
  markdownToHTML: (value) => Promise.resolve(value),
}));

describe("SnsProposalSummarySection", () => {
  const renderComponent = (props) => {
    const { container } = render(SnsProposalSummarySection, {
      props,
    });

    return ProposalProposerInfoSectionPo.under(
      new JestPageObjectElement(container)
    );
  };
  describe("when proposal is defined", () => {
    const title = "title";
    const summary = "# Some Summary";
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
      const po = renderComponent(props);

      expect(await po.getProposalTitle()).toBe(title);
    });

    it("should contain summary", async () => {
      const po = renderComponent(props);

      await waitFor(async () =>
        expect(await po.getProposalSummary()).toContain(summary)
      );
    });

    it("should render url", async () => {
      const po = renderComponent(props);
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
      const po = renderComponent(props);
      expect(await po.hasContent()).toBe(false);
    });
  });
});
