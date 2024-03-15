import SnsProposalsFilters from "$lib/components/sns-proposals/SnsProposalsFilters.svelte";
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
});
