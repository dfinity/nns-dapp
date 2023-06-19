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
        proposalIds: [2n, 1n, 0n],
        selectProposal: jest.fn(),
      });

      expect(await po.getNewerButtonPo().isPresent()).toBe(true);
      expect(await po.getOlderButtonPo().isPresent()).toBe(true);
    });

    it("should enable both buttons", async () => {
      const po = renderComponent({
        currentProposalId: 1n,
        proposalIds: [2n, 1n, 0n],
        selectProposal: jest.fn(),
      });

      expect(await po.isOlderButtonHidden()).toBe(false);
      expect(await po.isNewerButtonHidden()).toBe(false);
    });

    it("should be visible even when the current proposal is not in the list", async () => {
      const po = renderComponent({
        currentProposalId: 10n,
        proposalIds: [20n, 0n],
        selectProposal: jest.fn(),
      });

      expect(await po.isOlderButtonHidden()).toBe(false);
      expect(await po.isNewerButtonHidden()).toBe(false);
    });

    it("should disable previous button when it's selected", async () => {
      const po = renderComponent({
        currentProposalId: 1n,
        proposalIds: [1n, 0n],
        selectProposal: jest.fn(),
      });

      expect(await po.isOlderButtonHidden()).toBe(false);
      expect(await po.isNewerButtonHidden()).toBe(true);
    });

    it("should disable next when it's selected", async () => {
      const po = renderComponent({
        currentProposalId: 1n,
        proposalIds: [2n, 1n],
        selectProposal: jest.fn(),
      });

      expect(await po.isOlderButtonHidden()).toBe(true);
      expect(await po.isNewerButtonHidden()).toBe(false);
    });
  });

  it("should emmit next click", async () => {
    const selectProposalSpy = jest.fn();
    const po = renderComponent({
      currentProposalId: 2n,
      proposalIds: [4n, 3n, 2n, 1n, 0n],
      selectProposal: selectProposalSpy,
    });

    await po.clickOlder();

    expect(selectProposalSpy).toHaveBeenCalledTimes(1);
    expect(selectProposalSpy).toHaveBeenCalledWith(1n);
  });

  it("should emmit previous click", async () => {
    const selectProposalSpy = jest.fn();
    const po = renderComponent({
      currentProposalId: 2n,
      proposalIds: [4n, 3n, 2n, 1n, 0n],
      selectProposal: selectProposalSpy,
    });

    await po.clickNewer();

    expect(selectProposalSpy).toHaveBeenCalledTimes(1);
    expect(selectProposalSpy).toHaveBeenCalledWith(3n);
  });

  it("should emit with right arguments for non-consecutive ids", async () => {
    const selectProposalSpy = jest.fn();
    const po = renderComponent({
      currentProposalId: 13n,
      proposalIds: [99n, 17n, 13n, 4n, 2n, 1n, 0n],
      selectProposal: selectProposalSpy,
    });

    await po.clickNewer();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(17n);
    await po.clickOlder();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(4n);
  });

  it("should emit with right arguments even when the current id is not in the list", async () => {
    const selectProposalSpy = jest.fn();
    const po = renderComponent({
      currentProposalId: 9n,
      proposalIds: [99n, 17n, 13n, 4n, 2n, 1n, 0n],
      selectProposal: selectProposalSpy,
    });

    await po.clickNewer();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(13n);
    await po.clickOlder();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(4n);
  });
});
