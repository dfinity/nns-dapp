/**
 * @jest-environment jsdom
 */

import ProposalNavigation from "$lib/components/proposal-detail/ProposalNavigation.svelte";
import { ProposalNavigationPo } from "$tests/page-objects/ProposalNavigation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("ProposalNavigation", () => {
  const renderComponent = (props) => {
    const { container } = render(ProposalNavigation, { props });
    return ProposalNavigationPo.under(new JestPageObjectElement(container));
  };

  describe("not rendered", () => {
    it("should not render the component if no currentProposalId", async () => {
      const po = renderComponent({
        currentProposalId: undefined,
        proposalIds: [1n],
        selectProposal: jest.fn(),
      });

      expect(await po.isPresent()).toBe(false);
    });

    it("should not render buttons if no proposalIds", async () => {
      const po = renderComponent({
        currentProposalId: 1n,
        proposalIds: undefined,
        selectProposal: jest.fn(),
      });

      expect(await po.isPresent()).toBe(false);
    });

    it("should not render buttons if no currentProposalId in proposalIds", async () => {
      const po = renderComponent({
        currentProposalId: 1n,
        proposalIds: [0n],
        selectProposal: jest.fn(),
      });

      expect(await po.isPresent()).toBe(false);
    });
  });

  describe("display", () => {
    it("should render buttons", async () => {
      const po = renderComponent({
        currentProposalId: 1n,
        proposalIds: [0n, 1n, 2n],
        selectProposal: jest.fn(),
      });

      expect(await po.getPreviousButtonPo().isPresent()).toBe(true);
      expect(await po.getNextButtonPo().isPresent()).toBe(true);
    });

    it("should enable both buttons", async () => {
      const po = renderComponent({
        currentProposalId: 1n,
        proposalIds: [0n, 1n, 2n],
        selectProposal: jest.fn(),
      });

      expect(await po.getNextButtonPo().isDisabled()).toBe(false);
      expect(await po.getPreviousButtonPo().isDisabled()).toBe(false);
    });

    it("should disable previous button when it's selected", async () => {
      const po = renderComponent({
        currentProposalId: 1n,
        proposalIds: [1n, 2n],
        selectProposal: jest.fn(),
      });

      expect(await po.getNextButtonPo().isDisabled()).toBe(false);
      expect(await po.getPreviousButtonPo().isDisabled()).toBe(true);
    });

    it("should disable next when it's selected", async () => {
      const po = renderComponent({
        currentProposalId: 1n,
        proposalIds: [0n, 1n],
        selectProposal: jest.fn(),
      });

      expect(await po.getNextButtonPo().isDisabled()).toBe(true);
      expect(await po.getPreviousButtonPo().isDisabled()).toBe(false);
    });
  });

  describe("action", () => {
    it("should emmit next click", async () => {
      const selectProposalSpy = jest.fn();
      const po = renderComponent({
        currentProposalId: 1n,
        proposalIds: [0n, 1n, 2n],
        selectProposal: selectProposalSpy,
      });

      await po.clickNext();

      expect(selectProposalSpy).toHaveBeenCalledTimes(1);
      expect(selectProposalSpy).toHaveBeenCalledWith(2n);
    });

    it("should emmit previous click", async () => {
      const selectProposalSpy = jest.fn();
      const po = renderComponent({
        currentProposalId: 1n,
        proposalIds: [0n, 1n, 2n],
        selectProposal: selectProposalSpy,
      });

      await po.clickPrevious();

      expect(selectProposalSpy).toHaveBeenCalledTimes(1);
      expect(selectProposalSpy).toHaveBeenCalledWith(0n);
    });
  });
});
