import ConfirmFollowingBanner from "$lib/components/neuron-detail/ConfirmFollowingBanner.svelte";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { ConfirmFollowingBannerPo } from "$tests/page-objects/ConfirmFollowingBanner.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("ConfirmFollowingBanner", () => {
  const renderComponent = () => {
    const { container } = render(ConfirmFollowingBanner, {});

    return ConfirmFollowingBannerPo.under(new JestPageObjectElement(container));
  };

  it("should be hidden w/o voting economics", async () => {
    const po = renderComponent();

    expect(await po.isPresent()).toBe(false);
  });

  it("should be rendered with voting economics available", async () => {
    networkEconomicsStore.setParameters({
      parameters: mockNetworkEconomics,
      certified: true,
    });

    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);
  });
});
