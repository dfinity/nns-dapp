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
    it("should not render the component if no proposalIdString", async () => {
      // TODO: is it ok to use "root" here?
      const { root } = renderComponent({
        proposalIdString: undefined,
        proposalIds: ["1"],
      });

      expect(await root.isPresent()).toBe(false);
    });

    it("should not render buttons if no proposalIds", async () => {
      const { root } = renderComponent({
        proposalIdString: "1",
        proposalIds: undefined,
      });

      expect(await root.isPresent()).toBe(false);
    });

    it("should not render buttons if no proposalIdString in proposalIds", async () => {
      const { root } = renderComponent({
        proposalIdString: "1",
        proposalIds: ["0"],
      });

      expect(await root.isPresent()).toBe(false);
    });
  });

  describe("display", () => {
    it("should render buttons", async () => {
      const { getPreviousButtonPo, getNextButtonPo } = renderComponent({
        proposalIdString: "1",
        proposalIds: ["0", "1", "2"],
      });

      expect(await getPreviousButtonPo().isPresent()).toBe(true);
      expect(await getNextButtonPo().isPresent()).toBe(true);
    });

    it("should display both buttons", async () => {
      const { isPreviousButtonHidden, isNextButtonHidden } = renderComponent({
        proposalIdString: "1",
        proposalIds: ["0", "1", "2"],
      });

      expect(await isNextButtonHidden()).toBe(false);
      expect(await isPreviousButtonHidden()).toBe(false);
    });

    it("should hide previous when it's selected", async () => {
      const { isPreviousButtonHidden, isNextButtonHidden } = renderComponent({
        proposalIdString: "1",
        proposalIds: ["1", "2"],
      });

      expect(await isNextButtonHidden()).toBe(false);
      expect(await isPreviousButtonHidden()).toBe(true);
    });

    it("should hide next when it's selected", async () => {
      const { isPreviousButtonHidden, isNextButtonHidden } = renderComponent({
        proposalIdString: "1",
        proposalIds: ["0", "1"],
      });

      expect(await isPreviousButtonHidden()).toBe(false);
      expect(await isNextButtonHidden()).toBe(true);
    });
  });

  describe("action", () => {
    it("should emmit next click", async () => {
      const { clickNextProposal, component } = renderComponent({
        proposalIdString: "1",
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
        proposalIdString: "1",
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
