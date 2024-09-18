import SnsProposalPayloadSection from "$lib/components/sns-proposals/SnsProposalPayloadSection.svelte";
import en from "$tests/mocks/i18n.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { SnsProposalPayloadSectionPo } from "$tests/page-objects/SnsProposalPayloadSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { SnsProposalData } from "@dfinity/sns";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";

describe("SnsProposalPayloadSection", () => {
  const renderComponent = async (props) => {
    const { container } = render(SnsProposalPayloadSection, {
      props,
    });

    await runResolvedPromises();

    return SnsProposalPayloadSectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  describe("when payload is defined", () => {
    const payload = "Some Summary";
    const proposal: SnsProposalData = {
      ...mockSnsProposal,
      payload_text_rendering: [payload],
    };
    const props = { proposal };

    it("should render title", async () => {
      const po = await renderComponent(props);

      expect(await po.getCardTitle()).toBe(en.proposal_detail.payload);
    });

    it("should contain summary", async () => {
      const po = await renderComponent(props);

      // We use waitFor instead of runResolvedPromises because markdown is sometimes too slow for runResolvedPromises.
      await waitFor(async () => {
        expect(await (await po.getPayloadText()).trim()).toBe(payload);
      });
    });
  });

  describe("when payload is not defined", () => {
    const proposal: SnsProposalData = {
      ...mockSnsProposal,
      payload_text_rendering: [],
    };
    const props = { proposal };

    it("should not render content", async () => {
      const po = await renderComponent(props);
      expect(await po.isPresent()).toBe(false);
    });
  });
});
