import SnsProposalsFilters from "$lib/components/sns-proposals/SnsProposalsFilters.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { SnsProposalFiltersPo } from "$tests/page-objects/SnsProposalFilters.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

describe("SnsProposalsFilters", () => {
  const renderComponent = async () => {
    const { container } = render(SnsProposalsFilters);
    await runResolvedPromises();
    return SnsProposalFiltersPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();
  });

  it("should render filter buttons", async () => {
    const po = await renderComponent();
    await po.getActionableProposalsSegmentPo().clickAllProposals();

    expect(await po.getFilterByTypesButton().isPresent()).toBe(true);
    expect(await po.getFilterByStatusButton().isPresent()).toBe(true);
  });

  it("should open filter modal when type filter is clicked", async () => {
    const po = await renderComponent();
    await po.getActionableProposalsSegmentPo().clickAllProposals();
    expect(await po.getFilterModalPo().isPresent()).toBe(false);

    await po.clickFiltersByTypesButton();
    await runResolvedPromises();
    expect(await po.getFilterModalPo().isPresent()).toBe(true);
  });

  it("should open filter modal when status filter is clicked", async () => {
    const po = await renderComponent();
    await po.getActionableProposalsSegmentPo().clickAllProposals();
    expect(await po.getFilterModalPo().isPresent()).toBe(false);

    await po.clickFiltersByStatusButton();
    await runResolvedPromises();
    expect(await po.getFilterModalPo().isPresent()).toBe(true);
  });

  describe("actionable proposals", () => {
    it("should render actionable proposals segment", async () => {
      const po = await renderComponent();

      expect(await po.getActionableProposalsSegmentPo().isPresent()).toEqual(
        true
      );
    });

    it('should "actionable" be preselected by default', async () => {
      const po = await renderComponent();
      expect(
        await po
          .getActionableProposalsSegmentPo()
          .isActionableProposalsSelected()
      ).toEqual(true);
    });

    it("should switch proposal lists on segment change", async () => {
      const po = await renderComponent();
      const segmentPo = po.getActionableProposalsSegmentPo();
      await segmentPo.clickAllProposals();

      expect(await segmentPo.isAllProposalsSelected()).toEqual(true);
      expect(await segmentPo.isActionableProposalsSelected()).toEqual(false);

      await segmentPo.clickActionableProposals();
      expect(await segmentPo.isAllProposalsSelected()).toEqual(false);
      expect(await segmentPo.isActionableProposalsSelected()).toEqual(true);

      await segmentPo.clickAllProposals();
      expect(await segmentPo.isAllProposalsSelected()).toEqual(true);
      expect(await segmentPo.isActionableProposalsSelected()).toEqual(false);
    });

    it("should hide and show proposal filters", async () => {
      const po = await renderComponent();
      const segmentPo = po.getActionableProposalsSegmentPo();

      await segmentPo.clickAllProposals();
      expect(await po.getFilterByTypesButton().isPresent()).toEqual(true);
      expect(await po.getFilterByStatusButton().isPresent()).toEqual(true);

      await segmentPo.clickActionableProposals();
      expect(await po.getFilterByTypesButton().isPresent()).toEqual(false);
      expect(await po.getFilterByStatusButton().isPresent()).toEqual(false);

      await segmentPo.clickAllProposals();
      expect(await po.getFilterByTypesButton().isPresent()).toEqual(true);
      expect(await po.getFilterByStatusButton().isPresent()).toEqual(true);
    });
  });

  describe("when signed out", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should not render actionable proposals segment", async () => {
      const po = await renderComponent();

      expect(await po.getActionableProposalsSegmentPo().isPresent()).toEqual(
        false
      );
    });

    it("should filters be shown", async () => {
      const po = await renderComponent();
      expect(await po.getFilterByTypesButton().isPresent()).toEqual(true);
      expect(await po.getFilterByStatusButton().isPresent()).toEqual(true);
    });
  });
});
