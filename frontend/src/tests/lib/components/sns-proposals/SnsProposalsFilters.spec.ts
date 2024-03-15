import SnsProposalsFilters from "$lib/components/sns-proposals/SnsProposalsFilters.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { proposalsFiltersStore } from "$lib/stores/proposals.store";
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

  it("should render filter buttons", async () => {
    const po = await renderComponent();

    expect(await po.getFilterByTypesButton().isPresent()).toBe(true);
    expect(await po.getFilterByRewardsButton().isPresent()).toBe(true);
    expect(await po.getFilterByStatusButton().isPresent()).toBe(true);
  });

  it("should open filter modal when type filter is clicked", async () => {
    const po = await renderComponent();
    expect(await po.getFilterModalPo().isPresent()).toBe(false);

    await po.clickFiltersByTypesButton();
    await runResolvedPromises();
    expect(await po.getFilterModalPo().isPresent()).toBe(true);
  });

  it("should open filter modal when status filter is clicked", async () => {
    const po = await renderComponent();
    expect(await po.getFilterModalPo().isPresent()).toBe(false);

    await po.clickFiltersByStatusButton();
    await runResolvedPromises();
    expect(await po.getFilterModalPo().isPresent()).toBe(true);
  });

  it("should open filter modal when rewards filter is clicked", async () => {
    const po = await renderComponent();
    expect(await po.getFilterModalPo().isPresent()).toBe(false);

    await po.clickFiltersByRewardsButton();
    await runResolvedPromises();
    expect(await po.getFilterModalPo().isPresent()).toBe(true);
  });

  describe("actionable proposals", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.reset();
      proposalsFiltersStore.reset();
    });

    describe("when feature flag true", () => {
      it("should render actionable proposals segment", async () => {
        const po = await renderComponent();

        expect(await po.getActionableProposalsSegmentPo().isPresent()).toEqual(
          true
        );
      });

      it('should "all" be preselected by default', async () => {
        const po = await renderComponent();
        expect(
          await po.getActionableProposalsSegmentPo().isAllProposalsSelected()
        ).toEqual(true);
      });

      it("should be clickable", async () => {
        const po = await renderComponent();
        const segmentPo = po.getActionableProposalsSegmentPo();
        await segmentPo.clickActionableProposals();
        expect(await segmentPo.isActionableProposalsSelected()).toEqual(true);

        await segmentPo.clickAllProposals();
        expect(await segmentPo.isAllProposalsSelected()).toEqual(true);
      });

      it("should hide and show proposal filters", async () => {
        const po = await renderComponent();
        const segmentPo = po.getActionableProposalsSegmentPo();

        expect(await po.getFilterByTypesButton().isPresent()).toEqual(true);
        expect(await po.getFilterByStatusButton().isPresent()).toEqual(true);
        expect(await po.getFilterByRewardsButton().isPresent()).toEqual(true);

        await segmentPo.clickActionableProposals();
        expect(await po.getFilterByTypesButton().isPresent()).toEqual(false);
        expect(await po.getFilterByStatusButton().isPresent()).toEqual(false);
        expect(await po.getFilterByRewardsButton().isPresent()).toEqual(false);

        await segmentPo.clickAllProposals();
        expect(await po.getFilterByTypesButton().isPresent()).toEqual(true);
        expect(await po.getFilterByStatusButton().isPresent()).toEqual(true);
        expect(await po.getFilterByRewardsButton().isPresent()).toEqual(true);
      });
    });
  });

  describe("when feature flag is false", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_VOTING_INDICATION", false);
    });

    it("should not render actionable proposals segment", async () => {
      const po = await renderComponent();
      expect(await po.getActionableProposalsSegmentPo().isPresent()).toEqual(
        false
      );
    });

    it("should render proposal filters", async () => {
      const po = await renderComponent();
      expect(await po.getFilterByTypesButton().isPresent()).toEqual(true);
      expect(await po.getFilterByStatusButton().isPresent()).toEqual(true);
      expect(await po.getFilterByRewardsButton().isPresent()).toEqual(true);
    });
  });
});
