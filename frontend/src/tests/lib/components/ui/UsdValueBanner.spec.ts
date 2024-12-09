import UsdValueBanner from "$lib/components/ui/UsdValueBanner.svelte";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { UsdValueBannerPo } from "$tests/page-objects/UsdValueBanner.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("UsdValueBanner", () => {
  const renderComponent = (usdAmount: number) => {
    const { container } = render(UsdValueBanner, { usdAmount });
    return UsdValueBannerPo.under(new JestPageObjectElement(container));
  };

  const setIcpPrice = (icpPrice: number) => {
    icpSwapTickersStore.set([
      {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
        last_price: String(icpPrice),
      },
    ]);
  };

  it("should display the USD amount", async () => {
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent(usdAmount);

    expect(await po.getPrimaryAmount()).toEqual("$50.00");
  });

  it("should display the USD amount as absent", async () => {
    const usdAmount = undefined;
    const po = renderComponent(usdAmount);

    expect(await po.getPrimaryAmount()).toEqual("$-/-");
  });

  it("should display the ICP amount", async () => {
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent(usdAmount);

    expect(await po.getSecondaryAmount()).toEqual("5.00 ICP");
  });

  it("should display the ICP amount as absent without exchange rates", async () => {
    const usdAmount = 50;
    const po = renderComponent(usdAmount);

    expect(await po.getSecondaryAmount()).toEqual("-/- ICP");
  });

  it("should display the ICP price", async () => {
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent(usdAmount);

    expect(await po.getIcpPrice()).toEqual("10.00");
  });

  it("should display the ICP price as absent without exchange rates", async () => {
    const usdAmount = 50;
    const po = renderComponent(usdAmount);

    expect(await po.getIcpPrice()).toEqual("-/-");
  });

  it("should display the ICP price in the tooltip", async () => {
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent(usdAmount);

    expect(await po.getTooltipIconPo().getTooltipText()).toEqual(
      "1 ICP = $10.00 Token prices are in ckUSDC based on data provided by ICPSwap."
    );
  });

  it("should not have an error by default", async () => {
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent(usdAmount);

    expect(await po.hasError()).toBe(false);
  });

  it("should have an error without ICP price", async () => {
    const usdAmount = 50;
    const icpPrice = 0;

    setIcpPrice(icpPrice);

    const po = renderComponent(usdAmount);

    expect(await po.hasError()).toBe(true);
    expect(await po.getTooltipIconPo().getTooltipText()).toEqual(
      "ICPSwap API is currently unavailable, token prices cannot be fetched at the moment."
    );
  });
});
