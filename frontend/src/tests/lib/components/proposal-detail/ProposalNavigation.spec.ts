/**
 * @jest-environment jsdom
 */

import ProposalNavigation from "$lib/components/proposal-detail/ProposalNavigation.svelte";
import { ProposalNavigationPo } from "$tests/page-objects/ProposalNavigation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("ProposalNavigation", () => {
  const renderComponent = (props) => {
    const { container, component } = render(ProposalNavigation, { props });
    const po = ProposalNavigationPo.under(new JestPageObjectElement(container));
    return { ...po, component };
  };

  describe("not rendered", () => {
    it("should not render the component if no currentProposalId", async () => {
      // TODO: is it ok to use "root" here?
      const { root } = renderComponent({
        currentProposalId: undefined,
        proposalIds: ["1"],
      });

      expect(await root.isPresent()).toBe(false);
    });

    it("should not render buttons if no proposalIds", async () => {
      const { root } = renderComponent({
        currentProposalId: "1",
        proposalIds: undefined,
      });

      expect(await root.isPresent()).toBe(false);
    });

    it("should not render buttons if no currentProposalId in proposalIds", async () => {
      const { root } = renderComponent({
        currentProposalId: "1",
        proposalIds: ["0"],
      });

      expect(await root.isPresent()).toBe(false);
    });
  });

  describe("display", () => {
    it("should render buttons", async () => {
      const { getPreviousButtonPo, getNextButtonPo } = renderComponent({
        currentProposalId: "1",
        proposalIds: ["0", "1", "2"],
      });

      expect(await getPreviousButtonPo().isPresent()).toBe(true);
      expect(await getNextButtonPo().isPresent()).toBe(true);
    });

    it("should enable both buttons", async () => {
      const { getPreviousButtonPo, getNextButtonPo } = renderComponent({
        currentProposalId: "1",
        proposalIds: ["0", "1", "2"],
      });

      expect(await getNextButtonPo().isDisabled()).toBe(false);
      expect(await getPreviousButtonPo().isDisabled()).toBe(false);
    });

    it("should disable previous button when it's selected", async () => {
      const { getPreviousButtonPo, getNextButtonPo } = renderComponent({
        currentProposalId: "1",
        proposalIds: ["1", "2"],
      });

      expect(await getNextButtonPo().isDisabled()).toBe(false);
      expect(await getPreviousButtonPo().isDisabled()).toBe(true);
    });

    it("should disable next when it's selected", async () => {
      const { getPreviousButtonPo, getNextButtonPo } = renderComponent({
        currentProposalId: "1",
        proposalIds: ["0", "1"],
      });

      expect(await getNextButtonPo().isDisabled()).toBe(true);
      expect(await getPreviousButtonPo().isDisabled()).toBe(true);
    });
  });

  describe("action", () => {
    it("should emmit next click", async () => {
      const { clickNextProposal, component } = renderComponent({
        currentProposalId: "1",
        proposalIds: ["0", "1", "2"],
      });
      const nnsNavigationSpy = jest.fn();
      component.$on("nnsNavigation", nnsNavigationSpy);

      await clickNextProposal();

      expect(nnsNavigationSpy).toHaveBeenCalledTimes(1);
      expect(nnsNavigationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: "2",
        })
      );
    });

    it("should emmit previous click", async () => {
      const { clickPreviousProposal, component } = renderComponent({
        currentProposalId: "1",
        proposalIds: ["0", "1", "2"],
      });
      const nnsNavigationSpy = jest.fn();
      component.$on("nnsNavigation", nnsNavigationSpy);

      await clickPreviousProposal();

      expect(nnsNavigationSpy).toHaveBeenCalledTimes(1);
      expect(nnsNavigationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: "0",
        })
      );
    });
  });
});
